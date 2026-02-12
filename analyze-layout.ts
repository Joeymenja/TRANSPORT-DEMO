
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function analyzeLayout() {
    const inputPath = path.join(process.cwd(), 'frontend/public/AHCCCSDailyTripReportFinal NEW.pdf');
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    console.log('Field Layout Analysis (Name | X | Y | Width | Height):');

    const layout = [];

    fields.forEach(f => {
        try {
            const name = f.getName();
            const widgets = f.acroField.getWidgets();
            widgets.forEach(w => {
                const rect = w.getRectangle();
                layout.push({
                    name,
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height
                });
            });
        } catch (e) {
            // some fields might not have widgets or rects easily accessible this way in pdf-lib low-level
        }
    });

    // Sort by Y (descending - top to bottom) then X (ascending - left to right)
    layout.sort((a, b) => {
        if (Math.abs(a.y - b.y) > 5) return b.y - a.y; // Tolerance for row grouping
        return a.x - b.x;
    });

    layout.forEach(l => {
        console.log(`${l.name.padEnd(50)} | X: ${l.x.toFixed(1).padStart(6)} | Y: ${l.y.toFixed(1).padStart(6)} | W: ${l.width.toFixed(1).padStart(5)} | H: ${l.height.toFixed(1).padStart(5)}`);
    });
}

analyzeLayout().catch(console.error);
