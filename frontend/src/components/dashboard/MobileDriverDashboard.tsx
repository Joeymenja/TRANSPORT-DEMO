import { Box, Button, IconButton, Typography, Paper, Switch, Grid, Avatar, Chip, Badge, Card, CardContent, CircularProgress, Menu, MenuItem, Fab, Dialog, DialogContent, Fade, Backdrop } from '@mui/material';
import { Notifications, DirectionsCar, Description, PlayArrow, AccessTime, Map, LocationOn, TrendingUp, Bolt, LocalCafe, AutoAwesome, ExpandMore, Mic, MicOff, GraphicEq, Settings } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '../../api/trips';
import { useAuthStore } from '../../store/auth';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAppMode } from '../../store/appMode';
import { GoogleGenAI } from "@google/genai";
import SecurementGuideDialog from './SecurementGuideDialog';
import { VerifiedUser, Policy } from '@mui/icons-material';
import { useSettingsStore } from '../../store/settings';

export default function MobileDriverDashboard() {
    const user = useAuthStore((state) => state.user);
    const today = format(new Date(), 'yyyy-MM-dd');
    const navigate = useNavigate();
    const { showNetworkCard } = useSettingsStore();
    const [isShiftActive, setIsShiftActive] = useState(true);

    // AI Features State
    const [cityPulse, setCityPulse] = useState<{ intel: string; risk: 'low' | 'med' | 'high'; impact: string } | null>(null);
    const [breakInsight, setBreakInsight] = useState<{ title: string; desc: string; type: string } | null>(null);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [securementOpen, setSecurementOpen] = useState(false);

    const { data: trips = [] } = useQuery({
        queryKey: ['trips', today],
        queryFn: () => tripApi.getTrips({ date: today }),
    });

    const activeTrip = trips.find(t => t.status === 'IN_PROGRESS');
    const nextTrip = trips.find(t => t.status === 'SCHEDULED');
    const upcomingTrips = trips.filter(t => t.status === 'SCHEDULED' && t.id !== nextTrip?.id);

    // Mock Stats
    const totalMileage = 142.5;
    const pendingLogs = 4;

    // Status Menu State
    const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(null);
    const statusOpen = Boolean(statusAnchorEl);
    const handleStatusClick = (event: any) => setStatusAnchorEl(event.currentTarget);
    const handleStatusClose = () => setStatusAnchorEl(null);

    const handleStatusChange = (newStatus: boolean) => {
        setIsShiftActive(newStatus);
        handleStatusClose();
    };

    useEffect(() => {
        const fetchAIInsights = async () => {
            setIsLoadingAI(true);
            
            // Artificial delay for realism
            await new Promise(r => setTimeout(r, 1500));

            if (process.env.API_KEY) {
                try {
                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    // Fetch City Pulse
                    const pulseResponse = await ai.models.generateContent({
                        model: 'gemini-2.0-flash',
                        contents: "Analyze Phoenix NEMT traffic/demand. JSON: {intel: string, risk: 'low'|'med'|'high', impact: string}",
                        config: { responseMimeType: "application/json" }
                    });
                    const pulseData = JSON.parse(pulseResponse.text() || '{}');
                    setCityPulse(pulseData);

                    // Fetch Break Insight if idle
                    if (!activeTrip) {
                        const breakResponse = await ai.models.generateContent({
                            model: 'gemini-2.0-flash',
                            contents: "Driver is idle in Phoenix. Suggest short wellness tip. JSON: {title: string, desc: string, type: 'wellness'}",
                            config: { responseMimeType: "application/json" }
                        });
                        setBreakInsight(JSON.parse(breakResponse.text() || '{}'));
                    }
                } catch (e) {
                    console.warn("AI Fetch Failed, using fallback", e);
                    // Fallback on error
                    setCityPulse({ intel: "High demand in Scottsdale area", risk: "med", impact: "Expect heavy traffic on Loop 101" });
                }
            } else {
                 // Fallback if no key
                 setCityPulse({ intel: "System Optimal. High demand expected near Downtown.", risk: "low", impact: "Traffic is flowing smoothly." });
                 if (!activeTrip) {
                     setBreakInsight({ title: "Stay Hydrated", desc: "Temperatures are rising. Ensure you have water before next pickup.", type: "wellness" });
                 }
            }
            setIsLoadingAI(false);
        };

        if (isShiftActive) {
            fetchAIInsights();
        } else {
            setCityPulse(null);
            setBreakInsight(null);
        }
    }, [isShiftActive, activeTrip]);

    return (
        <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', pb: 10 }}>
            {/* Header */}
            <Box sx={{ p: 3, pt: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white', borderBottom: '1px solid #eee' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }} onClick={() => navigate('/driver/profile')}>
                    <Avatar src={user?.profileImage} sx={{ width: 40, height: 40, bgcolor: 'primary.main', cursor: 'pointer' }}>
                        {user?.firstName?.[0]}
                    </Avatar>
                    <Box sx={{ cursor: 'pointer' }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                            {user?.firstName}'s Portal
                        </Typography>
                        <Typography variant="caption" color={isShiftActive ? 'success.main' : 'text.secondary'} fontWeight={600}>
                            {isShiftActive ? '● ONLINE' : '○ OFF DUTY'}
                        </Typography>
                    </Box>
                </Box>
                <Box>
                    <IconButton onClick={() => navigate('/driver/settings')}>
                        <Settings />
                    </IconButton>
                    <IconButton>
                        <Badge badgeContent={2} color="error" variant="dot">
                            <Notifications />
                        </Badge>
                    </IconButton>
                </Box>
            </Box>

            <Box sx={{ p: 2 }}>
                {/* AI City Pulse Card (Optional) */}
                {isShiftActive && showNetworkCard && (
                    <Paper 
                        sx={{ 
                            p: 2, 
                            mb: 2, 
                            borderRadius: 2, 
                            background: 'linear-gradient(135deg, #0f2e2a 0%, #042f2e 100%)', // Dark Teal/Slate gradient
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            border: '1px solid rgba(20, 184, 166, 0.3)' // Teal border
                        }}
                    >
                        <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}>
                            <AutoAwesome sx={{ fontSize: 100, color: '#14B8A6' }} />
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, position: 'relative', zIndex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AutoAwesome sx={{ color: '#14B8A6', fontSize: 20 }} />
                                <Typography variant="overline" color="#14B8A6" fontWeight={800} letterSpacing={1}>
                                    CITY PULSE
                                </Typography>
                            </Box>
                            {isLoadingAI && <CircularProgress size={16} sx={{ color: '#14B8A6' }} />}
                        </Box>

                        {cityPulse ? (
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, lineHeight: 1.3 }}>
                                    {cityPulse.intel}
                                </Typography>
                                <Chip 
                                    label={cityPulse.impact} 
                                    size="small" 
                                    sx={{ 
                                        bgcolor: 'rgba(20, 184, 166, 0.2)', 
                                        color: '#14B8A6', 
                                        fontWeight: 700, 
                                        fontSize: '0.65rem', 
                                        height: 22,
                                        border: '1px solid rgba(20, 184, 166, 0.2)'
                                    }} 
                                />
                            </Box>
                        ) : (
                            <Typography variant="caption" color="rgba(255,255,255,0.6)">Analyze demand...</Typography>
                        )}
                    </Paper>
                )}

                {/* Shift Status Card */}
                <Paper sx={{ p: 2, mb: 2, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <Box>
                        <Typography variant="overline" color="text.secondary" fontWeight={700}>CURRENT STATUS</Typography>
                        <Typography variant="h6" fontWeight={700} color={isShiftActive ? 'success.main' : 'text.disabled'}>
                             {isShiftActive ? '● Available for Trips' : '○ Off Duty'}
                        </Typography>
                    </Box>
                    <Box>
                        <Button 
                            variant="contained" 
                            color={isShiftActive ? "success" : "inherit"}
                            onClick={handleStatusClick}
                            endIcon={<ExpandMore />}
                            sx={{ fontWeight: 700, borderRadius: 4, textTransform: 'none' }}
                        >
                            {isShiftActive ? "Online" : "Offline"}
                        </Button>
                        <Menu
                            anchorEl={statusAnchorEl}
                            open={statusOpen}
                            onClose={handleStatusClose}
                            PaperProps={{
                                sx: { borderRadius: 2, minWidth: 140, mt: 1 }
                            }}
                        >
                            <MenuItem onClick={() => handleStatusChange(true)} sx={{ fontWeight: 600, color: 'success.main' }}>
                                <Badge badgeContent=" " color="success" variant="dot" sx={{ mr: 2 }} />
                                Go Online
                            </MenuItem>
                            <MenuItem onClick={() => handleStatusChange(false)} sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                <Badge badgeContent=" " color="error" variant="dot" sx={{ mr: 2 }} />
                                Go Offline
                            </MenuItem>
                        </Menu>
                    </Box>
                </Paper>

                {/* Stats Row */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                        <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>TOTAL MILEAGE</Typography>
                            <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>{totalMileage}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                                <Typography variant="caption" color="success.main" fontWeight={700}>+12.5%</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>
                        {breakInsight && !activeTrip ? (
                            <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', bgcolor: '#fffbed', border: '1px solid #fef3c7' }}>
                                <Typography variant="caption" color="#d97706" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <LocalCafe sx={{ fontSize: 14 }} /> WELLNESS
                                </Typography>
                                <Typography variant="subtitle2" fontWeight={800} sx={{ mt: 1, lineHeight: 1.2 }}>
                                    {breakInsight.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.2 }}>
                                    {breakInsight.desc}
                                </Typography>
                            </Paper>
                        ) : (
                            <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>PENDING LOGS</Typography>
                                <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>{pendingLogs}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                    <Typography variant="caption" color="warning.main" fontWeight={700}>● Requires Action</Typography>
                                </Box>
                            </Paper>
                        )}
                    </Grid>
                </Grid>

                {/* Driver Tools */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="overline" color="text.secondary" fontWeight={700}>DRIVER TOOLS</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                             <Box 
                                sx={{ 
                                    p: 2, 
                                    borderRadius: 4, 
                                    bgcolor: '#fff',
                                    border: '1px solid #f1f5f9',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                    cursor: 'pointer',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onClick={() => setSecurementOpen(true)}
                             >
                                <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 4, bgcolor: '#14B8A6' }} />
                                <Box sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(20, 184, 166, 0.1)', borderRadius: 2, color: '#14B8A6' }}>
                                    <VerifiedUser />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={800} lineHeight={1.2}>Securement Guide</Typography>
                                    <Typography variant="caption" color="text.secondary" fontWeight={500} lineHeight={1.1}>Equipment Check</Typography>
                                </Box>
                             </Box>
                        </Grid>
                        <Grid item xs={6}>
                             <Box 
                                sx={{ 
                                    p: 2, 
                                    borderRadius: 4, 
                                    bgcolor: '#fff',
                                    border: '1px solid #f1f5f9',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                    cursor: 'pointer',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onClick={() => navigate('/driver/vehicle')}
                             >
                                <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 4, bgcolor: '#F59E0B' }} />
                                <Box sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#FFFBEB', borderRadius: 2, color: '#F59E0B' }}>
                                    <DirectionsCar />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={800} lineHeight={1.2}>Vehicle Health</Typography>
                                    <Typography variant="caption" color="text.secondary" fontWeight={500} lineHeight={1.1}>Status: ACTIVE</Typography>
                                </Box>
                             </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Next Immediate Ride */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                     <Typography variant="subtitle1" fontWeight={800}>Next Immediate Ride</Typography>
                </Box>

                {(activeTrip || nextTrip) ? (
                    <TripCard 
                        trip={activeTrip || nextTrip} 
                        isNext={true} 
                        onStart={() => navigate(`/driver/trips/${(activeTrip || nextTrip)?.id}/execute`)}
                        onView={() => navigate(`/driver/trips/${(activeTrip || nextTrip)?.id}`)}
                    />
                ) : (
                    <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, bgcolor: '#fff', border: '1px dashed #ddd', mb: 3 }}>
                        <DirectionsCar sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                        <Typography color="text.secondary">No immediate rides scheduled.</Typography>
                    </Paper>
                )}


                {/* Upcoming Trips List */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 1 }}>
                     <Typography variant="subtitle1" fontWeight={800}>Upcoming Trips</Typography>
                     <Button size="small" sx={{ fontWeight: 700, textTransform: 'none' }}>View Schedule</Button>
                </Box>

                {upcomingTrips.map(trip => (
                    <TripCard 
                        key={trip.id} 
                        trip={trip} 
                        onView={() => navigate(`/driver/trips/${trip.id}`)}
                    />
                ))}

                {/* Voice Assistant FAB */}
                <Fab 
                    color={isListening ? "error" : "primary"} 
                    aria-label="voice-assist" 
                    sx={{ 
                        position: 'fixed', 
                        bottom: 24, 
                        right: 24, 
                        boxShadow: '0 4px 20px rgba(20, 184, 166, 0.4)',
                        zIndex: 100
                    }}
                    onClick={() => setIsListening(!isListening)}
                >
                    {isListening ? <GraphicEq /> : <Mic />}
                </Fab>

                {/* Voice Listening Overlay */}
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, flexDirection: 'column', backdropFilter: 'blur(4px)' }}
                    open={isListening}
                    onClick={() => setIsListening(false)}
                >
                    <Box sx={{ 
                        p: 4, 
                        borderRadius: '50%', 
                        bgcolor: 'rgba(20, 184, 166, 0.2)', 
                        mb: 4, 
                        border: '2px solid #14B8A6',
                        animation: 'pulse 1.5s infinite',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '@keyframes pulse': {
                            '0%': { boxShadow: '0 0 0 0 rgba(20, 184, 166, 0.4)' },
                            '70%': { boxShadow: '0 0 0 20px rgba(20, 184, 166, 0)' },
                            '100%': { boxShadow: '0 0 0 0 rgba(20, 184, 166, 0)' }
                        }
                    }}>
                        <GraphicEq sx={{ fontSize: 60, color: '#14B8A6' }} />
                    </Box>
                    <Typography variant="h5" fontWeight={700}>Listening...</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>Try saying "Navigate to next stop"</Typography>
                </Backdrop>

                <SecurementGuideDialog open={securementOpen} onClose={() => setSecurementOpen(false)} clientName={activeTrip?.pickupName || "Member"} />
            </Box>
        </Box>
    );
}

