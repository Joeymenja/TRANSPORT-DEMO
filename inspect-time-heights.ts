
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function inspectHeights() {
    const inputPath = path.join(process.cwd(), 'frontend/public/AHCCCSDailyTripReportFinal NEW.pdf');
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    console.log('--- Time Field Heights ---');
    for (let i = 1; i <= 24; i++) { // Check enough indices
        const name = `AMPM${i}`;
        try {
            const field = form.getTextField(name);
            const widgets = field.acroField.getWidgets();
            const rect = widgets[0].getRectangle();
            console.log(`${name}: Height = ${rect.height.toFixed(2)}, Width = ${rect.width.toFixed(2)}, Y = ${rect.y.toFixed(2)}`);
        } catch (e) {
            // console.log(`No ${name}`);
        }
    }
}

inspectHeights().catch(console.error);
