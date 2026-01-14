import { fillAcroForm } from './fill-acroform';
import { AHCCCSTripReport, TripLeg, VehicleType } from './trip-report-models';
import * as path from 'path';

// Generate pseudo data for all fields
function createPseudoReport(): AHCCCSTripReport {
  const now = new Date();
  const legs: TripLeg[] = [];
  for (let i = 1; i <= 6; i++) {
    legs.push({
      legNumber: i,
      pickUpLocation: { physicalAddress: `PickUp Address ${i}`, city: `City${i}` },
      dropOffLocation: { physicalAddress: `DropOff Address ${i}`, city: `City${i}` },
      pickUpTime: new Date(now.getTime() + i * 3600 * 1000),
      pickUpOdometer: 100 + i * 10,
      dropOffTime: new Date(now.getTime() + i * 3600 * 1000 + 1800 * 1000),
      dropOffOdometer: 110 + i * 10,
      tripMiles: 10,
      tripType: 'one_way' as any,
      reasonForVisit: `Reason ${i}`,
    });
  }

  return {
    documentId: 'PSEUDO-REPORT-001',
    reportDate: now,
    pageNumber: 1,
    totalPages: 1,
    provider: {
      ahcccsId: 'PROV-123',
      name: 'Pseudo Provider',
      address: '123 Provider St, City, State',
      phoneNumber: '555-1234',
    },
    driver: { name: 'John Doe' },
    vehicle: {
      fleetId: 'VEH-001',
      make: 'Toyota',
      color: 'Blue',
      type: VehicleType.WHEELCHAIR_VAN,
    },
    member: {
      ahcccsId: 'MEM-001',
      name: 'Jane Smith',
      dateOfBirth: new Date('1970-01-01'),
      mailingAddress: {
        street: '456 Member Rd',
        city: 'MemberCity',
        state: 'AZ',
        zipCode: '85001',
      },
    },
    tripLegs: legs,
    attestation: {
      statement: 'I certify the above information is correct.',
      complianceTimestamp: now,
      member: {
        name: 'Jane Smith',
        method: 'member_signature' as any,
        timestamp: now,
        signingRole: 'member',
        signatureImageUrl: '',
      },
      driver: {
        name: 'John Doe',
        method: 'provider_signature' as any,
        timestamp: now,
        signingRole: 'provider',
        signatureImageUrl: '',
      },
    },
    compliance: {
      auditId: 'AUDIT-001',
      hipaaEncrypted: false,
      submissionTimestamp: now,
      submissionMethod: 'api',
      completedBy: 'system',
    },
  } as any;
}

async function generate() {
  const report = createPseudoReport();
  const outputPath = path.resolve(process.cwd(), 'pseudo_test_result.pdf');
  await fillAcroForm(report, outputPath);
  console.log('Pseudo PDF generated at', outputPath);
}

generate();
