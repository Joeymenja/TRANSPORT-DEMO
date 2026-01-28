import { Box, Typography, Paper, Avatar, Button, Container, Grid, Chip } from '@mui/material';
import { Star, VerifiedUser, DriveEta, Draw, CheckCircle, Warning } from '@mui/icons-material';
import { useAuthStore } from '../../store/auth';
import MobileHeader from '../../components/layout/MobileHeader';
import { useState } from 'react';
import SignaturePad from '../../components/SignaturePad';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

export default function DriverProfilePage() {
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser); // To update local store after save
    const [signOpen, setSignOpen] = useState(false);
    const navigate = useNavigate();

    const signatureMutation = useMutation({
        mutationFn: async (signatureBase64: string) => {
            if (!user?.id) return;
            const res = await api.patch('/drivers/profile/signature', {
                userId: user.id,
                signatureUrl: signatureBase64
            });
            return res.data;
        },
        onSuccess: (updatedUser) => {
            // Update local user state if returned, or merge
             if (updatedUser) {
                 setUser({ ...user, ...updatedUser } as any);
             }
        }
    });

    const handleSaveSignature = (data: { signatureBase64: string }) => {
        signatureMutation.mutate(data.signatureBase64);
    };

    return (
        <Box sx={{ bgcolor: '#fff', minHeight: '100vh', pb: 10 }}>
            <MobileHeader title="Profile" />
            <Container maxWidth="sm" sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3.5, pt: 1 }}>
                    <Avatar sx={{
                        width: 88,
                        height: 88,
                        mb: 1.5,
                        bgcolor: '#e2e8f0',
                        color: '#64748b',
                        fontSize: '2rem',
                        fontWeight: 700,
                    }}>
                        {user?.firstName?.[0]}
                    </Avatar>
                    <Typography variant="h5" fontWeight={700} sx={{ color: '#1e293b' }}>{user?.firstName} {user?.lastName}</Typography>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>NEMT Transport</Typography>

                    <Box sx={{ display: 'flex', gap: 0.75, mt: 1, alignItems: 'center' }}>
                        <Star sx={{ color: '#f59e0b', fontSize: 20 }} />
                        <Typography fontWeight={700} sx={{ color: '#1e293b', fontSize: '0.95rem' }}>4.9</Typography>
                        <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>(124 trips)</Typography>
                    </Box>
                </Box>

                <Grid container spacing={1.5} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 6 }}>
                        <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid #f0f0f0' }} elevation={0}>
                            <Typography variant="h4" fontWeight={800} sx={{ color: '#0096D6' }}>45</Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.03em' }}>HOURS THIS WEEK</Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid #f0f0f0' }} elevation={0}>
                            <Typography variant="h4" fontWeight={800} sx={{ color: '#0096D6' }}>28</Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.03em' }}>TRIPS COMPLETED</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5, color: '#1e293b' }}>Compliance</Typography>
                <Paper elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #f0f0f0', mb: 3, overflow: 'hidden' }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center' }}>
                        <Box sx={{
                            mr: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            bgcolor: user?.signatureUrl ? '#dcfce7' : '#fee2e2',
                            flexShrink: 0,
                        }}>
                            {user?.signatureUrl ? <CheckCircle sx={{ color: '#16a34a', fontSize: 20 }} /> : <Warning sx={{ color: '#ef4444', fontSize: 20 }} />}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography fontWeight={600} sx={{ color: '#1e293b', fontSize: '0.9rem' }}>Driver Signature</Typography>
                            <Typography variant="caption" sx={{ color: user?.signatureUrl ? '#16a34a' : '#ef4444', fontSize: '0.75rem' }}>
                                {user?.signatureUrl ? 'On File' : 'Start compliance now'}
                            </Typography>
                        </Box>
                        <Button
                            size="small"
                            variant={user?.signatureUrl ? 'text' : 'contained'}
                            onClick={() => setSignOpen(true)}
                            sx={{
                                borderRadius: 20,
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                ...(user?.signatureUrl ? {} : { bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }),
                            }}
                        >
                            {user?.signatureUrl ? 'Update' : 'Sign Now'}
                        </Button>
                    </Box>
                    {user?.signatureUrl && (
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', bgcolor: '#f8fafc' }}>
                            <Box component="img" src={user.signatureUrl} sx={{ maxHeight: 60, opacity: 0.8 }} alt="Signature" />
                        </Box>
                    )}
                </Paper>

                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5, color: '#1e293b' }}>Account</Typography>
                <Paper elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: '50%', bgcolor: '#dcfce7', flexShrink: 0 }}>
                            <VerifiedUser sx={{ color: '#16a34a', fontSize: 20 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography fontWeight={600} sx={{ color: '#1e293b', fontSize: '0.9rem' }}>Documents & Compliance</Typography>
                            <Typography variant="caption" sx={{ color: '#16a34a', fontSize: '0.75rem' }}>All Up to Date</Typography>
                        </Box>
                        <Button size="small" onClick={() => navigate('/driver/compliance')} sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}>View</Button>
                    </Box>
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: '50%', bgcolor: '#f1f5f9', flexShrink: 0 }}>
                            <DriveEta sx={{ color: '#64748b', fontSize: 20 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography fontWeight={600} sx={{ color: '#1e293b', fontSize: '0.9rem' }}>Vehicle Information</Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>Toyota Sienna (Blue)</Typography>
                        </Box>
                        <Button size="small" onClick={() => alert('Vehicle editing coming soon')} sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}>Edit</Button>
                    </Box>
                </Paper>

                <Button
                    fullWidth
                    variant="outlined"
                    sx={{
                        mt: 4,
                        borderRadius: 25,
                        height: 48,
                        fontWeight: 600,
                        textTransform: 'none',
                        color: '#ef4444',
                        borderColor: '#fecaca',
                        '&:hover': { bgcolor: '#fef2f2', borderColor: '#ef4444' },
                    }}
                    onClick={() => useAuthStore.getState().logout()}
                >
                    Log Out
                </Button>

                <SignaturePad 
                    open={signOpen} 
                    onClose={() => setSignOpen(false)} 
                    onSave={handleSaveSignature}
                    title="Driver Signature"
                />
            </Container>
        </Box>
    );
}
