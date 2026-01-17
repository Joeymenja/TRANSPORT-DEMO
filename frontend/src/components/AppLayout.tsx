import { Box, AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Avatar, Button, Badge, Drawer, List, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material';
import { Logout, Menu as MenuIcon } from '@mui/icons-material';
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
    const [mobileOpen, setMobileOpen] = useState(false);
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

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
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

    const navItems = user?.role === 'DRIVER' ? [
        { label: 'Today', path: '/driver' },
        { label: 'Updates', path: '/driver/updates', badge: unreadCount },
        { label: 'History', path: '/driver/trips' },
        { label: 'Profile', path: '/driver/profile' },
    ] : [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Archives', path: '/archives' },
        { label: 'Trips', path: '/trips' },
        { label: 'Members', path: '/members' },
        { label: 'Drivers', path: '/drivers' },
        { label: 'Vehicles', path: '/vehicles' },
        { label: 'Notifications', path: '/notifications' },
        ...(features.billing ? [{ label: 'Billing', path: '/billing' }] : []),
        ...(features.payroll ? [{ label: 'Payroll', path: '/payroll' }] : []),
        ...(features.driverView ? [{ label: 'Driver View', path: '/driver' }] : [])
    ];

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                GVBH Transport
            </Typography>
            <Divider />
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.path} disablePadding>
                        <ListItemButton onClick={() => navigate(item.path)} sx={{ textAlign: 'center' }}>
                            <ListItemText primary={
                                item.badge ? (
                                    <Badge badgeContent={item.badge} color="error">
                                        {item.label}
                                    </Badge>
                                ) : item.label
                            } />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

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
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' }, color: '#212121' }}
                    >
                        <MenuIcon />
                    </IconButton>

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

                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, mr: 4 }}>
                        {navItems.map((item) => (
                            <Button 
                                key={item.path}
                                color="inherit" 
                                onClick={() => navigate(item.path)} 
                                sx={{ 
                                    color: location.pathname.startsWith(item.path) && item.path !== '/driver' ? '#0096D6' : '#212121',
                                    borderBottom: location.pathname.startsWith(item.path) && item.path !== '/driver' ? '2px solid #0096D6' : '2px solid transparent',
                                    borderRadius: 0 
                                }}
                            >
                                {item.badge ? (
                                    <Badge badgeContent={item.badge} color="error">
                                        {item.label}
                                    </Badge>
                                ) : item.label}
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
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

            <nav>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                    }}
                >
                    {drawer}
                </Drawer>
            </nav>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f0f4f8' }}>
                {children}
            </Box>
        </Box>
    );
}
