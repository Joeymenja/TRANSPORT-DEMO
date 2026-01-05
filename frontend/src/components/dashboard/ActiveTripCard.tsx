import { Box, Button, Card, CardContent, IconButton, Typography, Chip, Divider } from '@mui/material';
import { CalendarMonthOutlined, ChatBubbleOutline, PersonOutline, NavigationOutlined, PhoneOutlined, MoreHoriz } from '@mui/icons-material'; // Outlined icons
import { format } from 'date-fns';

interface ActiveTripCardProps {
    trip: any;
    onViewDetails: (id: string) => void;
    onStartTrip: (id: string, odometer: number) => void;
    isNext?: boolean;
}

export default function ActiveTripCard({ trip, onViewDetails, onStartTrip, isNext = false }: ActiveTripCardProps) {
    const isPickup = trip.stops.some((s: any) => s.stopType === 'PICKUP' && !s.actualDepartureTime);
    const nextStop = trip.stops.find((s: any) => !s.actualDepartureTime) || trip.stops[0];
    const scheduledTime = nextStop?.scheduledTime ? new Date(nextStop.scheduledTime) : new Date();

    return (
        <Card
            elevation={0} // Using custom shadow for "Floating" effect
            sx={{
                borderRadius: 3, // 12px (CARD-LIGHT-001)
                mb: 2,
                overflow: 'visible',
                bgcolor: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)', // Level 2 Shadow
                border: '1px solid rgba(0,0,0,0.02)' // Extremely subtle border
            }}
        >
            <CardContent sx={{ p: 2.5 }}> {/* CARD-LIGHT-001: 20px padding */}

                {/* Header: Badge & Time */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    {isNext ? (
                        <Chip
                            label="NEXT TRIP"
                            size="small"
                            sx={{
                                bgcolor: '#E3F2FD', // Light Brand Tint (CARD-LIGHT-004)
                                color: 'primary.main',
                                fontWeight: 700,
                                borderRadius: 1,
                                fontSize: '0.7rem',
                                height: 24
                            }}
                        />
                    ) : <Box />}

                    <Typography variant="h4" fontWeight={400} sx={{ color: '#ccc', fontSize: '1rem' }}>
                        {/* Placeholder for alignment if needed, or date */}
                    </Typography>
                </Box>

                {/* Main Time Display (CARD-LIGHT-003) */}
                <Typography variant="h4" fontWeight={700} sx={{ color: '#333', mb: 2, letterSpacing: -0.5 }}>
                    {format(scheduledTime, 'h:mm a')}
                </Typography>

                {/* Address Section (CARD-LIGHT-002) */}
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

                {/* Metadata Row (CARD-LIGHT-002) */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.95rem' }}>
                        Trip #{trip.id.slice(-4)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ddd' }}>•</Typography>
                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.95rem' }}>
                        Est. 15 min
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ddd' }}>•</Typography>
                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.95rem' }}>
                        {trip.members.length > 1 ? 'Carpool' : 'Ride'}
                    </Typography>
                </Box>

                {/* Action Icons Row (CARD-LIGHT-005) */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, mb: 3 }}>
                    {[CalendarMonthOutlined, ChatBubbleOutline, PersonOutline, PhoneOutlined].map((Icon, i) => (
                        <IconButton key={i} size="medium" sx={{ color: '#666' }}>
                            <Icon />
                        </IconButton>
                    ))}
                </Box>

                {/* Start Trip Button (CARD-LIGHT-006) */}
                <Button
                    fullWidth
                    variant="contained"
                    disableElevation // Flat design
                    onClick={() => onStartTrip(trip.id, 0)}
                    sx={{
                        height: 50,
                        bgcolor: 'primary.main', // Brand Color
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '1rem',
                        borderRadius: '25px', // Pill shape
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
