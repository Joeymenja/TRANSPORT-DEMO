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
import { LocalTaxi, Person } from '@mui/icons-material';
import api from '../lib/api';

interface Driver {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    defaultVehicleId: string | null;
    status: 'active' | 'inactive';
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

                                    <Box mt={2} display="flex" justifyContent="flex-end">
                                        <Button size="small" variant="outlined" onClick={() => handleEditVehicle(driver)}>
                                            Assign Vehicle
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
        </Box>
    );
};
