import { useState } from 'react';
import { Box, TextField, Button, Typography, MenuItem, Grid, CircularProgress } from '@mui/material';
import { vehicleApi } from '../../../api/vehicles';
import { driverApi } from '../../../api/drivers';
import { useAuthStore } from '../../../store/auth';

interface VehicleInfoStepProps {
    onNext: () => void;
    onBack: () => void;
}

export default function VehicleInfoStep({ onNext, onBack }: VehicleInfoStepProps) {
    const user = useAuthStore((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        licensePlate: '',
        vin: '',
        type: 'SEDAN',
        capacity: 4
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            // 1. Create Vehicle
            const vehicle = await vehicleApi.create({
                ...formData,
                status: 'AVAILABLE',
                vehicleNumber: `V-${Math.floor(Math.random() * 1000)}`, // Auto-generate
                isAccessible: false,
                currentMileage: 0,
                type: formData.type as any, // Cast to match enum
            });

            // 2. Assign to Driver (assuming we can get driver ID from user ID easily, 
            // or we might need to search for the driver profile first. 
            // For now, let's try updating the driver profile associated with this user)

            // Fetch driver profile first
            const driver = await driverApi.getByUserId(user.id);
            if (driver) {
                await driverApi.update(driver.id, { assignedVehicleId: vehicle.id });
            }

            onNext();
        } catch (error) {
            console.error('Failed to save vehicle info:', error);
            alert('Failed to save vehicle information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isValid = formData.make && formData.model && formData.licensePlate && formData.vin;

    return (
        <Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>
                Vehicle Information
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Enter the details of the vehicle you will be driving.
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField label="Make" name="make" fullWidth value={formData.make} onChange={handleChange} placeholder="e.g. Toyota" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="Model" name="model" fullWidth value={formData.model} onChange={handleChange} placeholder="e.g. Camry" />
                </Grid>
                <Grid item xs={6} sm={4}>
                    <TextField label="Year" name="year" type="number" fullWidth value={formData.year} onChange={handleChange} />
                </Grid>
                <Grid item xs={6} sm={4}>
                    <TextField label="Color" name="color" fullWidth value={formData.color} onChange={handleChange} placeholder="e.g. White" />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        select
                        label="Type"
                        name="type"
                        fullWidth
                        value={formData.type}
                        onChange={handleChange}
                    >
                        <MenuItem value="SEDAN">Sedan</MenuItem>
                        <MenuItem value="SUV">SUV</MenuItem>
                        <MenuItem value="VAN">Van</MenuItem>
                        <MenuItem value="TRUCK">Truck</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="License Plate" name="licensePlate" fullWidth value={formData.licensePlate} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="VIN" name="vin" fullWidth value={formData.vin} onChange={handleChange} />
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button variant="outlined" onClick={onBack} disabled={loading}>
                    Back
                </Button>
                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleSubmit}
                    disabled={!isValid || loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Save & Continue'}
                </Button>
            </Box>
        </Box>
    );
}
