import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';
import { useAuthStore } from '../../../store/auth';
import SignatureCanvas from '../../../components/common/SignatureCanvas';
import axios from 'axios';

// Assuming we add a method to update user profile in auth store or a separate user service
// For now, I'll direct call an API endpoint we need to ensure exists or add to report controller/user controller.
const API_URL = 'http://localhost:3003';

export default function DriverSignatureSettings() {
    const { user, checkAuth } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [savedSignature, setSavedSignature] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (user?.signatureUrl) {
            setSavedSignature(user.signatureUrl);
        }
    }, [user]);

    const handleSave = async (signatureDataUrl: string) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            // We need an endpoint to update user profile/signature
            // Let's assume PUT /users/profile or similar. 
            // Since we haven't built that specific endpoint, let's create it or use a placeholder
            // In a real app, strict auth checks apply.
            await axios.put(`${API_URL}/drivers/profile/signature`, {
                signatureUrl: signatureDataUrl
            });

            // Refresh auth user to get updated signature
            await checkAuth();
            setSuccess('Signature saved successfully!');
            setSavedSignature(signatureDataUrl);
        } catch (err) {
            setError('Failed to save signature. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Typography variant="h6" gutterBottom>Driver Signature</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Save your default signature here to quickly sign trip reports.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {savedSignature ? (
                <Box textAlign="center" my={2}>
                    <Typography variant="caption" display="block" gutterBottom>Current Signature:</Typography>
                    <Box
                        sx={{
                            border: '1px solid #eee',
                            borderRadius: 1,
                            p: 2,
                            display: 'inline-block'
                        }}
                    >
                        <img src={savedSignature} alt="Driver Signature" style={{ maxHeight: 100, maxWidth: '100%' }} />
                    </Box>
                    <Box mt={2}>
                        <Button variant="outlined" size="small" onClick={() => setSavedSignature(null)}>
                            Update Signature
                        </Button>
                    </Box>
                </Box>
            ) : (
                <Box>
                    <SignatureCanvas
                        onSave={handleSave}
                        label="Sign Here"
                    />
                    {loading && <CircularProgress size={24} sx={{ mt: 2 }} />}
                </Box>
            )}
        </Paper>
    );
}
