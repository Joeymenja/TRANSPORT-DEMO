import { Box, Button, Card, CardContent, Typography, IconButton, Paper } from '@mui/material';
import { Navigation, ReportProblem, MyLocation, PersonOutline, ArrowBack, TurnRight, TurnLeft, Straight, Close } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { useAuthStore } from '../../../store/auth';
import { useAppMode } from '../../../store/appMode';
import DriverMap from '../../dashboard/DriverMap';
import { motion, useAnimation, PanInfo } from 'framer-motion';

// Mock ETA calculation
const MOCK_ETA_MINUTES = 4;

const DEMO_STEPS = [
    { threshold: 0.6, instruction: "Head north on Central Ave", icon: Straight, distance: "0.2 mi" },
    { threshold: 0.4, instruction: "Turn right onto Camelback Rd", icon: TurnRight, distance: "0.4 mi" },
    { threshold: 0.1, instruction: "Turn left onto N 44th St", icon: TurnLeft, distance: "0.3 mi" },
    { threshold: 0, instruction: "Arriving at Destination", icon: MyLocation, distance: "100 ft" }
];

// Internal Navigation Drawer Component
function NavigationDrawer({ eta, distance, onEnd, steps }: { eta: number, distance: number, onEnd: () => void, steps: any[] }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const controls = useAnimation();

    useEffect(() => {
        controls.start(isExpanded ? "expanded" : "collapsed");
    }, [isExpanded, controls]);

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.y < -50) {
            setIsExpanded(true);
        } else if (info.offset.y > 50) {
            setIsExpanded(false);
        }
    };

    return (
        <motion.div
            drag="y"
            dragConstraints={{ top: -300, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            animate={controls}
            initial="collapsed"
            variants={{
                collapsed: { y: 'calc(100% - 130px)' }, // Peeking height
                expanded: { y: '40%' } // Expanded height (top offset)
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0, // Fill screen but offset by Y
                zIndex: 20,
                pointerEvents: 'box-none' // Allow touches
            }}
        >
             <Paper sx={{ 
                height: '100%',
                bgcolor: '#1c1c1e',
                color: 'white',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                boxShadow: '0 -4px 30px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                pointerEvents: 'auto' // Capture drags on the drawer
            }}>
                {/* Grab Handle */}
                <Box 
                    onClick={() => setIsExpanded(!isExpanded)}
                    sx={{ width: '100%', py: 1.5, display: 'flex', justifyContent: 'center', cursor: 'grab' }}
                >
                    <Box sx={{ width: 40, height: 4, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
                </Box>

                {/* Summary Header (Always Visible) */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pb: 2, flexShrink: 0 }}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                            <Typography variant="h3" fontWeight={700} sx={{ color: '#30d158', letterSpacing: -1 }}>
                                {eta}
                            </Typography>
                            <Typography variant="h6" fontWeight={600} sx={{ color: '#30d158' }}>min</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Typography variant="body1" sx={{ color: '#8e8e93', fontWeight: 600 }}>
                                {distance} mi
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#48484a', fontWeight: 600 }}>•</Typography>
                            <Typography variant="body1" sx={{ color: '#8e8e93', fontWeight: 600 }}>
                                {new Date(Date.now() + eta * 60000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </Typography>
                        </Box>
                    </Box>
                    
                    <Button 
                        variant="contained" 
                        onClick={(e) => { e.stopPropagation(); onEnd(); }}
                        sx={{ 
                            borderRadius: 30, 
                            px: 4, 
                            height: 50,
                            fontSize: '1.1rem',
                            fontWeight: 700, 
                            bgcolor: '#ff453a', // systemRed 
                            color: 'white',
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#ff3b30' },
                            zIndex: 50
                        }}
                    >
                        End
                    </Button>
                </Box>

                {/* Expandable Route List */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 3, pt: 1, bgcolor: '#151517' }}>
                    <Typography variant="subtitle2" sx={{ color: '#8e8e93', fontWeight: 700, mb: 2, textTransform: 'uppercase' }}>
                        Route Steps
                    </Typography>
                    {steps.map((step, idx) => (
                        <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 3, opacity: idx === 0 ? 1 : 0.5 }}>
                            <step.icon sx={{ fontSize: 28, color: 'white' }} />
                            <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', flex: 1, pb: 2 }}>
                                <Typography variant="body1" fontWeight={600}>{step.instruction}</Typography>
                                <Typography variant="caption" color="#8e8e93">{step.distance}</Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Paper>
        </motion.div>
    );
}

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
    const [heading, setHeading] = useState(0); // Bearing for map rotation
    const [isNavigating, setIsNavigating] = useState(false); // Toggle 3D Mode
    const [currentStep, setCurrentStep] = useState(DEMO_STEPS[0]);

    const socket = useSocket();
    const user = useAuthStore(state => state.user);
    const isDemoMode = useAppMode(state => state.isDemoMode);

// Helper: Haversine Distance in Miles
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 3958.8;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };
    
    useEffect(() => {
        let watchId: number | null = null;
        let intervalId: any = null;

        const destLat = destinationType === 'PICKUP' ? 33.5284 : 33.4804;
        const destLng = destinationType === 'PICKUP' ? -112.0998 : -112.0416;

        if (isDemoMode) {
            // --- DEMO MODE: Simulated Movement ---
            let lat = 33.4484;
            let lng = -112.0740;
            let currentHeading = 0;

            intervalId = setInterval(() => {
                setEta(prev => Math.max(0, prev - 1));
                setDistance(prev => {
                    const newDist = Math.max(0, parseFloat((prev - 0.1).toFixed(1)));
                    
                    // Update Step based on distance
                    const step = DEMO_STEPS.find(s => newDist > s.threshold) || DEMO_STEPS[DEMO_STEPS.length - 1];
                    setCurrentStep(step);
                    
                    return newDist;
                });
                
                // Move slightly
                const dLat = (Math.random() - 0.3) * 0.001; 
                const dLng = (Math.random() - 0.3) * 0.001;
                lat += dLat;
                lng += dLng;

                // Simple bearing simulation
                const angle = Math.atan2(dLng, dLat) * 180 / Math.PI;
                currentHeading = angle;
                setHeading(currentHeading);

                if (socket && user?.id) {
                    socket.emit('update_location', {
                        driverId: user.id,
                        lat,
                        lng,
                        status: destinationType === 'PICKUP' ? 'EN_ROUTE_PICKUP' : 'EN_ROUTE_DROPOFF'
                    });
                }
            }, 2000); // Faster updates for demo (2s)
        } else {
            // --- REAL MODE: GPS Tracking ---
            if ('geolocation' in navigator) {
                watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude, speed, heading: gpsHeading } = position.coords;
                        
                        const dist = calculateDistance(latitude, longitude, destLat, destLng);
                        setDistance(parseFloat(dist.toFixed(1)));
                        
                        const currentSpeedMph = speed ? (speed * 2.23694) : 30;
                        const timeHours = dist / Math.max(currentSpeedMph, 5); 
                        setEta(Math.ceil(timeHours * 60));

                        if (gpsHeading) setHeading(gpsHeading);

                        if (socket && user?.id) {
                            socket.emit('update_location', {
                                driverId: user.id,
                                lat: latitude,
                                lng: longitude,
                                status: destinationType === 'PICKUP' ? 'EN_ROUTE_PICKUP' : 'EN_ROUTE_DROPOFF'
                            });
                        }
                    },
                    (err) => console.error("GPS Error", err),
                    { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
                );
            }
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        };
    }, [socket, user, destinationType, isDemoMode]);

    const isNearDestination = distance < 0.2; // Increase threshold for easier triggering

    // --- NAVIGATION MODE UI ---
    if (isNavigating) {
        return (
            <Box sx={{ width: '100%', height: '100dvh', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'black', zIndex: 1300 }}>
                {/* 3D Map Background */}
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                    <DriverMap 
                        activeTrip={{ stops: [{ gpsLatitude: 33.4484, gpsLongitude: -112.0740 }] }} // Mock trigger for camera follow
                        destination={{ lat: 33.4804, lng: -112.0416 }}
                        showNavigation={true}
                        bearing={heading}
                        pitch={60}
                    />
                </Box>
                
                {/* Top Gradient for Legibility */}
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 160, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)', pointerEvents: 'none', zIndex: 1 }} />

                {/* Top Banner: Next Turn (Apple Maps Style) */}
                <Card sx={{ 
                    position: 'absolute', 
                    top: 'env(safe-area-inset-top, 20px)', 
                    left: 12, 
                    right: 12, 
                    bgcolor: '#2c2c2e', // Dark Gray
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
                    zIndex: 10,
                    overflow: 'visible'
                }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'flex-start', p: '16px !important', pb: '16px !important' }}>
                        <Box sx={{ mr: 2, mt: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 50 }}>
                            <currentStep.icon sx={{ fontSize: 56, color: '#fff' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.1, mb: 0.5 }}>
                                {currentStep.instruction}
                            </Typography>
                             <Typography variant="h6" sx={{ color: '#8e8e93', fontWeight: 600 }}>
                                {currentStep.distance}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* Bottom Drawer (Draggable & Expandable) */}
                <NavigationDrawer 
                    eta={eta} 
                    distance={distance} 
                    onEnd={() => setIsNavigating(false)} 
                    steps={DEMO_STEPS}
                />
            </Box>
        );
    }

    // --- STANDARD OVERVIEW UI ---
    return (
        <Box sx={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#000', p: 2 }}>

            {/* Trip Info Card */}
            <Card elevation={0} sx={{ 
                borderRadius: 4, 
                bgcolor: 'rgba(28, 28, 30, 0.9)', 
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white'
            }}>
                <CardContent sx={{ p: '16px !important', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="caption" fontWeight={700} color="#0a84ff" letterSpacing={1}>
                             EN ROUTE TO {destinationType}
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                            {destinationAddress.split(',')[0]}
                        </Typography>
                        <Typography variant="body2" color="#8e8e93" noWrap sx={{ maxWidth: 200 }}>
                            {destinationAddress.split(',').slice(1).join(',')}
                        </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h4" fontWeight={700} color="white">
                            {eta}<Typography component="span" variant="caption" sx={{ fontSize: 14 }}>min</Typography>
                        </Typography>
                        <Typography variant="caption" color="#8e8e93" fontWeight={600}>
                            {distance} mi
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Embedded Map Preview */}
            <Box sx={{ flex: 1, minHeight: 400, borderRadius: 4, overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
                 <DriverMap 
                    activeTrip={{ stops: [{ gpsLatitude: 33.4484, gpsLongitude: -112.0740 }] }} // Mock
                    destination={{ lat: 33.4804, lng: -112.0416 }}
                    showNavigation={false}
                />
                <Button
                    variant="contained"
                    startIcon={<Navigation />}
                    onClick={() => setIsNavigating(true)}
                    sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        borderRadius: 28,
                        px: 3,
                        py: 1.5,
                        fontWeight: 700,
                        boxShadow: '0 4px 14px rgba(0,122,255,0.4)',
                        zIndex: 5,
                        bgcolor: '#0a84ff'
                    }}
                >
                    Start Navigation
                </Button>
            </Box>

            {clientName && (
                <Card elevation={0} sx={{ 
                    borderRadius: 4, 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)', 
                    bgcolor: 'rgba(28, 28, 30, 0.9)', 
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <CardContent sx={{ p: '12px !important', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <PersonOutline sx={{ color: '#8e8e93' }} />
                        <Typography variant="subtitle2" fontWeight={600}>Member: {clientName}</Typography>
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
                bgcolor: '#000', // Match page bg
                borderTop: '1px solid rgba(255,255,255,0.1)',
                pt: 2,
                mx: -2,
                px: 2
            }}>
                <Button
                    variant="outlined"
                    sx={{ minWidth: 56, height: 56, borderRadius: '50%', color: '#ff453a', borderColor: 'rgba(255, 69, 58, 0.3)', bgcolor: 'rgba(255, 69, 58, 0.1)' }}
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
                        boxShadow: '0 4px 14px 0 rgba(0,0,0,0.4)',
                        bgcolor: isNearDestination ? '#30d158' : '#3a3a3c',
                        color: isNearDestination ? 'white' : 'rgba(255,255,255,0.3)',
                        '&:disabled': {
                            bgcolor: '#3a3a3c',
                            color: 'rgba(255,255,255,0.3)'
                        }
                    }}
                >
                    I've Arrived
                </Button>
            </Box>
        </Box>
    );
}
