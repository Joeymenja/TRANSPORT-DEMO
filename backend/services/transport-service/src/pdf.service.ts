import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { TripReport } from './entities/trip-report.entity';
import { Trip } from './entities/trip.entity';
import * as mkrip from 'mkdirp';
import { join } from 'path';
import { createWriteStream } from 'fs';

@Injectable()
export class PdfService {

    async generateTripReportPdf(trip: Trip, report: TripReport): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // --- Header ---
            doc.fontSize(20).text('Trip Log & Verification Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
            doc.text(`Trip ID: ${trip.id}`, { align: 'right' });
            doc.moveDown();

            // --- Trip Info ---
            doc.rect(50, doc.y, 500, 25).fill('#eeeeee').stroke();
            doc.fillColor('black').text('Trip Details', 60, doc.y + 7);
            doc.moveDown(2);

            doc.text(`Date & Time: ${trip.scheduledDate} ${trip.pickupTime}`, { continued: true });
            doc.text(`   Status: ${trip.status.toUpperCase()}`);
            doc.moveDown(0.5);

            // Driver
            const driverName = trip.assignedDriver?.user ? `${trip.assignedDriver.user.firstName} ${trip.assignedDriver.user.lastName}` : 'Unassigned';
            doc.text(`Driver: ${driverName}`);

            // Client
            const client = trip.members?.[0]?.member;
            const clientName = client ? `${client.firstName} ${client.lastName}` : 'Unknown';
            doc.text(`Client: ${clientName}`);
            doc.moveDown();

            // Addresses
            doc.text('Pickup:', { underline: true });
            doc.text(trip.pickupStops?.[0]?.address || 'N/A');
            doc.moveDown(0.5);
            doc.text('Dropoff:', { underline: true });
            doc.text(trip.dropoffStops?.[0]?.address || 'N/A');
            doc.moveDown();

            // --- Report Data ---
            if (report) {
                doc.rect(50, doc.y, 500, 25).fill('#eeeeee').stroke();
                doc.fillColor('black').text('Execution Report', 60, doc.y + 7);
                doc.moveDown(2);

                // Times
                doc.text(`Pickup Time: ${report.pickupTime ? new Date(report.pickupTime).toLocaleTimeString() : '--'}`);
                doc.text(`Dropoff Time: ${report.dropoffTime ? new Date(report.dropoffTime).toLocaleTimeString() : '--'}`);
                doc.moveDown();

                // Mileage
                doc.text(`Start Odometer: ${report.startOdometer}`);
                doc.text(`End Odometer: ${report.endOdometer}`);
                doc.text(`Total Miles: ${report.totalMiles}`);
                doc.moveDown();

                // Verification
                doc.text(`Service Verified: ${report.serviceVerified ? 'Yes' : 'No'}`);
                doc.text(`Client Arrived Safely: ${report.clientArrived ? 'Yes' : 'No'}`);

                if (report.incidentReported) {
                    doc.moveDown();
                    doc.fillColor('red').text('INCIDENT REPORTED:');
                    doc.fillColor('black').text(report.incidentDescription || 'No description provided.');
                }

                doc.moveDown(2);

                // --- Signatures ---
                doc.rect(50, doc.y, 500, 25).fill('#eeeeee').stroke();
                doc.fillColor('black').text('Signatures', 60, doc.y + 7);
                doc.moveDown(2);

                if (report.signatures && report.signatures.length > 0) {
                    let xPos = 50;
                    const yPos = doc.y;

                    report.signatures.forEach((sig) => {
                        doc.fontSize(10).text(sig.role || sig.type, xPos, yPos);

                        if (sig.signatureUrl && sig.signatureUrl.startsWith('data:image')) {
                            try {
                                doc.image(sig.signatureUrl, xPos, yPos + 15, { height: 40 });
                            } catch (e) {
                                doc.text('[Invalid Image Data]', xPos, yPos + 15);
                            }
                        } else {
                            doc.text('[Stored URL]', xPos, yPos + 15);
                        }

                        doc.text(sig.signerName, xPos, yPos + 60);
                        doc.text(new Date(sig.createdAt).toLocaleDateString(), xPos, yPos + 72);

                        xPos += 150;
                    });
                } else {
                    doc.text('No signatures captured for this trip.');
                }
            } else {
                doc.text('No report submitted for this trip.');
            }

            // --- Footer ---
            const bottom = doc.page.margins.bottom;
            doc.page.margins.bottom = 0;
            doc.text('Confidential - HIPAA Compliant', 50, doc.page.height - 50, {
                align: 'center',
                opacity: 0.5
            });

            doc.end();
        });
    }
}
