import { useState } from 'react';
import { Box, Container, Typography, Card, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, TextField, Grid, MenuItem } from '@mui/material';
import { Add, CalendarMonth, List as ListIcon, Visibility } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { tripApi } from '../api/trips';
import { format } from 'date-fns';
import { driverApi } from '../api/drivers';
import { memberApi } from '../api/members';

export default function TripsPage() {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [filters, setFilters] = useState({
        date: new Date().toISOString().split('T')[0],
        driverId: '',
        memberId: '',
        status: ''
    });

    const { data: trips, isLoading } = useQuery({
        queryKey: ['trips', filters],
        queryFn: () => tripApi.getTrips(filters),
    });

    const { data: drivers } = useQuery({
        queryKey: ['drivers'],
        queryFn: () => driverApi.getAll(),
    });

    const { data: members } = useQuery({
        queryKey: ['members'],
        queryFn: () => memberApi.getMembers(),
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'info';
            case 'IN_PROGRESS': return 'warning';
            case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'error';
            case 'PENDING_APPROVAL': return 'error';
            default: return 'default';
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h4" fontWeight={600}>Trip Management</Typography>
                    <Box bgcolor="white" borderRadius={1} border={1} borderColor="divider">
                        <IconButton
                            color={viewMode === 'list' ? 'primary' : 'default'}
                            onClick={() => setViewMode('list')}
                        >
                            <ListIcon />
                        </IconButton>
                        <IconButton
                            color={viewMode === 'calendar' ? 'primary' : 'default'}
                            onClick={() => setViewMode('calendar')}
                        >
                            <CalendarMonth />
                        </IconButton>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/trips/new')}
                    size="large"
                >
                    Schedule Trip
                </Button>
            </Box>

            <Card sx={{ p: 2, mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                        <TextField
                            label="Date"
                            type="date"
                            fullWidth
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            value={filters.date}
                            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            select
                            label="Driver"
                            fullWidth
                            size="small"
                            value={filters.driverId}
                            onChange={(e) => setFilters({ ...filters, driverId: e.target.value })}
                        >
                            <MenuItem value="">All Drivers</MenuItem>
                            {drivers?.map((d: any) => (
                                <MenuItem key={d.id} value={d.user.id}>
                                    {d.user.lastName}, {d.user.firstName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            select
                            label="Member"
                            fullWidth
                            size="small"
                            value={filters.memberId}
                            onChange={(e) => setFilters({ ...filters, memberId: e.target.value })}
                        >
                            <MenuItem value="">All Members</MenuItem>
                            {members?.map(m => (
                                <MenuItem key={m.id} value={m.id}>
                                    {m.lastName}, {m.firstName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            select
                            label="Status"
                            fullWidth
                            size="small"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <MenuItem value="">All Statuses</MenuItem>
                            <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                            <MenuItem value="COMPLETED">Completed</MenuItem>
                            <MenuItem value="CANCELLED">Cancelled</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </Card>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Member</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Pickup / Dropoff</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Driver / Vehicle</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>Loading trips...</TableCell>
                                </TableRow>
                            ) : trips?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        No trips found for the selected criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                trips?.map((trip) => (
                                    <TableRow key={trip.id} hover onClick={() => navigate(`/trips/${trip.id}`)} sx={{ cursor: 'pointer' }}>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={500}>
                                                {format(new Date(trip.tripDate), 'h:mm a')}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {format(new Date(trip.tripDate), 'MMM d, yyyy')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {trip.members?.map((tm: any) => (
                                                <Box key={tm.id}>
                                                    {tm.member?.firstName} {tm.member?.lastName}
                                                </Box>
                                            ))}
                                            {trip.isCarpool && <Chip label="Carpool" size="small" color="info" variant="outlined" sx={{ mt: 0.5 }} />}
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" flexDirection="column" gap={0.5}>
                                                <Typography variant="body2" noWrap>
                                                    <Box component="span" color="success.main" fontWeight="bold">P:</Box> {trip.stops?.find((s: any) => s.stopType === 'PICKUP')?.address}
                                                </Typography>
                                                <Typography variant="body2" noWrap>
                                                    <Box component="span" color="error.main" fontWeight="bold">D:</Box> {trip.stops?.find((s: any) => s.stopType === 'DROPOFF')?.address}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {trip.assignedDriverId ? (
                                                <Typography variant="body2">
                                                    Driver Assigned
                                                    {/* In a real app we'd lookup the name or join it */}
                                                </Typography>
                                            ) : (
                                                <Typography variant="caption" color="error">Unassigned</Typography>
                                            )}
                                            {trip.assignedVehicleId && (
                                                <Typography variant="caption" display="block">Vehicle Assigned</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={trip.tripType.replace('_', ' ')} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={trip.status.replace('_', ' ')}
                                                size="small"
                                                color={getStatusColor(trip.status) as any}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/trips/${trip.id}`); }}>
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Container>
    );
}
