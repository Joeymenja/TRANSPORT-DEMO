import { AppBar, Toolbar, IconButton, Typography, Avatar, Box } from '@mui/material';
import { Menu as MenuIcon, ArrowBack } from '@mui/icons-material';
import { useAuthStore } from '../../store/auth';
import DriverDrawer from '../navigation/DriverDrawer';
import { useState } from 'react';
import { driverApi } from '../../api/drivers';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface MobileHeaderProps {
    title: string;
    backRoute?: string;
    action?: React.ReactNode;
}

export default function MobileHeader({ title, backRoute, action }: MobileHeaderProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();

    const { data: driver } = useQuery({
        queryKey: ['driver-profile', user?.id],
        queryFn: () => user?.id ? driverApi.getByUserId(user.id) : null,
        enabled: !!user,
    });

    return (
        <>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    color: '#1e293b',
                }}
            >
                <Toolbar sx={{
                    pt: 'env(safe-area-inset-top, 16px)',
                    pb: 0.5,
                    minHeight: '56px !important',
                }}>
                    {backRoute ? (
                        <IconButton
                            edge="start"
                            onClick={() => navigate(backRoute)}
                            sx={{
                                color: '#0096D6',
                                '&:active': { transform: 'scale(0.92)' },
                                transition: 'transform 0.1s ease',
                            }}
                        >
                            <ArrowBack />
                        </IconButton>
                    ) : (
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={() => setDrawerOpen(true)}
                            sx={{
                                '&:active': { transform: 'scale(0.92)' },
                                transition: 'transform 0.1s ease',
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography
                        variant="subtitle1"
                        sx={{
                            flexGrow: 1,
                            textAlign: 'center',
                            fontWeight: 700,
                            fontSize: '1rem',
                            letterSpacing: '-0.01em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            mx: 1,
                        }}
                    >
                        {title}
                    </Typography>
                    {action ? action : <Box sx={{ width: 40 }} />}
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
