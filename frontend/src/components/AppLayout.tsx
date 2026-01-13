import { Box, AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Avatar, Button, Badge } from '@mui/material';
import { Logout } from '@mui/icons-material';
import React, { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import api from '../lib/api';
import { useQuery } from '@tanstack/react-query';
import { usePreferencesStore } from '../store/preferences';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const location = useLocation();
    const { features } = usePreferencesStore();

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Header */}
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    bgcolor: 'white',
                    borderBottom: '1px solid #e0e0e0',
                }}
            >
                <Toolbar>
                    <Typography
                        variant="h6"
                        sx={{
                            flexGrow: 1,
                            color: '#212121',
                            fontWeight: 600,
                        }}
                    >
                        GVBH Transportation
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 3, mr: 4 }}>
                        {user?.role === 'DRIVER' ? (
                            <>
                                <Button 
                                    color="inherit" 
                                    onClick={() => navigate('/driver')} 
                                    sx={{ color: '#212121', fontWeight: 600 }}
                                >
                                    Today
                                </Button>
                                <Button 
                                    color="inherit" 
                                    onClick={() => navigate('/driver/updates')} 
                                    sx={{ color: '#212121' }}
                                >
                                    <Badge badgeContent={unreadCount} color="error">
                                        Updates
                                    </Badge>
                                </Button>
                                <Button 
                                    color="inherit" 
                                    onClick={() => navigate('/driver/trips')} 
                                    sx={{ color: '#212121' }}
                                >
                                    History
                                </Button>
                                <Button 
                                    color="inherit" 
                                    onClick={() => navigate('/driver/profile')} 
                                    sx={{ color: '#212121' }}
                                >
                                    Profile
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button 
                                    color="inherit" 
                                    onClick={() => navigate('/dashboard')} 
                                    sx={{ 
                                        color: location.pathname === '/dashboard' ? '#0096D6' : '#212121',
                                        borderBottom: location.pathname === '/dashboard' ? '2px solid #0096D6' : '2px solid transparent',
                                        borderRadius: 0 
                                    }}
                                >
                                    Dashboard
                                </Button>
                                <Button 
                                    color="inherit" 
                                    onClick={() => navigate('/archives')} 
                                    sx={{ 
                                        color: location.pathname === '/archives' ? '#0096D6' : '#212121',
                                        borderBottom: location.pathname === '/archives' ? '2px solid #0096D6' : '2px solid transparent',
                                        borderRadius: 0
                                    }}
                                >
                                    Archives
                                </Button>
                                <Button 
                                    color="inherit" 
                                    onClick={() => navigate('/trips')} 
                                    sx={{ 
                                        color: location.pathname.startsWith('/trips') ? '#0096D6' : '#212121',
                                        borderBottom: location.pathname.startsWith('/trips') ? '2px solid #0096D6' : '2px solid transparent',
                                        borderRadius: 0
                                    }}
                                >
                                    Trips
                                </Button>
                                <Button 
                                    color="inherit" 
                                    onClick={() => navigate('/members')} 
                                    sx={{ 
                                        color: location.pathname.startsWith('/members') ? '#0096D6' : '#212121',
                                        borderBottom: location.pathname.startsWith('/members') ? '2px solid #0096D6' : '2px solid transparent',
                                        borderRadius: 0
                                    }}
                                >
                                    Members
                                </Button>
                                <Button 
                                    color="inherit" 
                                    onClick={() => navigate('/drivers')} 
                                    sx={{ 
                                        color: location.pathname.startsWith('/drivers') ? '#0096D6' : '#212121',
                                        borderBottom: location.pathname.startsWith('/drivers') ? '2px solid #0096D6' : '2px solid transparent',
                                        borderRadius: 0
                                    }}
                                >
                                    Drivers
                                </Button>
                                <Button 
                                    color="inherit" 
                                    onClick={() => navigate('/vehicles')} 
                                    sx={{ 
                                        color: location.pathname.startsWith('/vehicles') ? '#0096D6' : '#212121',
                                        borderBottom: location.pathname.startsWith('/vehicles') ? '2px solid #0096D6' : '2px solid transparent',
                                        borderRadius: 0
                                    }}
                                >
                                    Vehicles
                                </Button>
                                <Button 
                                    color="inherit" 
                                    onClick={() => navigate('/notifications')} 
                                    sx={{ 
                                        color: location.pathname.startsWith('/notifications') ? '#0096D6' : '#212121',
                                        borderBottom: location.pathname.startsWith('/notifications') ? '2px solid #0096D6' : '2px solid transparent',
                                        borderRadius: 0
                                    }}
                                >
                                    Notifications
                                </Button>
                                {features.billing && (
                                    <Button 
                                        color="inherit" 
                                        onClick={() => navigate('/billing')} 
                                        sx={{ 
                                            color: location.pathname.startsWith('/billing') ? '#0096D6' : '#212121',
                                            borderBottom: location.pathname.startsWith('/billing') ? '2px solid #0096D6' : '2px solid transparent',
                                            borderRadius: 0
                                        }}
                                    >
                                        Billing
                                    </Button>
                                )}
                                {features.payroll && (
                                    <Button 
                                        color="inherit" 
                                        onClick={() => navigate('/payroll')} 
                                        sx={{ 
                                            color: location.pathname.startsWith('/payroll') ? '#0096D6' : '#212121',
                                            borderBottom: location.pathname.startsWith('/payroll') ? '2px solid #0096D6' : '2px solid transparent',
                                            borderRadius: 0
                                        }}
                                    >
                                        Payroll
                                    </Button>
                                )}
                                {features.driverView && (
                                    <Button 
                                        color="inherit" 
                                        onClick={() => navigate('/driver')} 
                                        sx={{ 
                                            color: location.pathname.startsWith('/driver') ? '#0096D6' : '#212121',
                                            borderBottom: location.pathname.startsWith('/driver') ? '2px solid #0096D6' : '2px solid transparent',
                                            borderRadius: 0
                                        }}
                                    >
                                        Driver View
                                    </Button>
                                )}
                            </>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ color: '#212121', fontWeight: 500 }}>
                                {user?.firstName} {user?.lastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#757575' }}>
                                {user?.role?.replace('_', ' ') || ''}
                            </Typography>
                        </Box>

                        {user?.role !== 'DRIVER' && !location.pathname.startsWith('/notifications') && <NotificationBell />}

                        {user?.role !== 'DRIVER' && (
                            <>
                                <IconButton
                                    size="large"
                                    aria-label="account of current user"
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                    onClick={handleMenu}
                                    color="inherit"
                                >
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#0096D6', fontSize: 14 }}>
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </Avatar>
                                </IconButton>
                                <Menu
                                    id="menu-appbar"
                                    anchorEl={anchorEl}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>Customization</MenuItem>
                                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                                </Menu>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f0f4f8' }}>
                {children}
            </Box>
        </Box>
    );
}
