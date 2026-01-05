import { useState, useEffect, FormEvent } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
    Checkbox,
    FormControlLabel,
    LinearProgress,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authApi } from '../../api/auth';

const steps = ['Basic Information', 'Upload Documents', 'Pending Approval'];

// Validation Regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
// Min 8 chars, 1 upper, 1 number, 1 special
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

export default function DriverRegistrationPage() {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        licenseNumber: '',
        licenseState: '', // Optional, default AZ backend
        vehiclePlate: '', // Optional
    });
    const [agreements, setAgreements] = useState({
        terms: false,
        hipaa: false,
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const navigate = useNavigate();

    useEffect(() => {
        if (activeStep === 1) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        navigate('/login');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [activeStep, navigate]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';

        if (!EMAIL_REGEX.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }

        if (!PHONE_REGEX.test(formData.phone)) {
            newErrors.phone = 'Invalid US phone number';
        }

        if (!PASSWORD_REGEX.test(formData.password)) {
            newErrors.password = 'Password must be 8+ chars, 1 uppercase, 1 number, 1 special char';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.licenseNumber) {
            newErrors.licenseNumber = 'Driver license number is required';
        }

        if (!agreements.terms) newErrors.terms = 'You must accept the Terms of Service';
        if (!agreements.hipaa) newErrors.hipaa = 'You must acknowledge HIPAA compliance';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setServerError('');

        if (!validateForm()) return;

        setLoading(true);

        try {
            await authApi.registerDriver({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                licenseNumber: formData.licenseNumber,
                licenseState: formData.licenseState,
                vehiclePlate: formData.vehiclePlate,
            });
            setActiveStep(1);
        } catch (err: any) {
            setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const calculatePasswordStrength = (pass: string) => {
        let strength = 0;
        if (pass.length >= 8) strength += 25;
        if (/[A-Z]/.test(pass)) strength += 25;
        if (/\d/.test(pass)) strength += 25;
        if (/[!@#$%^&*]/.test(pass)) strength += 25;
        return strength;
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
                    <Button
                        size="small"
                        color="secondary"
                        onClick={() => {
                            const rand = Math.floor(Math.random() * 1000);
                            setFormData({
                                firstName: 'Test',
                                lastName: `Driver${rand}`,
                                email: `test.driver${rand}@example.com`,
                                password: 'Password123!',
                                confirmPassword: 'Password123!',
                                phone: '(555) 123-4567',
                                licenseNumber: `DL${rand}999`,
                                licenseState: 'AZ',
                                vehiclePlate: `ABC${rand}`,
                            });
                            setAgreements({ terms: true, hipaa: true });
                        }}
                        sx={{ mt: 1, textTransform: 'none' }}
                    >
                        [Demo: Auto-Fill Form]
                    </Button>
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
                            {serverError && <Alert severity="error" sx={{ mb: 3 }}>{serverError}</Alert>}
                            <form onSubmit={handleSubmit}>
                                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Personal Information</Typography>
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        error={!!errors.firstName}
                                        helperText={errors.firstName}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        error={!!errors.lastName}
                                        helperText={errors.lastName}
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
                                    error={!!errors.email}
                                    helperText={errors.email}
                                />
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    required
                                    sx={{ mb: 3 }}
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    error={!!errors.phone}
                                    helperText={errors.phone}
                                    placeholder="(555) 555-5555"
                                />

                                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Security</Typography>
                                <TextField
                                    fullWidth
                                    label="Create Password"
                                    type="password"
                                    required
                                    sx={{ mb: 1 }}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    error={!!errors.password}
                                    helperText={errors.password}
                                />
                                {formData.password && (
                                    <Box sx={{ mb: 2 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={calculatePasswordStrength(formData.password)}
                                            color={calculatePasswordStrength(formData.password) === 100 ? 'success' : 'warning'}
                                            sx={{ height: 6, borderRadius: 1 }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            Strength: {calculatePasswordStrength(formData.password)}%
                                        </Typography>
                                    </Box>
                                )}

                                <TextField
                                    fullWidth
                                    label="Confirm Password"
                                    type="password"
                                    required
                                    sx={{ mb: 3 }}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    error={!!errors.confirmPassword}
                                    helperText={errors.confirmPassword}
                                />

                                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Driver Details</Typography>
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="License Number"
                                        required
                                        value={formData.licenseNumber}
                                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                        error={!!errors.licenseNumber}
                                        helperText={errors.licenseNumber}
                                    />
                                    <TextField
                                        fullWidth
                                        label="State"
                                        value={formData.licenseState}
                                        onChange={(e) => setFormData({ ...formData, licenseState: e.target.value })}
                                        placeholder="AZ"
                                        sx={{ maxWidth: 100 }}
                                    />
                                </Box>
                                <TextField
                                    fullWidth
                                    label="Vehicle License Plate (Optional)"
                                    sx={{ mb: 3 }}
                                    value={formData.vehiclePlate}
                                    onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                                    helperText="If you will be using your own vehicle"
                                />

                                <Box sx={{ mb: 3, p: 2, bgcolor: '#f1f5f9', borderRadius: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={agreements.terms}
                                                onChange={(e) => setAgreements({ ...agreements, terms: e.target.checked })}
                                                color="primary"
                                            />
                                        }
                                        label={<Typography variant="body2">I agree to the Terms of Service and Privacy Policy</Typography>}
                                    />
                                    {errors.terms && <Typography variant="caption" color="error" display="block">{errors.terms}</Typography>}

                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={agreements.hipaa}
                                                onChange={(e) => setAgreements({ ...agreements, hipaa: e.target.checked })}
                                                color="primary"
                                            />
                                        }
                                        label={<Typography variant="body2">I acknowledge that I have read and understood the HIPAA Compliance requirements.</Typography>}
                                    />
                                    {errors.hipaa && <Typography variant="caption" color="error" display="block">{errors.hipaa}</Typography>}
                                </Box>

                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    sx={{ py: 1.5, fontSize: '1rem', textTransform: 'none' }}
                                >
                                    {loading ? 'creating Account...' : 'Create Driver Account'}
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
                    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                        <Typography variant="h5" fontWeight={600} gutterBottom>
                            Registration Successful!
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 4 }}>
                            Your account has been created. You will be redirected to the login page to complete your onboarding by uploading your documents.
                        </Typography>

                        <Alert severity="success" sx={{ mb: 4, textAlign: 'left' }}>
                            <Typography variant="subtitle2" fontWeight={600}>Account Status: Pending Approval</Typography>
                            Your registration has been submitted for review.
                        </Alert>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Redirecting in {countdown} seconds...
                        </Typography>

                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={() => navigate('/login')}
                            sx={{ py: 1.5 }}
                        >
                            Login Now
                        </Button>
                    </Paper>
                )}
            </Container>
        </Box>
    );
}
