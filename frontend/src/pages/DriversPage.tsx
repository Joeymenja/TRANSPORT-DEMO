import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import {
    LocalTaxi,
    Person,
    Add,
    Search,
    Visibility,
    Delete,
    Badge,
    AssignmentInd,
    People,
    GppGood,
} from '@mui/icons-material';
import { driverApi, Driver } from '../api/drivers';
import { vehicleApi, Vehicle } from '../api/vehicles';
import { AddDriverForm } from '../components/drivers/AddDriverForm';

export const DriversPage = () => {
    const navigate = useNavigate();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Dialog States
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);
    const [isAssignVehicleOpen, setIsAssignVehicleOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [driverToDelete, setDriverToDelete] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [driversData, vehiclesData] = await Promise.all([
                driverApi.getAll(),
                vehicleApi.getAll()
            ]);
            setDrivers(driversData);
            setVehicles(vehiclesData);
        } catch (error) {
            console.error('Error loading drivers data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignVehicle = (driver: Driver) => {
        setSelectedDriver(driver);
        setSelectedVehicleId(driver.assignedVehicleId || '');
        setIsAssignVehicleOpen(true);
    };

    const saveVehicleAssignment = async () => {
        if (!selectedDriver) return;
        try {
            await driverApi.update(selectedDriver.id, { assignedVehicleId: selectedVehicleId || undefined });
            await loadData();
            setIsAssignVehicleOpen(false);
        } catch (error) {
            console.error('Error updating driver vehicle:', error);
        }
    };

    const handleDeleteDriver = (id: string) => {
        setDriverToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteDriver = async () => {
        if (!driverToDelete) return;
        try {
            await driverApi.delete(driverToDelete);
            await loadData();
            setIsDeleteDialogOpen(false);
            setDriverToDelete(null);
        } catch (error) {
            console.error('Error deleting driver:', error);
        }
    };

    const filteredDrivers = drivers.filter(d => {
        const matchesSearch = `${d.user.firstName} ${d.user.lastName} ${d.user.email}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' && d.user.isActive) ||
            (statusFilter === 'INACTIVE' && !d.user.isActive);
        return matchesSearch && matchesStatus;
    });

    const getStatusChip = (isActive: boolean, onboardingStep: number = 0) => {
        if (!isActive) {
            if (onboardingStep >= 5) {
                return <Chip label="Pending Approval" size="small" color="warning" variant="filled" />;
            }
            if (onboardingStep > 0) {
                return <Chip label="Onboarding" size="small" color="info" variant="outlined" />;
            }
            return <Chip label="Inactive" size="small" color="default" variant="outlined" />;
        }
        return <Chip label="Active" size="small" color="success" variant="filled" />;
    };

    const checkCompliance = (driver: Driver) => {
        const hasLicense = !!driver.licenseNumber && !!driver.licenseState;
        const isNotExpired = !driver.licenseExpiryDate || new Date(driver.licenseExpiryDate) > new Date();
        return hasLicense && isNotExpired;
    };

    return (
        <Container sx={{ py: 4 }} maxWidth="lg">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <People color="primary" sx={{ fontSize: 32 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        Driver Management
                    </Typography>
                </Box>
                <Box display="flex" gap={2}>
                    <Button variant="outlined" onClick={() => navigate('/')}>Back to Dashboard</Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setIsAddFormOpen(true)}
                        sx={{ bgcolor: '#0096D6', '&:hover': { bgcolor: '#007bb2' } }}
                    >
                        Add Driver
                    </Button>
                </Box>
            </Box>

            <Box display="flex" gap={2} mb={4} flexWrap="wrap">
                <TextField
                    placeholder="Search drivers..."
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ minWidth: 300, bgcolor: 'background.paper' }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{ bgcolor: 'background.paper' }}
                    >
                        <MenuItem value="ALL">All Status</MenuItem>
                        <MenuItem value="ACTIVE">Active</MenuItem>
                        <MenuItem value="INACTIVE">Inactive</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {isAddFormOpen && (
                <AddDriverForm
                    onSuccess={() => {
                        setIsAddFormOpen(false);
                        loadData();
                    }}
                    onCancel={() => setIsAddFormOpen(false)}
                />
            )}

            {loading ? (
                <Typography>Loading drivers...</Typography>
            ) : (
                <Grid container spacing={3}>
                    {filteredDrivers.map(driver => (
                        <Grid item xs={12} md={6} lg={4} key={driver.id}>
                            <Card sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: '0.3s',
                                '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' }
                            }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                                                <Person />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {driver.user.firstName} {driver.user.lastName}
                                                    {checkCompliance(driver) && (
                                                        <Tooltip title="Compliance: Valid License">
                                                            <GppGood color="primary" fontSize="small" />
                                                        </Tooltip>
                                                    )}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    {driver.user.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        {getStatusChip(driver.user.isActive, driver.user.onboardingStep)}
                                    </Box>

                                    <Grid container spacing={2} sx={{ mb: 2 }}>
                                        <Grid item xs={12}>
                                            <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                                                <Badge fontSize="small" />
                                                <Typography variant="body2">
                                                    License: {driver.licenseNumber || 'N/A'} ({driver.licenseState || '--'})
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                                                <AssignmentInd fontSize="small" />
                                                <Typography variant="body2">
                                                    Status: {(driver.employmentStatus || 'N/A').replace('_', ' ')}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box sx={{ p: 1.5, bgcolor: '#f5f7fa', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <LocalTaxi fontSize="small" color={driver.assignedVehicle ? "primary" : "disabled"} />
                                                <Box>
                                                    <Typography variant="caption" color="textSecondary" display="block">Assigned Vehicle</Typography>
                                                    <Typography variant="body2" fontWeight="500">
                                                        {driver.assignedVehicle
                                                            ? `${driver.assignedVehicle.make} ${driver.assignedVehicle.model} (${driver.assignedVehicle.vehicleNumber})`
                                                            : 'No vehicle assigned'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Box mt="auto" pt={2} display="flex" justifyContent="space-between" alignItems="center">
                                        <Button
                                            size="small"
                                            startIcon={<Visibility />}
                                            onClick={() => navigate(`/drivers/${driver.id}`)}
                                        >
                                            View Profile
                                        </Button>
                                        <Box>
                                            <Tooltip title="Assign Vehicle">
                                                <IconButton size="small" onClick={() => handleAssignVehicle(driver)}>
                                                    <LocalTaxi fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" color="error" onClick={() => handleDeleteDriver(driver.id)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                    {filteredDrivers.length === 0 && (
                        <Grid item xs={12}>
                            <Box textAlign="center" py={10} color="text.secondary">
                                <Search sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                                <Typography>No drivers found matching your criteria.</Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            )}


            {/* Vehicle Assignment Dialog */}
            <Dialog open={isAssignVehicleOpen} onClose={() => setIsAssignVehicleOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Assign Vehicle</DialogTitle>
                <DialogContent dividers>
                    {selectedDriver && (
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Assign a default vehicle for <strong>{selectedDriver.user.firstName} {selectedDriver.user.lastName}</strong>.
                        </Typography>
                    )}
                    <FormControl fullWidth>
                        <InputLabel>Select Vehicle</InputLabel>
                        <Select
                            value={selectedVehicleId}
                            label="Select Vehicle"
                            onChange={(e) => setSelectedVehicleId(e.target.value)}
                        >
                            <MenuItem value=""><em>None (Unassign)</em></MenuItem>
                            {vehicles.map(v => (
                                <MenuItem key={v.id} value={v.id}>
                                    {v.vehicleNumber} - {v.make} {v.model}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAssignVehicleOpen(false)}>Cancel</Button>
                    <Button onClick={saveVehicleAssignment} variant="contained">Save Assignment</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
                <DialogTitle>Remove Driver Profile?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to remove this driver profile? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDeleteDriver} color="error" variant="contained">Remove</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

