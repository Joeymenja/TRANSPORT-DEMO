import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Card, CardContent, Grid, Button, Chip, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { ArrowBack, Edit, Phone, Email, LocationOn, MedicalServices, AssignmentTurnedIn, Warning } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { memberApi, MobilityRequirement } from '../api/members';
import { tripApi, Trip } from '../api/trips';
import LoadingOverlay from '../components/LoadingOverlay';

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function MemberDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);

    const { data: member, isLoading: isMemberLoading } = useQuery({
        queryKey: ['member', id],
        queryFn: () => memberApi.getMemberById(id!),
        enabled: !!id,
    });

    const { data: trips = [], isLoading: isTripsLoading } = useQuery({
        queryKey: ['member-trips', id],
        queryFn: () => tripApi.getTrips({ memberId: id }),
        enabled: !!id,
    });

    if (isMemberLoading || !member) {
        return <LoadingOverlay open={true} />;
    }

    const getMobilityColor = (req: MobilityRequirement) => {
        switch (req) {
            case MobilityRequirement.AMBULATORY: return 'success';
            case MobilityRequirement.WHEELCHAIR: return 'warning';
            default: return 'error';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'SCHEDULED': return 'primary';
            case 'CANCELLED': return 'error';
            case 'IN_PROGRESS': return 'warning';
            default: return 'default';
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/members')} sx={{ mb: 2 }}>
                Back to Members
            </Button>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        {member.lastName}, {member.firstName}
                    </Typography>
                    <Box display="flex" gap={2} alignItems="center">
                        <Chip
                            label={member.memberId}
                            color="primary"
                            variant="outlined"
                            size="small"
                        />
                        <Chip
                            label={member.reportType === 'NON_NATIVE' ? 'Non-Native' : 'Native'}
                            size="small"
                            color="default"
                        />
                        <Chip
                            label={member.mobilityRequirement}
                            size="small"
                            color={getMobilityColor(member.mobilityRequirement) as any}
                        />
                    </Box>
                </Box>
                <Button variant="outlined" startIcon={<Edit />}>
                    Edit Profile
                </Button>
            </Box>

            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                <Tab label="Overview" />
                <Tab label="Trip History" />
                <Tab label="Reports" disabled />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Personal Information</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                                        <Typography variant="body1">{new Date(member.dateOfBirth).toLocaleDateString()}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Gender</Typography>
                                        <Typography variant="body1">{member.gender || 'Not specified'}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box display="flex" gap={1} alignItems="center" mt={1}>
                                            <Phone fontSize="small" color="action" />
                                            <Typography variant="body1">{member.phone || 'No phone'}</Typography>
                                        </Box>
                                        <Box display="flex" gap={1} alignItems="center" mt={1}>
                                            <Email fontSize="small" color="action" />
                                            <Typography variant="body1">{member.email || 'No email'}</Typography>
                                        </Box>
                                        <Box display="flex" gap={1} alignItems="center" mt={1}>
                                            <LocationOn fontSize="small" color="action" />
                                            <Typography variant="body1">{member.address || 'No address'}</Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Medical & Consent</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" p={1} bgcolor="#f5f5f5" borderRadius={1}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <AssignmentTurnedIn color={member.consentOnFile ? 'success' : 'disabled'} />
                                                <Typography variant="body1">Consent Form</Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {member.consentDate ? `Signed: ${new Date(member.consentDate).toLocaleDateString()}` : 'No Date'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center" gap={1}>
                                            <MedicalServices fontSize="small" /> Medical Notes
                                        </Typography>
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fffde7' }}>
                                            <Typography variant="body2">{member.medicalNotes || 'No medical notes.'}</Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center" gap={1}>
                                            <Warning fontSize="small" /> Special Notes
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {member.specialNotes || 'No special notes.'}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Insurance</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Provider</Typography>
                                        <Typography variant="body1">{member.insuranceProvider || 'N/A'}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Member ID</Typography>
                                        <Typography variant="body1">{member.insuranceId || 'N/A'}</Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Vehicle</TableCell>
                                <TableCell>Stops</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isTripsLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">Loading trips...</TableCell>
                                </TableRow>
                            ) : trips.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        No trip history found for this member.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                trips.map((trip: Trip) => (
                                    <TableRow key={trip.id} hover onClick={() => navigate(`/dashboard`)} sx={{ cursor: 'pointer' }}>
                                        {/* Ideally navigate to trip details, but dashboard is fine for now/admin view */}
                                        <TableCell>{new Date(trip.tripDate).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={trip.status.replace('_', ' ')}
                                                size="small"
                                                color={getStatusColor(trip.status) as any}
                                            />
                                        </TableCell>
                                        <TableCell>{trip.tripType}</TableCell>
                                        <TableCell>{trip.assignedVehicle?.vehicleNumber || 'Unassigned'}</TableCell>
                                        <TableCell>{trip.stops?.length || 0} stops</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>
        </Container>
    );
}
