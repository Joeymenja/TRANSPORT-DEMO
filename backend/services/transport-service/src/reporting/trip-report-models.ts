/**
 * AHCCCS Daily Trip Report Data Models
 * Full compliance mapping for GVBH Transportation
 */

// ============================================================================
// ENUMS FOR STRICT TYPE SAFETY
// ============================================================================

export enum VehicleType {
  WHEELCHAIR_VAN = "wheelchair_van",
  TAXI = "taxi",
  STRETCHER_CAR = "stretcher_car",
  MINI_VAN = "mini_van",
  BUS = "bus",
  OTHER = "other"
}

export enum TripType {
  ONE_WAY = "one_way",
  ROUND_TRIP = "round_trip",
  MULTIPLE_STOPS = "multiple_stops"
}

export enum RelationshipType {
  SELF = "self",
  PARENT = "parent",
  GUARDIAN = "guardian",
  SPOUSE = "spouse",
  CHILD = "child",
  SIBLING = "sibling",
  FRIEND = "friend",
  CAREGIVER = "caregiver",
  ATTENDANT = "attendant",
  OTHER = "other"
}

export enum SignatureMethod {
  MEMBER_SIGNATURE = "member_signature",
  ATTENDANT_SIGNATURE = "attendant_signature",
  ESCORT_SIGNATURE = "escort_signature",
  GUARDIAN_SIGNATURE = "guardian_signature",
  PARENT_SIGNATURE = "parent_signature",
  PROVIDER_SIGNATURE = "provider_signature",
  FINGERPRINT = "fingerprint"
}

// ============================================================================
// LOCATION & COORDINATES (GPS TRACKING COMPLIANCE)
// ============================================================================

export interface GeoCoordinates {
  latitude: number; // Required for AHCCCS audit trail
  longitude: number; // Required for AHCCCS audit trail
  timestamp: Date; // When coordinates were captured
  accuracy?: number; // GPS accuracy in meters
}

export interface LocationData {
  physicalAddress?: string; // Street address if available
  city?: string;
  zipCode?: string;
  geoCoordinates?: GeoCoordinates; // Fallback if no address available
  landmark?: string; // Named landmark if no address available
  notes?: string; // Additional location context
}

// Validator: At least one location identifier required
export function validateLocation(location: LocationData): boolean {
  return !!(
    location.physicalAddress ||
    (location.geoCoordinates && location.geoCoordinates.latitude && location.geoCoordinates.longitude) ||
    location.landmark
  );
}

// ============================================================================
// SINGLE TRIP LEG DATA (Repeatable Unit)
// ============================================================================

export interface TripLeg {
  legNumber: number; // 1-6 for the form structure
  pickUpLocation: LocationData; // 1st, 2nd, 3rd, etc. pick-up
  pickUpTime: Date;
  pickUpOdometer: number; // Odometer reading in miles
  
  dropOffLocation: LocationData; // Corresponding drop-off
  dropOffTime: Date;
  dropOffOdometer: number;
  
  tripMiles: number; // Calculated: dropOffOdometer - pickUpOdometer
  tripType: TripType;
  reasonForVisit: string; // Medical appointment type, etc.
  
  escort?: EscortInfo; // Optional companion
}

// Calculator function
export function calculateTripMiles(pickUpOdo: number, dropOffOdo: number): number {
  return Math.abs(dropOffOdo - pickUpOdo);
}

// ============================================================================
// ESCORT / COMPANION DATA
// ============================================================================

export interface EscortInfo {
  name: string;
  relationship: RelationshipType;
  relationshipOther?: string; // If relationship === OTHER
}

// ============================================================================
// MEMBER / CLIENT DATA (HIPAA-SENSITIVE)
// ============================================================================

