import { Trip, TripStatus } from '../types';

const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:8081';
const TRANSPORT_URL = import.meta.env.VITE_TRANSPORT_URL || 'http://localhost:8082';

class TransportApi {
    private token: string | null = localStorage.getItem('auth_token');

    private get headers() {
        return {
            'Content-Type': 'application/json',
            'Authorization': this.token ? `Bearer ${this.token}` : '',
        };
    }

    setToken(token: string) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    logout() {
        this.token = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('is_authenticated');
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        // Determine which service to call
        const baseUrl = endpoint.startsWith('/auth') ? AUTH_URL : TRANSPORT_URL;

        const response = await fetch(`${baseUrl}${endpoint}`, {
            ...options,
            headers: {
                ...this.headers,
                ...options.headers,
            },
        });

        if (response.status === 401) {
            this.logout();
            window.dispatchEvent(new Event('auth-error'));
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        if (response.status === 204) return {} as T;

        try {
            return await response.json();
        } catch (e) {
            return {} as T;
        }
    }

    // --- Auth ---

    async login(email: string, password: string) {
        // endpoint /auth/login will route to AUTH_URL/auth/login
        // Ensure backend auth service has /auth/login.
        // Looking at main.ts of auth-service: `http://localhost:${port}/auth`
        // So likely /auth/login is correct.
        const res = await this.request<{ access_token: string; user: any }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (res.access_token) {
            this.setToken(res.access_token);
        }
        return res;
    }

    async getMe() {
        return this.request<any>('/auth/me');
    }

    // --- Trips ---

    async getDriverTrips(driverId: string) {
        return this.request<Trip[]>(`/trips/driver/${driverId}`);
    }

    async getTrip(id: string) {
        return this.request<Trip>(`/trips/${id}`);
    }

    async startTrip(id: string) {
        return this.request<Trip>(`/trips/${id}/start`, { method: 'POST' });
    }

    async arriveAtStop(tripId: string, stopId: string, gps?: { lat: number; lng: number }) {
        return this.request<any>(`/trips/${tripId}/stops/${stopId}/arrive`, {
            method: 'POST',
            body: JSON.stringify({
                gpsLatitude: gps?.lat,
                gpsLongitude: gps?.lng,
                arrivalTime: new Date()
            }),
        });
    }

    async completeStop(tripId: string, stopId: string, odometer?: number) {
        return this.request<any>(`/trips/${tripId}/stops/${stopId}/complete`, {
            method: 'POST',
            body: JSON.stringify({
                odometerReading: odometer,
                departureTime: new Date()
            })
        });
    }

    async completeTrip(id: string) {
        return this.request<Trip>(`/trips/${id}/complete`, { method: 'POST' });
    }

    // --- Reports ---

    async submitReport(tripId: string, data: any) {
        // If we need to upload files, we might need FormData here
        // For now assume JSON submission as per controller
        return this.request<any>(`/trips/${tripId}/report/submit`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}

export const api = new TransportApi();
