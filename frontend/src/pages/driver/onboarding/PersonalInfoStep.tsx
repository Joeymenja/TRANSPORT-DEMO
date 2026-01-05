import { useState, useEffect } from 'react';
import { Box, Grid, TextField, Button, Avatar, IconButton, Typography, MenuItem } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useAuthStore } from '../../../store/auth';
import { authApi } from '../../../api/auth';

interface Props {
    onNext: () => void;
}

export default function PersonalInfoStep({ onNext }: Props) {
    const user = useAuthStore((state) => state.user);
    const [loading, setLoading] = useState(false);
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
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactPhone: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
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
                emergencyContactName: (user as any).emergencyContactName || '',
                emergencyContactRelationship: (user as any).emergencyContactRelationship || '',
                emergencyContactPhone: (user as any).emergencyContactPhone || '',
            });
        }
    }, [user]);

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Don't send email as it's not updatable here usually
            // Send update
            await authApi.updateProfile({
                ...formData,
                onboardingStep: 1 // Explicitly set step 1 complete
            });
            // Update local user store? Ideally app forces reload or store updates itself
            // For now, assume success moves us
            onNext();
        } catch (err) {
            console.error(err);
            // Show error
        } finally {
            setLoading(false);
        }
    };

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

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <TextField label="First Name" fullWidth value={formData.firstName} onChange={handleChange('firstName')} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="Last Name" fullWidth value={formData.lastName} onChange={handleChange('lastName')} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="Date of Birth" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.dob} onChange={handleChange('dob')} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="Phone Number" fullWidth value={formData.phone} onChange={handleChange('phone')} required />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Email" fullWidth value={formData.email} disabled helperText="✓ Verified" />
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>Home Address</Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Street Address" fullWidth value={formData.addressStreet} onChange={handleChange('addressStreet')} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="Apt / Unit" fullWidth value={formData.addressUnit} onChange={handleChange('addressUnit')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="City" fullWidth value={formData.addressCity} onChange={handleChange('addressCity')} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField select label="State" fullWidth value={formData.addressState} onChange={handleChange('addressState')}>
                        <MenuItem value="AZ">Arizona</MenuItem>
                        <MenuItem value="CA">California</MenuItem>
                        <MenuItem value="NV">Nevada</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="ZIP Code" fullWidth value={formData.addressZip} onChange={handleChange('addressZip')} required />
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>Emergency Contact</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="Contact Name" fullWidth value={formData.emergencyContactName} onChange={handleChange('emergencyContactName')} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="Relationship" fullWidth value={formData.emergencyContactRelationship} onChange={handleChange('emergencyContactRelationship')} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="Contact Phone" fullWidth value={formData.emergencyContactPhone} onChange={handleChange('emergencyContactPhone')} required />
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Button type="submit" variant="contained" size="large" disabled={loading}>
                    {loading ? 'Saving...' : 'NEXT →'}
                </Button>
            </Box>
        </form>
    );
}
