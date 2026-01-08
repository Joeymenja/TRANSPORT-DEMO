import { Injectable, Logger } from '@nestjs/common';
import { PDFDocument, PDFName, StandardFonts, rgb } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Service for generating official AHCCCS Trip Report PDFs.
 * Uses pdf-lib to fill an existing template.
 */
@Injectable()
export class PdfService {
    private readonly logger = new Logger(PdfService.name);
    private readonly reportsBaseDir = path.join(process.cwd(), 'reports');
    // Assets are copied to dist/assets or src/assets depending on build. 
    // We assume they are available relative to this service or via absolute path from project root if running locally.
    // For local dev with NestJS, assets might be in dist/services/transport-service/src/assets or similar.
    // We'll try to resolve robustly.
    private readonly assetsDir = path.join(process.cwd(), 'src/assets'); 
    
    constructor() {
        // Ensure reports directory exists
        if (!fs.existsSync(this.reportsBaseDir)) {
            fs.mkdirSync(this.reportsBaseDir, { recursive: true });
        }
        this.logger.log(`PDF Service initialized. Reports dir: ${this.reportsBaseDir}`);
    }

    /**
     * Generates a filled AHCCCS PDF trip report.
     * @param tripData All the text fields required for the form
     * @param signatureData Base64 strings for signatures
     * @returns The relative URL/path to the generated PDF
     */
    async generateOfficialReport(tripData: any, signatureData: { member?: string, driver?: string, driverName?: string }): Promise<string> {
        try {
            this.logger.log(`Generating PDF for trip ${tripData.id} / Driver ${tripData.driverId}`);

            // 1. Resolve Asset Paths
            // Try standard source location first for dev
            let templatePath = path.join(process.cwd(), 'src', 'assets', 'OFFICIAL_AHCCCS_FILLABLE.pdf');
            if (!fs.existsSync(templatePath)) {
                // Try dist location or relative
                 templatePath = path.join(__dirname, '../assets/OFFICIAL_AHCCCS_FILLABLE.pdf');
            }
            // If still not found, try the direct path we copied to
            if (!fs.existsSync(templatePath)) {
                templatePath = '/Users/joel/TRANSPORT-DEMO/backend/services/transport-service/src/assets/OFFICIAL_AHCCCS_FILLABLE.pdf';
            }

            // Same for map
            let mapPath = path.join(process.cwd(), 'src', 'assets', 'native_trip_report_field_map.json');
            if (!fs.existsSync(mapPath)) {
                 mapPath = path.join(__dirname, '../assets/native_trip_report_field_map.json');
            }
            if (!fs.existsSync(mapPath)) {
                mapPath = '/Users/joel/TRANSPORT-DEMO/backend/services/transport-service/src/assets/native_trip_report_field_map.json';
            }
            
            if (!fs.existsSync(templatePath)) throw new Error(`Template not found at ${templatePath}`);
            
            // 2. Load PDF & Map
            const templateBytes = fs.readFileSync(templatePath);
            // We aren't strictly using the JSON map file for dynamic iterations yet, 
            // we hardcoded the coordinates in the method body to match the proven Frontend logic.
            // But we load it if we want to switch to dynamic later. For now, adhering to the manual drawText logic.
            
            const pdfDoc = await PDFDocument.load(templateBytes);
            const form = pdfDoc.getForm();

            // 3. FLATTEN & NUKE (The "Nuclear Option")
            // This ensures no white boxes from the original form fields obscure our text.
            try {
                form.flatten();
            } catch (e) {
                this.logger.warn("Flatten failed", e);
            }

            try {
                const pages = pdfDoc.getPages();
                pages.forEach(page => {
                    const node = page.node;
                    // @ts-ignore - access internal dict
                    if (node.has(PDFName.of('Annots'))) {
                        // @ts-ignore
                        node.delete(PDFName.of('Annots'));
                    }
                });
            } catch (err) {
                this.logger.warn("Annot nuking failed", err);
            }

            // 4. Setup Pages & Fonts
            const pages = pdfDoc.getPages();
            const page1 = pages[0];
            const page2 = pages[1];
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const textSize = 10;

            const txt = (val: any) => val || '';

            // 5. Draw HEADER (Page 1)
            // Provider Info
            page1.drawText('Great Valley Behavioral Homes', { x: 72, y: 732, size: textSize, font: boldFont });
            page1.drawText('201337', { x: 72, y: 718, size: textSize, font });
            page1.drawText('6241 N 19th Ave, Phoenix, AZ 85015', { x: 72, y: 704, size: textSize, font });
            page1.drawText('(602) 283-5154', { x: 72, y: 690, size: textSize, font });

            // Driver/Vehicle/Member Info (Native Coordinates from Frontend)
            // Driver Name
            page1.drawText(txt(signatureData.driverName || tripData.driverName), { x: 417, y: 730, size: textSize, font });
            // Date
            page1.drawText(new Date().toLocaleDateString(), { x: 376, y: 716, size: textSize, font });
            // Vehicle
            page1.drawText(txt(tripData.vehicleId), { x: 498, y: 702, size: textSize, font });
            page1.drawText(`${txt(tripData.vehicleColor)} ${txt(tripData.vehicleMake)}`, { x: 448, y: 688, size: textSize, font });
            page1.drawText((tripData.vehicleType || 'Wheelchair Van').toUpperCase(), { x: 502, y: 656, size: textSize, font });

            // Member
            page1.drawText(txt(tripData.memberAhcccsId), { x: 68, y: 636, size: textSize, font });
            page1.drawText(txt(tripData.memberDOB), { x: 335, y: 636, size: textSize, font });
            page1.drawText(txt(tripData.memberName), { x: 86, y: 620, size: textSize, font });
            page1.drawText(txt(tripData.memberAddress), { x: 344, y: 620, size: textSize, font });

            // 6. Draw TRIP ROWS (Page 1) - Trip 1
            // Pickup
            page1.drawText(txt(tripData.pickupAddress), { x: 14, y: 584, size: textSize, font });
            // Note: tripData.pickupTime passed from frontend is usually ISO string or HH:MM
            // Format it nicely if needed, but assuming frontend sends display string or we print as is.
            // Frontend sent ISO string in onSubmit: new Date(...).toISOString()
            // We should format it to HH:MM AM/PM
            const formatTime = (isoStr: string) => {
                if (!isoStr) return '';
                try {
                    return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } catch { return isoStr; }
            };

            page1.drawText(formatTime(tripData.pickupTime), { x: 449, y: 584, size: textSize, font });
            page1.drawText(txt(tripData.startOdometer?.toString()), { x: 499, y: 584, size: textSize, font });

            // Dropoff
            page1.drawText(txt(tripData.dropoffAddress), { x: 14, y: 537, size: textSize, font });
            page1.drawText(formatTime(tripData.dropoffTime), { x: 449, y: 537, size: textSize, font });
            page1.drawText(txt(tripData.endOdometer?.toString()), { x: 499, y: 537, size: textSize, font });

            // Reason
            page1.drawText(txt(tripData.reasonForVisit), { x: 90, y: 438, size: textSize, font });


            // 7. Draw FOOTER (Page 2)
            page2.drawText(txt(tripData.memberName), { x: 88, y: 759, size: textSize, font });
            page2.drawText(txt(tripData.additionalInfo), { x: 118, y: 220, size: textSize, font });

            // 8. SIGNATURES (Page 2 - Stacked)
            // Member Signature
            if (signatureData.member) {
                try {
                    // Expecting data:image/png;base64,...
                    const matches = signatureData.member.match(/^data:image\/([a-zA-Z]*);base64,([^\"]*)$/);
                    if (matches) {
                        const imageBytes = Buffer.from(matches[2], 'base64');
                        const signatureImage = await pdfDoc.embedPng(imageBytes);
                        const sigDims = signatureImage.scale(0.3);
                        // Member Sig: PDF Y=192 (positioned in signature field)
                        page2.drawImage(signatureImage, { x: 102, y: 192, width: sigDims.width, height: sigDims.height });
                    }
                } catch (e) {
                    this.logger.error("Failed to embed member signature", e);
                }
            }

            // Driver Signature
            if (signatureData.driver) {
               if (signatureData.driver.startsWith('data:image')) {
                   try {
                        const matches = signatureData.driver.match(/^data:image\/([a-zA-Z]*);base64,([^\"]*)$/);
                        if (matches) {
                            const imageBytes = Buffer.from(matches[2], 'base64');
                            const signatureImage = await pdfDoc.embedPng(imageBytes);
                            // Driver Sig: PDF Y=55
                            // Use same scaling?
                            const sigDims = signatureImage.scale(0.3);
                            page2.drawImage(signatureImage, { x: 93, y: 55, width: sigDims.width, height: sigDims.height });
                        }
                   } catch (e) {
                       this.logger.error("Failed to embed driver signature image", e);
                   }
               } else {
                   // Text fallback
                   page2.drawText(txt(signatureData.driver), { x: 93, y: 55, size: 14, font: boldFont, color: rgb(0,0,0) });
               }
               // Always date
               page2.drawText(new Date().toLocaleDateString(), { x: 457, y: 55, size: 12, font, color: rgb(0,0,0) });
            }


            // 9. Save to Disk
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            
            const storageDir = path.join(this.reportsBaseDir, String(year), month, day);
            if (!fs.existsSync(storageDir)) {
                fs.mkdirSync(storageDir, { recursive: true });
            }

            const fileName = `trip_report_${tripData.id}_${Date.now()}.pdf`;
            const filePath = path.join(storageDir, fileName);
            
            const pdfBytes = await pdfDoc.save();
            fs.writeFileSync(filePath, pdfBytes);
            this.logger.log(`PDF saved to ${filePath}`);

            // Return relative path or URL that the frontend can use to download/view
            // Assuming we serve the 'reports' directory statically or have an endpoint to fetch it
            return `/reports/${year}/${month}/${day}/${fileName}`;

        } catch (error) {
            this.logger.error("Failed to generate official PDF", error);
            throw error;
        }
    }

    /**
     * Reads a PDF file from disk.
     */
    async readPdf(filePath: string): Promise<Buffer> {
        if (!fs.existsSync(filePath)) {
            // Try resolving relative to project root if absolute path fails
            const absolutePath = path.join(process.cwd(), filePath);
            if (fs.existsSync(absolutePath)) {
                return fs.readFileSync(absolutePath);
            }
            throw new Error(`File not found: ${filePath}`);
        }
        return fs.readFileSync(filePath);
    }
}
