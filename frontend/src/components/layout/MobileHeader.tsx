import { AppBar, Toolbar, IconButton, Typography, Avatar, Box } from '@mui/material';
import { Menu as MenuIcon, PersonOutline } from '@mui/icons-material';
import { useAuthStore } from '../../store/auth';
import DriverDrawer from '../navigation/DriverDrawer';
import { useState } from 'react';
import { driverApi } from '../../api/drivers';
import { useQuery } from '@tanstack/react-query';

interface MobileHeaderProps {
    title: string;
}

export default function MobileHeader({ title }: MobileHeaderProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const user = useAuthStore((state) => state.user);

    // Fetch driver for drawer
    const { data: driver } = useQuery({
        queryKey: ['driver-profile', user?.id],
        queryFn: () => user?.id ? driverApi.getByUserId(user.id) : null,
        enabled: !!user,
    });

    return (
        <>
            <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #f0f0f0', color: '#333' }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 600 }}>
                        {title}
                    </Typography>
                    <Box sx={{ width: 40 }} /> {/* Spacer to balance Menu icon */}
                </Toolbar>
            </AppBar>

            <DriverDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                driver={driver}
            />
        </>
    );
}
