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
    Chip,
    ToggleButtonGroup,
    ToggleButton
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
    Route,
    AutoAwesome
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

    // Member selection
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [date, setDate] = useState<Date | null>(new Date());
    const [tripType, setTripType] = useState<'ONE_WAY' | 'ROUND_TRIP'>('ONE_WAY');

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

    // Manual member state
    const [isManualMember, setIsManualMember] = useState(false);
    const [manualMemberInfo, setManualMemberInfo] = useState({ firstName: '', lastName: '', memberId: '' });


    // New member dialog state
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [newMemberData, setNewMemberData] = useState({
        firstName: '',
        lastName: '',
        memberId: '',
        dateOfBirth: '',
        address: '', // House Address
        mailingAddress: '',
        phone: '',
        reasonForRide: 'Behavioral Health / Counseling',
        mobilityRequirement: MobilityRequirement.AMBULATORY
    });

    const { data: members = [], isLoading: loadingMembers } = useQuery({
        queryKey: ['members'],
        queryFn: memberApi.getMembers
    });

    const createMemberMutation = useMutation({
        mutationFn: (data: any) => memberApi.createMember(data),
        onSuccess: (newMember) => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            setSelectedMember(newMember);
            if (newMember.address) updateLeg(0, { pickupAddress: newMember.address });
            if (newMemberData.reasonForRide) updateLeg(0, { reasonForVisit: newMemberData.reasonForRide });
            setIsAddMemberOpen(false);
            setNewMemberData({
                firstName: '',
                lastName: '',
                memberId: '',
                dateOfBirth: '',
                address: '',
                mailingAddress: '',
                phone: '',
                reasonForRide: 'Behavioral Health / Counseling',
                mobilityRequirement: MobilityRequirement.AMBULATORY
            });
        },
        onError: (err: any) => {
            setError(err.message || 'Failed to create member');
        }
    });


    const handleTripTypeChange = (_: any, newType: 'ONE_WAY' | 'ROUND_TRIP') => {
        if (!newType) return;
        setTripType(newType);

        if (newType === 'ROUND_TRIP' && legs.length === 1) {
            // Auto-add return leg
            const firstLeg = legs[0];
            setLegs([
                { ...firstLeg, isExpanded: false },
                {
                    pickupAddress: firstLeg.dropoffAddress,
                    dropoffAddress: firstLeg.pickupAddress,
                    pickupTime: format(addMinutes(parse(firstLeg.dropoffTime, 'HH:mm', new Date()), 60), 'HH:mm'),
                    dropoffTime: format(addMinutes(parse(firstLeg.dropoffTime, 'HH:mm', new Date()), 90), 'HH:mm'),
                    startOdometer: firstLeg.endOdometer,
                    endOdometer: '',
                    reasonForVisit: firstLeg.reasonForVisit,
                    isExpanded: true
                }
            ]);
        } else if (newType === 'ONE_WAY' && legs.length > 1) {
            // Keep first leg only if user specifically asked for one way? 
            // Better to just let them keep what they have but maybe collapse them.
            // Actually usually toggling one-way/round-trip in booking apps is more rigid.
            // If they have >2 legs, it's already "MULTIPLE_STOPS".
        }
    };

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
                status: 'COMPLETED',
                tripType: legs.length > 2 ? 'MULTIPLE_STOPS' : (legs.length === 2 ? 'ROUND_TRIP' : 'ONE_WAY'),
                reasonForVisit: legs[0].reasonForVisit, 
                members: isManualMember 
                    ? [{ 
                        firstName: manualMemberInfo.firstName, 
                        lastName: manualMemberInfo.lastName, 
                        memberId: manualMemberInfo.memberId,
                        isManual: true 
                    }]
                    : [{ memberId: selectedMember.id }],
                mobilityRequirement: isManualMember ? 'AMBULATORY' : (selectedMember.mobilityRequirement || 'AMBULATORY'),
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
        if (!isManualMember && !selectedMember) {
            setError('Please search for and select a member first');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (isManualMember && (!manualMemberInfo.firstName || !manualMemberInfo.lastName)) {
            setError('Please enter member name for manual record');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        
        // 1. Check for missing values
        const missingFieldLegIndex = legs.findIndex(l => !l.pickupAddress || !l.dropoffAddress || !l.startOdometer || !l.endOdometer);
        if (missingFieldLegIndex !== -1) {
            setError(`Leg ${missingFieldLegIndex + 1} is missing required addresses or odometer readings`);
            updateLeg(missingFieldLegIndex, { isExpanded: true });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // 2. Validate Odometer Readings (End >= Start)
        const odoErrorIndex = legs.findIndex(l => parseFloat(l.endOdometer) < parseFloat(l.startOdometer));
        if (odoErrorIndex !== -1) {
            setError(`Leg ${odoErrorIndex + 1}: End odometer cannot be less than start odometer`);
            updateLeg(odoErrorIndex, { isExpanded: true });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // 3. Validate Time Logic (Dropoff > Pickup)
        const timeErrorIndex = legs.findIndex(l => {
            const p = parse(l.pickupTime, 'HH:mm', new Date());
            const d = parse(l.dropoffTime, 'HH:mm', new Date());
            return d <= p;
        });
        if (timeErrorIndex !== -1) {
            setError(`Leg ${timeErrorIndex + 1}: Dropoff time must be after pickup time`);
            updateLeg(timeErrorIndex, { isExpanded: true });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // 4. Validate Sequential Legs (Leg N+1 Pickup >= Leg N Dropoff)
        for (let i = 1; i < legs.length; i++) {
            const prevDropoff = parse(legs[i-1].dropoffTime, 'HH:mm', new Date());
            const currPickup = parse(legs[i].pickupTime, 'HH:mm', new Date());
            if (currPickup < prevDropoff) {
                setError(`Leg ${i + 1} pickup time cannot be before Leg ${i} dropoff time`);
                updateLeg(i, { isExpanded: true });
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
        }
        
        createTripMutation.mutate();
    };

    const handleReset = () => {
        if (window.confirm('Clear all entered trip data?')) {
            setSelectedMember(null);
            setDate(new Date());
            setTripType('ONE_WAY');
            setLegs([{ 
                pickupAddress: '', 
                dropoffAddress: '', 
                pickupTime: format(new Date(), 'HH:mm'), 
                dropoffTime: format(addMinutes(new Date(), 30), 'HH:mm'), 
                startOdometer: '', 
                endOdometer: '', 
                reasonForVisit: 'Behavioral Health / Counseling',
                isExpanded: true
            }]);
            setError('');
        }
    };

    const handleSmartFill = () => {
        if (!selectedMember) {
            setError('Please select a member first for AI auto-suggestions.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        setError('');
        const baseOdo = 45000 + Math.floor(Math.random() * 1000);
        const morning = new Date();
        morning.setHours(9, 0, 0);
        
        setLegs([
            {
                pickupAddress: selectedMember.address || 'Member Home',
                dropoffAddress: 'Desert Valley Medical Center',
                pickupTime: format(morning, 'HH:mm'),
                dropoffTime: format(addMinutes(morning, 35), 'HH:mm'),
                startOdometer: baseOdo.toString(),
                endOdometer: (baseOdo + 8).toString(),
                reasonForVisit: 'Dialysis',
                isExpanded: false
            },
            {
                pickupAddress: 'Desert Valley Medical Center',
                dropoffAddress: selectedMember.address || 'Member Home',
                pickupTime: format(addMinutes(morning, 240), 'HH:mm'),
                dropoffTime: format(addMinutes(morning, 275), 'HH:mm'),
                startOdometer: (baseOdo + 8).toString(),
                endOdometer: (baseOdo + 16).toString(),
                reasonForVisit: 'Dialysis',
                isExpanded: true
            }
        ]);
        setTripType('ROUND_TRIP');
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4, pb: 12 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/driver')} sx={{ mb: 2 }}>Back</Button>

            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>Log Completed Service</Typography>
                <Typography variant="body2" color="text.secondary">Record up to 6 trip legs for this member</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Member & Vehicle Card */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 4, border: '1px solid #e0e0e0', borderTop: '4px solid #14B8A6' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>Member Details</Typography>
                    <Button 
                        size="small" 
                        onClick={() => setIsManualMember(!isManualMember)}
                        sx={{ textTransform: 'none', color: '#14B8A6' }}
                    >
                        {isManualMember ? 'Use Database Member' : 'Manual Member Entry'}
                    </Button>
                </Box>

                {isManualMember ? (
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                            <TextField 
                                label="First Name *" 
                                fullWidth 
                                value={manualMemberInfo.firstName}
                                onChange={(e) => setManualMemberInfo(p => ({ ...p, firstName: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField 
                                label="Last Name *" 
                                fullWidth 
                                value={manualMemberInfo.lastName}
                                onChange={(e) => setManualMemberInfo(p => ({ ...p, lastName: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                label="Member ID (Optional)" 
                                fullWidth 
                                value={manualMemberInfo.memberId}
                                onChange={(e) => setManualMemberInfo(p => ({ ...p, memberId: e.target.value }))}
                            />
                        </Grid>
                    </Grid>
                ) : (
                    <Autocomplete
                        options={members}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        getOptionLabel={(o: any) => o.inputValue || `${o.firstName} ${o.lastName} (${o.memberId || 'No ID'})`}
                        filterOptions={(options, params) => {
                            const filtered = filter(options, params);
                            if (params.inputValue !== '' && !options.some(o => params.inputValue === o.firstName)) {
                                filtered.push({ inputValue: `Add New Member "${params.inputValue}"`, isNew: true, firstName: params.inputValue });
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
                        renderInput={(p) => <TextField {...p} label="Search Member Database *" sx={{ mb: 2 }} />}
                    />
                )}

                <DatePicker
                    label="Service Date"
                    value={date}
                    onChange={(newValue) => setDate(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                />
            </Paper>

            {/* Trip Type Selector */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <ToggleButtonGroup
                    value={tripType}
                    exclusive
                    onChange={handleTripTypeChange}
                    sx={{ 
                        bgcolor: '#f5f5f5',
                        borderRadius: 50, // Pill shape
                        p: 0.5,
                        border: 'none',
                        '& .MuiToggleButton-root': {
                            px: 3,
                            py: 1,
                            borderRadius: 50,
                            border: 'none !important',
                            textTransform: 'none',
                            fontWeight: 600,
                            color: '#757575',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s',
                            '&.Mui-selected': {
                                bgcolor: 'white',
                                color: '#14B8A6',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                '&:hover': { bgcolor: 'white' }
                            },
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' }
                        }
                    }}
                >
                    <ToggleButton value="ONE_WAY">One Way</ToggleButton>
                    <ToggleButton value="ROUND_TRIP">Round Trip</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Legs Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, ml: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>Trip Legs ({legs.length}/6)</Typography>
                <Button 
                    startIcon={<AutoAwesome />} 
                    size="small" 
                    onClick={handleSmartFill}
                    disabled={!selectedMember}
                    sx={{ color: '#14B8A6', fontWeight: 700 }}
                >
                    AI Smart Fill
                </Button>
            </Box>
            
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
                sx={{ 
                    height: 56, 
                    borderRadius: 3, 
                    bgcolor: '#14B8A6', 
                    fontWeight: 700, 
                    fontSize: '1rem',
                    mb: 2,
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)',
                    '&:hover': { bgcolor: '#0D9488' }
                }}
            >
                {createTripMutation.isPending ? 'Saving...' : 'Review & Sign Packets'}
            </Button>

            <Button
                fullWidth
                size="small"
                onClick={handleReset}
                sx={{ color: 'text.secondary', fontWeight: 600 }}
            >
                Reset Form
            </Button>

            {/* Add Member Dialog */}
            <Dialog open={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 800 }}>Add New Member</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField label="First Name *" fullWidth value={newMemberData.firstName} onChange={(e) => setNewMemberData(p => ({ ...p, firstName: e.target.value }))} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField label="Last Name *" fullWidth value={newMemberData.lastName} onChange={(e) => setNewMemberData(p => ({ ...p, lastName: e.target.value }))} />
                            </Grid>
                        </Grid>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField label="Member ID *" fullWidth value={newMemberData.memberId} onChange={(e) => setNewMemberData(p => ({ ...p, memberId: e.target.value }))} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField 
                                    label="Date of Birth *" 
                                    type="date" 
                                    fullWidth 
                                    InputLabelProps={{ shrink: true }}
                                    value={newMemberData.dateOfBirth} 
                                    onChange={(e) => setNewMemberData(p => ({ ...p, dateOfBirth: e.target.value }))} 
                                />
                            </Grid>
                        </Grid>

                        <TextField 
                            label="House Address (Pickup Default) *" 
                            fullWidth 
                            placeholder="Street, City, Zip"
                            value={newMemberData.address} 
                            onChange={(e) => {
                                const val = e.target.value;
                                setNewMemberData(p => ({ 
                                    ...p, 
                                    address: val,
                                    mailingAddress: p.mailingAddress === p.address ? val : p.mailingAddress
                                }));
                            }} 
                        />

                        <TextField 
                            label="Mailing Address" 
                            fullWidth 
                            placeholder="Street, City, Zip"
                            value={newMemberData.mailingAddress} 
                            onChange={(e) => setNewMemberData(p => ({ ...p, mailingAddress: e.target.value }))} 
                        />

                        <Autocomplete
                            freeSolo
                            options={REASONS_FOR_VISIT}
                            value={newMemberData.reasonForRide}
                            onInputChange={(_, v) => setNewMemberData(p => ({ ...p, reasonForRide: v }))}
                            renderInput={(p) => <TextField {...p} label="Default Reason for Ride" />}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Mobility Requirement</InputLabel>
                            <Select
                                value={newMemberData.mobilityRequirement}
                                label="Mobility Requirement"
                                onChange={(e) => setNewMemberData(p => ({ ...p, mobilityRequirement: e.target.value as MobilityRequirement }))}
                            >
                                <MenuItem value={MobilityRequirement.AMBULATORY}>Ambulatory</MenuItem>
                                <MenuItem value={MobilityRequirement.WHEELCHAIR}>Wheelchair</MenuItem>
                                <MenuItem value={MobilityRequirement.STRETCHER}>Stretcher</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setIsAddMemberOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={() => createMemberMutation.mutate(newMemberData)}
                        disabled={!newMemberData.firstName || !newMemberData.lastName || !newMemberData.memberId || !newMemberData.address}
                        sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}
                    >
                        {createMemberMutation.isPending ? 'Saving...' : 'Add Member'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
