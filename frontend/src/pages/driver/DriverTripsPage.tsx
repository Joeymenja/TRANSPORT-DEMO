import { Box, Card, CardContent, Chip, Container, Typography, Skeleton, Stack } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '../../api/trips';
import { useAuthStore } from '../../store/auth';
import { format } from 'date-fns';
import { ChevronRight, Schedule, Person, DirectionsCarOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '../../components/layout/MobileHeader';

export default function DriverTripsPage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const today = new Date();

    const { data: trips = [], isLoading } = useQuery({
        queryKey: ['driver-trips', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const data = await tripApi.getDriverTrips(user.id);
            return Array.isArray(data) ? data : [];
        },
        enabled: !!user?.id,
    });

    if (isLoading) {
        return (
            <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
                <MobileHeader title="My Trips" backRoute="/driver" />
                <Container maxWidth="sm" sx={{ py: 2 }}>
                    <Stack spacing={1.5}>
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} variant="rounded" height={90} sx={{ borderRadius: 2.5 }} />
                        ))}
                    </Stack>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#fff', minHeight: '100vh', pb: 10 }}>
            <MobileHeader title="My Trips" backRoute="/driver" />

            <Container maxWidth="sm" sx={{ py: 2 }}>
                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2, fontWeight: 500 }}>
                    {format(today, 'EEEE, MMMM d')}
                </Typography>

                {trips.length === 0 ? (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                        <Box sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            bgcolor: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                        }}>
                            <DirectionsCarOutlined sx={{ fontSize: 32, color: '#94a3b8' }} />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#334155' }}>
                            No trips assigned
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
                            Check back later for new assignments
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={1.5}>
                        {trips.map((trip) => {
                            const statusConfig = {
                                'IN_PROGRESS': { bg: '#fef3c7', color: '#92400e', label: 'In Progress' },
                                'COMPLETED': { bg: '#dcfce7', color: '#166534', label: 'Completed' },
                                'SCHEDULED': { bg: '#dbeafe', color: '#1e40af', label: 'Scheduled' },
                                'CANCELLED': { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
                            }[trip.status] || { bg: '#f1f5f9', color: '#475569', label: (trip.status || '').replace('_', ' ') };

                            return (
                                <Card
                                    key={trip.id}
                                    elevation={0}
                                    onClick={() => navigate(`/driver/trips/${trip.id}`)}
                                    sx={{
                                        border: '1px solid #f0f0f0',
                                        borderRadius: 2.5,
                                        position: 'relative',
                                        bgcolor: 'white',
                                        cursor: 'pointer',
                                        '&:active': { bgcolor: '#f8fafc', transform: 'scale(0.99)' },
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <CardContent sx={{ pb: '14px !important', pr: 5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                            <Chip
                                                label={statusConfig.label}
                                                size="small"
                                                sx={{
                                                    fontWeight: 700,
                                                    fontSize: '0.65rem',
                                                    height: 22,
                                                    bgcolor: statusConfig.bg,
                                                    color: statusConfig.color,
                                                }}
                                            />
                                            <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '0.7rem' }}>
                                                #{(trip.id || '').slice(-4)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <Schedule fontSize="small" sx={{ color: '#94a3b8' }} />
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                {(trip.stops || [])[0]?.scheduledTime ? format(new Date(trip.stops[0].scheduledTime), 'h:mm a') : 'TBD'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Person fontSize="small" sx={{ color: '#94a3b8' }} />
                                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                {(trip.members || []).map((tm: any) => tm.member ? `${tm.member.firstName} ${tm.member.lastName}` : 'Unknown').join(', ')}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
                                            <ChevronRight sx={{ color: '#cbd5e1' }} />
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Stack>
                )}
            </Container>
        </Box>
    );
}
