import { Injectable, Logger } from '@nestjs/common';
import { Trip, TripType } from './entities/trip.entity';
import { TripReport } from './entities/trip-report.entity';
import { PDFDocument, PDFTextField, PDFCheckBox, TextAlignment } from 'pdf-lib';
import { readFileSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns';

@Injectable()
export class PdfService {
    private readonly logger = new Logger(PdfService.name);
    // NEW TEMPLATE
    private readonly templatePath = join(__dirname, '..', 'assets', 'AHCCCS_Trip_Report_Final.pdf');

    async generateTripReportPdf(trip: Trip, report: TripReport): Promise<Buffer> {
        try {
            this.logger.log(`Generating PDF for trip ${trip.id} using template: ${this.templatePath}`);
            const templateBytes = readFileSync(this.templatePath);
            const pdfDoc = await PDFDocument.load(templateBytes);
            const form = pdfDoc.getForm();
            const page = pdfDoc.getPages()[0];

            // --- HELPER: Set Text with Advanced Logic ---
            const setText = (name: string, value: string | boolean, fontSize: number | null = null, alignment: TextAlignment | null = null, autoSizeRatio: number | null = null) => {
                try {
                    const field = form.getField(name);
                    if (field instanceof PDFCheckBox) {
                        if (value === true || value === 'X') field.check();
                        else field.uncheck();
                    } else if (field instanceof PDFTextField) {
                        // Multiline for Time Fields (Top Align)
                        if (autoSizeRatio && name.startsWith('AMPM')) {
                            field.enableMultiline();
                        }

                        let finalSize = fontSize;
                        // Auto-Size Logic
                        if (autoSizeRatio) {
                            try {
                                const widgets = field.acroField.getWidgets();
                                const rect = widgets[0].getRectangle();
                                const calculatedSize = rect.height * autoSizeRatio;
                                finalSize = Math.round(calculatedSize * 2) / 2;
                            } catch (e) {
                                // Fallback
                            }
                        }

                        if (finalSize) field.setFontSize(finalSize);
                        if (alignment) field.setAlignment(alignment);
                        field.setText(typeof value === 'string' ? value : '');
                    }
                } catch (e) {
                    // Field might not exist, ignore
                }
            };

            // --- GEOMETRIC ROW MAPPING ---
            // Used to identify the 6 generic rows of checkboxes (Round Trip, One Way, etc.)
            const getTripRows = () => {
                const tripFields = form.getFields().filter(f => {
                    const n = f.getName();
                    return n.includes('Type of Trip') || n.includes('One Way') || n.includes('Multiple Stops');
                });
                const items: any[] = [];
                tripFields.forEach(f => {
                    try {
                        const rect = f.acroField.getWidgets()[0].getRectangle();
                        items.push({ name: f.getName(), x: rect.x, y: rect.y });
                    } catch (e) { }
                });
                // Group by Y
                const rows: any[] = [];
                items.forEach(item => {
                    let row = rows.find(r => Math.abs(r.y - item.y) < 20);
                    if (!row) {
                        row = { y: item.y, fields: [] };
                        rows.push(row);
                    }
                    row.fields.push(item);
                });
                rows.sort((a, b) => b.y - a.y); // Top to bottom
                return rows;
            };

            const visualRows = getTripRows();

            // 1. FILL HEADER
            const driverName = trip.assignedDriver?.user ? `${trip.assignedDriver.user.firstName} ${trip.assignedDriver.user.lastName}` : '';
            setText('Drivers Name', driverName);

            const tripDate = trip.tripDate ? format(new Date(trip.tripDate), 'yyyy-MM-dd') : '';
            setText('Date', tripDate);

            setText('Vehicle LicenseFleet ID', trip.assignedVehicle?.licensePlate || '');
            setText('Vehicle Make  Color', trip.assignedVehicle ? `${trip.assignedVehicle.make} / ${trip.assignedVehicle.color}` : '');

            // 2. HARDCODED PROVIDER INFO (Into 'Vehicle Type' field)
            const providerInfo = `AHCCCS ID: 181294
NAME: GREAT VALUES TRANSPORTATION
ADDRESS: 5723 W. PUEBLO AVE PHOENIX 85043-6404
PHONE: 480-678-9426`;
            setText('Vehicle Type', providerInfo, 10);

            // 3. MEMBER INFO
            const client = trip.tripMembers?.[0]?.member;
            if (client) {
                setText('Member Name', `${client.firstName} ${client.lastName}`);
                setText('AHCCCS', client.insuranceId || '');
                setText('Date of Birth', client.dateOfBirth ? format(new Date(client.dateOfBirth), 'yyyy-MM-dd') : '');
                // Address - assuming hardcoded for demo or derived
                setText('Mailing Address', '123 Main St, Phoenix, AZ');
            }

            // 4. VEHICLE CHECKBOXES (Mobility)
            const vSize = 24; // Increased from 20
            const vAlign = TextAlignment.Center;
            const mob = trip.mobilityRequirement;
            // Uncheck all first? No, setText handles specific checking.
            if (mob === 'WHEELCHAIR') setText('WHEELVHAIR VAN', 'X', vSize, vAlign);
            else if (mob === 'STRETCHER') setText('STRETCHER CAR', 'X', vSize, vAlign);
            else if (mob === 'AMBULATORY') setText('TAXI', 'X', vSize, vAlign);
            else setText('OTHER', 'X', vSize, vAlign);

            // 5. MULTI-MEMBER
            const isMulti = trip.tripMembers && trip.tripMembers.length > 1;
            const mSizeSmall = 12; // Increased from 10
            const mSizeTall = 18;  // Increased from 14
            const mAlign = TextAlignment.Center;

            if (isMulti) {
                setText('MULTIPLEMEBMBER­_YES', 'X', mSizeSmall, mAlign);
                setText('SAMEPICK_YES', 'X', mSizeTall, mAlign); // Tall box
            } else {
                setText('MULTIPLEMEBMBER­_NO', 'X', mSizeTall, mAlign);
                setText('SAMEPICKUP_NO', 'X', mSizeTall, mAlign);
            }

            // 6. TRIP DETAILS (Rows 1-6)
            // Assuming this report is for ONE trip request (Single Leg or Round Trip)
            // We fill Row 1 only for single leg, or Row 1+2 for Round Trip (if modeled as such).
            // Current model: Trip has stops.

            const timeRatio = 0.33; // Default Restored

            // Populate Row 1
            const tNum = 1;
            const name1 = `AMPM${(tNum - 1) * 2 + 1}`;
            const name2 = `AMPM${(tNum - 1) * 2 + 2}`;

            // Times (Mock or Real?)
            // If report has times, use them. Else hardcode for demo.
            setText(name1, '08:00 AM', null, TextAlignment.Center, timeRatio);
            setText(name2, '08:30 AM', null, TextAlignment.Center, timeRatio);

            // Addresses
            const pickup = trip.tripStops?.[0]; // First stop
            const dropoff = trip.tripStops?.[trip.tripStops.length - 1]; // Last stop

            if (pickup) setText('1st PickUp Location Physical Address City  Zip Code or Geographical CoordinatesLandmark if No Address AvailableRow1', pickup.address);
            if (dropoff) setText('1st DropOff Location Physical Address City  Zip Code or Geographical CoordinatesLandmark if No Address AvailableRow1', dropoff.address);

            // Odometers
            if (report) {
                setText('PickUp Odometerampm', report.startOdometer?.toString() || '', 10);
                setText('DropOff Odometerampm', report.endOdometer?.toString() || '', 10);
                setText('Trip Milesampm', report.totalMiles?.toString() || '');
            }

            // Trip Row Checkbox (Round Trip / One Way)
            if (visualRows[0]) {
                const rowFields = visualRows[0].fields; // Fields for Row 1
                // Find correct box based on trip type
                // trip.tripType: ROUND_TRIP, ONE_WAY...
                let keyword = '';
                if (trip.tripType === TripType.ROUND_TRIP) keyword = 'Round Trip';
                else if (trip.tripType === TripType.ONE_WAY) keyword = 'One Way';
                else if (trip.tripType === TripType.MULTIPLE_STOPS) keyword = 'Multiple Stops';

                if (keyword) {
                    const box = rowFields.find((f: any) => f.name.includes(keyword));
                    if (box) {
                        setText(box.name, 'X', 24, TextAlignment.Center); // Increased from 22
                    }
                }
            }

            // 7. SIGNATURES
            if (report?.signatures?.length > 0) {
                for (const sig of report.signatures) {
                    if (sig.signatureUrl && sig.signatureUrl.startsWith('data:image/png;base64,')) {
                        try {
                            const imageBytes = Buffer.from(sig.signatureUrl.split(',')[1], 'base64');
                            const embeddedImage = await pdfDoc.embedPng(imageBytes);

                            let fieldName = '';
                            // Updated Names from fill-final.ts - SWAPPED PER USER REQUEST
                            if (sig.role === 'driver' || sig.type === 'driver') fieldName = 'Signature2_es_:signer:signature';
                            if (sig.role === 'member' || sig.type === 'member') fieldName = 'Signature1_es_:signer:signature';

                            if (fieldName) {
                                try {
                                    const field = form.getField(fieldName);
                                    const widgets = field.acroField.getWidgets();
                                    const rect = widgets[0].getRectangle();
                                    page.drawImage(embeddedImage, {
                                        x: rect.x,
                                        y: rect.y,
                                        width: rect.width,
                                        height: rect.height,
                                    });
                                } catch (e) {
                                    // Fallback
                                }
                            }
                        } catch (err) { }
                    }
                }
            }

            // 8. PAGE NUMBERING
            // Page 1
            setText('page', '1');
            setText('of', '2');
            // Page 2
            setText('page_2', '2');
            setText('of_2', '2');

            form.flatten();
            const saved = await pdfDoc.save();
            return Buffer.from(saved);

        } catch (error) {
            this.logger.error(`Error generating PDF: ${error.message}`, error.stack);
            throw error;
        }
    }
}
