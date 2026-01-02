import axios from 'axios';
import { useAuthStore } from '../store/auth';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
    const { token, user } = useAuthStore.getState();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (user?.organizationId) {
        config.headers['X-Organization-ID'] = user.organizationId;
        config.headers['X-User-ID'] = user.id;
    }

    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
