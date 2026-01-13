/**
 * AHCCCS Trip Report - Complete Usage Example
 * Demonstrates how to populate a trip report that matches the form perfectly
 */

import {
  TripReportBuilder,
  LocationManager,
  TripLegFactory,
  TripReportFormatter,
} from './trip-report-service';
import { TripReportValidator } from './trip-report-models';
import { VehicleType, TripType, RelationshipType, SignatureMethod } from './trip-report-models';

// ============================================================================
// EXAMPLE 1: SIMPLE ONE-WAY TRIP
// ============================================================================

export function createSimpleOneWayTrip() {
  const report = new TripReportBuilder()
    // Provider (GVBH)
    .withProvider({
      ahcccsId: 'A2A843',
      name: 'GREAT VALUES TRANSPORTATION',
      address: '5723 W. PUEBLO AVE PHOENIX, AZ 85043-6404',
      phoneNumber: '480-678-9426',
    })
    // Report date
    .withReportMetadata({
      reportDate: new Date('2025-01-09'),
      pageNumber: 1,
      totalPages: 1,
    })
    // Driver
    .withDriver('John Smith')
    // Vehicle
    .withVehicle({
      fleetId: 'A2A843',
      make: 'FORD',
      color: 'White',
      type: VehicleType.WHEELCHAIR_VAN,
    })
    // Member/Client (HIPAA-sensitive)
    .withMember({
      ahcccsId: '12345678',
      name: 'Robert Johnson',
      dateOfBirth: new Date('1955-03-15'),
      mailingAddress: {
        street: '123 Oak Street',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85001',
      },
    })
    // Add trip leg using LocationManager for clean location creation
    .addTripLeg(
      TripLegFactory.createOneWayTrip(
        // Pick-up: Home
        LocationManager.fromAddress('123 Oak Street', 'Phoenix', '85001'),
        new Date('2025-01-09T09:00:00'),
        12450, // ODO reading at pick-up
        // Drop-off: Medical facility
        LocationManager.fromAddress('2500 Medical Center Drive', 'Phoenix', '85012'),
        new Date('2025-01-09T09:45:00'),
        12475, // ODO reading at drop-off
        'Doctor Appointment - Cardiology',
        {
          name: 'Sarah Johnson',
          relationship: 'Daughter',
        }
      )
    )
    // Signatures (captured during/after trip)
    .withDriverSignature({
      name: 'John Smith',
      method: SignatureMethod.MEMBER_SIGNATURE,
      timestamp: new Date('2025-01-09T10:00:00'),
      signatureImageUrl: '/signatures/driver_john_smith_20250109.png',
    })
    .withMemberSignature({
      name: 'Robert Johnson',
      method: SignatureMethod.MEMBER_SIGNATURE,
      timestamp: new Date('2025-01-09T10:00:00'),
      signatureImageUrl: '/signatures/member_robert_johnson_20250109.png',
    })
    // Compliance info
    .withComplianceInfo({
      submissionMethod: 'mobile_app',
      completedBy: 'john_driver_001',
      hipaaEncrypted: true,
    })
    .build();

  return report;
}

// ============================================================================
// EXAMPLE 2: ROUND-TRIP (Home → Medical → Home)
// ============================================================================

export function createRoundTripWithReturn() {
  const report = new TripReportBuilder()
    .withProvider({
      ahcccsId: 'A2A843',
      name: 'GREAT VALUES TRANSPORTATION',
      address: '5723 W. PUEBLO AVE PHOENIX, AZ 85043-6404',
      phoneNumber: '480-678-9426',
    })
    .withReportMetadata({
      reportDate: new Date('2025-01-09'),
      pageNumber: 1,
      totalPages: 1,
    })
    .withDriver('Maria Garcia')
    .withVehicle({
      fleetId: 'A2A843',
      make: 'FORD',
      color: 'White',
      type: VehicleType.WHEELCHAIR_VAN,
    })
    .withMember({
      ahcccsId: '87654321',
      name: 'Patricia Williams',
      dateOfBirth: new Date('1948-07-22'),
      mailingAddress: {
        street: '456 Elm Avenue',
        city: 'Tempe',
        state: 'AZ',
        zipCode: '85281',
      },
    })
    // Round trip leg
    .addTripLeg(
      TripLegFactory.createRoundTrip(
        // Pickup from home
        LocationManager.fromAddress('456 Elm Avenue', 'Tempe', '85281'),
        new Date('2025-01-09T10:00:00'),
        5020,
        // Medical facility
        LocationManager.fromAddress('3000 Phoenix General Hospital Road', 'Phoenix', '85006'),
        new Date('2025-01-09T10:40:00'),
        5045,
        // Depart medical facility
        new Date('2025-01-09T12:30:00'),
        5045,
        // Return to home
        LocationManager.fromAddress('456 Elm Avenue', 'Tempe', '85281'),
        new Date('2025-01-09T13:10:00'),
        5070,
        'Physical Therapy Session'
      )
    )
    .withDriverSignature({
      name: 'Maria Garcia',
      method: SignatureMethod.MEMBER_SIGNATURE,
      timestamp: new Date('2025-01-09T13:15:00'),
    })
    .withMemberSignature({
      name: 'Patricia Williams',
      method: SignatureMethod.MEMBER_SIGNATURE,
      timestamp: new Date('2025-01-09T13:15:00'),
    })
    .withComplianceInfo({
      submissionMethod: 'mobile_app',
      completedBy: 'maria_driver_002',
      hipaaEncrypted: true,
    })
    .build();

  return report;
}

