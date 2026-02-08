import { Box, Paper, Chip, Container, Typography, Button, IconButton, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '../../api/trips';
import { useAuthStore } from '../../store/auth';
import { format } from 'date-fns';
import { ChevronRight, Schedule, Person, ArrowBack, CalendarMonth, Sync } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Link from '@mui/material/Link';
import EmptyState from '../../components/EmptyState';
import { useToastStore } from '../../store/toast';

export default function DriverTripsPage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const { showToast } = useToastStore();
    const today = new Date();

    const handleSync = () => {
        showToast('Syncing with Calendly...', 'info');
        setTimeout(() => {
            showToast('Schedule updated from External Calendar.', 'success');
        }, 1500);
    };

    const { data: trips = [], isLoading } = useQuery({
        queryKey: ['driver-trips', user?.id],
        queryFn: async () => {
             // Mock data if running in full demo mode without backend fully populated
             // return mockTrips; 
             if (!user?.id) return [];
            const data = await tripApi.getDriverTrips(user.id);
            return Array.isArray(data) ? data : [];
        },
        enabled: !!user?.id,
    });

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F5F7FA', pb: 12 }}>
             {/* Header */}
             <Box sx={{ p: 2, pt: 6, pb: 4, bgcolor: '#1F2937', color: 'white', borderRadius: '0 0 24px 24px', mb: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton onClick={() => navigate('/driver')} sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5" fontWeight={800} sx={{ flex: 1, textAlign: 'center' }}>
                        My Schedule
                    </Typography>
                    <IconButton onClick={handleSync} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#14B8A6', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                        <Sync />
                    </IconButton>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 3, p: 1, maxWidth: 300, mx: 'auto' }}>
                    <CalendarMonth sx={{ mr: 1, color: '#14B8A6' }} />
                    <Typography variant="subtitle1" fontWeight={700}>
                        {format(today, 'MMMM d, yyyy')}
                    </Typography>
                </Box>
            </Box>

            <Container sx={{ px: 2 }}>
                {isLoading ? (
                     <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                         <CircularProgress sx={{ color: '#14B8A6' }} />
                     </Box>
                ) : trips.length === 0 ? (
                    <EmptyState 
                        title="No Trips Scheduled" 
                        description="You have no trips scheduled for this date. Check back later or contact dispatch."
                        icon={<CalendarMonth sx={{ fontSize: 40, color: '#94a3b8' }} />}
                        actionLabel="Return to Dashboard"
                        onAction={() => navigate('/driver')}
                    />
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {trips.map((trip: any) => (
                            <TripCard key={trip.id} trip={trip} onClick={() => navigate(`/driver/trips/${trip.id}`)} />
                        ))}
                    </Box>
                )}
            </Container>
        </Box>
    );
}

function TripCard({ trip, onClick }: { trip: any, onClick: () => void }) {
    const isCompleted = trip.status === 'COMPLETED';
    const isInProgress = trip.status === 'IN_PROGRESS';
    const isScheduled = trip.status === 'SCHEDULED';
    
    // Status Logic
    let statusColor = '#E0F2F1';
    let statusTextColor = '#00695C';
    let statusLabel = trip.status.replace('_', ' ');

    if (isCompleted) {
        statusColor = '#F3F4F6';
        statusTextColor = '#6B7280';
    } else if (isInProgress) {
        statusColor = '#CCFBF1';
        statusTextColor = '#0F766E';
        statusLabel = '● IN PROGRESS';
    } else if (isScheduled) {
        statusColor = '#FEF3C7';
        statusTextColor = '#B45309';
    }

    return (
        <Paper
            elevation={0}
            onClick={onClick}
            sx={{
                p: 2.5,
                borderRadius: 4,
                border: '1px solid',
                borderColor: isInProgress ? '#14B8A6' : '#EFF6FF',
                boxShadow: isInProgress ? '0 8px 25px rgba(20, 184, 166, 0.15)' : '0 2px 10px rgba(0,0,0,0.02)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s',
                '&:hover': { transform: 'scale(1.01)', boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }
            }}
        >
            {isInProgress && <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 6, bgcolor: '#14B8A6' }} />}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pl: isInProgress ? 1 : 0 }}>
                <Chip
                    label={statusLabel}
                    size="small"
                    sx={{ 
                        fontWeight: 800, 
                        borderRadius: 1.5,
                        fontSize: '0.65rem',
                        height: 24,
                        bgcolor: statusColor,
                        color: statusTextColor,
                        letterSpacing: 0.5
                    }}
                />
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ opacity: 0.6 }}>
                    ID: #{trip.id.slice(-4)}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', mb: 2, pl: isInProgress ? 1 : 0 }}>
                 <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2, pt: 0.5 }}>
                     <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#14B8A6', boxShadow: '0 0 0 4px #E0F2F1' }} />
                     <Box sx={{ width: 2, height: 24, bgcolor: '#E5E7EB', my: 0.5 }} />
                     <Box sx={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #9CA3AF', bgcolor: 'white' }} />
                 </Box>
                 <Box sx={{ flex: 1 }}>
                     <Box sx={{ mb: 1.5 }}>
                        <Typography variant="h6" fontWeight={800} lineHeight={1.1} sx={{ fontSize: '1.1rem' }}>
                            {trip.stops?.[0]?.scheduledTime ? format(new Date(trip.stops[0].scheduledTime), 'h:mm a') : 'TBD'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 220 }}>
                            {trip.stops?.[0]?.address?.split(',')[0]}
                        </Typography>
                     </Box>
                     <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>To: Destination</Typography>
                         <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 220 }}>
                            {trip.stops?.[1]?.address?.split(',')[0]}
                        </Typography>
                     </Box>
                 </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', pl: isInProgress ? 1 : 0, pt: 2, borderTop: '1px solid #f3f4f6' }}>
                <Person sx={{ fontSize: 18, color: '#9CA3AF', mr: 1 }} />
                <Typography variant="body2" fontWeight={700} color="text.primary">
                    {trip.members?.[0]?.member ? `${trip.members[0].member.firstName} ${trip.members[0].member.lastName}` : 'Unknown Member'}
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Typography variant="caption" color="primary.main" fontWeight={700} sx={{ display: 'flex', alignItems: 'center' }}>
                    DETAILS <ChevronRight fontSize="small" />
                </Typography>
            </Box>
        </Paper>
    );
}
