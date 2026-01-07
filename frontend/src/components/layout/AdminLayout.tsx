import { Box, AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import { Menu as MenuIcon, Dashboard as DashboardIcon, Assignment as AssignmentIcon, People as PeopleIcon, DirectionsCar as CarIcon } from '@mui/icons-material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import NotificationBell from '../NotificationBell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Phone
    const isTablet = useMediaQuery(theme.breakpoints.down('md')); // Tablet/iPad

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
        { text: 'Trip Reports', icon: <AssignmentIcon />, path: '/admin/reports' },
        // Add more admin routes here later
    ];

    const handleNavigate = (path: string) => {
        navigate(path);
        setDrawerOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            <AppBar position="static">
                <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: { xs: 1, sm: 2 } }}
                        onClick={() => setDrawerOpen(true)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant={isMobile ? "subtitle1" : "h6"}
                        component="div"
                        sx={{
                            flexGrow: 1,
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                    >
                        {isMobile ? 'Admin' : 'Admin Portal'}
                    </Typography>
                    <NotificationBell />
                    {!isMobile && (
                        <Button
                            color="inherit"
                            onClick={handleLogout}
                            sx={{ ml: 2 }}
                        >
                            Logout
                        </Button>
                    )}
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            onClick={handleLogout}
                            sx={{ ml: 1 }}
                            size="small"
                        >
                            <Typography variant="caption">Exit</Typography>
                        </IconButton>
                    )}
                </Toolbar>
            </AppBar>

            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <Box
                    sx={{ width: { xs: 200, sm: 250 } }}
                    role="presentation"
                >
                    <List>
                        {menuItems.map((item) => (
                            <ListItem
                                button
                                key={item.text}
                                onClick={() => handleNavigate(item.path)}
                                sx={{
                                    py: { xs: 1.5, sm: 1 }
                                }}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: { xs: '0.95rem', sm: '1rem' }
                                    }}
                                />
                            </ListItem>
                        ))}
                        {isMobile && (
                            <ListItem
                                button
                                onClick={handleLogout}
                                sx={{ py: 1.5, borderTop: '1px solid #e0e0e0', mt: 2 }}
                            >
                                <ListItemText
                                    primary="Logout"
                                    primaryTypographyProps={{
                                        fontSize: '0.95rem',
                                        color: 'error.main'
                                    }}
                                />
                            </ListItem>
                        )}
                    </List>
                </Box>
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3, md: 3 },
                    maxWidth: '100%',
                    overflow: 'hidden'
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
