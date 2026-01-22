import { Box, Container, CircularProgress, Paper, Button, Typography, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { tripApi } from '../../api/trips';
import { useState } from 'react';
import { useAuthStore } from '../../store/auth';
import PreTripChecklist from '../../components/driver/execution/PreTripChecklist';
import ActiveNavigation from '../../components/driver/execution/ActiveNavigation';
import PickupWorkflow from '../../components/driver/execution/PickupWorkflow';
import DropoffWorkflow from '../../components/driver/execution/DropoffWorkflow';
import TripSummary from '../../components/driver/execution/TripSummary';
import TripReportForm from '../../components/driver/TripReportForm';
import DriverMap from '../../components/dashboard/DriverMap';

// Trip Execution States
type ExecutionState = 'LOADING' | 'PRE_TRIP' | 'EN_ROUTE_PICKUP' | 'AT_PICKUP' | 'EN_ROUTE_DROPOFF' | 'AT_DROPOFF' | 'TRIP_REPORT' | 'COMPLETED';

// Factory Step Component
const TripStep = ({ label, status, onClick }: { label: string, status: 'PENDING' | 'ACTIVE' | 'COMPLETED', onClick?: () => void }) => (
    <Box 
        onClick={onClick}
        sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            opacity: status === 'PENDING' ? 0.3 : 1,
            position: 'relative'
        }}
    >
        <Box sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: '50%', 
            bgcolor: status === 'COMPLETED' ? '#4CAF50' : status === 'ACTIVE' ? '#2196F3' : '#9E9E9E',
            color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mb: 0.5,
            fontWeight: 700
        }}>
           {status === 'COMPLETED' ? '✓' : ''}
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 700, color: status === 'ACTIVE' ? '#2196F3' : '#666' }}>
            {label}
        </Typography>
    </Box>
);

