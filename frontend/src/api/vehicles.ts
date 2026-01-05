import api from '../lib/api';

export enum DocumentType {
    INSURANCE = 'INSURANCE',
    REGISTRATION = 'REGISTRATION',
    OTHER = 'OTHER',
}

export interface VehicleDocument {
    id: string;
    vehicleId: string;
    documentType: DocumentType;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
    expiresAt?: string;
    notes?: string;
}

export interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    vehicleNumber: string;
    status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
    type: 'SEDAN' | 'VAN' | 'SUV' | 'TRUCK';
    capacity: number;
    isAccessible: boolean;
    lastServiceDate: string;
    nextServiceMileage: number;
    currentMileage: number;
}

export const vehicleApi = {
    getAll: () => api.get('/vehicles').then(res => res.data),
    getVehicles: () => api.get('/vehicles').then(res => res.data),
    getVehicleById: (id: string) => api.get(`/vehicles/${id}`).then(res => res.data),
    create: (data: Partial<Vehicle>) => api.post('/vehicles', data).then(res => res.data),

    // Documents
    getDocuments: (vehicleId: string) => api.get(`/vehicles/${vehicleId}/documents`).then(res => res.data),
    uploadDocument: (vehicleId: string, file: File, type: DocumentType, expiresAt?: string, notes?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', type);
        if (expiresAt) formData.append('expiresAt', expiresAt);
        if (notes) formData.append('notes', notes);

        return api.post(`/vehicles/${vehicleId}/documents`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).then(res => res.data);
    },
    deleteDocument: (documentId: string) => api.delete(`/vehicles/documents/${documentId}`).then(res => res.data),
    getDownloadUrl: (documentId: string) => `${api.defaults.baseURL}/vehicles/documents/${documentId}/download`,
};
