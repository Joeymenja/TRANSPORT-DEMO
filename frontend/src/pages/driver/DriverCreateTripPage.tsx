import { useState } from 'react';
import { Box, Container, Typography, Card, Button, TextField, Grid, MenuItem, Stepper, Step, StepLabel, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, FormControlLabel, Switch, Tab, Tabs, Stack } from '@mui/material';
import { MobileDatePicker, MobileTimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { tripApi, CreateTripData } from '../../api/trips';
import { locationApi } from '../../api/locations';
import { memberApi, MobilityRequirement } from '../../api/members';
import { driverApi } from '../../api/drivers';
import { useAuthStore } from '../../store/auth';
import { ALL_TRIP_REASONS } from '../../constants/trip-reasons';

export default function DriverCreateTripPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const [bookingMode, setBookingMode] = useState<'FUTURE' | 'PAST'>('FUTURE');
    const [activeStep, setActiveStep] = useState(0);
    const [openMemberDialog, setOpenMemberDialog] = useState(false);
    
    // Member form state
    const [newMember, setNewMember] = useState({
        firstName: '',
        lastName: '',
        memberId: '', // insurance ID
        dateOfBirth: '',
    });
    const [memberError, setMemberError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        memberId: '',
        date: new Date().toLocaleDateString('en-CA'), // Use local date YYYY-MM-DD
        time: '09:00',
        endTime: '10:00',
        pickupAddress: '',
        dropoffAddress: '',
        tripType: 'DROP_OFF',
        reasonForVisit: '',
        escortName: '',
        escortRelationship: '',
        startNow: false, // Default to false per user feedback
        assignedDriverId: '',
        odometerStart: '',
        odometerEnd: '',
    });

    const steps = ['Trip Details', 'Route & Schedule'];

    const { data: members } = useQuery({ queryKey: ['members'], queryFn: () => memberApi.getMembers() });
    const { data: drivers } = useQuery({ queryKey: ['drivers'], queryFn: () => driverApi.getAll(), enabled: user?.role === 'HOUSE_MANAGER' });
    const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: () => locationApi.getAll() });

    const createMemberMutation = useMutation({
        mutationFn: async () => {
            return memberApi.createMember({
                firstName: newMember.firstName,
                lastName: newMember.lastName,
                memberId: newMember.memberId || `TEMP-${Date.now()}`,
                dateOfBirth: newMember.dateOfBirth, // Required field
                mobilityRequirement: MobilityRequirement.AMBULATORY,
            });
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            setFormData(prev => ({ ...prev, memberId: data.id }));
            setOpenMemberDialog(false);
            setMemberError(null);
        },
        onError: (err: any) => {
            console.error('Create member failed:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to create member';
            setMemberError(Array.isArray(msg) ? msg.join(', ') : msg);
        }
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            if (!user?.id) throw new Error('User not found');

            const tripDate = new Date(`${formData.date}T${formData.time}`);
            
            // Logic for status and startNow
            let status = 'PENDING_APPROVAL';
            let assignedDriverId = user?.role === 'DRIVER' ? user.id : undefined;
            let startedAt, completedAt;

            if (bookingMode === 'PAST') {
                 status = 'COMPLETED';
                 startedAt = tripDate;
                 // Calculate end date (handle overnight if needed, here simplified)
                 const endDate = new Date(`${formData.date}T${formData.endTime}`);
                 if (endDate < tripDate) endDate.setDate(endDate.getDate() + 1);
                 completedAt = endDate;
                 
                 // Required driver for past trip logging
                 if (user?.role === 'HOUSE_MANAGER') {
                     assignedDriverId = formData.assignedDriverId || undefined; 
                 }
            } else {
                // FUTURE Booking
                if (user?.role === 'HOUSE_MANAGER') {
                     status = 'SCHEDULED'; // Strict scheduling
                     assignedDriverId = undefined; // Auto-dispatch
                } else if (formData.startNow) {
                    status = 'IN_PROGRESS';
                }
            }
            
            const tripData: CreateTripData = {
                tripDate,
                tripType: formData.tripType as any,
                reasonForVisit: formData.reasonForVisit,
                escortName: formData.escortName,
                escortRelationship: formData.escortRelationship,
                assignedDriverId,
                members: [{ memberId: formData.memberId }],
                stops: [
                    { 
                        stopType: 'PICKUP', 
                        stopOrder: 1, 
                        address: formData.pickupAddress, 
                        scheduledTime: tripDate,
                        odometerReading: bookingMode === 'PAST' && formData.odometerStart ? parseFloat(formData.odometerStart) : undefined
                    },
                    { 
                        stopType: 'DROPOFF', 
                        stopOrder: 2, 
                        address: formData.dropoffAddress, 
                        scheduledTime: new Date(tripDate.getTime() + 3600000),
                        odometerReading: bookingMode === 'PAST' && formData.odometerEnd ? parseFloat(formData.odometerEnd) : undefined
                    }
                ],
                status: status,
                startedAt,
                completedAt,
            };

            return tripApi.createTrip(tripData);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['driver-trips'] });
            
            if (bookingMode === 'PAST' && data.id) {
                 navigate(`/driver/report/${data.id}`, { state: { returnPath: '/driver/trips' } });
            } else if (bookingMode === 'FUTURE' && formData.startNow && data.id) {
                // Only navigate to execute if it's a future trip starting NOW
                navigate(`/driver/trips/${data.id}/execute`);
            } else {
                // Otherwise go to the details page so they can see it and optionally start it
                navigate(`/driver/trips/${data.id}`);
            }
        },
        onError: (err: any) => {
            alert('Failed to save trip: ' + err.message);
        }
    });

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            createMutation.mutate();
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleMemberChange = (memberId: string) => {
        if (memberId === 'NEW') {
            setOpenMemberDialog(true);
            return;
        }
        const member = members?.find(m => m.id === memberId);
        setFormData(prev => ({
            ...prev,
            memberId,
            pickupAddress: member?.address || prev.pickupAddress,
        }));
    };

    return (
        <Container maxWidth="xl" sx={{ py: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Button variant="text" onClick={() => navigate('/driver')}>
                    Cancel
                </Button>
            </Box>
            
            {user?.role === 'HOUSE_MANAGER' && (
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs 
                        value={bookingMode} 
                        onChange={(_, val) => setBookingMode(val)} 
                        aria-label="trip booking mode"
                        variant="fullWidth"
                    >
                        <Tab label="Book a Ride" value="FUTURE" />
                        <Tab label="Log Past Trip" value="PAST" />
                    </Tabs>
                </Box>
            )}

            <Typography variant="h5" sx={{ mb: 3 }}>
                {bookingMode === 'PAST' ? 'Log Past Trip Entry' : 'Book a New Ride'}
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Card sx={{ p: { xs: 2, md: 3 }, border: 1, borderColor: bookingMode === 'PAST' ? 'warning.main' : 'primary.main', boxShadow: 3 }}>
                {activeStep === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                            <Typography variant="h6" color={bookingMode === 'PAST' ? 'warning.main' : 'primary.main'} fontWeight="bold">
                                {bookingMode === 'PAST' ? '📝 Trip Details (Past)' : 'Trip Details'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {bookingMode === 'PAST' 
                                    ? 'Record details of a trip that has already been completed.' 
                                    : 'Schedule a new transportation request for upcoming travel.'}
                            </Typography>
                         </Box>
                         
                         <Box>
                            <Alert severity={bookingMode === 'PAST' ? 'warning' : 'info'} sx={{mb: 1}}>
                                {bookingMode === 'PAST' 
                                    ? 'Log a completed trip for records. This will not dispatch a driver.'
                                    : (user?.role === 'DRIVER' 
                                        ? `This trip will be assigned to you (${user?.firstName}).`
                                        : 'This trip will be automatically dispatched to an available driver.')
                                }
                            </Alert>
                        </Box>
                        <TextField
                            select
                            label="Select Member"
                            fullWidth
                            value={formData.memberId}
                            onChange={(e) => handleMemberChange(e.target.value)}
                        >
                            <MenuItem value="NEW" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                + Create New Member
                            </MenuItem>
                            {members?.map(m => (
                                <MenuItem key={m.id} value={m.id}>
                                    {m.lastName}, {m.firstName}
                                </MenuItem>
                            ))}
                        </TextField>

                        {bookingMode === 'PAST' && user?.role === 'HOUSE_MANAGER' && (
                             <TextField
                                select
                                label="Select Driver (Who drove?)"
                                fullWidth
                                value={formData.assignedDriverId}
                                onChange={(e) => setFormData({ ...formData, assignedDriverId: e.target.value })}
                            >
                                {drivers?.map(d => (
                                    <MenuItem key={d.id} value={d.id}>
                                        {d.user?.lastName}, {d.user?.firstName} ({d.assignedVehicle?.vehicleNumber || 'No Vehicle'})
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}

                         <Autocomplete
                            freeSolo
                            options={ALL_TRIP_REASONS}
                            value={formData.reasonForVisit}
                            onChange={(_, newValue) => setFormData({ ...formData, reasonForVisit: newValue || '' })}
                            onInputChange={(_, newInputValue) => setFormData({ ...formData, reasonForVisit: newInputValue })}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Reason for Visit"
                                    placeholder="Select or type..."
                                    fullWidth
                                />
                            )}
                        />

                         <TextField
                            select
                            label="Trip Type"
                            fullWidth
                            value={formData.tripType}
                            onChange={(e) => setFormData({ ...formData, tripType: e.target.value })}
                        >
                            <MenuItem value="PICK_UP">Pick Up</MenuItem>
                            <MenuItem value="DROP_OFF">Drop Off</MenuItem>
                        </TextField>
                    </Box>
                )}

                {activeStep === 1 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={bookingMode === 'PAST' ? 2 : 6}>
                            <MobileDatePicker
                                label="Date"
                                value={new Date(formData.date + 'T00:00:00')}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        setFormData({ ...formData, date: format(newValue, 'yyyy-MM-dd') });
                                    }
                                }}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={bookingMode === 'PAST' ? 2 : 6}>
                            <MobileTimePicker
                                label={bookingMode === 'PAST' ? "Start Time" : "Time"}
                                value={new Date(`2000-01-01T${formData.time}`)}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        setFormData({ ...formData, time: format(newValue, 'HH:mm') });
                                    }
                                }}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Grid>
                        {bookingMode === 'PAST' && (
                            <Grid item xs={12} sm={6} md={2}>
                                <MobileTimePicker
                                    label="End Time"
                                    value={new Date(`2000-01-01T${formData.endTime}`)}
                                    onChange={(newValue) => {
                                        if (newValue) {
                                            setFormData({ ...formData, endTime: format(newValue, 'HH:mm') });
                                        }
                                    }}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </Grid>
                        )}
                        
                        {bookingMode === 'PAST' && (
                            <>
                                <Grid item xs={6} md={3}>
                                    <TextField
                                        label="Odometer Start"
                                        type="number"
                                        fullWidth
                                        value={formData.odometerStart}
                                        onChange={(e) => setFormData({ ...formData, odometerStart: e.target.value })}
                                        InputProps={{ inputProps: { min: 0 } }}
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <TextField
                                        label="Odometer End"
                                        type="number"
                                        fullWidth
                                        value={formData.odometerEnd}
                                        onChange={(e) => setFormData({ ...formData, odometerEnd: e.target.value })}
                                        InputProps={{ inputProps: { min: 0 } }}
                                    />
                                </Grid>
                            </>
                        )}
                        {/* Address Section - Enforce Block Layout */}
                        <Grid item xs={12}>
                             <Card variant="outlined" sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold', mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Trip Locations
                                </Typography>
                                
                                <Stack spacing={2}>
                                    <Box sx={{ width: '100%' }}>
                                        <Autocomplete
                                            fullWidth
                                            freeSolo
                                            options={locations || []}
                                            getOptionLabel={(option) => typeof option === 'string' ? option : `${option.name} (${option.address})`}
                                            value={formData.pickupAddress}
                                            onChange={(_, newValue) => {
                                                if (typeof newValue === 'string') {
                                                    setFormData({ ...formData, pickupAddress: newValue });
                                                } else if (newValue) {
                                                    setFormData({ ...formData, pickupAddress: newValue.address });
                                                }
                                            }}
                                            onInputChange={(_, newInputValue) => {
                                                setFormData(prev => ({ ...prev, pickupAddress: newInputValue }))
                                            }}
                                            renderInput={(params) => (
                                                <TextField 
                                                    {...params} 
                                                    label="Pickup Address" 
                                                    placeholder="Enter pickup location..." 
                                                    fullWidth 
                                                    variant="outlined" 
                                                    InputProps={{ ...params.InputProps, sx: { bgcolor: 'white' } }}
                                                />
                                            )}
                                        />
                                    </Box>
                                    <Box sx={{ width: '100%' }}>
                                         <Autocomplete
                                            fullWidth
                                            freeSolo
                                            options={locations || []}
                                            getOptionLabel={(option) => typeof option === 'string' ? option : `${option.name} (${option.address})`}
                                            value={formData.dropoffAddress}
                                            onChange={(_, newValue) => {
                                                if (typeof newValue === 'string') {
                                                    setFormData({ ...formData, dropoffAddress: newValue });
                                                } else if (newValue) {
                                                    setFormData({ ...formData, dropoffAddress: newValue.address });
                                                }
                                            }}
                                            onInputChange={(_, newInputValue) => {
                                                setFormData(prev => ({ ...prev, dropoffAddress: newInputValue }))
                                            }}
                                            renderInput={(params) => (
                                                <TextField 
                                                    {...params} 
                                                    label="Drop-off Address" 
                                                    placeholder="Enter destination..." 
                                                    fullWidth 
                                                    variant="outlined" 
                                                    InputProps={{ ...params.InputProps, sx: { bgcolor: 'white' } }}
                                                />
                                            )}
                                        />
                                    </Box>
                                </Stack>
                             </Card>
                        </Grid>

                        {bookingMode === 'FUTURE' && user?.role === 'DRIVER' && (
                             <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.startNow}
                                            onChange={(e) => setFormData({ ...formData, startNow: e.target.checked })}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body1" fontWeight={500}>Start Trip Immediately</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Trip will be created and properly started immediately.
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </Grid>
                        )}
                    </Grid>
                )}

                <Box display="flex" justifyContent="space-between" mt={4}>
                    <Button disabled={activeStep === 0} onClick={handleBack}>
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={activeStep === 0 && !formData.memberId}
                    >

                        {activeStep === steps.length - 1 ? (createMutation.isPending ? 'Processing...' : (bookingMode === 'PAST' ? 'Log Trip' : (formData.startNow ? 'Start Trip Now' : 'Book Ride'))) : 'Next'}
                    </Button>
                </Box>
            </Card>

            <Dialog open={openMemberDialog} onClose={() => setOpenMemberDialog(false)}>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogContent>
                    {memberError && (
                        <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
                            {memberError}
                        </Alert>
                    )}
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="First Name"
                                fullWidth
                                value={newMember.firstName}
                                onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Last Name"
                                fullWidth
                                value={newMember.lastName}
                                onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Date of Birth"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={newMember.dateOfBirth}
                                onChange={(e) => setNewMember({ ...newMember, dateOfBirth: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Member ID / Insurance ID"
                                fullWidth
                                value={newMember.memberId}
                                onChange={(e) => setNewMember({ ...newMember, memberId: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenMemberDialog(false)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={() => createMemberMutation.mutate()}
                        disabled={!newMember.firstName || !newMember.lastName || !newMember.dateOfBirth || createMemberMutation.isPending}
                    >
                        {createMemberMutation.isPending ? 'Saving...' : 'Save & Select'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
