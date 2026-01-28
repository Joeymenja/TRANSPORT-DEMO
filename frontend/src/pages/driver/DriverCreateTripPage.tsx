import { useState } from 'react';
import { Box, Container, Typography, Card, Button, TextField, Grid, MenuItem, Stepper, Step, StepLabel, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, FormControlLabel, Switch, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { MobileDatePicker, MobileTimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { tripApi, CreateTripData } from '../../api/trips';
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
        startNow: true, // Default to true per user feedback
        assignedDriverId: '',
    });

    const steps = ['Trip Details', 'Route & Schedule'];

    const { data: members } = useQuery({ queryKey: ['members'], queryFn: () => memberApi.getMembers() });
    const { data: drivers } = useQuery({ queryKey: ['drivers'], queryFn: () => driverApi.getDrivers(), enabled: user?.role === 'HOUSE_MANAGER' });

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
            

            let status = formData.startNow ? 'IN_PROGRESS' : 'PENDING_APPROVAL';
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
            } else if (user?.role === 'HOUSE_MANAGER') {
                 // Future booking for HM
                 status = 'SCHEDULED'; // Strict scheduling
                 assignedDriverId = undefined; // Auto-dispatch
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
                    { stopType: 'PICKUP', stopOrder: 1, address: formData.pickupAddress, scheduledTime: tripDate },
                    { stopType: 'DROPOFF', stopOrder: 2, address: formData.dropoffAddress, scheduledTime: new Date(tripDate.getTime() + 3600000) }
                ],
                status: status,
                startedAt,
                completedAt,
            };

            return tripApi.createTrip(tripData);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['driver-trips'] });
            if (formData.startNow && data.id) {
                navigate(`/driver/trips/${data.id}/execute`);
            } else {
                navigate('/driver/trips');
            }
        },
        onError: (err: any) => {
            alert('Failed to schedule trip: ' + err.message);
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
        <Container maxWidth="md" sx={{ py: 2, pb: 10 }}>
            <Button
                variant="text"
                onClick={() => navigate('/driver')}
                sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none', mb: 1 }}
            >
                Cancel
            </Button>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#1e293b' }}>New Trip Entry</Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 3 }} alternativeLabel>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel
                            sx={{
                                '& .MuiStepLabel-label': { fontSize: '0.8rem', fontWeight: 600 },
                            }}
                        >
                            {label}
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>

            {user?.role === 'HOUSE_MANAGER' && (
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <ToggleButtonGroup
                        color="primary"
                        value={bookingMode}
                        exclusive
                        onChange={(_, newMode) => newMode && setBookingMode(newMode)}
                        aria-label="Booking Mode"
                    >
                        <ToggleButton value="FUTURE">Book New Ride</ToggleButton>
                        <ToggleButton value="PAST">Log Past Trip</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            )}

            <Card sx={{ p: { xs: 2, md: 3 } }}>
                {activeStep === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box>
                            <Alert severity="info" sx={{ mb: 1, borderRadius: 2 }}>
                                {bookingMode === 'PAST'
                                    ? 'Log a completed trip for records.'
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
                        <Grid item xs={12} sm={6}>
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
                        <Grid item xs={12} sm={6}>
                            <MobileTimePicker
                                label="Time"
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
                            <Grid item xs={12} sm={6}>
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
                        <Grid item xs={12}>
                            <TextField
                                label="Pickup Address"
                                fullWidth
                                value={formData.pickupAddress}
                                onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Drop-off Address"
                                fullWidth
                                value={formData.dropoffAddress}
                                onChange={(e) => setFormData({ ...formData, dropoffAddress: e.target.value })}
                            />
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
                        {activeStep === steps.length - 1 ? (createMutation.isPending ? 'Processing...' : (bookingMode === 'PAST' ? 'Log Trip' : (formData.startNow ? 'Start Trip Now' : 'Schedule Trip'))) : 'Next'}
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
