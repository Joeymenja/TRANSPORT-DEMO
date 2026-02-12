
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function fillHybrid() {
    const inputPath = path.join(process.cwd(), 'frontend/public/AHCCCSDailyTripReportFinal NEW.pdf');
    // Target active file directly
    const outputPath = path.join(process.cwd(), 'filled-all-new-form.pdf');

    console.log(`Loading PDF from: ${inputPath}`);
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const page = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 1. Absolute Drawing Helper (Confirmed GOOD for Checkboxes)
    const drawCentered = (fieldName, text, fontSize = 12, yOffset = 0) => {
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

    // 2. Standard Text Fill Helper (Safer for Text/Times)
    const setText = (name, value) => {
        try {
            const f = form.getTextField(name);
            f.setText(value);
            // Optional: Center align text if possible?
            // f.setAlignment(TextAlignment.Center); // requires pdf-lib update or specific support
        } catch (e) { }
    };

    // --- FILLING ---

    // Header (Standard)
    setText('Drivers Name', 'John Doe');
    setText('Date', '2026-02-03');
    setText('Vehicle LicenseFleet ID', 'ABC-1234');
    setText('Vehicle Make  Color', 'Toyota Sienna / White');
    setText('Vehicle Type', 'Van');
    setText('AHCCCS', 'A12345678');
    setText('Date of Birth', '1980-01-01');
    setText('Member Name', 'Jane Smith');
    setText('Mailing Address', '123 Main St, Phoenix, AZ');

    // Checkboxes (Absolute Draw - Verified Good)
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
        // Time (Standard Fill - Safer than drawing)
        // Including 'AM' in text for clarity
        setText(getAMPM(i), '08:00 AM');
        setText(getAMPMDrop(i), '08:30 AM');

        // Odometer
        setText(getField('PickUp Odometerampm', i), '10000');
        setText(getField('DropOff Odometerampm', i), '10015');

        // Miles
        setText(getField('Trip Milesampm', i), '15');

        // Address
        const ordinal = ["1st", "2nd", "3rd", "4th", "5th", "6th"][i - 1];
        setText(`${ordinal} PickUp Location Physical Address City  Zip Code or Geographical CoordinatesLandmark if No Address AvailableRow1`, '123 Home St');
        setText(`${ordinal} DropOff Location Physical Address City  Zip Code or Geographical CoordinatesLandmark if No Address AvailableRow1`, '456 Clinic Way');

        // Trip Checkboxes (Absolute Draw)
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
    setText('Additional Information', 'Tested Hybrid V1 - Abs Checks, Std Time');

    const saved = await pdfDoc.save();
    fs.writeFileSync(outputPath, saved);
    console.log(`Saved filled PDF to: ${outputPath}`);
}

fillHybrid().catch(console.error);
