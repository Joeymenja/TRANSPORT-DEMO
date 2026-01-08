import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { Navigation, ReportProblem, MyLocation, PersonOutline } from '@mui/icons-material';
import { useEffect, useState } from 'react';

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
    // Simulate getting closer
    useEffect(() => {
        const interval = setInterval(() => {
            setEta(prev => Math.max(0, prev - 1));
            setDistance(prev => Math.max(0, parseFloat((prev - 0.2).toFixed(1))));
        }, 1000); // Fast forward for demo
        return () => clearInterval(interval);
    }, []);

    const isNearDestination = distance < 0.5; // Simulate geofence trigger

    return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>

            {/* Top Floating Status (Light Design) */}
            <Box sx={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 10 }}>
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
                    <Card elevation={0} sx={{ mt: 1, borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', bgcolor: 'rgba(255,255,255,0.95)' }}>
                        <CardContent sx={{ p: '12px !important', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <PersonOutline sx={{ color: '#666' }} />
                            <Typography variant="subtitle2" fontWeight={600}>Member: {clientName}</Typography>
                        </CardContent>
                    </Card>
                )}
            </Box>

            {/* Middle Area: Map is behind everything (handled by parent container usually, but here we assume transparency or overlay) */}

            {/* Geofence Alert */}
            {isNearDestination && (
                <Box sx={{ position: 'absolute', bottom: 100, left: 16, right: 16, zIndex: 10 }}>
                    <Card elevation={0} sx={{ bgcolor: '#E8F5E9', borderRadius: 3, border: '1px solid #C8E6C9' }}>
                        <CardContent sx={{ p: '12px !important', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <MyLocation color="success" />
                            <Typography variant="body2" color="success.main" fontWeight={700}>
                                You've arrived at the destination area
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* Quick Actions Footer (Floating) */}
            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2, pb: 4, bgcolor: 'white', display: 'flex', gap: 2, boxShadow: '0 -4px 20px rgba(0,0,0,0.05)', borderRadius: '24px 24px 0 0' }}>
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
                    color="primary" // Brand color usually
                    disabled={!isNearDestination} // Enabled by mocked geofence
                    onClick={onArrive}
                    sx={{
                        borderRadius: 28, // Pill 
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        boxShadow: 'none',
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
