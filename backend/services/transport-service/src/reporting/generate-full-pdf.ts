import { fillAcroForm } from './fill-acroform';
import { AHCCCSTripReport, TripLeg, VehicleType } from './trip-report-models';
import * as path from 'path';

function createFullReport(): AHCCCSTripReport {
  const now = new Date();
  const legs: TripLeg[] = [];
  for (let i = 1; i <= 6; i++) {
    legs.push({
      legNumber: i,
      pickUpLocation: { physicalAddress: `Pickup Addr ${i}`, city: `City${i}` },
      dropOffLocation: { physicalAddress: `Dropoff Addr ${i}`, city: `City${i}` },
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
    documentId: 'FULL-FORM-001',
    reportDate: now,
    pageNumber: 1,
    totalPages: 1,
    provider: {
      ahcccsId: 'PROV-999',
      name: 'Full Provider',
      address: '999 Provider St, City, State',
      phoneNumber: '555-9999',
    },
    driver: { name: 'Full Driver' },
    vehicle: {
      fleetId: 'VEH-999',
      make: 'Mercedes',
      color: 'Black',
      type: VehicleType.WHEELCHAIR_VAN,
    },
    member: {
      ahcccsId: 'MEM-999',
      name: 'Full Member',
      dateOfBirth: new Date('1980-01-01'),
      mailingAddress: {
        street: '999 Member Rd',
        city: 'MemberCity',
        state: 'AZ',
        zipCode: '85099',
      },
    },
    tripLegs: legs,
    attestation: {
      statement: 'I certify all data is correct.',
      complianceTimestamp: now,
      member: {
        name: 'Full Member',
        method: 'member_signature' as any,
        timestamp: now,
        signingRole: 'member',
        signatureImageUrl: '',
      },
      driver: {
        name: 'Full Driver',
        method: 'provider_signature' as any,
        timestamp: now,
        signingRole: 'provider',
        signatureImageUrl: '',
      },
    },
    compliance: {
      auditId: 'AUDIT-999',
      hipaaEncrypted: false,
      submissionTimestamp: now,
      submissionMethod: 'api',
      completedBy: 'system',
    },
  } as any;
}

async function generate() {
  const report = createFullReport();
  const outputPath = path.resolve(process.cwd(), 'full_filled_form.pdf');
  await fillAcroForm(report, outputPath);
  console.log('Full PDF generated at', outputPath);
}

generate();
