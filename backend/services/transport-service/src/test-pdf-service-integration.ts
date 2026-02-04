import { PdfService } from './pdf.service';
import { Trip, TripType, MobilityRequirement } from './entities/trip.entity';
import { TripReport } from './entities/trip-report.entity';
import * as fs from 'fs';
import * as path from 'path';

async function runTest() {
    console.log('Testing Integrated PDF Service...');

    // 1. Mock Data
    const mockTrip = new Trip();
    mockTrip.id = 'TRIP-INTEGRATION-TEST';
    mockTrip.tripDate = new Date('2026-03-01');
    mockTrip.tripType = TripType.ROUND_TRIP;
    mockTrip.mobilityRequirement = MobilityRequirement.WHEELCHAIR;
    mockTrip.assignedVehicle = { make: 'Ford', color: 'White', licensePlate: 'TEST-PLATE' } as any;
    mockTrip.assignedDriver = { user: { firstName: 'Test', lastName: 'Driver' } } as any;

    // Member
    mockTrip.tripMembers = [{
        member: {
            firstName: 'Integration',
            lastName: 'User',
            insuranceId: 'A99999999',
            dateOfBirth: new Date('1985-05-05'),
            email: 'test@example.com'
        }
    }] as any;

    // Stops (Round Trip = 2 Stops minimum usually?)
    // Let's mimic what the service expects.
    mockTrip.tripStops = [
        { address: '100 Start St. Phoenix, AZ' },
        { address: '200 End Ave. Phoenix, AZ' }
    ] as any;

    const mockReport = new TripReport();
    mockReport.startOdometer = 50000;
    mockReport.endOdometer = 50020;
    mockReport.totalMiles = 20;
    mockReport.signatures = [
        { role: 'driver', signatureUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' } as any,
        { role: 'member', signatureUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' } as any
    ];

    // 2. Instantiate Service
    const service = new PdfService();
    // service.logger is private but instantiated inline, so it should be fine if dependencies are met.
    // If Logger fails, we might need to mock it. NestJS Logger usually works in standalone if package exists.

    // 3. Generate
    try {
        const buffer = await service.generateTripReportPdf(mockTrip, mockReport);
        const outputPath = path.join(process.cwd(), 'integrated-test-result.pdf');
        fs.writeFileSync(outputPath, buffer);
        console.log(`Success! PDF saved to: ${outputPath}`);
    } catch (e) {
        console.error('PDF Generation Failed:', e);
    }
}

runTest();
