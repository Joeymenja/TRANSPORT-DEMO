import { Box, Container, CircularProgress, Paper, Button } from '@mui/material';
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
    
    // Sync view state with trip status
    const [initialized, setInitialized] = useState(false);
    
    if (trip && !initialized) {
        setInitialized(true);
        if (trip.status === 'IN_PROGRESS') {
             // Basic restoration logic
             const pickup = trip.stops.find((s: any) => s.stopType === 'PICKUP');
             const dropoff = trip.stops.find((s: any) => s.stopType === 'DROPOFF');
             
             if (pickup?.actualDepartureTime) {
                 // Pickup done
                 if (dropoff?.actualArrivalTime) {
                     setViewState('AT_DROPOFF');
                 } else {
                     setViewState('EN_ROUTE_DROPOFF');
                 }
             } else if (pickup?.actualArrivalTime) {
                 setViewState('AT_PICKUP');
             } else {
                 setViewState('EN_ROUTE_PICKUP');
             }
        }
    }

    const startTripMutation = useMutation({
        mutationFn: () => tripApi.startTrip(tripId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
            setViewState('EN_ROUTE_PICKUP');
        },
        onError: (error) => {
            console.error('Failed to start trip:', error);
            alert('Failed to start trip. Please try again.');
        }
    });

    const arriveStopMutation = useMutation({
        mutationFn: async (stopId: string) => {
            return new Promise((resolve, reject) => {
                if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                             resolve(tripApi.arriveAtStop(tripId!, stopId, { 
                                 lat: position.coords.latitude, 
                                 lng: position.coords.longitude 
                             }));
                        },
                        (error) => {
                             console.warn("Geolocation failed, using mock:", error);
                             resolve(tripApi.arriveAtStop(tripId!, stopId, { lat: 33.4, lng: -112.0 }));
                        }
                    );
                } else {
                     resolve(tripApi.arriveAtStop(tripId!, stopId, { lat: 33.4, lng: -112.0 }));
                }
            });
        },
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

    const completeTripMutation = useMutation({
        mutationFn: () => tripApi.completeTrip(tripId!),
        onSuccess: () => navigate('/driver')
    });

    const submitReportMutation = useMutation({
        mutationFn: ({ reportData, pdfBlob }: { reportData: any, pdfBlob: Blob }) =>
            tripApi.submitReport(tripId!, reportData, pdfBlob),
        onSuccess: () => {
             setViewState('COMPLETED');
             queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
        },
        onError: (err) => {
            console.error('Failed to submit report', err);
            alert('Failed to save report. Please try again.');
        }
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
            {/* Back Button Overlay - Hoisted for visibility */}
            <Box sx={{ position: 'absolute', top: 48, left: 16, zIndex: 9999 }}>
                <Button
                    onClick={() => navigate('/driver')}
                    variant="contained"
                    sx={{ bgcolor: 'white', color: '#111', borderRadius: '50px', '&:hover': { bgcolor: '#f5f5f5' }, boxShadow: 2 }}
                >
                    Back
                </Button>
            </Box>

            {/* Background Map Simulation - Placeholder Pattern */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '30%', bgcolor: '#e3f2fd', opacity: 1, backgroundImage: 'radial-gradient(#2196F3 1px, transparent 1px)', backgroundSize: '20px 20px' }}>

            </Box>

            {/* Bottom Sheet Container */}
            <Paper
                elevation={6}
                sx={{
                    position: 'absolute',
                    top: '30%', // Starts from map edge
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'white',
                    borderRadius: '24px 24px 0 0',
                    overflowY: 'auto',
                    zIndex: 10
                }}
            >
                <Container maxWidth="sm" sx={{ pt: 1, pb: 24 }}>
                    {/* Drag Handle */}
                    <Box sx={{ width: 40, height: 4, bgcolor: '#e0e0e0', borderRadius: 2, mx: 'auto', my: 2 }} />

                    <Box sx={{ px: 2 }}>
                        {viewState === 'PRE_TRIP' && (
                            <PreTripChecklist
                                lastOdometer={trip.assignedVehicle?.odometer || 0}
                                onCancel={() => navigate('/driver')}
                                onComplete={(data) => {
                                    setTripReport(prev => ({ ...prev, startOdometer: data.odometer }));
                                    startTripMutation.mutate();
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
                                onConfirmPickup={() => {
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

                                    handleSignatureSave({
                                        signatureBase64: data.signature,
                                        // TODO: Pass proxy data from DropoffWorkflow if supported
                                    });

                                    // 2. Complete Dropoff Stop (passing end odometer if needed by API)
                                    // Note: In real app, we might save notes/odometer to a separate endpoint or as trip metadata
                                    completeStopMutation.mutate({
                                        stopId: dropoffStop?.id,
                                        odometer: data.odometer
                                        // notes: data.notes 
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
                                    memberId: trip.members[0]?.memberId,
                                    memberName: `${trip.members[0]?.member?.firstName || ''} ${trip.members[0]?.member?.lastName || ''}`.trim() || 'Unknown Member',
                                    memberAhcccsId: trip.members[0]?.member?.ahcccsId || '',
                                    memberDOB: trip.members[0]?.member?.dob || '',
                                    memberAddress: trip.members[0]?.member?.address || '',
                                    pickupAddress: pickupStop?.address || '',
                                    dropoffAddress: dropoffStop?.address || '',
                                    vehicleId: trip.assignedVehicle?.vehicleNumber || 'FLEET-101',
                                    vehicleMake: trip.assignedVehicle?.make || 'Toyota',
                                    vehicleColor: trip.assignedVehicle?.color || 'White'
                                }}
                                driverInfo={{
                                    id: 'DRIVER-001', // Mock
                                    name: 'John Driver' // Mock
                                }}
                                startOdometer={tripReport.startOdometer}
                                onSubmit={(data) => {
                                    if (data.pdfBlob) {
                                        submitReportMutation.mutate({
                                            reportData: data,
                                            pdfBlob: data.pdfBlob
                                        });
                                    } else {
                                        // Should satisfy TS type of pdfBlob being optionally present in data, 
                                        // or we cast/check. The form guarantees it for submit now.
                                        alert("PDF not generated");
                                    }
                                }}
                                onCancel={() => setViewState('AT_DROPOFF')}
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
