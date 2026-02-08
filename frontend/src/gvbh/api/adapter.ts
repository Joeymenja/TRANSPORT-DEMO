/**
 * GVBH API Adapter
 * Connects the GVBH frontend types to TRANSPORT-DEMO backend API
 */

import { format } from 'date-fns';
import { tripApi, Trip as BackendTrip } from '../../api/trips';
import { Trip as FrontendTrip, TripStatus, Client } from '../types';

// Map backend status to GVBH frontend status
const mapStatus = (status: string): TripStatus => {
  const statusMap: Record<string, TripStatus> = {
    'PENDING_APPROVAL': TripStatus.SCHEDULED,
    'SCHEDULED': TripStatus.SCHEDULED,
    'IN_PROGRESS': TripStatus.IN_PROGRESS_TRANSIT,
    'WAITING_FOR_CLIENTS': TripStatus.IN_PROGRESS_PICKUP,
    'COMPLETED': TripStatus.COMPLETED,
    'FINALIZED': TripStatus.COMPLETED,
    'CANCELLED': TripStatus.CANCELLED,
  };
  return statusMap[status] || TripStatus.SCHEDULED;
};

// Map backend trip to GVBH frontend trip format
export const adaptBackendTrip = (trip: BackendTrip): FrontendTrip => {
  const pickupStop = trip.stops?.find((s: any) => s.stopType === 'PICKUP');
  const dropoffStop = trip.stops?.find((s: any) => s.stopType === 'DROPOFF');
  const member = trip.members?.[0];

  const client: Client = {
    id: member?.id || trip.id,
    name: member ? `${member.firstName || ''} ${member.lastName || ''}`.trim() : 'Unknown Member',
    memberId: member?.ahcccsId || 'N/A',
    phone: member?.phone || '',
    dob: member?.dob,
    mailingAddress: member?.address,
    mobilityNeeds: trip.mobilityRequirement ? [formatMobilityType(trip.mobilityRequirement)] : ['Ambulatory'],
    specialInstructions: member?.notes || trip.reasonForVisit,
  };

  // Parse additional passengers for carpools
  const passengers: Client[] = trip.isCarpool && trip.members?.length > 1
    ? trip.members.slice(1).map((m: any) => ({
        id: m.id,
        name: `${m.firstName || ''} ${m.lastName || ''}`.trim(),
        memberId: m.ahcccsId || '',
        phone: m.phone || '',
        mobilityNeeds: [],
      }))
    : undefined;

  return {
    id: trip.id,
    client,
    passengers,
    scheduledTime: pickupStop?.scheduledTime
      ? format(new Date(pickupStop.scheduledTime), 'h:mm a')
      : format(new Date(trip.tripDate), 'h:mm a'),
    appointmentTime: dropoffStop?.scheduledTime
      ? format(new Date(dropoffStop.scheduledTime), 'h:mm a')
      : undefined,
    pickupAddress: pickupStop?.address || 'Address pending',
    dropoffAddress: dropoffStop?.address || 'Address pending',
    pickupFacility: pickupStop?.facilityName,
    dropoffFacility: dropoffStop?.facilityName,
    status: mapStatus(trip.status),
    estimatedDistance: calculateDistance(pickupStop, dropoffStop),
    estimatedDuration: calculateDuration(pickupStop, dropoffStop),
    type: trip.isCarpool ? 'CARPOOL' : 'SINGLE',
    equipmentRequired: getEquipmentRequired(trip.mobilityRequirement),
    reasonForVisit: trip.reasonForVisit,
    escortName: trip.escortName,
    escortRelationship: trip.escortRelationship,
  };
};

// Helper: Format mobility requirement for display
const formatMobilityType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'AMBULATORY': 'Ambulatory',
    'WHEELCHAIR': 'Wheelchair',
    'STRETCHER': 'Stretcher',
    'CAR_SEAT': 'Car Seat',
    'BURIATRIC_WHEELCHAIR': 'Bariatric Wheelchair',
  };
  return typeMap[type] || type;
};