function TripCard({ trip, isNext, onStart, onView }: { trip: any; isNext?: boolean; onStart?: () => void; onView?: () => void }) {
    return (
        <Paper sx={{ 
            p: 2, 
            mb: 2, 
            borderRadius: 1, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid #f0f0f0',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <Grid container spacing={2}>
                <Grid item xs={8}>
                    <Chip 
                        label={trip.status === 'SCHEDULED' ? 'SCHEDULED' : 'IN PROGRESS'} 
                        size="small" 
                        sx={{ 
                            bgcolor: trip.status === 'SCHEDULED' ? '#E0F7FA' : '#E8F5E9', 
                            color: trip.status === 'SCHEDULED' ? '#006064' : '#1B5E20',
                            fontWeight: 700,
                            borderRadius: 1,
                            fontSize: '0.65rem',
                            height: 20,
                            mb: 1
                        }} 
                    />
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 600 }}>
                        {format(new Date(trip.tripDate), 'h:mm a')} • Trip_ID: {trip.id.slice(0, 8)}
                    </Typography>
                     
                    {/* Member Info */}
                    {trip.members?.[0]?.member && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                             <Typography variant="body2" fontWeight={700}>
                                 {trip.members[0].member.firstName} {trip.members[0].member.lastName}
                             </Typography>
                        </Box>
                    )}

                    {!isNext && (
                         <Button 
                            variant="outlined" 
                            size="small" 
                            sx={{ mt: 2, borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: '#eee', color: 'text.primary' }}
                            onClick={onView}
                        >
                            View Details
                        </Button>
                    )}
                </Grid>
                
                {/* Mini Map Placeholder */}
                <Grid item xs={4}>
                    <Box sx={{ 
                        width: '100%', 
                        height: '100%', 
                        minHeight: 80,
                        bgcolor: '#EEF0F2', 
                        borderRadius: 2,
                        backgroundImage: 'url("https://maps.googleapis.com/maps/api/staticmap?center=Phoenix,AZ&zoom=12&size=200x200&sensor=false&key=YOUR_API_KEY")', // Mock
                        backgroundSize: 'cover',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <LocationOn color="error" />
                    </Box>
                </Grid>
            </Grid>

            {isNext && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 1 }}>
                    <Button 
                        fullWidth 
                        variant="contained" 
                        color="inherit" // Will custom style 
                        onClick={onStart}
                        startIcon={<PlayArrow />}
                        sx={{ 
                            bgcolor: '#14B8A6', // Teal
                            color: 'white',
                            fontWeight: 700,
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)',
                            '&:hover': { bgcolor: '#0D9488' }
                        }}
                    >
                        Start Trip
                    </Button>
                     <IconButton 
                        onClick={onView}
                        sx={{ 
                            border: '1px solid #eee', 
                            borderRadius: 2 
                        }}
                    >
                        <Description color="action" />
                    </IconButton>
                </Box>
            )}
        </Paper>
    );
}
