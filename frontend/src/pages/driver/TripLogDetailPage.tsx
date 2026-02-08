import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, IconButton, Button, Container, Divider, Grid } from '@mui/material';
import { ArrowBack, Download, Speed, AccessTime, LocationOn, Description, CheckCircle, VerifiedUser } from '@mui/icons-material';

export default function TripLogDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock Data
    const trip = {
        id: id || '8422-CL',
        date: 'Oct 24, 2023',
        distance: '12.4 miles',
        status: 'SIGNED',
        facility: {
            name: 'St. Mary\'s Medical Center',
            address: '1500 E Thomas Rd, Phoenix, AZ'
        },
        odometer: {
            start: '42,981',
            end: '42,993'
        },
        timeline: {
            pickup: '09:30 AM',
            dropoff: '09:54 AM'
        },
        signature: 'Confirmed by Staff (Nurse J. Doe)'
    };

    return (
        <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', pb: 8 }}>
            {/* Header */}
            <Box sx={{ p: 2, pt: 6, display: 'flex', alignItems: 'center', bgcolor: 'white', borderBottom: '1px solid #f1f5f9' }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1, bgcolor: '#f8fafc' }}>
                    <ArrowBack sx={{ color: '#64748b' }} />
                </IconButton>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" color="text.secondary" fontWeight={700} lineHeight={1}>TRIP LOG</Typography>
                    <Typography variant="h6" fontWeight={800} lineHeight={1.1}>#{trip.id}</Typography>
                </Box>
                <Button 
                    variant="outlined" 
                    startIcon={<Download />} 
                    size="small"
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, color: '#14B8A6', borderColor: 'rgba(20, 184, 166, 0.3)' }}
                >
                    PDF
                </Button>
            </Box>

            <Container maxWidth="sm" sx={{ p: 3 }}>
                
                {/* Stats Row */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Paper sx={{ flex: 1, p: 2, borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                        <AccessTime sx={{ color: '#14B8A6', mb: 1 }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">DATE</Typography>
                        <Typography variant="body1" fontWeight={800}>{trip.date}</Typography>
                    </Paper>
                    <Paper sx={{ flex: 1, p: 2, borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                        <Speed sx={{ color: '#14B8A6', mb: 1 }} />
                         <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">DISTANCE</Typography>
                         <Typography variant="body1" fontWeight={800}>{trip.distance}</Typography>
                    </Paper>
                </Box>

                {/* Status Badge */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Box sx={{ 
                        bgcolor: '#ECFDF5', 
                        color: '#059669', 
                        px: 2, 
                        py: 0.5, 
                        borderRadius: 4, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        fontWeight: 700,
                        fontSize: '0.8rem'
                    }}>
                        <CheckCircle sx={{ fontSize: 16 }} />
                        SUCCESSFULLY LOGGED
                    </Box>
                </Box>

                {/* Trip Details */}
                <Paper sx={{ p: 0, borderRadius: 4, bgcolor: 'white', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', mb: 3 }}>
                    <Box sx={{ p: 3, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                        <Typography variant="overline" color="text.secondary" fontWeight={800}>FACILITY INFO</Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Box sx={{ p: 1, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <LocationOn sx={{ color: '#64748b' }} />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={800}>{trip.facility.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{trip.facility.address}</Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ p: 3 }}>
                         <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ mb: 2, display: 'block' }}>ODOMETER READINGS</Typography>
                         
                         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" fontWeight={600}>Start (Pick-up)</Typography>
                            <Typography variant="body1" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>{trip.odometer.start} mi</Typography>
                         </Box>
                         <Divider dashed sx={{ my: 1 }} />
                         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" fontWeight={600}>End (Drop-off)</Typography>
                            <Typography variant="body1" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>{trip.odometer.end} mi</Typography>
                         </Box>
                    </Box>
                </Paper>

                {/* Timeline */}
                <Paper sx={{ p: 3, borderRadius: 4, bgcolor: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', mb: 3 }}>
                     <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ mb: 2, display: 'block' }}>TIMELINE</Typography>
                     <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>ARRIVAL</Typography>
                                <Typography variant="h6" fontWeight={800}>{trip.timeline.pickup}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>COMPLETION</Typography>
                                <Typography variant="h6" fontWeight={800}>{trip.timeline.dropoff}</Typography>
                            </Box>
                        </Grid>
                     </Grid>
                </Paper>

                {/* Signatures */}
                <Paper sx={{ p: 3, borderRadius: 4, bgcolor: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', mb: 4 }}>
                     <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ mb: 2, display: 'block' }}>DIGITAL SIGNATURE</Typography>
                     
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#ECFDF5', borderRadius: 2, border: '1px solid #D1FAE5' }}>
                        <VerifiedUser sx={{ color: '#10B981' }} />
                        <Box>
                            <Typography variant="subtitle2" fontWeight={800} color="#065F46">Verified Signature</Typography>
                            <Typography variant="caption" color="#047857" fontWeight={600}>{trip.signature}</Typography>
                        </Box>
                     </Box>
                </Paper>

                <Button fullWidth variant="text" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Report an issue with this log
                </Button>

            </Container>
        </Box>
    );
}
