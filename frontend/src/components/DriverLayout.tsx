import { Box, Paper, BottomNavigation, BottomNavigationAction, Badge, AppBar, Toolbar, Typography, Button, useTheme, useMediaQuery } from '@mui/material';
import { SpaceDashboard, AltRoute, AssignmentTurnedIn, Person, CalendarMonth, Email, HomeRounded, NearMeRounded, DescriptionRounded, AccountCircleRounded } from '@mui/icons-material';
import React from 'react';
import { useAuthStore } from '../store/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

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
        const path = location.pathname;
        if (path.startsWith('/driver/trips')) return 'trips';
        if (path.startsWith('/driver/schedule')) return 'trips';
        if (path.startsWith('/driver/log')) return 'log';
        if (path.startsWith('/driver/profile')) return 'profile';
        if (path === '/driver' || path === '/driver/') return 'home';
        return 'home';
    };

    const isHidden = location.pathname.includes('/execute') || location.pathname.includes('/report');

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F5F7FA' }}>
            
            {/* Desktop Header (Hidden on Mobile) */}
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    bgcolor: 'white',
                    borderBottom: '1px solid #eee',
                    display: { xs: 'none', md: 'block' }
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', px: 4 }}>
                    <Typography variant="h6" color="primary.main" fontWeight={800}>
                        GVBH DRIVER
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 4 }}>
                        <Button color="inherit" onClick={() => navigate('/driver')}>Dashboard</Button>
                        <Button color="inherit" onClick={() => navigate('/driver/trips')}>Trips</Button>
                        <Button variant="contained" onClick={() => navigate('/driver/create-trip')}>New Trip</Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Box sx={{ flexGrow: 1, pb: { xs: 8, md: 0 } }}>
                {children}
            </Box>

            {/* Mobile Bottom Navigation */}
            {!isHidden && (
                <Paper sx={{ 
                    position: 'fixed', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    zIndex: 1000,
                    display: { xs: 'block', md: 'none' },
                    borderTop: '1px solid #eee',
                }} elevation={3}>
                    <BottomNavigation
                        value={getNavValue()}
                        onChange={(_, newValue) => {
                            if (newValue === 'home') navigate('/driver');
                            if (newValue === 'trips') navigate('/driver/trips');
                            if (newValue === 'log') navigate('/driver/logs'); 
                            if (newValue === 'profile') navigate('/driver/profile');
                        }}
                        showLabels
                        sx={{ 
                            height: 64,
                            '& .MuiBottomNavigationAction-root': {
                                color: '#94a3b8', // Slate 400
                                '&.Mui-selected': {
                                    color: '#14B8A6'
                                }
                            }
                        }}
                    >
                        <BottomNavigationAction label="Home" value="home" icon={<HomeRounded />} />
                        <BottomNavigationAction label="Trips" value="trips" icon={<NearMeRounded />} />
                        <BottomNavigationAction label="Logs" value="log" icon={<DescriptionRounded />} />
                        <BottomNavigationAction label="Profile" value="profile" icon={<AccountCircleRounded />} />
                    </BottomNavigation>
                    {/* Safe Area for Home Bar */}
                    <Box sx={{ height: 40, bgcolor: 'white' }} /> 
                </Paper>
            )}
        </Box>
    );
}
