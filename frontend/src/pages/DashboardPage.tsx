import { Box, Container, Grid, Card, CardContent, Typography, Button, Chip, Collapse, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Divider, List, ListItem, ListItemText, ListItemIcon, Checkbox, FormControlLabel, FormControl, InputLabel, Select } from '@mui/material';
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
    Warning
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripApi, CreateTripData } from '../api/trips';
import { memberApi } from '../api/members';
import api from '../lib/api';
import { format } from 'date-fns';
import { useState, ReactNode } from 'react';

export default function DashboardPage() {
    const queryClient = useQueryClient();
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
    });

    const { data: members = [] } = useQuery({
        queryKey: ['members'],
        queryFn: () => memberApi.getMembers(),
    });

    const { data: drivers = [] } = useQuery({
        queryKey: ['drivers'],
        queryFn: async () => {
            const res = await api.get('/auth/users?role=DRIVER');
            return res.data;
        }
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
                tripDate: returnTripDate, // Can be different if needed, but using same day for now
                members: [{ memberId: tripForm.memberId }],
                mobilityRequirement: tripForm.mobilityRequirement,
                stops: [
                    {
                        stopType: 'PICKUP',
                        stopOrder: 1,
                        address: tripForm.dropoffAddress, // Pickup at Destination
                        scheduledTime: returnTripDate
                    },
                    {
                        stopType: 'DROPOFF',
                        stopOrder: 2,
                        address: tripForm.pickupAddress, // Dropoff at Home
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
                        color="#F44336" // Red/Alert color for pending
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

            {/* Upcoming Trips */}
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
                                                    <Chip
                                                        label={trip.mobilityRequirement}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{
                                                            borderColor: trip.mobilityRequirement === 'AMBULATORY' ? '#9e9e9e' : '#ff9800',
                                                            color: trip.mobilityRequirement === 'AMBULATORY' ? '#616161' : '#ed6c02',
                                                            fontWeight: 500
                                                        }}
                                                    />
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

                                                {(trip.status === 'PENDING_APPROVAL' || trip.status === 'SCHEDULED') && (
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        color="primary"
                                                        startIcon={<AssignmentInd />}
                                                        onClick={() => setDispatchTripId(trip.id)}
                                                        sx={{ mr: 1, textTransform: 'none' }}
                                                    >
                                                        Dispatch
                                                    </Button>
                                                )}

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
                                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                            {tm.isProxySignature && (
                                                                                <Chip
                                                                                    label="Proxy"
                                                                                    size="small"
                                                                                    color="warning"
                                                                                    variant="outlined"
                                                                                    sx={{ height: 20, fontSize: '0.65rem', mr: 1 }}
                                                                                />
                                                                            )}
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => setPreviewSignature({
                                                                                    name: `${tm.member.firstName} ${tm.member.lastName}`,
                                                                                    data: tm.memberSignatureBase64,
                                                                                    isProxy: tm.isProxySignature,
                                                                                    proxySigner: tm.proxySignerName,
                                                                                    proxyRelationship: tm.proxyRelationship,
                                                                                    proxyReason: tm.proxyReason
                                                                                })}
                                                                            >
                                                                                <Visibility fontSize="small" />
                                                                            </IconButton>
                                                                        </Box>
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
                                                                                `Arrived: ${new Date(stop.actualArrivalTime).toLocaleTimeString()} ${stop.gpsLatitude ? `@ ${stop.gpsLatitude.toFixed(4)}, ${stop.gpsLongitude.toFixed(4)}` : '(No GPS)'}` :
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
        </Container>
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
