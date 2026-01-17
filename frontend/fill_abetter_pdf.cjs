const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function fillPdf() {
    const inputPath = './public/AbetterEditedPDF.pdf';
    const outputPath = './public/Filled_AbetterEditedPDF.pdf';

    console.log(`Loading PDF from ${inputPath}...`);
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // -- Sample Data --
    const driver = {
        name: 'John Doe',
        date: '01/14/2026',
        vehicleId: 'V-101',
        vehicleMake: 'Toyota Camry, White',
        companyId: 'AHCCCS-999',
        companyName: 'GVBH Transportation\n123 Transport Lane\nPhoenix, AZ 85001',
        companyPhone: '(602) 555-0199'
    };

    const member = {
        name: 'Jane Smith',
        ahcccsId: 'A12345678',
        dob: '05/20/1980',
        address: '100 Main St, Phoenix, AZ'
    };

    const trip1 = {
        pickupAddr: '100 Main St, Phoenix, AZ 85001',
        dropoffAddr: '500 Medical Dr, Phoenix, AZ 85004',
        pickupTime: '08:00',
        pickupAm: true,
        dropoffTime: '08:30',
        dropoffAm: true,
        reason: 'Dialysis',
        miles: '12.5',
        pickupOdo: '10000',
        dropoffOdo: '10012'
    };

    const trip2 = {
        pickupAddr: '500 Medical Dr, Phoenix, AZ 85004',
        dropoffAddr: '100 Main St, Phoenix, AZ 85001',
        pickupTime: '12:00',
        pickupPm: true,
        dropoffTime: '12:30',
        dropoffPm: true,
        reason: 'Return Home',
        miles: '12.5',
        pickupOdo: '10012',
        dropoffOdo: '10025'
    };

    // -- Fill Fields --

    // Driver / Company Info
    safeSetText(form, 'Drivers Name', driver.name);
    safeSetText(form, 'Date', driver.date);
    safeSetText(form, 'Vehicle LicenseFleet ID', driver.vehicleId);
    safeSetText(form, 'Vehicle Make  Color', driver.vehicleMake);
    safeSetText(form, 'companey ahcccs id', driver.companyId);
    safeSetText(form, 'companyNameAndAddres', driver.companyName);
    safeSetText(form, 'companyPhoneNumber', driver.companyPhone);

    // Member Info
    safeSetText(form, 'Member Name', member.name);
    safeSetText(form, 'AHCCCS', member.ahcccsId);
    safeSetText(form, 'Date of Birth', member.dob);
    safeSetText(form, 'Mailing Address', member.address);

    // Also fill "Page 2" member header if it exists
    safeSetText(form, 'Member Name_2', member.name);
    safeSetText(form, 'AHCCCS_2', member.ahcccsId);
    safeSetText(form, 'Date of Birth_2', member.dob);


    // Trip 1
    safeSetText(form, '1st PickUp Location Physical Address City  Zip Code or Geographical CoordinatesLandmark if No Address AvailableRow1', trip1.pickupAddr);
    safeSetText(form, '1st DropOff Location Physical Address City  Zip Code or Geographical CoordinatesLandmark if No Address AvailableRow1', trip1.dropoffAddr);
    
    safeSetText(form, '1stPickUpTime', trip1.pickupTime);
    if (trip1.pickupAm) safeCheck(form, '1stPickUp_AM');
    if (trip1.pickupPm) safeCheck(form, '1stPickUp_PM');

    safeSetText(form, '1stDropOff_time', trip1.dropoffTime);
    if (trip1.dropoffAm) safeCheck(form, '1stDropOff_AM');
    if (trip1.dropoffPm) safeCheck(form, '1stDropOff_PM');

    safeSetText(form, 'Reason for Visit', trip1.reason);
    safeSetText(form, 'Trip Milesampm', trip1.miles);
    safeSetText(form, 'PickUp Odometer', trip1.pickupOdo);
    safeSetText(form, 'DropOff Odometerampm', trip1.dropoffOdo); // Weird name

    // Trip 2
    safeSetText(form, '2nd PickUp Location Physical Address City  Zip Code or Geographical CoordinatesLandmark if No Address AvailableRow1', trip2.pickupAddr);
    safeSetText(form, '2nd DropOff Location Physical Address City  Zip Code or Geographical CoordinatesLandmark if No Address AvailableRow1', trip2.dropoffAddr);

    safeSetText(form, '2ndPickUP_time', trip2.pickupTime);
    if (trip2.pickupAm) safeCheck(form, '2ndPickUP_AM');
    if (trip2.pickupPm) safeCheck(form, '2ndPickUP_PM');

    safeSetText(form, '2ndDropOff_TIME', trip2.dropoffTime);
    if (trip2.dropoffAm) safeCheck(form, '2ndDropOff_AM');
    if (trip2.dropoffPm) safeCheck(form, '2ndDropOff_PM');

    safeSetText(form, 'Reason for Visit_2', trip2.reason);
    safeSetText(form, 'Trip Milesampm_2', trip2.miles);
    safeSetText(form, 'PickUp Odometer_2', trip2.pickupOdo);
    safeSetText(form, 'DropOff Odometerampm_2', trip2.dropoffOdo);

    // Vehicle Type Checkbox
    safeCheck(form, 'wheelchair van');
    safeCheck(form, 'carPool_Yes');

    // Save
    const pdfOut = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfOut);
    console.log(`PDF filled and saved to ${outputPath}`);
}

function safeSetText(form, name, value) {
    try {
        const field = form.getTextField(name);
        field.setText(value);
    } catch (e) {
        // console.warn(`Could not set text field: ${name}`);
    }
}

function safeCheck(form, name) {
    try {
        const field = form.getCheckBox(name);
        field.check();
    } catch (e) {
        // console.warn(`Could not set checkbox: ${name}`);
    }
}

fillPdf().catch(err => {
    console.error(err);
    process.exit(1);
});
