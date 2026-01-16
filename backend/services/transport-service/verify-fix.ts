
import { PDFGenerator } from './src/reporting/trip-report-pdf';
import { TripReportBuilder, TripLegFactory } from './src/reporting/trip-report-service';
import { VehicleType } from './src/reporting/trip-report-models';
import * as path from 'path';

async function generatePseudoPdf() {
    console.log("Generating Pseudo PDF...");

    const builder = new TripReportBuilder();

    // 1. Provider
    builder.withProvider({
        ahcccsId: '999999',
        name: 'PSEUDO TRANSPORT LLC',
        address: '123 Fake St, Test City, AZ 85000',
        phoneNumber: '(555) 123-4567'
    });

    // 2. Driver & Vehicle
    builder.withDriver('John Doe');
    builder.withVehicle({
        fleetId: 'V-101',
        make: 'Toyota Sienna',
        color: 'Silver',
        type: VehicleType.WHEELCHAIR_VAN
    });

    // 3. Member
    builder.withMember({
        ahcccsId: 'A12345678',
        name: 'Jane Smith',
        dateOfBirth: new Date('1980-05-15'),
        mailingAddress: { street: '456 Client Rd', city: 'Phoenix', state: 'AZ', zipCode: '85001' }
    });

    // 4. Trip Legs (Test AM/PM logic)
    // Leg 1: AM Pickup, AM Dropoff
    const leg1 = TripLegFactory.createOneWayTrip(
        { physicalAddress: 'Home', city: 'Phoenix', zipCode: '85001' },
        new Date('2023-10-27T08:30:00'), // 8:30 AM
        1000,
        { physicalAddress: 'Clinic', city: 'Scottsdale', zipCode: '85251' },
        new Date('2023-10-27T09:15:00'), // 9:15 AM
        1015,
        'Dialysis',
        undefined
    ) as any;
    leg1.tripMiles = 15;
    builder.addTripLeg(leg1);

    // Leg 2: PM Pickup, PM Dropoff
    const leg2 = TripLegFactory.createOneWayTrip(
        { physicalAddress: 'Clinic', city: 'Scottsdale', zipCode: '85251' },
        new Date('2023-10-27T14:00:00'), // 2:00 PM
        1015,
        { physicalAddress: 'Home', city: 'Phoenix', zipCode: '85001' },
        new Date('2023-10-27T14:45:00'), // 2:45 PM
        1030,
        'Return',
        undefined
    ) as any;
    leg2.tripMiles = 15;
    builder.addTripLeg(leg2);

    const report = builder.build().report;

    // Output to a known location
    const outputPath = path.resolve(process.cwd(), 'PSEUDO_REPORT.pdf');
    
    await PDFGenerator.generatePDF(report, {
        outputPath: outputPath,
        addSignatures: false
    });

    console.log(`Success! PDF generated at: ${outputPath}`);
}

generatePseudoPdf().catch(console.error);
