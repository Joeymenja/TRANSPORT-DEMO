
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function checkAMPM() {
    const inputPath = path.join(process.cwd(), 'frontend/public/AHCCCSDailyTripReportFinal (1).pdf');
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields().map(f => f.getName());

    const ampm = fields.filter(n => /AM|PM|am|pm/.test(n));
    console.log("AM/PM Fields:", ampm);

    const timeFields = fields.filter(n => /time|Time/.test(n));
    console.log("Time Fields:", timeFields);
}

checkAMPM().catch(console.error);
