import { useState, useEffect } from 'react';
import { Box, Grid, TextField, Button, Avatar, Typography, MenuItem, Alert } from '@mui/material';
import { PhotoCamera, Save } from '@mui/icons-material';
import { useAuthStore } from '../../../store/auth';
import { authApi } from '../../../api/auth';

interface Props {
    onNext: () => void;
    onBack?: () => void;
}

export default function PersonalInfoStep({ onNext, onBack }: Props) {
    const user = useAuthStore((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        addressStreet: '',
        addressUnit: '',
        addressCity: '',
        addressState: 'AZ', // Default
        addressZip: '',
        licenseNumber: '',
        licenseState: '',
        licenseExpiry: '',
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactPhone: '',
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                dob: (user as any).dob || '', // Cast until store types update
                addressStreet: (user as any).addressStreet || '',
                addressUnit: (user as any).addressUnit || '',
                addressCity: (user as any).addressCity || '',
                addressState: (user as any).addressState || 'AZ',
                addressZip: (user as any).addressZip || '',
                licenseNumber: (user as any).licenseNumber || '',
                licenseState: (user as any).licenseState || '',
                licenseExpiry: (user as any).licenseExpiry || '',
                emergencyContactName: (user as any).emergencyContactName || '',
                emergencyContactRelationship: (user as any).emergencyContactRelationship || '',
                emergencyContactPhone: (user as any).emergencyContactPhone || '',
            }));
        }
    }, [user]);

    // Auto-populate License State from Address State if License State is empty
    useEffect(() => {
        if (formData.addressState && !formData.licenseState) {
            setFormData(prev => ({ ...prev, licenseState: formData.addressState }));
        }
    }, [formData.addressState]);

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleSave = async (completeStep: boolean) => {
        setLoading(true);
        setError(null);
        try {
            await authApi.updateProfile({
                ...formData,
                onboardingStep: completeStep ? 1 : undefined // Only mark step complete if clicking Next
            });
            if (completeStep) {
                onNext();
            } else {
                alert('Progress saved successfully');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to save information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSave(true);
    };

    const US_STATES = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];

    return (
        <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                <Box>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: '#e0e0e0' }}>
                        <PhotoCamera color="action" />
                    </Avatar>
                </Box>
                <Button variant="outlined" size="small" component="label">
                    Upload Photo
                    <input hidden accept="image/*" type="file" />
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="First Name" fullWidth value={formData.firstName} onChange={handleChange('firstName')} required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Last Name" fullWidth value={formData.lastName} onChange={handleChange('lastName')} required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Date of Birth" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.dob} onChange={handleChange('dob')} required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Phone Number" fullWidth value={formData.phone} onChange={handleChange('phone')} required />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <TextField label="Email" fullWidth value={formData.email} disabled helperText="✓ Verified" />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>Home Address</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <TextField label="Street Address" fullWidth value={formData.addressStreet} onChange={handleChange('addressStreet')} required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Apt / Unit" fullWidth value={formData.addressUnit} onChange={handleChange('addressUnit')} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="City" fullWidth value={formData.addressCity} onChange={handleChange('addressCity')} required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField select label="State" fullWidth value={formData.addressState} onChange={handleChange('addressState')}>
                        {US_STATES.map((state) => (
                            <MenuItem key={state} value={state}>{state}</MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="ZIP Code" fullWidth value={formData.addressZip} onChange={handleChange('addressZip')} required />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>Driver License Information</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="License Number" fullWidth value={formData.licenseNumber} onChange={handleChange('licenseNumber')} required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField select label="License State" fullWidth value={formData.licenseState} onChange={handleChange('licenseState')} required>
                         {US_STATES.map((state) => (
                            <MenuItem key={state} value={state}>{state}</MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Expiration Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.licenseExpiry} onChange={handleChange('licenseExpiry')} required />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>Emergency Contact</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Contact Name" fullWidth value={formData.emergencyContactName} onChange={handleChange('emergencyContactName')} required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Relationship" fullWidth value={formData.emergencyContactRelationship} onChange={handleChange('emergencyContactRelationship')} required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Contact Phone" fullWidth value={formData.emergencyContactPhone} onChange={handleChange('emergencyContactPhone')} required />
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', mt: 4, gap: 2 }}>
                <Box sx={{ display: 'flex', width: { xs: '100%', sm: 'auto' }, gap: 1 }}>
                     {onBack && (
                        <Button variant="outlined" size="large" onClick={onBack} sx={{ flex: { xs: 1, sm: 'none' } }}>
                            Back
                        </Button>
                    )}
                    <Button variant="text" startIcon={<Save />} disabled={loading} onClick={() => handleSave(false)} sx={{ flex: { xs: 1, sm: 'none' } }}>
                        Save & Resume
                    </Button>
                </Box>
                
                <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    {loading ? 'Saving...' : 'NEXT →'}
                </Button>
            </Box>
        </form>
    );
}
