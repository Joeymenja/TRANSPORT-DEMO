import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';

async function instrument2021() {
    const pdfBytes = fs.readFileSync('frontend/public/NEMT_DailyTripReport2021.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const page = pdfDoc.getPages()[0];
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Helper to create a text field
    const addField = (name, x, y, width, heightVal, fontSize = 9) => {
        const textField = form.createTextField(name);
        textField.setText('');
        textField.addToPage(page, { 
            x, 
            y: height - y, 
            width, 
            height: heightVal,
            textColor: rgb(0, 0, 0),
            backgroundColor: rgb(1, 1, 1), // Opaque white background
            borderWidth: 0,
            font
        });
        textField.setFontSize(fontSize);
    };

    console.log('Adding "Bank-Grade" AcroForm fields to 2021 AHCCCS PDF...');

    // These coordinates are estimated for the 2021 layout. 
    // I will tune them in the next step based on common AHCCCS layouts.
    
    // Header
    addField('date', 450, 60, 100, 12);

    // Section 1: Member Info
    addField('member_name', 115, 137, 220, 12);
    addField('member_id', 340, 137, 125, 12);
    addField('member_dob', 472, 137, 85, 12);
    addField('member_address', 115, 157, 440, 12, 8);

    // Section 2: Trip Details (Pickup)
    addField('pickup_address', 105, 226, 285, 12, 8);
    addField('pickup_time', 395, 226, 60, 12);
    
    // Section 2: Trip Details (Dropoff)
    addField('dropoff_address', 105, 256, 285, 12, 8);
    addField('dropoff_time', 395, 256, 60, 12);

    // Odometer & Miles
    addField('odo_start', 145, 306, 80, 12);
    addField('odo_end', 245, 306, 80, 12);
    addField('odo_total', 345, 306, 85, 12);

    // Driver/Vehicle
    addField('driver_name', 115, 346, 175, 12);
    addField('vehicle_number', 295, 346, 100, 12);

    // Signatures (Hidden fields for data, though we'll still draw images for visual)
    addField('sig_date_client', 100, 565, 100, 10, 7);
    addField('sig_date_driver', 345, 565, 100, 10, 7);

    const instrumentedBytes = await pdfDoc.save();
    fs.writeFileSync('frontend/public/AHCCCS_2021_FILLABLE.pdf', instrumentedBytes);
    console.log('Successfully created AHCCCS_2021_FILLABLE.pdf');
}

instrument2021().catch(console.error);
