
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function fillAbsolute() {
    const inputPath = path.join(process.cwd(), 'frontend/public/AHCCCSDailyTripReportFinal NEW.pdf');
    const outputPath = path.join(process.cwd(), 'filled-absolute.pdf');

    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();
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
            console.log(`Error drawing for ${fieldName}: ${e.message}`);
        }
    };

    // Helper for Time Stacked (Time on Top, AM/PM on Bottom)
    const drawTimeStacked = (fieldName, time, ampm) => {
        try {
            const field = form.getField(fieldName);
            const widget = field.acroField.getWidgets()[0];
            const rect = widget.getRectangle();

            // Settings
            const fontSize = 8;
            const lineSpacing = 2; // gap

            // Calculate Y positions
            // Top line (Time)
            const timeWidth = font.widthOfTextAtSize(time, fontSize);
            // Bottom line (AMPM)
            const ampmWidth = font.widthOfTextAtSize(ampm, fontSize);
            const textHeight = font.heightAtSize(fontSize);

            const totalHeight = (textHeight * 2) + lineSpacing;
            const startY = rect.y + (rect.height / 2) + (totalHeight / 2) - textHeight;

            // Draw Time (centered X)
            page.drawText(time, {
                x: rect.x + (rect.width / 2) - (timeWidth / 2),
                y: startY,
                size: fontSize,
                font: font
            });

            // Draw AMPM (centered X, below Time)
            page.drawText(ampm, {
                x: rect.x + (rect.width / 2) - (ampmWidth / 2),
                y: startY - textHeight - lineSpacing,
                size: fontSize,
                font: font
            });

        } catch (e) {
            console.log(`Error drawing time for ${fieldName}: ${e.message}`);
        }
    };

    // 1. Text Fields (Use standard fill for long text, it's safer for now, or use absolute if confident?)
    // User didn't complain about addresses. I'll use standard fill for them.
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
    setText('Vehicle Type', 'Van'); // If this is a checkbox? No, 'Vehicle Type' text.
    setText('AHCCCS', 'A12345678');
    setText('Date of Birth', '1980-01-01');
    setText('Member Name', 'Jane Smith');
    setText('Mailing Address', '123 Main St, Phoenix, AZ');

    // Checkboxes (Use DrawCentered "X")
    const checkboxes = [
        'WHEELVHAIR VAN', 'MULTIPLEMEBMBER­_YES', 'SAMEPICK_YES',
        'Type of Trip Round Trip' // Trip 1
    ];
    checkboxes.forEach(name => drawCentered(name, 'X', 12));

    // Trips
    const getField = (base, index) => index === 1 ? base : `${base}_${index}`;
    const getAMPM = (index) => `AMPM${(index - 1) * 2 + 1}`; // Pickup starts at 1, 3, 5...
    const getAMPMDrop = (index) => `AMPM${(index - 1) * 2 + 2}`;

    for (let i = 1; i <= 6; i++) {
        // Time Stacked
        drawTimeStacked(getAMPM(i), '08:00', 'AM');
        drawTimeStacked(getAMPMDrop(i), '08:30', 'AM');

        // Odometer (Standard Fill or Draw? Standard usually centers vertically well enough)
        // I'll use Standard for simplicity unless requested.
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
                // Try to draw X for Trip Type Round Trip
                // Note: Naming issues 'Round Trip_index'
                // I'll try 'Type of Trip Round Trip' + suffix
                let name = getField('Type of Trip Round Trip', i);
                // Verify if field exists? drawCentered catches error.
                drawCentered(name, 'X', 12);
            } catch (e) { }
        }

        // Escort, Reason
        setText(getField('Reason for Visit', i), 'Medical');
    }

    // Signatures
    setText('Signature1_es_:signer:signature', 'Driver Sig');
    setText('Signature2_es_:signer:signature', 'Member Sig');
    setText('Date_2', '2026-02-03');
    setText('page', '1'); setText('of', '1');
    setText('Member Name_2', 'Jane Smith');

    // Flatten to burn text into PDF? 
    // form.flatten(); // This converts fields to content. Good for printing.

    const saved = await pdfDoc.save();
    fs.writeFileSync(outputPath, saved);
    console.log('Done');
}

fillAbsolute().catch(console.error);
