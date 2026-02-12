const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function check() {
    const pdfPath = path.join(process.cwd(), 'filled-github-updated.pdf');
    try {
        const bytes = fs.readFileSync(pdfPath);
        const doc = await PDFDocument.load(bytes);
        console.log(`PDF LOAD SUCCESS: ${doc.getPageCount()} pages found.`);
    } catch (e) {
        console.error('PDF LOAD FAILED: Not a valid PDF or corrupted.');
        console.error(e);
    }
}
check();