// ============================================================================
// EXAMPLE 3: CARPOOL - MULTIPLE CLIENTS IN SAME VEHICLE
// KEY PAIN POINT: Creates separate report per member, but tracks shared vehicle
// ============================================================================

export function createCarpoolTrip_MemberA() {
  // Member A's perspective - same vehicle, but individual report
  const report = new TripReportBuilder()
    .withProvider({
      ahcccsId: 'A2A843',
      name: 'GREAT VALUES TRANSPORTATION',
      address: '5723 W. PUEBLO AVE PHOENIX, AZ 85043-6404',
      phoneNumber: '480-678-9426',
    })
    .withReportMetadata({
      reportDate: new Date('2025-01-09'),
      pageNumber: 1,
      totalPages: 1,
    })
    .withDriver('David Lee')
    .withVehicle({
      fleetId: 'A2A843',
      make: 'FORD',
      color: 'White',
      type: VehicleType.MINI_VAN, // Note: Mini-van for 2 passengers
    })
    .withMember({
      ahcccsId: '11111111',
      name: 'James Mitchell',
      dateOfBirth: new Date('1960-05-10'),
      mailingAddress: {
        street: '789 Pine Street',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85003',
      },
    })
    // Trip 1: Pick up Member A from home, go to facility
    .addTripLeg(
      TripLegFactory.createOneWayTrip(
        LocationManager.fromAddress('789 Pine Street', 'Phoenix', '85003'),
        new Date('2025-01-09T08:30:00'),
        8100,
        LocationManager.fromAddress('2500 Medical Center Drive', 'Phoenix', '85012'),
        new Date('2025-01-09T09:00:00'),
        8120,
        'Doctor Appointment - Orthopedic'
      )
    )
    .withCarpoolData({
      multipleMembers: true,
      differentPickDropLocations: true, // Different homes, same destination
    })
    .withNotes('Second passenger: Sarah Chen, picked up separately')
    .withDriverSignature({
      name: 'David Lee',
      method: SignatureMethod.MEMBER_SIGNATURE,
      timestamp: new Date('2025-01-09T09:15:00'),
    })
    .withMemberSignature({
      name: 'James Mitchell',
      method: SignatureMethod.MEMBER_SIGNATURE,
      timestamp: new Date('2025-01-09T09:15:00'),
    })
    .withComplianceInfo({
      submissionMethod: 'mobile_app',
      completedBy: 'david_driver_003',
      hipaaEncrypted: true,
    })
    .build();

  return report;
}

export function createCarpoolTrip_MemberB() {
  // Member B's separate report - same vehicle, same day
  const report = new TripReportBuilder()
    .withProvider({
      ahcccsId: 'A2A843',
      name: 'GREAT VALUES TRANSPORTATION',
      address: '5723 W. PUEBLO AVE PHOENIX, AZ 85043-6404',
      phoneNumber: '480-678-9426',
    })
    .withReportMetadata({
      reportDate: new Date('2025-01-09'),
      pageNumber: 1,
      totalPages: 1,
    })
    .withDriver('David Lee')
    .withVehicle({
      fleetId: 'A2A843',
      make: 'FORD',
      color: 'White',
      type: VehicleType.MINI_VAN,
    })
    .withMember({
      ahcccsId: '22222222',
      name: 'Sarah Chen',
      dateOfBirth: new Date('1965-11-18'),
      mailingAddress: {
        street: '321 Maple Drive',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85004',
      },
    })
    // Trip: Pick up Member B from different home, go to same facility
    .addTripLeg(
      TripLegFactory.createOneWayTrip(
        LocationManager.fromAddress('321 Maple Drive', 'Phoenix', '85004'),
        new Date('2025-01-09T08:45:00'),
        8120,
        LocationManager.fromAddress('2500 Medical Center Drive', 'Phoenix', '85012'),
        new Date('2025-01-09T09:10:00'),
        8135,
        'Doctor Appointment - Internal Medicine'
      )
    )
    .withCarpoolData({
      multipleMembers: true,
      differentPickDropLocations: true, // Different homes, same facility
    })
    .withNotes('Shared vehicle with James Mitchell')
    .withDriverSignature({
      name: 'David Lee',
      method: SignatureMethod.MEMBER_SIGNATURE,
      timestamp: new Date('2025-01-09T09:20:00'),
    })
    .withMemberSignature({
      name: 'Sarah Chen',
      method: SignatureMethod.MEMBER_SIGNATURE,
      timestamp: new Date('2025-01-09T09:20:00'),
    })
    .withComplianceInfo({
      submissionMethod: 'mobile_app',
      completedBy: 'david_driver_003',
      hipaaEncrypted: true,
    })
    .build();

  return report;
}

