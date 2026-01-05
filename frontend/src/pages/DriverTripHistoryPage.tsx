import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Breadcrumbs,
    Link,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    Tooltip
} from '@mui/material';
import {
    History,
    Search,
    Download,
    Visibility,
    FilterList
} from '@mui/icons-material';
import { driverApi, Driver } from '../api/drivers';

export const DriverTripHistoryPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [driver, setDriver] = useState<Driver | null>(null);
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (id) loadData(id);
    }, [id]);

    const loadData = async (driverId: string) => {
        setLoading(true);
        try {
            const [driverData, tripsData] = await Promise.all([
                driverApi.getById(driverId),
                driverApi.getTrips(driverId)
            ]);
            setDriver(driverData);
            setTrips(tripsData);
        } catch (error) {
            console.error('Error loading trip history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Typography sx={{ p: 4 }}>Loading trip history...</Typography>;
    if (!driver) return <Typography sx={{ p: 4 }}>Driver not found.</Typography>;

    return (
        <Box>
            <Box mb={3}>
                <Breadcrumbs>
                    <Link underline="hover" color="inherit" onClick={() => navigate('/drivers')} sx={{ cursor: 'pointer' }}>
                        Drivers
                    </Link>
                    <Link underline="hover" color="inherit" onClick={() => navigate(`/drivers/${driver.id}`)} sx={{ cursor: 'pointer' }}>
                        {driver.user.firstName} {driver.user.lastName}
                    </Link>
                    <Typography color="text.primary">Trip History</Typography>
                </Breadcrumbs>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box display="flex" alignItems="center" gap={2}>
                    <History fontSize="large" color="primary" />
                    <Box>
                        <Typography variant="h4" fontWeight="600">Trip History</Typography>
                        <Typography variant="body2" color="textSecondary">
                            Complete record of all trips performed by {driver.user.firstName}
                        </Typography>
                    </Box>
                </Box>
                <Button variant="outlined" startIcon={<Download />}>Download Report</Button>
            </Box>

            <Box display="flex" gap={2} mb={3}>
                <TextField
                    placeholder="Search trips (ID, Vehicle, Member)..."
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flexGrow: 1, maxWidth: 500, bgcolor: 'background.paper' }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button startIcon={<FilterList />} variant="outlined">Filters</Button>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fbfc' }}>
                        <TableRow>
                            <TableCell>Date & Time</TableCell>
                            <TableCell>Trip ID</TableCell>
                            <TableCell>Vehicle</TableCell>
                            <TableCell>Members</TableCell>
                            <TableCell>Stops</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {trips.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                                    <Box sx={{ opacity: 0.5 }}>
                                        <History sx={{ fontSize: 48, mb: 1 }} />
                                        <Typography>No trips recorded for this driver.</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            trips.map((trip) => (
                                <TableRow key={trip.id} hover>
                                    <TableCell>
                                        <Typography variant="body2">{new Date(trip.startTime).toLocaleDateString()}</Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {new Date(trip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>#{trip.id.substring(0, 8)}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{trip.vehicle?.make} {trip.vehicle?.model}</Typography>
                                        <Typography variant="caption" color="textSecondary">{trip.vehicle?.vehicleNumber}</Typography>
                                    </TableCell>
                                    <TableCell>{trip.members?.length || 0} Members</TableCell>
                                    <TableCell>{trip.stops?.length || 0} Stops</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={trip.status}
                                            size="small"
                                            color={trip.status === 'COMPLETED' ? 'success' : 'primary'}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="View Trip Details">
                                            <IconButton size="small">
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
