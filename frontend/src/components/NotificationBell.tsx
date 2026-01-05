import { useState } from 'react';
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Typography,
    Box,
    Divider,
    Button,
    ListItemText,
    ListItemIcon,
    Chip,
} from '@mui/material';
import {
    Notifications,
    PersonAdd,
    Assignment,
    Warning,
    CheckCircle,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi, Notification } from '../api/notifications';
import { useNavigate } from 'react-router-dom';

const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
        case 'DRIVER_PENDING':
            return <PersonAdd color="primary" />;
        case 'TRIP_REPORT_SUBMITTED':
            return <Assignment color="info" />;
        case 'INCIDENT_REPORTED':
            return <Warning color="error" />;
        default:
            return <Notifications />;
    }
};

const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
        case 'DRIVER_PENDING':
            return '#1976d2';
        case 'TRIP_REPORT_SUBMITTED':
            return '#0288d1';
        case 'INCIDENT_REPORTED':
            return '#d32f2f';
        default:
            return '#757575';
    }
};

export default function NotificationBell() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications', 'unread'],
        queryFn: notificationApi.getUnread,
        refetchInterval: 30000, // Poll every 30 seconds
    });

    const markAsReadMutation = useMutation({
        mutationFn: (id: string) => notificationApi.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: () => notificationApi.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            handleClose();
        },
    });

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsReadMutation.mutate(notification.id);

        // Navigate based on notification type
        switch (notification.type) {
            case 'DRIVER_PENDING':
                navigate('/drivers');
                break;
            case 'TRIP_REPORT_SUBMITTED':
            case 'INCIDENT_REPORTED':
                if (notification.metadata?.tripId) {
                    navigate(`/trips/${notification.metadata.tripId}`);
                }
                break;
        }

        handleClose();
    };

    const open = Boolean(anchorEl);
    const unreadCount = notifications.length;

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleClick}
                sx={{
                    ml: 2,
                    '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                    },
                }}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <Notifications />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 400,
                        maxHeight: 500,
                        mt: 1,
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={700}>
                        Notifications
                    </Typography>
                    {unreadCount > 0 && (
                        <Chip
                            label={`${unreadCount} new`}
                            size="small"
                            color="primary"
                            sx={{ height: 24 }}
                        />
                    )}
                </Box>

                <Divider />

                {notifications.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <CheckCircle sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                            All caught up! No new notifications.
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
                            {notifications.map((notification) => (
                                <MenuItem
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    sx={{
                                        py: 2,
                                        borderLeft: `4px solid ${getNotificationColor(notification.type)}`,
                                        '&:hover': {
                                            bgcolor: '#f5f5f5',
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        {getNotificationIcon(notification.type)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                {notification.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                    {notification.message}
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </MenuItem>
                            ))}
                        </Box>

                        <Divider />

                        <Box sx={{ p: 1 }}>
                            <Button
                                fullWidth
                                size="small"
                                onClick={() => markAllAsReadMutation.mutate()}
                                disabled={markAllAsReadMutation.isPending}
                            >
                                Mark All as Read
                            </Button>
                        </Box>
                    </>
                )}
            </Menu>
        </>
    );
}