// ============================================================================
// EXAMPLE 4: GPS-BASED LOCATIONS (No Physical Address Available)
// ============================================================================

export function createTripWithGPSCoordinates() {
  const report = new TripReportBuilder()
    .withProvider({
      ahcccsId: 'A2A843',
      name: 'GREAT VALUES TRANSPORTATION',
      address: '5723 W. PUEBLO AVE PHOENIX, AZ 85043-6404',
      phoneNumber: '480-678-9426',
    })
    .withReportMetadata({
      reportDate: new Date('2025-01-09'),
      pageNumber: 1,
      totalPages: 1,
    })
    .withDriver('Carlos Rodriguez')
    .withVehicle({
      fleetId: 'A2A843',
      make: 'FORD',
      color: 'White',
      type: VehicleType.WHEELCHAIR_VAN,
    })
    .withMember({
      ahcccsId: '33333333',
      name: 'Michael Thompson',
      dateOfBirth: new Date('1950-01-20'),
      mailingAddress: {
        street: '654 Oak Ridge Road',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85009',
      },
    })
    // Trip with fallback locations: address → GPS → landmark
    .addTripLeg(
      TripLegFactory.createOneWayTrip(
        // Home with physical address
        LocationManager.fromAddress('654 Oak Ridge Road', 'Phoenix', '85009'),
        new Date('2025-01-09T14:00:00'),
        15200,
        // Medical facility captured via GPS (no street address available)
        LocationManager.withFallbacks(
          undefined, // No street address
          {
            latitude: 33.4484,
            longitude: -112.0742,
            timestamp: new Date('2025-01-09T14:30:00'),
          },
          'Desert Sky Medical Clinic' // Landmark for human reference
        ),
        new Date('2025-01-09T14:30:00'),
        15215,
        'Lab Work and Blood Draw'
      )
    )
    .withDriverSignature({
      name: 'Carlos Rodriguez',
      method: SignatureMethod.MEMBER_SIGNATURE,
      timestamp: new Date('2025-01-09T15:00:00'),
    })
    .withMemberSignature({
      name: 'Michael Thompson',
      method: SignatureMethod.MEMBER_SIGNATURE,
      timestamp: new Date('2025-01-09T15:00:00'),
    })
    .withComplianceInfo({
      submissionMethod: 'mobile_app',
      completedBy: 'carlos_driver_004',
      hipaaEncrypted: true,
    })
    .build();

  return report;
}

// ============================================================================
// EXAMPLE 5: MULTIPLE STOPS IN ONE DAY (6 Legs - Maximum)
// ============================================================================

