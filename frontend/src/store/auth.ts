import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'DISPATCHER' | 'DRIVER';
    organizationId: string;
    orientationId: string;
    defaultVehicleId?: string;
    onboardingStep?: number;
    signatureUrl?: string; // Driver signature
    isActive: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    setUser: (user: User, token: string) => void;
    checkAuth: () => Promise<void>; // Refresh user profile
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: async (email: string, password: string) => {
                const response = await fetch('/api/auth/login', { // Using correct Auth Service port
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Login failed');
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

            checkAuth: async () => {
                const { token } = get();
                if (!token) return;

                try {
                    const response = await fetch('/api/auth/profile', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const user = await response.json();
                        set({ user });
                    }
                } catch (e) {
                    console.error('Failed to refresh auth', e);
                }
            }
        }),
        {
            name: 'gvbh-auth',
        }
    )
);
