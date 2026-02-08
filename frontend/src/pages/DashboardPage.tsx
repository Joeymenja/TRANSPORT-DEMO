import { Box, Container, Grid, Card, CardContent, Typography, Button, Chip, Collapse, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Divider, List, ListItem, ListItemText, ListItemIcon, Checkbox, FormControlLabel, FormControl, InputLabel, Select, Badge, Avatar } from '@mui/material';
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
    Add,
    AssignmentInd,
    Warning,
    Tune
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripApi, CreateTripData } from '../api/trips';
import { memberApi } from '../api/members';
import { driverApi } from '../api/drivers';
import { useAuthStore } from '../store/auth';
import api from '../lib/api';
import { format } from 'date-fns';
import { useState, ReactNode } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import DriverStatusToggle from '../components/driver/DriverStatusToggle';
import MobileDriverDashboard from '../components/dashboard/MobileDriverDashboard';
import DesktopDriverDashboard from '../components/dashboard/DesktopDriverDashboard';
import HouseManagerDashboard from '../components/dashboard/HouseManagerDashboard';
import MobileCaseManagerDashboard from '../components/dashboard/MobileCaseManagerDashboard';
import LiveMap from '../components/dashboard/LiveMap';
import ActivityFeed from '../components/dashboard/ActivityFeed';

