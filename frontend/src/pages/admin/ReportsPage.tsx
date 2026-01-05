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
    CircularProgress
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { tripApi } from '../../api/trips';

export default function ReportsPage() {
    const navigate = useNavigate();
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        try {
            // Fetch all trips. ideally we'd filter for "completed" or "has report"
            // For demo, just fetch all and check status
            const data = await tripApi.getTrips();
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

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>Trip Reports</Typography>

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
