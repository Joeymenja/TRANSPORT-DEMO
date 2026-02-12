const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function inspectPdf() {
    try {
        const pdfBytes = fs.readFileSync('backend/services/transport-service/test-output.pdf');
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();
        const fields = form.getFields();

        console.log(`Inspecting ${fields.length} fields...`);

        fields.forEach(field => {
            const name = field.getName();
            const widgets = field.acroField.getWidgets();

            widgets.forEach((widget, index) => {
                const mk = widget.dict.get(PDFDocument.load(pdfBytes).then().context?.obj('MK')); // This access is tricky in pure JS without proper context exports
                // Simplified check: iterate entries

                let hasBG = false;
                const mkDict = widget.dict.get('MK');
                if (mkDict) {
                    const bg = mkDict.get('BG');
                    if (bg) hasBG = true;
                }

                console.log(`Field: ${name} [Widget ${index}] -> Has Background Color: ${hasBG}`);
            });
        });

    } catch (error) {
        // Fallback to text string check if dict access fails
        console.log('Inspecting via string match...');
        const rawPdf = fs.readFileSync('backend/services/transport-service/test-output.pdf', 'utf8');
        const hasBgColor = rawPdf.includes('/BG [');
        console.log(`Contains BG color instruction: ${hasBgColor}`);
        // Note: FlateDecode might hide this, but it's a quick check.
    }
}

inspectPdf();
