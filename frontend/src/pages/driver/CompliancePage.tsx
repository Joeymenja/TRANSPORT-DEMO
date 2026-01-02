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
    Error,
    Pending,
    Upload,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, DriverDocument } from '../../api/auth';

const documentTypes = [
    { type: 'LICENSE', label: "Driver's License" },
    { type: 'INSURANCE', label: 'Proof of Insurance' },
    { type: 'BACKGROUND_CHECK', label: 'Background Check' },
];

export default function CompliancePage() {
    const queryClient = useQueryClient();
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        documentType: 'LICENSE',
        fileUrl: '', // In a real app, this would be a file object or uploaded URL
        expiryDate: '',
    });

    const { data: documents = [], isLoading } = useQuery<DriverDocument[]>({
        queryKey: ['my-documents'],
        queryFn: authApi.getMyDocuments,
    });

    const uploadMutation = useMutation({
        mutationFn: (data: any) => authApi.uploadDocument(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-documents'] });
            setIsUploadOpen(false);
            setUploadForm({ ...uploadForm, fileUrl: '', expiryDate: '' });
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'error';
            default: return 'warning';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle color="success" />;
            case 'REJECTED': return <Error color="error" />;
            default: return <Pending color="warning" />;
        }
    };

    if (isLoading) return <Box sx={{ p: 4 }}>Loading...</Box>;

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" fontWeight={600}>Compliance & Documents</Typography>
                <Button
                    variant="contained"
                    startIcon={<Upload />}
                    onClick={() => setIsUploadOpen(true)}
                >
                    Upload Document
                </Button>
            </Box>

            <Card sx={{ mb: 4, borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="subtitle1" gutterBottom fontWeight={500}>Document Status</Typography>
                    <List>
                        {documentTypes.map((dt) => {
                            const doc = documents.find(d => d.documentType === dt.type);
                            return (
                                <ListItem
                                    key={dt.type}
                                    sx={{
                                        mb: 2,
                                        bgcolor: '#f8f9fa',
                                        borderRadius: 2,
                                        border: '1px solid #eee'
                                    }}
                                >
                                    <ListItemIcon>
                                        <Description />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={dt.label}
                                        secondary={doc ? `Submitted on ${new Date(doc.createdAt).toLocaleDateString()}` : 'Not submitted yet'}
                                    />
                                    {doc ? (
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Chip
                                                label={doc.status}
                                                size="small"
                                                color={getStatusColor(doc.status) as any}
                                                icon={getStatusIcon(doc.status)}
                                            />
                                        </Box>
                                    ) : (
                                        <Chip label="Missing" size="small" color="default" />
                                    )}
                                </ListItem>
                            );
                        })}
                    </List>
                </CardContent>
            </Card>

            <Dialog open={isUploadOpen} onClose={() => setIsUploadOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Upload Document</DialogTitle>
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
                        label="Document URL / Reference"
                        placeholder="Link to file (simulated upload)"
                        sx={{ mb: 2 }}
                        value={uploadForm.fileUrl}
                        onChange={(e) => setUploadForm({ ...uploadForm, fileUrl: e.target.value })}
                        helperText="In a production app, this would be a file upload picker."
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
                <DialogActions>
                    <Button onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => uploadMutation.mutate(uploadForm)}
                        disabled={!uploadForm.fileUrl || uploadMutation.isPending}
                    >
                        Submit for Review
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
