import { useState } from 'react';
import { Box, Typography, Button, TextField, Container, IconButton, Paper } from '@mui/material';
import { ArrowBack, VpnKey, MailOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock API call
        setTimeout(() => {
            setSent(true);
        }, 1000);
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F5F7FA' }}>
            <Container maxWidth="xs" sx={{ position: 'relative' }}>
                
                <IconButton 
                    onClick={() => navigate(-1)} 
                    sx={{ position: 'absolute', top: -60, left: 0, bgcolor: 'white', border: '1px solid #e2e8f0' }}
                >
                    <ArrowBack />
                </IconButton>

                <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <Box sx={{ 
                        width: 64, 
                        height: 64, 
                        bgcolor: '#ECFDF5', 
                        color: '#10B981', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mx: 'auto', 
                        mb: 3 
                    }}>
                        <VpnKey sx={{ fontSize: 32 }} />
                    </Box>

                    <Typography variant="h5" fontWeight={800} gutterBottom>
                        {sent ? 'Check your email' : 'Forgot Password?'}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4, px: 2 }}>
                        {sent 
                            ? `We've sent a password reset link to ${email}. Check your inbox and spam folder.` 
                            : 'Enter your email address and we’ll send you a link to reset your password.'
                        }
                    </Typography>

                    {sent ? (
                        <Button 
                            fullWidth 
                            variant="outlined" 
                            size="large"
                            onClick={() => navigate('/login')}
                            sx={{ fontWeight: 700, py: 1.5, borderRadius: 2 }}
                        >
                            Back to Login
                        </Button>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                placeholder="name@example.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                InputProps={{
                                    startAdornment: <MailOutline color="action" sx={{ mr: 1 }} />,
                                    sx: { borderRadius: 2 }
                                }}
                                sx={{ mb: 3 }}
                            />
                            <Button 
                                type="submit"
                                fullWidth 
                                variant="contained" 
                                size="large"
                                sx={{ 
                                    fontWeight: 700, 
                                    py: 1.5, 
                                    borderRadius: 2, 
                                    bgcolor: '#14B8A6', 
                                    boxShadow: '0 4px 15px rgba(20, 184, 166, 0.3)',
                                    '&:hover': { bgcolor: '#0D9488' }
                                }}
                            >
                                Send Reset Link
                            </Button>
                        </form>
                    )}
                </Paper>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Button onClick={() => navigate('/login')} sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Return to Login
                    </Button>
                </Box>

            </Container>
        </Box>
    );
}
