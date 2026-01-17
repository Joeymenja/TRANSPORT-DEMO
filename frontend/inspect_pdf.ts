import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

async function listFields() {
    const pdfBytes = fs.readFileSync('public/new_form.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log('--- Fields in PDF ---');
    fields.forEach(field => {
        const type = field.constructor.name;
        const name = field.getName();
        console.log(`${name} [${type}]`);
    });
}

listFields();
