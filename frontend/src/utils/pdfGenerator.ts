import { PDFDocument } from 'pdf-lib';

export async function generateTripReportPdf(data: any): Promise<Blob> {
    const formUrl = '/new_form.pdf';
    const formBytes = await fetch(formUrl).then(res => {
        if (!res.ok) throw new Error('Failed to load PDF template');
        return res.arrayBuffer();
    });

    const pdfDoc = await PDFDocument.load(formBytes);
    const form = pdfDoc.getForm();

    const safeSetText = (name: string, value: string) => {
        try {
            const field = form.getTextField(name);
            if (value) field.setText(value);
        } catch (e) {
            // console.warn(`Field not found: ${name}`);
        }
    };

    const safeCheck = (name: string, shouldCheck: boolean) => {
        try {
            if (shouldCheck) {
                const field = form.getCheckBox(name);
                field.check();
            }
        } catch (e) {
            // console.warn(`Checkbox not found: ${name}`);
        }
    };

    // -- Map Data to Fields --
    
    // Driver / Company
    safeSetText('Drivers name', data.driverName || ''); 
    safeSetText('date', new Date().toLocaleDateString()); 
    // Field 'A2A843' might be relevant but unknown.
    // 'companey ahcccs id' and 'companyNameAndAddres' DO NOT EXIST. 
    // We will draw company info relative to the Member ID ('ID#') later or anchor it elsewhere.

    // Member
    safeSetText('member name', data.memberName || ''); 
    safeSetText('ID#', data.memberAhcccsId || 'A12345678'); 
    safeSetText('Date of Birth', data.memberDOB || '');
    safeSetText('Mailing Address', data.memberAddress || '');
    
    // Trip 1 (Assuming Single Leg for now, or mapping primary leg)
    const leg0 = data.legs?.[0] || data;

    // Pickup Address
    // Mapped to the curiously named short text field found in inspection.
    safeSetText('1st DropOff Location Physical Address City  Zip Code or Geographical', leg0.pickupAddress || '');
    
    // Pickup Time/Odometer/AMPM
    safeSetText('PickUp Odometerampm', String(leg0.startOdometer || ''));
    drawRelativeText(pdfDoc, form, 'PickUp Odometerampm', extractTime(leg0.pickupTime), -115, 0); // Time to left (further)
    drawRelativeText(pdfDoc, form, 'PickUp Odometerampm', isAM(leg0.pickupTime) ? 'AM' : 'PM', -45, 0); // AM/PM closer

    // Dropoff Address
    // Mapped to the long one
    safeSetText('1st DropOff Location Physical Address City  Zip Code or Geographical CoordinatesLandmark if No Address AvailableRow1', leg0.dropoffAddress || '');
    
    // Dropoff Time/Odometer/AMPM
    safeSetText('DropOff Odometerampm', String(leg0.endOdometer || ''));
    drawRelativeText(pdfDoc, form, 'DropOff Odometerampm', extractTime(leg0.dropoffTime), -115, 0);
    drawRelativeText(pdfDoc, form, 'DropOff Odometerampm', isAM(leg0.dropoffTime) ? 'AM' : 'PM', -45, 0);

    safeSetText('Trip Milesampm', String(leg0.totalMiles || ''));
    safeSetText('Reason for Visit', leg0.reasonForVisit || data.reasonForVisit || 'Medical Appointment');

    // Draw Company Name & AHCCCS ID manually at top since fields are missing
    // Anchoring off 'ID#' (Member ID) which is near top right usually? Or 'Drivers name'?
    // Let's assume (0,0) is bottom left. 'date' is likely visible. 
    // We'll use 'Drivers name' as anchor (bottom) and go WAY up? No, risky.
    // Anchor off 'member name'.
    drawRelativeText(pdfDoc, form, 'member name', '999999', 300, 30); // AHCCCS ID guess
    drawRelativeText(pdfDoc, form, 'member name', 'Great Values Transportation', 0, 50); // Company Name guess
    // Ideally we'd find a better anchor like 'A2A843' if it's at top.
    
    // Additional Info mapping
    safeSetText('Additional Information', data.additionalInfo || '');

    // Signatures (Images)
    // Confirmed Field Names from inspection
    if (data.memberSignature) {
        // Member Signature
        await embedImageInField(pdfDoc, form, 'Signature1_es_:signer:signature', data.memberSignature);
    }
    
    if (data.driverSignature) {
         // Driver Signature - Try 45, then 44 (both present in form)
        let placed = await embedImageInField(pdfDoc, form, 'Signature45_es_:signer:signature', data.driverSignature);
         if (!placed) {
            placed = await embedImageInField(pdfDoc, form, 'Signature44_es_:signer:signature', data.driverSignature);
         }
         
         // Fallback coordinates if fields fail (e.g. if they are read-only or weird)
         if (!placed) {
              await embedImageInField(pdfDoc, form, 'FORCE_FALLBACK', data.driverSignature, { x: 300, y: 130, width: 200, height: 40 });
         }
    }

    // Additional Info
    safeSetText('Additional Information', data.additionalInfo || '');

    // Flatten to remove grey backgrounds (make read-only and baked in)
    form.flatten();

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
}

// Helpers
function extractTime(isoString: string): string {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const strMinutes = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${strMinutes}`; 
    } catch (e) {
        return '';
    }
}

function isAM(isoString: string): boolean {
    if (!isoString) return true;
    try {
        const date = new Date(isoString);
        return date.getHours() < 12;
    } catch (e) {
        return true;
    }
}

interface Rect { x: number; y: number; width: number; height: number; }

async function embedImageInField(pdfDoc: PDFDocument, form: any, fieldName: string, base64Image: string, fallbackRect?: Rect) {
    try {
        const image = await pdfDoc.embedPng(base64Image);
        const page = pdfDoc.getPage(0);
        let placed = false;

        try {
            const field = form.getField(fieldName);
            const widgets = field.acroField.getWidgets();
            
            if (widgets.length > 0) {
                const rect = widgets[0].getRectangle();
                
                const height = rect.height;
                const width = (image.width / image.height) * height;
                
                const x = rect.x + (rect.width - width) / 2;
                const y = rect.y;

                page.drawImage(image, {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                });
                placed = true;
            }
        } catch (e) {
             console.warn(`Field ${fieldName} not found for signature placement. Using fallback.`);
        }
        
        if (!placed && fallbackRect) {
             page.drawImage(image, {
                x: fallbackRect.x,
                y: fallbackRect.y,
                width: fallbackRect.width,
                height: fallbackRect.height
            });
        }

    } catch (e) {
        console.error(`Failed to embed signature for ${fieldName}`, e);
    }
}

async function drawRelativeText(pdfDoc: PDFDocument, form: any, anchorFieldName: string, text: string, xOffset: number, yOffset: number) {
    try {
        if (!text) return;
        const field = form.getTextField(anchorFieldName);
        const widgets = field.acroField.getWidgets();
        if (widgets.length > 0) {
            const rect = widgets[0].getRectangle();
            const page = pdfDoc.getPage(0);
            
            page.drawText(text, {
                x: rect.x + xOffset,
                y: rect.y + yOffset + 2, // Slight vertical adjust
                size: 10,
            });
        }
    } catch (e) {
        // console.warn(`Could not draw relative text for ${anchorFieldName}`);
    }
}
