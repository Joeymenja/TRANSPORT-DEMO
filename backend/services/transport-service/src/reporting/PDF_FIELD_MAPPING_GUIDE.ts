/**
 * AHCCCS PDF FIELD MAPPING & FILLING SOLUTION
 * 
 * This file shows EXACTLY:
 * - Where each field goes on the PDF (X, Y coordinates)
 * - What methods to use to fill each field
 * - How to handle different field types (text, checkbox, signature)
 * - Complete working examples
 */

// ============================================================================
// 1. UNDERSTANDING PDF FIELD MAPPING
// ============================================================================

/**
 * PDF forms have specific locations for each field.
 * You need to know:
 * 
 * 1. X coordinate (horizontal position, in points)
 * 2. Y coordinate (vertical position, in points)
 * 3. Field width and height
 * 4. Field type (text, checkbox, signature image, etc.)
 * 5. Font size and font type
 * 
 * Standard LETTER size PDF:
 * - Width: 612 points (8.5 inches)
 * - Height: 792 points (11 inches)
 * - Margins: typically 30-40 points
 */

// ============================================================================
// 2. COORDINATE SYSTEM FOR AHCCCS FORM
// ============================================================================

/**
 * PDF coordinates start from BOTTOM-LEFT corner:
 * 
 *   (0, 792) ──────────────────── (612, 792)
 *       │                              │
 *       │        PAGE AREA              │
 *       │                              │
 *  (0, 0) ──────────────────── (612, 0)
 * 
 * So if you want to place something at the TOP of the page:
 * - Use Y coordinate around 750-780
 * 
 * If you want something in the MIDDLE:
 * - Use Y coordinate around 396
 * 
 * If you want something NEAR BOTTOM:
 * - Use Y coordinate around 50-100
 */

// ============================================================================
// 3. FIELD MAPPING FOR AHCCCS FORM - THE EXACT LOCATIONS
// ============================================================================

export const AHCCCSFieldMapping = {
  // PROVIDER SECTION (top of form)
  provider_ahcccs_id: { x: 50, y: 730, width: 150, height: 20, fontSize: 11, label: 'AHCCCS ID' },
  provider_name: { x: 50, y: 705, width: 400, height: 20, fontSize: 11, label: 'NAME' },
  provider_address: { x: 50, y: 680, width: 400, height: 20, fontSize: 11, label: 'ADDRESS' },
  provider_phone: { x: 50, y: 655, width: 150, height: 20, fontSize: 11, label: 'PHONE' },

  // DRIVER & VEHICLE SECTION
  driver_name: { x: 50, y: 600, width: 250, height: 20, fontSize: 11, label: "Driver's Name" },
  report_date: { x: 320, y: 600, width: 100, height: 20, fontSize: 11, label: 'Date' },
  vehicle_fleet_id: { x: 50, y: 575, width: 150, height: 20, fontSize: 11, label: 'Vehicle License/Fleet ID' },
  vehicle_make_color: { x: 320, y: 575, width: 200, height: 20, fontSize: 11, label: 'Vehicle Make & Color' },
  vehicle_type_checkbox: {
    wheelchair_van: { x: 50, y: 545, size: 12 },
    taxi: { x: 150, y: 545, size: 12 },
    stretcher_car: { x: 250, y: 545, size: 12 },
    bus: { x: 350, y: 545, size: 12 },
    other: { x: 450, y: 545, size: 12 }
  },

  // MEMBER SECTION
  member_ahcccs_id: { x: 50, y: 480, width: 150, height: 20, fontSize: 11, label: 'AHCCCS #' },
  member_dob: { x: 320, y: 480, width: 150, height: 20, fontSize: 11, label: 'Date of Birth' },
  member_name: { x: 50, y: 455, width: 250, height: 20, fontSize: 11, label: 'Member Name' },
  member_address: { x: 50, y: 430, width: 400, height: 20, fontSize: 11, label: 'Mailing Address' },

  // TRIP LEG 1 - PICK-UP
  pickup_location: { x: 50, y: 360, width: 400, height: 40, fontSize: 10, label: '1st Pick-Up Location' },
  pickup_time: { x: 50, y: 310, width: 80, height: 20, fontSize: 11, label: 'Pick-Up Time' },
  pickup_am_pm: { am: { x: 140, y: 310, checkbox: true }, pm: { x: 180, y: 310, checkbox: true } },
  pickup_odometer: { x: 320, y: 310, width: 100, height: 20, fontSize: 11, label: 'Pick-Up Odometer' },

  // TRIP LEG 1 - DROP-OFF
  dropoff_location: { x: 50, y: 240, width: 400, height: 40, fontSize: 10, label: '1st Drop-Off Location' },
  dropoff_time: { x: 50, y: 190, width: 80, height: 20, fontSize: 11, label: 'Drop-Off Time' },
  dropoff_am_pm: { am: { x: 140, y: 190, checkbox: true }, pm: { x: 180, y: 190, checkbox: true } },
  dropoff_odometer: { x: 320, y: 190, width: 100, height: 20, fontSize: 11, label: 'Drop-Off Odometer' },
  trip_miles: { x: 480, y: 190, width: 80, height: 20, fontSize: 11, label: 'Trip Miles' },

  // TRIP TYPE & REASON
  trip_type: {
    one_way: { x: 50, y: 150, checkbox: true },
    multiple_stops: { x: 150, y: 150, checkbox: true },
    round_trip: { x: 280, y: 150, checkbox: true }
  },
  reason_for_visit: { x: 50, y: 120, width: 400, height: 20, fontSize: 11, label: 'Reason for Visit' },
  escort_name: { x: 50, y: 90, width: 200, height: 20, fontSize: 11, label: 'Name of Escort' },
  escort_relationship: { x: 320, y: 90, width: 150, height: 20, fontSize: 11, label: 'Relationship' }
};

// ============================================================================
// 4. METHODS TO FILL DIFFERENT FIELD TYPES
// ============================================================================

/**
 * METHOD 1: TEXT FIELDS
 * Use for: Names, addresses, dates, reasons, etc.
 */
export function fillTextField(doc, fieldMapping, fieldName, value) {
  const field = fieldMapping[fieldName];
  doc.fontSize(field.fontSize)
    .font('Helvetica')
    .text(value, field.x, field.y, { width: field.width, height: field.height, align: 'left', lineBreak: true });
}

/**
 * METHOD 2: CHECKBOX FIELDS
 * Use for: Vehicle type, trip type, AM/PM, Yes/No
 */
export function drawCheckbox(doc, x, y, size, isChecked) {
  doc.rect(x, y, size, size).stroke();
  if (isChecked) {
    const offset = size * 0.1;
    doc.moveTo(x + offset, y + offset).lineTo(x + size - offset, y + size - offset)
       .moveTo(x + size - offset, y + offset).lineTo(x + offset, y + size - offset).stroke();
  }
}

/**
 * METHOD 3: SIGNATURE IMAGES
 * Use for: Embedding digital signatures
 */
export function embedSignature(doc, x, y, width, height, signatureImageBase64) {
  if (signatureImageBase64) {
    const buffer = Buffer.from(signatureImageBase64, 'base64');
    doc.image(buffer, x, y, { width: width, height: height, fit: 'contain' });
  } else {
    doc.rect(x, y, width, height).stroke();
    doc.fontSize(9).text('(Signature)', x + 5, y + 5);
  }
}
