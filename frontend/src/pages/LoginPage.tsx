import { useState, FormEvent, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    Container,
    InputAdornment,
    IconButton,
    FormControlLabel,
    Checkbox,
    Link
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuthStore } from '../store/auth';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);

            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            // Fetch the user to check role and onboarding step
            // Wait, the login action sets the user in store, we can get it from response or just check store?
            // The 'login' function in store handles setting state. But it doesn't return the user object directly.
            // We should modify store.login to return user or just check logic inside store?
            // Actually, we can just access the store's state after login await, if it's updated synchronously (which zustand is, usually).
            // However, better to modify the store's login to return the data, OR assume we are redirected.
            // Let's modify the store.ts first? No, let's just peek at how we do it.
            // Actually, useAuthStore.getState().user should be set.

            const user = useAuthStore.getState().user;
            if (user?.role === 'DRIVER' && (user.onboardingStep || 0) < 6) {
                navigate('/driver/welcome');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f0f4f8',
                background: 'linear-gradient(135deg, #f0f4f8 0%, #dbeafe 100%)'
            }}
        >
            <Container maxWidth="xs">
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <img
                        src="/logo.png"
                        alt="GVBH Transportation"
                        style={{ height: 80, objectFit: 'contain' }}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none'; // Fallback logic
                        }}
                    />
                </Box>

                <Card
                    sx={{
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                >
                    <CardContent sx={{ p: 4 }}>
                        <Typography
                            variant="h5"
                            component="h1"
                            align="center"
                            gutterBottom
                            sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}
                        >
                            Welcome Back
                        </Typography>

                        <Typography
                            variant="body2"
                            align="center"
                            color="text.secondary"
                            sx={{ mb: 3 }}
                        >
                            Sign in to your GVBH account
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                sx={{ mb: 2 }}
                                autoComplete="email"
                                placeholder="Enter your email"
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                sx={{ mb: 1 }}
                                autoComplete="current-password"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() => setShowPassword(!showPassword)}
                                                onMouseDown={(e) => e.preventDefault()}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            color="primary"
                                            size="small"
                                        />
                                    }
                                    label={<Typography variant="body2" color="text.secondary">Remember Me</Typography>}
                                />
                                <Link
                                    component={RouterLink}
                                    to="/forgot-password"
                                    variant="body2"
                                    underline="hover"
                                    sx={{ fontWeight: 500 }}
                                >
                                    Forgot Password?
                                </Link>
                            </Box>

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    py: 1.5,
                                    bgcolor: '#0096D6',
                                    '&:hover': { bgcolor: '#0077B5' },
                                    textTransform: 'none',
                                    fontSize: 16,
                                    fontWeight: 600,
                                    boxShadow: '0 4px 6px rgba(0, 150, 214, 0.25)'
                                }}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>

                        <Box sx={{ mt: 3, textAlign: 'center', pt: 3, borderTop: '1px solid #f1f5f9' }}>
                            <Typography variant="body2" color="text.secondary">
                                New to GVBH?{' '}
                                <Link
                                    component={RouterLink}
                                    to="/register-driver"
                                    underline="hover"
                                    sx={{ fontWeight: 600, color: '#0096D6' }}
                                >
                                    Create Account
                                </Link>
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                <Typography variant="caption" display="block" align="center" sx={{ mt: 4, color: '#94a3b8' }}>
                    GVBH Transportation App v1.0.0
                </Typography>
            </Container>
        </Box>
    );
}
