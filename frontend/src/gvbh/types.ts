
export enum AccountState {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  INCOMPLETE_PROFILE = 'INCOMPLETE_PROFILE',
  PENDING_BACKGROUND = 'PENDING_BACKGROUND',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE'
}

export enum TripStatus {
  SCHEDULED = 'SCHEDULED',
  STARTING_SOON = 'STARTING_SOON',
  IN_PROGRESS_PICKUP = 'IN_PROGRESS_PICKUP',
  IN_PROGRESS_TRANSIT = 'IN_PROGRESS_TRANSIT',
  IN_PROGRESS_DROPOFF = 'IN_PROGRESS_DROPOFF',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export enum VehicleType {
  WHEELCHAIR_VAN = 'Wheelchair Van',
  TAXI = 'Taxi',
  BUS = 'Bus',
  STRETCHER_CAR = 'Stretcher Car',
  OTHER = 'Other'
}

export interface Client {
  id: string;
  name: string;
  memberId: string;
  phone: string;
  photo?: string;
  dob?: string;
  mailingAddress?: string;
  mobilityNeeds: string[];
  specialInstructions?: string;
}

export interface Trip {
  id: string;
  client: Client;
  passengers?: Client[]; // For Carpools
  scheduledTime: string;
  appointmentTime?: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupFacility?: string;
  dropoffFacility?: string;
  status: TripStatus;
  estimatedDistance: number;
  estimatedDuration: number;
  type: 'SINGLE' | 'CARPOOL';
  equipmentRequired?: string[];
  isAdHoc?: boolean;
  specialInstructions?: string;
  reasonForVisit?: string;
  escortName?: string;
  escortRelationship?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  type: 'TEXT' | 'SYSTEM' | 'IMAGE';
}

export interface DriverProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  accountState: AccountState;
  profilePhoto?: string;
  onboardingStep: number;
  vehicle?: {
    year: string;
    make: string;
    model: string;
    plate: string;
    vin: string;
    insuranceExp: string;
    regExp: string;
    fleetId: string;
    color: string;
    type: VehicleType;
  };
}

export interface ReportData {
  appointmentType: string;
  reasonForVisit: string;
  escortName?: string;
  escortRelationship?: string;
  facilityName: string;
  checkedIn: boolean;
  staffAck: boolean;
  equipmentUsed: string[];
  incidents: string;
  notes: string;
  verificationMethod: 'physical' | 'digital' | 'staff';
  multiMemberTrip: boolean;
  differentLocations: boolean;
  tripType: 'ONE_WAY' | 'ROUND_TRIP' | 'MULTIPLE_STOPS';
  additionalInfo?: string;
}
