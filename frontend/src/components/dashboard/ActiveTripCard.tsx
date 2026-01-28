import { Box, Button, Card, CardContent, IconButton, Typography, Chip, Divider, Stack, useTheme, useMediaQuery } from '@mui/material';
import { CalendarMonthOutlined, ChatBubbleOutline, PersonOutline, NavigationOutlined, PhoneOutlined } from '@mui/icons-material';
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
                    borderRadius: 2.5,
                    bgcolor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    border: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    '&:active': { bgcolor: '#f8fafc', transform: 'scale(0.99)' },
                    transition: 'all 0.15s ease',
                    overflow: 'hidden',
                }}
            >
                <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, '&:last-child': { pb: 2 } }}>

                    {/* Left: Time */}
                    <Box sx={{ minWidth: 64, textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight={800} sx={{ color: '#1e293b', lineHeight: 1, fontSize: '1.15rem' }}>
                            {format(scheduledTime, 'h:mm')}
                        </Typography>
                        <Typography variant="caption" fontWeight={700} sx={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                            {format(scheduledTime, 'a')}
                        </Typography>
                        {isNext && (
                            <Chip
                                label="NEXT"
                                size="small"
                                sx={{
                                    height: 18,
                                    fontSize: '0.55rem',
                                    mt: 0.5,
                                    width: '100%',
                                    borderRadius: 1,
                                    bgcolor: '#dbeafe',
                                    color: '#1e40af',
                                    fontWeight: 800,
                                }}
                            />
                        )}
                    </Box>

                    {/* Divider */}
                    <Box sx={{ width: '1px', height: 40, bgcolor: '#f1f5f9' }} />

                    {/* Middle: Info */}
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ color: '#1e293b', fontSize: '0.88rem', lineHeight: 1.2, mb: 0.3 }}>
                            {nextStop?.address?.split(',')[0] || 'No Address'}
                        </Typography>
                        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                            <Typography variant="caption" fontWeight={700} sx={{ color: '#0096D6', fontSize: '0.75rem' }}>
                                {trip.members?.[0]?.member?.firstName} {trip.members?.[0]?.member?.lastName}
                                {(!trip.members?.[0]?.member) && 'Unknown Member'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '0.7rem' }}>
                                #{trip.id.slice(-4)}
                            </Typography>
                            {trip.createdAt && (new Date().getTime() - new Date(trip.createdAt).getTime()) < 600000 && (
                                <Chip
                                    label="NEW"
                                    size="small"
                                    sx={{
                                        height: 16,
                                        fontSize: '0.55rem',
                                        fontWeight: 800,
                                        bgcolor: '#ef4444',
                                        color: 'white',
                                        borderRadius: 1
                                    }}
                                />
                            )}
                        </Stack>
                    </Box>

                    {/* Right: Action */}
                    {showActions && !isDesktop && (
                        <Button
                            variant="contained"
                            onClick={(e) => { e.stopPropagation(); onStartTrip(trip.id, 0); }}
                            sx={{
                                minWidth: 68,
                                borderRadius: 20,
                                px: 2,
                                py: 0.75,
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                textTransform: 'none',
                                boxShadow: 'none',
                                bgcolor: '#0096D6',
                                color: 'white',
                                '&:hover': { bgcolor: '#0077b5' },
                                '&:active': { transform: 'scale(0.95)' },
                                transition: 'all 0.1s ease',
                            }}
                        >
                            Start
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    }

    // Default Full Card Mode
    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 3,
                mb: 2,
                overflow: 'visible',
                bgcolor: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.04)'
            }}
        >
            <CardContent sx={{ p: 2.5 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    {isNext ? (
                        <Chip
                            label="NEXT TRIP"
                            size="small"
                            sx={{
                                bgcolor: '#dbeafe',
                                color: '#1e40af',
                                fontWeight: 700,
                                borderRadius: 1,
                                fontSize: '0.65rem',
                                height: 22
                            }}
                        />
                    ) : <Box />}
                </Box>

                {/* Time */}
                <Typography variant="h4" fontWeight={700} sx={{ color: '#1e293b', mb: 2, letterSpacing: -0.5 }}>
                    {format(scheduledTime, 'h:mm a')}
                </Typography>

                {/* Address */}
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 0.5 }}>
                        <NavigationOutlined sx={{ color: '#94a3b8', fontSize: 20, mt: 0.5 }} />
                        <Box>
                            <Typography variant="body1" fontWeight={600} sx={{ color: '#1e293b', fontSize: '1.05rem' }}>
                                {nextStop?.address.split(',')[0]}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                                {nextStop?.address.split(',').slice(1).join(', ')}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 2, borderColor: '#f1f5f9' }} />

                {/* Metadata */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.9rem' }}>
                        Trip #{trip.id.slice(-4)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#e2e8f0' }}>|</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.9rem' }}>
                        {trip.members.length > 1 ? 'Carpool' : 'Ride'}
                    </Typography>
                </Box>

                {/* Action Icons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, mb: 3 }}>
                    {[CalendarMonthOutlined, ChatBubbleOutline, PersonOutline, PhoneOutlined].map((Icon, i) => (
                        <IconButton key={i} size="medium" sx={{ color: '#94a3b8' }}>
                            <Icon />
                        </IconButton>
                    ))}
                </Box>

                {/* Start Trip Button */}
                {showActions && !isDesktop && (
                    <Button
                        fullWidth
                        variant="contained"
                        disableElevation
                        onClick={() => onStartTrip(trip.id, 0)}
                        sx={{
                            display: { xs: 'block', md: 'none' },
                            height: 50,
                            bgcolor: '#0096D6',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1rem',
                            borderRadius: 25,
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#0077b5' },
                            '&:active': { transform: 'scale(0.98)' },
                            transition: 'all 0.15s ease',
                        }}
                    >
                        Start Trip
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
