import { Box, Paper, BottomNavigation, BottomNavigationAction, Badge, AppBar, Toolbar, Typography, Button, IconButton, Avatar, useTheme, useMediaQuery } from '@mui/material';
import { Home, CalendarMonth, Email, Person, History as HistoryIcon } from '@mui/icons-material';
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
            {/* Desktop Header */}
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    bgcolor: 'white',
                    borderBottom: '1px solid #f0f0f0',
                    display: { xs: 'none', md: 'block' }
                }}
            >
                <Toolbar sx={{ 
                    justifyContent: 'space-between', 
                    mx: 'auto', 
                    width: '100%', 
                    px: 6,
                    height: 80 
                }}>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#0096D6',
                            fontWeight: 800,
                            letterSpacing: 0.5,
                            cursor: 'pointer'
                        }}
                        onClick={() => navigate('/driver')}
                    >
                        {user?.role === 'HOUSE_MANAGER' ? 'GVBH MANAGER' : 'GVBH DRIVER'}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Typography 
                            onClick={() => navigate('/driver')}
                            sx={{ color: '#0096D6', cursor: 'pointer', fontWeight: 500, fontSize: '0.95rem' }}
                        >
                            Home
                        </Typography>
                        <Typography 
                            onClick={() => navigate('/driver/schedule')}
                            sx={{ color: '#0096D6', cursor: 'pointer', fontWeight: 500, fontSize: '0.95rem' }}
                        >
                            Schedule
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/driver/create-trip')}
                            sx={{
                                color: '#0096D6',
                                borderColor: '#ccc',
                                textTransform: 'none',
                                borderRadius: 8,
                                px: 4,
                                py: 1,
                                fontWeight: 600,
                                '&:hover': { borderColor: '#0096D6', bgcolor: 'rgba(0,150,214,0.04)' }
                            }}
                        >
                            Create Trip
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>


            {/* Main Content Area - Full Height */}
            <Box sx={{ flexGrow: 1, pb: 7 }}>
                {children}
            </Box>

            {/* Bottom Navigation (Hidden on Desktop AND Trip Execution) */}
            {!location.pathname.includes('/execute') && (
                <Paper elevation={3} sx={{ 
                    position: 'fixed', 
                    left: 0,
                    right: 0, 
                    bottom: 0,
                    zIndex: 100,
                    display: { xs: 'block', md: 'none' },
                    pb: 3 // Safe area padding
                }}>
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
            )}
        </Box>
    );
}
