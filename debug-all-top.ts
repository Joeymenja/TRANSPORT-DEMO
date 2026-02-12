
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function debugAllTop() {
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
            results.push({ name: f.getName(), x: rect.x, y: rect.y, w: rect.width, h: rect.height });
        } catch (e) {
            // console.log(`No rect for ${f.getName()}`);
        }
    });

    // Sort by Y Descending
    results.sort((a, b) => b.y - a.y);

    console.log('--- ALL TOP FIELDS (First 30) ---');
    results.slice(0, 30).forEach(r => {
        console.log(`[${r.name}] @ (${r.x.toFixed(0)}, ${r.y.toFixed(0)}) W=${r.w.toFixed(0)} H=${r.h.toFixed(0)}`);
    });
}

debugAllTop();
