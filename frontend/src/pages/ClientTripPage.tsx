import { Box, Container, Card, CardContent, Typography, Button, Avatar, Chip, CircularProgress, IconButton } from '@mui/material';
import { Phone, CheckCircle } from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { tripApi } from '../api/trips'; // We might need a specific endpoint to find active trip by member
import { format } from 'date-fns';

// Mock function to find active trip for a member (in reality this should be an API endpoint)
// For now we will fetch all trips and filter client side for the demo
const useActiveTrip = (memberId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data: trips = [], isLoading } = useQuery({
        queryKey: ['trips', today],
        queryFn: () => tripApi.getTrips({ date: today }),
    });

    const activeTrip = trips.find(t =>
        t.members.some((m: any) => m.memberId === memberId || m.member?.id === memberId) &&
        ['SCHEDULED', 'IN_PROGRESS', 'WAITING_FOR_CLIENTS'].includes(t.status)
    );

    return { trip: activeTrip, isLoading };
};

export default function ClientTripPage() {
    const { memberId } = useParams<{ memberId: string }>();
    const { trip, isLoading } = useActiveTrip(memberId || '');

    const readyMutation = useMutation({
        mutationFn: () => tripApi.markMemberReady(trip!.id, memberId!),
        onSuccess: () => {
            alert("Driver has been notified you are ready!");
        }
    });

    if (isLoading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

    if (!trip) {
        return (
            <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ mb: 2 }}>No Active Trip</Typography>
                <Typography color="text.secondary">You don't have any trips scheduled for today right now.</Typography>
            </Container>
        );
    }

    const driver = trip.assignedDriverId ? { name: "John Doe (Driver)", phone: "555-0123" } : null; // Mock driver info if not fully populated
    const vehicle = trip.assignedVehicle;

    return (
        <Container maxWidth="sm" sx={{ py: 2, height: '100vh', bgcolor: '#f5f5f5' }}>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#0096D6' }}>GVBH Transport</Typography>
                <Typography variant="body2" color="text.secondary">Client Mobile View</Typography>
            </Box>

            <Card sx={{ borderRadius: 4, mb: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
                        YOUR RIDE STATUS
                    </Typography>
                    <Box sx={{ my: 2 }}>
                        <Chip
                            label={trip.status.replace('_', ' ')}
                            color={trip.status === 'IN_PROGRESS' ? 'warning' : 'info'}
                            sx={{ fontSize: '1.2rem', py: 2.5, px: 2, borderRadius: 3 }}
                        />
                    </Box>
                    <Typography variant="h6">
                        ETA: 10:30 AM
                    </Typography>
                </CardContent>
            </Card>

            {driver && (
                <Card sx={{ borderRadius: 3, mb: 3 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 56, height: 56, bgcolor: '#0096D6' }}>D</Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h6">{driver.name}</Typography>
                                {vehicle && (
                                    <Typography variant="body2" color="text.secondary">
                                        {vehicle.color} {vehicle.make} {vehicle.model} • {vehicle.licensePlate}
                                    </Typography>
                                )}
                            </Box>
                            <IconButton
                                color="primary"
                                sx={{ bgcolor: '#E3F2FD', '&:hover': { bgcolor: '#BBDEFB' } }}
                                href={`tel:${driver.phone}`}
                            >
                                <Phone />
                            </IconButton>
                        </Box>
                    </CardContent>
                </Card>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 'auto' }}>
                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<CheckCircle />}
                    onClick={() => readyMutation.mutate()}
                    disabled={readyMutation.isPending || readyMutation.isSuccess}
                    sx={{
                        py: 2,
                        fontSize: '1.1rem',
                        borderRadius: 3,
                        bgcolor: '#00C853',
                        '&:hover': { bgcolor: '#00A844' }
                    }}
                >
                    {readyMutation.isSuccess ? "DRIVER NOTIFIED" : "I'M READY FOR PICKUP"}
                </Button>

                <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    startIcon={<Phone />}
                    href="tel:555-0000" // Dispatch
                    sx={{ py: 1.5, borderRadius: 3 }}
                >
                    Call Dispatch
                </Button>
            </Box>
        </Container>
    );
}
