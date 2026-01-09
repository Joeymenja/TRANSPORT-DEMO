import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Container, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Chip, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, Tooltip } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import LoadingOverlay from '../components/LoadingOverlay';
import { Add, Delete, Commute, LocalShipping, Build, CheckCircle, Accessible, AutoFixHigh, GppGood } from '@mui/icons-material';

interface Vehicle {
    id: string;
    make: string;
    model: string;
    year?: number;
    color?: string;
    licensePlate: string;
    vehicleNumber: string;
    capacity: number;
    status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
    conditionStatus: string;
    wheelchairAccessible: boolean;
    purchaseDate?: string;
    nextMaintenanceDate?: string;
    documents?: {
        documentType: string;
        expiresAt?: string;
    }[];
}

export default function VehiclesPage() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        licensePlate: '',
        vehicleNumber: '',
        capacity: 4,
        status: 'AVAILABLE',
        conditionStatus: 'GOOD',
        purchaseDate: new Date().toISOString().split('T')[0],
        wheelchairAccessible: false,
    });

    const { data: vehicles = [], isLoading } = useQuery({
        queryKey: ['vehicles'],
        queryFn: () => api.get('/vehicles').then(res => res.data),
    });

    const createMutation = useMutation({
        mutationFn: (newVehicle: any) => api.post('/vehicles', newVehicle),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
            setIsDialogOpen(false);
            setFormData({
                make: '',
                model: '',
                year: new Date().getFullYear(),
                color: '',
                licensePlate: '',
                vehicleNumber: '',
                capacity: 4,
                status: 'AVAILABLE',
                conditionStatus: 'GOOD',
                purchaseDate: new Date().toISOString().split('T')[0],
                wheelchairAccessible: false,
            });
        },
        onError: (error: any) => {
            console.error('Failed to create vehicle:', error);
            showNotification('Failed to create vehicle', 'error');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<Vehicle> }) => api.put(`/vehicles/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/vehicles/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        },
    });

    const handleSubmit = () => {
        createMutation.mutate({
            ...formData,
            capacity: Number(formData.capacity),
            year: Number(formData.year),
        });
    };

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

    // ... existing mutations ...

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setVehicleToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (vehicleToDelete) {
            deleteMutation.mutate(vehicleToDelete);
            setDeleteDialogOpen(false);
            setVehicleToDelete(null);
        }
    };

    const handleStatusChange = (e: any, id: string, newStatus: string) => {
        e.stopPropagation();
        updateMutation.mutate({ id, data: { status: newStatus as any } });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'success';
            case 'IN_USE': return 'primary';
            case 'MAINTENANCE': return 'warning';
            default: return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return <CheckCircle fontSize="small" />;
            case 'IN_USE': return <Commute fontSize="small" />;
            case 'MAINTENANCE': return <Build fontSize="small" />;
            default: return undefined;
        }
    };

    const checkCompliance = (vehicle: Vehicle) => {
        if (!vehicle.documents || vehicle.documents.length === 0) return false;

        const hasInsurance = vehicle.documents.some(d =>
            d.documentType === 'INSURANCE' &&
            (!d.expiresAt || new Date(d.expiresAt) > new Date())
        );

        const hasRegistration = vehicle.documents.some(d =>
            d.documentType === 'REGISTRATION' &&
            (!d.expiresAt || new Date(d.expiresAt) > new Date())
        );

        return hasInsurance && hasRegistration;
    };

    const handleFillPseudoData = () => {
        const brands = ['Ford', 'Toyota', 'Mercedes', 'Chevrolet', 'Honda'];
        const types = ['Transit', 'Sienna', 'Sprinter', 'Express', 'Odyssey'];
        const colors = ['White', 'Silver', 'Black', 'Blue', 'Red'];
        const rand = Math.floor(Math.random() * 5);
        const year = 2018 + Math.floor(Math.random() * 6);
        const randomNum = Math.floor(Math.random() * 1000);

        setFormData({
            make: brands[rand],
            model: types[rand],
            year: year,
            color: colors[rand],
            licensePlate: `ABC-${100 + randomNum}`,
            vehicleNumber: `V-${1000 + randomNum}`,
            capacity: [4, 6, 8, 12][Math.floor(Math.random() * 4)],
            status: 'AVAILABLE',
            conditionStatus: ['GOOD', 'NEEDS_MAINTENANCE'][Math.floor(Math.random() * 2)],
            purchaseDate: new Date(year, 0, 1).toISOString().split('T')[0],
            wheelchairAccessible: Math.random() > 0.5,
        });
    };

    if (isLoading) {
        return <LoadingOverlay open={true} />;
    }

    return (
        <Container sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocalShipping color="primary" sx={{ fontSize: 32 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        Fleet Management
                    </Typography>
                </Box>
                <Box display="flex" gap={2}>
                    <Button variant="outlined" onClick={() => navigate('/')}>Back to Dashboard</Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setIsDialogOpen(true)}
                        sx={{ bgcolor: '#0096D6' }}
                    >
                        Add Vehicle
                    </Button>
                </Box>
            </Box>

            {vehicles.length === 0 ? (
                <Box textAlign="center" py={4}>
                    <Typography color="text.secondary">No vehicles found in the fleet.</Typography>
                    <Button variant="text" onClick={() => setIsDialogOpen(true)} sx={{ mt: 1 }}>
                        Add your first vehicle
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {vehicles.map((v: Vehicle) => (
                        <Grid item xs={12} sm={6} md={4} key={v.id}>
                            <Card
                                sx={{
                                    borderRadius: 2,
                                    position: 'relative',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                                onClick={() => navigate(`/vehicles/${v.id}`)}
                            >
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                                        <Box>
                                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {v.make} {v.model} {v.year ? `(${v.year})` : ''}
                                                {checkCompliance(v) && (
                                                    <Tooltip title="Compliant: Valid Insurance & Registration">
                                                        <Chip
                                                            label="Compliance"
                                                            size="small"
                                                            color="primary"
                                                            icon={<GppGood fontSize="small" />}
                                                            sx={{ height: 24 }}
                                                        />
                                                    </Tooltip>
                                                )}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                #{v.vehicleNumber}
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={(e) => handleDelete(e, v.id)}
                                            disabled={deleteMutation.isPending}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>

                                    <Box display="flex" flexDirection="column" gap={1}>
                                        <Box display="flex" gap={1} alignItems="center">
                                            <Typography variant="body2">
                                                Plate: {v.licensePlate}
                                            </Typography>
                                            {v.wheelchairAccessible && (
                                                <Tooltip title="Wheelchair Accessible">
                                                    <Accessible color="info" fontSize="small" />
                                                </Tooltip>
                                            )}
                                        </Box>

                                        <Typography variant="body2" color="text.secondary">
                                            Capacity: {v.capacity} passengers
                                        </Typography>

                                        <Typography variant="body2" color={v.conditionStatus === 'GOOD' ? 'text.secondary' : 'error.main'}>
                                            Condition: {v.conditionStatus}
                                        </Typography>

                                        <Box mt={1} onClick={(e) => e.stopPropagation()}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Status</InputLabel>
                                                <Select
                                                    value={v.status || 'AVAILABLE'}
                                                    label="Status"
                                                    onChange={(e) => handleStatusChange(e, v.id, e.target.value)}
                                                    renderValue={(selected) => (
                                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                            <Chip
                                                                size="small"
                                                                label={selected}
                                                                color={getStatusColor(selected) as any}
                                                                icon={getStatusIcon(selected)}
                                                            />
                                                        </Box>
                                                    )}
                                                >
                                                    <MenuItem value="AVAILABLE">Available</MenuItem>
                                                    <MenuItem value="IN_USE">In Use</MenuItem>
                                                    <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Add New Vehicle
                    <Button
                        startIcon={<AutoFixHigh />}
                        size="small"
                        color="secondary"
                        onClick={handleFillPseudoData}
                    >
                        Fill Pseudo Data
                    </Button>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Make"
                                fullWidth
                                value={formData.make}
                                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Model"
                                fullWidth
                                value={formData.model}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Year"
                                type="number"
                                fullWidth
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Color"
                                fullWidth
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="License Plate"
                                fullWidth
                                value={formData.licensePlate}
                                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Vehicle Number"
                                fullWidth
                                value={formData.vehicleNumber}
                                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Capacity"
                                type="number"
                                fullWidth
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Condition</InputLabel>
                                <Select
                                    label="Condition"
                                    value={formData.conditionStatus}
                                    onChange={(e) => setFormData({ ...formData, conditionStatus: e.target.value })}
                                >
                                    <MenuItem value="GOOD">Good</MenuItem>
                                    <MenuItem value="NEEDS_MAINTENANCE">Needs Maintenance</MenuItem>
                                    <MenuItem value="OUT_OF_SERVICE">Out of Service</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Purchase Date"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={formData.purchaseDate}
                                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.wheelchairAccessible}
                                        onChange={(e) => setFormData({ ...formData, wheelchairAccessible: e.target.checked })}
                                    />
                                }
                                label="Wheelchair Accessible"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Initial Status</InputLabel>
                                <Select
                                    value={formData.status}
                                    label="Initial Status"
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <MenuItem value="AVAILABLE">Available</MenuItem>
                                    <MenuItem value="IN_USE">In Use</MenuItem>
                                    <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={createMutation.isPending || !formData.make || !formData.vehicleNumber}
                    >
                        {createMutation.isPending ? 'Adding...' : 'Add Vehicle'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Delete Vehicle?"}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this vehicle? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
