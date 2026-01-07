import { useState } from 'react';
import { Box, Container, Typography, Card, Button, TextField, Grid, MenuItem, Stepper, Step, StepLabel, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { tripApi, CreateTripData } from '../../api/trips';
import { memberApi, MobilityRequirement } from '../../api/members';
import { useAuthStore } from '../../store/auth';
import { ALL_TRIP_REASONS } from '../../constants/trip-reasons';

export default function DriverCreateTripPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
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
        pickupAddress: '',
        dropoffAddress: '',
        tripType: 'DROP_OFF',
        reasonForVisit: '',
        escortName: '',
        escortRelationship: '',
    });

    const steps = ['Trip Details', 'Route & Schedule'];

    const { data: members } = useQuery({ queryKey: ['members'], queryFn: () => memberApi.getMembers() });

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
            
            const tripData: CreateTripData = {
                tripDate,
                tripType: formData.tripType as any,
                reasonForVisit: formData.reasonForVisit,
                escortName: formData.escortName,
                escortRelationship: formData.escortRelationship,
                assignedDriverId: user.id, 
                members: [{ memberId: formData.memberId }],
                stops: [
                    { stopType: 'PICKUP', stopOrder: 1, address: formData.pickupAddress, scheduledTime: tripDate },
                    { stopType: 'DROPOFF', stopOrder: 2, address: formData.dropoffAddress, scheduledTime: new Date(tripDate.getTime() + 3600000) }
                ]
            };

            return tripApi.createTrip(tripData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['driver-trips'] });
            navigate('/driver');
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
        <Container maxWidth="md" sx={{ py: 2 }}>
            <Button variant="text" onClick={() => navigate('/driver')}>
                Cancel
            </Button>
            <Typography variant="h5" sx={{ mb: 3, mt: 1 }}>New Trip Entry</Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Card sx={{ p: 3 }}>
                {activeStep === 0 && (
                    <Grid container spacing={3}>
                         <Grid item xs={12}>
                            <Alert severity="info" sx={{mb: 1}}>
                                This trip will be assigned to you ({user?.firstName}).
                            </Alert>
                        </Grid>
                        <Grid item xs={12}>
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
                        </Grid>
                        <Grid item xs={12}>
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
                        </Grid>
                        <Grid item xs={12}>
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
                        </Grid>
                    </Grid>
                )}

                {activeStep === 1 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Date"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Time"
                                type="time"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            />
                        </Grid>
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
                        {activeStep === steps.length - 1 ? (createMutation.isPending ? 'Scheduling...' : 'Schedule Trip') : 'Next'}
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
