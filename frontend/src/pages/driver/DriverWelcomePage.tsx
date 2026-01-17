import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function DriverWelcomePage() {
    const navigate = useNavigate();
    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4">Driver Welcome DEBUG</Typography>
            <Button onClick={() => navigate('/driver/onboarding')}>Go to Onboarding</Button>
        </Box>
    );
}
