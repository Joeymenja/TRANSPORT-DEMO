import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';

const LOGOUT_TIMER_MS = 15 * 60 * 1000; // 15 Minutes

export const useAutoLogout = () => {
    const { logout, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = useCallback(() => {
        if (isAuthenticated) {
            console.log('Session expired due to inactivity');
            logout();
            navigate('/login');
        }
    }, [isAuthenticated, logout, navigate]);

    useEffect(() => {
        if (!isAuthenticated) return;

        let timeoutId: NodeJS.Timeout;

        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(handleLogout, LOGOUT_TIMER_MS);
        };

        // Initial start
        resetTimer();

        // Listeners for activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => document.addEventListener(event, resetTimer));

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            events.forEach(event => document.removeEventListener(event, resetTimer));
        };
    }, [isAuthenticated, handleLogout]);
};
