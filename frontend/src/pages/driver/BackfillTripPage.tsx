import { useState, useEffect } from 'react';
import { 
    Box, 
    Container, 
    Typography, 
    TextField, 
    Button, 
    Paper, 
    Autocomplete, 
    CircularProgress,
    Divider,
    Alert,
    Grid,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    createFilterOptions,
    IconButton,
    Card,
    CardContent,
    Collapse,
    Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import TimeWheelSelector from '../../components/common/TimeWheelSelector';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberApi, MobilityRequirement } from '../../api/members';
import { tripApi } from '../../api/trips';
import { vehicleApi } from '../../api/vehicles';
import { useAuthStore } from '../../store/auth';
import { format, addMinutes, parse } from 'date-fns';
import { 
    ArrowBack, 
    HistoryEdu, 
    PersonAdd, 
    LocationOn, 
    AddCircleOutline, 
    DeleteOutline, 
    ExpandMore, 
    ExpandLess,
    Route
} from '@mui/icons-material';
import { COMMON_LOCATIONS } from '../../constants/locations';

const REASONS_FOR_VISIT = [
    'Primary Care (PCP)',
    'Psychiatric Appointment',
    'Behavioral Health / Counseling',
    'Medication Pickup (RX)',
    'Dialysis',
    'Hospital / ER',
    'MyDrNow / Urgent Care',
    'Specialist Visit',
    'Other (Medical)',
];

const filter = createFilterOptions<any>();

interface TripLeg {
    pickupAddress: string;
    dropoffAddress: string;
    pickupTime: string;
    dropoffTime: string;
    startOdometer: string;
    endOdometer: string;
    reasonForVisit: string;
    isExpanded: boolean;
}

