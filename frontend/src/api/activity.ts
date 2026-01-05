import api from '../lib/api';

export interface ActivityLog {
    id: string;
    type: 'DRIVER_REGISTERED' | 'TRIP_CREATED' | 'TRIP_COMPLETED' | 'REPORT_SUBMITTED' | 'SYSTEM';
    message: string;
    metadata?: any;
    createdAt: string;
    isRead: boolean;
}

export const activityApi = {
    getLogs: async (limit: number = 20) => {
        const res = await api.get<ActivityLog[]>(`/activity-logs?limit=${limit}`);
        return res.data;
    },

    markAsRead: async (id: string) => {
        await api.patch(`/activity-logs/${id}/read`);
    }
};
