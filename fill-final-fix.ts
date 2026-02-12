
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function fillFinalFix() {
    const inputPath = path.join(process.cwd(), 'frontend/public/AHCCCSDailyTripReportFinal NEW.pdf');
    const outputPath = path.join(process.cwd(), 'filled-all-new-form.pdf');

    console.log(`Loading PDF from: ${inputPath}`);
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const page = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Absolute Draw Helper with White Background Masking
    const drawCentered = (fieldName, text, fontSize = 10, yOffset = 0, mask = true) => {
        try {
            const field = form.getField(fieldName);
            const widget = field.acroField.getWidgets()[0];
            const rect = widget.getRectangle();

            if (mask) {
                page.drawRectangle({
                    x: rect.x + 1,
                    y: rect.y + 1,
                    width: rect.width - 2,
                    height: rect.height - 2,
                    color: rgb(1, 1, 1),
                    borderColor: rgb(1, 1, 1),
                    borderWidth: 0,
                });
            }

            const textWidth = font.widthOfTextAtSize(text, fontSize);
            const textHeight = font.heightAtSize(fontSize);

            const centerX = rect.x + (rect.width / 2) - (textWidth / 2);
            const centerY = rect.y + (rect.height / 2) - (textHeight / 2) + yOffset;

            page.drawText(text, {
                x: centerX,
                y: centerY,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
            });
            console.log(`Drew '${text}' at ${centerX.toFixed(1)}, ${centerY.toFixed(1)} for ${fieldName}`);
        } catch (e) {
            console.log(`Skipped draw for ${fieldName}: ${e.message}`);
        }
    };

    // Standard Fill Helper
    const setText = (name, value) => {
        try {
            form.getTextField(name).setText(value);
        } catch (e) { }
    };

    // --- FILL CONTENT ---

    // 1. Header (Standard)
    setText('Drivers Name', 'John Doe');
    setText('Date', '2026-02-03');
    setText('Vehicle LicenseFleet ID', 'ABC-1234');
    setText('Vehicle Make  Color', 'Toyota Sienna / White');
    setText('Vehicle Type', 'Van');
    setText('AHCCCS', 'A12345678');
    setText('Date of Birth', '1980-01-01');
    setText('Member Name', 'Jane Smith');
    setText('Mailing Address', '123 Main St, Phoenix');

    // 2. Checkboxes Logic
    // WHEELVHAIR VAN: Large (22pt) - Kept because user liked it
    drawCentered('WHEELVHAIR VAN', 'X', 22, 0, true);

    // Questions: Medium (14pt) - Safe size
    const questionChecks = ['MULTIPLEMEBMBER­_YES', 'SAMEPICK_YES'];
    questionChecks.forEach(name => drawCentered(name, 'X', 14, 0, true));

    // 3. Trips
    const getField = (base, index) => index === 1 ? base : `${base}_${index}`;
    const getAMPM = (index) => `AMPM${(index - 1) * 2 + 1}`;
    const getAMPMDrop = (index) => `AMPM${(index - 1) * 2 + 2}`;

    for (let i = 1; i <= 6; i++) {
        // Time: Full Time, Masked, Font Size 11
        // Absolute positioning worked well for Time before the relative changes. Keeping it.
        drawCentered(getAMPM(i), '08:00 AM', 11, 0, true);
        drawCentered(getAMPMDrop(i), '08:30 AM', 11, 0, true);

        // Odometer (Standard)
        setText(getField('PickUp Odometerampm', i), '10000');
        setText(getField('DropOff Odometerampm', i), '10015');

        // Miles (Standard)
        setText(getField('Trip Milesampm', i), '15');

        // Address (Standard)
        const ordinal = ["1st", "2nd", "3rd", "4th", "5th", "6th"][i - 1];
        setText(`${ordinal} PickUp Location Physical Address City  Zip Code or Geographical CoordinatesLandmark if No Address AvailableRow1`, '123 Home St');
        setText(`${ordinal} DropOff Location Physical Address City  Zip Code or Geographical CoordinatesLandmark if No Address AvailableRow1`, '456 Clinic Way');

        // Trip Checkboxes: STANDARD TEXT FILL
        // Reverted from Relative Draw to Standard Fill to guarantee placement in box.
        // Using "  X" padding to help center it slightly.
        if (i === 1) {
            setText('Type of Trip Round Trip', '   X');
        } else {
            try {
                setText(getField('Type of Trip Round Trip', i), '   X');
            } catch (e) { }
        }

        // Escort/Reason
        setText(getField('Reason for Visit', i), 'Medical');
        setText(getField('Name of Escort', i), 'N/A');
        setText(getField('Relationship', i), 'N/A');
    }

    // 4. Signatures (Standard)
    setText('Signature1_es_:signer:signature', 'Driver Sig');
    setText('Signature2_es_:signer:signature', 'Member Sig');
    setText('Date_2', '2026-02-03');
    setText('page', '1'); setText('of', '1');

    setText('Member Name_2', 'Jane Smith');

    setText('Additional Information', 'Tested Stabilized V10 - Revert Relative');

    const saved = await pdfDoc.save();
    fs.writeFileSync(outputPath, saved);
    console.log(`Saved filled PDF to: ${outputPath}`);
}

fillFinalFix().catch(console.error);
