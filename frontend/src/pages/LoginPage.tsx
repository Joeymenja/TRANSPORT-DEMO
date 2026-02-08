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
    Link,
    Stack,
    Divider
} from '@mui/material';
import { Visibility, VisibilityOff, LocalTaxi } from '@mui/icons-material';
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
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            if (rememberMe) localStorage.setItem('rememberedEmail', email);
            else localStorage.removeItem('rememberedEmail');
            
            const user = useAuthStore.getState().user;
            // Route based on role
            if (user?.role === 'DRIVER') {
                 navigate('/driver/gvbh'); // GVBH Mobile Driver App
            } else {
                 navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F5F7FA'}}>
            <Container maxWidth="xs">
                
                {/* Brand Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box sx={{ 
                        width: 64, 
                        height: 64, 
                        bgcolor: '#14B8A6', 
                        borderRadius: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        boxShadow: '0 10px 25px rgba(20, 184, 166, 0.3)'
                    }}>
                        <LocalTaxi sx={{ fontSize: 36, color: 'white' }} />
                    </Box>
                    <Typography variant="h4" fontWeight={800} color="text.primary" letterSpacing={-0.5}>
                        NEMT Access
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Driver & Manager Portal
                    </Typography>
                </Box>

                <Card sx={{ borderRadius: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #eee' }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            Sign In
                        </Typography>
                        
                        {error && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>{error}</Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <Stack spacing={3}>
                                <TextField
                                    label="Email Address"
                                    fullWidth
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    InputProps={{ sx: { borderRadius: 1 } }}
                                />
                                <TextField
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    fullWidth
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    InputProps={{
                                        sx: { borderRadius: 1 },
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Stack>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 3 }}>
                                <FormControlLabel
                                    control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} size="small" />}
                                    label={<Typography variant="body2">Remember me</Typography>}
                                />
                                <Link component={RouterLink} to="/forgot-password" variant="body2" fontWeight={600} underline="hover" color="primary">
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
                                    height: 50,
                                    borderRadius: 1,
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    bgcolor: '#14B8A6',
                                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)',
                                    '&:hover': { bgcolor: '#0D9488' }
                                }}
                            >
                                {loading ? 'Authenticating...' : 'Secure Login'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                        By signing in, you agree to our <Link>Terms of Service</Link> and <Link>Privacy Policy</Link>.
                    </Typography>
                </Box>

            </Container>
        </Box>
    );
}
