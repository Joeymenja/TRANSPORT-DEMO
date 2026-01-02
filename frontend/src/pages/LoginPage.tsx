import { useState, FormEvent } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    Container
} from '@mui/material';
import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
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
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f8f9fa',
            }}
        >
            <Container maxWidth="sm">
                <Card
                    sx={{
                        borderRadius: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                >
                    <CardContent sx={{ p: 4 }}>
                        <Typography
                            variant="h4"
                            component="h1"
                            gutterBottom
                            sx={{
                                fontWeight: 600,
                                color: '#212121',
                                mb: 3,
                            }}
                        >
                            GVBH Transportation
                        </Typography>

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ mb: 4 }}
                        >
                            Sign in to manage transportation scheduling
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
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                sx={{ mb: 3 }}
                                autoComplete="current-password"
                            />

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    py: 1.5,
                                    bgcolor: '#0096D6',
                                    '&:hover': {
                                        bgcolor: '#0077B5',
                                    },
                                    textTransform: 'none',
                                    fontSize: 16,
                                    fontWeight: 500,
                                }}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 3, textAlign: 'center' }}
                        >
                            Demo: admin@gvbh.com / password123
                        </Typography>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}
