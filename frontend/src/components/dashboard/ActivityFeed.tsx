import { Card, CardContent, Typography, List, ListItem, ListItemText, ListItemIcon, Box, Chip } from '@mui/material';
import { DirectionsCar, CheckCircle, Schedule, ErrorOutline, LocalTaxi, AssignmentInd, ContactMail } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { activityApi, ActivityLog } from '../../api/activity';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
    trips?: any[];
    theme?: 'light' | 'dark';
}

export default function ActivityFeed({ theme = 'light' }: ActivityFeedProps) {

    const { data, isLoading } = useQuery({
        queryKey: ['activity-logs'],
        queryFn: () => activityApi.getLogs(20),
        refetchInterval: 3000 // Poll every 3s for new activity
    });
    const logs = Array.isArray(data) ? data : [];

    const isDark = theme === 'dark';

    const getIcon = (type: string) => {
        // Bright, neon colors for dark mode
        const colorProps = isDark ? {
            info: '#64d2ff',
            success: '#30d158',
            warning: '#ff9f0a',
            primary: '#0a84ff',
            secondary: '#bf5af2',
            action: '#8e8e93'
        } : {
            info: 'info',
            success: 'success',
            warning: 'warning',
            primary: 'primary',
            secondary: 'secondary',
            action: 'action'
        };

        const sxProps = isDark ? { filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' } : {};

        switch (type) {
            case 'TRIP_CREATED': return <Schedule color={isDark ? undefined : "info"} sx={{ ...sxProps, color: isDark ? colorProps.info : undefined }} />;
            case 'TRIP_COMPLETED': return <CheckCircle color={isDark ? undefined : "success"} sx={{ ...sxProps, color: isDark ? colorProps.success : undefined }} />;
            case 'DRIVER_REGISTERED': return <ContactMail color={isDark ? undefined : "warning"} sx={{ ...sxProps, color: isDark ? colorProps.warning : undefined }} />;
            case 'REPORT_SUBMITTED': return <AssignmentInd color={isDark ? undefined : "primary"} sx={{ ...sxProps, color: isDark ? colorProps.primary : undefined }} />;
            case 'DRIVER_STATUS_CHANGED': return <LocalTaxi color={isDark ? undefined : "secondary"} sx={{ ...sxProps, color: isDark ? colorProps.secondary : undefined }} />;
            case 'MEMBER_CREATED': return <AssignmentInd color={isDark ? undefined : "info"} sx={{ ...sxProps, color: isDark ? colorProps.info : undefined }} />;
            case 'SYSTEM': return <ErrorOutline color={isDark ? undefined : "action"} sx={{ ...sxProps, color: isDark ? colorProps.action : undefined }} />;
            default: return <LocalTaxi sx={{ ...sxProps, color: isDark ? '#fff' : undefined }} />;
        }
    };

    const Content = (
        <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
            {isLoading ? (
                <Box p={3} textAlign="center"><Typography color={isDark ? "rgba(255,255,255,0.5)" : "text.secondary"}>Loading activity...</Typography></Box>
            ) : logs.length === 0 ? (
                <Box p={3} textAlign="center"><Typography color={isDark ? "rgba(255,255,255,0.5)" : "text.secondary"}>No recent activity</Typography></Box>
            ) : (
                logs.map((log) => (
                    <ListItem key={log.id} sx={{ 
                        borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #eee',
                        '&:last-child': { borderBottom: 'none' },
                        py: 1.5
                    }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                            {getIcon(log.type)}
                        </ListItemIcon>
                        <ListItemText
                            primary={log.message}
                            secondary={formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 500, color: isDark ? 'white' : 'textArrow' }}
                            secondaryTypographyProps={{ variant: 'caption', color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary' }}
                        />
                    </ListItem>
                ))
            )}
        </List>
    );

    if (isDark) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="overline" color="#8e8e93" fontWeight={800} sx={{ letterSpacing: 1, px: 3, pt: 2, display: 'block' }}>
                    LIVE FEED
                </Typography>
                {Content}
            </Box>
        );
    }

    return (
        <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ p: '0 !important', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                    <Typography variant="h6" fontWeight={600}>Fleet Activity</Typography>
                </Box>
                {Content}
            </CardContent>
        </Card>
    );
}
