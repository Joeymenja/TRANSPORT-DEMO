import React from 'react';
import { Box, Typography, Paper, Container, IconButton, Button, LinearProgress, Grid, Divider } from '@mui/material';
import { ArrowBack, LocalGasStation, Speed, Build, Warning, CheckCircle, DirectionsCar, LockOpen, Map } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function VehicleStatusPage() {
    const navigate = useNavigate();

    // Mock Data
    const vehicle = {
        model: 'Toyota Sienna 2023',
        plate: 'AZ BMT-4829',
        fuel: 78,
        miles: '12,482',
        status: 'ACTIVE',
        alerts: [
            { type: 'warning', text: 'Tire Pressure Low (RL)' },
        ],
        health: {
            oil: 'Good (82%)',
            brakes: 'Good',
            tires: 'Check Needed'
        },
        location: '1200 N 7th St, Phoenix, AZ'
    };

    return (
        <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', pb: 8 }}>
            {/* Header */}
            <Box sx={{ p: 2, pt: 6, display: 'flex', alignItems: 'center', bgcolor: 'white', borderBottom: '1px solid #eee' }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h6" fontWeight={800} sx={{ flex: 1, textAlign: 'center', mr: 5 }}>
                    Vehicle Status
                </Typography>
            </Box>

            <Container maxWidth="sm" sx={{ p: 3 }}>
                
                {/* Vehicle Card */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 4, bgcolor: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <Box sx={{ 
                        width: 120, 
                        height: 120, 
                        bgcolor: '#f1f5f9', 
                        borderRadius: '50%', 
                        mx: 'auto', 
                        mb: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center'
                    }}>
                        <DirectionsCar sx={{ fontSize: 64, color: '#94a3b8' }} />
                        {/* Placeholder for vehicle image */}
                    </Box>
                    <Typography variant="h5" fontWeight={800} letterSpacing={-0.5}>{vehicle.model}</Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 2 }}>{vehicle.plate}</Typography>
                    
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.5, bgcolor: '#ECFDF5', borderRadius: 4, color: '#059669', fontWeight: 800, fontSize: '0.8rem' }}>
                        <CheckCircle sx={{ fontSize: 16 }} />
                        OPERATIONAL
                    </Box>
                </Paper>

                {/* Quick Stats */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <LocalGasStation sx={{ color: '#14B8A6' }} />
                                <Typography variant="h6" fontWeight={800}>{vehicle.fuel}%</Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>FUEL LEVEL</Typography>
                            <LinearProgress variant="determinate" value={vehicle.fuel} sx={{ mt: 1, height: 6, borderRadius: 3, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#14B8A6' } }} />
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Speed sx={{ color: '#14B8A6' }} />
                                <Typography variant="h6" fontWeight={800}>{vehicle.miles}</Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>MILEAGE</Typography>
                            <Box sx={{ mt: 1, height: 6 }} /> 
                        </Paper>
                    </Grid>
                </Grid>

                {/* Alerts */}
                {vehicle.alerts.map((alert, i) => (
                    <Paper key={i} sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: '#FFF8E1', border: '1px solid #FFE082', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Warning color="warning" />
                        <Typography variant="body2" fontWeight={700} color="warning.dark">
                            {alert.text}
                        </Typography>
                    </Paper>
                ))}

                {/* Health Detailed */}
                <Paper sx={{ borderRadius: 4, bgcolor: 'white', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', mb: 3 }}>
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                        <Typography variant="overline" color="text.secondary" fontWeight={800}>HEALTH MONITOR</Typography>
                    </Box>
                    <Box sx={{ p: 0 }}>
                        <HealthRow label="Engine Oil Life" value={vehicle.health.oil} status="GOOD" />
                        <Divider />
                        <HealthRow label="Brake Pads" value={vehicle.health.brakes} status="GOOD" />
                        <Divider />
                        <HealthRow label="Tire Pressure" value={vehicle.health.tires} status="WARNING" />
                    </Box>
                </Paper>

                {/* Actions */}
                <Button 
                    fullWidth 
                    variant="contained" 
                    startIcon={<Build />}
                    sx={{ 
                        py: 2, 
                        borderRadius: 3, 
                        bgcolor: '#14B8A6', 
                        fontWeight: 800, 
                        boxShadow: '0 4px 15px rgba(20, 184, 166, 0.3)',
                        '&:hover': { bgcolor: '#0D9488' } 
                    }}
                >
                    Request Maintenance
                </Button>

            </Container>
        </Box>
    );
}

function HealthRow({ label, value, status }: { label: string, value: string, status: 'GOOD' | 'WARNING' | 'ERROR' }) {
    return (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" fontWeight={600}>{label}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color={status === 'GOOD' ? 'success.main' : status === 'WARNING' ? 'warning.main' : 'error.main'} fontWeight={700}>
                    {value}
                </Typography>
                {status === 'GOOD' && <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />}
                {status === 'WARNING' && <Warning sx={{ fontSize: 16, color: 'warning.main' }} />}
            </Box>
        </Box>
    );
}
