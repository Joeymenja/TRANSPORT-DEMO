import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

async function listFields(pdfPath: string) {
  const data = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(data);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  console.log('Form fields in', path.basename(pdfPath) + ':');
  fields.forEach(f => console.log('- ', f.getName()));
}

const pdfFile = path.resolve(process.cwd(), '../../../frontend/public/AHCCCSDailyTripReportFinal (4) (1).pdf');
listFields(pdfFile).catch(err => console.error('Error:', err));
