import { Box, Button, Card, CardContent, Container, Step, StepContent, StepLabel, Stepper, Typography, Chip } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { tripApi } from '../../api/trips';
import { CheckCircle, Navigation, Create } from '@mui/icons-material';
import { useState } from 'react';
import SignaturePad from '../../components/SignaturePad';

export default function TripExecutionPage() {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSignatureOpen, setIsSignatureOpen] = useState(false);
    const [signingMemberId, setSigningMemberId] = useState<string | null>(null);

    const { data: trip, isLoading } = useQuery({
        queryKey: ['trip', tripId],
        queryFn: () => tripApi.getTripById(tripId!),
        enabled: !!tripId,
    });

    const startTripMutation = useMutation({
        mutationFn: () => tripApi.startTrip(tripId!),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
    });

    const arriveStopMutation = useMutation({
        mutationFn: (stopId: string) => tripApi.arriveAtStop(tripId!, stopId, { lat: 33.4484, lng: -112.0740 }), // Mock GPS
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
    });

    const completeStopMutation = useMutation({
        mutationFn: ({ stopId, odometer }: { stopId: string, odometer?: number }) => tripApi.completeStop(tripId!, stopId, odometer),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
    });

    const signatureMutation = useMutation({
        mutationFn: ({ memberId, data }: { memberId: string, data: string }) => tripApi.saveSignature(tripId!, memberId, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
    });

    const completeTripMutation = useMutation({
        mutationFn: () => tripApi.completeTrip(tripId!),
        onSuccess: () => navigate('/driver/trips')
    });

    if (isLoading || !trip) return <Typography sx={{ p: 4 }}>Loading trip details...</Typography>;


    // Simplified: Just list stops in Stepper.
    const activeStep = trip.stops.findIndex((s: any) => !s.actualArrivalTime || !s.actualDepartureTime);
    // If all completed, activeStep is -1 (from findIndex).
    const currentStepIndex = activeStep === -1 ? trip.stops.length : activeStep;

    const handleSignatureSave = (base64: string) => {
        if (signingMemberId) {
            signatureMutation.mutate({ memberId: signingMemberId, data: base64 });
        }
    };

    return (
        <Container sx={{ py: 2, pb: 10 }}>
            {/* Header info */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={600}>Trip #{trip.id.slice(0, 5)}</Typography>
                <Chip label={trip.status} color={trip.status === 'IN_PROGRESS' ? 'warning' : 'default'} sx={{ mt: 1 }} />
            </Box>

            {/* Members */}
            <Card sx={{ mb: 3 }} variant="outlined">
                <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>PASSENGERS</Typography>
                    {trip.members.map((tm: any) => (
                        <Box key={tm.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body1" fontWeight={500}>{tm.member?.firstName || 'Unknown'} {tm.member?.lastName || ''}</Typography>
                            {tm.memberSignatureBase64 && <CheckCircle color="success" fontSize="small" />}
                        </Box>
                    ))}
                </CardContent>
            </Card>

            {/* Stepper */}
            <Stepper activeStep={currentStepIndex} orientation="vertical">
                {trip.stops.map((stop: any, index: number) => (
                    <Step key={stop.id} expanded={true}>
                        <StepLabel
                            StepIconProps={{
                                sx: { color: stop.actualDepartureTime ? '#2e7d32' : (index === currentStepIndex ? '#1976d2' : '#bdbdbd') }
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight={600}>{stop.stopType}</Typography>
                            <Typography variant="body2">{stop.address}</Typography>
                        </StepLabel>
                        <StepContent>
                            <Box sx={{ mb: 2, mt: 1 }}>
                                {trip.status === 'SCHEDULED' && index === 0 ? (
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        onClick={() => startTripMutation.mutate()}
                                        disabled={startTripMutation.isPending}
                                    >
                                        Start Trip
                                    </Button>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {/* Arrive Button */}
                                        {!stop.actualArrivalTime && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<Navigation />}
                                                onClick={() => arriveStopMutation.mutate(stop.id)}
                                                disabled={arriveStopMutation.isPending}
                                            >
                                                Arrive at {stop.stopType === 'PICKUP' ? 'Pickup' : 'Dropoff'}
                                            </Button>
                                        )}

                                        {/* Actions at Stop */}
                                        {stop.actualArrivalTime && !stop.actualDepartureTime && (
                                            <Box>
                                                {stop.stopType === 'DROPOFF' && (
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>REQUIRED</Typography>
                                                        {trip.members.map((tm: any) => (
                                                            <Button
                                                                key={tm.id}
                                                                variant="outlined"
                                                                fullWidth
                                                                startIcon={tm.memberSignatureBase64 ? <CheckCircle /> : <Create />}
                                                                color={tm.memberSignatureBase64 ? "success" : "primary"}
                                                                onClick={() => {
                                                                    setSigningMemberId(tm.memberId);
                                                                    setIsSignatureOpen(true);
                                                                }}
                                                                sx={{ mb: 1 }}
                                                            >
                                                                {tm.memberSignatureBase64 ? `Signed: ${tm.member?.firstName || 'Member'}` : `Correct Signature: ${tm.member?.firstName || 'Member'}`}
                                                            </Button>
                                                        ))}
                                                    </Box>
                                                )}

                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    fullWidth
                                                    onClick={() => completeStopMutation.mutate({ stopId: stop.id })}
                                                    disabled={completeStopMutation.isPending}
                                                >
                                                    Complete {stop.stopType === 'PICKUP' ? 'Pickup' : 'Dropoff'}
                                                </Button>
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </StepContent>
                    </Step>
                ))}
            </Stepper>

            {/* Complete Trip Action */}
            {trip.status === 'IN_PROGRESS' && currentStepIndex === trip.stops.length && (
                <Box sx={{ mt: 4, p: 2, bgcolor: '#e8f5e9', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="success.main" gutterBottom>All Stops Completed</Typography>
                    <Button
                        variant="contained"
                        color="success"
                        size="large"
                        fullWidth
                        onClick={() => completeTripMutation.mutate()}
                    >
                        Finalize Trip
                    </Button>
                </Box>
            )}

            <SignaturePad
                open={isSignatureOpen}
                onClose={() => setIsSignatureOpen(false)}
                onSave={handleSignatureSave}
                title={`Sign for ${trip.members.find((m: any) => m.memberId === signingMemberId)?.member?.firstName || 'Member'}`}
            />
        </Container>
    );
}
