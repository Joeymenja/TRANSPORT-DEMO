import { Box, Typography, Button, Paper, Avatar } from '@mui/material';
import { Person, Phone, Message } from '@mui/icons-material';

interface PickupWorkflowProps {
    clientName: string;
    onConfirmPickup: (data: any) => void;
    onNoShow: (data: any) => void;
}

export default function PickupWorkflow({ clientName, onConfirmPickup, onNoShow }: PickupWorkflowProps) {
    return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>Arrived at Pickup</Typography>
            <Typography color="text.secondary" paragraph>
                You are at the pickup location. locating client...
            </Typography>

            <Paper sx={{ p: 3, mb: 4, borderRadius: 4, bgcolor: '#f8f9fa' }} elevation={0}>
                <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                    <Person sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700}>{clientName}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                    <Button variant="outlined" startIcon={<Phone />} sx={{ borderRadius: 20 }}>Call</Button>
                    <Button variant="outlined" startIcon={<Message />} sx={{ borderRadius: 20 }}>Chat</Button>
                </Box>
            </Paper>

            <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => onConfirmPickup({})}
                sx={{ borderRadius: 3, height: 56, fontSize: '1.1rem', mb: 2 }}
            >
                Confirm Client Picked Up
            </Button>

            <Button
                fullWidth
                variant="text"
                color="error"
                onClick={() => onNoShow({})}
            >
                Client No-Show
            </Button>
        </Box>
    );
}
