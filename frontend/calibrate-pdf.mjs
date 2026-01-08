import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';

async function generateCalibrationGrid() {
    const existingPdfBytes = fs.readFileSync('./public/AHCCCS_Daily_Trip_Report_Final.pdf');
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Draw a grid with labels
    for (let x = 0; x <= width; x += 50) {
        firstPage.drawLine({
            start: { x: x, y: 0 },
            end: { x: x, y: height },
            thickness: 0.5,
            color: rgb(0.8, 0.8, 0.8),
        });
        firstPage.drawText(x.toString(), { x: x, y: 10, size: 8, font });
    }

    for (let y = 0; y <= height; y += 50) {
        firstPage.drawLine({
            start: { x: 0, y: y },
            end: { x: width, y: y },
            thickness: 0.5,
            color: rgb(0.8, 0.8, 0.8),
        });
        firstPage.drawText(y.toString(), { x: 10, y: y, size: 8, font });
    }

    // 10px sub-grid
    for (let x = 0; x <= width; x += 10) {
        if (x % 50 === 0) continue;
        firstPage.drawLine({
            start: { x: x, y: 0 },
            end: { x: x, y: height },
            thickness: 0.1,
            color: rgb(0.9, 0.9, 0.9),
        });
    }
    for (let y = 0; y <= height; y += 10) {
        if (y % 50 === 0) continue;
        firstPage.drawLine({
            start: { x: 0, y: y },
            end: { x: width, y: y },
            thickness: 0.1,
            color: rgb(0.9, 0.9, 0.9),
        });
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('./public/CALIBRATION_GRID.pdf', pdfBytes);
    console.log('✓ CALIBRATION_GRID.pdf generated in public/');
}

generateCalibrationGrid();
