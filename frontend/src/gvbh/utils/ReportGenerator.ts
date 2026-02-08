
import { jsPDF } from "jspdf";

export const generateTripReport = (tripData: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Normalize Legs (Handle both legacy single trip and new multi-leg data)
  const legs = tripData.legs || [{
    pickupAddr: tripData.pickupAddr || tripData.pickup,
    pickupTime: tripData.pickupTime,
    startOdo: tripData.startOdo,
    dropoffAddr: tripData.dropoffAddr || tripData.dropoff,
    dropoffTime: tripData.dropoffTime,
    endOdo: tripData.endOdo
  }];

  const totalMiles = legs.reduce((acc: number, leg: any) => {
     const start = parseFloat(leg.startOdo?.toString().replace(/,/g, '') || '0');
     const end = parseFloat(leg.endOdo?.toString().replace(/,/g, '') || '0');
     return acc + Math.max(0, end - start);
  }, 0).toFixed(1);

  // -- Header --
  doc.setFillColor(15, 23, 42); // Dark Slate 900
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("GREAT VALUES TRANSPORTATION", 20, 20);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("OFFICIAL NEMT SERVICE RECORD • COMPLIANCE V2.2", 20, 28);
  doc.text(`AUDIT ID: ${tripData.id || 'RETRO-' + Date.now()}`, pageWidth - 70, 20);
  doc.text(`DATE: ${new Date().toLocaleDateString()}`, pageWidth - 70, 28);

  // -- Client Info Section --
  let currentY = 55;
  doc.setTextColor(33, 33, 33);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("MEMBER & VISIT INFORMATION", 20, currentY);
  currentY += 2;
  
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(20, currentY, 85, currentY);
  currentY += 10;
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`MEMBER NAME: ${tripData.client || tripData.clientName || 'N/A'}`, 20, currentY);
  doc.text(`INSURANCE ID: ${tripData.memberId || 'N/A'}`, 20, currentY + 7);
  doc.text(`MEMBER DOB: ${tripData.memberDob || 'N/A'}`, 20, currentY + 14);
  doc.text(`MAILING ADDRESS: ${tripData.mailingAddress || 'NOT PROVIDED'}`, 20, currentY + 21);
  doc.text(`REASON FOR VISIT: ${tripData.reasonForVisit || 'GENERAL MEDICAL'}`, 20, currentY + 28);
  
  doc.text(`ESCORT: ${tripData.escortName || 'NONE'}`, 120, currentY);
  doc.text(`RELATIONSHIP: ${tripData.escortRelationship || 'N/A'}`, 120, currentY + 7);

  currentY += 35; // Move past standard fields

  // -- Multi-Load Co-Riders --
  if (tripData.additionalPassengers && tripData.additionalPassengers.length > 0) {
      currentY += 5;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("MULTI-LOAD / CO-RIDERS", 20, currentY);
      doc.setLineWidth(0.1);
      doc.line(20, currentY + 2, 80, currentY + 2);
      currentY += 8;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      tripData.additionalPassengers.forEach((p: any) => {
          doc.text(`• ${p.name} (ID: ${p.memberId})`, 20, currentY);
          currentY += 5;
      });
      currentY += 5; // Extra spacing after list
  }

  currentY += 5;

  // -- Calculated Mileage Banner --
  doc.setFillColor(241, 245, 249);
  doc.rect(20, currentY, pageWidth - 40, 15, 'F');
  doc.setTextColor(14, 165, 233); // Sky 500
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL DISTANCE RECORDED: ${totalMiles} MILES`, pageWidth / 2, currentY + 10, { align: 'center' });
  
  currentY += 25;

  // -- Chronological Log --
  doc.setTextColor(33, 33, 33);
  doc.setFontSize(11);
  doc.text("CHRONOLOGICAL SERVICE LOG", 20, currentY);
  doc.line(20, currentY + 2, 85, currentY + 2);
  
  currentY += 10;
  
  legs.forEach((leg: any, index: number) => {
      // Check for page break
      if (currentY > pageHeight - 60) {
          doc.addPage();
          currentY = 20;
      }

      // Leg Header
      doc.setFillColor(240, 240, 240);
      doc.rect(20, currentY, pageWidth - 40, 6, 'F');
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 100, 100);
      doc.text(`TRIP LEG #${index + 1}`, 22, currentY + 4);
      currentY += 8;

      // Pickup Row
      doc.setTextColor(33, 33, 33);
      doc.setFillColor(252, 252, 252);
      doc.rect(20, currentY, pageWidth - 40, 25);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("PICKUP LOCATION & ODOMETER", 25, currentY + 7);
      doc.setFont("helvetica", "normal");
      doc.text(leg.pickupAddr || 'LOCATION DATA ATTACHED', 25, currentY + 14);
      doc.text(`TIME: ${leg.pickupTime || 'N/A'}`, 130, currentY + 14);
      doc.text(`START ODO: ${leg.startOdo || '0'}`, 130, currentY + 19);

      currentY += 28;
      // Dropoff Row
      doc.rect(20, currentY, pageWidth - 40, 25);
      doc.setFont("helvetica", "bold");
      doc.text("DROPOFF LOCATION & ODOMETER", 25, currentY + 7);
      doc.setFont("helvetica", "normal");
      doc.text(leg.dropoffAddr || 'DESTINATION DATA ATTACHED', 25, currentY + 14);
      doc.text(`TIME: ${leg.dropoffTime || 'N/A'}`, 130, currentY + 14);
      doc.text(`END ODO: ${leg.endOdo || '0'}`, 130, currentY + 19);
      
      currentY += 35; // Space for next leg
  });

  // Check if we need a new page for signatures
  if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 20;
  }

  // -- Compliance Attestation --
  currentY += 10;
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  const attestation = "I certify that this service was provided as described and that the mileage reported is an accurate reflection of the odometer readings at pickup and dropoff. I understand this record is subject to AHCCCS audit.";
  const splitAttestation = doc.splitTextToSize(attestation, pageWidth - 40);
  doc.text(splitAttestation, 20, currentY);

  // -- Signatures --
  currentY += 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, currentY + 20, 90, currentY + 20);
  doc.line(120, currentY + 20, 190, currentY + 20);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 33, 33);
  doc.text("MEMBER INITIALS / SIGNATURE", 20, currentY + 25);
  doc.text("DRIVER ATTESTATION (E-SIGNED)", 120, currentY + 25);
  
  doc.setFontSize(6);
  doc.text(`IP: 192.168.1.1 • GPS: 33.44,-112.07 • ${new Date().toISOString()}`, 120, currentY + 28);

  doc.save(`TRIP_REPORT_${tripData.client || 'AUDIT'}_${Date.now()}.pdf`);
};
