const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function scan() {
    const dir = path.join(process.cwd(), 'frontend/public');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));

    console.log(`Scanning ${files.length} PDFs in ${dir}...`);

    for (const file of files) {
        try {
            const pdfBytes = fs.readFileSync(path.join(dir, file));
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            const form = pdfDoc.getForm();
            const fields = form.getFields();
            console.log(`[${fields.length.toString().padStart(3)}] fields in ${file}`);
        } catch (e) {
            if (e.message.includes('PDFDocument has no form')) {
                console.log(`[  0] fields in ${file} (No AcroForm)`);
            } else {
                console.log(`[ERR] ${file}: ${e.message}`);
            }
        }
    }
}

scan().catch(err => console.error(err));