export function createMultipleStopsDayRoute() {
  const report = new TripReportBuilder()
    .withProvider({
      ahcccsId: 'A2A843',
      name: 'GREAT VALUES TRANSPORTATION',
      address: '5723 W. PUEBLO AVE PHOENIX, AZ 85043-6404',
      phoneNumber: '480-678-9426',
    })
    .withReportMetadata({
      reportDate: new Date('2025-01-09'),
      pageNumber: 1,
      totalPages: 1,
    })
    .withDriver('Angela Martinez')
    .withVehicle({
      fleetId: 'A2A843',
      make: 'FORD',
      color: 'White',
      type: VehicleType.MINI_VAN,
    })
    .withMember({
      ahcccsId: '44444444',
      name: 'Dorothy Brown',
      dateOfBirth: new Date('1942-09-05'),
      mailingAddress: {
        street: '987 Sunset Boulevard',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85011',
      },
    })
    // Trip 1: Home → Doctor
    .addTripLeg(
      TripLegFactory.createOneWayTrip(
        LocationManager.fromAddress('987 Sunset Boulevard', 'Phoenix', '85011'),
        new Date('2025-01-09T08:00:00'),
        10500,
        LocationManager.fromAddress('2500 Medical Center Drive', 'Phoenix', '85012'),
        new Date('2025-01-09T08:30:00'),
        10515,
        'Primary Care Doctor Visit'
      )
    )
    // Trip 2: Doctor → Pharmacy (multiple stops)
    .addTripLeg(
      TripLegFactory.createOneWayTrip(
        LocationManager.fromAddress('2500 Medical Center Drive', 'Phoenix', '85012'),
        new Date('2025-01-09T09:00:00'),
        10515,
        LocationManager.fromAddress('4000 Pharmacy Plaza', 'Phoenix', '85014'),
        new Date('2025-01-09T09:20:00'),
        10528,
        'Prescription Pickup'
      )
    )
    // Trip 3: Pharmacy → Lab
    .addTripLeg(
      TripLegFactory.createOneWayTrip(
        LocationManager.fromAddress('4000 Pharmacy Plaza', 'Phoenix', '85014'),
        new Date('2025-01-09T09:30:00'),
        10528,
        LocationManager.fromAddress('3500 Lab Services Center', 'Phoenix', '85016'),
        new Date('2025-01-09T09:50:00'),
        10542,
        'Lab Work - Follow-up Tests'
      )
    )
    // Trip 4: Lab → Lunch Break (non-medical stop, but still tracked)
    .addTripLeg(
      TripLegFactory.createOneWayTrip(
        LocationManager.fromAddress('3500 Lab Services Center', 'Phoenix', '85016'),
        new Date('2025-01-09T10:00:00'),
        10542,
        LocationManager.fromAddress('2200 Food Court', 'Phoenix', '85017'),
        new Date('2025-01-09T10:30:00'),
        10550,
        'Lunch Break (Accompanying visit)'
      )
    )
    // Trip 5: Lunch → Specialist
    .addTripLeg(
      TripLegFactory.createOneWayTrip(
        LocationManager.fromAddress('2200 Food Court', 'Phoenix', '85017'),
        new Date('2025-01-09T11:00:00'),
        10550,
        LocationManager.fromAddress('5000 Cardiac Specialists', 'Phoenix', '85018'),
        new Date('2025-01-09T11:35:00'),
        10570,
        'Cardiology Specialist Appointment'
      )
    )
    // Trip 6: Specialist → Home
    .addTripLeg(
      TripLegFactory.createOneWayTrip(
        LocationManager.fromAddress('5000 Cardiac Specialists', 'Phoenix', '85018'),
        new Date('2025-01-09T12:15:00'),
        10570,
        LocationManager.fromAddress('987 Sunset Boulevard', 'Phoenix', '85011'),
        new Date('2025-01-09T13:00:00'),
        10595,
        'Return to Home'
      )
    )
    .withNotes('Longest day route - 6 stops with multiple medical visits')
    .withDriverSignature({
      name: 'Angela Martinez',
      method: SignatureMethod.MEMBER_SIGNATURE,
      timestamp: new Date('2025-01-09T13:15:00'),
    })
    .withMemberSignature({
      name: 'Dorothy Brown',
      method: SignatureMethod.MEMBER_SIGNATURE,
      timestamp: new Date('2025-01-09T13:15:00'),
    })
    .withComplianceInfo({
      submissionMethod: 'mobile_app',
      completedBy: 'angela_driver_005',
      hipaaEncrypted: true,
    })
    .build();

  return report;
}

// ============================================================================
// VALIDATION & FORMATTING EXAMPLES
// ============================================================================

export function demonstrateValidationAndFormatting() {
  const report = createSimpleOneWayTrip();

  console.log('=== VALIDATION ===');
  const validation = TripReportValidator.validate(report.report);
  console.log('Valid:', validation.isValid);
  console.log('Errors:', validation.errors);
  console.log('Warnings:', validation.warnings);

  console.log('\n=== TEXT FORMAT ===');
  console.log(TripReportFormatter.toText(report.report));

  console.log('\n=== PDF FORMAT (for PDF library) ===');
  const pdfData = TripReportFormatter.toPDFData(report.report);
  console.log(JSON.stringify(pdfData, null, 2));

  console.log('\n=== JSON FORMAT (for storage/API) ===');
  console.log(TripReportFormatter.toJSON(report.report));
}

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================

export const tripReportExamples = {
  simpleOneWay: createSimpleOneWayTrip,
  roundTrip: createRoundTripWithReturn,
  carpoolMemberA: createCarpoolTrip_MemberA,
  carpoolMemberB: createCarpoolTrip_MemberB,
  gpsCoordinates: createTripWithGPSCoordinates,
  multipleStops: createMultipleStopsDayRoute,
};
