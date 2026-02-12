const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const files = [
    'frontend/public/NATIVE TRIP REPORT rough acroform.pdf'
];

async function checkPdfs() {
    for (const file of files) {
        try {
            const pdfBytes = fs.readFileSync(file);
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const form = pdfDoc.getForm();
            const fields = form.getFields();

            console.log(`\nFile: ${file}`);
            console.log(`Field Count: ${fields.length}`);
            fields.forEach(f => console.log(f.getName()));
        } catch (e) {
            console.log(`\nFile: ${file} - Error: ${e.message}`);
        }
    }
}

checkPdfs();
