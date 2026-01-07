import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';

async function instrumentFinal() {
    const pdfBytes = fs.readFileSync('frontend/public/AHCCCS_Daily_Trip_Report_Final.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Helper to add field
    const addField = (pageIndex, name, x, y, width, heightVal, fontSize = 9) => {
        const page = pages[pageIndex];
        const { height } = page.getSize();
        const textField = form.createTextField(name);
        textField.setText('');
        textField.addToPage(page, { 
            x, 
            y: height - y, 
            width, 
            height: heightVal,
            textColor: rgb(0, 0, 0),
            backgroundColor: rgb(1, 1, 1),
            borderWidth: 0,
            font
        });
        textField.setFontSize(fontSize);
    };

    console.log('Instrumenting AHCCCS_Daily_Trip_Report_Final.pdf (2 Pages)...');

    // --- PAGE 1 ---
    
    // Provider Section
    addField(0, 'provider_name', 115, 62, 200, 12);
    addField(0, 'provider_id', 340, 62, 120, 12);
    addField(0, 'provider_address', 115, 78, 440, 12, 8);
    addField(0, 'provider_phone', 115, 94, 200, 12);

    // Driver/Vehicle Section
    addField(0, 'driver_name', 115, 122, 200, 12);
    addField(0, 'service_date', 340, 122, 100, 12);
    addField(0, 'vehicle_id', 115, 138, 120, 12);
    addField(0, 'vehicle_make', 340, 138, 120, 12);
    addField(0, 'vehicle_type', 115, 154, 120, 12);

    // Member Info
    addField(0, 'member_name', 115, 182, 200, 12);
    addField(0, 'member_id', 340, 182, 120, 12);
    addField(0, 'member_dob', 475, 182, 80, 12);
    addField(0, 'member_address', 115, 198, 440, 12, 8);

    // Trip 1
    addField(0, 'pickup_1', 115, 235, 250, 12, 8);
    addField(0, 'pickup_time_1', 395, 235, 60, 12);
    addField(0, 'odo_start_1', 475, 235, 70, 12);
    addField(0, 'dropoff_1', 115, 255, 250, 12, 8);
    addField(0, 'dropoff_time_1', 395, 255, 60, 12);
    addField(0, 'odo_end_1', 475, 255, 70, 12);
    addField(0, 'visit_reason_1', 115, 275, 200, 12, 8);

    // --- PAGE 2 ---
    // (Repeating Member Info at top)
    addField(1, 'pg2_member_name', 115, 50, 200, 12);
    addField(1, 'pg2_member_id', 340, 50, 120, 12);
    
    // Signatures
    addField(1, 'member_sig_date', 115, 540, 100, 12);
    addField(1, 'driver_sig_date', 340, 540, 100, 12);

    const outBytes = await pdfDoc.save();
    fs.writeFileSync('frontend/public/OFFICIAL_AHCCCS_FILLABLE.pdf', outBytes);
    console.log('Created OFFICIAL_AHCCCS_FILLABLE.pdf');
}

instrumentFinal().catch(console.error);
