import { Box, Paper, BottomNavigation, BottomNavigationAction, Badge } from '@mui/material';
import { Home, CalendarMonth, Email, Person } from '@mui/icons-material';
import React, { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch unread count for badge
    const { data: unreadNotifications = [] } = useQuery({
        queryKey: ['notifications-unread'],
        queryFn: async () => {
            if (!user) return [];
            try {
                const { data } = await api.get('/notifications/unread');
                return data;
            } catch (e) { return []; }
        },
        enabled: !!user,
        refetchInterval: 30000
    });
    const unreadCount = unreadNotifications.length;

    const getNavValue = () => {
        if (location.pathname.startsWith('/driver/updates')) return 'updates';
        if (location.pathname.startsWith('/driver/trips')) return 'trips';
        if (location.pathname.startsWith('/driver/compliance')) return 'compliance';
        if (location.pathname === '/driver' || location.pathname === '/driver/') return 'home';
        return 'trips'; // Default to trips for nested routes
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>


            {/* Main Content Area - Full Height */}
            <Box sx={{ flexGrow: 1, pb: 7 }}>
                {children}
            </Box>

            {/* Bottom Navigation */}
            <Paper elevation={3} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}>
                <BottomNavigation
                    value={getNavValue()}
                    onChange={(_, newValue) => {
                        if (newValue === 'home') navigate('/driver');
                        if (newValue === 'schedule') navigate('/driver/schedule'); // Maps to /driver/trips effectively
                        if (newValue === 'updates') navigate('/driver/updates');
                        if (newValue === 'profile') navigate('/driver/profile');
                    }}
                    showLabels
                >
                    <BottomNavigationAction label="Home" value="home" icon={<Home />} />
                    <BottomNavigationAction label="Schedule" value="schedule" icon={<CalendarMonth />} />
                    <BottomNavigationAction 
                        label="Updates" 
                        value="updates" 
                        icon={
                            <Badge badgeContent={unreadCount} color="error">
                                <Email />
                            </Badge>
                        } 
                    />
                    <BottomNavigationAction label="Profile" value="profile" icon={<Person />} />
                </BottomNavigation>
            </Paper>
        </Box>
    );
}
