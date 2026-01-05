import { Box, Typography, Paper, Avatar, Button, Container, Grid } from '@mui/material';
import { Star, VerifiedUser, DriveEta } from '@mui/icons-material';
import { useAuthStore } from '../../store/auth';
import MobileHeader from '../../components/layout/MobileHeader';

export default function DriverProfilePage() {
    const user = useAuthStore((state) => state.user);

    return (
        <Box sx={{ bgcolor: '#fff', minHeight: '100vh', pb: 8 }}>
            <MobileHeader title="Profile" />
            <Container maxWidth="sm" sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                    <Avatar sx={{ width: 100, height: 100, mb: 2, bgcolor: 'primary.main', fontSize: 40 }}>
                        {user?.firstName?.[0]}
                    </Avatar>
                    <Typography variant="h5" fontWeight={700}>{user?.firstName} {user?.lastName}</Typography>
                    <Typography color="text.secondary">Professional Driver</Typography>

                    <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                        <Star sx={{ color: '#FFB400' }} />
                        <Typography fontWeight={700}>4.9</Typography>
                        <Typography color="text.secondary">(124 trips)</Typography>
                    </Box>
                </Box>

                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={6}>
                        <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, bgcolor: '#f9f9f9' }} elevation={0}>
                            <Typography variant="h4" fontWeight={700} color="primary">45</Typography>
                            <Typography variant="caption" color="text.secondary">HOURS THIS WEEK</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, bgcolor: '#f9f9f9' }} elevation={0}>
                            <Typography variant="h4" fontWeight={700} color="primary">28</Typography>
                            <Typography variant="caption" color="text.secondary">TRIPS COMPLETED</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Typography variant="h6" fontWeight={700} gutterBottom>Account</Typography>
                <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee', overflow: 'hidden' }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center' }}>
                        <VerifiedUser sx={{ color: 'success.main', mr: 2 }} />
                        <Box>
                            <Typography fontWeight={600}>Documents & Compliance</Typography>
                            <Typography variant="caption" color="success.main">All Up to Date</Typography>
                        </Box>
                        <Box sx={{ ml: 'auto' }}>
                            <Button size="small">View</Button>
                        </Box>
                    </Box>
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                        <DriveEta sx={{ color: 'text.secondary', mr: 2 }} />
                        <Box>
                            <Typography fontWeight={600}>Vehicle Information</Typography>
                            <Typography variant="caption" color="text.secondary">Toyota Sienna (Blue)</Typography>
                        </Box>
                        <Box sx={{ ml: 'auto' }}>
                            <Button size="small">Edit</Button>
                        </Box>
                    </Box>
                </Paper>

                <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    sx={{ mt: 4, borderRadius: 20 }}
                    onClick={() => useAuthStore.getState().logout()}
                >
                    Log Out
                </Button>
            </Container>
        </Box>
    );
}
