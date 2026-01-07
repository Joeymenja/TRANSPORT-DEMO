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

    const createMemberMutation = useMutation({
        mutationFn: async () => {
            return memberApi.createMember({
                firstName: newMember.firstName,
                lastName: newMember.lastName,
                memberId: newMember.memberId || `TEMP-${Date.now()}`,
                dateOfBirth: newMember.dateOfBirth, // Required field
                mobilityRequirement: MobilityRequirement.AMBULATORY,
                isActive: true
            });
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            setFormData(prev => ({ ...prev, memberId: data.id }));
            setOpenMemberDialog(false);
        },
        onError: (err: any) => {
            alert('Failed to create member: ' + err.message);
        }
    });

// ... (unchanged code) ...

            <Dialog open={openMemberDialog} onClose={() => setOpenMemberDialog(false)}>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogContent>
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
