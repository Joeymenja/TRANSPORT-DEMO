import { PDFDocument, rgb } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import { AHCCCSTripReport, TripLeg } from './trip-report-models';

/**
 * Fill the AcroForm PDF template with data from an AHCCCS trip report.
 * The template file is located at `frontend/public/AHCCCSDailyTripReportFinal (4) (1).pdf`.
 * This function writes the populated PDF to `outputPath`.
 */
export async function fillAcroForm(report: AHCCCSTripReport, outputPath: string) {
  const templatePath = path.resolve(
    process.cwd(),
    '../../../frontend/public/AHCCCSDailyTripReportFinal (4) (1).pdf'
  );
  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  // Helper to safely set a text field if it exists
  const safeSet = (fieldName: string, value: string) => {
    try {
      const field = form.getTextField(fieldName);
      field.setText(value);
    } catch (e) {
      // Field not found – ignore
    }
  };

  // Basic fields – map to actual field names from the PDF
  // Basic fields – map to actual field names from the PDF
  safeSet('Drivers Name', report.driver.name);
  safeSet('Vehicle LicenseFleet ID', report.vehicle.fleetId);
  safeSet('Vehicle Make  Color', `${report.vehicle.make} ${report.vehicle.color}`);
  safeSet('Member Name', report.member.name);
  safeSet('Date of Birth', report.member.dateOfBirth.toLocaleDateString());
  safeSet('Date', report.reportDate.toLocaleDateString());
  // Provider fields (if present in the template)
  safeSet('Provider Name', report.provider.name);
  safeSet('Provider Address', report.provider.address);
  safeSet('Provider Phone', report.provider.phoneNumber);
  // Signature placeholders – embed placeholder image and set white background
  try {
    const pngPath = '/Users/joel/.gemini/antigravity/brain/a2d628ec-686b-4341-9bd7-6d93014dfe1f/signature_placeholder_1768338974867.png';
    const pngBytes = fs.readFileSync(pngPath);
    const pngImage = await pdfDoc.embedPng(pngBytes);
    const sigFieldNames = ['Member Signature', 'Driver Signature'];
    for (const name of sigFieldNames) {
      try {
        const field = form.getButton(name);
        field.setImage(pngImage);
        // Make read-only to prevent editing and potentially remove Acrobat highlight
        field.enableReadOnly();
      } catch (e) {
        // fallback to text placeholder if not a button field
        safeSet(name, 'Signed');
      }
    }
  } catch (e) {
    // If placeholder image not found, fallback to text placeholders
    safeSet('Member Signature', 'Signed');
    safeSet('Driver Signature', 'Signed');
  }


  // Loop over trip legs – use safeSet to avoid missing fields
  report.tripLegs.forEach((leg: TripLeg, idx: number) => {
    const legNum = idx + 1; // 1‑based
    // Example field names based on the list output (may need adjustment)
    const pickUpField = `${legNum}st PickUp Location Physical Address City  Zip Code or Geographical CoordinatesLandmark if No Address AvailableRow1`;
    const dropOffField = `${legNum}st DropOff Location Physical Address City  Zip Code or Geographical CoordinatesLandmark if No Address AvailableRow1`;
    const pickUpOdoField = `PickUp Odometer${legNum > 1 ? '_' + legNum : ''}`;
    const dropOffOdoField = `DropOff Odometer${legNum > 1 ? '_' + legNum : ''}`;
    const milesField = `Trip Miles${legNum > 1 ? '_' + legNum : ''}`;
    const reasonField = `Reason for Visit${legNum > 1 ? '_' + legNum : ''}`;

    safeSet(pickUpField, `${leg.pickUpLocation.physicalAddress}, ${leg.pickUpLocation.city}`);
    safeSet(dropOffField, `${leg.dropOffLocation.physicalAddress}, ${leg.dropOffLocation.city}`);
    safeSet(pickUpOdoField, String(leg.pickUpOdometer));
    safeSet(dropOffOdoField, String(leg.dropOffOdometer));
    safeSet(milesField, String(leg.tripMiles));
    safeSet(reasonField, leg.reasonForVisit);
  });

  // Signatures – if the template has signature fields, set them as needed (skipped here)

  // Fill any remaining fields with a generic placeholder
  const allFields = form.getFields();
  allFields.forEach(f => {
    const name = f.getName();
    // Try to set text
    try {
      // @ts-ignore – pdf-lib may have specific field types
      f.setText('PLACEHOLDER');
    } catch (e) {
      // ignore non‑text fields
    }
    // Try to check checkboxes/radio groups
    try {
      // @ts-ignore – pdf-lib may have specific field types
      f.check();
    } catch (e) {
      // ignore if not a checkbox
    }
    // Try to select an option for dropdowns
    try {
      // @ts-ignore – pdf-lib may have specific field types
      f.select('Yes');
    } catch (e) {
      // ignore if not a dropdown
    }
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
}

