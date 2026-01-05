import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Card, Grid, Chip, Button, List, ListItem, ListItemIcon, ListItemText, Alert } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripApi } from '../api/trips';
import { ArrowBack, Person, LocationOn, DirectionsCar, Description, Cancel } from '@mui/icons-material';
import { format } from 'date-fns';
import LoadingOverlay from '../components/LoadingOverlay';

export default function TripDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: trip, isLoading } = useQuery({
        queryKey: ['trip', id],
        queryFn: () => tripApi.getTripById(id!),
        enabled: !!id,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ status }: { status: any }) => tripApi.updateTrip(id!, { status }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', id] }),
    });

    if (isLoading || !trip) return <LoadingOverlay open={true} />;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/trips')} sx={{ mb: 2 }}>
                Back to Trips
            </Button>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight={600}>
                        Trip #{trip.id.substring(0, 8)}
                    </Typography>
                    <Typography color="text.secondary">
                        {format(new Date(trip.tripDate), 'EEEE, MMMM d, yyyy')}
                    </Typography>
                </Box>
                <Chip
                    label={trip.status.replace('_', ' ')}
                    color={
                        trip.status === 'COMPLETED' ? 'success' :
                            trip.status === 'IN_PROGRESS' ? 'warning' :
                                trip.status === 'CANCELLED' ? 'error' : 'info'
                    }
                    sx={{ height: 32, px: 2, fontWeight: 600 }}
                />
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Trip Details</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">Member</Typography>
                                <Typography variant="body1">
                                    {trip.members?.map((m: any) => `${m.member?.firstName} ${m.member?.lastName}`).join(', ')}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">Reason for Visit</Typography>
                                <Typography variant="body1">{trip.reasonForVisit || 'N/A'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">Escort</Typography>
                                <Typography variant="body1">
                                    {trip.escortName ? `${trip.escortName} (${trip.escortRelationship})` : 'None'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                                <Typography variant="body1">{trip.tripType.replace('_', ' ')}</Typography>
                            </Grid>
                        </Grid>
                    </Card>

                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Route Information</Typography>
                        <List>
                            {trip.stops?.sort((a: any, b: any) => a.stopOrder - b.stopOrder).map((stop: any, index: number) => (
                                <ListItem key={stop.id} divider={index !== trip.stops.length - 1}>
                                    <ListItemIcon>
                                        <LocationOn color={stop.stopType === 'PICKUP' ? 'success' : 'error'} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={stop.address}
                                        secondary={
                                            <Box component="span" display="flex" gap={2}>
                                                <Typography component="span" variant="caption">
                                                    Scheduled: {format(new Date(stop.scheduledTime || trip.tripDate), 'h:mm a')}
                                                </Typography>
                                                {stop.actualArrivalTime && (
                                                    <Typography component="span" variant="caption" color="success.main">
                                                        Arrived: {format(new Date(stop.actualArrivalTime), 'h:mm a')}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Assignment</Typography>
                        <Box mb={2}>
                            <Typography variant="subtitle2" color="text.secondary">Driver</Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Person fontSize="small" />
                                <Typography>
                                    {trip.assignedDriverId ? 'Driver Assigned' : 'Unassigned'}
                                </Typography>
                            </Box>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">Vehicle</Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                                <DirectionsCar fontSize="small" />
                                <Typography>
                                    {trip.assignedVehicleId ? 'Vehicle Assigned' : 'Unassigned'}
                                </Typography>
                            </Box>
                        </Box>
                    </Card>

                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Actions</Typography>
                        <Box display="flex" flexDirection="column" gap={2}>
                            {trip.status === 'COMPLETED' && (
                                <Button
                                    variant="outlined"
                                    startIcon={<Description />}
                                    onClick={() => tripApi.downloadReport(trip.id)}
                                >
                                    Download Report
                                </Button>
                            )}

                            {trip.status !== 'CANCELLED' && trip.status !== 'COMPLETED' && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Cancel />}
                                    onClick={() => {
                                        if (window.confirm('Cancel this trip?')) {
                                            updateStatusMutation.mutate({ status: 'CANCELLED' });
                                        }
                                    }}
                                >
                                    Cancel Trip
                                </Button>
                            )}
                        </Box>
                    </Card>

                    {trip.reportStatus && (
                        <Card sx={{
                            p: 3, mt: 3, border: 1, borderColor:
                                trip.reportStatus === 'VERIFIED' ? 'success.main' :
                                    trip.reportStatus === 'REJECTED' ? 'error.main' : 'warning.main'
                        }}>
                            <Typography variant="h6" gutterBottom>Report Status</Typography>
                            <Chip
                                label={trip.reportStatus}
                                color={
                                    trip.reportStatus === 'VERIFIED' ? 'success' :
                                        trip.reportStatus === 'REJECTED' ? 'error' : 'warning'
                                }
                            />
                            {trip.reportRejectionReason && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    Reason: {trip.reportRejectionReason}
                                </Alert>
                            )}
                        </Card>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
}
