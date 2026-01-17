import { Box, Button, IconButton, Typography, Paper, AppBar, Toolbar, Snackbar, Alert, Fab, Chip, BottomNavigation, BottomNavigationAction, Stack } from '@mui/material';
import { Menu as MenuIcon, DirectionsCarOutlined, PersonOutline, MyLocation, Add, CalendarMonth, History, Dashboard, HistoryEdu, KeyboardArrowUp, HorizontalRule } from '@mui/icons-material'; // Outlined icons
import { motion, useAnimation, useDragControls } from 'framer-motion';
import ActiveTripCard from './ActiveTripCard';
import DriverMap from './DriverMap'; // IMPORTED MAP
import DriverDrawer from '../navigation/DriverDrawer';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { driverApi } from '../../api/drivers';
import { tripApi } from '../../api/trips';
import { memberApi } from '../../api/members';
import { useAuthStore } from '../../store/auth';
import { useSocket } from '../../context/SocketContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

export default function MobileDriverDashboard() {
    const user = useAuthStore((state) => state.user);
    const today = format(new Date(), 'yyyy-MM-dd');
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [sheetHeight, setSheetHeight] = useState('partial'); // 'collapsed', 'partial', 'expanded'
    const controls = useAnimation();
    const prevTripsLength = useRef(0);
    const socket = useSocket();

    const { data: driver } = useQuery({
        queryKey: ['driver-profile', user?.id],
        queryFn: () => user?.id ? driverApi.getByUserId(user.id) : null,
        enabled: !!user,
    });

    // Real-time Location Tracking
    useEffect(() => {
        if (!socket || !driver) return;

        // Determine if we should be tracking
        // For demo: Track if 'ON_DUTY' or 'ON_TRIP'
        const shouldTrack = driver.currentStatus === 'AVAILABLE' || driver.currentStatus === 'ON_TRIP';

        if (!shouldTrack) return;

        console.log('Starting location tracking...');
        const interval = setInterval(() => {
            // Simulate GPS movement for demo (jitter)
            // In a real app, use Geolocation API
            const baseLat = 33.4152; 
            const baseLng = -111.8315;
            
            // Add some random movement
            const lat = baseLat + (Math.random() - 0.5) * 0.01;
            const lng = baseLng + (Math.random() - 0.5) * 0.01;

            socket.emit('update_location', {
                driverId: driver.id,
                lat,
                lng,
                status: driver.currentStatus
            });
        }, 3000); // Emit every 3 seconds

        return () => clearInterval(interval);
    }, [socket, driver]);

    // Real-time Trip Updates
    useEffect(() => {
        if (!socket) return;

        const handleUpdate = () => {
            console.log('[Socket] Trip assigned or updated, refetching...');
            queryClient.invalidateQueries({ queryKey: ['trips'] });
        };

        socket.on('trip_assigned', handleUpdate);
        socket.on('trip_updated', handleUpdate);

        return () => {
            socket.off('trip_assigned', handleUpdate);
            socket.off('trip_updated', handleUpdate);
        };
    }, [socket, queryClient]);

    const { data: trips = [] } = useQuery({
        queryKey: ['trips', today],
        queryFn: () => tripApi.getTrips({ date: today }),
    });

    // Notify on new trip
    useEffect(() => {
        if (trips.length > prevTripsLength.current && prevTripsLength.current !== 0) {
            setNotificationOpen(true);
            // Optional: play sound here if asset available
        }
        prevTripsLength.current = trips.length;
    }, [trips.length]);

    const sortedTrips = [...trips].sort((a, b) => {
        if (a.status === 'IN_PROGRESS') return -1;
        if (b.status === 'IN_PROGRESS') return 1;
        return new Date(a.stops[0].scheduledTime).getTime() - new Date(b.stops[0].scheduledTime).getTime();
    });

    const activeTrip = sortedTrips.find(t => t.status === 'IN_PROGRESS') || sortedTrips.find(t => t.status === 'SCHEDULED');
    const otherTrips = sortedTrips.filter(t => t.id !== activeTrip?.id);

    const createDemoTripMutation = useMutation({
        mutationFn: async () => {
            if (!user?.id) return;

            // Fetch a real member to avoid FK constraint errors
            const members = await memberApi.getMembers();
            const memberId = members.length > 0 ? members[0].id : null;

            if (!memberId) {
                alert("No members found in system. Please create a member first.");
                return;
            }

            const today = new Date();
            const pickupTime = new Date(today);
            pickupTime.setMinutes(pickupTime.getMinutes() + 30); // 30 mins from now

            await tripApi.createTrip({
                tripDate: today,
                assignedDriverId: user.id,
                tripType: 'PICK_UP',
                members: [{ memberId }],
                stops: [
                    {
                        stopType: 'PICKUP',
                        stopOrder: 1,
                        address: '1 Main St, Mesa, AZ 85201',
                        gpsLatitude: 33.41518,
                        gpsLongitude: -111.83147,
                        scheduledTime: pickupTime
                    },
                    {
                        stopType: 'DROPOFF',
                        stopOrder: 2,
                        address: 'Phoenix Sky Harbor, Phoenix, AZ 85034',
                        gpsLatitude: 33.4352,
                        gpsLongitude: -112.0101,
                        scheduledTime: new Date(pickupTime.getTime() + 3600000)
                    }
                ]
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trips'] });
        },
        onError: (err) => {
            console.error(err);
            alert(`Failed to create demo trip: ${(err as any).response?.data?.message || (err as any).message || "Unknown error"}`);
        }
    });

    const handleStartTrip = (id: string) => navigate(`/driver/trips/${id}/execute`);

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
            {/* 1. Full-Screen Map Background */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                <DriverMap activeTrip={activeTrip} />
                
                {/* Gradient Overlay for better readability of floating elements */}
                <Box sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    height: 120, 
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)',
                    zIndex: 1
                }} />
            </Box>

            {/* 2. Floating Header Area (Glassmorphism) */}
            <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                px: 2, 
                pt: 6, // INCREASED TOP PADDING
                pb: 2,
                zIndex: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <IconButton 
                    onClick={() => setDrawerOpen(true)}
                    sx={{ 
                        bgcolor: 'rgba(255,255,255,0.9)', 
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        '&:hover': { bgcolor: 'white' }
                    }}
                >
                    <MenuIcon sx={{ color: '#333' }} />
                </IconButton>

                <Box sx={{ display: 'flex', gap: 1 }}>
                     <Chip 
                        icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff5252', ml: 1 }} />}
                        label="LIVE" 
                        sx={{ 
                            bgcolor: 'rgba(255,255,255,0.9)', 
                            backdropFilter: 'blur(10px)',
                            fontWeight: 900,
                            color: '#333',
                            fontSize: '0.65rem',
                            height: 24,
                            '& .MuiChip-label': { pl: 0.5 }
                        }} 
                    />
                     <Chip 
                        label={format(new Date(), 'EEE, MMM d')} 
                        sx={{ 
                            bgcolor: 'rgba(255,255,255,0.9)', 
                            backdropFilter: 'blur(10px)',
                            fontWeight: 700,
                            color: '#333',
                            border: '1px solid rgba(255,255,255,0.3)'
                        }} 
                    />
                </Box>
            </Box>

            <DriverDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                driver={driver}
            />

            {/* 3. Sliding iPhone-Style Sheet */}
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
                    collapsed: { y: 'calc(100svh - 180px)' }, // Slightly higher to ensure visibility
                    partial: { y: 'calc(100svh - 400px)' },
                    expanded: { y: 60 }
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 20,
                    background: 'white',
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: 'calc(100svh - 60px)',
                    height: '100svh', // Force explicit height for better drag tracking
                    overflow: 'hidden'
                }}
            >
                {/* Drag Handle Container */}
                <Box sx={{ width: '100%', py: 1, display: 'flex', justifyContent: 'center', cursor: 'grab', '&:active': { cursor: 'grabbing' } }}>
                    <Box sx={{ width: 40, height: 5, bgcolor: '#e0e0e0', borderRadius: 2.5 }} />
                </Box>

                {/* Sheet Content Area */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2, pt: 0 }}>
                    {/* Active/Hero Section */}
                    {activeTrip ? (
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Typography variant="h6" fontWeight={800} color="primary">Active Trip</Typography>
                                <Chip 
                                    label={activeTrip.status.replace('_', ' ')} 
                                    color={activeTrip.status === 'IN_PROGRESS' ? 'success' : 'primary'}
                                    size="small"
                                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                                />
                            </Box>
                            
                            <Paper 
                                elevation={0}
                                sx={{ 
                                    p: 2.5, 
                                    borderRadius: 4, 
                                    bgcolor: '#0f172a', // Dark theme for active card
                                    color: 'white',
                                    mb: 2,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Decorative circle */}
                                <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />

                                <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
                                    {activeTrip.stops[0]?.scheduledTime ? format(new Date(activeTrip.stops[0].scheduledTime), 'h:mm') : 'Now'}
                                    <span style={{ fontSize: '0.5em', opacity: 0.7, marginLeft: 4 }}>{activeTrip.stops[0]?.scheduledTime ? format(new Date(activeTrip.stops[0].scheduledTime), 'a') : ''}</span>
                                </Typography>

                                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#38bdf8', mb: 0.5 }}>
                                    {activeTrip.members?.[0]?.member?.firstName} {activeTrip.members?.[0]?.member?.lastName}
                                </Typography>

                                <Typography variant="body2" sx={{ opacity: 0.8, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <MyLocation sx={{ fontSize: 14 }} />
                                    {activeTrip.stops[0]?.address.split(',')[0]}
                                </Typography>

                                {user?.role === 'DRIVER' && (
                                    <Button 
                                        variant="contained" 
                                        fullWidth 
                                        size="large"
                                        onClick={() => navigate(`/driver/trips/${activeTrip.id}/execute`)}
                                        sx={{ 
                                            bgcolor: 'white', 
                                            color: '#0f172a', 
                                            fontWeight: 800,
                                            height: 48,
                                            borderRadius: 24,
                                            fontSize: '1rem',
                                            '&:hover': { bgcolor: '#f1f5f9' }
                                        }}
                                    >
                                        {activeTrip.status === 'SCHEDULED' ? 'START TRIP' : 'CONTINUE'}
                                    </Button>
                                )}
                            </Paper>
                        </Box>
                    ) : (
                         <Box sx={{ py: 4, textAlign: 'center', opacity: 0.5 }}>
                            <Typography variant="h6" fontWeight={700}>All Caught Up</Typography>
                            <Typography variant="body2">No trips currently in progress</Typography>
                        </Box>
                    )}

                    {/* Upcoming List Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={800}>Upcoming Trips</Typography>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                            {otherTrips.length} SCHEDULED
                        </Typography>
                    </Box>

                    {/* Upcoming Scroll List */}
                    <Stack spacing={1.5}>
                        {otherTrips.length > 0 ? (
                            otherTrips.map(trip => (
                                <ActiveTripCard
                                    key={trip.id}
                                    trip={trip}
                                    compact={true}
                                    onViewDetails={() => navigate(`/driver/trips/${trip.id}`)}
                                    onStartTrip={() => navigate(`/driver/trips/${trip.id}/execute`)}
                                    showActions={user?.role === 'DRIVER'}
                                />
                            ))
                        ) : (
                             <Box sx={{ py: 4, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #e2e8f0' }}>
                                <Typography variant="body2" color="text.secondary">
                                    No other trips scheduled.
                                </Typography>
                                <Button
                                    size="small"
                                    onClick={() => createDemoTripMutation.mutate()}
                                    sx={{ mt: 1, fontWeight: 700 }}
                                >
                                    Quick Add Demo Trip
                                </Button>
                            </Box>
                        )}
                    </Stack>
                    
                    {/* Add extra padding at bottom of sheet content */}
                    <Box sx={{ height: 120 }} />
                </Box>
            </motion.div>

            {/* Log Past Trip FAB */}
            <Fab
                color="primary"
                aria-label="log past trip"
                onClick={() => navigate('/driver/backfill')}
                sx={{
                    position: 'absolute',
                    bottom: 24,
                    right: 24,
                    zIndex: 30,
                    bgcolor: '#0f172a',
                    '&:hover': { bgcolor: '#1e293b' }
                }}
            >
                <History />
            </Fab>

            {/* Notification Area */}
            <Snackbar
                open={notificationOpen}
                autoHideDuration={6000}
                onClose={() => setNotificationOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setNotificationOpen(false)} severity="success" sx={{ width: '100%', borderRadius: 3, fontWeight: 700 }}>
                    New Trip Assigned!
                </Alert>
            </Snackbar>


        </Box>
    );
}
