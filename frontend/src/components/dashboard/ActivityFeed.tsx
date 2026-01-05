import { Card, CardContent, Typography, List, ListItem, ListItemText, ListItemIcon, Box, Chip } from '@mui/material';
import { DirectionsCar, CheckCircle, Schedule, ErrorOutline, LocalTaxi } from '@mui/icons-material';
import { Trip } from '../../api/trips';

interface ActivityFeedProps {
    trips: Trip[];
}

export default function ActivityFeed({ trips }: ActivityFeedProps) {
    // Sort trips by "activeness": In Progress > Pending > Scheduled > Completed
    // In a real app, we'd use 'updatedAt'
    const recentActivity = [...trips].sort((a, b) => {
        const score = (status: string) => {
            if (status === 'IN_PROGRESS') return 4;
            if (status === 'PENDING_APPROVAL') return 3;
            if (status === 'SCHEDULED') return 2;
            return 1;
        };
        return score(b.status) - score(a.status);
    }).slice(0, 5); // Show top 5

    const getIcon = (status: string) => {
        switch (status) {
            case 'IN_PROGRESS': return <DirectionsCar color="warning" />;
            case 'PENDING_APPROVAL': return <ErrorOutline color="error" />;
            case 'COMPLETED': return <CheckCircle color="success" />;
            case 'SCHEDULED': return <Schedule color="info" />;
            default: return <LocalTaxi />;
        }
    };

    const getMessage = (trip: Trip) => {
        const id = `#${trip.id.slice(0, 5)}`;
        switch (trip.status) {
            case 'IN_PROGRESS': return `Trip ${id} is en route`;
            case 'PENDING_APPROVAL': return `Trip ${id} finished (Pending Review)`;
            case 'COMPLETED': return `Trip ${id} completed`;
            case 'SCHEDULED':
                return trip.assignedDriverId ? `Trip ${id} assigned to driver` : `Trip ${id} scheduled`;
            default: return `Trip ${id} updated`;
        }
    };

    return (
        <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ p: '0 !important', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                    <Typography variant="h6" fontWeight={600}>Fleet Activity</Typography>
                </Box>
                <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {recentActivity.length === 0 ? (
                        <Box p={3} textAlign="center"><Typography color="text.secondary">No recent activity</Typography></Box>
                    ) : (
                        recentActivity.map((trip) => (
                            <ListItem key={trip.id} divider>
                                <ListItemIcon>
                                    {getIcon(trip.status)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={getMessage(trip)}
                                    secondary={trip.assignedVehicle ? `Vehicle ${trip.assignedVehicle.vehicleNumber}` : 'Unassigned'}
                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                                />
                                <Chip
                                    label={trip.status.replace('_', ' ')}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.65rem', height: 20 }}
                                />
                            </ListItem>
                        ))
                    )}
                </List>
            </CardContent>
        </Card>
    );
}
