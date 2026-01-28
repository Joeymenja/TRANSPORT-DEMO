
import { Box, Card, CardContent, Container, Typography, Chip, IconButton, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { Notifications, Assignment, Cancel, AccessTime, Info, CheckCircle } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuthStore } from '../../store/auth';
import LoadingOverlay from '../../components/LoadingOverlay';
import MobileHeader from '../../components/layout/MobileHeader';

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
        <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
            <MobileHeader title="Updates" />

            <Container maxWidth="sm" sx={{ py: 2, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                        Real-time alerts about your schedule
                    </Typography>
                </Box>

                {notifications.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Box sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            bgcolor: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                        }}>
                            <Notifications sx={{ fontSize: 32, color: '#94a3b8' }} />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#334155' }}>
                            No updates yet
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
                            You're all caught up
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ width: '100%', bgcolor: 'transparent', p: 0 }}>
                        {notifications.map((notification) => (
                            <Card
                                key={notification.id}
                                elevation={0}
                                sx={{
                                    mb: 1.5,
                                    border: '1px solid',
                                    borderColor: notification.status === 'UNREAD' ? '#bfdbfe' : '#f0f0f0',
                                    bgcolor: notification.status === 'UNREAD' ? '#eff6ff' : 'white',
                                    borderRadius: 2.5,
                                    cursor: 'pointer',
                                    '&:active': { transform: 'scale(0.99)', bgcolor: '#f8fafc' },
                                    transition: 'all 0.15s ease',
                                    overflow: 'hidden',
                                }}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                        <Avatar sx={{
                                            bgcolor: notification.status === 'UNREAD' ? '#dbeafe' : '#f1f5f9',
                                            border: 'none',
                                            width: 40,
                                            height: 40,
                                        }}>
                                            {getIcon(notification.type)}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.25 }}>
                                                <Typography variant="subtitle2" fontWeight={notification.status === 'UNREAD' ? 700 : 500} sx={{ color: '#1e293b', fontSize: '0.88rem' }} noWrap>
                                                    {notification.title}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', flexShrink: 0, ml: 1 }}>
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.4, fontSize: '0.8rem' }}>
                                                {notification.message}
                                            </Typography>
                                            {notification.status === 'UNREAD' && (
                                                <Chip
                                                    label="New"
                                                    size="small"
                                                    sx={{
                                                        height: 18,
                                                        fontSize: '0.6rem',
                                                        fontWeight: 800,
                                                        mt: 0.75,
                                                        bgcolor: '#0096D6',
                                                        color: 'white',
                                                        borderRadius: 1,
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </List>
                )}
            </Container>
        </Box>
    );
}
