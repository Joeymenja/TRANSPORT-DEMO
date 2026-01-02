import { Injectable } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Trip } from './entities/trip.entity';

@Injectable()
export class PdfService {
    async generateTripReport(trip: Trip): Promise<Buffer> {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([612, 792]); // Letter size
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const { width, height } = page.getSize();
        let y = height - 40;

        // --- Header Section ---
        page.drawText('AHCCCS DAILY TRIP REPORT', {
            x: width / 2 - 120,
            y,
            size: 16,
            font: boldFont,
        });

        y -= 25;
        page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1.5 });
        y -= 20;

        // --- Provider & Vehicle Info ---
        const drawHorizontalSection = (yPos: number, leftLabel: string, leftValue: string, rightLabel: string, rightValue: string) => {
            page.drawText(`${leftLabel}:`, { x: 50, y: yPos, size: 9, font: boldFont });
            page.drawText(leftValue || 'N/A', { x: 120, y: yPos, size: 9, font });

            page.drawText(`${rightLabel}:`, { x: 320, y: yPos, size: 9, font: boldFont });
            page.drawText(rightValue || 'N/A', { x: 400, y: yPos, size: 9, font });
        };

        drawHorizontalSection(y, 'PROVIDER', 'GREAT VALUES TRANSPORTATION', 'DATE', new Date(trip.tripDate).toLocaleDateString());
        y -= 15;
        drawHorizontalSection(y, 'PROVIDER ID', 'N/A', 'TRIP ID', trip.id.slice(0, 8).toUpperCase());
        y -= 15;

        const vehicleInfo = trip.assignedVehicle
            ? `${trip.assignedVehicle.year || ''} ${trip.assignedVehicle.make || ''} ${trip.assignedVehicle.model || ''}`.trim()
            : 'N/A';
        drawHorizontalSection(y, 'VEHICLE', vehicleInfo, 'PLATE', trip.assignedVehicle?.licensePlate || 'N/A');

        y -= 25;
        page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 0.5 });
        y -= 20;

        // --- Members Section ---
        page.drawText('MEMBER INFORMATION', { x: 50, y, size: 10, font: boldFont });
        y -= 15;

        (trip.tripMembers || []).forEach((tm, i) => {
            const member = tm.member;
            const memberText = `${i + 1}. ${member.firstName} ${member.lastName} (ID: ${member.memberId}) DOB: ${new Date(member.dateOfBirth).toLocaleDateString()}`;
            page.drawText(memberText, { x: 60, y, size: 9, font });
            y -= 12;
        });

        y -= 20;
        page.drawRectangle({
            x: 40,
            y: y - 5,
            width: width - 80,
            height: 20,
            color: rgb(0.9, 0.9, 0.9),
        });

        // --- Table Headers ---
        const tableY = y;
        page.drawText('STOP', { x: 45, y: tableY, size: 8, font: boldFont });
        page.drawText('TYPE', { x: 80, y: tableY, size: 8, font: boldFont });
        page.drawText('ADDRESS', { x: 130, y: tableY, size: 8, font: boldFont });
        page.drawText('SCHED', { x: 300, y: tableY, size: 8, font: boldFont });
        page.drawText('ACTUAL', { x: 350, y: tableY, size: 8, font: boldFont });
        page.drawText('ODO', { x: 400, y: tableY, size: 8, font: boldFont });
        page.drawText('SIGNATURE', { x: 470, y: tableY, size: 8, font: boldFont });

        y -= 20;

        // --- Render Stops ---
        const sortedStops = (trip.tripStops || []).sort((a, b) => a.stopOrder - b.stopOrder);
        for (let index = 0; index < sortedStops.length; index++) {
            const stop = sortedStops[index];
            page.drawText(`${index + 1}`, { x: 50, y, size: 8, font });
            page.drawText(`${stop.stopType}`, { x: 80, y, size: 7, font });
            page.drawText(`${stop.address.substring(0, 35)}`, { x: 130, y, size: 7, font });
            page.drawText(stop.scheduledTime ? new Date(stop.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A', { x: 300, y, size: 7, font });
            page.drawText(stop.actualArrivalTime ? new Date(stop.actualArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---', { x: 350, y, size: 7, font });
            page.drawText(stop.odometerReading?.toString() || '---', { x: 400, y, size: 7, font });

            // Signature line / Image
            page.drawLine({ start: { x: 460, y: y - 2 }, end: { x: 560, y: y - 2 }, thickness: 0.5 });

            // Find member signature for this stop
            const memberAtStop = trip.tripMembers?.find(tm => tm.pickupStopId === stop.id || tm.dropoffStopId === stop.id);
            if (memberAtStop?.memberSignatureBase64) {
                try {
                    const signatureImageBytes = memberAtStop.memberSignatureBase64.split(',')[1];
                    const signatureImage = await pdfDoc.embedPng(Buffer.from(signatureImageBytes, 'base64'));
                    const sigDims = signatureImage.scale(0.12); // Scale down
                    page.drawImage(signatureImage, {
                        x: 465,
                        y: y - 2,
                        width: sigDims.width,
                        height: sigDims.height,
                    });
                } catch (e) {
                    console.error('Failed to embed signature image', e);
                }
            }

            y -= 18;

            // Check if we need a new page (safety)
            if (y < 80 && index < sortedStops.length - 1) {
                // Simplified pagination for demo: stop rendering if out of space
                break;
            }
        }

        // --- Certification & Signatures ---
        y -= 40;
        page.drawText('CERTIFICATION: I certify that the information provided on this form is true, accurate, and complete.', {
            x: 50, y, size: 7, font: font,
        });

        y -= 50;
        page.drawLine({ start: { x: 50, y }, end: { x: 250, y }, thickness: 0.5 });
        page.drawText('Driver Signature', { x: 50, y: y - 10, size: 8, font });

        page.drawLine({ start: { x: 320, y }, end: { x: 520, y }, thickness: 0.5 });
        page.drawText('Date Signed', { x: 320, y: y - 10, size: 8, font });

        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
    }
}
