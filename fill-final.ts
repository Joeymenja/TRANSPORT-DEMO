const { PDFDocument, TextAlignment } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function fillFinal() {
    const inputPath = path.join(process.cwd(), 'frontend/public/AHCCCSDailyTripReportFinal NEW more updated.pdf');
    const outputPath = path.join(process.cwd(), 'filled-example-report.pdf');

    console.log(`Loading PDF from: ${inputPath}`);
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // Standard Fill Helper with Font Size & Auto-Scaling
    const setText = (name, value, fontSize = null, alignment = null, autoSizeRatio = null) => {
        try {
            const field = form.getField(name);
            if (field.constructor.name === 'PDFCheckBox') {
                if (value) field.check();
                else field.uncheck();
            } else {
                const tf = form.getTextField(name);

                // Dynamic Font Sizing based on Box Height
                if (autoSizeRatio) {
                    try {
                        const widgets = field.acroField.getWidgets();
                        const rect = widgets[0].getRectangle();
                        const calculatedSize = rect.height * autoSizeRatio;
                        fontSize = Math.round(calculatedSize * 2) / 2; // Round to nearest 0.5
                        // console.log(`Auto-Sized '${name}': Height ${rect.height.toFixed(2)} -> Font ${fontSize}`);
                    } catch (err) {
                        console.log(`Error calculating height for ${name}, using fallback.`);
                        fontSize = 10; // Fallback
                    }
                }

                if (fontSize) tf.setFontSize(fontSize);
                if (alignment) tf.setAlignment(alignment);
                tf.setText(value);
            }
            console.log(`Filled '${name}' with '${value}'`);
        } catch (e) {
            // console.log(`Field not found: ${name}`);
        }
    };

    // --- FILL CONTENT ---

    // 1. Header
    setText('Drivers Name', 'John Doe');
    setText('Date', '2026-02-03');
    setText('Vehicle LicenseFleet ID', 'ABC-1234');
    setText('Vehicle Make  Color', 'Toyota Sienna / White');
    // setText('Vehicle Type', 'Van'); // REMOVED: This field is actually the Provider Info box

    setText('AHCCCS', 'A12345678');
    setText('Date of Birth', '1980-01-01');
    setText('Member Name', 'Jane Smith');
    setText('Mailing Address', '123 Main St, Phoenix, AZ');

    // Provider Info (Hardcoded) - Fills the box named 'Vehicle Type' (Top Left, 331x73)
    const providerInfo = `AHCCCS ID: 181294
NAME: GREAT VALUES TRANSPORTATION
ADDRESS: 5723 W. PUEBLO AVE PHOENIX 85043-6404
PHONE: 480-678-9426`;
    setText('Vehicle Type', providerInfo, 10);

    // 2. Vehicle Checkboxes - MARK ALL (Stress Test)
    const vehicleCheckStyle = 'X'; // No spaces, use Center align
    const vehicleCheckSize = 20; // Increased size

    setText('WHEELVHAIR VAN', vehicleCheckStyle, vehicleCheckSize, TextAlignment.Center);
    setText('TAXI', vehicleCheckStyle, vehicleCheckSize, TextAlignment.Center);
    setText('BUS', vehicleCheckStyle, vehicleCheckSize, TextAlignment.Center);
    setText('STRETCHER CAR', vehicleCheckStyle, vehicleCheckSize, TextAlignment.Center);
    setText('OTHER', vehicleCheckStyle, vehicleCheckSize, TextAlignment.Center);

    // Multi/Same - Fix Alignment & Size
    // Logic: MULTIPLEMEBMBER_YES is only ~15px high -> Needs 10pt to not touch top.
    //        Others (NO fields, SAMEPICK) are ~22px high -> Can handle 14pt for better visibility.

    setText('MULTIPLEMEBMBER­_YES', 'X', 10, TextAlignment.Center); // Short Box (15px)
    setText('SAMEPICK_YES', 'X', 14, TextAlignment.Center);         // Tall Box (22px)

    // Explicitly fill NO fields - Restoring 14pt as they are 22px tall
    setText('MULTIPLEMEBMBER­_NO', 'X', 14, TextAlignment.Center);
    setText('SAMEPICKUP_NO', 'X', 14, TextAlignment.Center);

    // Member Unable to Sign
    setText('Member is unable to sign Identify the person signing for the member or include members fingerprint', true); // Checkbox

    // --- GEOMETRIC MAPPING HELPER ---
    // Groups fields by approximate Y coordinate to identify visual rows (Trip 1..6)
    const getVisualRows = () => {
        const tripFields = form.getFields().filter(f => {
            const name = f.getName();
            return name.includes('Type of Trip') || name.includes('One Way') || name.includes('Multiple Stops');
        });

        const items = [];
        tripFields.forEach(f => {
            try {
                const rect = f.acroField.getWidgets()[0].getRectangle();
                items.push({ name: f.getName(), x: rect.x, y: rect.y });
            } catch (e) { }
        });

        // Group by Y (within 20 units tolerance)
        const rows = [];
        items.forEach(item => {
            let row = rows.find(r => Math.abs(r.y - item.y) < 20);
            if (!row) {
                row = { y: item.y, fields: [] };
                rows.push(row);
            }
            row.fields.push(item);
        });

        // Sort rows Top-to-Bottom (Descending Y)
        rows.sort((a, b) => b.y - a.y);
        return rows;
    };

    const tripRows = getVisualRows();
    console.log(`Identified ${tripRows.length} trip rows.`);

    // 3. Trips Logic (Dynamic)
    for (let i = 0; i < 6; i++) {
        const tripNum = i + 1; // 1-based index for other lookups

        // A. TIME fields (Standard naming seems reliable based on previous tests, or we could map them too. 
        // But standard naming worked for Time positions, only check boxes were scattered.)
        const name1 = `AMPM${(tripNum - 1) * 2 + 1}`; // e.g. AMPM1
        const name2 = `AMPM${(tripNum - 1) * 2 + 2}`; // e.g. AMPM2

        try {
            // Enable Multiline to force TOP ALIGNMENT (Standard PDF behavior for multiline)
            // Note: Ratio reverted to 0.33
            form.getTextField(name1).enableMultiline();
            form.getTextField(name2).enableMultiline();
        } catch (e) { console.log('Could not enable multiline on time fields'); }

        // Time: Ratio 0.33 (Restored to default per user request)
        setText(name1, '08:00 AM', null, TextAlignment.Center, 0.33);
        setText(name2, '08:30 AM', null, TextAlignment.Center, 0.33);

        // B. Standard Fields (Odometer, Address, Escort) - These seemed reliable
        const getField = (base, index) => index === 1 ? base : `${base}_${index}`;
        setText(getField('PickUp Odometerampm', tripNum), '10000', 10);
        setText(getField('DropOff Odometerampm', tripNum), '10015', 10);
        setText(getField('Trip Milesampm', tripNum), '15');

        const ordinal = ["1st", "2nd", "3rd", "4th", "5th", "6th"][i];
        setText(`${ordinal} PickUp Location Physical Address City  Zip Code or Geographical CoordinatesLandmark if No Address AvailableRow1`, '123 Home St');
        setText(`${ordinal} DropOff Location Physical Address City  Zip Code or Geographical CoordinatesLandmark if No Address AvailableRow1`, '456 Clinic Way');
        setText(getField('Reason for Visit', tripNum), 'Medical');
        setText(getField('Name of Escort', tripNum), 'N/A');
        setText(getField('Relationship', tripNum), 'N/A');

        // C. CHECKBOXES (Geometric - CHECK ALL MODE)
        if (tripRows[i]) {
            const rowFields = tripRows[i].fields;
            // Check EVERY box in this row verify placement
            // Use Explicit Size 22 for these X's (Increased from 20 per user request)
            // Switched to TextAlignment.Center to avoid padding issues with larger font
            rowFields.forEach(field => {
                setText(field.name, 'X', 22, TextAlignment.Center);
                console.log(`Trip ${tripNum}: Stress Checked '${field.name}'`);
            });
        }
    }

    // 4. Signatures
    setText('Signature2_es_:signer:signature', 'Driver Sig');
    setText('Signature1_es_:signer:signature', 'Member Sig');
    setText('Date_2', '2026-02-03');
    // Page 1 Numbering
    setText('page', '1');
    setText('of', '2');
    // Page 2 Numbering
    setText('page_2', '2');
    setText('of_2', '2');

    setText('Member Name_2', 'Jane Smith');
    setText('AHCCCS_2', 'B87654321');
    setText('Date of Birth_2', '1990-01-01');

    setText('Additional Information', 'Standard Fill - Fixed Font Sizes');

    const saved = await pdfDoc.save();
    fs.writeFileSync(outputPath, saved);
    console.log(`Saved filled PDF to: ${outputPath}`);
}

fillFinal().catch(console.error);
