import { useState, FormEvent } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    Container,
    Paper,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authApi } from '../../api/auth';

const steps = ['Basic Information', 'Upload Documents', 'Pending Approval'];

export default function DriverRegistrationPage() {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authApi.registerDriver(formData);
            setActiveStep(1);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', py: 8 }}>
            <Container maxWidth="sm">
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                        Driver Application
                    </Typography>
                    <Typography color="text.secondary">
                        Join the GVBH Transportation network
                    </Typography>
                </Box>

                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {activeStep === 0 && (
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <CardContent sx={{ p: 4 }}>
                            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                            <form onSubmit={handleSubmit}>
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </Box>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    type="email"
                                    required
                                    sx={{ mb: 2 }}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    required
                                    sx={{ mb: 2 }}
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                                <TextField
                                    fullWidth
                                    label="Create Password"
                                    type="password"
                                    required
                                    sx={{ mb: 3 }}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    sx={{ py: 1.5, fontSize: '1rem', textTransform: 'none' }}
                                >
                                    {loading ? 'Submitting...' : 'Continue'}
                                </Button>
                            </form>

                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Already have an account?{' '}
                                    <RouterLink to="/login" style={{ color: '#0096D6', textDecoration: 'none', fontWeight: 500 }}>
                                        Sign In
                                    </RouterLink>
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {activeStep === 1 && (
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>Registration Received!</Typography>
                        <Typography color="text.secondary" sx={{ mb: 4 }}>
                            Your account has been created in a pending state.
                            To complete your application, please log in to upload your Driver's License and Insurance documents.
                        </Typography>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => navigate('/login')}
                            sx={{ py: 1.5 }}
                        >
                            Log In to Upload Documents
                        </Button>
                    </Paper>
                )}
            </Container>
        </Box>
    );
}
