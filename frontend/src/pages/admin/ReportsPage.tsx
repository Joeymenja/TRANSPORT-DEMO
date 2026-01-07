import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    CircularProgress,
    TextField,
    Button,
    Stack
} from '@mui/material';
import { Visibility, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { tripApi } from '../../api/trips';

export default function ReportsPage() {
    const navigate = useNavigate();
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Date filters - default to last 30 days
    const [startDate, setStartDate] = useState<string>(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState<string>(() => {
        const date = new Date();
        return date.toISOString().split('T')[0];
    });

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        try {
            setLoading(true);
            // Fetch trips with date range filters
            const data = await tripApi.getTrips({
                startDate,
                endDate
            });
            setTrips(data);
        } catch (error) {
            console.error('Error loading trips', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Box p={4}><CircularProgress /></Box>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'success';
            case 'submitted': return 'info';
            case 'pending': return 'warning';
            default: return 'default';
        }
    };

    // Helper to see if report exists (in real app, backend query should include this)
    // Here we assume if status is completed, report might exist.

    const handleShowAll = () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 1); // Show last year
        setStartDate(date.toISOString().split('T')[0]);
        const today = new Date();
        today.setDate(today.getDate() + 30); // Include future dates
        setEndDate(today.toISOString().split('T')[0]);
        setTimeout(loadTrips, 100);
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>Trip Reports</Typography>

            {/* Date Range Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                        label="Start Date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                    />
                    <TextField
                        label="End Date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                    />
                    <Button
                        variant="contained"
                        startIcon={<Refresh />}
                        onClick={loadTrips}
                    >
                        Apply Filter
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleShowAll}
                    >
                        Show All
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                        {trips.length} trip(s) found
                    </Typography>
                </Stack>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Trip ID</TableCell>
                            <TableCell>Driver</TableCell>
                            <TableCell>Client</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {trips.map((trip) => (
                            <TableRow key={trip.id}>
                                <TableCell>{trip.scheduledDate}</TableCell>
                                <TableCell>{trip.id.slice(0, 8)}</TableCell>
                                <TableCell>
                                    {trip.assignedDriver?.user ? `${trip.assignedDriver.user.firstName} ${trip.assignedDriver.user.lastName} ` : 'Unassigned'}
                                </TableCell>
                                <TableCell>
                                    {trip.members?.[0]?.member ? `${trip.members[0].member.firstName} ${trip.members[0].member.lastName} ` : 'Unknown'}
                                </TableCell>
                                <TableCell>
                                    <Chip label={trip.status} color={getStatusColor(trip.status) as any} size="small" />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => navigate(`/ admin / reports / ${trip.id} `)}>
                                        <Visibility />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
