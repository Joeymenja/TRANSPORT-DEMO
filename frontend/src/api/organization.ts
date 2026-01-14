import api from '../lib/api';

export interface Organization {
    id: string;
    name: string;
    subdomain: string;
    ahcccsProviderId?: string;
    address?: string;
    phoneNumber?: string;
    ensoraApiKey?: string;
    ensoraApiEndpoint?: string;
    ensoraSyncEnabled?: boolean;
}

export const organizationApi = {
    get: async () => {
        const { data } = await api.get<Organization>('/organization');
        return data;
    },
    update: async (updates: Partial<Organization>) => {
        const { data } = await api.put<Organization>('/organization', updates);
        return data;
    }
};
