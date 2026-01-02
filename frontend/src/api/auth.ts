import api from '../lib/api';

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

export const authApi = {
    registerDriver: async (data: any) => {
        const response = await api.post('/auth/register-driver', data);
        return response.data;
    },

    uploadDocument: async (data: { documentType: string, fileUrl: string, expiryDate?: string }) => {
        const response = await api.post('/auth/documents', data);
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
    }
};
