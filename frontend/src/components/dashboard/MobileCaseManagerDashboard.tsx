import React, { useState } from 'react';
import { Box, Typography, IconButton, Paper, Fab, Chip, Stack } from '@mui/material';
import { Menu as MenuIcon, Add, CalendarMonth, DirectionsCar, Person } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '../../api/trips';
import { driverApi } from '../../api/drivers';
import DriverDrawer from '../navigation/DriverDrawer';
import ActiveTripCard from './ActiveTripCard';
import LiveMap from './LiveMap'; // Use LiveMap for Managers to see all vehicles

export default function MobileCaseManagerDashboard() {
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [sheetHeight, setSheetHeight] = useState('partial'); // 'collapsed', 'partial', 'expanded'
    const today = format(new Date(), 'yyyy-MM-dd');

    // Fetch Trips for the House/Organization
    const { data: trips = [] } = useQuery({
        queryKey: ['trips', today],
        queryFn: () => tripApi.getTrips({ date: today }),
    });

    // Fetch active drivers for the map
     const { data: drivers = [] } = useQuery({
        queryKey: ['drivers-live'],
        queryFn: () => driverApi.getAll(),
        refetchInterval: 5000,
    });

    const activeTrips = trips.filter((t: any) => t.status === 'IN_PROGRESS');
    const upcomingTrips = trips.filter((t: any) => t.status === 'SCHEDULED' || t.status === 'PENDING_APPROVAL');
    
    // Sort upcoming by time
    upcomingTrips.sort((a: any, b: any) => new Date(a.stops[0]?.scheduledTime).getTime() - new Date(b.stops[0]?.scheduledTime).getTime());

    return (
        <Box sx={{ 
            bgcolor: '#000', 
            height: '100vh', 
            width: '100vw', 
            position: 'relative',
            overflow: 'hidden',
            display: 'flex', 
            flexDirection: 'column', 
        }}>
            {/* 1. Full-Screen Map Background (Live Fleet) */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                <LiveMap drivers={drivers} height="100%" /> 
                
                {/* Gradient Overlay */}
                <Box sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    height: 120, 
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
                    zIndex: 1
                }} />
            </Box>

            {/* 2. Floating Header */}
            <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                px: 2, 
                pt: 6,
                pb: 2,
                zIndex: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <IconButton 
                    onClick={() => setDrawerOpen(true)}
                    sx={{ 
                        bgcolor: 'white', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        '&:hover': { bgcolor: '#f8fafc' }
                    }}
                >
                    <MenuIcon sx={{ color: '#1e293b' }} />
                </IconButton>

                <Chip 
                    label="CASE MANAGER" 
                    sx={{ 
                        bgcolor: 'rgba(255,255,255,0.9)', 
                        backdropFilter: 'blur(10px)',
                        fontWeight: 900,
                        color: '#1e293b',
                        borderRadius: 3,
                        fontSize: '0.7rem'
                    }} 
                />
            </Box>

            <DriverDrawer // Reuse DriverDrawer for now, or create CaseManagerDrawer if menu differs
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                // driver={null} // Pass user/manager profile if needed
            />

            {/* 3. Sliding Sheet */}
            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.1}
                onDragEnd={(e, info) => {
                    if (info.offset.y < -100) setSheetHeight('expanded');
                    else if (info.offset.y > 100) {
                        if (sheetHeight === 'expanded') setSheetHeight('partial');
                        else setSheetHeight('collapsed');
                    }
                }}
                animate={sheetHeight}
                variants={{
                    collapsed: { y: 'calc(100svh - 100px)' },
                    partial: { y: 'calc(100svh - 450px)' },
                    expanded: { y: 80 }
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 20,
                    background: '#f8fafc',
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: 'calc(100svh - 80px)',
                    height: '100svh'
                }}
            >
                {/* Drag Handle */}
                <Box sx={{ width: '100%', py: 1.5, display: 'flex', justifyContent: 'center', cursor: 'grab', bgcolor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
                    <Box sx={{ width: 40, height: 5, bgcolor: '#e2e8f0', borderRadius: 2.5 }} />
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#f8fafc' }}>
                    
                    {/* Status Stats */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Paper sx={{ flex: 1, p: 1.5, borderRadius: 3, bgcolor: 'white', textAlign: 'center' }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">ACTIVE</Typography>
                            <Typography variant="h4" fontWeight={800} color="primary">{activeTrips.length}</Typography>
                        </Paper>
                        <Paper sx={{ flex: 1, p: 1.5, borderRadius: 3, bgcolor: 'white', textAlign: 'center' }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">COMPLETED</Typography>
                            <Typography variant="h4" fontWeight={800} color="success.main">{trips.filter((t: any) => t.status === 'COMPLETED').length}</Typography>
                        </Paper>
                    </Box>

                    <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarMonth fontSize="small" /> Today's Schedule
                    </Typography>

                    <Stack spacing={2}>
                        {activeTrips.map((trip: any) => (
                            <ActiveTripCard 
                                key={trip.id} 
                                trip={trip} 
                                compact 
                                showActions={false} // Managers don't start trips
                                onViewDetails={() => navigate(`/driver/trips/${trip.id}`)} // Or manager specific detail view
                            />
                        ))}
                        
                        {upcomingTrips.map((trip: any) => (
                            <ActiveTripCard 
                                key={trip.id} 
                                trip={trip} 
                                compact 
                                showActions={false}
                                onViewDetails={() => navigate(`/driver/trips/${trip.id}`)}
                            />
                        ))}

                        {activeTrips.length === 0 && upcomingTrips.length === 0 && (
                             <Box sx={{ textAlign: 'center', py: 4, opacity: 0.5 }}>
                                <Typography variant="body2" fontWeight={600}>No trips scheduled for today</Typography>
                            </Box>
                        )}
                    </Stack>
                    
                    <Box sx={{ height: 100 }} />
                </Box>
            </motion.div>

            {/* Fab to create trip */}
             <Fab
                color="primary"
                onClick={() => navigate('/driver/schedule-new')} // Or manager schedule
                sx={{
                    position: 'absolute',
                    bottom: 24,
                    right: 24,
                    zIndex: 30,
                    bgcolor: '#0f172a',
                    '&:hover': { bgcolor: '#1e293b' }
                }}
            >
                <Add />
            </Fab>
        </Box>
    );
}
