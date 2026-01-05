import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Card, CardContent, Grid, Button, Chip, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip } from '@mui/material';
import { ArrowBack, Edit, Build, GppGood } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { vehicleApi, VehicleDocument } from '../api/vehicles';
import LoadingOverlay from '../components/LoadingOverlay';
import { Description, Download, Delete, UploadFile } from '@mui/icons-material';

interface VehicleMaintenance {
    id: string;
    maintenanceType: string;
    description: string;
    cost: number;
    serviceDate: string;
    performedBy: string;
    mileageAtService: number;
    nextServiceMileage: number;
}

interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    color?: string;
    licensePlate: string;
    vehicleNumber: string;
    capacity: number;
    status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
    conditionStatus: string;
    wheelchairAccessible: boolean;
    purchaseDate: string;
    notes: string;
    documents?: {
        documentType: string;
        expiresAt?: string;
    }[];
}

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

export default function VehicleDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [tabValue, setTabValue] = useState(0);
    const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
    const [maintenanceForm, setMaintenanceForm] = useState({
        maintenanceType: '',
        description: '',
        cost: 0,
        serviceDate: new Date().toISOString().split('T')[0],
        performedBy: '',
        mileageAtService: 0,
        nextServiceMileage: 0
    });

    const { data: vehicle, isLoading: isVehicleLoading } = useQuery({
        queryKey: ['vehicle', id],
        queryFn: () => api.get<Vehicle>(`/vehicles/${id}`).then(res => res.data),
        enabled: !!id
    });

    const { data: maintenanceHistory = [], isLoading: isHistoryLoading } = useQuery({
        queryKey: ['vehicle-maintenance', id],
        queryFn: () => api.get<VehicleMaintenance[]>(`/vehicles/${id}/maintenance`).then(res => res.data),
        enabled: !!id
    });

    const addMaintenanceMutation = useMutation({
        mutationFn: (data: any) => api.post(`/vehicles/${id}/maintenance`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicle-maintenance', id] });
            setIsMaintenanceDialogOpen(false);
            setMaintenanceForm({
                maintenanceType: '',
                description: '',
                cost: 0,
                serviceDate: new Date().toISOString().split('T')[0],
                performedBy: '',
                mileageAtService: 0,
                nextServiceMileage: 0
            });
        }
    });

    // --- Document Management State ---
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [documentForm, setDocumentForm] = useState({
        file: null as File | null,
        documentType: 'INSURANCE',
        expiresAt: '',
        notes: ''
    });

    const { data: documents = [], isLoading: isDocumentsLoading } = useQuery({
        queryKey: ['vehicle-documents', id],
        queryFn: () => vehicleApi.getDocuments(id!),
        enabled: !!id
    });

    const uploadDocumentMutation = useMutation({
        mutationFn: (data: any) => vehicleApi.uploadDocument(id!, data.file, data.documentType, data.expiresAt, data.notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicle-documents', id] });
            setIsUploadDialogOpen(false);
            setDocumentForm({
                file: null,
                documentType: 'INSURANCE',
                expiresAt: '',
                notes: ''
            });
        },
        onError: (error: any) => {
            alert('Failed to upload document');
            console.error(error);
        }
    });

    const [isDeleteDocumentDialogOpen, setIsDeleteDocumentDialogOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

    const deleteDocumentMutation = useMutation({
        mutationFn: (docId: string) => vehicleApi.deleteDocument(docId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicle-documents', id] });
            setIsDeleteDocumentDialogOpen(false);
            setDocumentToDelete(null);
        }
    });

    const handleDeleteDocumentClick = (docId: string) => {
        setDocumentToDelete(docId);
        setIsDeleteDocumentDialogOpen(true);
    };

    const confirmDeleteDocument = () => {
        if (documentToDelete) {
            deleteDocumentMutation.mutate(documentToDelete);
        }
    };

    // --- Edit Vehicle State ---
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        make: '',
        model: '',
        year: 0,
        color: '',
        licensePlate: '',
        vehicleNumber: '',
        capacity: 0,
        status: 'AVAILABLE',
        conditionStatus: 'GOOD',
        purchaseDate: '',
        wheelchairAccessible: false,
        notes: ''
    });

    const updateVehicleMutation = useMutation({
        mutationFn: (data: any) => api.put(`/vehicles/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
            setIsEditDialogOpen(false);
        },
        onError: (error: any) => {
            alert('Failed to update vehicle');
            console.error(error);
        }
    });

    const handleEditClick = () => {
        if (vehicle) {
            setEditForm({
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year || 0,
                color: vehicle.color || '',
                licensePlate: vehicle.licensePlate,
                vehicleNumber: vehicle.vehicleNumber,
                capacity: vehicle.capacity,
                status: vehicle.status,
                conditionStatus: vehicle.conditionStatus || 'GOOD',
                purchaseDate: vehicle.purchaseDate ? new Date(vehicle.purchaseDate).toISOString().split('T')[0] : '',
                wheelchairAccessible: vehicle.wheelchairAccessible || false,
                notes: vehicle.notes || ''
            });
            setIsEditDialogOpen(true);
        }
    };

    const handleEditSubmit = () => {
        updateVehicleMutation.mutate({
            ...editForm,
            year: Number(editForm.year),
            capacity: Number(editForm.capacity)
        });
    };

    const handleUploadSubmit = () => {
        if (!documentForm.file) return;
        uploadDocumentMutation.mutate(documentForm);
    };

    if (isVehicleLoading || !vehicle) {
        return <LoadingOverlay open={true} />;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'success';
            case 'IN_USE': return 'primary';
            case 'MAINTENANCE': return 'warning';
            default: return 'default';
        }
    };

    const handleAddMaintenance = () => {
        addMaintenanceMutation.mutate({
            ...maintenanceForm,
            cost: Number(maintenanceForm.cost),
            mileageAtService: Number(maintenanceForm.mileageAtService),
            nextServiceMileage: Number(maintenanceForm.nextServiceMileage)
        });
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

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/vehicles')} sx={{ mb: 2 }}>
                Back to Fleet
            </Button>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {vehicle.make} {vehicle.model}
                        {checkCompliance(vehicle) && (
                            <Tooltip title="Compliant: Valid Insurance & Registration">
                                <Chip
                                    label="Compliance"
                                    size="small"
                                    color="primary"
                                    icon={<GppGood fontSize="small" />}
                                    sx={{ height: 28 }}
                                />
                            </Tooltip>
                        )}
                    </Typography>
                    <Box display="flex" gap={2} alignItems="center">
                        <Chip
                            label={vehicle.status}
                            color={getStatusColor(vehicle.status) as any}
                            sx={{ fontWeight: 600 }}
                        />
                        <Typography variant="subtitle1" color="text.secondary">
                            #{vehicle.vehicleNumber} • {vehicle.licensePlate}
                        </Typography>
                    </Box>
                </Box>
                <Button variant="outlined" startIcon={<Edit />} onClick={handleEditClick}>
                    Edit Vehicle
                </Button>
            </Box>

            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                <Tab label="Overview" />
                <Tab label="Maintenance History" />
                <Tab label="Documents" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Vehicle Information</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Year</Typography>
                                        <Typography variant="body1">{vehicle.year || 'N/A'}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Capacity</Typography>
                                        <Typography variant="body1">{vehicle.capacity} Passengers</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Purchase Date</Typography>
                                        <Typography variant="body1">{vehicle.purchaseDate ? new Date(vehicle.purchaseDate).toLocaleDateString() : 'N/A'}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Wheelchair Accessible</Typography>
                                        <Typography variant="body1">{vehicle.wheelchairAccessible ? 'Yes' : 'No'}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">Notes</Typography>
                                        <Typography variant="body1">{vehicle.notes || 'No notes available'}</Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Status & Condition</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Current Status</Typography>
                                        <Typography variant="body1">{vehicle.status}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Condition</Typography>
                                        <Typography variant="body1" color={vehicle.conditionStatus === 'GOOD' ? 'success.main' : 'error.main'}>
                                            {vehicle.conditionStatus}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <Box display="flex" justifyContent="flex-end" mb={2}>
                    <Button
                        variant="contained"
                        startIcon={<Build />}
                        onClick={() => setIsMaintenanceDialogOpen(true)}
                        sx={{ bgcolor: '#0096D6' }}
                    >
                        Log Maintenance
                    </Button>
                </Box>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Performed By</TableCell>
                                <TableCell>Mileage</TableCell>
                                <TableCell align="right">Cost</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isHistoryLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">Loading history...</TableCell>
                                </TableRow>
                            ) : maintenanceHistory.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        No maintenance logs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                maintenanceHistory.map((log: VehicleMaintenance) => (
                                    <TableRow key={log.id}>
                                        <TableCell>{new Date(log.serviceDate).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Chip label={log.maintenanceType} size="small" />
                                        </TableCell>
                                        <TableCell>{log.description}</TableCell>
                                        <TableCell>{log.performedBy}</TableCell>
                                        <TableCell>{log.mileageAtService.toLocaleString()} mi</TableCell>
                                        <TableCell align="right">${Number(log.cost).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                <Box display="flex" justifyContent="flex-end" mb={2}>
                    <Button
                        variant="contained"
                        startIcon={<UploadFile />}
                        onClick={() => setIsUploadDialogOpen(true)}
                        sx={{ bgcolor: '#0096D6' }}
                    >
                        Upload Document
                    </Button>
                </Box>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>Document Name</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Uploaded Date</TableCell>
                                <TableCell>Expires</TableCell>
                                <TableCell>Notes</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isDocumentsLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">Loading documents...</TableCell>
                                </TableRow>
                            ) : documents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        No documents uploaded.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                documents.map((doc: VehicleDocument) => (
                                    <TableRow key={doc.id}>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Description color="action" fontSize="small" />
                                                <Typography variant="body2">{doc.fileName}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={doc.documentType} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            {doc.expiresAt ? (
                                                <Typography
                                                    variant="body2"
                                                    color={new Date(doc.expiresAt) < new Date() ? 'error.main' : 'text.primary'}
                                                >
                                                    {new Date(doc.expiresAt).toLocaleDateString()}
                                                </Typography>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell>{doc.notes || '-'}</TableCell>
                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                startIcon={<Download />}
                                                href={vehicleApi.getDownloadUrl(doc.id)}
                                                target="_blank"
                                                sx={{ mr: 1 }}
                                            >
                                                Download
                                            </Button>
                                            <Button
                                                size="small"
                                                color="error"
                                                startIcon={<Delete />}
                                                onClick={() => handleDeleteDocumentClick(doc.id)}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>

            <Dialog open={isMaintenanceDialogOpen} onClose={() => setIsMaintenanceDialogOpen(false)} maxWidth="sm" fullWidth>
                {/* ... existing maintenance dialog ... */}
                <DialogTitle>Log Maintenance</DialogTitle>
                <DialogContent dividers>
                    {/* ... content ... */}
                    <Grid container spacing={2}>
                        {/* ... form fields reused strictly ... */}
                        <Grid item xs={12}>
                            <TextField
                                select
                                label="Maintenance Type"
                                fullWidth
                                value={maintenanceForm.maintenanceType}
                                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, maintenanceType: e.target.value })}
                                SelectProps={{ native: true }}
                            >
                                <option value=""></option>
                                <option value="Oil Change">Oil Change</option>
                                <option value="Tire Rotation">Tire Rotation</option>
                                <option value="Brake Service">Brake Service</option>
                                <option value="Inspection">Inspection</option>
                                <option value="Repair">Repair</option>
                                <option value="Cleaning">Cleaning</option>
                                <option value="Other">Other</option>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Date"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={maintenanceForm.serviceDate}
                                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, serviceDate: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Cost"
                                type="number"
                                fullWidth
                                InputProps={{ startAdornment: '$' }}
                                value={maintenanceForm.cost}
                                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: Number(e.target.value) })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Mileage"
                                type="number"
                                fullWidth
                                value={maintenanceForm.mileageAtService}
                                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, mileageAtService: Number(e.target.value) })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Next Service Mileage"
                                type="number"
                                fullWidth
                                value={maintenanceForm.nextServiceMileage}
                                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, nextServiceMileage: Number(e.target.value) })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Performed By"
                                fullWidth
                                placeholder="Technician or Shop Name"
                                value={maintenanceForm.performedBy}
                                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, performedBy: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={3}
                                value={maintenanceForm.description}
                                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsMaintenanceDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleAddMaintenance}
                        variant="contained"
                        disabled={addMaintenanceMutation.isPending || !maintenanceForm.maintenanceType}
                    >
                        {addMaintenanceMutation.isPending ? 'Saving...' : 'Save Log'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isUploadDialogOpen} onClose={() => setIsUploadDialogOpen(false)} maxWidth="sm" fullWidth>
                {/* ... existing upload dialog content ... */}
                <DialogTitle>Upload Document</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="caption" gutterBottom>Select File</Typography>
                            <TextField
                                type="file"
                                fullWidth
                                onChange={(e: any) => setDocumentForm({ ...documentForm, file: e.target.files[0] })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                select
                                label="Document Type"
                                fullWidth
                                value={documentForm.documentType}
                                onChange={(e) => setDocumentForm({ ...documentForm, documentType: e.target.value })}
                                SelectProps={{ native: true }}
                            >
                                <option value="INSURANCE">Insurance</option>
                                <option value="REGISTRATION">Registration</option>
                                <option value="OTHER">Other</option>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Expiration Date"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={documentForm.expiresAt}
                                onChange={(e) => setDocumentForm({ ...documentForm, expiresAt: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Notes"
                                fullWidth
                                multiline
                                rows={2}
                                value={documentForm.notes}
                                onChange={(e) => setDocumentForm({ ...documentForm, notes: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleUploadSubmit}
                        variant="contained"
                        disabled={uploadDocumentMutation.isPending || !documentForm.file}
                    >
                        {uploadDocumentMutation.isPending ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit Vehicle</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Make"
                                fullWidth
                                value={editForm.make}
                                onChange={(e) => setEditForm({ ...editForm, make: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Model"
                                fullWidth
                                value={editForm.model}
                                onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Year"
                                type="number"
                                fullWidth
                                value={editForm.year}
                                onChange={(e) => setEditForm({ ...editForm, year: Number(e.target.value) })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Color"
                                fullWidth
                                value={editForm.color}
                                onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="License Plate"
                                fullWidth
                                value={editForm.licensePlate}
                                onChange={(e) => setEditForm({ ...editForm, licensePlate: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Vehicle Number"
                                fullWidth
                                value={editForm.vehicleNumber}
                                onChange={(e) => setEditForm({ ...editForm, vehicleNumber: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Capacity"
                                type="number"
                                fullWidth
                                value={editForm.capacity}
                                onChange={(e) => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                select
                                label="Status"
                                fullWidth
                                value={editForm.status}
                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                SelectProps={{ native: true }}
                            >
                                <option value="AVAILABLE">Available</option>
                                <option value="IN_USE">In Use</option>
                                <option value="MAINTENANCE">Maintenance</option>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                select
                                label="Condition"
                                fullWidth
                                value={editForm.conditionStatus}
                                onChange={(e) => setEditForm({ ...editForm, conditionStatus: e.target.value })}
                                SelectProps={{ native: true }}
                            >
                                <option value="GOOD">Good</option>
                                <option value="NEEDS_MAINTENANCE">Needs Maintenance</option>
                                <option value="OUT_OF_SERVICE">Out of Service</option>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Purchase Date"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={editForm.purchaseDate}
                                onChange={(e) => setEditForm({ ...editForm, purchaseDate: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Wheelchair Accessible"
                                fullWidth
                                value={editForm.wheelchairAccessible ? 'yes' : 'no'}
                                onChange={(e) => setEditForm({ ...editForm, wheelchairAccessible: e.target.value === 'yes' })}
                                SelectProps={{ native: true }}
                            >
                                <option value="no">No</option>
                                <option value="yes">Yes</option>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Notes"
                                fullWidth
                                multiline
                                rows={3}
                                value={editForm.notes}
                                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleEditSubmit}
                        variant="contained"
                        disabled={updateVehicleMutation.isPending}
                    >
                        {updateVehicleMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={isDeleteDocumentDialogOpen}
                onClose={() => setIsDeleteDocumentDialogOpen(false)}
            >
                <DialogTitle>Delete Document?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this document? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDeleteDocumentDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDeleteDocument} color="error" variant="contained" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
