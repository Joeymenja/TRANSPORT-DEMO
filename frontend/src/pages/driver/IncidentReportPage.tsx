import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Container, TextField, IconButton, Grid, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ArrowBack, CameraAlt, Warning, LocalHospital, DirectionsCar, Traffic } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { useToastStore } from '../../store/toast';

export default function IncidentReportPage() {
    const navigate = useNavigate();
    const { showToast } = useToastStore();
    const [incidentType, setIncidentType] = useState<string | null>('member');
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        // Mock submission
        showToast('Incident report submitted successfully.', 'success');
        navigate('/driver/dashboard');
    };

    return (
        <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', pb: 8 }}>
            {/* Header */}
            <Box sx={{ p: 2, pt: 6, display: 'flex', alignItems: 'center', bgcolor: 'white', borderBottom: '1px solid #eee' }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h6" fontWeight={800} sx={{ flex: 1, textAlign: 'center', mr: 5 }}>
                    Report Incident
                </Typography>
            </Box>

            <Container maxWidth="sm" sx={{ p: 3 }}>
                
                <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Warning color="error" />
                    <Typography variant="body2" color="error.main" fontWeight={600}>
                        If this is a medical or safety emergency, call 911 immediately.
                    </Typography>
                </Paper>

                <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block' }}>
                    INCIDENT TYPE
                </Typography>
                
                <ToggleButtonGroup
                    value={incidentType}
                    exclusive
                    onChange={(e, newType) => { if (newType) setIncidentType(newType); }}
                    fullWidth
                    sx={{ mb: 3, display: 'flex', gap: 1 }}
                >
                    <ToggleButton 
                        value="member" 
                        sx={{ 
                            flex: 1,
                            flexDirection: 'column', 
                            gap: 1, 
                            py: 2, 
                            borderRadius: '8px !important',
                            border: '1px solid #e0e0e0 !important',
                            '&.Mui-selected': { 
                                bgcolor: '#FEF2F2 !important', 
                                color: '#DC2626 !important',
                                borderColor: '#FECACA !important'
                            }
                        }}
                    >
                        <LocalHospital />
                        <Typography variant="caption" fontWeight={700}>Member Health</Typography>
                    </ToggleButton>

                    <ToggleButton 
                        value="vehicle" 
                        sx={{ 
                            flex: 1,
                            flexDirection: 'column', 
                            gap: 1, 
                            py: 2, 
                            borderRadius: '8px !important',
                            border: '1px solid #e0e0e0 !important',
                            '&.Mui-selected': { 
                                bgcolor: '#FFF8E1 !important', 
                                color: '#B45309 !important',
                                borderColor: '#FCD34D !important'
                            }
                        }}
                    >
                        <DirectionsCar />
                        <Typography variant="caption" fontWeight={700}>Vehicle Issue</Typography>
                    </ToggleButton>

                    <ToggleButton 
                        value="traffic" 
                        sx={{ 
                            flex: 1,
                            flexDirection: 'column', 
                            gap: 1, 
                            py: 2, 
                            borderRadius: '8px !important',
                            border: '1px solid #e0e0e0 !important',
                            '&.Mui-selected': { 
                                bgcolor: '#F3F4F6 !important', 
                                color: '#4B5563 !important',
                                borderColor: '#D1D5DB !important'
                            }
                        }}
                    >
                        <Traffic />
                        <Typography variant="caption" fontWeight={700}>Traffic/Other</Typography>
                    </ToggleButton>
                </ToggleButtonGroup>

                <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block' }}>
                    DESCRIPTION
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={6}
                    placeholder="Describe what happened in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={{ mb: 3, bgcolor: 'white' }}
                />

                <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block' }}>
                    EVIDENCE
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                    <Button 
                        variant="outlined" 
                        startIcon={<CameraAlt />} 
                        sx={{ flex: 1, py: 4, flexDirection: 'column', gap: 1, borderStyle: 'dashed', borderRadius: 2 }}
                    >
                        Add Photo
                    </Button>
                    <Button 
                        variant="outlined" 
                        startIcon={<CameraAlt />} 
                        sx={{ flex: 1, py: 4, flexDirection: 'column', gap: 1, borderStyle: 'dashed', borderRadius: 2 }}
                    >
                        Add Photo
                    </Button>
                </Box>

                <Button 
                    fullWidth 
                    variant="contained" 
                    color="error"
                    size="large"
                    onClick={handleSubmit}
                    sx={{ py: 1.5, fontWeight: 800, borderRadius: 2, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
                >
                    Submit Report
                </Button>

            </Container>
        </Box>
    );
}


