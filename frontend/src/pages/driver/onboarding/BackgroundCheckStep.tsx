import { useState } from 'react';
import { Box, Typography, Button, FormControlLabel, Checkbox, TextField, Alert, Paper } from '@mui/material';
import { useAuthStore } from '../../../store/auth';

interface BackgroundCheckStepProps {
    onNext: () => void;
    onBack: () => void;
}

export default function BackgroundCheckStep({ onNext, onBack }: BackgroundCheckStepProps) {
    const user = useAuthStore((state) => state.user);
    const [agreed, setAgreed] = useState(false);
    const [ssn, setSsn] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        // Simulate API call to save consent
        setTimeout(() => {
            // In a real app, we would POST this to the backend
            console.log('Background consent saved for', user?.email);
            setLoading(false);
            onNext();
        }, 1000);
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>
                Background Check Authorization
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                To ensure the safety of our riders, we require a comprehensive background check. This includes a Motor Vehicle Record (MVR) review and a criminal history check.
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                Your information is stored securely and only used for verification purposes.
            </Alert>

            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#fafafa' }}>
                <Typography variant="subtitle2" gutterBottom>
                    Disclosure & Authorization
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    By clicking "I Agree" below, you authorize Transport Demo to obtain consumer reports about you from a consumer reporting agency. These reports may contain information regarding your driving history, criminal history, and credit history.
                </Typography>

                <TextField
                    label="Social Security Number"
                    placeholder="XXX-XX-XXXX"
                    value={ssn}
                    onChange={(e) => setSsn(e.target.value)}
                    fullWidth
                    sx={{ mb: 2, maxWidth: 300 }}
                    helperText="Required for identity verification"
                />

                <FormControlLabel
                    control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />}
                    label={
                        <Typography variant="body2">
                            I have read the disclosure and authorize Transport Demo to perform a background check.
                        </Typography>
                    }
                />
            </Paper>

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button variant="outlined" onClick={onBack} disabled={loading}>
                    Back
                </Button>
                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleSubmit}
                    disabled={!agreed || ssn.length < 9 || loading}
                >
                    {loading ? 'Processing...' : 'Authorize & Continue'}
                </Button>
            </Box>
        </Box>
    );
}
