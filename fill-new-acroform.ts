
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function fill() {
    const inputPath = path.join(process.cwd(), 'frontend/public/AHCCCSDailyTripReportFinal NEW.pdf');
    const outputPath = path.join(process.cwd(), 'filled-all-new-form.pdf');

    console.log(`Loading PDF from: ${inputPath}`);
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // Helper to safely set text
    const setText = (name, value) => {
        try {
            const field = form.getTextField(name);
            field.setText(value);
            console.log(`Filled [${name}] with "${value}"`);
        } catch (e) {
            console.log(`Skipped [${name}]: ${e.message}`);
        }
    };

    const setTextCheckbox = (name, value) => {
        // "Checkboxes" are text fields. Center 'X' with spaces.
        try {
            const field = form.getTextField(name);
            const centeredValue = value ? "   X" : ""; // 3 spaces for approx centering
            field.setText(centeredValue);
            console.log(`Filled "Checkbox" [${name}] with "${centeredValue}"`);
        } catch (e) {
            console.log(`Skipped "Checkbox" [${name}]: ${e.message}`);
        }
    }

    // Header Data
    setText('Drivers Name', 'John Doe');
    setText('Date', '2026-02-03');
    setText('Vehicle LicenseFleet ID', 'ABC-1234');
    setText('Vehicle Make  Color', 'Toyota Sienna / White');
    setText('Vehicle Type', 'Van');
    setText('AHCCCS', 'A12345678');
    setText('Date of Birth', '1980-01-01');
    setText('Member Name', 'Jane Smith');
    setText('Mailing Address', '123 Main St, Phoenix, AZ 85001');

    // "Checkbox" fields
    setTextCheckbox('WHEELVHAIR VAN', 'X');
    setTextCheckbox('TAXI', '');
    setTextCheckbox('BUS', '');
    setTextCheckbox('STRETCHER CAR', '');
    setTextCheckbox('OTHER', '');
    setTextCheckbox('Other List type', '');
    setTextCheckbox('MULTIPLEMEBMBER­_YES', 'X');
    setTextCheckbox('MULTIPLEMEBMBER­_NO', '');
    setTextCheckbox('SAMEPICK_YES', 'X');
    setTextCheckbox('SAMEPICKUP_NO', '');

    // Helper to get field name with 1-based index suffix handling
    const getField = (base, index) => {
        if (index === 1) return base;
        return `${base}_${index}`;
    };

    const fillTrip = (index, data) => {
        // Time Fields -> AMPM fields (X~450)
        const pickupIdx = (index - 1) * 2 + 1;
        const dropoffIdx = pickupIdx + 1;

        setText(`AMPM${pickupIdx}`, data.pickupTime);
        setText(`AMPM${dropoffIdx}`, data.dropoffTime);

        // Odometer Fields -> Odometerampm fields (X~500)
        setText(getField('PickUp Odometerampm', index), data.pickupOdo);
        setText(getField('DropOff Odometerampm', index), data.dropoffOdo);

        // Miles -> Trip Milesampm (X~550)
        setText(getField('Trip Milesampm', index), data.miles);

        // Reason
        setText(getField('Reason for Visit', index), data.reason);

        // Address
        const ordinal = ["1st", "2nd", "3rd", "4th", "5th", "6th"][index - 1];
        const pickupField = `${ordinal} PickUp Location Physical Address City  Zip Code or Geographical CoordinatesLandmark if No Address AvailableRow1`;
        const dropoffField = `${ordinal} DropOff Location Physical Address City  Zip Code or Geographical CoordinatesLandmark if No Address AvailableRow1`;
        setText(pickupField, data.pickupAddr);
        setText(dropoffField, data.dropoffAddr);

        // Trip Type Metadata
        if (index === 1) {
            setTextCheckbox('Type of Trip Round Trip', 'X');
            setTextCheckbox('One Way', '');
            setTextCheckbox('Multiple Stops', '');
        } else {
            setTextCheckbox(getField('Type of Trip Round Trip', index), 'X');
            setTextCheckbox(getField('One Way', index), '');
            setTextCheckbox(getField('Multiple Stops', index), '');
        }

        // Escort
        setText(getField('Name of Escort', index), 'N/A');
        setText(getField('Relationship', index), 'N/A');
    };

    // Fill all 6 trips
    for (let i = 1; i <= 6; i++) {
        fillTrip(i, {
            pickupTime: '08:00', // Just time, assuming AM/PM is implicit or not needed in this box? Or "08:00 AM"? User said "PUT THE TIMES IN THE CORRECT PLACES".
            dropoffTime: '08:30', // "AMPM" name suggests it might just be checks, but dimensions (W~50) allow text. I'll put time.
            pickupOdo: '10000',
            dropoffOdo: '10015',
            miles: '15',
            reason: `Trip ${i} Reason`,
            pickupAddr: `123 Home St, Trip ${i}`,
            dropoffAddr: `456 Clinic Way, Trip ${i}`
        });
    }

    // Signatures
    setText('Signature1_es_:signer:signature', 'Driver Signature');
    setText('Signature2_es_:signer:signature', 'Member Signature');
    setText('Date_2', '2026-02-03');
    setText('page', '1');
    setText('of', '1');

    // Member 2 info
    setText('Member Name_2', 'Member 2 Name');
    setText('AHCCCS_2', 'B87654321');
    setText('Date of Birth_2', '1990-01-01');

    // Additional info field
    setText('Additional Information', 'Tested All Fields Filling - Version 3');

    const pdfBytesSaved = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytesSaved);
    console.log(`Saved filled PDF to: ${outputPath}`);
}

fill().catch(err => console.error(err));
