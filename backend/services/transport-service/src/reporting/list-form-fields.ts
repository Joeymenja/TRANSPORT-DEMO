import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function listFields(pdfPath: string) {
  const data = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(data);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  console.log('Form fields in', path.basename(pdfPath) + ':');
  fields.forEach(f => {
    console.log('- ', f.getName());
  });
}

const pdfFile = path.resolve(process.cwd(), 'frontend/public/AHCCCS_Daily_Trip_Report_Final.pdf');
listFields(pdfFile).catch(err => console.error('Error:', err));
