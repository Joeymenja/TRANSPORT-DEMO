import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Button, 
    Container, 
    IconButton, 
    Alert,
    CircularProgress
} from '@mui/material';
import { ArrowBack, Delete, Save, Create } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import SignatureCanvas from '../../components/common/SignatureCanvas';
import api from '../../lib/api';

export default function DriverSignaturePage() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [signature, setSignature] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Load existing signature if available
    useEffect(() => {
        if (user?.signatureUrl) {
            setSignature(user.signatureUrl);
        }
    }, [user]);

    const handleSave = async (signatureData: string) => {
        if (!user) return;
        setIsSaving(true);
        setError(null);
        try {
            await api.patch('/drivers/profile/signature', {
                userId: user.id,
                signatureUrl: signatureData
            });
            setSaveSuccess(true);
            setSignature(signatureData);
            // In a real app, you might want to refresh the auth store user data here
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setError('Failed to save signature. Please try again.');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleClear = () => {
        setSignature(null);
        setIsDrawing(true);
    };

    return (
        <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', pb: 8 }}>
            {/* Header */}
            <Box sx={{ p: 2, pt: 6, display: 'flex', alignItems: 'center', bgcolor: 'white', borderBottom: '1px solid #eee' }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h6" fontWeight={800} sx={{ flex: 1, textAlign: 'center', mr: 5 }}>
                    Auto-Signature
                </Typography>
            </Box>

            <Container maxWidth="sm" sx={{ py: 3 }}>
                <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        Your Reusable Signature
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Save your signature once and it will be applied automatically to all your trip reports. You won't have to sign every individual report!
                    </Typography>

                    {saveSuccess && (
                        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                            Signature saved successfully!
                        </Alert>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box 
                        sx={{ 
                            border: '2px dashed #CBD5E1', 
                            borderRadius: 2, 
                            minHeight: 250,
                            position: 'relative',
                            bgcolor: '#F8FAFC',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}
                    >
                        {!isDrawing && signature ? (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                <img 
                                    src={signature} 
                                    alt="Saved Signature" 
                                    style={{ maxWidth: '100%', maxHeight: 200 }} 
                                />
                                <Box sx={{ mt: 2 }}>
                                    <Button 
                                        startIcon={<Create />} 
                                        onClick={() => setIsDrawing(true)}
                                        size="small"
                                    >
                                        Update Signature
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ width: '100%', height: '100%' }}>
                                <SignatureCanvas 
                                    onSave={handleSave}
                                    onCancel={() => setIsDrawing(false)}
                                    label="Sign your name carefully"
                                />
                            </Box>
                        )}
                    </Box>

                    {isSaving && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <CircularProgress size={24} sx={{ mr: 1 }} />
                            <Typography variant="body2">Saving to profile...</Typography>
                        </Box>
                    )}
                </Paper>

                <Alert severity="info" variant="outlined" sx={{ borderRadius: 3 }}>
                    <Typography variant="body2">
                        <strong>Compliance Note:</strong> By saving your signature, you authorize the system to apply it as your attestation on AHCCCS daily trip reports for trips you have completed.
                    </Typography>
                </Alert>
            </Container>
        </Box>
    );
}
