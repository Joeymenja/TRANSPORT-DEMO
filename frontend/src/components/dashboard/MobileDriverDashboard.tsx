import { Box, Button, IconButton, Typography, Paper, AppBar, Toolbar, Snackbar, Alert, Fab, Chip } from '@mui/material';
import { Menu as MenuIcon, DirectionsCarOutlined, PersonOutline, MyLocation, Add } from '@mui/icons-material'; // Outlined icons
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
            height: '100vh', 
            width: '100vw', 
            display: 'flex', 
            flexDirection: 'column', 
            bgcolor: '#fff',
            // Desktop Responsive Tweaks
            maxWidth: { md: 480 }, // Mobile width on desktop
            mx: 'auto',
            borderRight: { md: '1px solid #eee' },
            borderLeft: { md: '1px solid #eee' },
            boxShadow: { md: '0 0 40px rgba(0,0,0,0.1)' }
        }}>

            {/* 1. Light Header (HEADER-LIGHT-001) */}
            <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #f0f0f0' }}>
                <Toolbar>
                    <IconButton edge="start" sx={{ color: '#333' }} onClick={() => setDrawerOpen(true)}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 600, color: '#333' }}>
                        Dashboard
                    </Typography>
                    <Box sx={{ width: 40 }} />
                </Toolbar>
            </AppBar>

            <DriverDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                driver={driver}
            />

            {/* 2. Map & Active Trip Area (FACTORY-Mode) */}
            <Box sx={{ flex: 1.5, position: 'relative', overflow: 'hidden' }}>
                {/* LIVE MAP BACKGROUND */}
                <Box sx={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
                     <DriverMap activeTrip={activeTrip} />
                </Box>

                {/* Status Overlay Card (Floating over Map) */}
                <Box sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    zIndex: 10,
                    p: 2,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                    display: 'flex',
                    alignItems: 'flex-end'
                }}>
                    <Paper 
                        elevation={6}
                        sx={{ 
                            width: '100%', 
                            borderRadius: 4, 
                            bgcolor: '#212121', 
                            color: 'white',
                            p: 2,
                            mb: 1
                        }}
                    >
                        {activeTrip ? (
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Chip 
                                        label="ON DUTY" 
                                        size="small" 
                                        sx={{ bgcolor: '#4CAF50', color: 'white', fontWeight: 700 }} 
                                    />
                                    <Typography variant="h5" fontWeight={700} sx={{ color: '#4FC3F7' }}>
                                        {format(new Date(activeTrip.stops[0].scheduledTime), 'h:mm a')}
                                    </Typography>
                                </Box>
                                
                                <Typography variant="h6" fontWeight={600} noWrap>
                                    {activeTrip.tripType === 'PICK_UP' ? 'Pick Up: ' : 'Drop Off: '}
                                    {activeTrip.members?.[0]?.member?.firstName}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }} noWrap>
                                    {activeTrip.stops[0].address}
                                </Typography>

                                <Button 
                                    variant="contained" 
                                    fullWidth 
                                    size="large"
                                    onClick={() => handleStartTrip(activeTrip.id)}
                                    sx={{ 
                                        bgcolor: '#00C853', 
                                        color: 'white', 
                                        fontWeight: 700,
                                        '&:hover': { bgcolor: '#009624' }
                                    }}
                                >
                                    {activeTrip.status === 'SCHEDULED' ? 'START TRIP' : 'CONTINUE'}
                                </Button>
                            </Box>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h6" color="text.secondary" sx={{ color: '#aaa' }}>
                                    No Active Trip
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    Standing by for dispatch...
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </Box>

            {/* List Header */}
                <Box sx={{ px: 2, py: 1.5, bgcolor: '#fff', borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#888', letterSpacing: 1 }}>
                        UPCOMING ({otherTrips.length})
                    </Typography>
                </Box>

                {/* Content Area (Factory List) */}
                <Box sx={{ flex: 1, p: 0, bgcolor: '#fff' }}>
                    {otherTrips.length > 0 ? (
                        otherTrips.map(trip => (
                            <Box 
                                key={trip.id}
                                onClick={() => navigate(`/driver/trips/${trip.id}`)}
                                sx={{ 
                                    p: 2, 
                                    borderBottom: '1px solid #eee', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    '&:active': { bgcolor: '#f9f9f9' }
                                }}
                            >
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                                        {format(new Date(trip.stops[0].scheduledTime), 'h:mm a')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#666' }}>
                                        {trip.tripType === 'PICK_UP' ? 'Pick Up' : 'Drop Off'} • {trip.members?.[0]?.member?.firstName}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" sx={{ bgcolor: '#eee', px: 1, py: 0.5, borderRadius: 1, fontWeight: 600 }}>
                                    #{trip.id.slice(0, 4)}
                                </Typography>
                            </Box>
                        ))
                    ) : (
                         <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
                            <Typography variant="body1" color="text.secondary">
                                No other trips scheduled.
                            </Typography>
                             <Button
                                variant="text"
                                color="primary"
                                onClick={() => createDemoTripMutation.mutate()}
                                sx={{ mt: 1 }}
                            >
                                (+ Demo Trip)
                            </Button>
                        </Box>
                    )}
                </Box>





            <Snackbar
                open={notificationOpen}
                autoHideDuration={6000}
                onClose={() => setNotificationOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setNotificationOpen(false)} severity="info" sx={{ width: '100%', bgcolor: 'primary.main', color: 'white' }}>
                    New Trip Assigned!
                </Alert>
            </Snackbar>

            {/* Fixed New Trip FAB (Viewport Bottom Right) */}
            <Fab
                color="primary"
                aria-label="new trip"
                size="medium"
                sx={{
                    bottom: 80,
                    right: 24,
                    position: 'fixed',
                    zIndex: 1300,
                    boxShadow: '0 4px 20px rgba(0, 150, 214, 0.5)',
                    bgcolor: '#0096D6', // Brand Primary
                    color: 'white',
                    '&:hover': { bgcolor: '#007bb0' }
                }}
                onClick={() => navigate('/driver/create-trip')}
            >
                <Add />
            </Fab>
        </Box>
    );
}
