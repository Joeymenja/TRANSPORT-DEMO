import { Box, Button, Card, CardContent, IconButton, Typography, Chip, Divider, Stack, useTheme, useMediaQuery } from '@mui/material';
import { CalendarMonthOutlined, ChatBubbleOutline, PersonOutline, NavigationOutlined, PhoneOutlined } from '@mui/icons-material'; // Outlined icons
import { format } from 'date-fns';

    // ... imports

interface ActiveTripCardProps {
    trip: any;
    onViewDetails: (id: string) => void;
    onStartTrip?: (id: string, odometer: number) => void;
    onClaim?: (id: string) => void;
    isNext?: boolean;
    showActions?: boolean;
    compact?: boolean;
    theme?: 'light' | 'dark';
}

export default function ActiveTripCard({ trip, onViewDetails, onStartTrip, onClaim, isNext = false, compact = false, showActions = true, theme = 'light' }: ActiveTripCardProps) {
    const isPickup = trip.stops.some((s: any) => s.stopType === 'PICKUP' && !s.actualDepartureTime);
    const nextStop = trip.stops.find((s: any) => !s.actualDepartureTime) || trip.stops[0];
    const scheduledTime = nextStop?.scheduledTime ? new Date(nextStop.scheduledTime) : new Date();

    const isDark = theme === 'dark';
    const bg = isDark ? '#2C2C2E' : 'white';
    const textPrimary = isDark ? '#FFFFFF' : '#1c1c1e';
    const textSecondary = isDark ? '#AEAEB2' : '#8e8e93';
    const dividerColor = isDark ? 'rgba(255,255,255,0.1)' : '#f2f2f7';
    const border = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.04)';

    // ... hooks

    // Compact Mode: Horizontal Layout
    if (compact) {
        return (
            <Card
                elevation={0}
                onClick={() => onViewDetails(trip.id)}
                sx={{
                    borderRadius: 3,
                    mb: 1.5,
                    bgcolor: bg,
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f0f0f0',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: isDark ? '#3A3A3C' : '#fbfbfb' }
                }}
            >
                <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2.5, '&:last-child': { pb: 2 } }}>
                    
                    {/* Left: Time & Badge */}
                    <Box sx={{ minWidth: 80, textAlign: 'center' }}>
                         <Typography variant="h6" fontWeight={800} sx={{ color: textPrimary, lineHeight: 1, fontSize: '1.2rem' }}>
                            {format(scheduledTime, 'h:mm')}
                        </Typography>
                        <Typography variant="caption" fontWeight={700} sx={{ color: textSecondary, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                            {format(scheduledTime, 'a')}
                        </Typography>
                        {isNext && (
                             <Chip label="NEXT" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem', mt: 0.5, width: '100%', borderRadius: 1 }} />
                        )}
                    </Box>

                    {/* Divider */}
                    <Box sx={{ width: '1px', height: 45, bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#eee' }} />

                    {/* Middle: Info */}
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: textPrimary, fontSize: '0.9rem', lineHeight: 1.2, mb: 0.3 }}>
                            {nextStop?.address || 'No Address'}
                        </Typography>
                        <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap">
                            <Typography variant="caption" color="primary.main" fontWeight={800} sx={{ fontSize: '0.75rem' }}>
                                {trip.members?.[0]?.member?.firstName} {trip.members?.[0]?.member?.lastName}
                                {(!trip.members?.[0]?.member) && 'Unknown Member'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.75rem', opacity: 0.8 }} noWrap>
                                • #{trip.id.slice(-4)} • {trip.members.length > 1 ? 'Carpool' : 'Ride'}
                            </Typography>
                            {trip.createdAt && (new Date().getTime() - new Date(trip.createdAt).getTime()) < 60000 && (
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

                    {/* Right: Action */}
                     {/* ... same action logic ... */}
                </CardContent>
            </Card>
        );
    }

    // Default Full Card Mode (Refined Apple Style)
    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 4, 
                mb: 2,
                bgcolor: bg,
                boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)', 
                border: border,
                position: 'relative',
                overflow: 'visible'
            }}
        >
             {/* Badge Overlay */}
            {isNext && (
                <Chip
                    label="UP NEXT"
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: '#007AFF', // systemBlue
                        color: 'white',
                        fontWeight: 700,
                        borderRadius: 1,
                        fontSize: '0.65rem',
                        height: 20
                    }}
                />
            )}

            <CardContent sx={{ p: 2.5 }}> 

                {/* Main Time Display */}
                <Typography variant="h3" fontWeight={700} sx={{ color: textPrimary, mb: 0.5, letterSpacing: -1, fontSize: '2.5rem' }}>
                    {format(scheduledTime, 'h:mm')}
                    <Typography component="span" variant="h6" fontWeight={600} sx={{ color: textSecondary, ml: 0.5, letterSpacing: -0.5 }}>
                        {format(scheduledTime, 'a')}
                    </Typography>
                </Typography>

                <Typography variant="subtitle2" sx={{ color: textSecondary, mb: 3, fontWeight: 500 }}>
                     Scheduled for today
                </Typography>

                {/* Timeline Visual */}
                <Box sx={{ position: 'relative', pl: 1 }}>
                     {/* Vertical Line */}
                     <Box sx={{ position: 'absolute', left: 5, top: 10, bottom: 25, width: 2, bgcolor: isDark ? '#3A3A3C' : '#e5e5ea', zIndex: 0 }} />

                    {/* Pickup */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2.5, position: 'relative', zIndex: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#007AFF', mt: 0.8, boxShadow: isDark ? '0 0 0 2px #2C2C2E' : '0 0 0 2px white' }} />
                        <Box>
                            <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 600, letterSpacing: 0.5, display: 'block', mb: 0.2 }}>PICKUP</Typography>
                            <Typography variant="body1" fontWeight={600} sx={{ color: textPrimary, lineHeight: 1.2 }}>
                                {trip.stops.find((s: any) => s.stopType === 'PICKUP' || s.stopOrder === 1)?.address.split(',')[0] || 'Unknown Pickup'}
                            </Typography>
                             <Typography variant="body2" sx={{ color: textSecondary }} noWrap>
                                {trip.stops.find((s: any) => s.stopType === 'PICKUP' || s.stopOrder === 1)?.address.split(',').slice(1).join(', ') || ''}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Dropoff */}
                    <Box sx={{ display: 'flex', gap: 2, position: 'relative', zIndex: 1 }}>
                         <Box sx={{ width: 12, height: 12, borderRadius: 0, bgcolor: '#007AFF', mt: 0.8, boxShadow: isDark ? '0 0 0 2px #2C2C2E' : '0 0 0 2px white' }} />
                        <Box>
                            <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 600, letterSpacing: 0.5, display: 'block', mb: 0.2 }}>DROPOFF</Typography>
                             <Typography variant="body1" fontWeight={600} sx={{ color: textPrimary, lineHeight: 1.2 }}>
                                {trip.stops.find((s: any) => s.stopType === 'DROPOFF' || s.stopOrder === 2)?.address.split(',')[0] || 'Unknown Dropoff'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 2.5, borderColor: dividerColor }} />

                {/* Start Trip Button - Apple Style Blue Pill */}
                {/* ... button remains same ... */}
                {showActions && onStartTrip && (
                    <Button
                        fullWidth
                        variant="contained"
                        disableElevation
                        onClick={() => onStartTrip(trip.id, 0)}
                        sx={{
                            height: 52,
                            bgcolor: '#007AFF', // systemBlue
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '1.05rem',
                            borderRadius: 3,
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#0062cc' },
                            boxShadow: '0 4px 12px rgba(0,122,255,0.25)'
                        }}
                    >
                        Start Navigation
                    </Button>
                )}

                {/* ... claim button ... */}

            </CardContent>
        </Card>
    );
}
