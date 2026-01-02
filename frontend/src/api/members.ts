import api from '../lib/api';

export enum MobilityRequirement {
    AMBULATORY = 'AMBULATORY',
    WHEELCHAIR = 'WHEELCHAIR',
    STRETCHER = 'STRETCHER',
    BURIATRIC_WHEELCHAIR = 'BURIATRIC_WHEELCHAIR',
}

export interface Member {
    id: string;
    organizationId: string;
    memberId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    email?: string;
    phone?: string;
    address?: string;
    mobilityRequirement: MobilityRequirement;
    insuranceProvider?: string;
    insuranceId?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    specialNotes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const memberApi = {
    getMembers: async (): Promise<Member[]> => {
        const { data } = await api.get('/members');
        return data;
    },

    getMemberById: async (id: string): Promise<Member> => {
        const { data } = await api.get(`/members/${id}`);
        return data;
    },

    createMember: async (memberData: Partial<Member>): Promise<Member> => {
        const { data } = await api.post('/members', memberData);
        return data;
    },

    updateMember: async (id: string, memberData: Partial<Member>): Promise<Member> => {
        const { data } = await api.put(`/members/${id}`, memberData);
        return data;
    },

    deleteMember: async (id: string): Promise<void> => {
        await api.delete(`/members/${id}`);
    },
};
