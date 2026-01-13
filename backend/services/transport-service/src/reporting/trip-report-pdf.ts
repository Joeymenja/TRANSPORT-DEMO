/**
 * AHCCCS Trip Report - PDF Generation (Exact Field Mapping)
 * Fills the official AHCCCS form with trip data using pdf-lib and PRECISE Bottom-Left coordinates
 */

import { AHCCCSTripReport, TripLeg, VehicleType } from './trip-report-models';
import { PDFDocument, StandardFonts, rgb, PDFFont } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import { AHCCCS_FIELD_MAPPING } from './ahcccs-coordinates';

// ============================================================================
// PDF GENERATOR CLASS
// ============================================================================

export class PDFGenerator {

  static async generatePDF(
    report: AHCCCSTripReport,
    options?: {
      outputPath?: string;
      addSignatures?: boolean;
    }
  ): Promise<string> {
    
    // Ensure output directory
    if (options?.outputPath) {
        const dir = options.outputPath.substring(0, options.outputPath.lastIndexOf('/'));
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }

    try {
        // 1. Load Template
        let templatePath = path.join(process.cwd(), 'src', 'assets', 'OFFICIAL_AHCCCS_FILLABLE.pdf');
        if (!fs.existsSync(templatePath)) {
             templatePath = path.resolve(__dirname, '../assets/OFFICIAL_AHCCCS_FILLABLE.pdf');
        }
        if (!fs.existsSync(templatePath)) {
            templatePath = path.resolve(process.cwd(), 'dist/assets/OFFICIAL_AHCCCS_FILLABLE.pdf');
        }
        // Fallback for direct path if needed
        if (!fs.existsSync(templatePath)) {
             templatePath = '/Users/joel/TRANSPORT-DEMO/backend/services/transport-service/src/assets/OFFICIAL_AHCCCS_FILLABLE.pdf';
        }

        if (!fs.existsSync(templatePath)) {
            // Attempt to look relative to where we are
            templatePath = path.join(__dirname, '../../src/assets/OFFICIAL_AHCCCS_FILLABLE.pdf');
             if (!fs.existsSync(templatePath)) {
                 throw new Error(`Template not found at ${templatePath} or std paths`);
             }
        }

        const templateBytes = fs.readFileSync(templatePath);
        const pdfDoc = await PDFDocument.load(templateBytes);
        
        // Embed Fonts
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Handle Multi-Page Logic (If > 3 legs and only 1 page in template, duplicate it)
        const totalLegs = report.tripLegs.length;
        if (totalLegs > 3 && pdfDoc.getPageCount() === 1) {
            const [page1Copy] = await pdfDoc.copyPages(pdfDoc, [0]);
            pdfDoc.addPage(page1Copy);
        }

        const pages = pdfDoc.getPages();
        
        const M = AHCCCS_FIELD_MAPPING;
        
        // We'll fill Page 1 for legs 0-2
        // And Page 2 for legs 3-5 (if available and template has 2 pages)
        
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const pageOffset = i * 3; // 0 for page 1, 3 for page 2
            
            // Should we stop if no legs for this page? 
            // Usually we fill at least Page 1. 
            // If Page 2 exists but we have < 4 legs, maybe leave it blank or remove it?
            // For now, let's fill whatever legs map to this page.
            const pageYOffset = 0;
            
            // 1. Fill Header Info (Provider, Member) on ALL pages
            // FIX: Only fill header on the FIRST page to avoid overlaying legs on subsequent pages
            // (Assumes subsequent pages are continuation sheets or don't need re-headering in this specific layout context)
            if (i === 0) {
              this.fill(page, M.provider_ahcccs_id, "123456", font, pageYOffset); // Hardcoded or from provider?
              if (report.driver?.name) {
                   // Provider info is actually static for the agency? Or fetched from config?
                   // Current code hardcoded "Great Values Transportation"
              }
              this.fill(page, M.provider_name, "GREAT VALUES TRANSPORTATION", font, pageYOffset); 
              this.fill(page, M.provider_address, "5723 W. PUEBLO AVE\nPHOENIX, AZ 85043", font, pageYOffset);
              this.fill(page, M.provider_phone, "(623) 219-3058", font, pageYOffset); 
  
              this.fill(page, M.provider_ahcccs_id, "A2A843", font, pageYOffset); // Mock/Config ID
  
              // Member Info
              const member = report.member; // Assuming report.member is the single member object
              if (member) {
                   this.fill(page, M.member_ahcccs_id, member.ahcccsId, font, pageYOffset);
                   this.fill(page, M.member_name, member.name, font, pageYOffset); // Assuming member.name is full name
                   if (member.dateOfBirth) {
                      this.fill(page, M.member_dob, member.dateOfBirth.toISOString().split('T')[0], font, pageYOffset);
                   }
                   // Address?
                   const ma = member.mailingAddress;
                   this.fill(page, M.member_address, `${ma.street}, ${ma.city}, ${ma.state} ${ma.zipCode}`, font, pageYOffset);
              }
  
              // Vehicle Info (Right side)
              if (report.vehicle) {
                   this.fill(page, M.vehicle_fleet_id, report.vehicle.fleetId, font, pageYOffset); // Assuming fleetId maps to vehicleNumber
                   this.fill(page, M.vehicle_make_color, `${report.vehicle.make} / ${report.vehicle.color}`, font, pageYOffset);
                   
                   // Checkboxes
                   if (report.vehicle.type) {
                       // Check type
                       const vType = String(report.vehicle.type).toLowerCase();
                       if (M.vehicle_type.wheelchair_van && (vType.includes('wheelchair') || vType.includes('van'))) {
                           this.check(page, M.vehicle_type.wheelchair_van, true, font, pageYOffset);
                       }
                       // Add other types...
                       this.check(page, M.vehicle_type.taxi, vType.includes('taxi'), font, pageYOffset);
                       this.check(page, M.vehicle_type.bus, vType.includes('bus'), font, pageYOffset);
                       const isOther = ![VehicleType.WHEELCHAIR_VAN, VehicleType.TAXI, VehicleType.BUS].includes(report.vehicle.type);
                       this.check(page, M.vehicle_type.other, isOther, font, pageYOffset);
                   }
              }
            }

            // 2. Fill Legs for this page
            const mapLegs = [M.leg_1, M.leg_2, M.leg_3];
            
            for (let j = 0; j < 3; j++) {
                const legIndex = pageOffset + j;
                if (legIndex >= totalLegs) break; // No more legs
                
                const leg = report.tripLegs[legIndex];
                const map = mapLegs[j]; // Map to Leg 1, 2, 3 positions on THIS page

                this.fill(page, map.pickup_location, this.formatLoc(leg.pickUpLocation), font, pageYOffset);
                this.fill(page, map.pickup_time, this.formatTime(leg.pickUpTime), font, pageYOffset);
                this.fill(page, map.pickup_odometer, String(leg.pickUpOdometer), font, pageYOffset);

                this.fill(page, map.dropoff_location, this.formatLoc(leg.dropOffLocation), font, pageYOffset);
                this.fill(page, map.dropoff_time, this.formatTime(leg.dropOffTime) || '', font, pageYOffset);
                this.fill(page, map.dropoff_odometer, String(leg.dropOffOdometer), font, pageYOffset);
                
                // Miles
                const miles = (leg.dropOffOdometer && leg.pickUpOdometer) ? (leg.dropOffOdometer - leg.pickUpOdometer) : 0;
                this.fill(page, map.trip_miles, String(miles), font, pageYOffset);

                // Type
                if ('trip_type' in map && map.trip_type) {
                    const tt = (map as any).trip_type;
                    this.check(page, tt.one_way, String(leg.tripType) === 'one_way', font, pageYOffset);
                    this.check(page, tt.round_trip, String(leg.tripType) === 'round_trip', font, pageYOffset);
                    this.check(page, tt.multiple_stops, String(leg.tripType) === 'multiple_stops', font, pageYOffset);
                }

                // Reason & Escort
                if ('reason' in map && map.reason) this.fill(page, map.reason, leg.reasonForVisit, font, pageYOffset);
                
                const m = map as any;
                if (leg.escort && m.escort_name) {
                    this.fill(page, m.escort_name, leg.escort.name, font, pageYOffset);
                    this.fill(page, m.escort_relationship, String(leg.escort.relationship), font, pageYOffset);
                }
            }

            // Signatures (Usually on Page 1? Or both? Let's sign both if populated)
            // If signature is provided, embed it.
            if (options?.addSignatures) {
                 const attestation = report.attestation;
                 
                 if (attestation.member && attestation.member.signatureImageUrl) {
                     await PDFGenerator.embedSig(pdfDoc, page, M.member_signature, attestation.member.signatureImageUrl, pageYOffset);
                     this.fill(page, M.member_signature_date, this.formatDate(attestation.complianceTimestamp), font, pageYOffset);
                 }

                 if (attestation.driver && attestation.driver.signatureImageUrl) {
                    await PDFGenerator.embedSig(pdfDoc, page, M.driver_signature, attestation.driver.signatureImageUrl, pageYOffset);
                    this.fill(page, M.driver_signature_date, this.formatDate(attestation.complianceTimestamp), font, pageYOffset);
                 }
            }
        }
        
        // Remove Page 2 if empty? Or keep it? 
        // User asked for capability to fill 6 legs. 
        // If trip has <= 3 legs, maybe we should delete the second page to be clean?
        // But for "Daily Trip Report", sometimes they print front/back blank.
        // Let's keep it simple: strict mapping.
        
        // If legs <= 3, check if we should remove page 2. 
        // But `pdf-lib` removePage needs index.
        if (totalLegs <= 3 && pages.length > 1) {
             pdfDoc.removePage(1);
        }

        // Save
        const outputPath = options?.outputPath || `./reports/trip_report_${report.documentId}.pdf`;
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, pdfBytes);
        
