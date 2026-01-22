/**
 * AHCCCS Trip Report Service Layer
 * Handles generation, validation, and export of compliant trip reports
 */

import {
  AHCCCSTripReport,
  TripLeg,
  TripType,
  VehicleType,
  TripReportValidator,
  createTripReport,
  LocationData,
  SignatureData,
  SignatureMethod,
  GeoCoordinates,
} from './trip-report-models';

// ============================================================================
// TRIP REPORT BUILDER - Fluent API for construction
// ============================================================================

export class TripReportBuilder {
  private report: Partial<AHCCCSTripReport> = {};

  /**
   * Set provider information (GVBH Transportation)
   */
  withProvider(provider: {
    ahcccsId: string;
    name: string;
    address: string;
    phoneNumber: string;
  }): this {
    this.report.provider = provider;
    return this;
  }

  /**
   * Set report metadata
   */
  withReportMetadata(metadata: {
    reportDate: Date;
    pageNumber?: number;
    totalPages?: number;
  }): this {
    this.report.reportDate = metadata.reportDate;
    this.report.pageNumber = metadata.pageNumber || 1;
    this.report.totalPages = metadata.totalPages || 1;
    return this;
  }

  /**
   * Set driver information
   */
  withDriver(driverName: string): this {
    this.report.driver = { name: driverName };
    return this;
  }

  /**
   * Set vehicle information
   */
  withVehicle(vehicle: {
    fleetId: string;
    make: string;
    color: string;
    type: VehicleType;
    otherTypeDescription?: string;
  }): this {
    this.report.vehicle = vehicle;
    return this;
  }

  /**
   * Set member (client) information - CRITICAL for HIPAA
   */
  withMember(member: {
    ahcccsId: string;
    name: string;
    dateOfBirth: Date;
    mailingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  }): this {
    this.report.member = member;
    return this;
  }

  /**
   * Add a single trip leg
   */
  addTripLeg(leg: Omit<TripLeg, 'legNumber' | 'tripMiles'>): this {
    if (!this.report.tripLegs) {
      this.report.tripLegs = [];
    }

    const legNumber = this.report.tripLegs.length + 1;
    const tripMiles = Math.abs(leg.dropOffOdometer - leg.pickUpOdometer);

    this.report.tripLegs.push({
      ...leg,
      legNumber,
      tripMiles,
    } as TripLeg);

    return this;
  }

  /**
   * Add multiple trip legs at once
   */
  addTripLegs(legs: Omit<TripLeg, 'legNumber' | 'tripMiles'>[]): this {
    legs.forEach(leg => this.addTripLeg(leg));
    return this;
  }

  /**
   * Set carpool information
   */
  withCarpoolData(carpoolData: {
    multipleMembers: boolean;
    differentPickDropLocations: boolean;
    members?: any[];
  }): this {
    this.report.carpool = {
        ...carpoolData,
        members: carpoolData.members || []
    };
    return this;
  }

  /**
   * Set additional notes
   */
  withNotes(notes: string): this {
    this.report.additionalNotes = notes;
    return this;
  }

  /**
   * Set driver signature (at submission time)
   */
  withDriverSignature(signature: Omit<SignatureData, 'signingRole'>): this {
    if (!this.report.attestation) {
      this.report.attestation = {
        statement: "",
        driver: { name: "", method: SignatureMethod.MEMBER_SIGNATURE, timestamp: new Date(), signingRole: "provider" },
        member: { name: "", method: SignatureMethod.MEMBER_SIGNATURE, timestamp: new Date(), signingRole: "member" },
        complianceTimestamp: new Date(),
      };
    }
    this.report.attestation.driver = { ...signature, signingRole: "provider" };
    return this;
  }

  /**
   * Set member/authorized representative signature
   */
  withMemberSignature(signature: Omit<SignatureData, 'signingRole'>): this {
    if (!this.report.attestation) {
      this.report.attestation = {
        statement: "",
        driver: { name: "", method: SignatureMethod.MEMBER_SIGNATURE, timestamp: new Date(), signingRole: "provider" },
        member: { name: "", method: SignatureMethod.MEMBER_SIGNATURE, timestamp: new Date(), signingRole: "member" },
        complianceTimestamp: new Date(),
      };
    }
    this.report.attestation.member = { ...signature, signingRole: "member" };
    this.report.attestation.complianceTimestamp = new Date();
    return this;
  }

