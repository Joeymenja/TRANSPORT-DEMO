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
        }
        setLastTripCount(trips.length);
    }, [trips.length]);

    const upcomingTrips = trips.filter(t => ['SCHEDULED', 'IN_PROGRESS', 'PENDING_APPROVAL'].includes(t.status));
    const pastTrips = trips.filter(t => ['COMPLETED', 'FINALIZED', 'CANCELLED'].includes(t.status));

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    if (isLoading && !trips.length) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, bgcolor: 'black', minHeight: '100vh' }}><CircularProgress sx={{ color: 'white' }} /></Box>;
    }

    const renderTripList = (tripList: Trip[]) => (
        <List disablePadding>
            {tripList.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                    <Typography>No trips found.</Typography>
                </Box>
            ) : (
                tripList.map((trip, i) => (
                    <Box key={trip.id}>
                        <ListItem button onClick={() => navigate(`/driver/trips/${trip.id}`)} sx={{ py: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                            <Box sx={{
                                bgcolor: tabValue === 0 ? 'rgba(10, 132, 255, 0.2)' : 'rgba(255,255,255,0.1)',
                                width: 50, height: 50,
                                borderRadius: 2,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                mr: 2,
                                color: tabValue === 0 ? '#0a84ff' : 'rgba(255,255,255,0.7)'
                            }}>
                                <Typography variant="caption" fontWeight={700}>{format(new Date(trip.tripDate), 'MMM').toUpperCase()}</Typography>
                                <Typography variant="h6" fontWeight={700} lineHeight={1}>{format(new Date(trip.tripDate), 'dd')}</Typography>
                            </Box>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography fontWeight={600} sx={{ color: 'white' }}>
                                            {format(new Date(trip.tripDate), 'h:mm a')}
                                        </Typography>
                                        {trip.status === 'COMPLETED' && <Chip label="Done" size="small" color="success" sx={{ height: 20, fontSize: '0.6rem' }} />}
                                        {trip.status === 'CANCELLED' && <Chip label="Cancelled" size="small" color="error" sx={{ height: 20, fontSize: '0.6rem' }} />}
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                        {trip.stops.length} Stops • {trip.tripType.replace('_', ' ')}
                                    </Typography>
                                }
                            />
                            <ChevronRight sx={{ color: 'rgba(255,255,255,0.3)' }} />
                        </ListItem>
                        {i < tripList.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />}
                    </Box>
                ))
            )}
        </List>
    );

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'black' }}>
            {/* Secondary Header */}
            <Box sx={{ 
                height: 60, 
                display: 'flex', 
                alignItems: 'center', 
                px: 2, 
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                bgcolor: 'rgba(28, 28, 30, 0.85)',
                backdropFilter: 'blur(20px)',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <IconButton size="small" onClick={() => navigate('/driver')}>
                    <MenuIcon sx={{ color: 'white' }} />
                </IconButton>
                <Typography sx={{ 
                    position: 'absolute', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    fontWeight: 700,
                    color: 'white',
                    fontSize: '1.1rem'
                }}>
                    My Schedule
                </Typography>
            </Box>

            <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
                <Box sx={{ 
                    borderRadius: 4, 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    overflow: 'hidden',
                    bgcolor: 'rgba(28, 28, 30, 0.5)'
                }}>
                    <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <Tabs 
                            value={tabValue} 
                            onChange={handleTabChange} 
                            variant="fullWidth"
                            sx={{
                                '& .MuiTab-root': {
                                    py: 3,
                                    color: 'rgba(255,255,255,0.5)',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    fontSize: '0.85rem'
                                },
                                '& .Mui-selected': {
                                    color: '#0a84ff !important'
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#0a84ff',
                                    height: 3,
                                    boxShadow: '0 0 10px rgba(10, 132, 255, 0.5)'
                                }
                            }}
                        >
                            <Tab icon={<CalendarMonth fontSize="small" />} iconPosition="start" label="Upcoming" />
                            <Tab icon={<History fontSize="small" />} iconPosition="start" label="History" />
                        </Tabs>
                    </Box>

                    <Box sx={{ p: 0 }}>
                        {tabValue === 0 && (
                             <Box sx={{ p: 2 }}>
                                {upcomingTrips.length === 0 ? (
                                    <Box sx={{ py: 8, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
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
                                            theme="dark"
                                        />
                                    ))
                                )}
                            </Box>
                        )}
                        
                        {tabValue === 1 && (
                            <Box>
                                {renderTripList(pastTrips)}
                            </Box>
                        )}
                    </Box>
                </Box>
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
