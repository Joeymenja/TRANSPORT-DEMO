import axios from 'axios';

const API_URL = 'http://localhost:3003'; // Transport Service

export interface TripReport {
    id: string;
    tripId: string;
    pickupTime?: string;
    dropoffTime?: string;
    startOdometer?: number;
    endOdometer?: number;
    totalMiles?: number;
    appointmentType?: string;
    serviceVerified: boolean;
    clientArrived: boolean;
    clientCheckedIn: boolean;
    incidentReported: boolean;
    incidentDescription?: string;
    driverNotes?: string;
    status: 'DRAFT' | 'SUBMITTED';
    signatures?: Signature[];
}

export interface Signature {
    id: string;
    type: 'DRIVER' | 'CLIENT' | 'FACILITY';
    signerName: string;
    signatureUrl: string;
    createdAt: string;
}

export const reportApi = {
    create: async (tripId: string, data: Partial<TripReport>): Promise<TripReport> => {
        const response = await axios.post(`${API_URL}/reports/${tripId}`, data);
        return response.data;
    },

    getByTripId: async (tripId: string): Promise<TripReport> => {
        const response = await axios.get(`${API_URL}/reports/${tripId}`);
        return response.data;
    },

    addSignature: async (reportId: string, data: {
        type: Signature['type'];
        signerName: string;
        signatureUrl: string;
        metadata?: any;
    }): Promise<Signature> => {
        const response = await axios.post(`${API_URL}/reports/${reportId}/signatures`, data);
        return response.data;
    },

    submit: async (reportId: string): Promise<TripReport> => {
        const response = await axios.put(`${API_URL}/reports/${reportId}/submit`);
        return response.data;
    },

    createAndSubmitReport: async (tripId: string, data: any): Promise<TripReport> => {
        const response = await axios.post(`${API_URL}/reports/trip/${tripId}/submit`, data);
        return response.data;
    },

    downloadPdf: async (tripId: string): Promise<Blob> => {
        const response = await axios.get(`${API_URL}/reports/${tripId}/pdf`, {
            responseType: 'blob',
        });
        return response.data;
    },
};