  /**
   * Set compliance information
   */
  withComplianceInfo(compliance: {
    submissionMethod: 'digital' | 'paper' | 'mobile_app';
    completedBy: string;
    hipaaEncrypted?: boolean;
  }): this {
    if (!this.report.compliance) {
      this.report.compliance = {
        hipaaEncrypted: true,
        auditTrailId: `AUDIT_${Date.now()}`,
        submissionTimestamp: new Date(),
        submissionMethod: 'mobile_app',
        completedBy: '',
      };
    }
    this.report.compliance.submissionMethod = compliance.submissionMethod;
    this.report.compliance.completedBy = compliance.completedBy;
    this.report.compliance.hipaaEncrypted = compliance.hipaaEncrypted !== false;
    return this;
  }

  /**
   * Build and validate the report
   */
  build(): { report: AHCCCSTripReport; validation: ReturnType<typeof TripReportValidator.validate> } {
    const report = createTripReport(this.report);
    const validation = TripReportValidator.validate(report);

    if (!validation.isValid) {
      throw new Error(`Trip report validation failed:\n${validation.errors.join('\n')}`);
    }

    return { report, validation };
  }

  /**
   * Build without throwing on validation errors (for debugging)
   */
  buildWithValidation(): {
    report: AHCCCSTripReport;
    validation: ReturnType<typeof TripReportValidator.validate>;
    isValid: boolean;
  } {
    const report = createTripReport(this.report);
    const validation = TripReportValidator.validate(report);

    return {
      report,
      validation,
      isValid: validation.isValid,
    };
  }
}

// ============================================================================
// LOCATION HELPER - GPS & ADDRESS MANAGEMENT
// ============================================================================

export class LocationManager {
  /**
   * Create location from physical address
   */
  static fromAddress(
    street: string,
    city: string,
    zipCode: string,
    notes?: string
  ): LocationData {
    return {
      physicalAddress: street,
      city,
      zipCode,
      notes,
    };
  }

  /**
   * Create location from GPS coordinates
   */
  static fromGPS(
    latitude: number,
    longitude: number,
    accuracy?: number,
    timestamp?: Date,
    landmark?: string
  ): LocationData {
    if (latitude < -90 || latitude > 90) {
      throw new Error(`Invalid latitude: ${latitude}`);
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error(`Invalid longitude: ${longitude}`);
    }

    return {
      geoCoordinates: {
        latitude,
        longitude,
        timestamp: timestamp || new Date(),
        accuracy,
      },
      landmark,
    };
  }

  /**
   * Create location from landmark (if no address available)
   */
  static fromLandmark(landmark: string, notes?: string): LocationData {
    return {
      landmark,
      notes,
    };
  }

  /**
   * Create location with multiple identifiers for redundancy
   */
  static withFallbacks(
    physicalAddress?: { street: string; city: string; zipCode: string },
    gpsCoordinates?: { latitude: number; longitude: number; timestamp?: Date },
    landmark?: string
  ): LocationData {
    const location: LocationData = {};

    if (physicalAddress) {
      location.physicalAddress = physicalAddress.street;
      location.city = physicalAddress.city;
      location.zipCode = physicalAddress.zipCode;
    }

    if (gpsCoordinates) {
      location.geoCoordinates = {
        latitude: gpsCoordinates.latitude,
        longitude: gpsCoordinates.longitude,
        timestamp: gpsCoordinates.timestamp || new Date(),
      };
    }

    if (landmark) {
      location.landmark = landmark;
    }

    return location;
  }
}

// ============================================================================
// TRIP LEG HELPER - Simplify trip creation
// ============================================================================

