import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';

async function inspectPdf() {
    try {
        const pdfBytes = fs.readFileSync('backend/services/transport-service/test-output.pdf');
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();
        const fields = form.getFields();

        console.log(`Inspecting ${fields.length} fields...`);

        fields.forEach(field => {
            const name = field.getName();
            // In pdf-lib, visual properties are often on the widget annotations.
            // We can check if specific appearances are set or check the underlying dict.

            // This is a high-level check. A transparent field usually doesn't have a specific background color set in its appearance characteristics (MK dictionary, BG entry).
            const widgets = field.acroField.getWidgets();

            widgets.forEach((widget, index) => {
                const mk = widget.dict.get('MK'); // Appearance characteristics

                let bgInfo = 'Transparent (No BG Color set)';
                if (mk) {
                    // Check if BG entry exists
                    // @ts-ignore
                    const bg = mk.get('BG');
                    if (bg) {
                        bgInfo = `Has Background Color: ${bg.toString()}`;
                    }
                }

                console.log(`Field: ${name} [Widget ${index}] -> Background: ${bgInfo}`);
            });
        });

    } catch (error) {
        console.error('Error inspecting PDF:', error);
    }
}

inspectPdf();
