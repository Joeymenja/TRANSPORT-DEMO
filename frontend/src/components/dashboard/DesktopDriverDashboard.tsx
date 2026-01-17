import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Paper, 
    Typography, 
    IconButton, 
    Grid, 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Chip,
    Avatar,
    Menu,
    MenuItem,
    Alert,
    CircularProgress,
    Autocomplete,
    TextField,
    LinearProgress,
    Stack,
    Divider,
    Tooltip,
    Snackbar,
    Alert as MuiAlert
} from '@mui/material';
import { 
    ChevronLeft, 
    ChevronRight, 
    EventBusy, 
    PersonOff, 
    Cancel,
    CheckCircle,
    AccessTime,
    CalendarMonth,
    Add,
    DirectionsCar,
    Description,
    Edit,
    Notifications,
    VerifiedUser,
    Description as ReportIcon,
    Download,
    Visibility,
    History as BackfillIcon
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfDay, getHours } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripApi } from '../../api/trips';
import { memberApi } from '../../api/members';
import { useAuthStore } from '../../store/auth';

export default function DesktopDriverDashboard() {
    const navigate = useNavigate();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date()); // Selection state
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open to see today's agenda
    const queryClient = useQueryClient();
    const user = useAuthStore(state => state.user);

    // Dialog States
    const [selectedTrip, setSelectedTrip] = useState<any>(null);
    const [isDischargeOpen, setIsDischargeOpen] = useState(false);
    const [cancelNotes, setCancelNotes] = useState('');
    
    // Snackbar State
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    
    // Live Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Calendar Generation
    // ... existing ...
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Fetch Trips for Month View
    const { data: trips = [], isLoading } = useQuery({
        queryKey: ['trips-calendar', format(monthStart, 'yyyy-MM')],
        queryFn: () => tripApi.getTrips({ 
            startDate: format(startDate, 'yyyy-MM-dd'), 
            endDate: format(endDate, 'yyyy-MM-dd') 
        })
    });

    // Single Trip Cancel
    const cancelTripMutation = useMutation({
        mutationFn: (tripId: string) => {
            // Determine a basic enum reason based on notes if possible, or default to OTHER
            let reason = 'OTHER';
            const lowerNotes = cancelNotes.toLowerCase();
            if (lowerNotes.includes('refused') || lowerNotes.includes('member cancelled')) {
                reason = 'MEMBER_CANCELLED';
            } else if (lowerNotes.includes('no show')) {
                reason = 'NO_SHOW';
            }
            
            return tripApi.cancelTrip(tripId, reason, cancelNotes || 'Cancelled via Dashboard');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trips-calendar'] });
            setSelectedTrip(null);
            setCancelNotes('');
            setSnackbarMessage('Trip Cancelled Successfully');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        },
        onError: (err: any) => {
            const msg = err.response?.data?.message || err.message || 'Failed to cancel trip';
            setSnackbarMessage(msg);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    });

    // Filter trips for the selected date (Side Panel)
    const selectedDateTrips = trips.filter((t: any) => isSameDay(new Date(t.stops[0]?.scheduledTime || t.tripDate), selectedDate));
    
    // Stats for Top Card
    const todaysTrips = trips.filter((t: any) => isSameDay(new Date(t.stops[0]?.scheduledTime || t.tripDate), new Date()));
    const completedToday = todaysTrips.filter((t: any) => t.status === 'COMPLETED').length;
    const progress = todaysTrips.length > 0 ? (completedToday / todaysTrips.length) * 100 : 0;

    return (
        <Box sx={{ p: 4, height: '100vh', overflow: 'hidden', display: 'flex', gap: 4, bgcolor: '#f8fafc' }}>
            
            {/* Left Sidebar: Clock & Agenda */}
            <Paper 
                elevation={3}
                sx={{ 
                    width: 400, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    borderRadius: 4, 
                    overflow: 'hidden', 
                    flexShrink: 0 
                }}
            >
                {/* Sidebar Header: Clock & User Info */}
                <Box sx={{ 
                    p: 3.5, 
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}>
                    <Typography variant="overline" color="rgba(255,255,255,0.6)" letterSpacing={2} fontWeight={700}>
                        {user?.firstName?.toUpperCase()} {user?.lastName?.toUpperCase()}
                    </Typography>
                    <Typography variant="h2" fontWeight={900} sx={{ mt: 1, letterSpacing: -1 }}>
                        {format(currentTime, 'h:mm')} <span style={{ fontSize: '0.4em', fontWeight: 400, opacity: 0.8 }}>{format(currentTime, 'a')}</span>
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={500} color="rgba(255,255,255,0.8)">
                        {format(currentTime, 'EEEE, MMMM do')}
                    </Typography>
                </Box>



                <Box sx={{ flex: 1, overflowY: 'auto', p: 2, '&::-webkit-scrollbar': { width: 4 } }}>
                    {selectedDateTrips.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8, opacity: 0.5 }}>
                            <EventBusy sx={{ fontSize: 48, mb: 1, color: '#94a3b8' }} />
                            <Typography variant="body2" fontWeight={600}>No trips scheduled</Typography>
                            <Button 
                                variant="text" 
                                size="small" 
                                startIcon={<Add />} 
                                sx={{ mt: 1 }}
                                onClick={() => {
                                    const path = isBefore(startOfDay(selectedDate), startOfDay(new Date())) 
                                        ? `/driver/backfill?date=${format(selectedDate, 'yyyy-MM-dd')}`
                                        : `/driver/schedule-new?date=${format(selectedDate, 'yyyy-MM-dd')}`;
                                    navigate(path);
                                }}
                            >
                                {isBefore(startOfDay(selectedDate), startOfDay(new Date())) ? 'Log Past Trip' : 'Add Trip'}
                            </Button>
                        </Box>
                    ) : (
                        <Stack spacing={2}>
                            {selectedDateTrips
                                .sort((a: any, b: any) => new Date(a.stops[0]?.scheduledTime).getTime() - new Date(b.stops[0]?.scheduledTime).getTime())
                                .map((trip: any) => {
                                    const tripTime = new Date(trip.stops[0]?.scheduledTime);
                                    const isDone = trip.status === 'COMPLETED';
                                    return (
                                        <Paper 
                                            key={trip.id} 
                                            elevation={0}
                                            onClick={() => setSelectedTrip(trip)}
                                            sx={{ 
                                                p: 2, 
                                                border: '1px solid #e2e8f0', 
                                                borderRadius: 3, 
                                                bgcolor: isDone ? '#f1f5f9' : 'white',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderColor: '#cbd5e1' },
                                                opacity: isDone ? 0.7 : 1
                                            }}
                                        >
                                            <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Typography variant="h5" fontWeight={800} color="#1e293b" sx={{ lineHeight: 1 }}>
                                                    {format(tripTime, 'h:mm')} <span style={{ fontSize: '0.6em', color: '#64748b' }}>{format(tripTime, 'a')}</span>
                                                </Typography>
                                                <Stack direction="row" spacing={0.5}>
                                                    <Chip 
                                                        label={`#${trip.id.slice(-4)}`}
                                                        size="small" 
                                                        variant="outlined"
                                                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, borderColor: '#e2e8f0', color: '#64748b' }}
                                                    />
                                                    <Chip 
                                                        label={trip.tripType === 'ROUND_TRIP' ? 'Round Trip' : 'One Way'} 
                                                        size="small" 
                                                        sx={{ 
                                                            height: 20, 
                                                            fontSize: '0.65rem', 
                                                            fontWeight: 700,
                                                            bgcolor: trip.tripType === 'ROUND_TRIP' ? '#f0abfc' : '#bfdbfe',
                                                            color: trip.tripType === 'ROUND_TRIP' ? '#86198f' : '#1e40af'
                                                        }} 
                                                    />
                                                    <Chip 
                                                        label={`${trip.stops?.length || 0} Stops`} 
                                                        size="small" 
                                                        sx={{ 
                                                            height: 20, 
                                                            fontSize: '0.65rem', 
                                                            fontWeight: 700,
                                                            bgcolor: '#e0f2fe',
                                                            color: '#0369a1' 
                                                        }} 
                                                    />
                                                </Stack>
                                            </Box>
                                            
                                            <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                                                <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem', bgcolor: isDone ? '#cbd5e1' : '#0f172a' }}>
                                                    {trip.members[0]?.member?.firstName[0]}
                                                </Avatar>
                                                <Typography variant="body1" fontWeight={700}>
                                                    {trip.members[0]?.member?.firstName} {trip.members[0]?.member?.lastName}
                                                </Typography>
                                            </Stack>

                                            <Box sx={{ bgcolor: '#f8fafc', p: 1, borderRadius: 2, mb: isDone ? 1.5 : 0 }}>
                                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>ROUTE</Typography>
                                                <Stack spacing={0.5}>
                                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                                                        <Typography variant="caption" noWrap fontWeight={600}>{trip.stops[0]?.address?.split(',')[0]}</Typography>
                                                    </Box>
                                                    <Box sx={{ width: '1px', height: 8, borderLeft: '1px dashed #cbd5e1', ml: 0.5 }} />
                                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main', flexShrink: 0 }} />
                                                        <Typography variant="caption" noWrap fontWeight={600}>{trip.stops[1]?.address?.split(',')[0]}</Typography>
                                                    </Box>
                                                </Stack>
                                            </Box>

                                            {isDone && (
                                                <Button 
                                                    fullWidth 
                                                    variant="outlined" 
                                                    size="small" 
                                                    startIcon={<ReportIcon />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        tripApi.downloadReport(trip.id);
                                                    }}
                                                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0' }}
                                                >
                                                    Download PDF
                                                </Button>
                                            )}
                                        </Paper>
                                    );
                                })}
                        </Stack>
                    )}
                </Box>

                <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
                     <Button 
                        variant="contained" 
                        fullWidth 
                        size="large"
                        startIcon={isBefore(startOfDay(selectedDate), startOfDay(new Date())) ? <BackfillIcon /> : <Add />}
                        onClick={() => {
                            const path = isBefore(startOfDay(selectedDate), startOfDay(new Date())) 
                                ? `/driver/backfill?date=${format(selectedDate, 'yyyy-MM-dd')}`
                                : `/driver/schedule-new?date=${format(selectedDate, 'yyyy-MM-dd')}`;
                            navigate(path);
                        }}
                        sx={{ 
                            py: 1.5, 
                            borderRadius: 3, 
                            bgcolor: isBefore(startOfDay(selectedDate), startOfDay(new Date())) ? '#0ea5e9' : '#0f172a', 
                            fontWeight: 700,
                            textTransform: 'none',
                            mb: 1,
                            '&:hover': {
                                bgcolor: isBefore(startOfDay(selectedDate), startOfDay(new Date())) ? '#0284c7' : '#1e293b'
                            }
                        }}
                    >
                        {isBefore(startOfDay(selectedDate), startOfDay(new Date())) ? 'Log Past Service' : `Schedule for ${format(selectedDate, 'MMM d')}`}
                    </Button>
                     <Button 
                        color="error"
                        fullWidth
                        size="small"
                        onClick={() => setIsDischargeOpen(true)}
                    >
                        Discharge Member
                    </Button>
                </Box>
            </Paper>

            {/* Right Main Content: Calendar */}
            <Paper sx={{ flex: 1, p: 2, borderRadius: 4, display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0' }}>
                 {/* Calendar Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" fontWeight={800} color="#1e293b">
                        {format(currentMonth, 'MMMM yyyy')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Button 
                            variant="contained" 
                            startIcon={<BackfillIcon />}
                            onClick={() => navigate('/driver/backfill')}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#0f172a' }}
                        >
                            Log Past Trip
                        </Button>
                        <Button 
                            variant="outlined" 
                            color="error"
                            onClick={() => setIsDischargeOpen(true)}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                        >
                            Discharge Member
                        </Button>
                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                        <IconButton onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft /></IconButton>
                        <Button 
                            variant="outlined" 
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }} 
                            onClick={() => { 
                                setCurrentMonth(new Date()); 
                                setSelectedDate(new Date()); 
                            }}
                        >
                            Today
                        </Button>
                        <IconButton onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight /></IconButton>
                    </Box>
                </Box>

                {/* Calendar Grid */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Grid container sx={{ mb: 2, borderBottom: '1px solid #f1f5f9', pb: 1 }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <Grid item xs={12/7} key={day} sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 1.5, fontSize: '0.7rem' }}>
                                    {day.toUpperCase()}
                                </Typography>
                            </Grid>
                        ))}
                    </Grid>
                    <Grid container sx={{ flex: 1 }}>
                        {calendarDays.map((day, index) => {
                            const dayTrips = trips.filter((t: any) => isSameDay(new Date(t.stops[0]?.scheduledTime || t.tripDate), day));
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isSelected = isSameDay(day, selectedDate);
                            const isToday = isSameDay(day, new Date());

                            return (
                                <Grid 
                                    item 
                                    xs={12/7} 
                                    key={day.toISOString()} 
                                    onClick={() => setSelectedDate(day)}
                                    sx={{ 
                                        borderTop: '1px solid #f1f5f9', 
                                        borderRight: (index + 1) % 7 === 0 ? 'none' : '1px solid #f1f5f9',
                                        bgcolor: isSelected ? '#eff6ff' : (isCurrentMonth ? 'white' : '#f8fafc'),
                                        cursor: 'pointer',
                                        p: 1.5,
                                        height: '100%',
                                        minHeight: 100,
                                        position: 'relative',
                                        '&:hover': { bgcolor: isSelected ? '#dbeafe' : '#f1f5f9' },
                                        transition: 'all 0.1s'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography 
                                            variant="caption" 
                                            fontWeight={isToday ? 900 : 600}
                                            sx={{ 
                                                color: isToday ? 'white' : (isCurrentMonth ? 'text.primary' : 'text.disabled'),
                                                bgcolor: isToday ? '#0ea5e9' : 'transparent',
                                                width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            {format(day, 'd')}
                                        </Typography>
                                        {dayTrips.length > 0 && (
                                            <Chip 
                                                label={dayTrips.length} 
                                                size="small" 
                                                sx={{ 
                                                    height: 16, 
                                                    fontSize: '0.6rem', 
                                                    fontWeight: 800, 
                                                    bgcolor: isSelected ? '#2563eb' : '#e2e8f0', 
                                                    color: isSelected ? 'white' : 'text.secondary' 
                                                }} 
                                            />
                                        )}
                                    </Box>
                                    
                                    <Stack spacing={0.5} sx={{ mt: 1, overflow: 'hidden' }}>
                                        {dayTrips.slice(0, 4).map((t: any, i: number) => (
                                            <Tooltip title={`${format(new Date(t.stops[0]?.scheduledTime), 'h:mm a')} - ${t.members[0]?.member?.firstName}`} key={i}>
                                            <Box 
                                                sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 0.5,
                                                    p: 0.5, 
                                                    borderRadius: 1, 
                                                    bgcolor: t.status === 'COMPLETED' ? '#dcfce7' : (t.status === 'CANCELLED' ? '#fee2e2' : 'rgba(14, 165, 233, 0.1)'),
                                                    color: t.status === 'COMPLETED' ? '#166534' : (t.status === 'CANCELLED' ? '#991b1b' : '#0369a1')
                                                }} 
                                            >
                                                <Typography variant="caption" noWrap sx={{ fontSize: '0.65rem', fontWeight: 700, minWidth: 'fit-content' }}>
                                                    {format(new Date(t.stops[0]?.scheduledTime), 'h:mm')}
                                                </Typography>
                                                <Typography variant="caption" noWrap sx={{ fontSize: '0.65rem', fontWeight: 500, opacity: 0.8 }}>
                                                    {t.members[0]?.member?.firstName}
                                                </Typography>
                                            </Box>
                                            </Tooltip>
                                        ))}
                                        {dayTrips.length > 4 && (
                                            <Typography variant="caption" color="text.secondary" sx={{ pl: 1, fontSize: '0.6rem' }}>
                                                +{dayTrips.length - 4} more
                                            </Typography>
                                        )}
                                    </Stack>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            </Paper>

            {/* Dialogs */}
            <Dialog open={!!selectedTrip} onClose={() => { setSelectedTrip(null); setCancelNotes(''); }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Trip Details</DialogTitle>
                <DialogContent>
                    {selectedTrip && (
                        <Box sx={{ minWidth: 320, py: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.light', color: 'primary.main', fontWeight: 700 }}>
                                    {selectedTrip.members[0]?.member?.firstName[0]}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" fontWeight={800}>{selectedTrip.members[0]?.member?.firstName} {selectedTrip.members[0]?.member?.lastName}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {format(new Date(selectedTrip.stops[0]?.scheduledTime || selectedTrip.tripDate), 'EEEE, MMMM d, yyyy @ h:mm a')}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 3, mb: 3 }}>
                                <Stack direction="row" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2" fontWeight={700} color="text.secondary">STATUS</Typography>
                                    <Chip label={selectedTrip.status} size="small" color={selectedTrip.status === 'COMPLETED' ? 'success' : 'default'} />
                                </Stack>
                                <Typography variant="body2" fontWeight={700} color="text.secondary" gutterBottom>ROUTE</Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>From:</strong> {selectedTrip.stops[0]?.address}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>To:</strong> {selectedTrip.stops[1]?.address}
                                </Typography>
                            </Box>

                            {(selectedTrip.status === 'COMPLETED' || selectedTrip.status === 'FINALIZED') && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={800} gutterBottom sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ReportIcon fontSize="small" /> TRIP REPORT
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: '#f0fdf4', borderColor: '#bcf0da' }}>
                                        <Typography variant="body2" sx={{ mb: 2, color: '#065f46' }}>
                                            The trip report has been generated and is ready for review.
                                        </Typography>
                                        <Stack direction="row" spacing={2}>
                                            <Button 
                                                variant="contained" 
                                                color="success" 
                                                size="small" 
                                                startIcon={<Download />}
                                                onClick={() => tripApi.downloadReport(selectedTrip.id)}
                                                sx={{ borderRadius: 2, fontWeight: 700 }}
                                            >
                                                Download PDF
                                            </Button>
                                            <Button 
                                                variant="outlined" 
                                                color="success" 
                                                size="small"
                                                onClick={() => navigate(`/driver/report/${selectedTrip.id}`)}
                                                sx={{ borderRadius: 2, fontWeight: 700, bgcolor: 'white' }}
                                            >
                                                View Details
                                            </Button>
                                        </Stack>
                                    </Paper>
                                </Box>
                            )}

                            {selectedTrip?.status !== 'CANCELLED' && selectedTrip?.status !== 'COMPLETED' && (
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    label="Reason for Cancelling (Optional)"
                                    placeholder="e.g. Appointment rescheduled, Client discharged, Refused to go..."
                                    value={cancelNotes}
                                    onChange={(e) => setCancelNotes(e.target.value)}
                                    sx={{ mt: 1 }}
                                />
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => { setSelectedTrip(null); setCancelNotes(''); }} sx={{ fontWeight: 700 }}>Close</Button>
                    <Button 
                        variant="outlined" 
                        onClick={() => navigate(`/driver/trips/${selectedTrip.id}`)}
                        sx={{ fontWeight: 700, borderRadius: 2 }}
                    >
                        View Full Details
                    </Button>
                    <Box sx={{ flex: 1 }} />
                    {selectedTrip?.status !== 'CANCELLED' && selectedTrip?.status !== 'COMPLETED' && (
                        <Button 
                            color="error" 
                            variant="contained" 
                            disabled={cancelTripMutation.isPending}
                            onClick={() => cancelTripMutation.mutate(selectedTrip.id)}
                            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
                        >
                            {cancelTripMutation.isPending ? 'Cancelling...' : 'Cancel Trip'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <DischargeMemberDialog open={isDischargeOpen} onClose={() => setIsDischargeOpen(false)} />
            
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
                <MuiAlert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </MuiAlert>
            </Snackbar>
        </Box>
    );


}

function DischargeMemberDialog({ open, onClose }: { open: boolean, onClose: () => void }) {
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const queryClient = useQueryClient();

    const { data: members = [] } = useQuery({
        queryKey: ['members'],
        queryFn: memberApi.getMembers
    });

    const dischargeMutation = useMutation({
        mutationFn: async () => {
             const today = format(new Date(), 'yyyy-MM-dd');
             const futureTrips = await tripApi.getTrips({ 
                 startDate: today, 
                 endDate: format(addMonths(new Date(), 12), 'yyyy-MM-dd'),
             });

             const memberTrips = futureTrips.filter((t: any) => 
                 t.members.some((m: any) => m.memberId === selectedMember.id || m.memberId === selectedMember.memberId) && 
                 t.status !== 'CANCELLED' && 
                 t.status !== 'COMPLETED'
             );

             const promises = memberTrips.map((t: any) => 
                 tripApi.cancelTrip(t.id, 'Discharged Member', 'Bulk cancellation via Dashboard')
             );
             await Promise.all(promises);
             return memberTrips.length;
        },
        onSuccess: (count) => {
            alert(`Successfully cancelled ${count} future trips for ${selectedMember.firstName}.`);
            queryClient.invalidateQueries({ queryKey: ['trips-calendar'] });
            onClose();
            setSelectedMember(null);
        }
    });

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Discharge & Bulk Cancel</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Select a member to cancel ALL their upcoming scheduled trips. This action cannot be undone efficiently.
                </Typography>
                <Autocomplete
                    options={members}
                    getOptionLabel={(o: any) => `${o.firstName} ${o.lastName}`}
                    value={selectedMember}
                    onChange={(_, v) => setSelectedMember(v)}
                    renderInput={(p) => <TextField {...p} label="Select Member" />}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    variant="contained" 
                    color="error" 
                    disabled={!selectedMember || dischargeMutation.isPending}
                    onClick={() => dischargeMutation.mutate()}
                >
                    {dischargeMutation.isPending ? 'Processing...' : 'Confirm Discharge'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
