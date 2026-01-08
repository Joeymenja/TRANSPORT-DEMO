const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function listFields() {
    try {
        const pdfBytes = fs.readFileSync('./frontend/public/OFFICIAL_AHCCCS_FILLABLE.pdf');
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        
        console.log('Total fields:', fields.length);
        fields.forEach(field => {
            const type = field.constructor.name;
            const name = field.getName();
            console.log(`- ${name} (${type})`);
        });
    } catch (err) {
        console.error('Error reading PDF:', err);
    }
}

listFields();
