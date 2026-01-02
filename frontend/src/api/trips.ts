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
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'WAITING_FOR_CLIENTS' | 'COMPLETED' | 'FINALIZED' | 'CANCELLED';
    memberCount: number;
    stops: any[];
    members: any[];
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
    members: { memberId: string }[];
    stops: {
        stopType: 'PICKUP' | 'DROPOFF';
        stopOrder: number;
        address: string;
        gpsLatitude?: number;
        gpsLongitude?: number;
        scheduledTime?: Date;
    }[];
}

export const tripApi = {
    getTrips: async (queryParams?: { date?: string, startDate?: string, endDate?: string }): Promise<Trip[]> => {
        const { data } = await api.get('/trips', { params: queryParams });
        return data;
    },

    getTripById: async (id: string): Promise<Trip> => {
        const { data } = await api.get(`/trips/${id}`);
        return data;
    },

    createTrip: async (tripData: CreateTripData): Promise<Trip> => {
        const { data } = await api.post('/trips', tripData);
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

    arriveAtStop: async (tripId: string, stopId: string, gps?: { lat: number, lng: number }): Promise<any> => {
        const { data } = await api.post(`/trips/${tripId}/stops/${stopId}/arrive`, {
            gpsLatitude: gps?.lat,
            gpsLongitude: gps?.lng,
        });
        return data;
    },

    saveSignature: async (tripId: string, memberId: string, signatureBase64: string): Promise<any> => {
        const { data } = await api.post(`/trips/${tripId}/members/${memberId}/signature`, {
            signatureBase64,
        });
        return data;
    },

    completeStop: async (tripId: string, stopId: string, odometerReading?: number): Promise<any> => {
        const { data } = await api.post(`/trips/${tripId}/stops/${stopId}/complete`, { odometerReading });
        return data;
    },
};
