import { useState } from 'react';
import { Container, Typography, Card, Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripApi } from '../api/trips';
import { Visibility, CheckCircle, Cancel, Download } from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function ReportsPage() {
    const [tabValue, setTabValue] = useState(0);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const { data: trips } = useQuery({
        queryKey: ['trips'], // Fetch all for now, filter client side or add specific endpoint params later
        queryFn: () => tripApi.getTrips({}),
    });

    const pendingReports = trips?.filter(t => t.status === 'COMPLETED' && (t.reportStatus === 'PENDING' || !t.reportStatus)) || [];
    const verifiedReports = trips?.filter(t => t.reportStatus === 'VERIFIED') || [];
    const rejectedReports = trips?.filter(t => t.reportStatus === 'REJECTED') || [];

    const verifyMutation = useMutation({
        mutationFn: (id: string) => tripApi.verifyReport(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string, reason: string }) => tripApi.rejectReport(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trips'] });
            setRejectDialogOpen(false);
            setRejectionReason('');
            setSelectedTripId(null);
        },
    });

    const handleRejectClick = (id: string) => {
        setSelectedTripId(id);
        setRejectDialogOpen(true);
    };

    const confirmReject = () => {
        if (selectedTripId && rejectionReason) {
            rejectMutation.mutate({ id: selectedTripId, reason: rejectionReason });
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" mb={4} fontWeight={600}>Trip Reports</Typography>

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
                    <Tab label={`Incoming / Pending Review (${pendingReports.length})`} />
                    <Tab label={`Verified (${verifiedReports.length})`} />
                    <Tab label={`Rejected (${rejectedReports.length})`} />
                </Tabs>
            </Paper>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Trip ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Driver</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(tabValue === 0 ? pendingReports : tabValue === 1 ? verifiedReports : rejectedReports).map((trip) => (
                                <TableRow key={trip.id} hover>
                                    <TableCell>
                                        {format(new Date(trip.tripDate), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        #{trip.id.substring(0, 8)}
                                    </TableCell>
                                    <TableCell>
                                        {trip.members?.map((m: any) => `${m.member?.firstName} ${m.member?.lastName}`).join(', ')}
                                    </TableCell>
                                    <TableCell>
                                        {trip.assignedDriverId ? 'Assigned' : 'Unassigned'}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => tripApi.downloadReport(trip.id)} title="Download PDF">
                                            <Download />
                                        </IconButton>

                                        {tabValue === 0 && (
                                            <>
                                                <IconButton
                                                    color="success"
                                                    onClick={() => verifyMutation.mutate(trip.id)}
                                                    title="Verify Report"
                                                >
                                                    <CheckCircle />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleRejectClick(trip.id)}
                                                    title="Reject Report"
                                                >
                                                    <Cancel />
                                                </IconButton>
                                            </>
                                        )}

                                        <IconButton onClick={() => navigate(`/trips/${trip.id}`)} title="View Details">
                                            <Visibility />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(tabValue === 0 ? pendingReports : tabValue === 1 ? verifiedReports : rejectedReports).length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        No reports found in this category.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
                <DialogTitle>Reject Report</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>Please provide a reason for rejecting this report:</Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Rejection Reason"
                        fullWidth
                        multiline
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmReject} color="error" variant="contained">Reject</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
