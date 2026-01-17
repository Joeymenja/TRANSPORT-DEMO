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
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberApi, MobilityRequirement } from '../../api/members';
import { tripApi } from '../../api/trips';
import { vehicleApi } from '../../api/vehicles';
import { useAuthStore } from '../../store/auth';
import { format, addMinutes, parse, addDays } from 'date-fns';
import { 
    ArrowBack, 
    CalendarMonth, 
    PersonAdd, 
    LocationOn, 
    AddCircleOutline, 
    DeleteOutline, 
    ExpandMore, 
    ExpandLess,
    Route,
    CheckCircle
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
    reasonForVisit: string;
    isExpanded: boolean;
}

export default function ScheduleTripPage() {
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const queryClient = useQueryClient();

    const [selectedMember, setSelectedMember] = useState<any>(null);
    
    // Parse date from URL query param if present
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialDate = queryParams.get('date') ? new Date(queryParams.get('date')!) : addDays(new Date(), 1);
    const editTripId = queryParams.get('edit');

    const [date, setDate] = useState<Date | null>(initialDate);
    const [tripType, setTripType] = useState<'ONE_WAY' | 'ROUND_TRIP'>('ROUND_TRIP');

    // Fetch existing trips to check for optimization/carpooling
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
    const { data: existingTrips = [] } = useQuery({
        queryKey: ['trips-schedule-check', formattedDate],
        queryFn: () => tripApi.getTrips({ date: formattedDate }),
        enabled: !!formattedDate
    });

    // Multi-leg state
    const [legs, setLegs] = useState<TripLeg[]>([
        { 
            pickupAddress: '', 
            dropoffAddress: '', 
            pickupTime: '09:00', 
            dropoffTime: '09:45', 
            reasonForVisit: 'Behavioral Health / Counseling',
            isExpanded: true
        },
        // Default 2nd leg for Round Trip
        { 
            pickupAddress: '', 
            dropoffAddress: '', 
            pickupTime: '11:00', 
            dropoffTime: '11:45', 
            reasonForVisit: 'Behavioral Health / Counseling',
            isExpanded: false 
        }
    ]);

    // Fetch Trip Details for Editing
    const { data: tripToEdit } = useQuery({
        queryKey: ['trip-to-edit', editTripId],
        queryFn: () => tripApi.getTripById(editTripId!),
        enabled: !!editTripId,
    });

    // Populate Form when Editing
    useEffect(() => {
        if (tripToEdit) {
            setDate(new Date(tripToEdit.tripDate));
            setTripType(tripToEdit.tripType === 'ONE_WAY' ? 'ONE_WAY' : 'ROUND_TRIP'); // Simplified mapping
            if (tripToEdit.members && tripToEdit.members[0]) {
                const tm = tripToEdit.members[0].member;
                setSelectedMember(tm);
            }
            
            if (tripToEdit.stops && tripToEdit.stops.length > 0) {
                 // Reconstruct legs from stops
                 // Stops are flat: 1 (pickup), 2 (dropoff), 3 (pickup), 4 (dropoff)
                 const newLegs: TripLeg[] = [];
                 const sortedStops = [...tripToEdit.stops].sort((a,b) => a.stopOrder - b.stopOrder);
                 
                 for (let i = 0; i < sortedStops.length; i += 2) {
                     const pickup = sortedStops[i];
                     const dropoff = sortedStops[i+1];
                     if (pickup && dropoff) {
                         newLegs.push({
                             pickupAddress: pickup.address,
                             dropoffAddress: dropoff.address,
                             pickupTime: format(new Date(pickup.scheduledTime), 'HH:mm'),
                             dropoffTime: format(new Date(dropoff.scheduledTime), 'HH:mm'),
                             reasonForVisit: tripToEdit.reasonForVisit || '',
                             isExpanded: i === 0 // Expand first only
                         });
                     }
                 }
                 setLegs(newLegs);
            }
        }
    }, [tripToEdit]);

    // Smart Optimization Logic
    const getCarpoolSuggestions = () => {
        if (!legs[0].pickupTime) return [];
        const selectedTimeMinutes = parseInt(legs[0].pickupTime.split(':')[0]) * 60 + parseInt(legs[0].pickupTime.split(':')[1]);
        
        return existingTrips.filter((t: any) => {
            if (!t.stops || !t.stops[0]) return false;
            const tripTime = new Date(t.stops[0].scheduledTime);
            const tripMinutes = tripTime.getHours() * 60 + tripTime.getMinutes();
            // Check if within 45 mins
            return Math.abs(tripMinutes - selectedTimeMinutes) < 45;
        });
    };
    
    const carpoolCandidates = getCarpoolSuggestions();

    // Handle Trip Type Toggle
    const handleTripTypeChange = (type: 'ONE_WAY' | 'ROUND_TRIP') => {
        setTripType(type);
        if (type === 'ONE_WAY') {
            setLegs([legs[0]]);
        } else {
            // Restore or create 2nd leg
            if (legs.length < 2) {
                const l1 = legs[0];
                setLegs([
                    l1, 
                    {
                        pickupAddress: l1.dropoffAddress,
                        dropoffAddress: l1.pickupAddress,
                        pickupTime: format(addMinutes(parse(l1.pickupTime, 'HH:mm', new Date()), 90), 'HH:mm'), // Default return 1.5hr later
                        dropoffTime: format(addMinutes(parse(l1.pickupTime, 'HH:mm', new Date()), 135), 'HH:mm'),
                        reasonForVisit: l1.reasonForVisit,
                        isExpanded: true
                    }
                ]);
            }
        }
    };

    // Auto-update Leg 2 if Round Trip matches
    useEffect(() => {
        if (tripType === 'ROUND_TRIP' && legs.length >= 2 && !editTripId) { // Don't auto-update if editing to avoid overwriting existing data
            // If leg 1 changes, encourage leg 2 to reverse it (unless user edited leg 2 manually? logic is complex, keep simple)
            // For now, let's just create a helper to "Swap Return"
        }
    }, [legs[0].pickupAddress, legs[0].dropoffAddress]);

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
        reasonForVisit: '',
        specialNotes: '',
        mobilityRequirement: MobilityRequirement.AMBULATORY
    });

    const { data: members = [], isLoading: loadingMembers } = useQuery({
        queryKey: ['members'],
        queryFn: memberApi.getMembers
    });

    // Removed Vehicle Query

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [createdTripDetails, setCreatedTripDetails] = useState<any>(null);

    // ... existing mutation ...
    const createTripMutation = useMutation({
        // ... mutationFn ...
        mutationFn: async () => {
             // ... existing logic ...
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
                });
                stops.push({
                    stopType: 'DROPOFF',
                    stopOrder: (index * 2) + 2,
                    address: leg.dropoffAddress,
                    scheduledTime: new Date(`${format(date || new Date(), 'yyyy-MM-dd')}T${leg.dropoffTime}:00`),
                });
            });

            const tripPayload: any = {
                tripDate: date || new Date(),
                assignedDriverId: user.id,
                // assignedVehicleId: null, // Removed vehicle requirement
                status: 'SCHEDULED', // Future trip
                tripType: legs.length > 2 ? 'MULTIPLE_STOPS' : (legs.length === 2 ? 'ROUND_TRIP' : 'ONE_WAY'),
                reasonForVisit: legs[0].reasonForVisit, // Primary reason
                members: [{ memberId: selectedMember.id }],
                mobilityRequirement: selectedMember.mobilityRequirement || 'AMBULATORY',
                stops: stops
            };

            // IF EDITING, call updateTrip instead
            if (editTripId) {
                // We need to pass the ID and the payload
                // Assuming updateTrip takes (id, payload)
                 // Note: We might need to handle Stop IDs if we want to update existing stops, 
                 // but often replacing stops is easier. 'tripApi.updateTrip' usually expects full payload.
                 // Let's assume for now we just send the payload.
                 // However, updateTrip might change status if not careful.
                 return await tripApi.updateTrip(editTripId, tripPayload);
            }

            return await tripApi.createTrip(tripPayload);
        },
        onSuccess: (newTrip) => {
            queryClient.invalidateQueries({ queryKey: ['driver-trips'] });
            queryClient.invalidateQueries({ queryKey: ['trip', editTripId] });
            setCreatedTripDetails(newTrip);
            setShowConfirmation(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        onError: (err: any) => {
            // ... existing validation error handling
            console.error('Failed to create/update trip:', err);
            const msg = err.response?.data?.message;
            if (Array.isArray(msg)) {
                setError(`Validation Errors: ${msg.join(', ')}`);
            } else {
                setError(msg || err.message || 'Failed to create trip record');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    const handleAddLeg = () => {
        if (legs.length >= 6) return;
        
        const lastLeg = legs[legs.length - 1];
        setLegs([...legs.map(l => ({ ...l, isExpanded: false })), {
            pickupAddress: lastLeg.dropoffAddress, // Default next pickup to previous dropoff
            dropoffAddress: '',
            pickupTime: lastLeg.dropoffTime,
            dropoffTime: format(addMinutes(parse(lastLeg.dropoffTime, 'HH:mm', new Date()), 45), 'HH:mm'),
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

    const handleCreate = () => {
        setError(''); // Clear previous errors
        if (!selectedMember) {
            setError('Please search for and select a member first');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        const invalidLeg = legs.find(l => !l.pickupAddress || !l.dropoffAddress);
        if (invalidLeg) {
            setError('All legs must have pickup/dropoff addresses');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        createTripMutation.mutate();
    };

    // Member Creation Mutation
    const createMemberMutation = useMutation({
        mutationFn: (data: any) => memberApi.createMember(data),
        onSuccess: (newMember) => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            setSelectedMember(newMember);
            
            // Auto-populate Leg 1 from New Member data
            if (newMember.address) {
                updateLeg(0, { 
                    pickupAddress: newMember.address,
                    ...(newMember.reasonForVisit ? { reasonForVisit: newMember.reasonForVisit } : {}) // Also set reason if provided
                });
            } else if (newMember.reasonForVisit) {
                 updateLeg(0, { reasonForVisit: newMember.reasonForVisit });
            }

            setIsAddMemberOpen(false);
        },
        onError: (err: any) => {
            alert(`Failed to create member: ${err.message}`);
        }
    });

    const handleSaveNewMember = () => {
        if (!newMemberData.firstName || !newMemberData.lastName || !newMemberData.memberId || !newMemberData.dateOfBirth) {
            alert('Please fill in all required fields (Name, ID, DOB)');
            return;
        }
        createMemberMutation.mutate({
            ...newMemberData,
            // Pass the reasonForVisit so it can be saved if the backend supports it, 
            // but primarily we use it in the onSuccess callback for the UI.
        });
    };

    // Moved Loading Check to here to avoid Hook errors
    if (isAuthenticated && !user) {
         return (
             <Container sx={{ py: 10, textAlign: 'center' }}>
                 <CircularProgress />
                 <Typography sx={{ mt: 2 }}>Loading driver profile...</Typography>
             </Container>
         );
    }
    
    if (showConfirmation) {
        return (
             <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
                <Paper sx={{ p: 4, borderRadius: 4, width: '100%', border: '1px solid #bbf7d0', bgcolor: '#f0fdf4' }}>
                    <Box sx={{ width: 80, height: 80, bgcolor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                        <CheckCircle sx={{ fontSize: 48, color: '#166534' }} />
                    </Box>
                    <Typography variant="h4" fontWeight={900} color="#166534" gutterBottom>
                        {editTripId ? 'Trip Updated!' : 'Trip Scheduled!'}
                    </Typography>
                    <Typography variant="body1" color="#15803d" sx={{ mb: 4 }}>
                        The trip has been successfully {editTripId ? 'updated' : 'added to the schedule'}.
                    </Typography>

                    <Box sx={{ textAlign: 'left', bgcolor: 'white', p: 3, borderRadius: 3, mb: 4, border: '1px solid #e0e0e0' }}>
                        <Typography variant="overline" color="text.secondary" fontWeight={700}>PASSENGER</Typography>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            {selectedMember?.firstName} {selectedMember?.lastName}
                        </Typography>
                        
                        <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mt: 2, display: 'block' }}>DATE & TIME</Typography>
                        <Typography variant="body1" fontWeight={600}>
                            {date ? format(date, 'EEEE, MMMM do, yyyy') : 'Date not set'}
                        </Typography>

                        <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mt: 2, display: 'block' }}>ITINERARY</Typography>
                        {legs.map((leg, i) => (
                            <Box key={i} sx={{ mb: 1.5, pl: 2, borderLeft: '3px solid #0096D6' }}>
                                <Typography variant="caption" color="primary" fontWeight={700}>LEG {i+1} • {leg.pickupTime}</Typography>
                                <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
                                    {leg.pickupAddress.split(',')[0]} <span style={{ color: '#9ca3af' }}>to</span> {leg.dropoffAddress.split(',')[0]}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {editTripId && (
                         <Button 
                            variant="contained" 
                            fullWidth 
                            size="large"
                            onClick={() => navigate(`/driver/trips/${editTripId}`)}
                             sx={{ borderRadius: 3, height: 50, fontWeight: 600, mb: 2 }}
                        >
                            View Trip Details
                        </Button>
                    )}

                    <Button 
                        variant={editTripId ? "outlined" : "contained"} 
                        fullWidth 
                        size="large" 
                        onClick={() => {
                            setShowConfirmation(false);
                            setCreatedTripDetails(null);
                            // Reset legs but keep date? Or reset everything? User might want to schedule another for same day.
                            // Let's keep date, reset member.
                            setSelectedMember(null);
                            setLegs([{ 
                                pickupAddress: '', 
                                dropoffAddress: '', 
                                pickupTime: '09:00', 
                                dropoffTime: '09:45', 
                                reasonForVisit: 'Behavioral Health / Counseling',
                                isExpanded: true
                            }]);
                            // Clear edit param if any
                            navigate(`/driver/schedule-new?date=${format(date || new Date(), 'yyyy-MM-dd')}`);
                        }}
                        sx={{ mb: 2, borderRadius: 3, height: 50, fontWeight: 700 }}
                    >
                        Schedule Another Trip
                    </Button>
                    <Button 
                        variant="text" 
                        fullWidth 
                        size="large"
                        onClick={() => navigate('/driver')}
                         sx={{ borderRadius: 3, height: 50, fontWeight: 600 }}
                    >
                        Back to Dashboard
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: 4, pb: 12 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/driver')} sx={{ mb: 2 }}>Back</Button>

            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <CalendarMonth sx={{ fontSize: 48, color: '#007aff', mb: 1 }} />
                <Typography variant="h5" fontWeight={800}>Schedule Future Trip</Typography>
                <Typography variant="body2" color="text.secondary">Plan a trip for an upcoming date.</Typography>
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
                    renderInput={(p) => <TextField {...p} label="Member *" placeholder="Search or Type Name to Add New" sx={{ mb: 2 }} />}
                />

                <DatePicker
                    label="Service Date"
                    value={date}
                    onChange={(newValue) => setDate(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                />
            </Paper>

            {/* Trip Type Selector */}
             <Box sx={{ mb: 3 }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 1, ml: 1, display: 'block' }}>TRIP TYPE</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Paper 
                            sx={{ 
                                p: 2, 
                                textAlign: 'center', 
                                border: tripType === 'ONE_WAY' ? '2px solid #0096D6' : '1px solid #e0e0e0',
                                bgcolor: tripType === 'ONE_WAY' ? '#E3F2FD' : 'white',
                                borderRadius: 3,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onClick={() => handleTripTypeChange('ONE_WAY')}
                        >
                            <Typography variant="subtitle2" fontWeight={700} color={tripType === 'ONE_WAY' ? 'primary' : 'text.primary'}>One Way →</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper 
                            sx={{ 
                                p: 2, 
                                textAlign: 'center', 
                                border: tripType === 'ROUND_TRIP' ? '2px solid #0096D6' : '1px solid #e0e0e0',
                                bgcolor: tripType === 'ROUND_TRIP' ? '#E3F2FD' : 'white',
                                borderRadius: 3,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onClick={() => handleTripTypeChange('ROUND_TRIP')}
                        >
                            <Typography variant="subtitle2" fontWeight={700} color={tripType === 'ROUND_TRIP' ? 'primary' : 'text.primary'}>Round Trip ⇄</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* Smart Optimization Alert */}
            {carpoolCandidates.length > 0 && (
                <Card sx={{ mb: 3, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                        <Box sx={{ bgcolor: '#dcfce7', p: 1, borderRadius: '50%', color: '#166534' }}>
                            <PersonAdd fontSize="small" />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} color="#166534">Carpool Optimization Detected</Typography>
                            <Typography variant="body2" color="#15803d" sx={{ mb: 1 }}>
                                {carpoolCandidates.length} other trip(s) scheduled around this time. Consider combining.
                            </Typography>
                            {carpoolCandidates.slice(0, 2).map((t: any) => (
                                <Box key={t.id} sx={{ bgcolor: 'white', p: 1, borderRadius: 2, mb: 0.5, border: '1px solid #dcfce7' }}>
                                    <Typography variant="caption" fontWeight={600} display="block">
                                        {format(new Date(t.stops[0].scheduledTime), 'h:mm a')} • {t.members?.[0]?.member?.firstName} {t.members?.[0]?.member?.lastName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {t.stops[0].address}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            )}

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
                                options={[
                                    ...(selectedMember?.address ? [{ name: 'Member Home', address: selectedMember.address, category: 'MEMBER' }] : []),
                                    ...COMMON_LOCATIONS
                                ]}
                                getOptionLabel={(o: any) => typeof o === 'string' ? o : `${o.name} (${o.address})`}
                                value={leg.pickupAddress}
                                onInputChange={(_, v) => updateLeg(index, { pickupAddress: v })}
                                onChange={(_, v: any) => {
                                    if (v && typeof v === 'object') {
                                        updateLeg(index, { pickupAddress: `${v.name} (${v.address})` });
                                    }
                                }}
                                renderInput={(p) => <TextField {...p} label="Pickup Address" placeholder="Select from preloaded houses or type..." sx={{ mb: 2 }} />}
                            />

                            <Autocomplete
                                freeSolo
                                options={[
                                    ...(selectedMember?.address ? [{ name: 'Member Home', address: selectedMember.address, category: 'MEMBER' }] : []),
                                    ...COMMON_LOCATIONS
                                ]}
                                getOptionLabel={(o: any) => typeof o === 'string' ? o : `${o.name} (${o.address})`}
                                value={leg.dropoffAddress}
                                onInputChange={(_, v) => updateLeg(index, { dropoffAddress: v })}
                                onChange={(_, v: any) => {
                                    if (v && typeof v === 'object') {
                                        updateLeg(index, { dropoffAddress: `${v.name} (${v.address})` });
                                    }
                                }}
                                renderInput={(p) => <TextField {...p} label="Dropoff Address" placeholder="Select from preloaded houses or type..." sx={{ mb: 2 }} />}
                            />

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
                sx={{ height: 60, borderRadius: 4, bgcolor: '#007aff', fontWeight: 800, fontSize: '1.1rem' }}
            >
                {createTripMutation.isPending ? 'Scheduling...' : 'Schedule Trip'}
            </Button>

            {/* Add Member Dialog - Reusable */}
            <Dialog open={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Add New Member</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField label="First Name" fullWidth value={newMemberData.firstName} onChange={(e) => setNewMemberData(p => ({ ...p, firstName: e.target.value }))} />
                        <TextField label="Last Name" fullWidth value={newMemberData.lastName} onChange={(e) => setNewMemberData(p => ({ ...p, lastName: e.target.value }))} />
                        <TextField label="Member ID (AHCCCS)" fullWidth value={newMemberData.memberId} onChange={(e) => setNewMemberData(p => ({ ...p, memberId: e.target.value }))} />
                        <TextField 
                            label="Date of Birth" 
                            type="date" 
                            fullWidth 
                            InputLabelProps={{ shrink: true }} 
                            value={newMemberData.dateOfBirth} 
                            onChange={(e) => setNewMemberData(p => ({ ...p, dateOfBirth: e.target.value }))} 
                        />
                        <TextField 
                            label="Mailing / House Address" 
                            fullWidth 
                            multiline 
                            rows={2} 
                            placeholder="Usually the house manager's working location"
                            value={newMemberData.address} 
                            onChange={(e) => setNewMemberData(p => ({ ...p, address: e.target.value }))} 
                        />
                         <Autocomplete
                            freeSolo
                            options={REASONS_FOR_VISIT}
                            value={newMemberData.reasonForVisit || ''}
                            onInputChange={(_, v) => setNewMemberData(p => ({ ...p, reasonForVisit: v }))}
                            renderInput={(p) => <TextField {...p} label="Default Reason for Appointment" placeholder="e.g. Behavioral Health" />}
                        />
                        <TextField 
                            label="Special Notes / Mobility" 
                            fullWidth 
                            multiline 
                            rows={2}
                            value={newMemberData.specialNotes}
                            onChange={(e) => setNewMemberData(p => ({ ...p, specialNotes: e.target.value }))} 
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setIsAddMemberOpen(false)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSaveNewMember}
                        disabled={createMemberMutation.isPending}
                    >
                        {createMemberMutation.isPending ? 'Saving...' : 'Save & Select'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
