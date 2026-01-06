import { Card, CardContent, Typography, List, ListItem, ListItemText, ListItemIcon, Box, Chip } from '@mui/material';
import { DirectionsCar, CheckCircle, Schedule, ErrorOutline, LocalTaxi, AssignmentInd, ContactMail } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { activityApi, ActivityLog } from '../../api/activity';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
    trips?: any[]; // Legacy prop kept for compatibility, but unused
}

export default function ActivityFeed({ }: ActivityFeedProps) {

    const { data, isLoading } = useQuery({
        queryKey: ['activity-logs'],
        queryFn: () => activityApi.getLogs(20),
        refetchInterval: 10000 // Poll every 10s for new activity
    });
    const logs = Array.isArray(data) ? data : [];

    const getIcon = (type: string) => {
        switch (type) {
            case 'TRIP_CREATED': return <Schedule color="info" />;
            case 'TRIP_COMPLETED': return <CheckCircle color="success" />;
            case 'DRIVER_REGISTERED': return <ContactMail color="warning" />;
            case 'REPORT_SUBMITTED': return <AssignmentInd color="primary" />;
            default: return <LocalTaxi />;
        }
    };

    return (
        <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ p: '0 !important', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                    <Typography variant="h6" fontWeight={600}>Fleet Activity</Typography>
                </Box>
                <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {isLoading ? (
                        <Box p={3} textAlign="center"><Typography color="text.secondary">Loading activity...</Typography></Box>
                    ) : logs.length === 0 ? (
                        <Box p={3} textAlign="center"><Typography color="text.secondary">No recent activity</Typography></Box>
                    ) : (
                        logs.map((log) => (
                            <ListItem key={log.id} divider>
                                <ListItemIcon>
                                    {getIcon(log.type)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={log.message}
                                    secondary={formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                                    secondaryTypographyProps={{ variant: 'caption' }}
                                />
                                {/* <Chip
                                    label={log.type.split('_')[0]}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.65rem', height: 20 }}
                                /> */}
                            </ListItem>
                        ))
                    )}
                </List>
            </CardContent>
        </Card>
    );
}
