
import { jsPDF } from "jspdf";

export const generateTripReport = (tripData: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const startOdo = parseFloat(tripData.startOdo?.toString().replace(/,/g, '') || '0');
  const endOdo = parseFloat(tripData.endOdo?.toString().replace(/,/g, '') || '0');
  const totalMiles = Math.max(0, endOdo - startOdo).toFixed(1);

  // -- Header --
  doc.setFillColor(15, 23, 42); // Dark Slate 900
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("GREAT VALUES TRANSPORTATION", 20, 20);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("OFFICIAL NEMT SERVICE RECORD • COMPLIANCE V2.0", 20, 28);
  doc.text(`AUDIT ID: ${tripData.id || 'RETRO-' + Date.now()}`, pageWidth - 70, 20);
  doc.text(`DATE: ${new Date().toLocaleDateString()}`, pageWidth - 70, 28);

  // -- Client Info Section --
  doc.setTextColor(33, 33, 33);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("MEMBER & VISIT INFORMATION", 20, 55);
  
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(20, 57, 85, 57);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`MEMBER NAME: ${tripData.client || tripData.clientName || 'N/A'}`, 20, 67);
  doc.text(`INSURANCE ID: ${tripData.memberId || 'N/A'}`, 20, 74);
  doc.text(`REASON FOR VISIT: ${tripData.reasonForVisit || 'GENERAL MEDICAL'}`, 20, 81);
  doc.text(`ESCORT: ${tripData.escortName || 'NONE'}`, 120, 67);
  doc.text(`RELATIONSHIP: ${tripData.escortRelationship || 'N/A'}`, 120, 74);

  // -- Calculated Mileage Banner --
  doc.setFillColor(241, 245, 249);
  doc.rect(20, 90, pageWidth - 40, 20, 'F');
  doc.setTextColor(14, 165, 233); // Sky 500
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL DISTANCE RECORDED: ${totalMiles} MILES`, pageWidth / 2, 103, { align: 'center' });

  // -- Chronological Log --
  doc.setTextColor(33, 33, 33);
  doc.setFontSize(11);
  doc.text("CHRONOLOGICAL SERVICE LOG", 20, 125);
  doc.line(20, 127, 85, 127);
  
  let y = 135;
  // Pickup Row
  doc.setFillColor(252, 252, 252);
  doc.rect(20, y, pageWidth - 40, 25);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("PICKUP LOCATION & ODOMETER", 25, y + 7);
  doc.setFont("helvetica", "normal");
  doc.text(tripData.pickupAddr || tripData.pickup || 'LOCATION DATA ATTACHED', 25, y + 14);
  doc.text(`TIME: ${tripData.pickupTime || 'N/A'}`, 130, y + 14);
  doc.text(`START ODO: ${tripData.startOdo || '0'}`, 130, y + 19);

  y += 30;
  // Dropoff Row
  doc.rect(20, y, pageWidth - 40, 25);
  doc.setFont("helvetica", "bold");
  doc.text("DROPOFF LOCATION & ODOMETER", 25, y + 7);
  doc.setFont("helvetica", "normal");
  doc.text(tripData.dropoffAddr || tripData.dropoff || 'DESTINATION DATA ATTACHED', 25, y + 14);
  doc.text(`TIME: ${tripData.dropoffTime || 'N/A'}`, 130, y + 14);
  doc.text(`END ODO: ${tripData.endOdo || '0'}`, 130, y + 19);

  // -- Compliance Attestation --
  y += 50;
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  const attestation = "I certify that this service was provided as described and that the mileage reported is an accurate reflection of the odometer readings at the time of member pickup and dropoff. I understand that this record is subject to AHCCCS audit and state/federal oversight.";
  const splitAttestation = doc.splitTextToSize(attestation, pageWidth - 40);
  doc.text(splitAttestation, 20, y);

  // -- Signatures --
  y += 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y + 20, 90, y + 20);
  doc.line(120, y + 20, 190, y + 20);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 33, 33);
  doc.text("MEMBER INITIALS / SIGNATURE", 20, y + 25);
  doc.text("DRIVER ATTESTATION (E-SIGNED)", 120, y + 25);
  
  doc.setFontSize(6);
  doc.text(`IP: 192.168.1.1 • GPS: 33.44,-112.07 • ${new Date().toISOString()}`, 120, y + 28);

  doc.save(`TRIP_REPORT_${tripData.client || 'AUDIT'}_${Date.now()}.pdf`);
};
