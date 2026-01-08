import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Location {
    id: string;
    name: string;
    address: string;
    type: string;
}

export const locationApi = {
    getAll: async () => {
        const token = localStorage.getItem('token');
        const organizationId = localStorage.getItem('organizationId');
        
        const response = await axios.get(`${API_URL}/locations`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-organization-id': organizationId
            }
        });
        return response.data;
    },

    create: async (data: Partial<Location>) => {
        const token = localStorage.getItem('token');
        const organizationId = localStorage.getItem('organizationId');
        
        const response = await axios.post(`${API_URL}/locations`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-organization-id': organizationId
            }
        });
        return response.data;
    }
};
