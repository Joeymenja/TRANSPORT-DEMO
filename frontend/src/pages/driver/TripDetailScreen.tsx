import { Box, Button, Container, Paper, Typography, Chip, Card, CardContent, Divider, Avatar, IconButton } from '@mui/material';
import { Directions, AccessTime, Phone, PlayArrow, PlaceOutlined, PersonOutline, LocalTaxiOutlined } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '../../api/trips';
import { format } from 'date-fns';
import MobileHeader from '../../components/layout/MobileHeader';

export default function TripDetailScreen() {
    const { tripId } = useParams();
    const navigate = useNavigate();

    const { data: trip, isLoading } = useQuery({
        queryKey: ['trip', tripId],
        queryFn: () => tripApi.getTripById(tripId!),
        enabled: !!tripId,
    });

    if (isLoading || !trip) return <Typography sx={{ p: 4 }}>Loading...</Typography>;

    // Check if trip can be started (e.g., within window)
    const canStart = trip.status === 'SCHEDULED' || trip.status === 'IN_PROGRESS';

    return (
        <Box sx={{ bgcolor: '#fff', minHeight: '100vh', pb: 12 }}>
            <MobileHeader title={`Trip #${trip.id.slice(-4)}`} />

            <Container maxWidth="sm" sx={{ pt: 2 }}>

                {/* 1. Map Preview Card */}
                <Card elevation={0} sx={{ mb: 3, borderRadius: 4, overflow: 'hidden', border: '1px solid #f0f0f0', position: 'relative' }}>
                    <Box sx={{
                        height: 200,
                        bgcolor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundImage: 'url(https://maps.googleapis.com/maps/api/staticmap?center=Phoenix,AZ&zoom=11&size=600x300&key=YOUR_API_KEY_HERE)', // Mock URL
                        backgroundSize: 'cover'
                    }}>
                        {/* Overlay Gradient */}
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.05), transparent)' }} />
                    </Box>

                    {/* Quick Stats Row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-around', py: 2, bgcolor: 'white' }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>EST. TIME</Typography>
                            <Typography variant="body1" fontWeight={700}>45 min</Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>DISTANCE</Typography>
                            <Typography variant="body1" fontWeight={700}>12.4 mi</Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>TYPE</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                <LocalTaxiOutlined sx={{ fontSize: 16, color: 'primary.main' }} />
                                <Typography variant="body1" fontWeight={700}>{trip.tripType === 'CARPOOL' ? 'Carpool' : 'Standard'}</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Card>

                {/* 2. Passenger Info */}
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Passenger</Typography>
                {trip.members.map((tm: any) => (
                    <Card key={tm.id} elevation={0} sx={{ mb: 3, borderRadius: 3, border: '1px solid #eee' }}>
                        <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 56, height: 56, bgcolor: '#e3f2fd', color: 'primary.main' }}>
                                    {tm.member?.firstName?.[0]}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" fontWeight={600}>
                                        {tm.member?.firstName} {tm.member?.lastName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        ID: {tm.member?.memberId}
                                    </Typography>
                                </Box>
                                <IconButton sx={{ border: '1px solid #eee' }}>
                                    <Phone sx={{ color: '#666' }} />
                                </IconButton>
                            </Box>
                        </CardContent>
                    </Card>
                ))}

                {/* 3. Route / Stops */}
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Route</Typography>
                <Card elevation={0} sx={{ mb: 4, borderRadius: 3, border: '1px solid #eee' }}>
                    <CardContent sx={{ p: 0 }}>
                        {trip.stops.map((stop: any, idx: number) => (
                            <Box key={stop.id}>
                                <Box sx={{ p: 2.5, display: 'flex', gap: 2 }}>
                                    {/* Timeline Line */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.5 }}>
                                        <PlaceOutlined sx={{ color: stop.stopType === 'PICKUP' ? 'primary.main' : 'error.main', fontSize: 20 }} />
                                        {idx < trip.stops.length - 1 && <Box sx={{ width: 1, flex: 1, bgcolor: '#eee', my: 0.5 }} />}
                                    </Box>

                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="subtitle1" fontWeight={600} color={stop.stopType === 'PICKUP' ? 'primary.main' : 'error.main'}>
                                                {stop.stopType === 'PICKUP' ? 'Pick Up' : 'Drop Off'}
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600} color="text.secondary">
                                                {format(new Date(stop.scheduledTime), 'h:mm a')}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ color: '#333' }}>
                                            {stop.address.split(',')[0]}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                            {stop.address.split(',').slice(1).join(',')}
                                        </Typography>

                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<Directions />}
                                            sx={{ borderRadius: 20, textTransform: 'none', borderColor: '#e0e0e0', color: '#666' }}
                                        >
                                            Navigate
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </CardContent>
                </Card>
            </Container>

            {/* Floating Action Bar */}
            <Box sx={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                p: 2, pb: 4, bgcolor: 'white',
                borderTop: '1px solid #f0f0f0'
            }}>
                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={!canStart}
                    startIcon={<PlayArrow />}
                    onClick={() => navigate(`/driver/trips/${tripId}/execute`)}
                    sx={{
                        height: 54,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: 27, // Pill shape
                        boxShadow: 'none',
                        bgcolor: 'primary.main'
                    }}
                >
                    {trip.status === 'IN_PROGRESS' ? 'Resume Trip' : 'Start Trip'}
                </Button>
            </Box>
        </Box>
    );
}
