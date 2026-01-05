import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Divider,
    Chip,
    CircularProgress
} from '@mui/material';
import { ArrowBack, Download, CheckCircle, Warning } from '@mui/icons-material';
import { tripApi } from '../../api/trips';
import { reportApi } from '../../api/reports';
import axios from 'axios';

export default function ReportDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [trip, setTrip] = useState<any>(null);
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) loadData(id);
    }, [id]);

    const loadData = async (tripId: string) => {
        try {
            const tripData = await tripApi.getTripById(tripId);
            setTrip(tripData);

            try {
                const reportData = await reportApi.getByTripId(tripId);
                setReport(reportData);
            } catch (e) {
                console.log('No report found');
            }
        } catch (error) {
            console.error('Error loading data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        try {
            const response = await axios.get(`http://localhost:3003/reports/${id}/pdf`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `trip-report-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading PDF', error);
        }
    };

    if (loading) return <Box p={4}><CircularProgress /></Box>;
    if (!trip) return <Box p={4}><Typography>Trip not found</Typography></Box>;

    return (
        <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/reports')} sx={{ mb: 2 }}>
                Back to Reports
            </Button>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4">Trip Report</Typography>
                    <Typography variant="subtitle1" color="text.secondary">Trip ID: {trip.id}</Typography>
                </Box>
                <Box>
                    <Button
                        variant="contained"
                        startIcon={<Download />}
                        onClick={handleDownloadPdf}
                        disabled={!report}
                    >
                        Export PDF
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Trip Info */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>Trip Details</Typography>
                        <Box mb={2}>
                            <Typography variant="caption" color="text.secondary">Date & Time</Typography>
                            <Typography>{trip.scheduledDate} @ {trip.pickupTime}</Typography>
                        </Box>
                        <Box mb={2}>
                            <Typography variant="caption" color="text.secondary">Driver</Typography>
                            <Typography>{trip.assignedDriver?.user?.firstName} {trip.assignedDriver?.user?.lastName}</Typography>
                        </Box>
                        <Box mb={2}>
                            <Typography variant="caption" color="text.secondary">Client</Typography>
                            <Typography>{trip.members?.[0]?.member?.firstName} {trip.members?.[0]?.member?.lastName}</Typography>
                        </Box>
                        <Box mb={2}>
                            <Typography variant="caption" color="text.secondary">Status</Typography>
                            <Box><Chip label={trip.status} /></Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Report Data */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, minHeight: 400 }}>
                        <Typography variant="h6" gutterBottom>Execution Data</Typography>
                        {report ? (
                            <Box>
                                <Grid container spacing={4}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">Actual Times</Typography>
                                        <Typography>Pickup: {report.pickupTime ? new Date(report.pickupTime).toLocaleTimeString() : '--'}</Typography>
                                        <Typography>Dropoff: {report.dropoffTime ? new Date(report.dropoffTime).toLocaleTimeString() : '--'}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">Mileage</Typography>
                                        <Typography>Start: {report.startOdometer}</Typography>
                                        <Typography>End: {report.endOdometer}</Typography>
                                        <Typography fontWeight="bold">Total: {report.totalMiles} mi</Typography>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 3 }} />

                                <Typography variant="subtitle2" gutterBottom>Verification Flags</Typography>
                                <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
                                    <Chip
                                        icon={report.serviceVerified ? <CheckCircle /> : <Warning />}
                                        label="Service Verified"
                                        color={report.serviceVerified ? 'success' : 'default'}
                                    />
                                    <Chip
                                        icon={report.clientArrived ? <CheckCircle /> : <Warning />}
                                        label="Client Arrived"
                                        color={report.clientArrived ? 'success' : 'default'}
                                    />
                                    {report.incidentReported && (
                                        <Chip icon={<Warning />} label="Incident Reported" color="error" />
                                    )}
                                </Box>

                                {report.incidentReported && (
                                    <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#fff4f4', borderColor: '#ffcdd2' }}>
                                        <Typography color="error" variant="subtitle2">Incident Details:</Typography>
                                        <Typography variant="body2">{report.incidentDescription}</Typography>
                                    </Paper>
                                )}

                                <Divider sx={{ my: 3 }} />

                                <Typography variant="subtitle2" gutterBottom>Signatures</Typography>
                                <Box display="flex" gap={4}>
                                    {report.signatures?.map((sig: any) => (
                                        <Box key={sig.id} textAlign="center">
                                            <Paper variant="outlined" sx={{ p: 1, mb: 1, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {sig.signatureUrl?.startsWith('data:image') ? (
                                                    <img src={sig.signatureUrl} alt={sig.type} style={{ maxHeight: 70, maxWidth: 150 }} />
                                                ) : (
                                                    <Typography variant="caption">Stored on File</Typography>
                                                )}
                                            </Paper>
                                            <Typography variant="caption" display="block">{sig.signerName}</Typography>
                                            <Typography variant="caption" color="text.secondary">{sig.type}</Typography>
                                        </Box>
                                    ))}
                                    {(!report.signatures || report.signatures.length === 0) && (
                                        <Typography color="text.secondary">No signatures collected.</Typography>
                                    )}
                                </Box>
                            </Box>
                        ) : (
                            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                                <Typography color="text.secondary">No trip report submitted yet.</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
