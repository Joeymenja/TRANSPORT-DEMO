import { Box, Button, IconButton, Typography, Avatar, Paper, AppBar, Toolbar, Container, Snackbar, Alert } from '@mui/material';
import { Menu as MenuIcon, LocationOn, DirectionsCarOutlined, PersonOutline, MyLocation } from '@mui/icons-material'; // Outlined icons
import DriverStatusToggle from '../driver/DriverStatusToggle';
import ActiveTripCard from './ActiveTripCard';
import DriverDrawer from '../navigation/DriverDrawer';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { driverApi } from '../../api/drivers';
import { tripApi } from '../../api/trips';
import { memberApi } from '../../api/members';
import { useAuthStore } from '../../store/auth';
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

    const { data: driver } = useQuery({
        queryKey: ['driver-profile', user?.id],
        queryFn: () => user?.id ? driverApi.getByUserId(user.id) : null,
        enabled: !!user,
    });

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
                        scheduledTime: pickupTime
                    },
                    {
                        stopType: 'DROPOFF',
                        stopOrder: 2,
                        address: 'Phoenix Sky Harbor, Phoenix, AZ 85034',
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
            alert(`Failed to create demo trip: ${err.response?.data?.message || err.message || "Unknown error"}`);
        }
    });

    const handleStartTrip = (id: string) => navigate(`/driver/trips/${id}/execute`);

    return (
        <Box sx={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>

            {/* 1. Light Header (HEADER-LIGHT-001) */}
            <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #f0f0f0' }}>
                <Toolbar>
                    <IconButton edge="start" sx={{ color: '#333' }} onClick={() => setDrawerOpen(true)}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 600, color: '#333' }}>
                        Dashboard
                    </Typography>
                    <IconButton sx={{ color: '#333' }} onClick={() => navigate('/driver/profile')}>
                        <PersonOutline />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <DriverDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                driver={driver}
            />

            {/* 2. Map Area (MAP-LIGHT-001) */}
            <Box sx={{ flex: 1.2, p: 2, bgcolor: '#fff' }}>
                <Paper
                    elevation={0}
                    sx={{
                        width: '100%', height: '100%',
                        borderRadius: 4,
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)', // Soft shadow
                        bgcolor: '#f0f0f0' // Placeholder for map load
                    }}
                >
                    <img
                        src="https://maps.googleapis.com/maps/api/staticmap?center=Phoenix,AZ&zoom=14&size=600x800&scale=2&style=feature:all|element:labels|visibility:on&key=YOUR_KEY"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        alt="Map Preview"
                    />

                    {/* Minimal Controls (MAP-LIGHT-002) */}
                    <Box sx={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Paper sx={{ borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <MyLocation sx={{ color: '#333', fontSize: 20 }} />
                        </Paper>
                    </Box>
                </Paper>
            </Box>

            {/* 3. Bottom Sheet (SHEET-LIGHT-001) */}
            <Paper
                component="div"
                elevation={3} // Top shadow only effect handled by elevation logic usually
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '20px 20px 0 0',
                    bgcolor: 'white',
                    mt: -1,
                    zIndex: 10,
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.05)', // Custom top shadow
                    overflow: 'hidden'
                }}
            >
                {/* Handle Bar */}
                <Box sx={{ pt: 1.5, pb: 1, display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: 36, height: 4, bgcolor: '#E0E0E0', borderRadius: 2 }} />
                </Box>

                {/* Section Header (SHEET-LIGHT-002) */}
                <Box sx={{ px: 3, pb: 2 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#333' }}>
                        Upcoming Trips ({trips.length})
                    </Typography>
                </Box>

                {/* Content Area (SHEET-LIGHT-003) */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#FAFAFA' }}>
                    {activeTrip ? (
                        <>
                            <ActiveTripCard
                                trip={activeTrip}
                                isNext={true}
                                onViewDetails={() => navigate(`/driver/trips/${activeTrip.id}`)}
                                onStartTrip={handleStartTrip}
                            />
                            {otherTrips.map(trip => (
                                <ActiveTripCard
                                    key={trip.id}
                                    trip={trip}
                                    isNext={false}
                                    onViewDetails={() => navigate(`/driver/trips/${trip.id}`)}
                                    onStartTrip={handleStartTrip}
                                />
                            ))}
                            <Box sx={{ mt: 3, mb: 5, textAlign: 'center' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => createDemoTripMutation.mutate()}
                                    sx={{ borderRadius: 20, textTransform: 'none' }}
                                >
                                    Create Demo Trip
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Box sx={{
                                width: 64, height: 64, mx: 'auto', mb: 2,
                                borderRadius: '50%', bgcolor: '#f0f4f8',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <DirectionsCarOutlined sx={{ fontSize: 32, color: 'primary.main' }} />
                            </Box>
                            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#333' }}>No trips scheduled</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                You're all set for now. Set your availability to receive new trips.
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={() => createDemoTripMutation.mutate()}
                                sx={{ borderRadius: 20, textTransform: 'none' }}
                            >
                                Generate Demo Trip
                            </Button>
                        </Box>
                    )}
                </Box>
            </Paper>

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
        </Box>
    );
}
