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

        const pages = pdfDoc.getPages();
        const page1 = pages[0]; // All content on Page 1 as per user note

        const M = AHCCCS_FIELD_MAPPING;

        // 2. FILL HEADER SECTIONS
        
        // Provider
        this.fill(page1, M.provider_ahcccs_id, report.provider.ahcccsId, font);
        this.fill(page1, M.provider_name, report.provider.name, font);
        this.fill(page1, M.provider_address, report.provider.address, font);
        this.fill(page1, M.provider_phone, report.provider.phoneNumber, font);

        // Vehicle
        this.fill(page1, M.vehicle_fleet_id, report.vehicle.fleetId, font);
        this.fill(page1, M.vehicle_make_color, `${report.vehicle.make} ${report.vehicle.color}`, font);
        
        this.check(page1, M.vehicle_type.wheelchair_van, report.vehicle.type === VehicleType.WHEELCHAIR_VAN, font);
        this.check(page1, M.vehicle_type.taxi, report.vehicle.type === VehicleType.TAXI, font);
        this.check(page1, M.vehicle_type.bus, report.vehicle.type === VehicleType.BUS, font);
        const isOther = ![VehicleType.WHEELCHAIR_VAN, VehicleType.TAXI, VehicleType.BUS].includes(report.vehicle.type);
        this.check(page1, M.vehicle_type.other, isOther, font);

        // Member
        this.fill(page1, M.member_ahcccs_id, report.member.ahcccsId, font);
        this.fill(page1, M.member_dob, this.formatDate(report.member.dateOfBirth), font);
        this.fill(page1, M.member_name, report.member.name, font);
        const ma = report.member.mailingAddress;
        this.fill(page1, M.member_address, `${ma.street}, ${ma.city}, ${ma.state} ${ma.zipCode}`, font);


        // 3. FILL TRIP LEGS
        const mapLegs = [M.leg_1, M.leg_2, M.leg_3];
        
        for (let i = 0; i < report.tripLegs.length && i < 3; i++) {
            const leg = report.tripLegs[i];
            const map = mapLegs[i];
            
            // Pickup
            this.fill(page1, map.pickup_location, this.formatLoc(leg.pickUpLocation), font);
            this.fill(page1, map.pickup_time, this.formatTime(leg.pickUpTime), font);
            this.fill(page1, map.pickup_odometer, leg.pickUpOdometer.toString(), font);

            // Dropoff
            this.fill(page1, map.dropoff_location, this.formatLoc(leg.dropOffLocation), font);
            this.fill(page1, map.dropoff_time, this.formatTime(leg.dropOffTime), font);
            this.fill(page1, map.dropoff_odometer, leg.dropOffOdometer.toString(), font);
            this.fill(page1, map.trip_miles, leg.tripMiles.toString(), font);

            // Type
            // Note: Different legs have specific checkbox mappings in `map.trip_type`
            if (map.trip_type) {
                this.check(page1, map.trip_type.one_way, leg.tripType === 'one_way', font);
                this.check(page1, map.trip_type.round_trip, leg.tripType === 'round_trip', font);
                this.check(page1, map.trip_type.multiple_stops, leg.tripType === 'multiple_stops', font);
            }

            // Reason & Escort
            if (map.reason) this.fill(page1, map.reason, leg.reasonForVisit, font);
            if (leg.escort && map.escort_name) {
                this.fill(page1, map.escort_name, leg.escort.name, font);
                this.fill(page1, map.escort_relationship, leg.escort.relationship, font);
            }
        }


        // 4. SIGNATURES
        if (options?.addSignatures) {
            const dateStr = this.formatDate(new Date()); // Or report compliance date

            // Member
            if (report.attestation.member) {
                await this.embedSig(pdfDoc, page1, M.member_signature, report.attestation.member.signatureBase64);
                this.fill(page1, M.member_signature_date, this.formatDate(report.attestation.complianceTimestamp), font);
            }

            // Driver
            if (report.attestation.driver) {
                await this.embedSig(pdfDoc, page1, M.driver_signature, report.attestation.driver.signatureBase64);
                this.fill(page1, M.driver_signature_date, this.formatDate(report.attestation.complianceTimestamp), font);
            }
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

  private static fill(page: any, field: any, value: string, font: PDFFont) {
      if (!field || !value) return;
      page.drawText(String(value), {
          x: field.x,
          y: field.y,
          size: field.fontSize || 9,
          font: font,
          maxWidth: field.width // pdf-lib supports maxWidth for multiline wrapping
          // lineHeight etc if needed
      });
  }

  private static check(page: any, field: any, isChecked: boolean, font: PDFFont) {
      if (!field || !isChecked) return;
      const offset = (field.size || 10) * 0.15;
      // Draw X
      page.drawLine({
          start: { x: field.x + offset, y: field.y + offset },
          end: { x: field.x + field.size - offset, y: field.y + field.size - offset },
          thickness: 1.5,
          color: rgb(0, 0, 0)
      });
      page.drawLine({
          start: { x: field.x + field.size - offset, y: field.y + offset },
          end: { x: field.x + offset, y: field.y + field.size - offset },
          thickness: 1.5,
          color: rgb(0, 0, 0)
      });
      // Or just draw text "X"
      // page.drawText("X", { x: field.x, y: field.y, size: field.size, font: font });
  }

  private static async embedSig(pdfDoc: PDFDocument, page: any, field: any, base64: string) {
      if (!field || !base64) return;
      if (!base64.startsWith('data:image')) return;

      try {
           const parts = base64.split(',');
           const bytes = Buffer.from(parts[1], 'base64');
           const image = await pdfDoc.embedPng(bytes);
           // Scale to fit
           const dims = image.scaleToFit(field.width, field.height);
           // Center in box? Or just place Bottom-Left?
           // Field defines box x,y,w,h.
           // Position image at x, y
           page.drawImage(image, {
               x: field.x,
               y: field.y,
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
