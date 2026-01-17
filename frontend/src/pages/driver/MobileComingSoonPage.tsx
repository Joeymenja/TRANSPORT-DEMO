import { Box, Typography, Button, Container } from '@mui/material';
import { ArrowBack, Construction } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '../../components/layout/MobileHeader';

interface Props {
    title: string;
}

export default function MobileComingSoonPage({ title }: Props) {
    const navigate = useNavigate();

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
            <MobileHeader title={title} backRoute="/driver" />
            
            <Container maxWidth="sm" sx={{ 
                height: 'calc(100vh - 56px)', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                textAlign: 'center',
                p: 3
            }}>
                <Box sx={{ 
                    bgcolor: '#f5f5f5', 
                    p: 3, 
                    borderRadius: '50%', 
                    mb: 3,
                    color: 'text.secondary'
                }}>
                    <Construction sx={{ fontSize: 48 }} />
                </Box>
                
                <Typography variant="h5" fontWeight={700} gutterBottom>
                    Coming Soon
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    The <strong>{title}</strong> feature is currently under development. Check back later for updates!
                </Typography>

                <Button 
                    variant="contained" 
                    fullWidth 
                    size="large"
                    onClick={() => navigate('/driver')}
                    sx={{ borderRadius: 2 }}
                >
                    Back to Dashboard
                </Button>
            </Container>
        </Box>
    );
}
