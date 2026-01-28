import { Box, Paper, BottomNavigation, BottomNavigationAction, Badge, AppBar, Toolbar, Typography, Button, IconButton, Avatar, useTheme, useMediaQuery } from '@mui/material';
import { Home, CalendarMonth, NotificationsOutlined, Person, History as HistoryIcon } from '@mui/icons-material';
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
        if (location.pathname.startsWith('/driver/schedule')) return 'schedule';
        if (location.pathname.startsWith('/driver/profile')) return 'profile';
        if (location.pathname.startsWith('/driver/trips')) return 'schedule';
        if (location.pathname === '/driver' || location.pathname === '/driver/' || location.pathname === '/driver/dashboard') return 'home';
        return 'home';
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
            <Box sx={{
                flexGrow: 1,
                pb: { xs: 'calc(64px + env(safe-area-inset-bottom, 16px))', md: 0 }
            }}>
                {children}
            </Box>

            {/* Bottom Navigation (Hidden on Desktop AND Trip Execution) */}
            {!location.pathname.includes('/execute') && (
                <Paper
                    elevation={0}
                    sx={{
                        position: 'fixed',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 100,
                        display: { xs: 'block', md: 'none' },
                        pb: 'env(safe-area-inset-bottom, 12px)',
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                        bgcolor: 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                    }}
                >
                    <BottomNavigation
                        value={getNavValue()}
                        onChange={(_, newValue) => {
                            if (newValue === 'home') navigate('/driver');
                            if (newValue === 'schedule') navigate('/driver/schedule');
                            if (newValue === 'updates') navigate('/driver/updates');
                            if (newValue === 'profile') navigate('/driver/profile');
                        }}
                        showLabels
                        sx={{
                            bgcolor: 'transparent',
                            height: 56,
                            '& .MuiBottomNavigationAction-root': {
                                minWidth: 'auto',
                                py: 0.5,
                                color: '#94a3b8',
                                transition: 'color 0.2s ease',
                                '&.Mui-selected': {
                                    color: '#0096D6',
                                },
                                '& .MuiBottomNavigationAction-label': {
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    mt: 0.25,
                                    '&.Mui-selected': {
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                    }
                                }
                            }
                        }}
                    >
                        <BottomNavigationAction label="Home" value="home" icon={<Home sx={{ fontSize: 24 }} />} />
                        <BottomNavigationAction label="Schedule" value="schedule" icon={<CalendarMonth sx={{ fontSize: 24 }} />} />
                        <BottomNavigationAction
                            label="Updates"
                            value="updates"
                            icon={
                                <Badge
                                    badgeContent={unreadCount}
                                    color="error"
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            fontSize: '0.6rem',
                                            height: 16,
                                            minWidth: 16,
                                            top: 2,
                                            right: -2,
                                        }
                                    }}
                                >
                                    <NotificationsOutlined sx={{ fontSize: 24 }} />
                                </Badge>
                            }
                        />
                        <BottomNavigationAction label="Profile" value="profile" icon={<Person sx={{ fontSize: 24 }} />} />
                    </BottomNavigation>
                </Paper>
            )}
        </Box>
    );
}
