import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'DISPATCHER' | 'DRIVER';
    organizationId: string;
    defaultVehicleId?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    setUser: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: async (email: string, password: string) => {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                if (!response.ok) {
                    throw new Error('Login failed');
                }

                const data = await response.json();
                set({
                    user: data.user,
                    token: data.accessToken,
                    isAuthenticated: true,
                });
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
            },

            setUser: (user: User, token: string) => {
                set({ user, token, isAuthenticated: true });
            },
        }),
        {
            name: 'gvbh-auth',
        }
    )
);
