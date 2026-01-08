import { Box, AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Avatar, Button } from '@mui/material';
import { Logout } from '@mui/icons-material';
import React, { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

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
                        <Button color="inherit" onClick={() => navigate('/dashboard')} sx={{ color: '#212121' }}>
                            Dashboard
                        </Button>
                        <Button color="inherit" onClick={() => navigate('/archives')} sx={{ color: '#212121' }}>
                            Archives
                        </Button>
                        <Button color="inherit" onClick={() => navigate('/members')} sx={{ color: '#212121' }}>
                            Members
                        </Button>
                        {user?.role !== 'DRIVER' && (
                            <Button color="inherit" onClick={() => navigate('/drivers')} sx={{ color: '#212121' }}>
                                Drivers
                            </Button>
                        )}
                        <Button color="inherit" onClick={() => navigate('/vehicles')} sx={{ color: '#212121' }}>
                            Vehicles
                        </Button>
                        <Button color="inherit" onClick={() => navigate('/driver')} sx={{ color: '#212121' }}>
                            Driver
                        </Button>
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

                        <NotificationBell />

                        <IconButton onClick={handleMenu} size="large">
                            <Avatar sx={{ bgcolor: '#0096D6', width: 36, height: 36 }}>
                                {user?.firstName?.[0] || '?'}
                            </Avatar>
                        </IconButton>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                        >
                            <MenuItem onClick={handleLogout}>
                                <Logout fontSize="small" sx={{ mr: 1 }} />
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f8f9fa' }}>
                {children}
            </Box>
        </Box>
    );
}
