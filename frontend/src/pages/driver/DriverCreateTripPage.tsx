import { useState } from 'react';
import { Box, Container, Typography, Card, Button, TextField, Grid, MenuItem, Stepper, Step, StepLabel, Alert } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { tripApi, CreateTripData } from '../../api/trips';
import { memberApi } from '../../api/members';
import { useAuthStore } from '../../store/auth';
import { ALL_TRIP_REASONS } from '../../constants/trip-reasons';

export default function DriverCreateTripPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        memberId: '',
        date: new Date().toISOString().split('T')[0],
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

    const createMutation = useMutation({
        mutationFn: async () => {
            if (!user?.id) throw new Error('User not found');

            const tripDate = new Date(`${formData.date}T${formData.time}`);
            
            // Driver creating trip -> Auto-assign to self
            // But we need the Driver ID, not just User ID. 
            // The backend trip creation expects assignedDriverId to be the USER ID of the driver (based on my audit of CreateTripPage).
            // Let's verify: CreateTripPage uses d.user.id. So yes, User ID.
            
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
                                {members?.map(m => (
                                    <MenuItem key={m.id} value={m.id}>
                                        {m.lastName}, {m.firstName}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                select
                                label="Reason for Visit"
                                fullWidth
                                value={formData.reasonForVisit}
                                onChange={(e) => setFormData({ ...formData, reasonForVisit: e.target.value })}
                            >
                                {ALL_TRIP_REASONS.map((reason) => (
                                    <MenuItem key={reason} value={reason}>
                                        {reason}
                                    </MenuItem>
                                ))}
                            </TextField>
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
        </Container>
    );
}
