/**
 * Manual Verification Script for PDF Generation
 * Run with: npx ts-node src/manual-verify-pdf.ts
 */

import { PDFGenerator } from './reporting/trip-report-pdf';
import { AHCCCSTripReport, TripLeg, VehicleType } from './reporting/trip-report-models';
import * as fs from 'fs';
import * as path from 'path';

async function verify() {
    console.log("Starting Manual PDF Verification...");

    const mockReport: AHCCCSTripReport = {
        documentId: "TEST-DOC-001",
        reportDate: new Date(),
        pageNumber: 1,
        totalPages: 1,
        provider: {
            ahcccsId: "A2A843",
            name: "GREAT VALUES TRANSPORTATION",
            address: "5723 W. PUEBLO AVE PHOENIX, AZ 85043",
            phoneNumber: "480-678-9426"
        },
        driver: {
            name: "John Doeski"
        },
        vehicle: {
            fleetId: "V-99",
            make: "Ford",
            color: "White",
            type: VehicleType.WHEELCHAIR_VAN
        },
        member: {
            ahcccsId: "MEM-555",
            name: "Robert Johnson",
            dateOfBirth: new Date("1955-03-15"),
            mailingAddress: {
                street: "123 Oak St",
                city: "Phoenix",
                state: "AZ",
                zipCode: "85001"
            }
        },
        tripLegs: [
            {
                legNumber: 1,
                pickUpLocation: { physicalAddress: '123 Main St', city: 'Phoenix' },
                dropOffLocation: { physicalAddress: 'Cardiology Center, 500 N 3rd St', city: 'Phoenix' },
                pickUpTime: new Date('2025-05-20T08:00:00Z'),
                pickUpOdometer: 100,
                dropOffTime: new Date('2025-05-20T08:30:00Z'),
                dropOffOdometer: 110,
                tripMiles: 10,
                tripType: 'one_way' as any,
                reasonForVisit: 'Cardiology Appt',
            },
            {
                legNumber: 2,
                pickUpLocation: { physicalAddress: 'Cardiology Center, 500 N 3rd St', city: 'Phoenix' },
                dropOffLocation: { physicalAddress: 'Pharmacy, 700 S 1st Ave', city: 'Phoenix' },
                pickUpTime: new Date('2025-05-20T09:30:00Z'),
                pickUpOdometer: 110,
                dropOffTime: new Date('2025-05-20T09:45:00Z'),
                dropOffOdometer: 115,
                tripMiles: 5,
                tripType: 'multiple_stops' as any,
                reasonForVisit: 'Pharmacy',
            },
             {
                legNumber: 3,
                pickUpLocation: { physicalAddress: 'Pharmacy, 700 S 1st Ave', city: 'Phoenix' },
                dropOffLocation: { physicalAddress: '123 Main St', city: 'Phoenix' },
                pickUpTime: new Date('2025-05-20T10:00:00Z'),
                pickUpOdometer: 115,
                dropOffTime: new Date('2025-05-20T10:30:00Z'),
                dropOffOdometer: 125,
                tripMiles: 10,
                tripType: 'round_trip' as any,
                reasonForVisit: 'Return Home',
            },
            {
                legNumber: 4,
                pickUpLocation: { physicalAddress: '123 Main St', city: 'Phoenix' },
                dropOffLocation: { physicalAddress: 'Dialysis Center', city: 'Phoenix' },
                pickUpTime: new Date('2025-05-20T14:00:00Z'),
                pickUpOdometer: 125,
                dropOffTime: new Date('2025-05-20T14:30:00Z'),
                dropOffOdometer: 135,
                tripMiles: 10,
                tripType: 'one_way' as any,
                reasonForVisit: 'Dialysis',
            },
             {
                legNumber: 5,
                pickUpLocation: { physicalAddress: 'Dialysis Center', city: 'Phoenix' },
                dropOffLocation: { physicalAddress: '123 Main St', city: 'Phoenix' },
                pickUpTime: new Date('2025-05-20T17:00:00Z'),
                pickUpOdometer: 135,
                dropOffTime: new Date('2025-05-20T17:30:00Z'),
                dropOffOdometer: 145,
                tripMiles: 10,
                tripType: 'round_trip' as any,
                reasonForVisit: 'Return Home',
            }
        ],
        attestation: {
            statement: "I certify...",
            complianceTimestamp: new Date(),
            member: { 
                name: "Robert Johnson", 
                method: "member_signature" as any, 
                timestamp: new Date(),
                signingRole: "member",
                signatureImageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" 
            },
            driver: { 
                name: "John Doeski", 
                method: "provider_signature" as any, 
                timestamp: new Date(),
                signingRole: "provider",
                signatureImageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" 
            }
        },
        compliance: {
            auditTrailId: "AUDIT-123",
            hipaaEncrypted: true,
            submissionTimestamp: new Date(),
            submissionMethod: "mobile_app",
            completedBy: "User123"
        }
    };

    try {
        const outputPath = path.join(process.cwd(), 'manual_test_result.pdf');
        
        console.log(`Generating PDF to: ${outputPath}`);
        await PDFGenerator.generatePDF(mockReport, { outputPath });
        console.log("PDF Generation Completed!");
        
        if (fs.existsSync(outputPath)) {
            const stats = fs.statSync(outputPath);
            console.log(`File Size: ${stats.size} bytes`);
            if (stats.size < 10000) {
                console.warn("WARNING: File size matches basic text/empty PDF, template might not be loaded!");
            } else {
                console.log("SUCCESS: File size indicates template was likely used.");
            }
        } else {
            console.error("ERROR: Output file not found!");
        }

    } catch (e) {
        console.error("Verification Failed:", e);
    }
}

verify();
