import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { LocalTaxi, Person, VerifiedUser, CheckCircle, Error, Pending, Description } from '@mui/icons-material';
import api from '../lib/api';
import { authApi, DriverDocument } from '../api/auth';
import { Chip, List, ListItem, ListItemText, ListItemIcon, IconButton, TextField } from '@mui/material';

interface Driver {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    defaultVehicleId: string | null;
    isActive: boolean;
}

interface Vehicle {
    id: string;
    make: string;
    model: string;
    licensePlate: string;
    vehicleNumber: string;
}

export const DriversPage = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [driverDocuments, setDriverDocuments] = useState<DriverDocument[]>([]);
    const [reviewNotes, setReviewNotes] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Fetch Drivers
            const driversRes = await api.get('/auth/users?role=DRIVER');
            setDrivers(driversRes.data);

            // Fetch Vehicles (Assuming generic GET /vehicles exists or verify endpoint)
            const vehiclesRes = await api.get('/vehicles');
            setVehicles(vehiclesRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleEditVehicle = (driver: Driver) => {
        setSelectedDriver(driver);
        setSelectedVehicleId(driver.defaultVehicleId || '');
        setIsDialogOpen(true);
    };

    const handleReviewCompliance = async (driver: Driver) => {
        setSelectedDriver(driver);
        try {
            const docs = await authApi.getDriverDocuments(driver.id);
            setDriverDocuments(docs);
            setIsReviewOpen(true);
        } catch (error) {
            console.error('Error fetching driver documents:', error);
        }
    };

    const handleReviewDocument = async (docId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await authApi.reviewDocument(docId, { status, notes: reviewNotes });
            if (selectedDriver) {
                const docs = await authApi.getDriverDocuments(selectedDriver.id);
                setDriverDocuments(docs);
            }
            setReviewNotes('');
        } catch (error) {
            console.error('Error reviewing document:', error);
        }
    };

    const handleApproveDriver = async () => {
        if (!selectedDriver) return;
        try {
            await authApi.approveDriver(selectedDriver.id);
            await loadData();
            setIsReviewOpen(false);
        } catch (error) {
            console.error('Error approving driver:', error);
        }
    };

    const handleSave = async () => {
        if (!selectedDriver) return;
        try {
            await api.patch(`/auth/users/${selectedDriver.id}`, {
                defaultVehicleId: selectedVehicleId
            });
            await loadData();
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Error updating driver:', error);
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Driver Management</Typography>

            <Grid container spacing={3}>
                {drivers.map(driver => {
                    const assignedVehicle = vehicles.find(v => v.id === driver.defaultVehicleId);

                    return (
                        <Grid item xs={12} md={6} lg={4} key={driver.id}>
                            <Card>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                                        <Avatar><Person /></Avatar>
                                        <Box>
                                            <Typography variant="h6">{driver.firstName} {driver.lastName}</Typography>
                                            <Typography variant="body2" color="textSecondary">{driver.email}</Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                                        <Typography variant="subtitle2" gutterBottom>Default Vehicle</Typography>
                                        {assignedVehicle ? (
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <LocalTaxi color="primary" />
                                                <Typography>
                                                    {assignedVehicle.make} {assignedVehicle.model} ({assignedVehicle.vehicleNumber})
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Typography color="textSecondary" fontStyle="italic">No vehicle assigned</Typography>
                                        )}
                                    </Box>

                                    <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                                        <Button size="small" variant="outlined" onClick={() => handleEditVehicle(driver)}>
                                            Assign Vehicle
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color={driver.isActive ? "primary" : "warning"}
                                            startIcon={<VerifiedUser />}
                                            onClick={() => handleReviewCompliance(driver)}
                                        >
                                            {driver.isActive ? "Compliance" : "Review Docs"}
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Vehicle Assignment Dialog */}
            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                <DialogTitle>Assign Vehicle</DialogTitle>
                <DialogContent sx={{ minWidth: 300, mt: 1 }}>
                    {selectedDriver && (
                        <Typography variant="subtitle1" gutterBottom>
                            for {selectedDriver.firstName} {selectedDriver.lastName}
                        </Typography>
                    )}

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Select Vehicle</InputLabel>
                        <Select
                            value={selectedVehicleId}
                            label="Select Vehicle"
                            onChange={(e) => setSelectedVehicleId(e.target.value)}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {vehicles.map(v => (
                                <MenuItem key={v.id} value={v.id}>
                                    {v.vehicleNumber} - {v.make} {v.model}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Compliance Review Dialog */}
            <Dialog open={isReviewOpen} onClose={() => setIsReviewOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Compliance Review - {selectedDriver?.firstName} {selectedDriver?.lastName}</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle2" gutterBottom>Documents</Typography>
                    <List>
                        {driverDocuments.length === 0 && <Typography color="textSecondary">No documents uploaded yet.</Typography>}
                        {driverDocuments.map(doc => (
                            <ListItem key={doc.id} divider>
                                <ListItemIcon><Description /></ListItemIcon>
                                <ListItemText
                                    primary={doc.documentType}
                                    secondary={`Expiry: ${doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A'}`}
                                />
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Chip
                                        label={doc.status}
                                        size="small"
                                        color={doc.status === 'APPROVED' ? 'success' : doc.status === 'REJECTED' ? 'error' : 'warning'}
                                        icon={doc.status === 'PENDING' ? <Pending fontSize="small" /> : undefined}
                                    />
                                    <IconButton size="small" onClick={() => handleReviewDocument(doc.id, 'APPROVED')} color="success">
                                        <CheckCircle fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleReviewDocument(doc.id, 'REJECTED')} color="error">
                                        <Error fontSize="small" />
                                    </IconButton>
                                </Box>
                            </ListItem>
                        ))}
                    </List>

                    <Box mt={3}>
                        <TextField
                            fullWidth
                            label="Review Notes"
                            multiline
                            rows={2}
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            placeholder="Add reason for rejection or approval notes..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
                    <Button onClick={() => setIsReviewOpen(false)}>Close</Button>
                    {!selectedDriver?.isActive && (
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={!driverDocuments.some(d => d.status === 'APPROVED')}
                            onClick={handleApproveDriver}
                        >
                            Approve Driver Account
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};
