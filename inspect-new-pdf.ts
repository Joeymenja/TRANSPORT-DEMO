const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function inspect() {
    // Correct path from user (handling spaces)
    const pdfPath = path.join(process.cwd(), 'frontend/public/AHCCCSDailyTripReportFinal NEW more updated.pdf');

    if (!fs.existsSync(pdfPath)) {
        console.error('File not found at:', pdfPath);
        return;
    }

    console.log(`Inspecting PDF: ${pdfPath}`);
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    console.log(`Found ${fields.length} fields. Listing Signature & related fields:`);

    fields.forEach(f => {
        const name = f.getName();
        let pageIdx = -1;
        try {
            const widgets = f.acroField.getWidgets();
            if (widgets.length > 0) {
                // Find which page the first widget is on
                const pages = pdfDoc.getPages();
                for (let i = 0; i < pages.length; i++) {
                    if (pages[i].ref === widgets[0].P()) {
                        pageIdx = i + 1;
                        break;
                    }
                }
            }
        } catch (e) { }

        console.log(`- ${name} (${f.constructor.name}) [Page ${pageIdx}]`);
        // The original code had a filter for 'signature' or 'text' fields to log dimensions.
        // If you want to re-add that, you can uncomment and adjust the following:
        /*
        if (name.toLowerCase().includes('signature') || name.toLowerCase().includes('text')) {
            try {
                const rect = f.acroField.getWidgets()[0].getRectangle();
                console.log(`   Dimensions: ${rect.width.toFixed(2)} x ${rect.height.toFixed(2)} at (${rect.x.toFixed(2)}, ${rect.y.toFixed(2)})`);
            } catch (e) { }
        }
        */
    });
}
inspect().catch(console.error);