export default function BackfillTripPage() {
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const queryClient = useQueryClient();

    // Fix for "User session not found" - redirect or show loading if store isn't hydrated
    if (isAuthenticated && !user) {
        return (
            <Container sx={{ py: 10, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading driver profile...</Typography>
            </Container>
        );
    }

    // Member & Vehicle selection
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [date, setDate] = useState<Date | null>(new Date());

    // Multi-leg state
    const [legs, setLegs] = useState<TripLeg[]>([
        { 
            pickupAddress: '', 
            dropoffAddress: '', 
            pickupTime: format(new Date(), 'HH:mm'), 
            dropoffTime: format(addMinutes(new Date(), 30), 'HH:mm'), 
            startOdometer: '', 
            endOdometer: '', 
            reasonForVisit: 'Behavioral Health / Counseling',
            isExpanded: true
        }
    ]);

    const [error, setError] = useState('');

    // New member dialog state
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [newMemberData, setNewMemberData] = useState({
        firstName: '',
        lastName: '',
        memberId: '',
        dateOfBirth: '',
        address: '',
        phone: '',
        mobilityRequirement: MobilityRequirement.AMBULATORY
    });

    const { data: members = [], isLoading: loadingMembers } = useQuery({
        queryKey: ['members'],
        queryFn: memberApi.getMembers
    });

    const { data: vehicles = [], isLoading: loadingVehicles } = useQuery({
        queryKey: ['vehicles'],
        queryFn: vehicleApi.getVehicles
    });

    const handleAddLeg = () => {
        if (legs.length >= 6) return;
        
        const lastLeg = legs[legs.length - 1];
        setLegs([...legs.map(l => ({ ...l, isExpanded: false })), {
            pickupAddress: lastLeg.dropoffAddress, // Default next pickup to previous dropoff
            dropoffAddress: '',
            pickupTime: lastLeg.dropoffTime,
            dropoffTime: format(addMinutes(parse(lastLeg.dropoffTime, 'HH:mm', new Date()), 30), 'HH:mm'),
            startOdometer: lastLeg.endOdometer,
            endOdometer: '',
            reasonForVisit: lastLeg.reasonForVisit,
            isExpanded: true
        }]);
    };

    const handleRemoveLeg = (index: number) => {
        if (legs.length === 1) return;
        setLegs(legs.filter((_, i) => i !== index));
    };

    const updateLeg = (index: number, updates: Partial<TripLeg>) => {
        setLegs(legs.map((leg, i) => i === index ? { ...leg, ...updates } : leg));
    };

    const createTripMutation = useMutation({
        mutationFn: async () => {
            if (!selectedMember) throw new Error('Member selection is missing');
            if (!selectedVehicle) throw new Error('Vehicle selection is missing');
            if (!user) throw new Error('User session not found');

            // Construct stops from legs
            const stops: any[] = [];
            legs.forEach((leg, index) => {
                stops.push({
                    stopType: 'PICKUP',
                    stopOrder: (index * 2) + 1,
                    address: leg.pickupAddress,
                    scheduledTime: new Date(`${format(date || new Date(), 'yyyy-MM-dd')}T${leg.pickupTime}:00`),
                    odometerReading: parseFloat(leg.startOdometer)
                });
                stops.push({
                    stopType: 'DROPOFF',
                    stopOrder: (index * 2) + 2,
                    address: leg.dropoffAddress,
                    scheduledTime: new Date(`${format(date || new Date(), 'yyyy-MM-dd')}T${leg.dropoffTime}:00`),
                    odometerReading: parseFloat(leg.endOdometer)
                });
            });

            const tripPayload: any = {
                tripDate: date || new Date(),
                assignedDriverId: user.id,
                assignedVehicleId: selectedVehicle.id,
                status: 'COMPLETED',
                tripType: legs.length > 2 ? 'MULTIPLE_STOPS' : (legs.length === 2 ? 'ROUND_TRIP' : 'ONE_WAY'),
                reasonForVisit: legs[0].reasonForVisit, // Primary reason
                members: [{ memberId: selectedMember.id }],
                mobilityRequirement: selectedMember.mobilityRequirement || 'AMBULATORY',
                startOdometer: parseFloat(legs[0].startOdometer) || 0,
                stops: stops
            };

            return await tripApi.createTrip(tripPayload);
        },
        onSuccess: (newTrip) => {
            queryClient.invalidateQueries({ queryKey: ['driver-trips'] });
            navigate(`/driver/report/${newTrip.id}`, { 
                state: { 
                    preFillLegs: legs, // Pass all legs for pre-filling the report
                    returnPath: '/driver/backfill'
                } 
            });
        },
        onError: (err: any) => {
            console.error('Failed to create backfill trip:', err);
            const msg = err.response?.data?.message;
            if (Array.isArray(msg)) {
                setError(`Validation Errors: ${msg.join(', ')}`);
            } else {
                setError(msg || err.message || 'Failed to create trip record');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    const handleCreate = () => {
        setError(''); // Clear previous errors
        if (!selectedMember) {
            setError('Please search for and select a member first');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        if (!selectedVehicle) {
            setError('Please select the vehicle used for this trip');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        const invalidLeg = legs.find(l => !l.pickupAddress || !l.dropoffAddress || !l.startOdometer || !l.endOdometer);
        if (invalidLeg) {
            setError('All legs must have pickup/dropoff addresses and odometer readings');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        createTripMutation.mutate();
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4, pb: 12 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/driver')} sx={{ mb: 2 }}>Back</Button>

            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Route sx={{ fontSize: 48, color: '#007aff', mb: 1 }} />
                <Typography variant="h5" fontWeight={800}>Log Completed Service</Typography>
                <Typography variant="body2" color="text.secondary">Record up to 6 trip legs for this member.</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Member & Vehicle Card */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 4, border: '1px solid #e0e0e0' }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 2, display: 'block' }}>BASICS</Typography>
                <Autocomplete
                    options={members}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    getOptionLabel={(o: any) => o.inputValue || `${o.firstName} ${o.lastName} (${o.memberId || 'No ID'})`}
                    filterOptions={(options, params) => {
                        const filtered = filter(options, params);
                        if (params.inputValue !== '' && !options.some(o => params.inputValue === o.firstName)) {
                            filtered.push({ inputValue: `Add "${params.inputValue}"`, isNew: true, firstName: params.inputValue });
                        }
                        return filtered;
                    }}
                    value={selectedMember}
                    onChange={(_, v: any) => {
                        if (v?.isNew) {
                            setNewMemberData(p => ({ ...p, firstName: v.firstName }));
                            setIsAddMemberOpen(true);
                        } else {
                            setSelectedMember(v);
                            if (v?.address) updateLeg(0, { pickupAddress: v.address });
                        }
                    }}
                    renderInput={(p) => <TextField {...p} label="Member *" sx={{ mb: 2 }} />}
                />
                <Autocomplete
                    options={vehicles}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    getOptionLabel={(o: any) => `${o.vehicleNumber} - ${o.make} (${o.licensePlate})`}
                    value={selectedVehicle}
                    onChange={(_, v) => setSelectedVehicle(v)}
                    renderInput={(p) => <TextField {...p} label="Vehicle *" sx={{ mb: 2 }} />}
                />
                <DatePicker
                    label="Service Date"
                    value={date}
                    onChange={(newValue) => setDate(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                />
            </Paper>

            {/* Legs Section */}
            <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 1, ml: 1, display: 'block' }}>TRIP LEGS ({legs.length}/6)</Typography>
            
            {legs.map((leg, index) => (
                <Card key={index} sx={{ mb: 2, borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                    <Box 
                        sx={{ 
                            p: 2, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            bgcolor: leg.isExpanded ? '#f8f9fa' : 'white',
                            cursor: 'pointer'
                        }}
                        onClick={() => updateLeg(index, { isExpanded: !leg.isExpanded })}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Chip label={`Leg ${index + 1}`} size="small" color="primary" sx={{ fontWeight: 700 }} />
                            {!leg.isExpanded && (
                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                    {leg.pickupAddress || '...'} → {leg.dropoffAddress || '...'}
                                </Typography>
                            )}
                        </Box>
                        <Box>
                            {legs.length > 1 && (
                                <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleRemoveLeg(index); }}>
                                    <DeleteOutline />
                                </IconButton>
                            )}
                            <IconButton size="small">
                                {leg.isExpanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                        </Box>
                    </Box>

                    <Collapse in={leg.isExpanded}>
                        <CardContent sx={{ pt: 0 }}>
                            <Divider sx={{ mb: 2 }} />
                            
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={6}>
                                    <TimeWheelSelector
                                        label="Pickup Time"
                                        value={leg.pickupTime}
                                        onChange={(newValue) => updateLeg(index, { pickupTime: newValue })}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TimeWheelSelector
                                        label="Dropoff Time"
                                        value={leg.dropoffTime}
                                        onChange={(newValue) => updateLeg(index, { dropoffTime: newValue })}
                                    />
                                </Grid>
                            </Grid>

                            <Autocomplete
                                freeSolo
                                options={COMMON_LOCATIONS}
                                getOptionLabel={(o: any) => typeof o === 'string' ? o : `${o.name} (${o.address})`}
                                value={leg.pickupAddress}
                                onInputChange={(_, v) => updateLeg(index, { pickupAddress: v })}
                                renderInput={(p) => <TextField {...p} label="Pickup Address" sx={{ mb: 2 }} />}
                            />

                            <Autocomplete
                                freeSolo
                                options={COMMON_LOCATIONS}
                                getOptionLabel={(o: any) => typeof o === 'string' ? o : `${o.name} (${o.address})`}
                                value={leg.dropoffAddress}
                                onInputChange={(_, v) => updateLeg(index, { dropoffAddress: v })}
                                renderInput={(p) => <TextField {...p} label="Dropoff Address" sx={{ mb: 2 }} />}
                            />

                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={6}>
                                    <TextField label="Start Odo" type="number" fullWidth value={leg.startOdometer} onChange={(e) => updateLeg(index, { startOdometer: e.target.value })} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="End Odo" type="number" fullWidth value={leg.endOdometer} onChange={(e) => updateLeg(index, { endOdometer: e.target.value })} />
                                </Grid>
                            </Grid>

                            <Autocomplete
                                freeSolo
                                options={REASONS_FOR_VISIT}
                                value={leg.reasonForVisit}
                                onInputChange={(_, v) => updateLeg(index, { reasonForVisit: v })}
                                renderInput={(p) => <TextField {...p} label="Reason for Visit" sx={{ mb: 2 }} />}
                            />
                        </CardContent>
                    </Collapse>
                </Card>
            ))}

            {legs.length < 6 && (
                <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<AddCircleOutline />} 
                    onClick={handleAddLeg}
                    sx={{ mb: 4, borderRadius: 3, py: 1.5, borderStyle: 'dashed' }}
                >
                    Add Leg (Return or Stop)
                </Button>
            )}

            <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleCreate}
                disabled={createTripMutation.isPending}
                sx={{ height: 60, borderRadius: 4, bgcolor: '#34c759', fontWeight: 800, fontSize: '1.1rem' }}
            >
                {createTripMutation.isPending ? 'Saving...' : 'Review & Sign Packets'}
            </Button>

            {/* Add Member Dialog */}
            <Dialog open={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Add New Member</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField label="First Name" fullWidth value={newMemberData.firstName} onChange={(e) => setNewMemberData(p => ({ ...p, firstName: e.target.value }))} />
                        <TextField label="Last Name" fullWidth value={newMemberData.lastName} onChange={(e) => setNewMemberData(p => ({ ...p, lastName: e.target.value }))} />
                        <TextField label="Member ID" fullWidth value={newMemberData.memberId} onChange={(e) => setNewMemberData(p => ({ ...p, memberId: e.target.value }))} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}><Button onClick={() => setIsAddMemberOpen(false)}>Cancel</Button><Button variant="contained" onClick={() => createMemberMutation.mutate(newMemberData)}>Save</Button></DialogActions>
            </Dialog>
        </Container>
    );
}
