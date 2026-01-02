import { useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Search, PictureAsPdf } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { tripApi } from '../api/trips';

export default function ArchivePage() {
    const [startDate, setStartDate] = useState<Date | null>(subDays(new Date(), 30));
    const [endDate, setEndDate] = useState<Date | null>(new Date());
    const [searchTrigger, setSearchTrigger] = useState(0);

    const { data: trips = [], isLoading } = useQuery({
        queryKey: ['trips', 'archive', searchTrigger],
        queryFn: () => tripApi.getTrips({
            startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
            endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
        }),
        enabled: !!startDate && !!endDate,
    });

    const handleSearch = () => {
        setSearchTrigger(prev => prev + 1);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#212121', mb: 1 }}>
                    Trip History & Archives
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Search and retrieve past trip records and compliance documents.
                </Typography>
            </Box>

            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Grid container spacing={3} alignItems="center">
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Grid item xs={12} md={3}>
                                <DatePicker
                                    label="Start Date"
                                    value={startDate}
                                    onChange={(newValue) => setStartDate(newValue)}
                                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <DatePicker
                                    label="End Date"
                                    value={endDate}
                                    onChange={(newValue) => setEndDate(newValue)}
                                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                />
                            </Grid>
                        </LocalizationProvider>
                        <Grid item xs={12} md={2}>
                            <Button
                                variant="contained"
                                startIcon={<Search />}
                                onClick={handleSearch}
                                fullWidth
                                sx={{ bgcolor: '#0096D6' }}
                            >
                                Search
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Trip ID</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Members</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>Loading...</TableCell>
                            </TableRow>
                        ) : trips.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    No trips found for the selected date range.
                                </TableCell>
                            </TableRow>
                        ) : (
                            trips.map((trip) => (
                                <TableRow key={trip.id} hover>
                                    <TableCell>{format(new Date(trip.tripDate), 'MMM d, yyyy')}</TableCell>
                                    <TableCell>#{trip.id.slice(0, 8)}</TableCell>
                                    <TableCell>{trip.tripType.replace('_', ' ')}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={trip.status}
                                            size="small"
                                            color={
                                                trip.status === 'COMPLETED' ? 'success' :
                                                    trip.status === 'IN_PROGRESS' ? 'warning' :
                                                        trip.status === 'CANCELLED' ? 'error' : 'default'
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>{trip.memberCount} Clients</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                                size="small"
                                                startIcon={<PictureAsPdf />}
                                                onClick={() => tripApi.downloadReport(trip.id)}
                                                disabled={trip.status !== 'COMPLETED' && trip.status !== 'FINALIZED'}
                                                sx={{ textTransform: 'none' }}
                                            >
                                                PDF
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}
