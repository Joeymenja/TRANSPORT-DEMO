import { useState } from 'react';
import { Box, Typography, Button, FormControlLabel, Checkbox, Paper } from '@mui/material';
import { useAuthStore } from '../../../store/auth';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../api/auth';

interface PolicyReviewStepProps {
    onNext: () => void;
    onBack: () => void;
}

export default function PolicyReviewStep({ onNext: _onNext, onBack }: PolicyReviewStepProps) {
    const navigate = useNavigate();
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [agreedToSafety, setAgreedToSafety] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useAuthStore();

    const handleSubmit = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            // 1. Update Profile to complete onboarding (Step 5)
            await authApi.updateProfile({ onboardingStep: 5 });

            // 2. Update local store
            const updatedUser = { ...user, onboardingStep: 5 };
            // We need to access the store's setter, which is not directly exposed as 'setUser' in the component usually,
            // but we can assume the user will reload or we can force a reload. 
            // Better: useAuthStore.getState().setUser(updatedUser, useAuthStore.getState().token!);
            useAuthStore.getState().setUser(updatedUser, useAuthStore.getState().token!);

            console.log('Policies accepted. Application submitted.');

            // 3. Navigate to Dashboard
            navigate('/driver/dashboard');
        } catch (error) {
            console.error('Failed to submit application:', error);
            alert('Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>
                Review Policies & Training
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Please review and accept our platform policies to complete your application.
            </Typography>

            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Terms of Service
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, height: 150, overflowY: 'auto', mb: 1, bgcolor: '#fafafa' }}>
                    <Typography variant="caption" color="text.secondary">
                        1. <strong>Independent Contractor Relationship</strong>: You acknowledge that you are an independent contractor, not an employee...<br /><br />
                        2. <strong>Safety Standards</strong>: You agree to maintain your vehicle in safe operating condition and adhere to all traffic laws...<br /><br />
                        3. <strong>Zero Tolerance</strong>: We have a zero-tolerance policy for drug and alcohol use while operating on the platform...<br /><br />
                        4. <strong>Non-Discrimination</strong>: You agree to provide services to all passengers regardless of race, religion, gender, or disability...
                    </Typography>
                </Paper>
                <FormControlLabel
                    control={<Checkbox checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />}
                    label={<Typography variant="body2">I accept the Terms of Service</Typography>}
                />
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Community Safety Guidelines
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, height: 100, overflowY: 'auto', mb: 1, bgcolor: '#fafafa' }}>
                    <Typography variant="caption" color="text.secondary">
                        - Treat everyone with respect.<br />
                        - Help keep one another safe.<br />
                        - Follow the law.
                    </Typography>
                </Paper>
                <FormControlLabel
                    control={<Checkbox checked={agreedToSafety} onChange={(e) => setAgreedToSafety(e.target.checked)} />}
                    label={<Typography variant="body2">I accept the Community Safety Guidelines</Typography>}
                />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button variant="outlined" onClick={onBack} disabled={loading}>
                    Back
                </Button>
                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleSubmit}
                    disabled={!agreedToTerms || !agreedToSafety || loading}
                    color="success"
                >
                    {loading ? 'Submitting Application...' : 'Submit Application'}
                </Button>
            </Box>
        </Box>
    );
}
