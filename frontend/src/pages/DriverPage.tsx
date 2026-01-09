import { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, Button, Accordion, AccordionSummary, AccordionDetails, Chip, IconButton } from '@mui/material';
import { ExpandMore, DirectionsCar, AccessTime, LocationOn, PlayArrow, CalendarMonth } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { tripApi, Trip, TripStatus } from '../../api/trips';
import { useAuthStore } from '../../store/auth';
import LoadingOverlay from '../../components/LoadingOverlay';

export default function DriverPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const { data: trips = [], isLoading } = useQuery({
    const { data: driverTrips = [], isLoading } = useQuery({
        queryKey: ['driver-trips', user?.id],
        queryFn: () => {
            if (!user?.id) return [];
            return tripApi.getDriverTrips(user.id);
        },
        enabled: !!user?.id
    });

    const sortedTrips = [...driverTrips].sort((a, b) => new Date(a.tripDate).getTime() - new Date(b.tripDate).getTime());

    // Find "Next" trip (first IN_PROGRESS, or first SCHEDULED)
    const activeTrip = sortedTrips.find(t => t.status === 'IN_PROGRESS');
    const nextScheduledTrip = sortedTrips.find(t => t.status === 'SCHEDULED' || t.status === 'PENDING_APPROVAL');

    const heroTrip = activeTrip || nextScheduledTrip;
    
    // Remaining trips are anything after the hero trip
    const remainingTrips = heroTrip 
        ? sortedTrips.filter(t => t.id !== heroTrip.id && new Date(t.tripDate) > new Date(heroTrip.tripDate))
        : [];

    if (isLoading) return <LoadingOverlay open={true} />;

    return (
        <Container maxWidth="sm" sx={{ py: 4, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* 1. Status Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h6" fontWeight="700" color="primary">
                        On Duty
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {user?.firstName} {user?.lastName} • {user?.role?.replace('_', ' ')}
                    </Typography>
                </Box>
                <Typography variant="h4" fontWeight="300" color="text.primary">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
            </Box>

            {/* 2. Hero Card */}
            {heroTrip ? (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {activeTrip ? 'Current Trip' : 'Up Next'}
                    </Typography>
                    <Card 
                        elevation={4}
                        sx={{ 
                            borderRadius: 4, 
                            borderLeft: `8px solid ${activeTrip ? '#00C853' : '#0096D6'}`,
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'visible'
                        }}
                        onClick={() => navigate(`/driver/trips/${heroTrip.id}/execute`)}
                    >
                        <CardContent sx={{ p: 3 }}>
                            {activeTrip && (
                                <Chip 
                                    label="IN PROGRESS" 
                                    color="success" 
                                    size="small" 
                                    sx={{ position: 'absolute', top: 16, right: 16, fontWeight: 700 }} 
                                />
                            )}
                            
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                                <AccessTime sx={{ color: 'text.secondary', mr: 1, mt: 0.5 }} />
                                <Typography variant="h2" fontWeight="700" color="text.primary" sx={{ lineHeight: 1 }}>
                                    {new Date(heroTrip.tripDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                                <LocationOn sx={{ color: 'primary.main', mr: 1, mt: 0.5 }} />
                                <Box>
                                    <Typography variant="h6" fontWeight="600">
                                        {heroTrip.stops?.[0]?.address || 'Unknown Pickup'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Pickup Location
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip 
                                    icon={<DirectionsCar />} 
                                    label={heroTrip.tripType.replace('_', ' ')} 
                                    variant="outlined" 
                                    size="small" 
                                />
                                <Chip 
                                    label={`${heroTrip.members.length} Rider${heroTrip.members.length > 1 ? 's' : ''}`} 
                                    variant="outlined" 
                                    size="small" 
                                />
                            </Box>

                            <Button 
                                variant="contained" 
                                fullWidth 
                                size="large"
                                sx={{ 
                                    mt: 3, 
                                    py: 2, 
                                    bgcolor: activeTrip ? '#00C853' : '#0096D6',
                                    fontSize: '1.2rem',
                                    fontWeight: 700,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                }}
                                endIcon={<PlayArrow />}
                            >
                                {activeTrip ? 'Continue Trip' : 'Start Trip'}
                            </Button>
                        </CardContent>
                    </Card>
                </Box>
            ) : (
                <Card sx={{ py: 6, textAlign: 'center', mb: 4, borderRadius: 4, border: '2px dashed #e0e0e0' }} elevation={0}>
                    <CalendarMonth sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        All clear! No pending trips.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Enjoy your break.
                    </Typography>
                </Card>
            )}

            {/* 3. Remaining Trips */}
            {remainingTrips.length > 0 && (
                <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Later Today ({remainingTrips.length})
                    </Typography>
                    {remainingTrips.map((trip) => (
                        <Card key={trip.id} sx={{ mb: 2, borderRadius: 2 }} variant="outlined">
                            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <Typography variant="h6" fontWeight="600" color="text.secondary">
                                            {new Date(trip.tripDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                        <Box>
                                            <Typography variant="body2" fontWeight="600">
                                                {trip.tripType.replace('_', ' ')}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 200 }} noWrap>
                                                {trip.stops?.[0]?.address}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Chip label={trip.status.replace('_', ' ')} size="small" />
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Container>
    );
}