export interface MemberData {
  ahcccsId: string; // AHCCCS member ID - CRITICAL for compliance
  dateOfBirth: Date;
  name: string;
  mailingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

// ============================================================================
// DRIVER DATA
// ============================================================================

export interface DriverData {
  name: string;
  // Additional fields can be added as needed (license, background check, etc.)
}

// ============================================================================
// VEHICLE DATA
// ============================================================================

export interface VehicleData {
  fleetId: string; // Vehicle License/Fleet ID
  make: string;
  color: string;
  type: VehicleType;
  otherTypeDescription?: string; // If type === OTHER
}

// ============================================================================
// SIGNATURE & ATTESTATION DATA (LEGAL COMPLIANCE)
// ============================================================================

export interface SignatureData {
  name: string;
  method: SignatureMethod;
  timestamp: Date;
  signatureImageUrl?: string; // Path to digital signature capture
  signatureBase64?: string; // Base64 signature data
  fingerprint?: string; // Base64 fingerprint image if applicable
  signingRole: "member" | "attendant" | "escort" | "guardian" | "parent" | "provider";
}

export interface LegalAttestation {
  statement: string; // Standard AHCCCS legal statement
  driver: SignatureData;
  member: SignatureData;
  complianceTimestamp: Date; // When attestation was completed
}

// ============================================================================
// MULTI-MEMBER CARPOOL DATA (KEY PAIN POINT SOLUTION)
// ============================================================================

export interface CarpoolData {
  multipleMembers: boolean;
  differentPickDropLocations: boolean;
  members: MemberData[]; // All members in this vehicle on this date
  // NOTE: In carpool situations, EACH member gets a separate trip report
  // This structure helps track which members were involved in which vehicle
  vehicleUsageLog?: {
    memberId: string;
    pickUpTime: Date;
    dropOffTime: Date;
  }[];
}

// ============================================================================
// COMPLETE TRIP REPORT (MAIN DOCUMENT)
// ============================================================================

export interface AHCCCSTripReport {
  // ========== PROVIDER INFORMATION (Header)
  provider: {
    ahcccsId: string; // GVBH's provider ID
    name: string;
    address: string;
    phoneNumber: string;
  };

  // ========== REPORT METADATA
  reportDate: Date; // Date of transportation service
  pageNumber: number; // For multi-page reports
  totalPages: number;
  documentId: string; // Unique identifier for audit trail

  // ========== TRANSPORTATION DETAILS
  driver: DriverData;
  vehicle: VehicleData;
  
  // ========== MEMBER / CLIENT INFORMATION
  // CRITICAL: One report per member per day as per AHCCCS rules
  member: MemberData;

  // ========== TRIP LEGS (Up to 6 per form, but can span multiple forms)
  tripLegs: TripLeg[]; // Array of 1-6 trip segments

  // ========== CARPOOL INFORMATION
  carpool?: CarpoolData;

  // ========== ADDITIONAL INFORMATION
  additionalNotes?: string;

  // ========== LEGAL SIGNATURES & ATTESTATION
  attestation: LegalAttestation;

