import api from '../lib/api';

export interface Location {
    id: string;
    name: string;
    address: string;
    type: string;
}

export const locationApi = {
    getAll: async (): Promise<Location[]> => {
        const { data } = await api.get('/locations');
        return data;
    },

    create: async (locationData: Partial<Location>): Promise<Location> => {
        const { data } = await api.post('/locations', locationData);
        return data;
    }
};