export class TripLegFactory {
  /**
   * Create a one-way trip
   */
  static createOneWayTrip(
    pickUpLocation: LocationData,
    pickUpTime: Date,
    pickUpOdometer: number,
    dropOffLocation: LocationData,
    dropOffTime: Date,
    dropOffOdometer: number,
    reasonForVisit: string,
    escort?: { name: string; relationship: string }
  ): Omit<TripLeg, 'legNumber' | 'tripMiles'> {
    return {
      pickUpLocation,
      pickUpTime,
      pickUpOdometer,
      dropOffLocation,
      dropOffTime,
      dropOffOdometer,
      tripType: TripType.ONE_WAY,
      reasonForVisit,
      escort: escort
        ? {
            name: escort.name,
            relationship: escort.relationship as any, // Type assertion needed for flexibility
          }
        : undefined,
    };
  }

  /**
   * Create a round-trip (same day return)
   */
  static createRoundTrip(
    pickUpLocation: LocationData,
    pickUpTime: Date,
    pickUpOdometer: number,
    medicalFacility: LocationData,
    arrivalTime: Date,
    arrivalOdometer: number,
    departureTime: Date,
    departureOdometer: number,
    dropOffLocation: LocationData,
    dropOffTime: Date,
    dropOffOdometer: number,
    reasonForVisit: string,
    escort?: { name: string; relationship: string }
  ): Omit<TripLeg, 'legNumber' | 'tripMiles'> {
    // For round trip, we calculate the total trip miles (home -> facility -> home)
    return {
      pickUpLocation,
      pickUpTime,
      pickUpOdometer,
      dropOffLocation, // Back to home/original pickup
      dropOffTime,
      dropOffOdometer,
      tripType: TripType.ROUND_TRIP,
      reasonForVisit,
      escort: escort
        ? {
            name: escort.name,
            relationship: escort.relationship as any,
          }
        : undefined,
    };
  }
}

// ============================================================================
// REPORT FORMATTER - Convert to readable/exportable formats
// ============================================================================

