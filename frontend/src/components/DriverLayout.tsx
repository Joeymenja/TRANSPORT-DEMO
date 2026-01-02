import { Box, AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { DirectionsCar, Person, Home, Logout } from '@mui/icons-material';
import React, { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { useNavigate, useLocation } from 'react-router-dom';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const location = useLocation();

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
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            {/* Simple Mobile Header */}
            <AppBar position="static" elevation={0} sx={{ bgcolor: '#0096D6' }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                        My Trips
                    </Typography>
                    <IconButton
                        size="large"
                        onClick={handleMenu}
                        color="inherit"
                    >
                        <Person />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem disabled>{user?.email}</MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <Logout sx={{ mr: 1 }} /> Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Main Content Area */}
            <Box sx={{ flexGrow: 1, pb: 7 }}> {/* Padding for bottom nav */}
                {children}
            </Box>

            {/* Bottom Navigation */}
            <BottomNavigation
                value={location.pathname === '/driver' ? 'home' : 'trips'}
                onChange={(_, newValue) => {
                    if (newValue === 'home') navigate('/driver');
                    if (newValue === 'trips') navigate('/driver/trips');
                }}
                showLabels
                sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #e0e0e0' }}
            >
                <BottomNavigationAction label="Home" value="home" icon={<Home />} />
                <BottomNavigationAction label="My Trips" value="trips" icon={<DirectionsCar />} />
                <BottomNavigationAction label="Profile" value="profile" icon={<Person />} />
            </BottomNavigation>
        </Box>
    );
}
