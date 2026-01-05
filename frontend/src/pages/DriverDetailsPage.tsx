import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    CircularProgress,
    Button,
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Container
} from '@mui/material';
import {
    Description,
    CheckCircle,
    Cancel,
    OpenInNew,
    Badge as BadgeIcon,
    History,
    TrendingUp,
    ArrowBack
} from '@mui/icons-material';
import { authApi, DriverDocument } from '../api/auth';
import { driverApi, Driver } from '../api/drivers';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`driver-tabpanel-${index}`}
            aria-labelledby={`driver-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export const DriverDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const [driver, setDriver] = useState<Driver | null>(null);
    const [documents, setDocuments] = useState<DriverDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        if (id) loadDriverData(id);
    }, [id]);

    const loadDriverData = async (driverId: string) => {
        setLoading(true);
        try {
            const data = await driverApi.getById(driverId);
            setDriver(data);
            // Fetch documents if user ID is available
            if (data.userId) {
                try {
                    const docs = await authApi.getDriverDocuments(data.userId);
                    setDocuments(docs);
                } catch (e) {
                    console.error("Failed to load documents", e);
                }
            }
        } catch (error) {
            console.error('Error loading driver details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewDocument = async (docId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await authApi.reviewDocument(docId, { status });
            // Refresh documents
            if (driver?.userId) {
                const docs = await authApi.getDriverDocuments(driver.userId);
                setDocuments(docs);
            }
        } catch (error) {
            console.error('Error reviewing document:', error);
            alert('Failed to update document status.');
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    if (!driver) {
        return <Box sx={{ p: 4 }}><Typography>Driver not found</Typography></Box>;
    }

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button startIcon={<ArrowBack />} href="/drivers" sx={{ mr: 1 }}>
                        Back
                    </Button>
                    <Box>
                        <Typography variant="h4" fontWeight={600}>
                            {driver.user ? `${driver.user.firstName} ${driver.user.lastName}` : 'Driver Details'}
                        </Typography>
                        <Typography color="text.secondary">
                            ID: {driver.memberId || driver.id}
                        </Typography>
                    </Box>
                </Box>
                <Chip
                    label={driver.currentStatus || 'UNKNOWN'}
                    color={driver.currentStatus === 'AVAILABLE' ? 'success' : 'default'}
                    sx={{ fontWeight: 600 }}
                />
            </Box>

            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="Overview" icon={<BadgeIcon />} iconPosition="start" />
                <Tab label="Documents" icon={<Description />} iconPosition="start" />
                <Tab label="Trip History" icon={<History />} iconPosition="start" />
                <Tab label="Performance" icon={<TrendingUp />} iconPosition="start" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>Driver Overview</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                            <Typography>{driver.user?.phoneNumber || 'N/A'}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                            <Typography>{driver.user?.email || 'N/A'}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">License Number</Typography>
                            <Typography>{driver.licenseNumber || 'N/A'}</Typography>
                        </Box>
                    </Box>
                </Paper>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <TableContainer component={Paper} elevation={0} variant="outlined">
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fbfc' }}>
                            <TableRow>
                                <TableCell>Document Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Uploaded Date</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {documents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        No documents uploaded yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                documents.map((doc) => (
                                    <TableRow key={doc.id}>
                                        <TableCell sx={{ fontWeight: 500 }}>
                                            {doc.documentType.replace('_', ' ')}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={doc.status}
                                                size="small"
                                                color={doc.status === 'APPROVED' ? 'success' : doc.status === 'REJECTED' ? 'error' : 'warning'}
                                            />
                                        </TableCell>
                                        <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Box display="flex" gap={1}>
                                                <Button size="small" startIcon={<OpenInNew />} href={doc.fileUrl} target="_blank">
                                                    View
                                                </Button>
                                                {doc.status === 'PENDING' && (
                                                    <>
                                                        <Button
                                                            size="small"
                                                            color="success"
                                                            startIcon={<CheckCircle />}
                                                            onClick={() => handleReviewDocument(doc.id, 'APPROVED')}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            startIcon={<Cancel />}
                                                            onClick={() => handleReviewDocument(doc.id, 'REJECTED')}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                <Typography color="text.secondary">Trip history not yet implemented.</Typography>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
                <Typography color="text.secondary">Performance metrics not yet implemented.</Typography>
            </TabPanel>
        </Container>
    );
};
