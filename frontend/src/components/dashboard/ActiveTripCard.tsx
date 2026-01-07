import { Box, Button, Card, CardContent, IconButton, Typography, Chip, Divider } from '@mui/material';
import { CalendarMonthOutlined, ChatBubbleOutline, PersonOutline, NavigationOutlined, PhoneOutlined } from '@mui/icons-material'; // Outlined icons
import { format } from 'date-fns';

interface ActiveTripCardProps {
    trip: any;
    onViewDetails: (id: string) => void;
    onStartTrip: (id: string, odometer: number) => void;
    isNext?: boolean;
}

export default function ActiveTripCard({ trip, onViewDetails, onStartTrip, isNext = false, compact = false }: ActiveTripCardProps & { compact?: boolean }) {
    const isPickup = trip.stops.some((s: any) => s.stopType === 'PICKUP' && !s.actualDepartureTime);
    const nextStop = trip.stops.find((s: any) => !s.actualDepartureTime) || trip.stops[0];
    const scheduledTime = nextStop?.scheduledTime ? new Date(nextStop.scheduledTime) : new Date();

    // Compact Mode: Horizontal Layout
    if (compact) {
        return (
            <Card
                elevation={0}
                sx={{
                    borderRadius: 3,
                    mb: 1.5,
                    bgcolor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    border: '1px solid #f0f0f0'
                }}
            >
                <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2.5, '&:last-child': { pb: 2 } }}>
                    
                    {/* Left: Time & Badge */}
                    <Box sx={{ minWidth: 80, textAlign: 'center' }}>
                         <Typography variant="h5" fontWeight={800} sx={{ color: '#333', lineHeight: 1 }}>
                            {format(scheduledTime, 'h:mm')}
                        </Typography>
                        <Typography variant="caption" fontWeight={600} sx={{ color: '#888', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                            {format(scheduledTime, 'a')}
                        </Typography>
                        {isNext && (
                             <Chip label="NEXT" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem', mt: 0.5, width: '100%', borderRadius: 1 }} />
                        )}
                    </Box>

                    {/* Divider */}
                    <Box sx={{ width: 1, height: 45, bgcolor: '#eee' }} />

                    {/* Middle: Info */}
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ color: '#333', fontSize: '1.05rem', lineHeight: 1.3 }}>
                            {nextStop?.address.split(',')[0]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap display="block" sx={{ fontSize: '0.85rem' }}>
                           Trip #{trip.id.slice(-4)} • {trip.members.length > 1 ? 'Carpool' : 'Ride'} • Est 15m
                        </Typography>
                    </Box>

                    {/* Right: Action */}
                    <Box>
                        <Button
                            variant="contained"
                            onClick={() => onStartTrip(trip.id, 0)}
                            sx={{
                                minWidth: 80,
                                borderRadius: 8,
                                px: 2,
                                py: 0.8,
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                textTransform: 'none',
                                boxShadow: 'none',
                                bgcolor: '#e3f2fd',
                                color: 'primary.main',
                                '&:hover': { bgcolor: '#bbdefb' }
                            }}
                        >
                            Start
                        </Button>
                    </Box>

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

                {/* Start Trip Button */}
                <Button
                    fullWidth
                    variant="contained"
                    disableElevation
                    onClick={() => onStartTrip(trip.id, 0)}
                    sx={{
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
            </CardContent>
        </Card>
    );
}
