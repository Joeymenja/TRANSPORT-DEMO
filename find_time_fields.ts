
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function findTimeFields() {
    const inputPath = path.join(process.cwd(), 'frontend/public/AHCCCSDailyTripReportFinal (1).pdf');
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    console.log(`Scanning ${fields.length} fields for Time/AM/PM candidates...`);

    fields.forEach(f => {
        const name = f.getName();
        const type = f.constructor.name;
        // Check for keywords
        if (/time|am|pm|check|box/i.test(name)) {
            console.log(`MATCH: [${type}] ${name}`);
        }
    });
}

findTimeFields().catch(err => console.error(err));
