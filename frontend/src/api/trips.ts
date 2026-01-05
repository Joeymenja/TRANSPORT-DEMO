import api from '../lib/api';

export interface Trip {
    id: string;
    organizationId: string;
    tripDate: Date;
    assignedDriverId: string;
    assignedVehicleId: string;
    assignedVehicle?: {
        id: string;
        organizationId: string;
        vehicleNumber: string;
        make: string;
        model: string;
        year: number;
        licensePlate: string;
        vin: string;
        capacity: number;
        odometer: number;
        color: string;
        vehicleType: string;
        isActive: boolean;
    };
    tripType: 'DROP_OFF' | 'PICK_UP' | 'ROUND_TRIP';
    isCarpool: boolean;
    status: 'PENDING_APPROVAL' | 'SCHEDULED' | 'IN_PROGRESS' | 'WAITING_FOR_CLIENTS' | 'COMPLETED' | 'FINALIZED' | 'CANCELLED';
    reasonForVisit?: string;
    escortName?: string;
    escortRelationship?: string;
    reportStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'ARCHIVED';
    reportFilePath?: string;
    reportRejectionReason?: string;
    reportVerifiedAt?: string;
    reportVerifiedBy?: string;
    memberCount: number;
    stops: any[];
    members: any[];
    mobilityRequirement: 'AMBULATORY' | 'WHEELCHAIR' | 'STRETCHER' | 'CAR_SEAT';
    createdAt: Date;
}

export interface CreateTripData {
    tripDate: Date;
    assignedDriverId?: string;
    assignedVehicleId?: string;
    assignedVehicle?: {
        id: string;
        organizationId: string;
        vehicleNumber: string;
        make: string;
        model: string;
        year: number;
        licensePlate: string;
        vin: string;
        capacity: number;
        odometer: number;
        color: string;
        vehicleType: string;
        isActive: boolean;
    };
    tripType?: 'DROP_OFF' | 'PICK_UP' | 'ROUND_TRIP';
    isCarpool?: boolean;
    reasonForVisit?: string;
    escortName?: string;
    escortRelationship?: string;
    members: { memberId: string }[];
    stops: {
        stopType: 'PICKUP' | 'DROPOFF';
        stopOrder: number;
        address: string;
        gpsLatitude?: number;
        gpsLongitude?: number;
        scheduledTime?: Date;
    }[];
    mobilityRequirement?: 'AMBULATORY' | 'WHEELCHAIR' | 'STRETCHER' | 'CAR_SEAT';
}

export const tripApi = {
    getTrips: async (queryParams?: { date?: string, startDate?: string, endDate?: string, memberId?: string }): Promise<Trip[]> => {
        const { data } = await api.get('/trips', { params: queryParams });
        return data;
    },

    getTripById: async (id: string): Promise<Trip> => {
        const { data } = await api.get(`/trips/${id}`);
        return data;
    },

    createTrip: async (tripData: CreateTripData): Promise<Trip> => {
        console.log('Creating trip with data:', tripData);
        const { data } = await api.post('/trips', tripData);
        console.log('Trip created, response:', data);
        return data;
    },

    createTripsBulk: async (tripData: CreateTripData[]): Promise<Trip[]> => {
        const { data } = await api.post('/trips/bulk', tripData);
        return data;
    },

    verifyReport: async (tripId: string): Promise<Trip> => {
        const { data } = await api.post(`/trips/${tripId}/report/verify`);
        return data;
    },

    rejectReport: async (tripId: string, reason: string): Promise<Trip> => {
        const { data } = await api.post(`/trips/${tripId}/report/reject`, { reason });
        return data;
    },

    startTrip: async (id: string): Promise<Trip> => {
        const { data } = await api.post(`/trips/${id}/start`);
        return data;
    },

    completeTrip: async (id: string): Promise<Trip> => {
        const { data } = await api.post(`/trips/${id}/complete`);
        return data;
    },

    downloadReport: async (id: string): Promise<void> => {
        const response = await api.get(`/trips/${id}/report`, {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `trip-report-${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    cancelTrip: async (tripId: string, reason: string, notes?: string): Promise<Trip> => {
        const { data } = await api.post(`/trips/${tripId}/cancel`, { reason, notes });
        return data;
    },

    markNoShow: async (tripId: string, notes: string, attemptedContact: boolean = false): Promise<Trip> => {
        const { data } = await api.post(`/trips/${tripId}/no-show`, { notes, attemptedContact });
        return data;
    },

    arriveAtStop: async (tripId: string, stopId: string, gps?: { lat: number, lng: number }): Promise<any> => {
        const { data } = await api.post(`/trips/${tripId}/stops/${stopId}/arrive`, {
            gpsLatitude: gps?.lat,
            gpsLongitude: gps?.lng,
        });
        return data;
    },

    saveSignature: async (tripId: string, memberId: string, signatureBase64: string, proxyData?: { isProxy?: boolean, proxySignerName?: string, proxyRelationship?: string, proxyReason?: string }): Promise<any> => {
        const { data } = await api.post(`/trips/${tripId}/members/${memberId}/signature`, {
            signatureBase64,
            ...proxyData
        });
        return data;
    },

    completeStop: async (tripId: string, stopId: string, odometerReading?: number): Promise<any> => {
        const { data } = await api.post(`/trips/${tripId}/stops/${stopId}/complete`, { odometerReading });
        return data;
    },

    markMemberReady: async (tripId: string, memberId: string): Promise<any> => {
        const { data } = await api.post(`/trips/${tripId}/members/${memberId}/ready`);
        return data;
    },

    updateTrip: async (id: string, updates: Partial<Trip>): Promise<Trip> => {
        const { data } = await api.put(`/trips/${id}`, updates);
        return data;
    },

    getDriverTrips: async (driverId: string): Promise<Trip[]> => {
        const { data } = await api.get(`/trips/driver/${driverId}`);
        return data;
    }
};
