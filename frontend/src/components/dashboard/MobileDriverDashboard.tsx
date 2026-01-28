import { Box, Button, IconButton, Typography, Paper, AppBar, Toolbar, Snackbar, Alert, Fab, Chip, BottomNavigation, BottomNavigationAction, Stack } from '@mui/material';
import { Menu as MenuIcon, DirectionsCarOutlined, PersonOutline, MyLocation, Add, CalendarMonth, History, Dashboard, HistoryEdu, KeyboardArrowUp, HorizontalRule, AccessTime, NavigationOutlined } from '@mui/icons-material';
import { motion, useAnimation, useDragControls } from 'framer-motion';
import ActiveTripCard from './ActiveTripCard';
import DriverMap from './DriverMap';
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
    const [sheetHeight, setSheetHeight] = useState('collapsed');
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
        const shouldTrack = driver.currentStatus === 'AVAILABLE' || driver.currentStatus === 'ON_TRIP';
        if (!shouldTrack) return;

        const interval = setInterval(() => {
            const baseLat = 33.4152;
            const baseLng = -111.8315;
            const lat = baseLat + (Math.random() - 0.5) * 0.01;
            const lng = baseLng + (Math.random() - 0.5) * 0.01;

            socket.emit('update_location', {
                driverId: driver.id,
                lat,
                lng,
                status: driver.currentStatus
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [socket, driver]);

    // Real-time Trip Updates
    useEffect(() => {
        if (!socket) return;
        const handleUpdate = () => {
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
            const members = await memberApi.getMembers();
            const memberId = members.length > 0 ? members[0].id : null;
            if (!memberId) {
                alert("No members found in system. Please create a member first.");
                return;
            }
            const today = new Date();
            const pickupTime = new Date(today);
            pickupTime.setMinutes(pickupTime.getMinutes() + 30);

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
            height: '100svh',
            width: '100vw',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* 1. Full-Screen Map Background */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                <DriverMap activeTrip={activeTrip} />

                {/* Gradient Overlay for readability */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 140,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 100%)',
                    zIndex: 1
                }} />
            </Box>

            {/* 2. Floating Header Area */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                px: 2,
                pt: 'calc(env(safe-area-inset-top, 20px) + 8px)',
                pb: 2,
                zIndex: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <IconButton
                    onClick={() => setDrawerOpen(true)}
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                        width: 44,
                        height: 44,
                        '&:hover': { bgcolor: 'white' },
                        '&:active': { transform: 'scale(0.95)' },
                        transition: 'transform 0.1s ease',
                    }}
                >
                    <MenuIcon sx={{ color: '#1e293b', fontSize: 22 }} />
                </IconButton>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                        icon={
                            <Box sx={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                bgcolor: '#ef4444',
                                ml: 1,
                                animation: 'pulse 2s ease-in-out infinite',
                                '@keyframes pulse': {
                                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                                    '50%': { opacity: 0.5, transform: 'scale(0.8)' },
                                },
                            }} />
                        }
                        label="LIVE"
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            fontWeight: 800,
                            color: '#1e293b',
                            fontSize: '0.6rem',
                            height: 28,
                            letterSpacing: '0.05em',
                            '& .MuiChip-label': { pl: 0.5 }
                        }}
                    />
                    <Chip
                        label={format(new Date(), 'EEE, MMM d')}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            fontWeight: 600,
                            color: '#1e293b',
                            height: 28,
                            fontSize: '0.8rem',
                        }}
                    />
                </Box>
            </Box>

            <DriverDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                driver={driver}
            />

            {/* 3. Sliding Bottom Sheet */}
            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.15}
                onDragEnd={(e, info) => {
                    const threshold = 80;
                    const velocityThreshold = 400;

                    if (info.velocity.y < -velocityThreshold || info.offset.y < -threshold) {
                        if (sheetHeight === 'collapsed') setSheetHeight('partial');
                        else if (sheetHeight === 'partial') setSheetHeight('expanded');
                    }
                    else if (info.velocity.y > velocityThreshold || info.offset.y > threshold) {
                        if (sheetHeight === 'expanded') setSheetHeight('partial');
                        else if (sheetHeight === 'partial') setSheetHeight('collapsed');
                    }
                }}
                animate={sheetHeight}
                variants={{
                    collapsed: { y: 'calc(100svh - 260px)' },
                    partial: { y: 'calc(100svh - 460px)' },
                    expanded: { y: 80 }
                }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 20,
                    background: '#fff',
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    boxShadow: '0 -4px 30px rgba(0,0,0,0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: 'calc(100svh - 60px)',
                    height: '100svh',
                    overflow: 'hidden',
                    willChange: 'transform',
                }}
            >
                {/* Drag Handle */}
                <Box sx={{
                    width: '100%',
                    py: 1.5,
                    display: 'flex',
                    justifyContent: 'center',
                    cursor: 'grab',
                    '&:active': { cursor: 'grabbing' },
                    touchAction: 'none',
                }}>
                    <Box sx={{
                        width: 36,
                        height: 4,
                        bgcolor: '#d1d5db',
                        borderRadius: 2,
                    }} />
                </Box>

                {/* Sheet Content */}
                <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, pt: 0, WebkitOverflowScrolling: 'touch' }}>
                    {/* Active Trip Section */}
                    {activeTrip ? (
                        <Box sx={{ mb: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1e293b', fontSize: '0.95rem' }}>
                                    {activeTrip.status === 'IN_PROGRESS' ? 'Active Trip' : 'Next Trip'}
                                </Typography>
                                <Chip
                                    label={activeTrip.status === 'IN_PROGRESS' ? 'In Progress' : 'Scheduled'}
                                    size="small"
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: '0.65rem',
                                        height: 22,
                                        bgcolor: activeTrip.status === 'IN_PROGRESS' ? '#dcfce7' : '#dbeafe',
                                        color: activeTrip.status === 'IN_PROGRESS' ? '#166534' : '#1e40af',
                                    }}
                                />
                            </Box>

                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.5,
                                    borderRadius: 3,
                                    bgcolor: '#0f172a',
                                    color: 'white',
                                    mb: 1.5,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Decorative accent */}
                                <Box sx={{
                                    position: 'absolute',
                                    top: -30,
                                    right: -30,
                                    width: 120,
                                    height: 120,
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(56, 189, 248, 0.08)',
                                }} />

                                {/* Time */}
                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1.5 }}>
                                    <Typography variant="h3" fontWeight={800} sx={{ lineHeight: 1, letterSpacing: -1 }}>
                                        {activeTrip.stops[0]?.scheduledTime ? format(new Date(activeTrip.stops[0].scheduledTime), 'h:mm') : 'Now'}
                                    </Typography>
                                    <Typography sx={{ fontSize: '1rem', opacity: 0.5, fontWeight: 600 }}>
                                        {activeTrip.stops[0]?.scheduledTime ? format(new Date(activeTrip.stops[0].scheduledTime), 'a') : ''}
                                    </Typography>
                                </Box>

                                {/* Member name */}
                                <Typography fontWeight={700} sx={{ color: '#38bdf8', fontSize: '0.95rem', mb: 0.5 }}>
                                    {activeTrip.members?.[0]?.member?.firstName} {activeTrip.members?.[0]?.member?.lastName}
                                </Typography>

                                {/* Address */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2.5, opacity: 0.7 }}>
                                    <NavigationOutlined sx={{ fontSize: 14 }} />
                                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                        {activeTrip.stops[0]?.address.split(',')[0]}
                                    </Typography>
                                </Box>

                                {/* CTA Button */}
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
                                            height: 50,
                                            borderRadius: 25,
                                            fontSize: '0.95rem',
                                            textTransform: 'none',
                                            letterSpacing: '0.01em',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                            '&:hover': { bgcolor: '#f1f5f9' },
                                            '&:active': { transform: 'scale(0.98)' },
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        {activeTrip.status === 'SCHEDULED' ? 'Start Trip' : 'Continue Trip'}
                                    </Button>
                                )}
                            </Paper>
                        </Box>
                    ) : (
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                            <Box sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                bgcolor: '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 1.5,
                            }}>
                                <DirectionsCarOutlined sx={{ fontSize: 28, color: '#94a3b8' }} />
                            </Box>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#334155' }}>
                                All Caught Up
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.25 }}>
                                No trips currently scheduled
                            </Typography>
                        </Box>
                    )}

                    {/* Upcoming List */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1e293b', fontSize: '0.85rem' }}>
                            Upcoming
                        </Typography>
                        <Typography variant="caption" fontWeight={600} sx={{ color: '#94a3b8' }}>
                            {otherTrips.length} trip{otherTrips.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>

                    <Stack spacing={1}>
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
                            <Box sx={{
                                py: 3,
                                textAlign: 'center',
                                bgcolor: '#f8fafc',
                                borderRadius: 2.5,
                                border: '1px dashed #e2e8f0'
                            }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    No other trips scheduled today
                                </Typography>
                                <Button
                                    size="small"
                                    onClick={() => createDemoTripMutation.mutate()}
                                    sx={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'none' }}
                                >
                                    + Add Demo Trip
                                </Button>
                            </Box>
                        )}
                    </Stack>

                    {/* Bottom spacer for safe scrolling */}
                    <Box sx={{ height: 100 }} />
                </Box>
            </motion.div>

            {/* Create Trip FAB */}
            <Fab
                color="primary"
                aria-label="create new trip"
                onClick={() => navigate('/driver/create-trip')}
                sx={{
                    position: 'absolute',
                    bottom: 'calc(env(safe-area-inset-bottom, 12px) + 72px)',
                    right: 20,
                    zIndex: 15,
                    bgcolor: '#0f172a',
                    width: 52,
                    height: 52,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                    '&:hover': { bgcolor: '#1e293b' },
                    '&:active': { transform: 'scale(0.92)' },
                    transition: 'transform 0.1s ease',
                }}
            >
                <Add />
            </Fab>

            {/* Notification */}
            <Snackbar
                open={notificationOpen}
                autoHideDuration={4000}
                onClose={() => setNotificationOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{ top: 'calc(env(safe-area-inset-top, 20px) + 8px) !important' }}
            >
                <Alert
                    onClose={() => setNotificationOpen(false)}
                    severity="success"
                    sx={{
                        width: '100%',
                        borderRadius: 3,
                        fontWeight: 600,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    }}
                >
                    New Trip Assigned!
                </Alert>
            </Snackbar>
        </Box>
    );
}
