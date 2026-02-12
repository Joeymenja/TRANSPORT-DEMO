const { TextAlignment } = require('pdf-lib');

/**
 * PdfReportService
 * Encapsulates all logic for filling the AHCCCS Daily Trip Report PDF.
 */
class PdfReportService {
    /**
     * @param {import('pdf-lib').PDFForm} form - The AcroForm from pdf-lib
     */
    constructor(form) {
        this.form = form;
    }

    /**
     * Standard Fill Helper
     */
    setText(name, value, fontSize = 10, alignment = null) {
        try {
            const field = this.form.getField(name);
            if (field.constructor.name === 'PDFCheckBox') {
                if (value === true || value === 'X' || value === '   X') field.check();
                else field.uncheck();
            } else {
                const tf = this.form.getTextField(name);
                tf.setFontSize(fontSize);

                // If the value is 'X', ensure it's centered to fit the box well
                if (value === 'X' || value === '   X') {
                    tf.setAlignment(alignment || TextAlignment.Center);
                } else if (alignment) {
                    tf.setAlignment(alignment);
                }

                tf.setText(String(value));
            }
            // console.log(`Filled '${name}'`);
        } catch (e) {
            // console.log(`Field not found or error: ${name}`);
        }
    }

    /**
     * Enables multiline for a text field to force top-alignment.
     */
    enableTopAlignment(fieldName) {
        try {
            const tf = this.form.getTextField(fieldName);
            tf.enableMultiline();
        } catch (e) {
            // console.log(`Could not enable multiline for ${fieldName}`);
        }
    }

    /**
     * Fills the Header section
     */
    fillHeader(data) {
        const { date, driverName, vehicleId, vehicleInfo, memberName, ahcccsId, dob, address, providerInfo } = data;

        this.setText('Drivers Name', driverName);
        this.setText('Date', date);
        this.setText('Vehicle LicenseFleet ID', vehicleId);
        this.setText('Vehicle Make  Color', vehicleInfo);
        this.setText('AHCCCS', ahcccsId);
        this.setText('Date of Birth', dob);
        this.setText('Member Name', memberName);
        this.setText('Mailing Address', address);

        if (providerInfo) {
            this.setText('Vehicle Type', providerInfo, 9);
        }
    }

    /**
     * Fills a specific trip row (1-6)
     */
    fillTrip(index, t) {
        const id = index + 1;
        const suffix = id === 1 ? '' : `_${id}`;

        const namePu = `AMPM${index * 2 + 1}`;
        const nameDo = `AMPM${index * 2 + 2}`;

        // Calculate font size dynamically based on height to match the "perfect" look of Trip 5
        // Trip 5 height is 24.62, font was 8.5 (or slightly smaller for better fit)
        const calculateFontSize = (name) => {
            try {
                const tf = this.form.getTextField(name);
                const widget = tf.acroField.getWidgets()[0];
                const rect = widget.getRectangle();
                // User liked Trip 5 (24.62). Let's use a slightly smaller ratio for perfect centering.
                const ratio = 8.4 / 24.62;
                return Math.round(rect.height * ratio * 2) / 2; // Round to nearest 0.5
            } catch (e) {
                return 8.5; // Fallback
            }
        };

        const fontSizePu = calculateFontSize(namePu);
        const fontSizeDo = calculateFontSize(nameDo);

        // Disabling multiline allows the PDF viewer to center text vertically by default 
        // if the font size is well-proportioned to the box height.
        try {
            this.form.getTextField(namePu).disableMultiline();
            this.form.getTextField(nameDo).disableMultiline();
        } catch (e) { }

        this.setText(namePu, t.pu, fontSizePu, TextAlignment.Center);
        this.setText(nameDo, t.do, fontSizeDo, TextAlignment.Center);

        const getField = (base, idx) => idx === 1 ? base : `${base}_${idx}`;
        this.setText(getField('PickUp Odometerampm', id), t.puOdo);
        this.setText(getField('DropOff Odometerampm', id), t.doOdo);
        this.setText(getField('Trip Milesampm', id), t.miles);

        const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th"];
        const ordinal = ordinals[index];
        this.setText(`${ordinal} PickUp Location Physical Address City  Zip Code or Geographical CoordinatesLandmark if No Address AvailableRow1`, t.puAddr);
        this.setText(`${ordinal} DropOff Location Physical Address City  Zip Code or Geographical CoordinatesLandmark if No Address AvailableRow1`, t.doAddr);

        this.setText(getField('Reason for Visit', id), t.reason);
        this.setText(getField('Name of Escort', id), t.escort || 'N/A');
        this.setText(getField('Relationship', id), t.relationship || 'N/A');

        // Trip Type Checkboxes
        if (t.type === 'One Way') this.setText(`One Way${suffix}`, 'X', 18, TextAlignment.Center);
        if (t.type === 'Round Trip') this.setText(`Type of Trip Round Trip${suffix}`, 'X', 18, TextAlignment.Center);
        if (t.type === 'Multiple Stops') this.setText(`Multiple Stops${suffix}`, 'X', 18, TextAlignment.Center);
    }

    /**
     * Fills Signatures and Footer
     */
    fillFooter(data) {
        const { date, memberName, ahcccsId, dob, driverSig, memberSig, page = '1', of = '1' } = data;

        this.setText('Signature2_es_:signer:signature', driverSig);
        this.setText('Signature1_es_:signer:signature', memberSig);
        this.setText('Date_2', date);
        this.setText('page', page);
        this.setText('of', of);

        // Page 2 specific numbering
        this.setText('page_2', data.page_2 || '2');
        this.setText('of_2', data.of_2 || '2');

        this.setText('Member Name_2', memberName);
        this.setText('AHCCCS_2', ahcccsId);
        this.setText('Date of Birth_2', dob);

        if (data.additionalInfo) {
            this.setText('Additional Information', data.additionalInfo);
        }
    }

    /**
     * Stress test: Fill all checkboxes and empty text fields with 'X'
     */
    stressTestX() {
        const allFields = this.form.getFields();
        allFields.forEach(field => {
            const name = field.getName();

            // EXCLUSIONS: Skip odometer-related fields to avoid clutter next to real values
            // These fields often exist as empty shells next to the 'ampm' versions we use.
            if (name.includes('Odometer') && !name.includes('ampm')) return;
            if (name.includes('Trip Miles') && !name.includes('ampm')) return;
            if (name.includes('PickUp Odometer') && !name.includes('ampm')) return;
            if (name.includes('DropOff Odometer') && !name.includes('ampm')) return;

            // User specifically requested NO X IN MEMBER FINGERPRINT
            if (name.includes('Member Fingerprint')) return;

            try {
                if (field.constructor.name === 'PDFCheckBox') {
                    field.check();
                } else if (field.constructor.name === 'PDFTextField') {
                    const tf = this.form.getTextField(name);
                    if (!tf.getText()) {
                        tf.setText('X');
                        tf.setFontSize(18);
                        tf.setAlignment(TextAlignment.Center);
                    }
                }
            } catch (e) {
                // Ignore errors
            }
        });

        // Ensure unable-to-sign fields are checked if not already
        // Some forms have these as checkboxes or text fields.
        this.setText('Member is unable to sign Identify the person signing for the member or include members fingerprint', 'X', 18, TextAlignment.Center);
    }
}

module.exports = PdfReportService;
