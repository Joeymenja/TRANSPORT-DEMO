import { Box, Typography, Button, Container, Paper, TextField, FormControlLabel, Checkbox, Grid, IconButton } from '@mui/material';
import { ArrowBack, CheckCircle, DirectionsCar } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SignaturePad from '../../components/SignaturePad';

// Checklist Items
const INSPECTION_ITEMS = [
    { id: 'tires', label: 'Tires (Pressure & Tread)' },
    { id: 'lights', label: 'Lights (Head, Tail, Turn)' },
    { id: 'fluids', label: 'Fluids (Oil, Coolant, Wash)' },
    { id: 'brakes', label: 'Brakes (Service & Parking)' },
    { id: 'wipers', label: 'Wipers & Mirrors' },
    { id: 'medical_kit', label: 'Medical Kit & Safety Vest' }
];

export default function VehicleInspectionPage() {
    const navigate = useNavigate();
    const [odometer, setOdometer] = useState('');
    const [checkedItems, setCheckedItems] = useState<string[]>([]);
    const [signature, setSignature] = useState('');

    const handleCheck = (id: string) => {
        if (checkedItems.includes(id)) {
            setCheckedItems(checkedItems.filter(item => item !== id));
        } else {
            setCheckedItems([...checkedItems, id]);
        }
    };

    const isComplete = odometer && checkedItems.length === INSPECTION_ITEMS.length && signature;

    const handleSubmit = () => {
        // Submit logic
        console.log('Inspection Submitted');
        navigate('/driver');
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F5F7FA', pb: 10 }}>
            {/* Header */}
            <Box sx={{ p: 2, pt: 6, bgcolor: 'white', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={() => navigate('/driver')} sx={{ mr: 1 }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h6" fontWeight={800} sx={{ flex: 1 }}>
                    Daily Vehicle Inspection
                </Typography>
            </Box>

            <Container sx={{ py: 3 }}>
                
                {/* Vehicle Info */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 1, display: 'flex', alignItems: 'center', bgcolor: '#E0F2F1', color: '#00695C' }}>
                    <DirectionsCar sx={{ mr: 2 }} />
                    <Box>
                        <Typography variant="subtitle2" fontWeight={800}>TOYOTA SIENNA (WAV)</Typography>
                        <Typography variant="caption" fontWeight={600}>License: ABC-1234</Typography>
                    </Box>
                </Paper>

                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block', ml: 1 }}>
                    ODOMETER READING
                </Typography>
                <Paper sx={{ p: 2, mb: 3, borderRadius: 1 }}>
                    <TextField
                        fullWidth
                        label="Start Odometer"
                        type="number"
                        value={odometer}
                        onChange={(e) => setOdometer(e.target.value)}
                        InputProps={{ sx: { borderRadius: 1, fontWeight: 700 } }}
                    />
                </Paper>

                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block', ml: 1 }}>
                    SAFETY CHECKLIST
                </Typography>
                <Paper sx={{ p: 2, mb: 3, borderRadius: 1 }}>
                    <Grid container spacing={1}>
                        {INSPECTION_ITEMS.map((item) => (
                            <Grid item xs={12} key={item.id}>
                                <FormControlLabel
                                    control={
                                        <Checkbox 
                                            checked={checkedItems.includes(item.id)} 
                                            onChange={() => handleCheck(item.id)}
                                            sx={{ color: '#ccc', '&.Mui-checked': { color: '#14B8A6' } }}
                                        />
                                    }
                                    label={<Typography variant="body2" fontWeight={500}>{item.label}</Typography>}
                                    sx={{ width: '100%', ml: -1 }}
                                />
                                <Box sx={{ height: 1, bgcolor: '#f5f5f5', width: '100%' }} />
                            </Grid>
                        ))}
                    </Grid>
                </Paper>

                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block', ml: 1 }}>
                    DRIVER VERIFICATION
                </Typography>
                <Paper sx={{ p: 3, mb: 4, borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        I certify that I have inspected the vehicle listed above and that it is in safe operating condition.
                    </Typography>
                    <Box sx={{ border: '2px dashed #ddd', borderRadius: 1, bgcolor: '#fafafa' }}>
                        <SignaturePad onEnd={setSignature} />
                    </Box>
                </Paper>

                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={!isComplete}
                    onClick={handleSubmit}
                    startIcon={<CheckCircle />}
                    sx={{
                        py: 2,
                        borderRadius: 1,
                        fontSize: '1rem',
                        fontWeight: 800,
                        bgcolor: '#14B8A6',
                        background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
                        boxShadow: '0 4px 15px rgba(20, 184, 166, 0.3)',
                    }}
                >
                    Submit Inspection
                </Button>

            </Container>
        </Box>
    );
}
