import axios from 'axios';

const API_URL = 'http://localhost:8082'; // Transport Service

export interface Notification {
    id: string;
    organizationId: string;
    type: 'DRIVER_PENDING' | 'TRIP_REPORT_SUBMITTED' | 'TRIP_CANCELLED' | 'INCIDENT_REPORTED';
    title: string;
    message: string;
    status: 'UNREAD' | 'READ' | 'ARCHIVED';
    metadata?: {
        driverId?: string;
        tripReportId?: string;
        tripId?: string;
        userId?: string;
        [key: string]: any;
    };
    readAt?: string;
    createdAt: string;
    updatedAt: string;
}

export const notificationApi = {
    getAll: async (): Promise<Notification[]> => {
        const response = await axios.get(`${API_URL}/notifications`);
        return response.data;
    },

    getUnread: async (): Promise<Notification[]> => {
        const response = await axios.get(`${API_URL}/notifications/unread`);
        return response.data;
    },

    markAsRead: async (id: string): Promise<Notification> => {
        const response = await axios.patch(`${API_URL}/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async (): Promise<void> => {
        await axios.patch(`${API_URL}/notifications/read-all`);
    },
};
