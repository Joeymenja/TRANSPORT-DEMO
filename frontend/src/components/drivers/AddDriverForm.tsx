import { useState } from 'react';
import { Box, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem, Typography, Card, CardContent, IconButton, Alert } from '@mui/material';
import { AutoFixHigh, PersonAdd, Cancel } from '@mui/icons-material';
import { CreateDriverDto, driverApi, EmploymentStatus } from '../../api/drivers';
import api from '../../lib/api';
import { useAuthStore } from '../../store/auth';

interface AddDriverFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export const AddDriverForm = ({ onSuccess, onCancel }: AddDriverFormProps) => {
    const [formData, setFormData] = useState<CreateDriverDto>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        licenseNumber: '',
        licenseState: '',
        licenseExpiryDate: '',
        employmentStatus: EmploymentStatus.FULL_TIME,
        emergencyContactName: '',
        emergencyContactPhone: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (field: keyof CreateDriverDto, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleFillPseudoData = () => {
        const firstNames = ['Robert', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica'];
        const lastNames = ['Wilson', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White'];
        const states = ['AZ', 'CA', 'NV', 'TX', 'WA', 'OR'];
        const rand = Math.floor(Math.random() * 6);
        const firstName = firstNames[rand];
        const lastName = lastNames[Math.floor(Math.random() * 6)];
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@example.com`;

        setFormData({
            firstName,
            lastName,
            email,
            password: 'password123',
            licenseNumber: `DL-${Math.floor(100000 + Math.random() * 900000)}`,
            licenseState: states[rand],
            licenseExpiryDate: new Date(new Date().getFullYear() + 2, 0, 1).toISOString().split('T')[0],
            employmentStatus: [EmploymentStatus.FULL_TIME, EmploymentStatus.PART_TIME, EmploymentStatus.CONTRACTOR][Math.floor(Math.random() * 3)],
            emergencyContactName: 'Support Contact',
            emergencyContactPhone: '555-0199'
        });
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const orgId = useAuthStore.getState().user?.organizationId;

            // 1. Register User first
            await api.post('/auth/register', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password || 'tempPass123!',
                role: 'DRIVER',
                organizationId: orgId
            });

            // 2. Create Driver Profile using the API
            await driverApi.create(formData);

            onSuccess();
        } catch (error: any) {
            console.error('Failed to create driver', error);
            setError(error.response?.data?.message || 'Failed to create driver. Please check if the email already exists.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card sx={{ mb: 4, border: '1px solid #0096D6', bgcolor: '#f0faff' }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <PersonAdd color="primary" />
                        <Typography variant="h6" fontWeight="600">Add New Driver Profile</Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                        <Button
                            startIcon={<AutoFixHigh />}
                            size="small"
                            variant="outlined"
                            color="secondary"
                            onClick={handleFillPseudoData}
                        >
                            Fill Pseudo Data
                        </Button>
                        <IconButton size="small" onClick={onCancel}>
                            <Cancel />
                        </IconButton>
                    </Box>
                </Box>

                <form onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="primary" gutterBottom>Personal Information</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="First Name"
                                size="small"
                                fullWidth
                                required
                                value={formData.firstName}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Last Name"
                                size="small"
                                fullWidth
                                required
                                value={formData.lastName}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Email"
                                type="email"
                                size="small"
                                fullWidth
                                required
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Password"
                                type="password"
                                size="small"
                                fullWidth
                                required
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                helperText="For logging into the Driver App"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 1 }}>Employment & License</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Employment Status</InputLabel>
                                <Select
                                    value={formData.employmentStatus}
                                    label="Employment Status"
                                    onChange={(e) => handleChange('employmentStatus', e.target.value)}
                                >
                                    <MenuItem value={EmploymentStatus.FULL_TIME}>Full Time</MenuItem>
                                    <MenuItem value={EmploymentStatus.PART_TIME}>Part Time</MenuItem>
                                    <MenuItem value={EmploymentStatus.CONTRACTOR}>Contractor</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="License Number"
                                size="small"
                                fullWidth
                                value={formData.licenseNumber}
                                onChange={(e) => handleChange('licenseNumber', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="License State"
                                size="small"
                                fullWidth
                                value={formData.licenseState}
                                onChange={(e) => handleChange('licenseState', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="License Expiry"
                                type="date"
                                size="small"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={formData.licenseExpiryDate}
                                onChange={(e) => handleChange('licenseExpiryDate', e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 1 }}>Emergency Contact</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Contact Name"
                                size="small"
                                fullWidth
                                value={formData.emergencyContactName}
                                onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Phone Number"
                                size="small"
                                fullWidth
                                value={formData.emergencyContactPhone}
                                onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                            />
                        </Grid>

                        {error && (
                            <Grid item xs={12}>
                                <Alert severity="error">{error}</Alert>
                            </Grid>
                        )}

                        <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
                            <Button onClick={onCancel}>Cancel</Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading || !formData.email || !formData.firstName || !formData.lastName}
                            >
                                {loading ? 'Creating...' : 'Create Driver Profile'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </CardContent>
        </Card>
    );
};
