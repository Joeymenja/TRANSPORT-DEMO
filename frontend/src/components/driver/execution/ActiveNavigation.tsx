import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { Navigation, ReportProblem, MyLocation, PersonOutline } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { useAuthStore } from '../../../store/auth';

// Mock ETA calculation
const MOCK_ETA_MINUTES = 12;

interface ActiveNavigationProps {
    destinationAddress: string;
    destinationType: 'PICKUP' | 'DROPOFF';
    onArrive: () => void;
    onNavigate: () => void;
    clientName?: string;
}

export default function ActiveNavigation({ destinationAddress, destinationType, onArrive, onNavigate, clientName }: ActiveNavigationProps) {
    const [eta, setEta] = useState(MOCK_ETA_MINUTES);
    const [distance, setDistance] = useState(0.8);
    const socket = useSocket();
    const user = useAuthStore(state => state.user);
    
    // Simulate getting closer and emitting location
    useEffect(() => {
        // Phoenix Metro Area
        let lat = 33.4484;
        let lng = -112.0740;

        const interval = setInterval(() => {
            setEta(prev => Math.max(0, prev - 1));
            setDistance(prev => Math.max(0, parseFloat((prev - 0.2).toFixed(1))));
            
            // Move slightly
            lat += (Math.random() - 0.5) * 0.001;
            lng += (Math.random() - 0.5) * 0.001;

            if (socket && user?.id) {
                socket.emit('update_location', {
                    driverId: user.id, // Ensure this matches User/Driver ID logic in backend
                    lat,
                    lng,
                    status: destinationType === 'PICKUP' ? 'EN_ROUTE_PICKUP' : 'EN_ROUTE_DROPOFF'
                });
            }
        }, 3000); // Update every 3 seconds for realism
        return () => clearInterval(interval);
    }, [socket, user, destinationType]);

    const isNearDestination = distance < 0.5; // Simulate geofence trigger

    return (
        <Box sx={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Trip Info Card */}
            <Card elevation={0} sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: '16px !important', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="caption" fontWeight={700} color="primary.main" letterSpacing={1}>
                            EN ROUTE TO {destinationType}
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                            {destinationAddress.split(',')[0]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                            {destinationAddress.split(',').slice(1).join(',')}
                        </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h4" fontWeight={700} color="#333">
                            {eta}<Typography component="span" variant="caption" sx={{ fontSize: 14 }}>min</Typography>
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {distance} mi
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {clientName && (
                <Card elevation={0} sx={{ borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', bgcolor: 'rgba(255,255,255,0.95)' }}>
                    <CardContent sx={{ p: '12px !important', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <PersonOutline sx={{ color: '#666' }} />
                        <Typography variant="subtitle2" fontWeight={600}>Member: {clientName}</Typography>
                    </CardContent>
                </Card>
            )}

            {/* Geofence Alert */}
            {isNearDestination && (
                <Card elevation={0} sx={{ bgcolor: '#E8F5E9', borderRadius: 3, border: '1px solid #C8E6C9' }}>
                    <CardContent sx={{ p: '12px !important', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <MyLocation color="success" />
                        <Typography variant="body2" color="success.main" fontWeight={700}>
                            You've arrived at the destination area
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {/* Actions Block */}
            <Box sx={{ 
                mt: 'auto', 
                position: 'sticky',
                bottom: 0,
                zIndex: 100,
                display: 'flex', 
                gap: 2, 
                alignItems: 'center',
                pb: 2, // Bottom safe buffer
                width: '100%',
                bgcolor: 'white', // Ensure background covers scrolling content
                borderTop: '1px solid rgba(0,0,0,0.05)',
                pt: 2,
                mx: -3,
                px: 3
            }}>
                <Button
                    variant="outlined"
                    sx={{ minWidth: 56, height: 56, borderRadius: '50%', color: '#d32f2f', borderColor: '#ffebee', bgcolor: '#ffebee' }}
                >
                    <ReportProblem />
                </Button>

                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    color="primary"
                    disabled={!isNearDestination} 
                    onClick={onArrive}
                    sx={{
                        borderRadius: 28, 
                        height: 56,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        boxShadow: '0 4px 14px 0 rgba(0,0,0,0.2)',
                        bgcolor: isNearDestination ? 'primary.main' : '#e0e0e0',
                        color: isNearDestination ? 'white' : '#999'
                    }}
                >
                    I've Arrived
                </Button>

                <Button
                    variant="outlined"
                    onClick={onNavigate}
                    sx={{ minWidth: 56, height: 56, borderRadius: '50%', color: '#1976d2', borderColor: '#e3f2fd', bgcolor: '#e3f2fd' }}
                >
                    <Navigation />
                </Button>
            </Box>
        </Box>
    );
}
