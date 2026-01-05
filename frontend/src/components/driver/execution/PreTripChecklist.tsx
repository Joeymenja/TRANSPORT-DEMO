import { Box, Button, Checkbox, FormControlLabel, TextField, Typography, Card, CardContent, FormGroup, Alert } from '@mui/material';
import { useState } from 'react';
import { CameraAlt } from '@mui/icons-material';

interface PreTripChecklistProps {
    lastOdometer?: number;
    onComplete: (data: { odometer: number; checks: string[] }) => void;
    onCancel: () => void;
}

export default function PreTripChecklist({ lastOdometer = 0, onComplete, onCancel }: PreTripChecklistProps) {
    const [odometer, setOdometer] = useState<string>(lastOdometer ? lastOdometer.toString() : '');
    const [checks, setChecks] = useState<{ [key: string]: boolean }>({
        vehicleInspect: false,
        fuelSufficient: false,
        equipmentReady: false,
        driverFit: false,
    });
    const [error, setError] = useState<string | null>(null);

    const handleCheck = (key: string) => {
        setChecks(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = () => {
        const currentOdo = parseFloat(odometer);
        if (isNaN(currentOdo)) {
            setError('Please enter a valid odometer reading.');
            return;
        }
        if (currentOdo < lastOdometer) {
            setError(`Odometer cannot be less than previous reading (${lastOdometer}).`);
            return;
        }

        const allChecked = Object.values(checks).every(v => v);
        if (!allChecked) {
            setError('All safety checks must be completed.');
            return;
        }

        setError(null);
        onComplete({ odometer: currentOdo, checks: Object.keys(checks).filter(k => checks[k]) });
    };

    return (
        <Card sx={{ maxWidth: 600, mx: 'auto', mt: 2, borderRadius: 2 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom fontWeight={600}>
                    Pre-Trip Checklist
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Complete the following checks before starting the trip.
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                            Vehicle & Safety
                        </Typography>
                        <Button size="small" onClick={() => {
                            const allSelected = Object.values(checks).every(v => v);
                            const newState = !allSelected;
                            setChecks({
                                vehicleInspect: newState,
                                fuelSufficient: newState,
                                equipmentReady: newState,
                                driverFit: newState,
                            });
                        }}>
                            {Object.values(checks).every(v => v) ? 'Deselect All' : 'Select All'}
                        </Button>
                    </Box>
                    <FormGroup>
                        <FormControlLabel
                            control={<Checkbox checked={checks.vehicleInspect} onChange={() => handleCheck('vehicleInspect')} />}
                            label="Vehicle inspected and safe to operate"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={checks.fuelSufficient} onChange={() => handleCheck('fuelSufficient')} />}
                            label="Fuel/Charge sufficient for trip"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={checks.equipmentReady} onChange={() => handleCheck('equipmentReady')} />}
                            label="Required equipment present/functional"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={checks.driverFit} onChange={() => handleCheck('driverFit')} />}
                            label="I am fit to drive safely"
                        />
                    </FormGroup>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Odometer Reading
                    </Typography>
                    <TextField
                        fullWidth
                        label="Current Odometer"
                        type="number"
                        value={odometer}
                        onChange={(e) => setOdometer(e.target.value)}
                        InputProps={{
                            endAdornment: <Typography color="text.secondary">mi</Typography>
                        }}
                        helperText={lastOdometer ? `Last reading: ${lastOdometer} mi` : 'Enter current vehicle mileage'}
                    />
                    <Button startIcon={<CameraAlt />} sx={{ mt: 1 }}>
                        Capture Odometer Photo
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button variant="outlined" fullWidth onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handleSubmit}
                        disabled={!odometer} // Basic check, full validation in submit
                    >
                        Confirm & Start Trip
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}