// Helper for Smart Map Launch (iOS vs Google)
const openMapApp = (address: string) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const destination = encodeURIComponent(address);
    
    if (isIOS) {
        window.location.href = `maps://?daddr=${destination}`;
    } else {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
    }
};

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
        signature: null as string | null,
        driverSignature: null as string | null
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
             const pickup = trip.stops.find((s: any) => s.stopType === 'PICKUP');
             const dropoff = trip.stops.find((s: any) => s.stopType === 'DROPOFF');
             
             if (pickup?.actualDepartureTime) {
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
            return new Promise((resolve) => {
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
            if (viewState === 'EN_ROUTE_PICKUP') setViewState('AT_PICKUP');
            if (viewState === 'EN_ROUTE_DROPOFF') setViewState('AT_DROPOFF');
        }
    });

    const completeStopMutation = useMutation({
        mutationFn: ({ stopId, odometer }: { stopId: string, odometer?: number }) =>
            tripApi.completeStop(tripId!, stopId, odometer),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
        }
    });

    const signatureMutation = useMutation({
        mutationFn: ({ memberId, data, proxyData }: { memberId: string, data: string, proxyData?: any }) =>
            tripApi.saveSignature(tripId!, memberId, data, proxyData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
    });

    const completeTripMutation = useMutation({
        mutationFn: () => tripApi.completeTrip(tripId!),
        onSettled: () => {
            console.log('[TripExecution] Trip settled, returning to dashboard');
            navigate('/driver');
        }
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

    const userAuth = useAuthStore(state => state.user);

    if (isLoading || !trip) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

    const pickupStop = trip.stops?.find((s: any) => s.stopType === 'PICKUP');
    const dropoffStop = trip.stops?.find((s: any) => s.stopType === 'DROPOFF');
    const firstMember = trip.members?.[0]?.member;
    const signingMemberId = trip.members?.[0]?.memberId;
    
    const clientName = firstMember ? `${firstMember.firstName} ${firstMember.lastName}` : 'Unknown Client';
    const clientAhcccsId = firstMember?.ahcccsId || '';
    const clientDob = firstMember?.dob || '';
    const clientAddress = firstMember?.address || '';

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
            {/* Header Overlay - Clear Navigation */}
            <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                p: 2, 
                pt: 8, // Safe area distance + extra padding
                zIndex: 2000, 
                display: 'flex', 
                alignItems: 'center' 
            }}>
                 <IconButton 
                    onClick={() => {
                        console.log('[TripExecution] Back to Dashboard');
                        navigate('/driver');
                    }}
                    sx={{ 
                        bgcolor: 'white', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
                        '&:hover': { bgcolor: '#f5f5f5' },
                        zIndex: 2001
                    }}
                 >
                    <ArrowBack />
                 </IconButton>
            </Box>


            {/* Background Map - Real */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                 <DriverMap activeTrip={trip} />
            </Box>

            {/* Bottom Sheet Container */}
            <Paper
                elevation={6}
                sx={{
                    position: 'absolute',
                    top: '25%', // Increased visible map area
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'white',
                    borderRadius: '24px 24px 0 0',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden' // Manage overflow in children
                }}
            >
                <Container maxWidth="sm" sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    p: '0 !important' // Override default padding to handle scrolling internally
                }}>
                    {/* Stepped Progress Indicator - Fixed Header */}
                    <Box sx={{ 
                        p: 3, 
                        pb: 2,
                        bgcolor: 'white',
                        zIndex: 20
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                            <Box sx={{ position: 'absolute', top: 16, left: 40, right: 40, height: 2, bgcolor: '#e0e0e0', zIndex: -1 }} />
                            
                            <TripStep label="START" status={viewState === 'PRE_TRIP' ? 'ACTIVE' : 'COMPLETED'} />
                            <TripStep label="PICKUP" status={['PRE_TRIP', 'EN_ROUTE_PICKUP'].includes(viewState) ? 'PENDING' : viewState === 'AT_PICKUP' ? 'ACTIVE' : 'COMPLETED'} />
                            <TripStep label="DROPOFF" status={['PRE_TRIP', 'EN_ROUTE_PICKUP', 'AT_PICKUP', 'EN_ROUTE_DROPOFF'].includes(viewState) ? 'PENDING' : viewState === 'AT_DROPOFF' ? 'ACTIVE' : 'COMPLETED'} />
                            <TripStep label="FINISH" status={viewState === 'COMPLETED' ? 'COMPLETED' : ['TRIP_REPORT', 'COMPLETED'].includes(viewState) ? 'ACTIVE' : 'PENDING'} />
                        </Box>
                    </Box>

                    <Box sx={{ 
                        flex: 1, 
                        overflowY: 'auto',
                        position: 'relative',
                        px: 3,
                        pb: 4 
                    }}>
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
                                clientName={clientName}
                                onNavigate={() => {
                                    openMapApp(pickupStop?.address || '');
                                }}
                                onArrive={() => arriveStopMutation.mutate(pickupStop?.id)}
                            />
                        )}

                        {viewState === 'AT_PICKUP' && (
                            <PickupWorkflow
                                clientName={clientName}
                                onConfirmPickup={() => {
                                    completeStopMutation.mutate({ stopId: pickupStop?.id }, {
                                        onSuccess: () => setViewState('EN_ROUTE_DROPOFF')
                                    });
                                }}
                                onNoShow={(data) => {
                                    console.log('No Show:', data);
                                    navigate('/driver');
                                }}
                            />
                        )}

                        {viewState === 'EN_ROUTE_DROPOFF' && (
                            <ActiveNavigation
                                destinationAddress={dropoffStop?.address || 'Unknown'}
                                destinationType="DROPOFF"
                                clientName={clientName}
                                onNavigate={() => {
                                    openMapApp(dropoffStop?.address || '');
                                }}
                                onArrive={() => arriveStopMutation.mutate(dropoffStop?.id)}
                            />
                        )}

                        {viewState === 'AT_DROPOFF' && (
                            <DropoffWorkflow
                                trip={trip}
                                startOdometer={tripReport.startOdometer}
                                onComplete={(data) => {
                                    setTripReport(prev => ({
                                        ...prev,
                                        endOdometer: data.odometer,
                                        notes: data.notes,
                                        signature: data.signature,
                                        driverSignature: data.driverSignature || null
                                    }));
                                    handleSignatureSave({
                                        signatureBase64: data.signature
                                    });
                                    // TODO: Save driver signature too if API supports it here, but it's handled in final report submit too
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
                                    memberId: signingMemberId,
                                    memberName: clientName,
                                    memberAhcccsId: clientAhcccsId,
                                    memberDOB: clientDob,
                                    memberAddress: clientAddress,
                                    pickupAddress: pickupStop?.address || '',
                                    dropoffAddress: dropoffStop?.address || '',
                                    vehicleId: trip.assignedVehicle?.vehicleNumber || 'FLEET-101',
                                    vehicleMake: trip.assignedVehicle?.make || 'Toyota',
                                    vehicleColor: trip.assignedVehicle?.color || 'White'
                                }}
                                driverInfo={{
                                    id: userAuth?.id || 'DRIVER-001',
                                    name: userAuth ? `${userAuth.firstName} ${userAuth.lastName}` : 'John Driver'
                                }}
                                startOdometer={tripReport.startOdometer}
                                initialSignatures={{
                                    member: tripReport.signature,
                                    driver: tripReport.driverSignature
                                }}
                                onSubmit={(data) => {
                                    if (data.pdfBlob) {
                                        submitReportMutation.mutate({
                                            reportData: data,
                                            pdfBlob: data.pdfBlob
                                        });
                                    } else {
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
