import { Box, Card, CardContent, Chip, Container, Typography, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '../../api/trips';
import { useAuthStore } from '../../store/auth';
import { format } from 'date-fns';
import { ChevronRight, Schedule, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function DriverTripsPage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const today = new Date();

    const { data: trips = [], isLoading } = useQuery({
        queryKey: ['driver-trips', user?.id],
        queryFn: () => {
            if (!user?.id) return [];
            return tripApi.getDriverTrips(user.id);
        },
        enabled: !!user?.id,
    });

    if (isLoading) {
        return (
            <Container sx={{ py: 4, textAlign: 'center' }}>
                <Typography>Loading today's schedule...</Typography>
            </Container>
        );
    }

    if (trips.length === 0) {
        return (
            <Container sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    No trips assigned for today.
                </Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ py: 2 }}>
            <Button variant="text" onClick={() => navigate('/driver')} sx={{ mb: 2 }}>
                ← Back to Driver Home
            </Button>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Today's Schedule
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
                {format(today, 'EEEE, MMMM d')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {trips.map((trip) => (
                    <Card
                        key={trip.id}
                        elevation={0}
                        sx={{
                            border: '1px solid #e0e0e0',
                            borderRadius: 2,
                            position: 'relative',
                            bgcolor: trip.status === 'IN_PROGRESS' ? '#E3F2FD' : 'white',
                            borderColor: trip.status === 'IN_PROGRESS' ? '#2196F3' : '#e0e0e0',
                        }}
                        onClick={() => navigate(`/driver/trips/${trip.id}`)}
                    >
                        <CardContent sx={{ pb: '16px !important' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                <Chip
                                    label={trip.status.replace('_', ' ')}
                                    size="small"
                                    color={
                                        trip.status === 'IN_PROGRESS' ? 'warning' :
                                            trip.status === 'COMPLETED' ? 'success' :
                                                'info'
                                    }
                                    sx={{ fontWeight: 500 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    Trip #{trip.id.slice(0, 5)}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Schedule fontSize="small" color="action" />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {trip.stops[0]?.scheduledTime ? format(new Date(trip.stops[0].scheduledTime), 'h:mm a') : 'TBD'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Person fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                    {trip.members.map((tm: any) => tm.member ? `${tm.member.firstName} ${tm.member.lastName}` : 'Unknown').join(', ')}
                                </Typography>
                            </Box>
                            <Box sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#bdbdbd' }}>
                                <ChevronRight />
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Container>
    );
}
