import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function analyzePdf() {
    try {
        const filePath = path.join(__dirname, 'public/OFFICIAL_AHCCCS_FILLABLE.pdf');
        console.log("Reading PDF from:", filePath);
        
        if (!fs.existsSync(filePath)) {
            console.error("File not found!");
            return;
        }

        const pdfBytes = fs.readFileSync(filePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();
        const fields = form.getFields();

        const pages = pdfDoc.getPages();
        const pageRefs = pages.map(p => p.ref);

        console.log("\n--- PDF FORM FIELDS ---");
        fields.forEach(field => {
            const name = field.getName();
            const widgets = field.acroField.getWidgets();
            
            widgets.forEach((widget, index) => {
                const rect = widget.getRectangle();
                
                // Find page index
                const startFunc = new Date().getTime();
                let pageIndex = -1;
                 // Note: widget.P() returns the page reference.
                const pRef = widget.P();
                 
                if (pRef) {
                     pageIndex = pageRefs.findIndex(pr => pr === pRef || (pr.objectNumber === pRef.objectNumber && pr.generationNumber === pRef.generationNumber));
                }

                console.log(`Field: "${name}" [Widget ${index}]`);
                console.log(`  Page Index: ${pageIndex} (Page ${pageIndex + 1})`); 
                console.log(`  Rect: x=${rect.x.toFixed(2)}, y=${rect.y.toFixed(2)}, w=${rect.width.toFixed(2)}, h=${rect.height.toFixed(2)}`);
            });
        });
        
        console.log("\n--- PAGES ---");
        // Reuse existing pages variable
        console.log(`Total Pages: ${pages.length}`);
        pages.forEach((p, i) => {
             const { width, height } = p.getSize();
             console.log(`Page ${i + 1}: ${width}x${height}`);
        });

    } catch (err) {
        console.error("Error analyzing PDF:", err);
    }
}

analyzePdf();
