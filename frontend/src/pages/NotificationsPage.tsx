import { Box, Typography, Container, Paper, List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import { Notifications as NotificationsIcon, Info, Warning, Error as ErrorIcon, CheckCircle } from '@mui/icons-material';
import { format } from 'date-fns';

// Mock data until real backend integration
const mockNotifications = [
    { id: 1, title: 'System Maintenance', message: 'Scheduled maintenance tonight at 2 AM.', type: 'info', date: new Date() },
    { id: 2, title: 'Driver Compliance Alert', message: '3 drivers have expiring licenses.', type: 'warning', date: new Date(Date.now() - 3600000) },
    { id: 3, title: 'Trip Delayed', message: 'Trip #1234 is delayed by 15 minutes.', type: 'error', date: new Date(Date.now() - 7200000) },
    { id: 4, title: 'New Feature Added', message: 'You can now customize your dashboard.', type: 'success', date: new Date(Date.now() - 86400000) },
];

export default function NotificationsPage() {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight={700}>
                Notifications
            </Typography>
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                <List>
                    {mockNotifications.map((notification, index) => (
                        <div key={notification.id}>
                            <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                                <ListItemIcon>
                                    {notification.type === 'info' && <Info color="info" />}
                                    {notification.type === 'warning' && <Warning color="warning" />}
                                    {notification.type === 'error' && <ErrorIcon color="error" />}
                                    {notification.type === 'success' && <CheckCircle color="success" />}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                {notification.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {format(notification.date, 'MMM d, h:mm a')}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {notification.message}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                            {index < mockNotifications.length - 1 && <Divider component="li" />}
                        </div>
                    ))}
                </List>
            </Paper>
        </Container>
    );
}
