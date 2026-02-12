
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function dumpFields() {
    const inputPath = path.join(process.cwd(), 'frontend/public/AHCCCSDailyTripReportFinal (1).pdf');
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields().map(f => {
        return `[${f.constructor.name}] ${f.getName()}`;
    });

    fields.sort();
    console.log(fields.join('\n'));
}

dumpFields().catch(err => console.error(err));
