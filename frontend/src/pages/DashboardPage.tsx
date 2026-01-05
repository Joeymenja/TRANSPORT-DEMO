import { Box, Container, Grid, Card, CardContent, Typography, Button, Chip, Collapse, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Divider, List, ListItem, ListItemText, ListItemIcon, Checkbox, FormControlLabel } from '@mui/material';
import {
    DirectionsCar,
    Schedule,
    CheckCircle,
    ExpandMore,
    ExpandLess,
    GpsFixed,
    History as HistoryIcon,
    Visibility,
    VerifiedUser,
    ErrorOutline,
    Add
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripApi, CreateTripData } from '../api/trips';
import { memberApi } from '../api/members';
import { driverApi } from '../api/drivers';
import { useAuthStore } from '../store/auth';
import { format } from 'date-fns';
import { useState, ReactNode } from 'react';
import DriverStatusToggle from '../components/driver/DriverStatusToggle';
import MobileDriverDashboard from '../components/dashboard/MobileDriverDashboard';
import UnassignedTripsList from '../components/dispatch/UnassignedTripsList';
import LiveMap from '../components/dashboard/LiveMap';
import ActivityFeed from '../components/dashboard/ActivityFeed';

export default function DashboardPage() {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);

    // Redirect Drivers to Mobile Dashboard
    if (user?.role === 'DRIVER') {
        return <MobileDriverDashboard />;
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
    const [previewSignature, setPreviewSignature] = useState<{ name: string, data: string } | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Fetch Driver Profile
    const { data: driver } = useQuery({
        queryKey: ['driver-profile', user?.id],
        queryFn: () => user?.id ? driverApi.getByUserId(user.id) : null,
        enabled: !!user && user.role === 'DRIVER'
    });

    const isOffDuty = driver?.currentStatus === 'OFF_DUTY';
    // Access Control: Check if user or driver is inactive
    const isSuspended = user?.isActive === false || (driver && driver.user && driver.user.isActive === false);

    // Create Trip Form State
    const [tripForm, setTripForm] = useState<{
        date: string;
        time: string;
        memberId: string;
        pickupAddress: string;
        dropoffAddress: string;
        isRoundTrip: boolean;
        returnTime: string;
    }>({
        date: today,
        time: '09:00',
        memberId: '',
        pickupAddress: '',
        dropoffAddress: '',
        isRoundTrip: false,
        returnTime: '12:00'
    });


    const { data: trips = [], isLoading } = useQuery({
        queryKey: ['trips', today],
        queryFn: () => tripApi.getTrips({ date: today }),
        refetchInterval: 10000
    });

    const { data: members = [] } = useQuery({
        queryKey: ['members'],
        queryFn: () => memberApi.getMembers(),
    });

    // Fetch All Drivers for Live Map (Poll every 10s)
    const { data: allDrivers = [] } = useQuery({
        queryKey: ['drivers-live'],
        queryFn: () => driverApi.getAll(),
        refetchInterval: 10000,
        enabled: !isSuspended
    });

    const createTripMutation = useMutation({
        mutationFn: async (data: CreateTripData | CreateTripData[]) => {
            if (Array.isArray(data)) {
                return Promise.all(data.map(d => tripApi.createTrip(d)));
            }
            return tripApi.createTrip(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trips'] });
            setIsCreateDialogOpen(false);
            setTripForm({ ...tripForm, memberId: '', pickupAddress: '', dropoffAddress: '', isRoundTrip: false });
        }
    });

    const approveTripMutation = useMutation({
        mutationFn: (tripId: string) => tripApi.updateTrip(tripId, { status: 'SCHEDULED' as any }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trips'] });
        }
    });

    const handleCreateTrip = () => {
        const tripDate = new Date(`${tripForm.date}T${tripForm.time}`);

        // Outbound Trip
        const outboundTrip: CreateTripData = {
            tripDate,
            members: [{ memberId: tripForm.memberId }],
            stops: [
                {
                    stopType: 'PICKUP',
                    stopOrder: 1,
                    address: tripForm.pickupAddress,
                    scheduledTime: tripDate
                },
                {
                    stopType: 'DROPOFF',
                    stopOrder: 2,
                    address: tripForm.dropoffAddress,
                    scheduledTime: new Date(tripDate.getTime() + 60 * 60 * 1000) // Assumed 1 hour later
                }
            ]
        };

        if (tripForm.isRoundTrip) {
            const returnTripDate = new Date(`${tripForm.date}T${tripForm.returnTime}`);
            const returnTrip: CreateTripData = {
                tripDate: returnTripDate,
                members: [{ memberId: tripForm.memberId }],
                stops: [
                    {
                        stopType: 'PICKUP',
                        stopOrder: 1,
                        address: tripForm.dropoffAddress,
                        scheduledTime: returnTripDate
                    },
                    {
                        stopType: 'DROPOFF',
                        stopOrder: 2,
                        address: tripForm.pickupAddress,
                        scheduledTime: new Date(returnTripDate.getTime() + 60 * 60 * 1000)
                    }
                ]
            };
            createTripMutation.mutate([outboundTrip, returnTrip]);
        } else {
            createTripMutation.mutate(outboundTrip);
        }
    };

    const stats = {
        active: (trips || []).filter(t => t?.status === 'IN_PROGRESS').length,
        scheduled: (trips || []).filter(t => t?.status === 'SCHEDULED').length,
        pending: (trips || []).filter(t => t?.status === 'PENDING_APPROVAL').length,
        completed: (trips || []).filter(t => t?.status === 'COMPLETED' || t?.status === 'FINALIZED').length,
    };

    if (isSuspended) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center', mt: 8 }}>
                    <ErrorOutline sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                    <Typography variant="h4" gutterBottom fontWeight={600}>
                        Account Suspended
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 4 }}>
                        Your driver account has been suspended or is pending approval.
                        Please contact your fleet administrator for assistance.
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#212121', mb: 1 }}>
                    Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </Typography>
            </Box>

            {/* Driver Status Section */}
            {driver && (
                <Card sx={{ mb: 4, borderRadius: 2 }}>
                    <CardContent>
                        <DriverStatusToggle
                            driverId={driver.id}
                            initialStatus={driver.currentStatus}
                            onChange={() => queryClient.invalidateQueries({ queryKey: ['driver-profile'] })}
                        />
                        {isOffDuty && (
                            <Box sx={{ mt: 2, bgcolor: '#ffebee', p: 2, borderRadius: 1, color: '#c62828', display: 'flex', alignItems: 'center' }}>
                                <ErrorOutline sx={{ mr: 1 }} />
                                <Typography variant="body2" fontWeight={500}>
                                    You are currently OFF DUTY. You will not receive new trip assignments.
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}


            {/* Live Operations Section */}
            {!driver && (
                <Grid container spacing={3} sx={{ mb: 4, height: 500 }}>
                    <Grid item xs={12} md={3} sx={{ height: '100%' }}>
                        <UnassignedTripsList trips={trips} drivers={allDrivers} />
                    </Grid>
                    <Grid item xs={12} md={9} sx={{ height: '100%' }}>
                        <Card sx={{ borderRadius: 2, height: '100%' }}>
                            <CardContent sx={{ p: '0 !important', height: '100%' }}>
                                <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                                    <Typography variant="h6" fontWeight={600}>Live Fleet Map</Typography>
                                </Box>
                                <LiveMap drivers={allDrivers} height="calc(100% - 60px)" />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}


            {/* Main Content Area: Stats/List Left, Activity Feed Right */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={9}>
                    {/* Stats Grid */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Active Trips"
                                value={stats.active}
                                icon={<DirectionsCar />}
                                color="#FF9800"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Pending Approval"
                                value={stats.pending}
                                icon={<CheckCircle />}
                                color="#F44336"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Scheduled"
                                value={stats.scheduled}
                                icon={<Schedule />}
                                color="#0096D6"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Completed"
                                value={stats.completed}
                                icon={<CheckCircle />}
                                color="#00C853"
                            />
                        </Grid>
                    </Grid>

                    {/* Upcoming Trips List */}
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Today's Trips
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => setIsCreateDialogOpen(true)}
                                    sx={{
                                        bgcolor: '#0096D6',
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: '#0077B5' },
                                    }}
                                >
                                    Create Trip
                                </Button>
                            </Box>

                            {isLoading ? (
                                <Typography>Loading...</Typography>
                            ) : trips.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No trips scheduled for today
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Create a trip to get started
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {(trips || []).map((trip) => (
                                        <Card
                                            key={trip.id}
                                            variant="outlined"
                                            sx={{
                                                borderRadius: 2,
                                                '&:hover': {
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                },
                                                borderColor: trip.status === 'PENDING_APPROVAL' ? '#ef5350' : undefined,
                                                borderWidth: trip.status === 'PENDING_APPROVAL' ? 2 : 1
                                            }}
                                        >
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                    <Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                                                Trip #{trip.id.slice(0, 8)}
                                                            </Typography>
                                                            {trip.isCarpool && (
                                                                <Chip
                                                                    label={`${trip.memberCount} clients`}
                                                                    size="small"
                                                                    sx={{ bgcolor: '#E3F2FD', color: '#0096D6' }}
                                                                />
                                                            )}
                                                            {trip.status === 'PENDING_APPROVAL' && (
                                                                <Chip
                                                                    label="PENDING APPROVAL"
                                                                    color="error"
                                                                    size="small"
                                                                    icon={<ErrorOutline />}
                                                                />
                                                            )}
                                                        </Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {(trip.tripType || 'DROP_OFF').replace('_', ' ')} • {trip.stops?.length || 0} stops
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ textAlign: 'right', mr: 2 }}>
                                                            <Chip
                                                                label={trip.status}
                                                                size="small"
                                                                color={
                                                                    trip.status === 'IN_PROGRESS' ? 'warning' :
                                                                        trip.status === 'SCHEDULED' ? 'info' :
                                                                            trip.status === 'PENDING_APPROVAL' ? 'error' :
                                                                                'success'
                                                                }
                                                                sx={{ mb: 1 }}
                                                            />
                                                        </Box>

                                                        {trip.status === 'PENDING_APPROVAL' && (
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                color="success"
                                                                startIcon={<CheckCircle />}
                                                                onClick={() => approveTripMutation.mutate(trip.id)}
                                                            >
                                                                Approve
                                                            </Button>
                                                        )}

                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            onClick={() => tripApi.downloadReport(trip.id)}
                                                            sx={{ textTransform: 'none' }}
                                                        >
                                                            PDF Report
                                                        </Button>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setExpandedTripId(expandedTripId === trip.id ? null : trip.id)}
                                                        >
                                                            {expandedTripId === trip.id ? <ExpandLess /> : <ExpandMore />}
                                                        </IconButton>
                                                    </Box>
                                                </Box>

                                                <Collapse in={expandedTripId === trip.id} timeout="auto" unmountOnExit>
                                                    <Box sx={{ mt: 3 }}>
                                                        <Divider sx={{ mb: 2 }} />
                                                        <Grid container spacing={3}>
                                                            <Grid item xs={12} md={6}>
                                                                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: '#0096D6' }}>
                                                                    <VerifiedUser fontSize="small" /> Member Compliance (Signatures)
                                                                </Typography>
                                                                <List disablePadding>
                                                                    {(trip.members || []).map((tm: any) => (
                                                                        <ListItem key={tm.id || Math.random()} disableGutters sx={{ py: 0.5 }}>
                                                                            <ListItemIcon sx={{ minWidth: 32 }}>
                                                                                {tm.memberSignatureBase64 ?
                                                                                    <CheckCircle fontSize="small" sx={{ color: '#00C853' }} /> :
                                                                                    <ErrorOutline fontSize="small" sx={{ color: '#F44336' }} />
                                                                                }
                                                                            </ListItemIcon>
                                                                            <ListItemText
                                                                                primary={tm.member ? `${tm.member.firstName} ${tm.member.lastName}` : 'Unknown Member'}
                                                                                secondary={tm.memberSignatureBase64 ? 'Signature Captured' : 'Awaiting Signature'}
                                                                                primaryTypographyProps={{ variant: 'body2' }}
                                                                                secondaryTypographyProps={{ variant: 'caption' }}
                                                                            />
                                                                            {tm.memberSignatureBase64 && tm.member && (
                                                                                <IconButton
                                                                                    size="small"
                                                                                    onClick={() => setPreviewSignature({
                                                                                        name: `${tm.member.firstName} ${tm.member.lastName}`,
                                                                                        data: tm.memberSignatureBase64
                                                                                    })}
                                                                                >
                                                                                    <Visibility fontSize="small" />
                                                                                </IconButton>
                                                                            )}
                                                                        </ListItem>
                                                                    ))}
                                                                </List>
                                                            </Grid>
                                                            <Grid item xs={12} md={6}>
                                                                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: '#FF9800' }}>
                                                                    <GpsFixed fontSize="small" /> Stop Audit Log (GPS)
                                                                </Typography>
                                                                <List disablePadding>
                                                                    {(trip.stops || []).map((stop: any, idx: number) => (
                                                                        <ListItem key={stop.id || idx} disableGutters sx={{ py: 0.5 }}>
                                                                            <ListItemIcon sx={{ minWidth: 32 }}>
                                                                                <HistoryIcon fontSize="small" />
                                                                            </ListItemIcon>
                                                                            <ListItemText
                                                                                primary={`${idx + 1}. ${(stop.stopType || 'STOP')}: ${(stop.address || '').split(',')[0]}`}
                                                                                secondary={
                                                                                    stop.actualArrivalTime ?
                                                                                        `Arrived: ${new Date(stop.actualArrivalTime).toLocaleTimeString()} ${stop.gpsLatitude ? `@ ${Number(stop.gpsLatitude).toFixed(4)}, ${Number(stop.gpsLongitude).toFixed(4)}` : '(No GPS)'}` :
                                                                                        'Pending'
                                                                                }
                                                                                primaryTypographyProps={{ variant: 'body2' }}
                                                                                secondaryTypographyProps={{ variant: 'caption' }}
                                                                            />
                                                                        </ListItem>
                                                                    ))}
                                                                </List>
                                                            </Grid>
                                                        </Grid>
                                                    </Box>
                                                </Collapse>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Activity Feed Sidebar */}
                <Grid item xs={12} md={3}>
                    <ActivityFeed trips={trips} />
                </Grid>
            </Grid>

            <Dialog open={!!previewSignature} onClose={() => setPreviewSignature(null)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ variant: 'subtitle1' }}>Signature: {previewSignature?.name}</DialogTitle>
                <DialogContent>
                    <Box
                        component="img"
                        src={previewSignature?.data}
                        sx={{ width: '100%', border: '1px solid #eee', borderRadius: 1 }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Trip</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Date"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={tripForm.date}
                                onChange={(e) => setTripForm({ ...tripForm, date: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Time"
                                type="time"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={tripForm.time}
                                onChange={(e) => setTripForm({ ...tripForm, time: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={tripForm.isRoundTrip}
                                        onChange={(e) => setTripForm({ ...tripForm, isRoundTrip: e.target.checked })}
                                    />
                                }
                                label="Round Trip"
                            />
                        </Grid>
                        {tripForm.isRoundTrip && (
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Return Pickup Time"
                                    type="time"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={tripForm.returnTime}
                                    onChange={(e) => setTripForm({ ...tripForm, returnTime: e.target.value })}
                                />
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <TextField
                                select
                                label="Select Member"
                                fullWidth
                                value={tripForm.memberId}
                                onChange={(e) => setTripForm({ ...tripForm, memberId: e.target.value })}
                            >
                                {(members || []).map((member) => (
                                    <MenuItem key={member?.id || Math.random()} value={member?.id}>
                                        {member?.lastName}, {member?.firstName} ({member?.memberId || 'N/A'})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Pickup Address"
                                fullWidth
                                value={tripForm.pickupAddress}
                                onChange={(e) => setTripForm({ ...tripForm, pickupAddress: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Dropoff Address"
                                fullWidth
                                value={tripForm.dropoffAddress}
                                onChange={(e) => setTripForm({ ...tripForm, dropoffAddress: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateTrip}
                        disabled={!tripForm.memberId || createTripMutation.isPending}
                    >
                        {createTripMutation.isPending ? 'Booking...' : (tripForm.isRoundTrip ? 'Book 2 Trips' : 'Book Trip')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: ReactNode, color: string }) {
    return (
        <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography color="text.secondary" variant="subtitle2" fontWeight={500}>
                        {title}
                    </Typography>
                    <Box sx={{
                        color,
                        bgcolor: `${color}1A`, // 10% opacity
                        p: 1,
                        borderRadius: 1,
                        display: 'flex'
                    }}>
                        {icon}
                    </Box>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
}
