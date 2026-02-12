const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const PdfReportService = require('./PdfReportService');

async function produceFinalPdf() {
    const inputPath = path.join(process.cwd(), 'frontend/public/AHCCCSDailyTripReportFinal NEW more updated.pdf');
    const outputPath = path.join(process.cwd(), 'FINAL_FILLED_REPORT.pdf');

    console.log(`Loading PDF from: ${inputPath}`);
    if (!fs.existsSync(inputPath)) {
        console.error(`Error: Input file does not exist at ${inputPath}`);
        return;
    }

    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const service = new PdfReportService(pdfDoc.getForm());

    // --- MOCK DATA ---
    const commonData = {
        date: '2026-02-12',
        driverName: 'John Doe',
        vehicleId: 'GVT-901',
        vehicleInfo: 'Toyota Sienna / White',
        memberName: 'Jane Smith',
        ahcccsId: 'A12345678',
        dob: '1985-05-20',
        address: '789 Sunset Blvd, Phoenix, AZ 85001',
        providerInfo: `AHCCCS ID: 181294\nNAME: GREAT VALUES TRANSPORTATION\nADDRESS: 5723 W. PUEBLO AVE PHOENIX 85043-6404\nPHONE: 480-678-9426`,
        driverSig: 'John Doe (Driver)',
        memberSig: 'Jane Smith (Member)',
        additionalInfo: 'Refactored version using PdfReportService.js',
        page: '1',
        of: '2',
        page_2: '2',
        of_2: '2'
    };

    // 1. Fill Header
    service.fillHeader(commonData);

    // 2. Fill Trips
    const trips = [
        { pu: '08:00 AM', do: '08:30 AM', puOdo: '12000', doOdo: '12010', miles: '10', puAddr: '789 Sunset Blvd', doAddr: '456 Medical Plaza', reason: 'Dialysis', type: 'One Way' },
        { pu: '10:30 AM', do: '11:00 AM', puOdo: '12010', doOdo: '12020', miles: '10', puAddr: '456 Medical Plaza', doAddr: '789 Sunset Blvd', reason: 'Dialysis Return', type: 'One Way' },
        { pu: '01:00 PM', do: '01:15 PM', puOdo: '12025', doOdo: '12030', miles: '5', puAddr: '789 Sunset Blvd', doAddr: '101 Pharmacy Way', reason: 'Pharmacy', type: 'Multiple Stops' },
        { pu: '01:45 PM', do: '02:00 PM', puOdo: '12030', doOdo: '12035', miles: '5', puAddr: '101 Pharmacy Way', doAddr: '789 Sunset Blvd', reason: 'Pharmacy Return', type: 'One Way' },
        { pu: '04:00 PM', do: '04:30 PM', puOdo: '12050', doOdo: '12065', miles: '15', puAddr: '789 Sunset Blvd', doAddr: '333 Specialty Clinic', reason: 'Consultation', type: 'Round Trip' },
        { pu: '05:30 PM', do: '06:00 PM', puOdo: '12065', doOdo: '12080', miles: '15', puAddr: '333 Specialty Clinic', doAddr: '789 Sunset Blvd', reason: 'Consultation Return', type: 'Round Trip' }
    ];

    trips.forEach((t, i) => service.fillTrip(i, t));

    // 3. Fill Footer
    service.fillFooter(commonData);

    // 4. Stress Test (All X's)
    service.stressTestX();

    const saved = await pdfDoc.save();
    fs.writeFileSync(outputPath, saved);
    console.log(`\nSUCCESS: Saved refactored PDF to: ${outputPath}`);
}

produceFinalPdf().catch(console.error);
