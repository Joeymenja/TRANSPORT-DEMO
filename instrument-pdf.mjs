import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';

async function instrumentPdf() {
    const pdfBytes = fs.readFileSync('frontend/public/NATIVE TRIP REPORT.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const page = pdfDoc.getPages()[0];
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Helper to create a text field
    const addField = (name, x, y, width, heightVal, fontSize = 10) => {
        const textField = form.createTextField(name);
        textField.setText('');
        textField.addToPage(page, { 
            x, 
            y: height - y, 
            width, 
            height: heightVal,
            textColor: rgb(0, 0, 0),
            backgroundColor: rgb(1, 1, 1), // This achieves the "fill" look natively
            borderWidth: 0,
            font
        });
        textField.setFontSize(fontSize);
    };

    console.log('Adding AcroForm fields to NATIVE TRIP REPORT.pdf...');

    // Section 1: Member Info
    addField('member_name', 115, 131, 220, 13);
    addField('member_id', 345, 131, 120, 13);
    addField('member_dob', 475, 131, 80, 13);
    addField('member_address', 115, 151, 440, 13, 9);

    // Section 2: Trip Details
    addField('pickup_address', 110, 221, 280, 13, 9);
    addField('pickup_time', 395, 221, 60, 13);
    
    addField('dropoff_address', 110, 251, 280, 13, 9);
    addField('dropoff_time', 395, 251, 60, 13);

    // Odometer
    addField('odo_start', 145, 301, 80, 13);
    addField('odo_end', 245, 301, 80, 13);
    addField('odo_total', 345, 301, 80, 13);

    // Driver Info
    addField('driver_name', 115, 341, 180, 13);
    addField('vehicle_id', 295, 341, 100, 13);

    // Save as a new "Fillable" version
    const instrumentedBytes = await pdfDoc.save();
    fs.writeFileSync('frontend/public/NATIVE TRIP REPORT FILLABLE.pdf', instrumentedBytes);
    console.log('Successfully created NATIVE TRIP REPORT FILLABLE.pdf with 14 interactive fields.');
}

instrumentPdf().catch(console.error);