  // ========== COMPLIANCE METADATA
  compliance: {
    hipaaEncrypted: boolean;
    auditTrailId: string; // For regulatory verification
    submissionTimestamp: Date;
    submissionMethod: "digital" | "paper" | "mobile_app";
    completedBy: string; // Username/ID of who completed
  };
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export class TripReportValidator {
  /**
   * Comprehensive validation of AHCCCS Trip Report
   * Returns detailed compliance check results
   */
  static validate(report: AHCCCSTripReport): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Provider validation
    if (!report.provider.ahcccsId) errors.push("Provider AHCCCS ID is required");
    if (!report.provider.name) errors.push("Provider name is required");

    // Member validation (CRITICAL)
    if (!report.member.ahcccsId) errors.push("Member AHCCCS ID is required");
    if (!report.member.name) errors.push("Member name is required");
    if (!report.member.dateOfBirth) errors.push("Member date of birth is required");

    // Driver validation
    if (!report.driver.name) errors.push("Driver name is required");

    // Vehicle validation
    if (!report.vehicle.fleetId) errors.push("Vehicle Fleet ID is required");
    if (!report.vehicle.type) errors.push("Vehicle type is required");

    // Trip legs validation
    if (report.tripLegs.length === 0) {
      errors.push("At least one trip leg is required");
    }

    report.tripLegs.forEach((leg, index) => {
      if (!validateLocation(leg.pickUpLocation)) {
        errors.push(`Trip ${index + 1}: Pick-up location must have address, coordinates, or landmark`);
      }
      if (!validateLocation(leg.dropOffLocation)) {
        errors.push(`Trip ${index + 1}: Drop-off location must have address, coordinates, or landmark`);
      }
      if (!leg.pickUpTime) errors.push(`Trip ${index + 1}: Pick-up time is required`);
      if (!leg.dropOffTime) errors.push(`Trip ${index + 1}: Drop-off time is required`);
      if (leg.pickUpOdometer === undefined || leg.pickUpOdometer === null) {
        errors.push(`Trip ${index + 1}: Pick-up odometer reading is required`);
      }
      if (leg.dropOffOdometer === undefined || leg.dropOffOdometer === null) {
        errors.push(`Trip ${index + 1}: Drop-off odometer reading is required`);
      }
      if (!leg.reasonForVisit) {
        warnings.push(`Trip ${index + 1}: Reason for visit is recommended`);
      }
      if (leg.tripType === undefined) errors.push(`Trip ${index + 1}: Trip type is required`);
    });

    // Signature validation (LEGAL REQUIREMENT)
    if (!report.attestation.driver) errors.push("Driver signature is required");
    if (!report.attestation.member) errors.push("Member or authorized representative signature is required");

    // Compliance metadata
    if (!report.compliance.auditTrailId) errors.push("Audit trail ID is required");
    if (!report.compliance.submissionTimestamp) errors.push("Submission timestamp is required");

    // Carpool-specific validation
    if (report.carpool?.multipleMembers && report.carpool.differentPickDropLocations === undefined) {
      warnings.push("Clarify if pick-up/drop-off locations differ for multiple members");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate a single location field
   */
  static validateLocationField(location: LocationData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!validateLocation(location)) {
      errors.push("Location must contain at least one identifier: physical address, GPS coordinates, or landmark");
    }

    if (location.geoCoordinates) {
      if (location.geoCoordinates.latitude < -90 || location.geoCoordinates.latitude > 90) {
        errors.push("Invalid latitude value");
      }
      if (location.geoCoordinates.longitude < -180 || location.geoCoordinates.longitude > 180) {
        errors.push("Invalid longitude value");
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate odometer sequence (should be increasing)
   */
  static validateOdometerSequence(tripLegs: TripLeg[]): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    for (let i = 0; i < tripLegs.length - 1; i++) {
      const currentDropOdo = tripLegs[i].dropOffOdometer;
      const nextPickOdo = tripLegs[i + 1].pickUpOdometer;

      if (nextPickOdo < currentDropOdo) {
        issues.push(
          `Trip ${i + 1} to ${i + 2}: Odometer reading decreased. Trip ${i + 1} ended at ${currentDropOdo}, ` +
          `but Trip ${i + 2} started at ${nextPickOdo}`
        );
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

// ============================================================================
// FACTORY FUNCTION - Create Report from API Data
// ============================================================================

export function createTripReport(data: Partial<AHCCCSTripReport>): AHCCCSTripReport {
  const report: AHCCCSTripReport = {
    provider: data.provider || { ahcccsId: "", name: "", address: "", phoneNumber: "" },
    reportDate: data.reportDate || new Date(),
    pageNumber: data.pageNumber || 1,
    totalPages: data.totalPages || 1,
    documentId: data.documentId || `TRIP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    driver: data.driver || { name: "" },
    vehicle: data.vehicle || { fleetId: "", make: "", color: "", type: VehicleType.OTHER },
    member: data.member || { ahcccsId: "", dateOfBirth: new Date(), name: "", mailingAddress: { street: "", city: "", state: "", zipCode: "" } },
    tripLegs: data.tripLegs || [],
    carpool: data.carpool,
    additionalNotes: data.additionalNotes,
    attestation: data.attestation || {
      statement: "This is to certify that the information is true, accurate and complete. I understand that payment and satisfaction of this claim will be from Federal and State funds, and that any false claims, statements or documents, or concealment of a material fact, may be prosecuted under applicable Federal or State laws.",
      driver: { name: "", method: SignatureMethod.MEMBER_SIGNATURE, timestamp: new Date(), signingRole: "provider" },
      member: { name: "", method: SignatureMethod.MEMBER_SIGNATURE, timestamp: new Date(), signingRole: "member" },
      complianceTimestamp: new Date()
    },
    compliance: data.compliance || {
      hipaaEncrypted: true,
      auditTrailId: `AUDIT_${Date.now()}`,
      submissionTimestamp: new Date(),
      submissionMethod: "mobile_app",
      completedBy: ""
    }
  };

  return report;
}

// ============================================================================
// TYPE EXPORTS FOR INTEGRATION
// ============================================================================

export type TripReportInput = Partial<AHCCCSTripReport>;
export type ValidationResult = ReturnType<typeof TripReportValidator.validate>;
