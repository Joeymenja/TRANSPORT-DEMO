import { Box, Button, Card, CardContent, IconButton, Typography, Chip, Divider, Stack, useTheme, useMediaQuery } from '@mui/material';
import { CalendarMonthOutlined, ChatBubbleOutline, PersonOutline, NavigationOutlined, PhoneOutlined } from '@mui/icons-material'; // Outlined icons
import { format } from 'date-fns';

interface ActiveTripCardProps {
    trip: any;
    onViewDetails: (id: string) => void;
    onStartTrip: (id: string, odometer: number) => void;
    isNext?: boolean;
    showActions?: boolean;
}

export default function ActiveTripCard({ trip, onViewDetails, onStartTrip, isNext = false, compact = false, showActions = true }: ActiveTripCardProps & { compact?: boolean }) {
    const isPickup = trip.stops.some((s: any) => s.stopType === 'PICKUP' && !s.actualDepartureTime);
    const nextStop = trip.stops.find((s: any) => !s.actualDepartureTime) || trip.stops[0];
    const scheduledTime = nextStop?.scheduledTime ? new Date(nextStop.scheduledTime) : new Date();

    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

    // Compact Mode: Horizontal Layout
    if (compact) {
        return (
            <Card
                elevation={0}
                onClick={() => onViewDetails(trip.id)}
                sx={{
                    borderRadius: 3,
                    mb: 1.5,
                    bgcolor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    border: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#fbfbfb' }
                }}
            >
                <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2.5, '&:last-child': { pb: 2 } }}>
                    
                    {/* Left: Time & Badge */}
                    <Box sx={{ minWidth: 80, textAlign: 'center' }}>
                         <Typography variant="h6" fontWeight={800} sx={{ color: '#333', lineHeight: 1, fontSize: '1.2rem' }}>
                            {format(scheduledTime, 'h:mm')}
                        </Typography>
                        <Typography variant="caption" fontWeight={700} sx={{ color: '#666', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                            {format(scheduledTime, 'a')}
                        </Typography>
                        {isNext && (
                             <Chip label="NEXT" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem', mt: 0.5, width: '100%', borderRadius: 1 }} />
                        )}
                    </Box>

                    {/* Divider */}
                    <Box sx={{ width: '1px', height: 45, bgcolor: '#eee' }} />

                    {/* Middle: Info */}
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ color: '#333', fontSize: '0.9rem', lineHeight: 1.2, mb: 0.3 }}>
                            {nextStop?.address?.split(',')[0] || 'No Address'}
                        </Typography>
                        <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap">
                            <Typography variant="caption" color="primary.main" fontWeight={800} sx={{ fontSize: '0.75rem' }}>
                                {trip.members?.[0]?.member?.firstName} {trip.members?.[0]?.member?.lastName}
                                {(!trip.members?.[0]?.member) && 'Unknown Member'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                • #{trip.id.slice(-4)} • {trip.members.length > 1 ? 'Carpool' : 'Ride'}
                            </Typography>
                            {trip.createdAt && (new Date().getTime() - new Date(trip.createdAt).getTime()) < 600000 && (
                                <Chip 
                                    label="NEW" 
                                    size="small" 
                                    sx={{ 
                                        height: 18, 
                                        fontSize: '0.6rem', 
                                        fontWeight: 800, 
                                        bgcolor: '#FF5252', 
                                        color: 'white',
                                        borderRadius: 1 
                                    }} 
                                />
                            )}
                        </Stack>
                    </Box>

                    {/* Right: Action - ONLY Mobile + Driver */}
                    {showActions && !isDesktop && (
                        <Box>
                            <Button
                                variant="contained"
                                onClick={() => onStartTrip(trip.id, 0)}
                                sx={{
                                    minWidth: 80,
                                    borderRadius: 8,
                                    px: 2,
                                    py: 0.8,
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    boxShadow: 'none',
                                    bgcolor: '#f0f7ff',
                                    color: 'primary.main',
                                    '&:hover': { bgcolor: '#e0efff' }
                                }}
                            >
                                Start
                            </Button>
                        </Box>
                    )}

                </CardContent>
            </Card>
        );
    }

    // Default Full Card Mode
    return (
        <Card
            elevation={0} // Using custom shadow for "Floating" effect
            sx={{
                borderRadius: 3, // 12px (CARD-LIGHT-001)
                mb: 2,
                overflow: 'visible',
                bgcolor: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.02)' // Extremely subtle border
            }}
        >
            <CardContent sx={{ p: 2.5 }}> 

                {/* Header: Badge & Time */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    {isNext ? (
                        <Chip
                            label="NEXT TRIP"
                            size="small"
                            sx={{
                                bgcolor: '#E3F2FD', // Light Brand Tint
                                color: 'primary.main',
                                fontWeight: 700,
                                borderRadius: 1,
                                fontSize: '0.7rem',
                                height: 24
                            }}
                        />
                    ) : <Box />}
                </Box>

                {/* Main Time Display */}
                <Typography variant="h4" fontWeight={700} sx={{ color: '#333', mb: 2, letterSpacing: -0.5 }}>
                    {format(scheduledTime, 'h:mm a')}
                </Typography>

                {/* Address Section */}
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 0.5 }}>
                        <NavigationOutlined sx={{ color: '#666', fontSize: 20, mt: 0.5 }} />
                        <Box>
                            <Typography variant="body1" fontWeight={500} sx={{ color: '#333', fontSize: '1.1rem' }}>
                                {nextStop?.address.split(',')[0]}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#999' }}>
                                {nextStop?.address.split(',').slice(1).join(', ')}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 2, borderColor: '#f5f5f5' }} />

                {/* Metadata Row */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.95rem' }}>
                        Trip #{trip.id.slice(-4)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ddd' }}>•</Typography>
                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.95rem' }}>
                       {trip.members.length > 1 ? 'Carpool' : 'Ride'}
                    </Typography>
                </Box>

                {/* Action Icons Row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, mb: 3 }}>
                    {[CalendarMonthOutlined, ChatBubbleOutline, PersonOutline, PhoneOutlined].map((Icon, i) => (
                        <IconButton key={i} size="medium" sx={{ color: '#666' }}>
                            <Icon />
                        </IconButton>
                    ))}
                </Box>

                {/* Start Trip Button - ONLY Mobile + Driver */}
                {showActions && !isDesktop && (
                    <Button
                        fullWidth
                        variant="contained"
                        disableElevation
                        onClick={() => onStartTrip(trip.id, 0)}
                        sx={{
                            display: { xs: 'block', md: 'none' }, // HIDE ON DESKTOP
                            height: 50,
                            bgcolor: 'primary.main',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '1rem',
                            borderRadius: '25px',
                            textTransform: 'none',
                            '&:hover': { bgcolor: 'primary.dark' }
                        }}
                    >
                        Start Trip
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
