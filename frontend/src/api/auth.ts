import api from '../lib/api';
import { User } from '../store/auth';

export interface DriverDocument {
    id: string;
    userId: string;
    documentType: 'LICENSE' | 'INSURANCE' | 'BACKGROUND_CHECK';
    fileUrl: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    expiryDate: string | null;
    notes: string | null;
    createdAt: string;
}

export interface DriverRegistrationData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    licenseNumber: string;
    licenseState?: string;
    vehiclePlate?: string;
}

export const authApi = {
    registerDriver: async (data: DriverRegistrationData) => {
        const response = await api.post('/auth/register-driver', data);
        return response.data;
    },

    uploadDocument: async (data: FormData) => {
        const response = await api.post('/auth/documents', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    getMyDocuments: async (): Promise<DriverDocument[]> => {
        const response = await api.get('/auth/documents');
        return response.data;
    },

    getDriverDocuments: async (driverId: string): Promise<DriverDocument[]> => {
        const response = await api.get(`/auth/drivers/${driverId}/documents`);
        return response.data;
    },

    reviewDocument: async (docId: string, data: { status: string, notes?: string }) => {
        const response = await api.patch(`/auth/documents/${docId}/review`, data);
        return response.data;
    },

    approveDriver: async (driverId: string) => {
        const response = await api.post(`/auth/drivers/${driverId}/approve`);
        return response.data;
    },

    updateProfile: async (data: Partial<User>) => {
        const response = await api.patch('/auth/profile', data);
        return response.data;
    }
};
