
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function findProviderField() {
    const inputPath = path.join(process.cwd(), 'frontend/public/AHCCCSDailyTripReportFinal NEW.pdf');
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    const fields = form.getFields();
    console.log('--- Scanning for NEMT / Header fields ---');
    fields.forEach(f => {
        const name = f.getName();
        // Check for keywords or just list the first few fields which are usually at the top
        if (name.includes('NEMT') || name.includes('AHCCCS') || name.length > 30) {
            console.log(`Candidate: '${name}'`);
        }
    });

    // Also print the first 5 fields just in case
    console.log('--- First 5 fields ---');
    for (let i = 0; i < 5; i++) {
        if (fields[i]) console.log(`#${i}: ${fields[i].getName()}`);
    }
}

findProviderField();