export default function DashboardPage() {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // For now, return appropriate Dashboard
    if (user?.role === 'DRIVER') {
        return isMobile ? <MobileDriverDashboard /> : <DesktopDriverDashboard />;
    }
    if (user?.role === 'HOUSE_MANAGER') {
        return isMobile ? <MobileCaseManagerDashboard /> : <HouseManagerDashboard />;
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
    const [dispatchTripId, setDispatchTripId] = useState<string | null>(null);
    const [previewSignature, setPreviewSignature] = useState<{
        name: string,
        data: string,
        isProxy?: boolean,
        proxySigner?: string,
        proxyRelationship?: string,
        proxyReason?: string
    } | null>(null);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [customizeOpen, setCustomizeOpen] = useState(false);

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
        mobilityRequirement: 'AMBULATORY' | 'WHEELCHAIR' | 'STRETCHER' | 'CAR_SEAT';
    }>({
        date: today,
        time: '09:00',
        memberId: '',
        pickupAddress: '',
        dropoffAddress: '',
        isRoundTrip: false,
        returnTime: '12:00',
        mobilityRequirement: 'AMBULATORY'
    });


    const { data: trips = [], isLoading } = useQuery({
        queryKey: ['trips', today],
        queryFn: () => tripApi.getTrips({ date: today }),
        refetchInterval: 3000 // Poll every 3s for live updates
    });

    const { data: members = [] } = useQuery({
        queryKey: ['members'],
        queryFn: () => memberApi.getMembers(),
    });

    // Fetch All Drivers for Live Map (Poll every 10s)
    const { data: drivers = [] } = useQuery({
        queryKey: ['drivers-live'],
        queryFn: () => driverApi.getAll(),
        refetchInterval: 3000,
        enabled: !isSuspended
    });

    const { data: vehicles = [] } = useQuery({
        queryKey: ['vehicles'],
        queryFn: async () => {
            const res = await api.get('/vehicles');
            return res.data;
        }
    });

    const createTripMutation = useMutation({
        mutationFn: async (data: CreateTripData | CreateTripData[]) => {
            if (Array.isArray(data)) {
                return Promise.all(data.map(d => tripApi.createTrip(d)));
            }
            return tripApi.createTrip(data);
        },
        onSuccess: () => {
            console.log('Trip created successfully, invalidating queries...');
            queryClient.invalidateQueries({ queryKey: ['trips'] });
            queryClient.refetchQueries({ queryKey: ['trips', today] });
            setIsCreateDialogOpen(false);
            setTripForm({ ...tripForm, memberId: '', pickupAddress: '', dropoffAddress: '', isRoundTrip: false });
        },
        onError: (error: any) => {
            console.error('Trip creation failed:', error);
            alert(`Failed to create trip: ${error.response?.data?.message || error.message}`);
        }
    });


    const approveTripMutation = useMutation({
        mutationFn: (tripId: string) => tripApi.updateTrip(tripId, { status: 'SCHEDULED' as any }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trips'] });
        }
    });

    const dispatchMutation = useMutation({
        mutationFn: ({ tripId, driverId, vehicleId }: { tripId: string, driverId?: string, vehicleId?: string }) =>
            tripApi.updateTrip(tripId, { assignedDriverId: driverId, assignedVehicleId: vehicleId, status: 'SCHEDULED' as any }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trips'] });
            setDispatchTripId(null);
        }
    });

    const handleCreateTrip = () => {
        const tripDate = new Date(`${tripForm.date}T${tripForm.time}`);

        // Outbound Trip
        const outboundTrip: CreateTripData = {
            tripDate,
            members: [{ memberId: tripForm.memberId }],
            mobilityRequirement: tripForm.mobilityRequirement,
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
                mobilityRequirement: tripForm.mobilityRequirement,
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

    // --- MISSION CONTROL DASHBOARD (ADMIN) ---
    return (
        <Box sx={{ width: '100%', height: 'calc(100vh - 64px)', position: 'relative', overflow: 'hidden', bgcolor: '#000' }}>
            
            {/* 1. Background Map */}
            <LiveMap drivers={drivers} fullScreen theme="dark" />
            
            {/* 2. Left Command Panel (Glassmorphism) */}
            <Paper sx={{ 
                position: 'absolute', 
                top: 20, 
                bottom: 20, 
                left: 20, 
                width: 400, 
                bgcolor: 'rgba(28, 28, 30, 0.85)', 
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', 
                flexDirection: 'column', 
                overflow: 'hidden',
                zIndex: 10
            }}>
                <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h5" fontWeight={800} sx={{ color: 'white', letterSpacing: -0.5 }}>
                            MISSION CONTROL
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#8e8e93', fontWeight: 600 }}>
                            {format(new Date(), 'EEEE, MMMM d')} • {trips.length} Trips
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setIsCreateDialogOpen(true)} sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
                        <Add />
                    </IconButton>
                </Box>

                <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                    
                    {/* Unassigned Trips Warning */}
                    {trips.some(t => t.status === 'PENDING_APPROVAL' || t.status === 'SCHEDULED' && !t.assignedDriverId) && (
                        <Box sx={{ mb: 3 }}>
                           <Typography variant="overline" color="error.main" fontWeight={800} sx={{ letterSpacing: 1 }}>
                                ATTENTION NEEDED
                           </Typography>
                           {trips.filter(t => t.status === 'PENDING_APPROVAL').map(trip => (
                               <Card key={trip.id} sx={{ mb: 1.5, bgcolor: 'rgba(255,59,48,0.15)', border: '1px solid #ff3b30', borderRadius: 2 }}>
                                   <CardContent sx={{ p: '12px !important', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                       <Box>
                                           <Typography variant="subtitle2" fontWeight={700} color="white">
                                               New Request #{trip.id.slice(0,6)}
                                           </Typography>
                                           <Typography variant="caption" color="rgba(255,255,255,0.7)">
                                                {format(new Date(trip.tripDate), 'h:mm a')} • {trip.mobilityRequirement}
                                           </Typography>
                                       </Box>
                                       <Button size="small" variant="contained" color="error" onClick={() => approveTripMutation.mutate(trip.id)}>
                                           Review
                                       </Button>
                                   </CardContent>
                               </Card>
                           ))}
                        </Box>
                    )}

                    {/* Active/Upcoming Trips */}
                    <Typography variant="overline" color="#8e8e93" fontWeight={800} sx={{ letterSpacing: 1, mb: 1, display: 'block' }}>
                        SCHEDULED TRIPS
                    </Typography>
                    
                    {trips.filter(t => t.status !== 'PENDING_APPROVAL').length === 0 ? (
                        <Typography variant="body2" color="#666" fontStyle="italic">No scheduled trips today.</Typography>
                    ) : (
                        trips.filter(t => t.status !== 'PENDING_APPROVAL').map(trip => (
                            <Card 
                                key={trip.id} 
                                sx={{ 
                                    mb: 1.5, 
                                    bgcolor: 'rgba(44, 44, 46, 0.6)', 
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 3, 
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    transition: 'all 0.2s',
                                    '&:hover': { bgcolor: 'rgba(44, 44, 46, 0.9)', transform: 'translateY(-2px)' }
                                }}
                            >
                                <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <Typography variant="h6" fontWeight={700} color="white">
                                                {format(new Date(trip.tripDate), 'h:mm a')}
                                            </Typography>
                                            <Chip label={trip.status} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: trip.status === 'IN_PROGRESS' ? '#30d158' : '#0a84ff', color: 'white', fontWeight: 700 }} />
                                        </Box>
                                        {!trip.assignedDriverId && (
                                            <Button size="small" variant="outlined" color="warning" onClick={() => setDispatchTripId(trip.id)} sx={{ borderRadius: 4, height: 24, fontSize: '0.7rem' }}>
                                                Dispatch
                                            </Button>
                                        )}
                                    </Box>
                                    
                                    <Typography variant="body2" color="rgba(255,255,255,0.9)" fontWeight={500} noWrap>
                                        {trip.stops?.find(s => s.stopType === 'PICKUP')?.address?.split(',')[0]} 
                                    </Typography>
                                    <Box sx={{ pl: 1, borderLeft: '2px solid #555', my: 0.5 }}>
                                        <Typography variant="body2" color="rgba(255,255,255,0.7)" noWrap>
                                            To: {trip.stops?.find(s => s.stopType === 'DROPOFF')?.address?.split(',')[0]}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                                            {(trip.members?.[0]?.member?.firstName?.[0] || 'M')}
                                        </Avatar>
                                        <Typography variant="caption" color="rgba(255,255,255,0.6)">
                                            {trip.members?.[0]?.member ? `${trip.members[0].member.firstName} ${trip.members[0].member.lastName}` : 'Guest'}
                                        </Typography>
                                        <IconButton size="small" sx={{ ml: 'auto', color: '#8e8e93' }} onClick={() => setExpandedTripId(expandedTripId === trip.id ? null : trip.id)}>
                                            {expandedTripId === trip.id ? <ExpandLess /> : <ExpandMore />}
                                        </IconButton>
                                    </Box>

                                    <Collapse in={expandedTripId === trip.id}>
                                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                            {/* Minimal Details for quick check */}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="caption" color="#8e8e93">Vehicle</Typography>
                                                <Typography variant="caption" color="white">{trip.assignedVehicleId ? 'Assigned' : 'None'}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="caption" color="#8e8e93">Driver</Typography>
                                                <Typography variant="caption" color="white">{trip.assignedDriverId ? 'Assigned' : 'Unassigned'}</Typography>
                                            </Box>
                                            <Button fullWidth variant="outlined" size="small" onClick={() => tripApi.downloadReport(trip.id)} sx={{ mt: 1, color: '#0a84ff', borderColor: '#0a84ff' }}>
                                                View PDF Report
                                            </Button>
                                        </Box>
                                    </Collapse>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </Box>
            </Paper>

            {/* 3. Right Status Panel (Glassmorphism) */}
            <Paper sx={{ 
                position: 'absolute', 
                top: 20, 
                bottom: 20, 
                right: 20, 
                width: 320, 
                bgcolor: 'rgba(28, 28, 30, 0.85)', 
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', 
                flexDirection: 'column', 
                zIndex: 10
            }}>
                 <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <Typography variant="h6" fontWeight={800} sx={{ color: 'white', letterSpacing: -0.5 }}>
                        FLEET STATUS
                    </Typography>
                </Box>
                
                {/* Mini Stats */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, p: 2 }}>
                    <Box sx={{ bgcolor: 'rgba(48, 209, 88, 0.2)', p: 1.5, borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight={700} color="#30d158">{stats.active}</Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.7)" fontWeight={600}>ACTIVE</Typography>
                    </Box>
                    <Box sx={{ bgcolor: 'rgba(10, 132, 255, 0.2)', p: 1.5, borderRadius: 2, textAlign: 'center' }}>
                         <Typography variant="h4" fontWeight={700} color="#0a84ff">{stats.scheduled}</Typography>
                         <Typography variant="caption" color="rgba(255,255,255,0.7)" fontWeight={600}>PENDING</Typography>
                    </Box>
                </Box>

                <Box sx={{ flex: 1, overflowY: 'auto', p: 0, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ flexShrink: 0 }}>
                        <Typography variant="overline" color="#8e8e93" fontWeight={800} sx={{ letterSpacing: 1, px: 3, mt: 2, display: 'block' }}>
                            ACTIVE DRIVERS
                        </Typography>
                        <List>
                            {drivers.map(driver => (
                                <ListItem key={driver.id} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Badge
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        variant="dot"
                                        sx={{ '& .MuiBadge-badge': { bgcolor: driver.currentStatus === 'AVAILABLE' ? '#30d158' : '#ff9f0a' } }}
                                    >
                                         <Avatar sx={{ bgcolor: '#3a3a3c', color: 'white' }}>{driver.firstName[0]}</Avatar>
                                    </Badge>
                                    <ListItemText 
                                        primary={
                                            <Typography color="white" fontWeight={600} variant="body2">{driver.firstName} {driver.lastName}</Typography>
                                        }
                                        secondary={
                                            <Typography color="#8e8e93" variant="caption">{driver.currentStatus}</Typography>
                                        }
                                        sx={{ ml: 2 }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                    
                    <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
                    
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                        <ActivityFeed theme="dark" />
                    </Box>
                </Box>
            </Paper>

            {/* Dialogs logic remains same */}
            <Dialog open={!!previewSignature} onClose={() => setPreviewSignature(null)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ variant: 'subtitle1' }}>
                    Signature: {previewSignature?.name}
                    {previewSignature?.isProxy && (
                        <Chip label="Proxy Signature" size="small" color="warning" sx={{ ml: 1 }} />
                    )}
                </DialogTitle>
                <DialogContent>
                    <Box
                        component="img"
                        src={previewSignature?.data}
                        sx={{ width: '100%', border: '1px solid #eee', borderRadius: 1, mb: previewSignature?.isProxy ? 2 : 0 }}
                    />
                    {previewSignature?.isProxy && (
                        <Box sx={{ bgcolor: '#FFF8E1', p: 1.5, borderRadius: 1, borderLeft: '4px solid #FFC107' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 'bold' }}>
                                PROXY DETAILS
                            </Typography>
                            <Typography variant="body2">
                                <strong>Signer:</strong> {previewSignature.proxySigner} ({previewSignature.proxyRelationship})
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                <strong>Reason:</strong> {previewSignature.proxyReason}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewSignature(null)}>Close</Button>
                </DialogActions>
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
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Mobility Requirement"
                                fullWidth
                                value={tripForm.mobilityRequirement}
                                onChange={(e) => setTripForm({ ...tripForm, mobilityRequirement: e.target.value as any })}
                            >
                                <MenuItem value="AMBULATORY">Ambulatory</MenuItem>
                                <MenuItem value="WHEELCHAIR">Wheelchair</MenuItem>
                                <MenuItem value="STRETCHER">Stretcher</MenuItem>
                                <MenuItem value="CAR_SEAT">Car Seat</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
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
                                placeholder="Enter full street address"
                                inputProps={{
                                    autoComplete: 'street-address',
                                }}
                                helperText="Example: 123 Main St, Phoenix, AZ 85001"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Dropoff Address"
                                fullWidth
                                value={tripForm.dropoffAddress}
                                onChange={(e) => setTripForm({ ...tripForm, dropoffAddress: e.target.value })}
                                placeholder="Enter full street address"
                                inputProps={{
                                    autoComplete: 'street-address',
                                }}
                                helperText="Example: 456 Oak Ave, Scottsdale, AZ 85251"
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

            <AssignDispatchDialog
                open={!!dispatchTripId}
                onClose={() => setDispatchTripId(null)}
                tripId={dispatchTripId || ''}
                drivers={drivers}
                vehicles={vehicles}
                onAssign={(driverId, vehicleId) => {
                    dispatchMutation.mutate({ tripId: dispatchTripId!, driverId, vehicleId });
                }}
            />
        </Box>
    );
}

function AssignDispatchDialog({ open, onClose, tripId, drivers, vehicles, onAssign }: {
    open: boolean,
    onClose: () => void,
    tripId: string,
    drivers: any[],
    vehicles: any[],
    onAssign: (driverId?: string, vehicleId?: string) => void
}) {
    const [driverId, setDriverId] = useState('');
    const [vehicleId, setVehicleId] = useState('');

    const handleAssign = () => {
        onAssign(driverId || undefined, vehicleId || undefined);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Assign Dispatch - Trip #{tripId.slice(0, 8)}</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Assign Driver</InputLabel>
                            <Select
                                value={driverId}
                                label="Assign Driver"
                                onChange={(e) => setDriverId(e.target.value)}
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                {drivers.map((driver) => (
                                    <MenuItem key={driver.id} value={driver.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                            <Typography variant="body2">{driver.firstName} {driver.lastName}</Typography>
                                            {!driver.isActive && (
                                                <Chip
                                                    icon={<Warning sx={{ fontSize: '1rem !important' }} />}
                                                    label="Pending Compliance"
                                                    size="small"
                                                    color="warning"
                                                    variant="outlined"
                                                    sx={{ height: 20, fontSize: '0.65rem' }}
                                                />
                                            )}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Assign Vehicle</InputLabel>
                            <Select
                                value={vehicleId}
                                label="Assign Vehicle"
                                onChange={(e) => setVehicleId(e.target.value)}
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                {vehicles.map((vehicle) => (
                                    <MenuItem key={vehicle.id} value={vehicle.id}>
                                        {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleAssign} color="primary">
                    Confirm Assignment
                </Button>
            </DialogActions>
        </Dialog>
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
