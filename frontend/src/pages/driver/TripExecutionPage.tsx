import { Box, Typography, Container, CircularProgress, Paper, Button } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { tripApi } from '../../api/trips';
import { useState } from 'react';
import PreTripChecklist from '../../components/driver/execution/PreTripChecklist';
import ActiveNavigation from '../../components/driver/execution/ActiveNavigation';
import PickupWorkflow from '../../components/driver/execution/PickupWorkflow';
import DropoffWorkflow from '../../components/driver/execution/DropoffWorkflow';
import TripSummary from '../../components/driver/execution/TripSummary';
import TripReportForm from '../../components/driver/TripReportForm';
import { reportApi } from '../../api/reports';

// Trip Execution States
type ExecutionState = 'LOADING' | 'PRE_TRIP' | 'EN_ROUTE_PICKUP' | 'AT_PICKUP' | 'EN_ROUTE_DROPOFF' | 'AT_DROPOFF' | 'TRIP_REPORT' | 'COMPLETED';

export default function TripExecutionPage() {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // In a real app, we would derive this from trip.status and internal flags
    const [viewState, setViewState] = useState<ExecutionState>('PRE_TRIP');

    // Trip Data State
    const [tripReport, setTripReport] = useState({
        startOdometer: 0,
        endOdometer: 0,
        notes: '',
        signature: null as string | null
    });

    const { data: trip, isLoading } = useQuery({
        queryKey: ['trip', tripId],
        queryFn: () => tripApi.getTripById(tripId!),
        enabled: !!tripId,
    });

    const startTripMutation = useMutation({
        mutationFn: (data: { odometer: number }) => tripApi.startTrip(tripId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
            setViewState('EN_ROUTE_PICKUP');
        }
    });

    const arriveStopMutation = useMutation({
        mutationFn: (stopId: string) => tripApi.arriveAtStop(tripId!, stopId, { lat: 33.4, lng: -112.0 }), // Mock GPS
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
            // Auto-transition based on current state (could be improved with explicit state from backend)
            if (viewState === 'EN_ROUTE_PICKUP') setViewState('AT_PICKUP');
            if (viewState === 'EN_ROUTE_DROPOFF') setViewState('AT_DROPOFF');
        }
    });

    const completeStopMutation = useMutation({
        mutationFn: ({ stopId, odometer }: { stopId: string, odometer?: number }) =>
            tripApi.completeStop(tripId!, stopId, odometer),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
            // Transition logic
            // Ideally we check variables.stopId against trip.stops to see if it was pickup or dropoff
        }
    });

    const signatureMutation = useMutation({
        mutationFn: ({ memberId, data, proxyData }: { memberId: string, data: string, proxyData?: any }) =>
            tripApi.saveSignature(tripId!, memberId, data, proxyData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
    });

    const submitReportMutation = useMutation({
        mutationFn: (reportData: any) => reportApi.createAndSubmitReport(tripId!, reportData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
            setViewState('COMPLETED');
        }
    });

    const completeTripMutation = useMutation({
        mutationFn: () => tripApi.completeTrip(tripId!),
        onSuccess: () => navigate('/driver')
    });

    if (isLoading || !trip) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

    // Helper to get stop IDs
    const pickupStop = trip.stops.find((s: any) => s.stopType === 'PICKUP');
    const dropoffStop = trip.stops.find((s: any) => s.stopType === 'DROPOFF');
    const signingMemberId = trip.members[0]?.memberId;


    const handleSignatureSave = (data: { signatureBase64: string; isProxy?: boolean; proxySignerName?: string; proxyRelationship?: string; proxyReason?: string }) => {
        if (signingMemberId) {
            signatureMutation.mutate({
                memberId: signingMemberId,
                data: data.signatureBase64,
                proxyData: data.isProxy ? {
                    isProxy: data.isProxy,
                    proxySignerName: data.proxySignerName,
                    proxyRelationship: data.proxyRelationship,
                    proxyReason: data.proxyReason
                } : undefined
            });
        }
    };

    return (
        <Box sx={{ height: '100vh', width: '100vw', bgcolor: '#e5e3df', position: 'relative', overflow: 'hidden' }}>

            {/* Background Map Simulation */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '40%', opacity: 0.8 }}>
                <img src="https://maps.googleapis.com/maps/api/staticmap?center=Phoenix,AZ&zoom=13&size=600x800&scale=2&key=YOUR_KEY"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    alt="Map Background"
                />
                {/* Back Button Overlay */}
                <Box sx={{ position: 'absolute', top: 48, left: 16 }}>
                    <Button
                        onClick={() => navigate('/driver')}
                        variant="contained"
                        sx={{ bgcolor: 'white', color: '#111', borderRadius: '50px', '&:hover': { bgcolor: '#f5f5f5' } }}
                    >
                        Back
                    </Button>
                </Box>
            </Box>

            {/* Bottom Sheet Container */}
            <Paper
                elevation={6}
                sx={{
                    position: 'absolute',
                    top: '40%', // Starts from map edge
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'white',
                    borderRadius: '24px 24px 0 0',
                    overflowY: 'auto',
                    zIndex: 10
                }}
            >
                <Container maxWidth="sm" sx={{ pt: 1, pb: 4 }}>
                    {/* Drag Handle */}
                    <Box sx={{ width: 40, height: 4, bgcolor: '#e0e0e0', borderRadius: 2, mx: 'auto', my: 2 }} />

                    <Box sx={{ px: 2 }}>
                        {viewState === 'PRE_TRIP' && (
                            <PreTripChecklist
                                lastOdometer={15000}
                                onCancel={() => navigate('/driver')}
                                onComplete={(data) => {
                                    setTripReport(prev => ({ ...prev, startOdometer: data.odometer }));
                                    startTripMutation.mutate({ odometer: data.odometer });
                                }}
                            />
                        )}

                        {viewState === 'EN_ROUTE_PICKUP' && (
                            <ActiveNavigation
                                destinationAddress={pickupStop?.address || 'Unknown'}
                                destinationType="PICKUP"
                                clientName={trip.members[0]?.member?.firstName + ' ' + trip.members[0]?.member?.lastName}
                                onNavigate={() => {
                                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pickupStop?.address)}`, '_blank');
                                }}
                                onArrive={() => arriveStopMutation.mutate(pickupStop?.id)}
                            />
                        )}

                        {viewState === 'AT_PICKUP' && (
                            <PickupWorkflow
                                clientName={trip.members[0]?.member?.firstName + ' ' + trip.members[0]?.member?.lastName}
                                onConfirmPickup={(data) => {
                                    // 1. Mark ready (optional) 
                                    // 2. Complete Pickup Stop
                                    completeStopMutation.mutate({ stopId: pickupStop?.id }, {
                                        onSuccess: () => setViewState('EN_ROUTE_DROPOFF')
                                    });
                                }}
                                onNoShow={(data) => {
                                    // Handle no show API
                                    console.log('No Show:', data);
                                    navigate('/driver');
                                }}
                            />
                        )}

                        {viewState === 'EN_ROUTE_DROPOFF' && (
                            <ActiveNavigation
                                destinationAddress={dropoffStop?.address || 'Unknown'}
                                destinationType="DROPOFF"
                                clientName={trip.members[0]?.member?.firstName + ' ' + trip.members[0]?.member?.lastName}
                                onNavigate={() => {
                                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dropoffStop?.address)}`, '_blank');
                                }}
                                onArrive={() => arriveStopMutation.mutate(dropoffStop?.id)}
                            />
                        )}

                        {viewState === 'AT_DROPOFF' && (
                            <DropoffWorkflow
                                startOdometer={tripReport.startOdometer}
                                onComplete={(data) => {
                                    setTripReport(prev => ({
                                        ...prev,
                                        endOdometer: data.odometer,
                                        notes: data.notes,
                                        signature: data.signature
                                    }));

                                    // Complete Dropoff Stop
                                    completeStopMutation.mutate({
                                        stopId: dropoffStop?.id,
                                        odometer: data.odometer
                                    }, {
                                        onSuccess: () => setViewState('TRIP_REPORT')
                                    });
                                }}
                            />
                        )}

                        {viewState === 'TRIP_REPORT' && (
                            <TripReportForm
                                tripData={{
                                    id: trip.id,
                                    memberId: signingMemberId || '',
                                    memberName: trip.members[0]?.member?.firstName
                                        ? `${trip.members[0].member.firstName} ${trip.members[0].member.lastName}`
                                        : 'Client',
                                    memberAhcccsId: trip.members[0]?.member?.medicaidId,
                                    memberDOB: trip.members[0]?.member?.dateOfBirth,
                                    memberAddress: trip.members[0]?.member?.address,
                                    pickupAddress: pickupStop?.address || 'Unknown',
                                    dropoffAddress: dropoffStop?.address || 'Unknown',
                                    vehicleId: trip.assignedVehicle?.licensePlate || 'Unknown',
                                    vehicleMake: trip.assignedVehicle?.make,
                                    vehicleColor: trip.assignedVehicle?.color,
                                    vehicleType: trip.assignedVehicle?.type,
                                }}
                                driverInfo={{
                                    id: trip.assignedDriverId || '',
                                    name: trip.assignedDriver?.user?.firstName
                                        ? `${trip.assignedDriver.user.firstName} ${trip.assignedDriver.user.lastName}`
                                        : 'Driver',
                                }}
                                startOdometer={tripReport.startOdometer}
                                onSubmit={(reportData) => submitReportMutation.mutate(reportData)}
                                onCancel={() => navigate('/driver')}
                            />
                        )}

                        {viewState === 'COMPLETED' && (
                            <TripSummary
                                startOdometer={tripReport.startOdometer}
                                endOdometer={tripReport.endOdometer}
                                notes={tripReport.notes}
                                signature={tripReport.signature}
                                onSubmit={() => completeTripMutation.mutate()}
                            />
                        )}
                    </Box>
                </Container>
            </Paper>
        </Box>
    );
}
