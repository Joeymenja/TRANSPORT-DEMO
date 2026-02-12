
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function debugMulti() {
    const inputPath = path.join(process.cwd(), 'frontend/public/AHCCCSDailyTripReportFinal NEW.pdf');
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    const fields = form.getFields();
    console.log('--- Multi/Same Field Scan ---');
    fields.forEach(f => {
        const name = f.getName();
        if (name.includes('MULT') || name.includes('SAME') || name.includes('YES') || name.includes('NO')) {
            const type = f.constructor.name;
            try {
                const widgets = f.acroField.getWidgets();
                const rect = widgets[0].getRectangle();
                console.log(`[${name}] Type: ${type} @ (${rect.x.toFixed(0)}, ${rect.y.toFixed(0)}) W=${rect.width} H=${rect.height}`);
            } catch (e) {
                console.log(`[${name}] Type: ${type} (No Rect)`);
            }
        }
    });
}

debugMulti();
