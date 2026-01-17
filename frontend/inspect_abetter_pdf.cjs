const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function listFields() {
    const pdfPath = './public/AbetterEditedPDF.pdf';
    console.log('Inspecting:', pdfPath);
    
    if (!fs.existsSync(pdfPath)) {
        console.error('PDF file not found at:', pdfPath);
        process.exit(1);
    }
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log('Fields found in PDF:');
    fields.forEach(field => {
        const type = field.constructor.name;
        const name = field.getName();
        console.log(`- "${name}" (${type})`);
    });
}

listFields().catch(err => {
    console.error(err);
    process.exit(1);
});
