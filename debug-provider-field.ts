
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function findProviderField() {
    const inputPath = path.join(process.cwd(), 'frontend/public/AHCCCSDailyTripReportFinal NEW.pdf');
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    const fields = form.getFields();
    fields.forEach(f => {
        const name = f.getName();
        if (name.toLowerCase().includes('provider') || name.toLowerCase().includes('nemt') || name.toLowerCase().includes('address')) {
            console.log(`Candidate Field: '${name}'`);
        }
    });
}

findProviderField();
