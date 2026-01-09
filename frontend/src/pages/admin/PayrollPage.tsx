
import { useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, TextField, Collapse, IconButton } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, DateRange, AttachMoney } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import LoadingOverlay from '../../components/LoadingOverlay';

interface PayrollSummary {
    driverId: string;
    driverName: string;
    tripCount: number;
    totalMiles: number;
    totalHours: number;
    cancellationCount: number;
    estimatedPayout: number;
}

interface PayrollDetail {
    tripId: string;
    date: string;
    type: string;
    miles: number;
    hours: number;
    status: string;
    payout: number;
}

function DriverRow({ driver, startDate, endDate }: { driver: PayrollSummary, startDate: string, endDate: string }) {
    const [open, setOpen] = useState(false);

    // Fetch details on expand
    const { data: details = [], isLoading } = useQuery({
        queryKey: ['payroll-detail', driver.driverId, startDate, endDate],
        queryFn: () => api.get<PayrollDetail[]>(`/payroll/driver/${driver.driverId}`, {
            params: { startDate, endDate }
        }).then(res => res.data),
        enabled: open
    });

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                    {driver.driverName}
                </TableCell>
                <TableCell align="right">{driver.tripCount}</TableCell>
                <TableCell align="right">{driver.totalMiles.toFixed(1)} mi</TableCell>
                <TableCell align="right">{driver.totalHours.toFixed(1)} hrs</TableCell>
                <TableCell align="right">
                    <Typography fontWeight={700} color="success.main">
                        ${driver.estimatedPayout.toFixed(2)}
                    </Typography>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="subtitle2" gutterBottom component="div" sx={{ color: 'text.secondary', mb: 2 }}>
                                Detailed Trip Breakdown
                            </Typography>
                            {isLoading ? (
                                <Typography variant="caption">Loading details...</Typography>
                            ) : (
                                <Table size="small" aria-label="purchases">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Trip ID</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell align="right">Miles</TableCell>
                                            <TableCell align="right">Dur (Hrs)</TableCell>
                                            <TableCell align="right">Payout</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {details.map((detail) => (
                                            <TableRow key={detail.tripId}>
                                                <TableCell component="th" scope="row">
                                                    {new Date(detail.date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell sx={{ fontFamily: 'monospace' }}>#{detail.tripId.slice(0, 8)}</TableCell>
                                                <TableCell>
                                                    <Chip label={detail.type} size="small" style={{ fontSize: '0.7rem', height: 20 }} />
                                                </TableCell>
                                                <TableCell align="right">{detail.miles}</TableCell>
                                                <TableCell align="right">{detail.hours}</TableCell>
                                                <TableCell align="right">${detail.payout.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

export default function PayrollPage() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // YYYY-MM-DD
    const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    const { data: summary = [], isLoading } = useQuery({
        queryKey: ['payroll-summary', startDate, endDate],
        queryFn: () => api.get<PayrollSummary[]>('/payroll/summary', {
            params: { startDate, endDate }
        }).then(res => res.data)
    });

    const totalPayout = summary.reduce((sum, item) => sum + item.estimatedPayout, 0);

    if (isLoading) return <LoadingOverlay open={true} />;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight={700} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AttachMoney fontSize="large" /> Driver Payroll
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Earnings calculated at $0.50/mi + $15.00/hr
                    </Typography>
                </Box>
                <Card variant="outlined" sx={{ bgcolor: '#fff', border: '1px solid #eee' }}>
                    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                         <Typography variant="caption" color="text.secondary" display="block">ESTIMATED TOTAL</Typography>
                         <Typography variant="h5" fontWeight={700} color="success.main">
                            ${totalPayout.toFixed(2)}
                         </Typography>
                    </CardContent>
                </Card>
            </Box>

            <Paper sx={{ p: 2, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }} variant="outlined">
                <DateRange color="action" />
                <TextField
                    label="Start Date"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <TextField
                    label="End Date"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </Paper>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee' }}>
                <Table aria-label="collapsible table">
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell />
                            <TableCell>Driver Name</TableCell>
                            <TableCell align="right">Trips</TableCell>
                            <TableCell align="right">Total Miles</TableCell>
                            <TableCell align="right">Total Hours</TableCell>
                            <TableCell align="right">Est. Payout</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {summary.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>No data found for this period.</TableCell>
                            </TableRow>
                        ) : (
                            summary.map((driver) => (
                                <DriverRow 
                                    key={driver.driverId} 
                                    driver={driver} 
                                    startDate={startDate}
                                    endDate={endDate}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}
