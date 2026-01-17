import { Box, Paper, BottomNavigation, BottomNavigationAction, Badge, Typography, Button, IconButton } from '@mui/material';
import { 
    DashboardOutlined, 
    CalendarMonthOutlined, 
    NotificationsOutlined, 
    PersonOutline,
    Home,
    History as HistoryIcon
} from '@mui/icons-material';
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

    const getNavValue = () => {
        const path = location.pathname;
        if (path.includes('/driver/updates')) return 2;
        if (path.includes('/driver/schedule')) return 1;
        if (path.includes('/driver/profile')) return 3;
        if (path === '/driver' || path === '/driver/' || path.includes('dashboard')) return 0;
        return 0;
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8f9fa' }}>

            {/* Desktop Navigation (Hidden on mobile) */}
            <Box sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                bgcolor: 'white', 
                borderBottom: '1px solid #eee',
                p: 2,
                px: 4,
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <Typography variant="h6" fontWeight={800} color="primary" sx={{ letterSpacing: -0.5 }}>GVBH TRANSPORT</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button 
                        onClick={() => navigate('/driver/backfill')}
                        variant="contained"
                        startIcon={<HistoryIcon />}
                        sx={{ 
                            fontWeight: 800, 
                            borderRadius: 3, 
                            px: 3, 
                            bgcolor: '#0f172a',
                            '&:hover': { bgcolor: '#1e293b' },
                            textTransform: 'none',
                            fontSize: '0.9rem'
                        }}
                    >
                        Log Past Trip
                    </Button>
                </Box>
                <IconButton onClick={() => navigate('/driver/profile')}>
                    <PersonOutline />
                </IconButton>
            </Box>

            {/* Main Content Area */}
            <Box component="main" sx={{ flexGrow: 1, pb: { xs: 8, md: 0 } }}>
                {children}
            </Box>

            {/* Modern Bottom Navigation (Mobile Only) */}
            {/* Hidden on execution and report pages to prevent overlap with workflow buttons */}
            {!location.pathname.includes('/execute') && !location.pathname.includes('/report/') && (
                <Box sx={{ 
                    display: { xs: 'block', md: 'none' },
                    position: 'fixed', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    zIndex: 1000,
                    p: 1.5,
                    pb: 4, 
                    pointerEvents: 'none' 
                }}>

                <Paper 
                    elevation={0} 
                    sx={{ 
                        borderRadius: 4,
                        overflow: 'hidden',
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        pointerEvents: 'auto'
                    }}
                >
                    <BottomNavigation
                        value={getNavValue()}
                        onChange={(_, newValue) => {
                            console.log('[DriverNav] Bottom Click:', newValue);
                            if (newValue === 0) navigate('/driver');
                            if (newValue === 1) navigate('/driver/schedule');
                            if (newValue === 2) navigate('/driver/updates');
                            if (newValue === 3) navigate('/driver/profile');
                        }}
                        showLabels
                        sx={{ height: 64, bgcolor: 'transparent' }}
                    >
                        <BottomNavigationAction 
                            label="Home" 
                            icon={<DashboardOutlined />} 
                            sx={{ '&.Mui-selected': { fontWeight: 800 } }}
                        />
                        <BottomNavigationAction 
                            label="Schedule" 
                            icon={<CalendarMonthOutlined />} 
                            sx={{ '&.Mui-selected': { fontWeight: 800 } }}
                        />
                        <BottomNavigationAction 
                            label="Updates" 
                            icon={
                                <Badge color="error" variant="dot" invisible={false}>
                                    <NotificationsOutlined />
                                </Badge>
                            } 
                            sx={{ '&.Mui-selected': { fontWeight: 800 } }}
                        />
                        <BottomNavigationAction 
                            label="Profile" 
                            icon={<PersonOutline />} 
                            sx={{ '&.Mui-selected': { fontWeight: 800 } }}
                        />
                    </BottomNavigation>
                </Paper>
            </Box>
            )}
        </Box>
    );
}
