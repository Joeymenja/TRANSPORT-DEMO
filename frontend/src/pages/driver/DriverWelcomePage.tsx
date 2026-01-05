import { Box, Container, Card, CardContent, Typography, Button, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { CheckBoxOutlineBlank, CheckBox } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';

export default function DriverWelcomePage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const steps = [
        { id: 1, label: 'Complete Profile', completed: true }, // Assumed done at registration
        { id: 2, label: 'Upload License & Certifications', completed: false },
        { id: 3, label: 'Add Vehicle Information', completed: false },
        { id: 4, label: 'Background Check Authorization', completed: false },
        { id: 5, label: 'Review Policies & Training', completed: false },
    ];

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#f0f4f8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4
        }}>
            <Container maxWidth="sm">
                <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
                                🚗 GVBH Transportation
                            </Typography>
                            <Typography variant="h4" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                                Welcome, {user?.firstName}!
                            </Typography>
                            <Typography color="text.secondary" paragraph>
                                Let's get your account set up so you can start transporting clients.
                                This will take about 10 minutes.
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 4 }} />

                        <Box sx={{ textAlign: 'left', mb: 4, bgcolor: '#f8f9fa', p: 3, borderRadius: 2 }}>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                Setup Steps:
                            </Typography>
                            <List dense>
                                {steps.map((step) => (
                                    <ListItem key={step.id} disableGutters>
                                        <ListItemIcon sx={{ minWidth: 32 }}>
                                            {step.completed ?
                                                <CheckBox color="success" fontSize="small" /> :
                                                <CheckBoxOutlineBlank color="action" fontSize="small" />
                                            }
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={step.label}
                                            primaryTypographyProps={{
                                                color: step.completed ? 'text.secondary' : 'text.primary',
                                                style: { textDecoration: step.completed ? 'line-through' : 'none' }
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/driver/onboarding')}
                                sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 600 }}
                            >
                                GET STARTED
                            </Button>
                            <Button
                                variant="text"
                                color="inherit"
                                onClick={() => navigate('/dashboard')}
                                sx={{ color: 'text.secondary' }}
                            >
                                I'll Do This Later
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}
