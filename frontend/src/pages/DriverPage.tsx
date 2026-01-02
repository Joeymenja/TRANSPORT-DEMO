import { Box, Container, Typography, Card, CardContent, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, Chip, IconButton } from '@mui/material';
import { DirectionsCar, LocationOn, Schedule, Speed, CheckCircle, Groups, Edit, Map } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripApi } from '../api/trips';
import { useState } from 'react';
import SignaturePad from '../components/SignaturePad';
import { useAuthStore } from '../store/auth';

export default function DriverPage() {
    const queryClient = useQueryClient();
    const [odoValue, setOdoValue] = useState<string>('');
    const [isOdoDialogOpen, setIsOdoDialogOpen] = useState(false);
    const [currentStopId, setCurrentStopId] = useState<string | null>(null);
    const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);
    const [signatureMemberId, setSignatureMemberId] = useState<string | null>(null);

    const { user } = useAuthStore();
    const { data: trips, isLoading } = useQuery({
        queryKey: ['driver-trips'],
        queryFn: () => tripApi.getTrips(),
    });

    // Filter trips for the current driver in the frontend for now
    const driverTrips = trips?.filter(t => t.assignedDriverId === user?.id) || [];

    const arriveMutation = useMutation({
        mutationFn: ({ tripId, stopId, gps }: { tripId: string, stopId: string, gps?: { lat: number, lng: number } }) =>
            tripApi.arriveAtStop(tripId, stopId, gps),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['driver-trips'] }),
    });

    const signatureMutation = useMutation({
        mutationFn: ({ tripId, memberId, signature }: { tripId: string, memberId: string, signature: string }) =>
            tripApi.saveSignature(tripId, memberId, signature),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['driver-trips'] });
            setIsSignatureDialogOpen(false);
            setSignatureMemberId(null);
        },
    });

    const completeMutation = useMutation({
        mutationFn: ({ tripId, stopId, odo }: { tripId: string, stopId: string, odo?: number }) =>
            tripApi.completeStop(tripId, stopId, odo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['driver-trips'] });
            setIsOdoDialogOpen(false);
            setOdoValue('');
        },
    });

    const activeTrip = driverTrips.find(t => t.status === 'IN_PROGRESS' || t.status === 'SCHEDULED');

    const handleArrive = (stopId: string) => {
        if (!activeTrip) return;

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                arriveMutation.mutate({
                    tripId: activeTrip.id,
                    stopId,
                    gps: { lat: position.coords.latitude, lng: position.coords.longitude }
                });
            }, () => {
                // Fallback if GPS fails
                arriveMutation.mutate({ tripId: activeTrip.id, stopId });
            });
        } else {
            arriveMutation.mutate({ tripId: activeTrip.id, stopId });
        }
    };

    const handleCompleteStop = () => {
        if (activeTrip && currentStopId) {
            completeMutation.mutate({
                tripId: activeTrip.id,
                stopId: currentStopId,
                odo: odoValue ? parseInt(odoValue, 10) : undefined
            });
        }
    };

    if (isLoading) return <Typography sx={{ p: 4 }}>Loading Trips...</Typography>;

    return (
        <Container maxWidth="sm" sx={{ mt: 2, mb: 4 }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <DirectionsCar color="primary" />
                <Typography variant="h5" fontWeight="600">Driver Console</Typography>
            </Box>

            {!activeTrip ? (
                <Card sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="textSecondary">No active trips assigned for today.</Typography>
                </Card>
            ) : (
                <Box>
                    <Card sx={{ mb: 3, borderLeft: '6px solid #0096D6' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">Active Trip</Typography>
                                <Chip label={activeTrip.status} size="small" color="primary" />
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <LocationOn fontSize="small" color="action" />
                                <Typography variant="body2">{activeTrip.tripType.replace('_', ' ')}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <DirectionsCar fontSize="small" color="action" />
                                <Typography variant="body2">
                                    {activeTrip.assignedVehicle ?
                                        `${activeTrip.assignedVehicle.make} ${activeTrip.assignedVehicle.model} (${activeTrip.assignedVehicle.licensePlate})` :
                                        'No Vehicle Assigned'}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Groups fontSize="small" color="action" />
                                <Typography variant="body2">{activeTrip.members.length} Members</Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>Trip Progress</Typography>

                    <Box sx={{ position: 'relative' }}>
                        {(activeTrip.stops || []).map((stop: any, index: number) => {
                            const isArrived = !!stop.actualArrivalTime;
                            const isCompleted = !!stop.actualDepartureTime;

                            return (
                                <Card key={stop.id} sx={{ mb: 2, opacity: isCompleted ? 0.6 : 1 }}>
                                    <CardContent sx={{ p: '16px !important' }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: isCompleted ? '#00C853' : '#0096D6', fontSize: 14 }}>
                                                    {index + 1}
                                                </Avatar>
                                                {index < activeTrip.stops.length - 1 && (
                                                    <Box sx={{ width: '2px', flexGrow: 1, bgcolor: '#e0e0e0', my: 1 }} />
                                                )}
                                            </Box>

                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="subtitle2" color="primary">{stop.stopType}</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <Typography variant="body2">{stop.address}</Typography>
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop.address)}`, '_blank')}
                                                    >
                                                        <Map fontSize="small" />
                                                    </IconButton>
                                                </Box>

                                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                                    {stop.scheduledTime && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Schedule sx={{ fontSize: 14 }} color="action" />
                                                            <Typography variant="caption">
                                                                {new Date(stop.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    {stop.odometerReading && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Speed sx={{ fontSize: 14 }} color="action" />
                                                            <Typography variant="caption">{stop.odometerReading} mi</Typography>
                                                        </Box>
                                                    )}
                                                </Box>

                                                {!isArrived ? (
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        onClick={() => handleArrive(stop.id)}
                                                    >
                                                        Arrive at Stop
                                                    </Button>
                                                ) : !isCompleted ? (
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                        {activeTrip.members.map((member: any) => {
                                                            const isRelevant = member.pickupStopId === stop.id || member.dropoffStopId === stop.id;
                                                            if (!isRelevant) return null;

                                                            return (
                                                                <Button
                                                                    key={member.id}
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={member.memberSignatureBase64 ? <CheckCircle /> : <Edit />}
                                                                    color={member.memberSignatureBase64 ? 'success' : 'primary'}
                                                                    onClick={() => {
                                                                        setSignatureMemberId(member.id);
                                                                        setIsSignatureDialogOpen(true);
                                                                    }}
                                                                >
                                                                    {member.memberSignatureBase64 ? 'Signed' : `Sign: ${member.firstName}`}
                                                                </Button>
                                                            );
                                                        })}
                                                        <Button
                                                            variant="outlined"
                                                            color="success"
                                                            fullWidth
                                                            onClick={() => {
                                                                setCurrentStopId(stop.id);
                                                                setIsOdoDialogOpen(true);
                                                            }}
                                                        >
                                                            Depart / Complete
                                                        </Button>
                                                    </Box>
                                                ) : (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#00C853' }}>
                                                        <CheckCircle fontSize="small" />
                                                        <Typography variant="caption" fontWeight="600">Completed</Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Box>
                </Box>
            )}

            <Dialog open={isOdoDialogOpen} onClose={() => setIsOdoDialogOpen(false)}>
                <DialogTitle>Stop Completion</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>Enter current odometer reading to complete this stop.</Typography>
                    <TextField
                        autoFocus
                        label="Odometer (miles)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={odoValue}
                        onChange={(e) => setOdoValue(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsOdoDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCompleteStop} variant="contained" color="success">Submit & Complete</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={isSignatureDialogOpen}
                onClose={() => setIsSignatureDialogOpen(false)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>Member Signature</DialogTitle>
                <DialogContent>
                    {signatureMemberId && (
                        <SignaturePad
                            onSave={(sig) => {
                                if (activeTrip && signatureMemberId) {
                                    signatureMutation.mutate({
                                        tripId: activeTrip.id,
                                        memberId: signatureMemberId,
                                        signature: sig
                                    });
                                }
                            }}
                            onCancel={() => setIsSignatureDialogOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Container>
    );
}

