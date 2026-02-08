import { Box, Typography, Paper, List, ListItem, ListItemAvatar, ListItemText, Avatar, Chip, IconButton, Button, Container } from '@mui/material';
import { Notifications, Warning, Info, CheckCircle, ArrowBack, DeleteOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// Mock Data
const NOTIFICATIONS = [
    {
        id: 1,
        type: 'TRIP',
        title: 'New Trip Assigned',
        message: 'You have been assigned a new trip for Today at 2:30 PM.',
        time: new Date(),
        read: false
    },
    {
        id: 2,
        type: 'COMPLIANCE',
        title: 'Compliance Verification',
        message: 'Your vehicle inspection for today is due before your next trip.',
        time: new Date(Date.now() - 3600000), // 1 hour ago
        read: false
    },
    {
        id: 3,
        type: 'SYSTEM',
        title: 'System Maintenance',
        message: 'Scheduled maintenance this Sunday from 2AM to 4AM.',
        time: new Date(Date.now() - 86400000), // 1 day ago
        read: true
    }
];

export default function DriverUpdatesPage() {
    const navigate = useNavigate();

    const getIcon = (type: string) => {
        switch (type) {
            case 'TRIP': return <Notifications />;
            case 'COMPLIANCE': return <Warning />;
            case 'SUCCESS': return <CheckCircle />;
            default: return <Info />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'TRIP': return '#14B8A6'; // Teal
            case 'COMPLIANCE': return '#F59E0B'; // Amber
            case 'SUCCESS': return '#10B981'; // Green
            default: return '#64748B'; // Slate
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F5F7FA', pb: 10 }}>
            {/* Header */}
            <Box sx={{ p: 2, pt: 6, bgcolor: 'white', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                 <IconButton onClick={() => navigate('/driver')} sx={{ mr: 1 }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h6" fontWeight={800} sx={{ flex: 1, textAlign: 'center' }}>
                    Updates & Alerts
                </Typography>
                <Button size="small" color="inherit">Clear All</Button>
            </Box>

            <Container sx={{ py: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 2 }}>
                    TODAY
                </Typography>

                <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {NOTIFICATIONS.map((item) => (
                        <Paper 
                            key={item.id}
                            elevation={0}
                            sx={{ 
                                p: 2, 
                                borderRadius: 1, 
                                borderLeft: `4px solid ${getColor(item.type)}`,
                                bgcolor: item.read ? '#FAFAFA' : 'white',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateX(2px)' }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <Avatar sx={{ bgcolor: `${getColor(item.type)}15`, color: getColor(item.type), width: 40, height: 40, borderRadius: 1 }}>
                                    {getIcon(item.type)}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="subtitle2" fontWeight={700}>
                                            {item.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {format(item.time, 'h:mm a')}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                        {item.message}
                                    </Typography>
                                    {!item.read && (
                                        <Chip label="NEW" size="small" color="error" sx={{ borderRadius: 0.5, height: 16, fontSize: '0.6rem', mt: 1, fontWeight: 700 }} />
                                    )}
                                </Box>
                            </Box>
                        </Paper>
                    ))}
                </List>

                 <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                        No older notifications.
                    </Typography>
                 </Box>

            </Container>
        </Box>
    );
}
