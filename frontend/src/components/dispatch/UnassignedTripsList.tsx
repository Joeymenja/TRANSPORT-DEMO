import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem
} from '@mui/material';
import { PersonAdd, Schedule, LocationOn } from '@mui/icons-material';
import { Trip, tripApi } from '../../api/trips';
import { Driver } from '../../api/drivers';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';

interface UnassignedTripsListProps {
    trips: Trip[];
    drivers: Driver[];
}

export default function UnassignedTripsList({ trips, drivers }: UnassignedTripsListProps) {
    const queryClient = useQueryClient();
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [selectedDriverId, setSelectedDriverId] = useState<string>('');

    // Client-side filter for Unassigned Trips
    // Criteria: No driver assigned OR status is PENDING_APPROVAL/SCHEDULED but no driver
    const unassignedTrips = trips.filter(t =>
        (!t.assignedDriverId) &&
        (t.status === 'SCHEDULED' || t.status === 'PENDING_APPROVAL')
    );

    const assignMutation = useMutation({
        mutationFn: async () => {
            if (!selectedTrip || !selectedDriverId) return;
            await tripApi.updateTrip(selectedTrip.id, {
                assignedDriverId: selectedDriverId,
                status: 'SCHEDULED'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trips'] });
            setSelectedTrip(null);
            setSelectedDriverId('');
        }
    });

    const handleAssign = () => {
        assignMutation.mutate();
    };

    return (
        <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #eee', bgcolor: '#fff' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={600}>Unassigned Trips</Typography>
                        <Chip label={unassignedTrips.length} size="small" color={unassignedTrips.length > 0 ? "warning" : "default"} />
                    </Box>
                </Box>

                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
                    {unassignedTrips.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="text.secondary">All trips assigned.</Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {unassignedTrips.map((trip) => (
                                <ListItem
                                    key={trip.id}
                                    divider
                                    sx={{
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        gap: 1,
                                        '&:hover': { bgcolor: '#f9f9f9' }
                                    }}
                                >
                                    <Box width="100%" display="flex" justifyContent="space-between">
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            #{trip.id.slice(0, 8)}
                                        </Typography>
                                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Schedule fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
                                            {format(new Date(trip.tripDate), 'h:mm a')}
                                        </Typography>
                                    </Box>

                                    <Box display="flex" gap={1} alignItems="start">
                                        <LocationOn fontSize="small" color="disabled" sx={{ mt: 0.3 }} />
                                        <Box>
                                            {trip.stops.map((stop, i) => (
                                                <Typography key={i} variant="body2" noWrap sx={{ maxWidth: 220 }}>
                                                    {stop.stopType === 'PICKUP' ? 'P: ' : 'D: '}
                                                    {stop.address.split(',')[0]}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Box>

                                    <Button
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        startIcon={<PersonAdd />}
                                        onClick={() => setSelectedTrip(trip)}
                                        sx={{ mt: 1 }}
                                    >
                                        Assign Driver
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </CardContent>

            {/* Assign Dialog */}
            <Dialog open={!!selectedTrip} onClose={() => setSelectedTrip(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Assign Trip</DialogTitle>
                <DialogContent>
                    {selectedTrip && (
                        <Box sx={{ pt: 1 }}>
                            <Typography variant="body2" gutterBottom>
                                Trip #{selectedTrip.id.slice(0, 8)} • {format(new Date(selectedTrip.tripDate), 'h:mm a')}
                            </Typography>

                            <TextField
                                select
                                label="Select Driver"
                                fullWidth
                                margin="normal"
                                value={selectedDriverId}
                                onChange={(e) => setSelectedDriverId(e.target.value)}
                            >
                                {drivers
                                    .filter(d => d.user.isActive) // Only show active drivers
                                    .map(driver => (
                                        <MenuItem key={driver.id} value={driver.id}>
                                            {driver.user.firstName} {driver.user.lastName}
                                            {driver.currentStatus ? ` (${driver.currentStatus})` : ''}
                                        </MenuItem>
                                    ))}
                            </TextField>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedTrip(null)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleAssign}
                        disabled={!selectedDriverId || assignMutation.isPending}
                    >
                        {assignMutation.isPending ? 'Assigning...' : 'Assign'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
