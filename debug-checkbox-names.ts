
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function debugCheckboxes() {
    const inputPath = path.join(process.cwd(), 'frontend/public/AHCCCSDailyTripReportFinal NEW.pdf');
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    const fields = form.getFields();
    console.log('--- Checkbox Search ---');
    fields.forEach(f => {
        const name = f.getName();
        // Filter for potential checkboxes or related keywords based on user request
        if (
            f.constructor.name === 'PDFCheckBox' ||
            name.toLowerCase().includes('sign') ||
            name.toLowerCase().includes('member') ||
            name.toLowerCase().includes('rider') ||
            name.toLowerCase().includes('stretcher') ||
            name.toLowerCase().includes('taxi') ||
            name.toLowerCase().includes('bus') ||
            name.toLowerCase().includes('other')
        ) {
            console.log(`Field: '${name}' [Type: ${f.constructor.name}]`);
        }
    });
}

debugCheckboxes();
