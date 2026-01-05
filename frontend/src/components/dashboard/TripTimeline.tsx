import { Box, Typography } from '@mui/material';
import { Circle, Place } from '@mui/icons-material';
import { format } from 'date-fns';

interface Props {
    trips: any[];
}

export default function TripTimeline({ trips }: Props) {
    if (!trips.length) return null;

    // Filter out completed trips or show them differently?
    // Let's show upcoming schedule.
    const sortedTrips = [...trips].sort((a, b) =>
        new Date(a.tripDate).getTime() - new Date(b.tripDate).getTime()
    );

    return (
        <Box sx={{ px: 2 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Today's Schedule
            </Typography>

            <Box sx={{ position: 'relative', pl: 1 }}>
                {/* Dashed Line */}
                <Box sx={{
                    position: 'absolute',
                    top: 10,
                    bottom: 10,
                    left: 7,
                    width: 2,
                    borderLeft: '2px dashed #e0e0e0',
                    zIndex: 0
                }} />

                {sortedTrips.map((trip) => (
                    <Box key={trip.id} sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {/* Timeline Dot */}
                            <Box sx={{ mt: 0.5 }}>
                                <Circle sx={{ fontSize: 16, color: 'primary.main', bgcolor: 'white', border: '4px solid white', borderRadius: '50%' }} />
                            </Box>

                            {/* Content */}
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                                    {format(new Date(trip.tripDate), 'h:mm a')}
                                </Typography>

                                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 3, border: '1px solid #f0f0f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="body2" fontWeight={700} sx={{ flex: 1 }}>
                                            Trip #{trip.id.slice(-4)}
                                        </Typography>
                                        <Typography variant="caption" sx={{ bgcolor: '#f5f5f5', px: 1, py: 0.5, borderRadius: 1 }}>
                                            {trip.status.replace('_', ' ')}
                                        </Typography>
                                    </Box>

                                    {(trip.stops || []).map((stop: any, sIdx: number) => (
                                        <Box key={sIdx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <Place sx={{ fontSize: 14, color: 'text.disabled' }} />
                                            <Typography variant="body2" noWrap sx={{ width: '80%' }}>
                                                {stop.address.split(',')[0]}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