// Helper: Get equipment required based on mobility type
const getEquipmentRequired = (mobilityType?: string): string[] => {
  if (!mobilityType) return [];
  
  const equipmentMap: Record<string, string[]> = {
    'WHEELCHAIR': ['Wheelchair Ramp', 'Securement System'],
    'STRETCHER': ['Stretcher', 'Medical Equipment'],
    'CAR_SEAT': ['Child Car Seat'],
    'BURIATRIC_WHEELCHAIR': ['Bariatric Wheelchair Ramp', 'Heavy Duty Securement'],
  };
  return equipmentMap[mobilityType] || [];
};

// Helper: Calculate estimated distance (placeholder - would use GPS in real implementation)
const calculateDistance = (pickup: any, dropoff: any): number => {
  // In real implementation, use Google Maps Distance Matrix API
  // For now, return random realistic distance
  return Math.round((Math.random() * 15 + 2) * 10) / 10;
};

// Helper: Calculate estimated duration in minutes
const calculateDuration = (pickup: any, dropoff: any): number => {
  // In real implementation, calculate from distance and traffic
  return Math.round(Math.random() * 30 + 10);
};

// === API Functions ===

// Fetch all trips and convert to GVBH format
export const fetchTrips = async (): Promise<FrontendTrip[]> => {
  try {
    const backendTrips = await tripApi.getTrips();
    return backendTrips.map(adaptBackendTrip);
  } catch (error) {
    console.error('Failed to fetch trips:', error);
    return [];
  }
};

// Fetch trips for a specific date
export const fetchTripsByDate = async (date: Date): Promise<FrontendTrip[]> => {
  try {
    const dateStr = format(date, 'yyyy-MM-dd');
    const backendTrips = await tripApi.getTrips({ date: dateStr });
    return backendTrips.map(adaptBackendTrip);
  } catch (error) {
    console.error('Failed to fetch trips by date:', error);
    return [];
  }
};

// Fetch a single trip by ID
export const fetchTripById = async (id: string): Promise<FrontendTrip | null> => {
  try {
    const backendTrip = await tripApi.getTripById(id);
    return adaptBackendTrip(backendTrip);
  } catch (error) {
    console.error('Failed to fetch trip:', error);
    return null;
  }
};

// Update trip status
export const updateTripStatus = async (id: string, status: TripStatus): Promise<boolean> => {
  try {
    // Map GVBH status back to backend status
    const backendStatusMap: Record<TripStatus, string> = {
      [TripStatus.SCHEDULED]: 'SCHEDULED',
      [TripStatus.STARTING_SOON]: 'SCHEDULED',
      [TripStatus.IN_PROGRESS_PICKUP]: 'IN_PROGRESS',
      [TripStatus.IN_PROGRESS_TRANSIT]: 'IN_PROGRESS',
      [TripStatus.IN_PROGRESS_DROPOFF]: 'IN_PROGRESS',
      [TripStatus.COMPLETED]: 'COMPLETED',
      [TripStatus.CANCELLED]: 'CANCELLED',
      [TripStatus.NO_SHOW]: 'CANCELLED',
    };
    
    await tripApi.updateTrip(id, { status: backendStatusMap[status] as any });
    return true;
  } catch (error) {
    console.error('Failed to update trip status:', error);
    return false;
  }
};

// Start a trip (set to IN_PROGRESS)
export const startTrip = async (id: string): Promise<boolean> => {
  return updateTripStatus(id, TripStatus.IN_PROGRESS_PICKUP);
};

// Complete a trip
export const completeTrip = async (id: string): Promise<boolean> => {
  return updateTripStatus(id, TripStatus.COMPLETED);
};

// Export the adapter API
export const gvbhApi = {
  fetchTrips,
  fetchTripsByDate,
  fetchTripById,
  updateTripStatus,
  startTrip,
  completeTrip,
  adaptBackendTrip,
};

export default gvbhApi;
