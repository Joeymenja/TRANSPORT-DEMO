import { useState, useEffect } from 'react';
import { Box, Container, Typography, Stepper, Step, StepLabel, Card, CardContent } from '@mui/material';
import { useAuthStore } from '../../store/auth';
import { useNavigate } from 'react-router-dom';
import PersonalInfoStep from './onboarding/PersonalInfoStep';
import DocumentUploadStep from './onboarding/DocumentUploadStep';
import VehicleInfoStep from './onboarding/VehicleInfoStep';
import BackgroundCheckStep from './onboarding/BackgroundCheckStep';
import PolicyReviewStep from './onboarding/PolicyReviewStep';

// Steps from Requirements
const STEPS = [
    'Personal Information',
    'License & Certifications',
    'Vehicle Information',
    'Background Check',
    'Review Policies'
];

export default function DriverOnboardingPage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const [activeStep, setActiveStep] = useState(user?.onboardingStep || 0);

    // Force rebuild check
    console.log('DriverOnboardingPage loaded', activeStep);

    // Sync local step with store if it changes
    useEffect(() => {
        if (user?.onboardingStep !== undefined) {
            setActiveStep(user.onboardingStep || 0);
        }
    }, [user?.onboardingStep]);

    const handleNext = () => {
        // Optimistic update locally
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return <PersonalInfoStep onNext={handleNext} />;
            case 1:
                return <DocumentUploadStep onNext={handleNext} onBack={handleBack} />;
            case 2:
                return <VehicleInfoStep onNext={handleNext} onBack={handleBack} />;
            case 3:
                return <BackgroundCheckStep onNext={handleNext} onBack={handleBack} />;
            case 4:
                return <PolicyReviewStep onNext={handleNext} onBack={handleBack} />;
            default:
                return <Typography>Unknown Step</Typography>;
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f0f4f8', py: 4 }}>
            <Container maxWidth="md">
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                        Complete Your Profile
                    </Typography>
                    <Typography color="text.secondary">
                        Step {activeStep + 1} of {STEPS.length}: {STEPS[activeStep]}
                    </Typography>
                </Box>

                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                    {STEPS.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <CardContent sx={{ p: 4 }}>
                        {renderStepContent(activeStep)}
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}
