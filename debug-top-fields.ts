
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function debugTopFields() {
    const inputPath = path.join(process.cwd(), 'frontend/public/AHCCCSDailyTripReportFinal NEW.pdf');
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    const fields = form.getFields();
    const results = [];

    fields.forEach(f => {
        try {
            const widgets = f.acroField.getWidgets();
            const rect = widgets[0].getRectangle();
            // Only top fields
            if (rect.y > 600) {
                results.push({ name: f.getName(), x: rect.x, y: rect.y, w: rect.width, h: rect.height });
            }
        } catch (e) { }
    });

    results.sort((a, b) => b.y - a.y);

    console.log('--- TOP FIELDS (Y > 600) ---');
    results.forEach(r => {
        console.log(`[${r.name}] @ (${r.x.toFixed(0)}, ${r.y.toFixed(0)}) W=${r.w.toFixed(0)} H=${r.h.toFixed(0)}`);
    });
}

debugTopFields();
