
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function fillBaseline() {
    const inputPath = path.join(process.cwd(), 'frontend/public/AHCCCSDailyTripReportFinal NEW.pdf');
    // Target active file
    const outputPath = path.join(process.cwd(), 'filled-all-new-form.pdf');

    console.log(`Loading PDF from: ${inputPath}`);
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // Standard Fill Helper
    const setText = (name, value) => {
        try {
            const field = form.getField(name);
            // Check if it's a checkbox button or text field
            if (field.constructor.name === 'PDFCheckBox') {
                if (value === 'X' || value === true) field.check();
                else field.uncheck();
            } else {
                // For text fields acting as checkboxes or normal text
                form.getTextField(name).setText(value);
            }
            console.log(`Filled '${name}' with '${value}'`);
        } catch (e) {
            console.log(`Error filling '${name}': ${e.message}`);
        }
    };

    // NOTE: In this specific PDF, many "checkboxes" are actually Text Fields.
    // We used setText('   X') previously. We will stick to that for text-based checks.

    // --- FILL CONTENT ---

    // 1. Header
    setText('Drivers Name', 'John Doe');
    setText('Date', '2026-02-03');
    setText('Vehicle LicenseFleet ID', 'ABC-1234');
    setText('Vehicle Make  Color', 'Toyota Sienna / White');
    setText('Vehicle Type', 'Van');
    setText('AHCCCS', 'A12345678');
    setText('Date of Birth', '1980-01-01');
    setText('Member Name', 'Jane Smith');
    setText('Mailing Address', '123 Main St, Phoenix, AZ');

    // 2. Checkboxes (Vehicle)
    // These are text fields in this form? Let's assume text and use X.
    // Using spaces to center 'X' if possible, or just 'X'.
    // User wants "X" in the box. '   X' usually centers it nicely in these fields.
    setText('WHEELVHAIR VAN', '   X');
    setText('MULTIPLEMEBMBER­_YES', '   X');
    setText('SAMEPICK_YES', '   X');

    // 3. Trips
    const getField = (base, index) => index === 1 ? base : `${base}_${index}`;
    const getAMPM = (index) => `AMPM${(index - 1) * 2 + 1}`;
    const getAMPMDrop = (index) => `AMPM${(index - 1) * 2 + 2}`;

    for (let i = 1; i <= 6; i++) {
        // Time: Full Time
        // Standard fill ensures it stays in box.
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

        // Trip Checkboxes
        // Name: 'Type of Trip Round Trip' (plus suffix for >1)
        if (i === 1) {
            setText('Type of Trip Round Trip', '   X');
        } else {
            setText(getField('Type of Trip Round Trip', i), '   X');
        }

        // Escort/Reason
        setText(getField('Reason for Visit', i), 'Medical');
        setText(getField('Name of Escort', i), 'N/A');
        setText(getField('Relationship', i), 'N/A');
    }

    // 4. Signatures
    setText('Signature1_es_:signer:signature', 'Driver Sig');
    setText('Signature2_es_:signer:signature', 'Member Sig');
    setText('Date_2', '2026-02-03');
    setText('page', '1'); setText('of', '1');

    setText('Member Name_2', 'Jane Smith');
    setText('AHCCCS_2', 'B87654321');
    setText('Date of Birth_2', '1990-01-01');

    setText('Additional Information', 'Tested Baseline Standard Fill');

    const saved = await pdfDoc.save();
    fs.writeFileSync(outputPath, saved);
    console.log(`Saved filled PDF to: ${outputPath}`);
}

fillBaseline().catch(console.error);
