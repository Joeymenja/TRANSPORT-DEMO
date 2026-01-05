import { useState } from 'react';
import { Box, Container, Typography, Card, Button, TextField, Grid, MenuItem, Stepper, Step, StepLabel, Checkbox, FormControlLabel, Alert } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { tripApi, CreateTripData } from '../api/trips';
import { driverApi } from '../api/drivers';
import { memberApi } from '../api/members';
import { vehicleApi } from '../api/vehicles';

export default function CreateTripPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        memberId: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        pickupAddress: '',
        dropoffAddress: '',
        tripType: 'DROP_OFF',
        isRoundTrip: false,
        returnTime: '12:00',
        reasonForVisit: '',
        escortName: '',
        escortRelationship: '',
        driverId: '',
        vehicleId: '',
    });

    const steps = ['Trip Details', 'Route & Schedule', 'Assignment'];

    const { data: members } = useQuery({ queryKey: ['members'], queryFn: () => memberApi.getMembers() });
    const { data: drivers } = useQuery({ queryKey: ['drivers'], queryFn: () => driverApi.getAll() });
    const { data: vehicles } = useQuery({ queryKey: ['vehicles'], queryFn: () => vehicleApi.getAll() });

    const createMutation = useMutation({
        mutationFn: async () => {
            const tripDate = new Date(`${formData.date}T${formData.time}`);

            const outboundTrip: CreateTripData = {
                tripDate,
                tripType: formData.tripType as any,
                reasonForVisit: formData.reasonForVisit,
                escortName: formData.escortName,
                escortRelationship: formData.escortRelationship,
                assignedDriverId: formData.driverId || undefined,
                assignedVehicleId: formData.vehicleId || undefined,
                members: [{ memberId: formData.memberId }],
                stops: [
                    { stopType: 'PICKUP', stopOrder: 1, address: formData.pickupAddress, scheduledTime: tripDate },
                    { stopType: 'DROPOFF', stopOrder: 2, address: formData.dropoffAddress, scheduledTime: new Date(tripDate.getTime() + 3600000) }
                ]
            };

            if (formData.isRoundTrip) {
                const returnDate = new Date(`${formData.date}T${formData.returnTime}`);
                const returnTrip: CreateTripData = {
                    ...outboundTrip,
                    tripDate: returnDate,
                    tripType: 'PICK_UP', // Usually return is a pick up from facility
                    stops: [
                        { stopType: 'PICKUP', stopOrder: 1, address: formData.dropoffAddress, scheduledTime: returnDate },
                        { stopType: 'DROPOFF', stopOrder: 2, address: formData.pickupAddress, scheduledTime: new Date(returnDate.getTime() + 3600000) }
                    ]
                };
                return tripApi.createTripsBulk([outboundTrip, returnTrip]);
            }

            return tripApi.createTrip(outboundTrip);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trips'] });
            navigate('/trips');
        },
        onError: (err: any) => {
            const message = err.response?.data?.message || err.message || 'Failed to schedule trip';
            alert(`Error: ${Array.isArray(message) ? message.join(', ') : message}`);
            console.error(err);
        }
    });

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            createMutation.mutate();
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    // Pre-fill addresses when member is selected
    const handleMemberChange = (memberId: string) => {
        const member = members?.find(m => m.id === memberId);
        setFormData(prev => ({
            ...prev,
            memberId,
            pickupAddress: member?.address || prev.pickupAddress,
        }));
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" mb={4}>Schedule New Trip</Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Card sx={{ p: 4 }}>
                {activeStep === 0 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                select
                                label="Member"
                                fullWidth
                                value={formData.memberId}
                                onChange={(e) => handleMemberChange(e.target.value)}
                            >
                                {members?.map(m => (
                                    <MenuItem key={m.id} value={m.id}>
                                        {m.lastName}, {m.firstName} ({m.memberId})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Reason for Visit"
                                fullWidth
                                value={formData.reasonForVisit}
                                onChange={(e) => setFormData({ ...formData, reasonForVisit: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Escort Name (Optional)"
                                fullWidth
                                value={formData.escortName}
                                onChange={(e) => setFormData({ ...formData, escortName: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Relationship"
                                fullWidth
                                value={formData.escortRelationship}
                                onChange={(e) => setFormData({ ...formData, escortRelationship: e.target.value })}
                            />
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
                                label="Pickup Time"
                                type="time"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Checkbox checked={formData.isRoundTrip} onChange={(e) => setFormData({ ...formData, isRoundTrip: e.target.checked })} />}
                                label="Round Trip"
                            />
                        </Grid>
                        {formData.isRoundTrip && (
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Return Time"
                                    type="time"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={formData.returnTime}
                                    onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
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
                    </Grid>
                )}

                {activeStep === 2 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Optional: You can assign a driver and vehicle now, or leave it for later.
                            </Alert>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Assign Driver"
                                fullWidth
                                value={formData.driverId}
                                onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                            >
                                <MenuItem value="">Unassigned</MenuItem>
                                {drivers?.map((d: any) => (
                                    <MenuItem key={d.id} value={d.user.id}>
                                        {d.user.lastName}, {d.user.firstName}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Assign Vehicle"
                                fullWidth
                                value={formData.vehicleId}
                                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                            >
                                <MenuItem value="">Unassigned</MenuItem>
                                {vehicles?.map((v: any) => (
                                    <MenuItem key={v.id} value={v.id}>
                                        {v.make} {v.model} ({v.licensePlate})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                )}

                <Box display="flex" justifyContent="space-between" mt={4}>
                    <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                    >
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