export class TripReportFormatter {
  /**
   * Format report as JSON (for API responses, storage)
   */
  static toJSON(report: AHCCCSTripReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Format report as human-readable text
   */
  static toText(report: AHCCCSTripReport): string {
    let text = "";

    text += "========== DAILY TRIP REPORT ==========\n\n";

    // Provider Header
    text += "PROVIDER INFORMATION\n";
    text += `ID: ${report.provider.ahcccsId}\n`;
    text += `Name: ${report.provider.name}\n`;
    text += `Address: ${report.provider.address}\n`;
    text += `Phone: ${report.provider.phoneNumber}\n\n`;

    // Report Metadata
    text += "REPORT DETAILS\n";
    text += `Date: ${report.reportDate.toISOString().split('T')[0]}\n`;
    text += `Document ID: ${report.documentId}\n`;
    text += `Page ${report.pageNumber} of ${report.totalPages}\n\n`;

    // Driver & Vehicle
    text += "TRANSPORTATION DETAILS\n";
    text += `Driver: ${report.driver.name}\n`;
    text += `Vehicle: ${report.vehicle.make} ${report.vehicle.color} (${report.vehicle.type})\n`;
    text += `Fleet ID: ${report.vehicle.fleetId}\n\n`;

    // Member
    text += "MEMBER INFORMATION\n";
    text += `AHCCCS #: ${report.member.ahcccsId}\n`;
    text += `Name: ${report.member.name}\n`;
    text += `DOB: ${report.member.dateOfBirth.toISOString().split('T')[0]}\n`;
    text += `Address: ${report.member.mailingAddress.street}, ${report.member.mailingAddress.city}, ${report.member.mailingAddress.state} ${report.member.mailingAddress.zipCode}\n\n`;

    // Trip Legs
    text += "TRIP DETAILS\n";
    report.tripLegs.forEach((leg, index) => {
      text += `\n--- Trip ${index + 1} ---\n`;
      text += `Type: ${leg.tripType}\n`;
      text += `Pickup: ${leg.pickUpLocation.physicalAddress || leg.pickUpLocation.landmark || "GPS"} @ ${leg.pickUpTime.toLocaleTimeString()}\n`;
      text += `Dropoff: ${leg.dropOffLocation.physicalAddress || leg.dropOffLocation.landmark || "GPS"} @ ${leg.dropOffTime.toLocaleTimeString()}\n`;
      text += `Miles: ${leg.tripMiles} (ODO: ${leg.pickUpOdometer} → ${leg.dropOffOdometer})\n`;
      text += `Reason: ${leg.reasonForVisit}\n`;
      if (leg.escort) {
        text += `Escort: ${leg.escort.name} (${leg.escort.relationship})\n`;
      }
    });

    // Carpool info
    if (report.carpool?.multipleMembers) {
      text += `\n\nCARPOOL: Multiple members transported\n`;
      text += `Different Locations: ${report.carpool.differentPickDropLocations ? 'Yes' : 'No'}\n`;
    }

    // Signatures
    text += "\n\nSIGNATURES\n";
    text += `Driver: ${report.attestation.driver.name} (${report.attestation.driver.method})\n`;
    text += `Member: ${report.attestation.member.name} (${report.attestation.member.method})\n`;
    text += `Signed: ${report.attestation.complianceTimestamp.toISOString()}\n`;

    // Compliance
    text += "\n\nCOMPLIANCE\n";
    text += `Audit Trail ID: ${report.compliance.auditTrailId}\n`;
    text += `Submission: ${report.compliance.submissionTimestamp.toISOString()} via ${report.compliance.submissionMethod}\n`;
    text += `Completed by: ${report.compliance.completedBy}\n`;

    return text;
  }

  /**
   * Format report for PDF generation (returns object for PDF library)
   */
  static toPDFData(report: AHCCCSTripReport): Record<string, any> {
    return {
      provider: {
        ahcccsId: report.provider.ahcccsId,
        name: report.provider.name,
        address: report.provider.address,
        phoneNumber: report.provider.phoneNumber,
      },
      reportDate: report.reportDate.toISOString().split('T')[0],
      pageNumber: report.pageNumber,
      totalPages: report.totalPages,
      driverName: report.driver.name,
      vehicleFleetId: report.vehicle.fleetId,
      vehicleInfo: `${report.vehicle.make} ${report.vehicle.color}`,
      vehicleType: report.vehicle.type,
      memberAhcccsId: report.member.ahcccsId,
      memberName: report.member.name,
      memberDOB: report.member.dateOfBirth.toISOString().split('T')[0],
      memberAddress: `${report.member.mailingAddress.street}, ${report.member.mailingAddress.city}, ${report.member.mailingAddress.state} ${report.member.mailingAddress.zipCode}`,
      tripLegs: report.tripLegs.map((leg, index) => ({
        legNumber: index + 1,
        pickUpLocation: leg.pickUpLocation.physicalAddress || leg.pickUpLocation.landmark || `GPS: ${leg.pickUpLocation.geoCoordinates?.latitude}, ${leg.pickUpLocation.geoCoordinates?.longitude}`,
        pickUpTime: leg.pickUpTime.toLocaleTimeString(),
        pickUpOdometer: leg.pickUpOdometer,
        dropOffLocation: leg.dropOffLocation.physicalAddress || leg.dropOffLocation.landmark || `GPS: ${leg.dropOffLocation.geoCoordinates?.latitude}, ${leg.dropOffLocation.geoCoordinates?.longitude}`,
        dropOffTime: leg.dropOffTime.toLocaleTimeString(),
        dropOffOdometer: leg.dropOffOdometer,
        tripMiles: leg.tripMiles,
        tripType: leg.tripType,
        reasonForVisit: leg.reasonForVisit,
        escort: leg.escort ? `${leg.escort.name} (${leg.escort.relationship})` : "None",
      })),
      carpoolInfo: report.carpool
        ? {
            multipleMembers: report.carpool.multipleMembers,
            differentLocations: report.carpool.differentPickDropLocations,
          }
        : null,
      additionalNotes: report.additionalNotes || "None",
      driverSignature: report.attestation.driver.name,
      memberSignature: report.attestation.member.name,
      attestationDate: report.attestation.complianceTimestamp.toISOString().split('T')[0],
      auditTrailId: report.compliance.auditTrailId,
      submissionMethod: report.compliance.submissionMethod,
    };
  }
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

// Re-exports removed to avoid duplicate identifier issues
// Please import models directly from ./trip-report-models
