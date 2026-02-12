
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function debugFields() {
    const inputPath = path.join(process.cwd(), 'frontend/public/AHCCCSDailyTripReportFinal NEW.pdf');

    console.log(`Loading PDF from: ${inputPath}`);
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    const fields = form.getFields();
    console.log(`Found ${fields.length} fields. Scanning for Checkboxes...`);

    const results = [];

    fields.forEach(field => {
        const name = field.getName();
        const type = field.constructor.name;

        // We are interested in Trip checkboxes mostly
        if (name.includes('Trip') || name.includes('Way') || name.includes('Stop')) {
            try {
                const widgets = field.acroField.getWidgets();
                widgets.forEach((w, i) => {
                    const rect = w.getRectangle();
                    results.push({
                        name: name,
                        type: type,
                        x: rect.x,
                        y: rect.y, // Y is crucial for row ordering
                        w: rect.width,
                        h: rect.height
                    });
                });
            } catch (e) { }
        }
    });

    // Sort by Y (descending = top to bottom) then X (left to right)
    results.sort((a, b) => b.y - a.y || a.x - b.x);

    console.log('--- SORTED FIELDS (Top to Bottom) ---');
    results.forEach(r => {
        console.log(`[${r.type}] "${r.name}" @ (${r.x.toFixed(1)}, ${r.y.toFixed(1)})`);
    });
}

debugFields().catch(console.error);
