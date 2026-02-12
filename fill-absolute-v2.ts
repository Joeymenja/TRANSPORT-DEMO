
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function fillAbsoluteV2() {
    const inputPath = path.join(process.cwd(), 'frontend/public/AHCCCSDailyTripReportFinal NEW.pdf');
    // Target the file the user is actually looking at to force update
    const outputPath = path.join(process.cwd(), 'filled-all-new-form.pdf');

    console.log(`Loading PDF from: ${inputPath}`);
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const page = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Helper to draw text centered in a field's rect
    const drawCentered = (fieldName, text, fontSize = 10, yOffset = 0) => {
        try {
            const field = form.getField(fieldName);
            const widget = field.acroField.getWidgets()[0];
            const rect = widget.getRectangle();

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
            // console.log(`Error drawing for ${fieldName}: ${e.message}`);
        }
    };

    // Helper for Time with AM/PM Selection 'X'
    const drawTimeWithSelection = (fieldName, time, ampm) => {
        try {
            const field = form.getField(fieldName);
            const widget = field.acroField.getWidgets()[0];
            const rect = widget.getRectangle();

            // 1. Draw Time (Top 75%)
            const fontSize = 9;
            const textHeight = font.heightAtSize(fontSize);
            const timeWidth = font.widthOfTextAtSize(time, fontSize);

            const timeX = rect.x + (rect.width / 2) - (timeWidth / 2);
            const timeY = rect.y + (rect.height * 0.70) - (textHeight / 2);

            page.drawText(time, {
                x: timeX,
                y: timeY,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
            });

            // 2. Draw 'X' for AM/PM (Bottom 20%)
            const xMark = "X";
            const xSize = 7;
            const xWidth = font.widthOfTextAtSize(xMark, xSize);
            const xHeight = font.heightAtSize(xSize);
            const xY = rect.y + (rect.height * 0.20) - (xHeight / 2);

            let xX_pos;
            if (ampm === 'AM') {
                // Left side (25%)
                xX_pos = rect.x + (rect.width * 0.25) - (xWidth / 2);
            } else {
                // Right side (75%)
                xX_pos = rect.x + (rect.width * 0.75) - (xWidth / 2);
            }

            page.drawText(xMark, {
                x: xX_pos,
                y: xY,
                size: xSize,
                font: font,
                color: rgb(0, 0, 0),
            });

        } catch (e) {
            console.log(`Error drawing time for ${fieldName}: ${e.message}`);
        }
    };

    // Standard Fill Function
    const setText = (name, value) => {
        try {
            form.getTextField(name).setText(value);
        } catch (e) { }
    };

    // Header
    setText('Drivers Name', 'John Doe');
    setText('Date', '2026-02-03');
    setText('Vehicle LicenseFleet ID', 'ABC-1234');
    setText('Vehicle Make  Color', 'Toyota Sienna / White');
    setText('Vehicle Type', 'Van');
    setText('AHCCCS', 'A12345678');
    setText('Date of Birth', '1980-01-01');
    setText('Member Name', 'Jane Smith');
    setText('Mailing Address', '123 Main St, Phoenix, AZ');

    // Checkboxes
    const checkboxes = [
        'WHEELVHAIR VAN', 'MULTIPLEMEBMBER­_YES', 'SAMEPICK_YES',
        'Type of Trip Round Trip'
    ];
    checkboxes.forEach(name => drawCentered(name, 'X', 12));

    // Trips
    const getField = (base, index) => index === 1 ? base : `${base}_${index}`;
    const getAMPM = (index) => `AMPM${(index - 1) * 2 + 1}`;
    const getAMPMDrop = (index) => `AMPM${(index - 1) * 2 + 2}`;

    for (let i = 1; i <= 6; i++) {
        // Time with AM/PM Selection
        drawTimeWithSelection(getAMPM(i), '08:00', 'AM');
        drawTimeWithSelection(getAMPMDrop(i), '08:30', 'AM');

        // Odometer
        setText(getField('PickUp Odometerampm', i), '10000');
        setText(getField('DropOff Odometerampm', i), '10015');

        // Miles
        setText(getField('Trip Milesampm', i), '15');

        // Address
        const ordinal = ["1st", "2nd", "3rd", "4th", "5th", "6th"][i - 1];
        setText(`${ordinal} PickUp Location Physical Address City  Zip Code or Geographical CoordinatesLandmark if No Address AvailableRow1`, '123 Home St');
        setText(`${ordinal} DropOff Location Physical Address City  Zip Code or Geographical CoordinatesLandmark if No Address AvailableRow1`, '456 Clinic Way');

        // Trip Checkboxes
        if (i > 1) {
            try {
                let name = getField('Type of Trip Round Trip', i);
                drawCentered(name, 'X', 12);
            } catch (e) { }
        }

        // Escort & Reason
        setText(getField('Reason for Visit', i), 'Medical');
        setText(getField('Name of Escort', i), 'N/A');
        setText(getField('Relationship', i), 'N/A');
    }

    // Signatures
    setText('Signature1_es_:signer:signature', 'Driver Sig');
    setText('Signature2_es_:signer:signature', 'Member Sig');
    setText('Date_2', '2026-02-03');
    setText('page', '1'); setText('of', '1');

    // Member 2
    setText('Member Name_2', 'Jane Smith');
    setText('AHCCCS_2', 'B87654321');
    setText('Date of Birth_2', '1990-01-01');

    // Additional
    setText('Additional Information', 'Tested Visual V3 - Spacer Tweak');

    const saved = await pdfDoc.save();
    fs.writeFileSync(outputPath, saved);
    console.log(`Saved filled PDF to: ${outputPath}`);
}

fillAbsoluteV2().catch(console.error);
