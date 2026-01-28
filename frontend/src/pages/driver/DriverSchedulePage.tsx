import { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, Tabs, Tab, CircularProgress, Chip, Snackbar, Alert, IconButton } from '@mui/material';
import { ChevronRight, History, CalendarMonth, Menu as MenuIcon, Add } from '@mui/icons-material';
import ActiveTripCard from '../../components/dashboard/ActiveTripCard';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/auth';
import { driverApi } from '../../api/drivers';
import { tripApi, Trip } from '../../api/trips';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

export default function DriverSchedulePage() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [showNotification, setShowNotification] = useState(false);
    const [lastTripCount, setLastTripCount] = useState(0);

    // 1. Get Driver Profile
    const { data: driver } = useQuery({
        queryKey: ['driver-profile-schedule', user?.id],
        queryFn: () => user?.id ? driverApi.getByUserId(user.id) : null,
        enabled: !!user?.id
    });

    // 2. Poll for Trips (every 10 seconds)
    const { data: trips = [], isLoading } = useQuery({
        queryKey: ['driver-trips', driver?.id],
        queryFn: () => driver?.id ? tripApi.getDriverTrips(driver.id) : [],
        enabled: !!driver?.id,
        refetchInterval: 10000,
    });

    // Detect new trips
    useEffect(() => {
        if (trips.length > lastTripCount && lastTripCount > 0) {
            setShowNotification(true);
            // Optionally play a sound here
        }
        setLastTripCount(trips.length);
    }, [trips.length]);

    const upcomingTrips = trips.filter(t => ['SCHEDULED', 'IN_PROGRESS', 'PENDING_APPROVAL'].includes(t.status));
    const pastTrips = trips.filter(t => ['COMPLETED', 'FINALIZED', 'CANCELLED'].includes(t.status));

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    if (isLoading && !trips.length) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    const renderTripList = (tripList: Trip[]) => (
        <List disablePadding>
            {tripList.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                    <Typography>No trips found.</Typography>
                </Box>
            ) : (
                tripList.map((trip, i) => (
                    <Box key={trip.id}>
                        <ListItem button onClick={() => navigate(`/driver/trips/${trip.id}`)} sx={{ py: 2 }}>
                            <Box sx={{
                                bgcolor: tabValue === 0 ? 'primary.light' : '#f5f5f5',
                                width: 50, height: 50,
                                borderRadius: 2,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                mr: 2,
                                color: tabValue === 0 ? 'primary.main' : 'text.secondary'
                            }}>
                                <Typography variant="caption" fontWeight={700}>{format(new Date(trip.tripDate), 'MMM').toUpperCase()}</Typography>
                                <Typography variant="h6" fontWeight={700} lineHeight={1}>{format(new Date(trip.tripDate), 'dd')}</Typography>
                            </Box>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography fontWeight={600}>
                                            {format(new Date(trip.tripDate), 'h:mm a')}
                                        </Typography>
                                        {trip.status === 'COMPLETED' && <Chip label="Done" size="small" color="success" sx={{ height: 20, fontSize: '0.6rem' }} />}
                                    </Box>
                                }
                                secondary={`${trip.stops.length} Stops • ${trip.tripType.replace('_', ' ')}`}
                            />
                            <ChevronRight color="action" />
                        </ListItem>
                        {i < tripList.length - 1 && <Divider />}
                    </Box>
                ))
            )}
        </List>
    );

    return (
        <Box sx={{ width: '100%' }}>
            {/* Secondary Header */}
            <Box sx={{ 
                height: 60, 
                display: 'flex', 
                alignItems: 'center', 
                px: 2, 
                borderBottom: '1px solid #f0f0f0',
                bgcolor: 'white',
                position: 'relative'
            }}>
                <IconButton size="small">
                    <MenuIcon sx={{ color: '#333' }} />
                </IconButton>
                <Typography sx={{ 
                    position: 'absolute', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    fontWeight: 700,
                    color: '#333',
                    fontSize: '1.1rem'
                }}>
                    My Schedule
                </Typography>
            </Box>

            <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
                <Paper elevation={0} sx={{
                    borderRadius: 3,
                    border: '1px solid #f0f0f0',
                    overflow: 'hidden',
                    bgcolor: 'white'
                }}>
                    <Box sx={{ borderBottom: '1px solid #f0f0f0' }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            variant="fullWidth"
                            sx={{
                                '& .MuiTab-root': {
                                    py: 2,
                                    color: '#94a3b8',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    fontSize: '0.85rem',
                                    minHeight: 48,
                                },
                                '& .Mui-selected': {
                                    color: '#0096D6 !important'
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#0096D6',
                                    height: 2.5,
                                    borderRadius: '2px 2px 0 0',
                                }
                            }}
                        >
                            <Tab icon={<CalendarMonth fontSize="small" />} iconPosition="start" label="Upcoming" />
                            <Tab icon={<History fontSize="small" />} iconPosition="start" label="History" />
                        </Tabs>
                    </Box>

                    <Box sx={{ p: { xs: 2, md: 4 } }}>
                        {tabValue === 0 && (
                            <Paper
                                onClick={() => navigate('/driver/backfill')}
                                elevation={0}
                                sx={{
                                    p: 2,
                                    mb: 3,
                                    bgcolor: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 2.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    cursor: 'pointer',
                                    '&:active': { bgcolor: '#f1f5f9' },
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <Box sx={{
                                    bgcolor: '#dbeafe',
                                    color: '#0096D6',
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Add sx={{ fontSize: 20 }} />
                                </Box>
                                <Box>
                                    <Typography fontWeight={700} sx={{ color: '#1e293b', fontSize: '0.9rem' }}>Log a Past Trip</Typography>
                                    <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>Create a report for a completed trip</Typography>
                                </Box>
                            </Paper>
                        )}

                        <Box>
                            {tabValue === 0 ? (
                                upcomingTrips.length === 0 ? (
                                    <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                                        <Typography>No upcoming trips.</Typography>
                                    </Box>
                                ) : (
                                    upcomingTrips.map((trip, index) => (
                                        <ActiveTripCard
                                            key={trip.id}
                                            trip={trip}
                                            isNext={index === 0}
                                            compact={true}
                                            onViewDetails={() => navigate(`/driver/trips/${trip.id}`)}
                                            onStartTrip={() => navigate(`/driver/trips/${trip.id}/execute`)}
                                        />
                                    ))
                                )
                            ) : renderTripList(pastTrips)}
                        </Box>
                    </Box>
                </Paper>
            </Box>

            <Snackbar
                open={showNotification}
                autoHideDuration={6000}
                onClose={() => setShowNotification(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setShowNotification(false)} severity="info" sx={{ width: '100%', boxShadow: 3 }}>
                    New Trip Assigned! Check Upcoming folder.
                </Alert>
            </Snackbar>
        </Box>
    );
}
