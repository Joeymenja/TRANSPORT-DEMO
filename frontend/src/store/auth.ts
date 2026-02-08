import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'DISPATCHER' | 'DRIVER' | 'HOUSE_MANAGER';
    organizationId: string;
    orientationId: string;
    defaultVehicleId?: string;
    onboardingStep?: number;
    signatureUrl?: string; // Driver signature
    isActive: boolean;
    // Personal Info
    phone?: string;
    dob?: string;
    addressStreet?: string;
    addressUnit?: string;
    addressCity?: string;
    addressState?: string;
    addressZip?: string;
    // License Info
    licenseNumber?: string;
    licenseState?: string;
    licenseExpiry?: string;
    // Emergency Contact
    emergencyContactName?: string;
    emergencyContactRelationship?: string;
    emergencyContactPhone?: string;
    profileImage?: string;
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
                console.log('[AuthStore] Attempting login for:', email);
                const response = await fetch('/api/auth/login', { // Using correct Auth Service port
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                console.log('[AuthStore] Response status:', response.status);
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('[AuthStore] Login error:', errorData);
                    throw new Error(errorData.message || 'Login failed');
                }

                const data = await response.json();
                console.log('[AuthStore] Login successful, user:', data.user?.email);
                set({
                    user: data.user,
                    token: data.accessToken,
                    isAuthenticated: true,
                });
            },

            logout: () => {
                console.log('[AuthStore] Logout action called');
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
