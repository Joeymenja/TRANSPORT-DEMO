const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function analyzePdf() {
    try {
        const filePath = path.join(__dirname, 'frontend/public/OFFICIAL_AHCCCS_FILLABLE.pdf');
        console.log("Reading PDF from:", filePath);
        
        if (!fs.existsSync(filePath)) {
            console.error("File not found!");
            return;
        }

        const pdfBytes = fs.readFileSync(filePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();
        const fields = form.getFields();

        console.log("\n--- PDF FORM FIELDS ---");
        fields.forEach(field => {
            const name = field.getName();
            // Get widgets to find coordinates
            const widgets = field.acroField.getWidgets();
            
            widgets.forEach((widget, index) => {
                const rect = widget.getRectangle();
                console.log(`Field: "${name}" [Widget ${index}]`);
                console.log(`  Page: ? (Need to map ref, assuming Page 2 if on second page)`); 
                // Note: getRectangle returns { x, y, width, height } relative to bottom-left usually
                console.log(`  Rect: x=${rect.x.toFixed(2)}, y=${rect.y.toFixed(2)}, w=${rect.width.toFixed(2)}, h=${rect.height.toFixed(2)}`);
            });
        });
        
        console.log("\n--- PAGES ---");
        const pages = pdfDoc.getPages();
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
