import { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    Description,
    CheckCircle,
    Error as ErrorIcon,
    Pending,
    Upload,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, DriverDocument } from '../../api/auth';

import MobileHeader from '../../components/layout/MobileHeader';
import LoadingOverlay from '../../components/LoadingOverlay';

const documentTypes = [
    { type: 'LICENSE', label: "Driver's License" },
    { type: 'INSURANCE', label: "Vehicle Insurance" },
    { type: 'REGISTRATION', label: "Vehicle Registration" },
    { type: 'MEDICAL_CARD', label: "Medical Examiner's Certificate" },
    { type: 'BACKGROUND_CHECK', label: "Background Check" },
];

export default function CompliancePage() {
    const queryClient = useQueryClient();
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        documentType: 'LICENSE',
        fileUrl: '',
        expiryDate: ''
    });

    const { data: documents = [], isLoading, isError } = useQuery<DriverDocument[]>({
        queryKey: ['my-documents'],
        queryFn: authApi.getMyDocuments,
    });

    const uploadMutation = useMutation({
        mutationFn: (data: typeof uploadForm) => authApi.uploadDocument(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-documents'] });
            setIsUploadOpen(false);
            setUploadForm({ documentType: 'LICENSE', fileUrl: '', expiryDate: '' });
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'PENDING': return 'warning';
            case 'REJECTED': return 'error';
            default: return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle />;
            case 'PENDING': return <Pending />;
            case 'REJECTED': return <ErrorIcon />;
            default: return undefined;
        }
    };

    if (isLoading) return <LoadingOverlay open={true} />;

    if (isError) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
                <MobileHeader title="Compliance" backRoute="/driver/profile" />
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="error" gutterBottom>Failed to load documents.</Typography>
                    <Button variant="outlined" onClick={() => window.location.reload()}>Retry</Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', pb: 8 }}>
            <MobileHeader title="Compliance" backRoute="/driver/profile" />
            <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight={700}>Required Documents</Typography>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<Upload />}
                        onClick={() => setIsUploadOpen(true)}
                        sx={{ borderRadius: 2 }}
                    >
                        Upload
                    </Button>
                </Box>

                <List sx={{ p: 0 }}>
                    {documentTypes.map((dt) => {
                        const doc = Array.isArray(documents) ? documents.find(d => d.documentType === dt.type) : null;
                        return (
                            <Card key={dt.type} sx={{ mb: 2, borderRadius: 3, boxShadow: 'none', border: '1px solid #eee' }}>
                                <ListItem sx={{ py: 2 }}>
                                    <ListItemIcon>
                                        <Box sx={{ bgcolor: 'primary.light', p: 1, borderRadius: 2, display: 'flex' }}>
                                            <Description color="primary" />
                                        </Box>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={dt.label}
                                        primaryTypographyProps={{ fontWeight: 600 }}
                                        secondary={doc ? `Expires: ${doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A'}` : 'Not Uploaded'}
                                    />
                                    {doc ? (
                                        <Chip
                                            label={doc.status}
                                            size="small"
                                            color={getStatusColor(doc.status) as any}
                                            icon={getStatusIcon(doc.status)}
                                            sx={{ fontWeight: 700 }}
                                        />
                                    ) : (
                                        <Chip label="Missing" size="small" variant="outlined" color="error" />
                                    )}
                                </ListItem>
                            </Card>
                        );
                    })}
                </List>

                <Dialog open={isUploadOpen} onClose={() => setIsUploadOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                    <DialogTitle sx={{ fontWeight: 700 }}>Upload Document</DialogTitle>
                    <DialogContent>
                        <TextField
                            select
                            fullWidth
                            label="Document Type"
                            sx={{ mt: 2, mb: 2 }}
                            value={uploadForm.documentType}
                            onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
                        >
                            {documentTypes.map(dt => (
                                <MenuItem key={dt.type} value={dt.type}>{dt.label}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            label="File Link (Simulated)"
                            placeholder="Enter URL to document"
                            sx={{ mb: 2 }}
                            value={uploadForm.fileUrl}
                            onChange={(e) => setUploadForm({ ...uploadForm, fileUrl: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            type="date"
                            label="Expiry Date"
                            InputLabelProps={{ shrink: true }}
                            value={uploadForm.expiryDate}
                            onChange={(e) => setUploadForm({ ...uploadForm, expiryDate: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={() => uploadMutation.mutate(uploadForm)}
                            disabled={!uploadForm.fileUrl || uploadMutation.isPending}
                            sx={{ borderRadius: 2 }}
                        >
                            Upload Document
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}
