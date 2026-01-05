import { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Chip } from '@mui/material';
import { CloudUpload, CheckCircle, ErrorOutline, AccessTime } from '@mui/icons-material';
import { authApi } from '../../../api/auth';
import { useAuthStore } from '../../../store/auth';

interface Props {
    onNext: () => void;
    onBack: () => void;
}

export default function DocumentUploadStep({ onNext, onBack }: Props) {
    const user = useAuthStore((state) => state.user);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadDocuments = async () => {
        try {
            const docs = await authApi.getMyDocuments();
            setDocuments(docs || []);
        } catch (err) {
            console.error("Failed to load docs", err);
        }
    };

    useEffect(() => {
        loadDocuments();
    }, []);

    const handleUpload = async (type: string, file: File) => {
        setLoading(true);
        try {
            // Mock file upload: In a real app, upload to S3/Cloudinary here and get URL
            const fakeUrl = `https://storage.gvbh.com/documents/${user?.id}/${file.name}`;

            await authApi.uploadDocument({
                documentType: type,
                fileUrl: fakeUrl
            });
            await loadDocuments(); // Refresh list
        } catch (err) {
            console.error("Upload failed", err);
            alert("Upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getDocStatus = (type: string) => {
        const doc = documents.find(d => d.documentType === type);
        if (!doc) return 'MISSING';
        return doc.status; // PENDING, APPROVED, REJECTED
    };

    const renderUploadCard = (title: string, type: string, description: string) => {
        const status = getDocStatus(type);
        const doc = documents.find(d => d.documentType === type);

        return (
            <Card variant="outlined" sx={{ mb: 2, borderColor: status === 'MISSING' ? 'grey.300' : status === 'APPROVED' ? 'success.main' : 'warning.main' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
                        <Typography variant="body2" color="text.secondary">{description}</Typography>
                        {doc && (
                            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                                File: {doc.fileUrl.split('/').pop()}
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        {status === 'MISSING' && (
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<CloudUpload />}
                                size="small"
                                disabled={loading}
                            >
                                Upload
                                <input
                                    hidden
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) handleUpload(type, e.target.files[0]);
                                    }}
                                />
                            </Button>
                        )}
                        {status === 'PENDING' && (
                            <Chip label="Pending Review" size="small" color="warning" icon={<AccessTime />} />
                        )}
                        {status === 'APPROVED' && (
                            <Chip label="Approved" size="small" color="success" icon={<CheckCircle />} />
                        )}
                        {status === 'REJECTED' && (
                            <Box sx={{ textAlign: 'right' }}>
                                <Chip label="Rejected" size="small" color="error" icon={<ErrorOutline />} sx={{ mb: 1 }} />
                                <Button
                                    component="label"
                                    size="small"
                                    sx={{ display: 'block' }}
                                >
                                    Re-upload
                                    <input
                                        hidden
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) handleUpload(type, e.target.files[0]);
                                        }}
                                    />
                                </Button>
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </Card>
        );
    };

    const isComplete = getDocStatus('LICENSE') !== 'MISSING' && getDocStatus('INSURANCE') !== 'MISSING'; // Simplified check

    const handleContinue = async () => {
        // Update step to 2
        try {
            await authApi.updateProfile({ onboardingStep: 2 });
            onNext();
        } catch (e) { console.error(e) }
    };

    return (
        <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
                Please upload valid copies of your required documents.
            </Typography>

            {renderUploadCard('Driver License', 'LICENSE', 'Valid state driver license (Front & Back)')}
            {renderUploadCard('Insurance Card', 'INSURANCE', 'Current vehicle insurance policy')}
            {renderUploadCard('Background Check Authorization', 'BACKGROUND_CHECK', 'Signed authorization form')}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button onClick={onBack} disabled={loading}>
                    Back
                </Button>
                <Button
                    variant="contained"
                    onClick={handleContinue}
                    disabled={!isComplete || loading}
                >
                    NEXT →
                </Button>
            </Box>
        </Box>
    );
}
