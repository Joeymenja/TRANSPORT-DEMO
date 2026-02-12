import { PdfService } from './src/pdf.service';
import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Trip } from './src/entities/trip.entity';
import { TripReport } from './src/entities/trip-report.entity';
import { TripStatus, MobilityRequirement, ReportStatus, TripType } from './src/entities/trip.entity';

// Mock data
const mockTrip: any = {
    id: 'TRIP-123',
    tripDate: new Date(),
    status: 'COMPLETED',
    tripMembers: [
        {
            member: {
                firstName: 'John',
                lastName: 'Doe',
                insuranceId: 'A88888888',
                dateOfBirth: '1980-01-01',
                address: '123 Main St, Phoenix, AZ 85001'
            }
        }
    ],
    // Mocking properties that might not be on Trip entity yet but we want to map
    escortName: 'Jane Doe',
    relationship: 'Spouse',
    tripType: 'Round Trip',
    reason: 'Medical Appointment',

    tripStops: [
        {
            stopType: 'PICKUP',
            address: '123 Main St, Phoenix, AZ 85001',
            scheduledTime: new Date('2023-10-27T08:00:00'),
            actualTime: new Date('2023-10-27T08:05:00')
        },
        {
            stopType: 'DROPOFF',
            address: '456 Medical Ctr Dr, Phoenix, AZ 85002',
            scheduledTime: new Date('2023-10-27T09:00:00'),
            actualTime: new Date('2023-10-27T08:55:00')
        }
    ],
    assignedDriver: {
        user: {
            firstName: 'Driver',
            lastName: 'Dave',
        }
    },
    assignedVehicle: {
        licensePlate: 'ABC-123',
        make: 'Ford',
        model: 'Transit',
        color: 'White'
    }
};

const mockReport: Partial<TripReport> = {
    pickupTime: new Date(),
    dropoffTime: new Date(),
    startOdometer: 1000,
    endOdometer: 1050,
    totalMiles: 50,
    serviceVerified: true,
    clientArrived: true,
    signatures: [
        {
            role: 'driver',
            type: 'driver',
            signerName: 'Driver Dave',
            createdAt: new Date(),
            // Red dot
            signatureUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
        },
        {
            role: 'member',
            type: 'member',
            signerName: 'John Doe',
            createdAt: new Date(),
            // Blue dot
            signatureUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12NkYPj/nwEJMEIxCEGsZgIAkQ0N+XQeO0gAAAAASUVORK5CYII='
        }
    ] as any
};

async function run() {
    try {
        const moduleRef = await Test.createTestingModule({
            providers: [PdfService],
        }).compile();

        const pdfService = moduleRef.get(PdfService);

        console.log('Generating PDF...');

        const buffer = await pdfService.generateTripReportPdf(mockTrip as Trip, mockReport as TripReport);
        const outputPath = 'test-output.pdf';
        fs.writeFileSync(outputPath, buffer);
        console.log(`PDF generated successfully at ${path.resolve(outputPath)}`);

    } catch (error) {
        console.error('Error generating PDF:', error);
        // Log stack trace if available
        if (error instanceof Error && error.stack) {
            console.error(error.stack);
            fs.writeFileSync('error_log.txt', error.stack);
        }
    }
}

run();