        return outputPath;

    } catch (error) {
        console.error("PDF GENERATION FAILED", error);
        throw error;
    }
  }

  // --- HELPER METHODS ---

  // Global offset to fine-tune alignment without rewriting all coords
  private static readonly X_OFFSET = 0;

  private static fill(page: any, field: any, value: string, font: PDFFont, yOffset: number = 0) {
      if (!field || !value) return;
      page.drawText(String(value), {
          x: field.x + PDFGenerator.X_OFFSET,
          y: field.y + yOffset,
          size: field.fontSize || 9,
          font: font,
          maxWidth: field.width 
      });
  }

  private static check(page: any, field: any, isChecked: boolean, font: PDFFont, yOffset: number = -70) {
      if (!field || !isChecked) return;
      const offset = (field.size || 10) * 0.15;
      const x = field.x + PDFGenerator.X_OFFSET;
      const y = field.y + yOffset;
      
      // Draw X
      page.drawLine({
          start: { x: x + offset, y: y + offset },
          end: { x: x + field.size - offset, y: y + field.size - offset },
          thickness: 1.5,
          color: rgb(0, 0, 0)
      });
      page.drawLine({
          start: { x: x + field.size - offset, y: y + offset },
          end: { x: x + offset, y: y + field.size - offset },
          thickness: 1.5,
          color: rgb(0, 0, 0)
      });
  }

  private static async embedSig(pdfDoc: PDFDocument, page: any, field: any, base64: string, yOffset: number = -70) {
      if (!field || !base64) return;
      if (!base64.startsWith('data:image')) return;

      try {
           const parts = base64.split(',');
           const bytes = Buffer.from(parts[1], 'base64');
           const image = await pdfDoc.embedPng(bytes);
           const dims = image.scaleToFit(field.width, field.height);
           
           page.drawImage(image, {
               x: field.x,
               y: field.y + yOffset, // Apply offset
               width: dims.width,
               height: dims.height
           });
      } catch (e) {
          console.error("Signature embedding error", e);
      }
  }

  private static formatLoc(loc: any): string {
      if (loc.physicalAddress) return `${loc.physicalAddress}, ${loc.city}`;
      if (loc.geoCoordinates) return `GPS: ${loc.geoCoordinates.latitude}, ${loc.geoCoordinates.longitude}`;
      return 'Unknown';
  }

  private static formatTime(date: Date): string {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private static formatDate(date: Date): string {
      return date.toLocaleDateString();
  }
}
