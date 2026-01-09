
import { Box, Card, CardContent, Container, Typography, Chip, IconButton, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { Notifications, Assignment, Cancel, AccessTime, Info, CheckCircle } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuthStore } from '../../store/auth';
import LoadingOverlay from '../../components/LoadingOverlay';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    status: 'UNREAD' | 'READ';
    createdAt: string;
    metadata?: {
        tripId?: string;
        [key: string]: any;
    };
}

export default function DriverUpdatesPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await api.get<Notification[]>('/notifications');
            return data;
        },
        refetchInterval: 15000 // Poll every 15s for updates
    });

    const markReadMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
    });

    const handleNotificationClick = (notification: Notification) => {
        if (notification.status === 'UNREAD') {
            markReadMutation.mutate(notification.id);
        }

        // Navigate based on type/metadata
        if (notification.metadata?.tripId) {
            navigate(`/driver/trips/${notification.metadata.tripId}`);
        } else {
            // Default fallback
            navigate('/driver');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'TRIP_ASSIGNED': return <Assignment color="primary" />;
            case 'TRIP_CANCELLED': return <Cancel color="error" />;
            case 'TRIP_UPDATED': return <AccessTime color="warning" />;
            case 'TRIP_REPORT_SUBMITTED': return <CheckCircle color="success" />;
            default: return <Info color="info" />;
        }
    };

    if (isLoading) return <LoadingOverlay open={true} />;

    return (
        <Container maxWidth="sm" sx={{ py: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="700" gutterBottom>
                    Trip Updates
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Real-time alerts about your schedule.
                </Typography>
            </Box>

            {notifications.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6 }}>
                    <Notifications sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
                    <Typography variant="body1" fontWeight="500">No updates yet</Typography>
                    <Typography variant="caption">You're all caught up.</Typography>
                </Box>
            ) : (
                <List sx={{ width: '100%', bgcolor: 'transparent' }}>
                    {notifications.map((notification) => (
                        <Card 
                            key={notification.id} 
                            elevation={0}
                            sx={{ 
                                mb: 2, 
                                border: '1px solid',
                                borderColor: notification.status === 'UNREAD' ? 'primary.light' : '#eee',
                                bgcolor: notification.status === 'UNREAD' ? '#f0f9ff' : 'white',
                                borderRadius: 3,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: '#fafafa' }
                            }}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'white', border: '1px solid #eee' }}>
                                        {getIcon(notification.type)}
                                    </Avatar>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                            <Typography variant="subtitle2" fontWeight={notification.status === 'UNREAD' ? 700 : 500}>
                                                {notification.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                                            {notification.message}
                                        </Typography>
                                        {notification.status === 'UNREAD' && (
                                            <Chip label="New" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem', mt: 1 }} />
                                        )}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </List>
            )}
        </Container>
    );
}
