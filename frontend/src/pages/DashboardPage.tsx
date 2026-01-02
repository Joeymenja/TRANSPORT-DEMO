import { Box, Container, Grid, Card, CardContent, Typography, Button, Chip, Collapse, IconButton, Dialog, DialogTitle, DialogContent, Divider, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import {
    DirectionsCar,
    Schedule,
    CheckCircle,
    EventAvailable,
    ExpandMore,
    ExpandLess,
    GpsFixed,
    History,
    Visibility,
    VerifiedUser,
    ErrorOutline
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '../api/trips';
import { format } from 'date-fns';
import { useState } from 'react';

export default function DashboardPage() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
    const [previewSignature, setPreviewSignature] = useState<{ name: string, data: string } | null>(null);

    const { data: trips = [], isLoading } = useQuery({
        queryKey: ['trips', today],
        queryFn: () => tripApi.getTrips({ date: today }),
    });

    const stats = {
        active: trips.filter(t => t.status === 'IN_PROGRESS').length,
        scheduled: trips.filter(t => t.status === 'SCHEDULED').length,
        completed: trips.filter(t => t.status === 'COMPLETED' || t.status === 'FINALIZED').length,
    };

    const StatCard = ({ title, value, icon, color }: any) => (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ color, mr: 1 }}>
                        {icon}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        {title}
                    </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 600, color: '#212121' }}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#212121', mb: 1 }}>
                    Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </Typography>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Trips"
                        value={stats.active}
                        icon={<DirectionsCar />}
                        color="#FF9800"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Scheduled"
                        value={stats.scheduled}
                        icon={<Schedule />}
                        color="#0096D6"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Completed"
                        value={stats.completed}
                        icon={<CheckCircle />}
                        color="#00C853"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Today"
                        value={trips.length}
                        icon={<EventAvailable />}
                        color="#757575"
                    />
                </Grid>
            </Grid>

            {/* Upcoming Trips */}
            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Today's Trips
                        </Typography>
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: '#0096D6',
                                textTransform: 'none',
                                '&:hover': { bgcolor: '#0077B5' },
                            }}
                        >
                            Create Trip
                        </Button>
                    </Box>

                    {isLoading ? (
                        <Typography>Loading...</Typography>
                    ) : trips.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Typography variant="body1" color="text.secondary">
                                No trips scheduled for today
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Create a trip to get started
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {trips.map((trip) => (
                                <Card
                                    key={trip.id}
                                    variant="outlined"
                                    sx={{
                                        borderRadius: 2,
                                        '&:hover': {
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        },
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                                        Trip #{trip.id.slice(0, 8)}
                                                    </Typography>
                                                    {trip.isCarpool && (
                                                        <Chip
                                                            label={`${trip.memberCount} clients`}
                                                            size="small"
                                                            sx={{ bgcolor: '#E3F2FD', color: '#0096D6' }}
                                                        />
                                                    )}
                                                </Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {trip.tripType.replace('_', ' ')} • {trip.stops.length} stops
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ textAlign: 'right', mr: 2 }}>
                                                    <Chip
                                                        label={trip.status}
                                                        size="small"
                                                        color={
                                                            trip.status === 'IN_PROGRESS' ? 'warning' :
                                                                trip.status === 'SCHEDULED' ? 'info' :
                                                                    'success'
                                                        }
                                                        sx={{ mb: 1 }}
                                                    />
                                                </Box>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => tripApi.downloadReport(trip.id)}
                                                    sx={{ textTransform: 'none' }}
                                                >
                                                    PDF Report
                                                </Button>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setExpandedTripId(expandedTripId === trip.id ? null : trip.id)}
                                                >
                                                    {expandedTripId === trip.id ? <ExpandLess /> : <ExpandMore />}
                                                </IconButton>
                                            </Box>
                                        </Box>

                                        <Collapse in={expandedTripId === trip.id} timeout="auto" unmountOnExit>
                                            <Box sx={{ mt: 3 }}>
                                                <Divider sx={{ mb: 2 }} />
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} md={6}>
                                                        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: '#0096D6' }}>
                                                            <VerifiedUser fontSize="small" /> Member Compliance (Signatures)
                                                        </Typography>
                                                        <List disablePadding>
                                                            {trip.members.map((tm: any) => (
                                                                <ListItem key={tm.id} disableGutters sx={{ py: 0.5 }}>
                                                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                                                        {tm.memberSignatureBase64 ?
                                                                            <CheckCircle fontSize="small" sx={{ color: '#00C853' }} /> :
                                                                            <ErrorOutline fontSize="small" sx={{ color: '#F44336' }} />
                                                                        }
                                                                    </ListItemIcon>
                                                                    <ListItemText
                                                                        primary={`${tm.member.firstName} ${tm.member.lastName}`}
                                                                        secondary={tm.memberSignatureBase64 ? 'Signature Captured' : 'Awaiting Signature'}
                                                                        primaryTypographyProps={{ variant: 'body2' }}
                                                                        secondaryTypographyProps={{ variant: 'caption' }}
                                                                    />
                                                                    {tm.memberSignatureBase64 && (
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => setPreviewSignature({
                                                                                name: `${tm.member.firstName} ${tm.member.lastName}`,
                                                                                data: tm.memberSignatureBase64
                                                                            })}
                                                                        >
                                                                            <Visibility fontSize="small" />
                                                                        </IconButton>
                                                                    )}
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: '#FF9800' }}>
                                                            <GpsFixed fontSize="small" /> Stop Audit Log (GPS)
                                                        </Typography>
                                                        <List disablePadding>
                                                            {trip.stops.map((stop: any, idx: number) => (
                                                                <ListItem key={stop.id} disableGutters sx={{ py: 0.5 }}>
                                                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                                                        <History fontSize="small" />
                                                                    </ListItemIcon>
                                                                    <ListItemText
                                                                        primary={`${idx + 1}. ${stop.stopType}: ${stop.address.split(',')[0]}`}
                                                                        secondary={
                                                                            stop.actualArrivalTime ?
                                                                                `Arrived: ${new Date(stop.actualArrivalTime).toLocaleTimeString()} ${stop.gpsLatitude ? `@ ${stop.gpsLatitude.toFixed(4)}, ${stop.gpsLongitude.toFixed(4)}` : '(No GPS)'}` :
                                                                                'Pending'
                                                                        }
                                                                        primaryTypographyProps={{ variant: 'body2' }}
                                                                        secondaryTypographyProps={{ variant: 'caption' }}
                                                                    />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </Collapse>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!previewSignature} onClose={() => setPreviewSignature(null)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ variant: 'subtitle1' }}>Signature: {previewSignature?.name}</DialogTitle>
                <DialogContent>
                    <Box
                        component="img"
                        src={previewSignature?.data}
                        sx={{ width: '100%', border: '1px solid #eee', borderRadius: 1 }}
                    />
                </DialogContent>
            </Dialog>
        </Container>
    );
}
