import api from '../lib/api';

export enum EmploymentStatus {
    FULL_TIME = 'FULL_TIME',
    PART_TIME = 'PART_TIME',
    CONTRACTOR = 'CONTRACTOR',
}

export interface Driver {
    id: string;
    userId: string;
    licenseNumber: string;
    licenseState: string;
    licenseExpiryDate: string;
    employmentStatus: EmploymentStatus;
    emergencyContactName: string;
    emergencyContactPhone: string;
    assignedVehicleId: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        isActive: boolean;
        onboardingStep?: number;
    };
    assignedVehicle?: {
        id: string;
        make: string;
        model: string;
        vehicleNumber: string;
    };
    currentStatus?: 'AVAILABLE' | 'ON_BREAK' | 'OFF_DUTY' | 'ON_TRIP';
    lastStatusUpdate?: string;
    currentLatitude?: number;
    currentLongitude?: number;
}

export interface CreateDriverDto {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    licenseNumber?: string;
    licenseState?: string;
    licenseExpiryDate?: string;
    employmentStatus?: EmploymentStatus;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    assignedVehicleId?: string;
}

export interface UpdateDriverDto {
    licenseNumber?: string;
    licenseState?: string;
    licenseExpiryDate?: string;
    employmentStatus?: EmploymentStatus;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    assignedVehicleId?: string;
}

export const driverApi = {
    getAll: () => api.get('/drivers').then(res => res.data),
    getById: (id: string) => api.get(`/drivers/${id}`).then(res => res.data),
    getByUserId: (userId: string) => api.get(`/drivers/user/${userId}`).then(res => res.data),
    create: (data: CreateDriverDto) => api.post('/drivers', data).then(res => res.data),
    update: (id: string, data: UpdateDriverDto) => api.patch(`/drivers/${id}`, data).then(res => res.data),
    updateStatus: (data: { driverId: string, status: string, lat?: number, lng?: number }) => api.patch('/drivers/me/status', data).then(res => res.data),
    delete: (id: string) => api.delete(`/drivers/${id}`).then(res => res.data),
    getTrips: (id: string) => api.get(`/drivers/${id}/trips`).then(res => res.data),
};
