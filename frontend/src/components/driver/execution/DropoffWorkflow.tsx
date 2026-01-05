import { Box, Typography, Button, Paper, TextField, Tabs, Tab, Alert } from '@mui/material';
import { useState, useRef, useEffect } from 'react'; // Added useEffect/useRef
import { Draw, Save, Restore, Clear } from '@mui/icons-material';

interface DropoffWorkflowProps {
    onComplete: (data: { signature: string; odometer: number; notes: string }) => void;
    startOdometer?: number; // Added optional prop
}

export default function DropoffWorkflow({ onComplete, startOdometer = 0 }: DropoffWorkflowProps) {
    const [tab, setTab] = useState(0);
    const [notes, setNotes] = useState('');
    const [odometer, setOdometer] = useState<string>(''); // Allow empty initially
    const [signatureData, setSignatureData] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Signature Pad Logic
    useEffect(() => {
        if (tab === 0 && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#000';
            }
        }
    }, [tab]);

    const startDrawing = (e: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e: any) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (canvasRef.current) {
            setSignatureData(canvasRef.current.toDataURL());
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            setSignatureData(null);
        }
    };

    const handleUseSaved = () => {
        // Mock using a saved signature
        setSignatureData('saved_signature_v1');
    };

    const handleSubmit = () => {
        onComplete({
            signature: signatureData || 'saved_signature',
            odometer: parseFloat(odometer) || 0,
            notes
        });
    };

    return (
        <Box sx={{ p: 2, pb: 20 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>Trip Report & Dropoff</Typography>
            <Typography color="text.secondary" paragraph>
                Finalize the trip details and collect signature.
            </Typography>

            {/* 1. Trip Stats */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 4, bgcolor: '#f8f9fa' }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>TRIP DETAILS</Typography>
                <TextField
                    label="End Odometer"
                    fullWidth
                    type="number"
                    variant="outlined"
                    sx={{ mb: 2, bgcolor: 'white' }}
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    helperText={startOdometer ? `Started at: ${startOdometer} mi` : ''}
                />
                <TextField
                    label="Trip Notes (Optional)"
                    fullWidth
                    multiline
                    rows={2}
                    variant="outlined"
                    sx={{ bgcolor: 'white' }}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </Paper>

            {/* 2. Signature Section */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, ml: 1 }}>SIGNATURE</Typography>
            <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #eee', overflow: 'hidden' }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ bgcolor: '#f5f5f5' }}>
                    <Tab label="Client Sign" icon={<Draw />} iconPosition="start" />
                    <Tab label="Saved File" icon={<Restore />} iconPosition="start" />
                </Tabs>

                <Box sx={{ p: 3, minHeight: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {tab === 0 ? (
                        <>
                            <Box
                                sx={{ border: '2px dashed #ccc', borderRadius: 2, bgcolor: '#fff', touchAction: 'none' }}
                            >
                                <canvas
                                    ref={canvasRef}
                                    width={300}
                                    height={150}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                />
                            </Box>
                            <Button size="small" onClick={clearSignature} startIcon={<Clear />} sx={{ mt: 1 }}>
                                Clear Signature
                            </Button>
                        </>
                    ) : (
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography gutterBottom>Use signature on file for <strong>Jane Doe</strong>?</Typography>
                            {signatureData === 'saved_signature_v1' ? (
                                <Alert severity="success" sx={{ mt: 2 }}>Signature Applied</Alert>
                            ) : (
                                <Button variant="contained" onClick={handleUseSaved} startIcon={<Save />} sx={{ mt: 2, borderRadius: 20 }}>
                                    Apply Saved Signature
                                </Button>
                            )}
                        </Box>
                    )}
                </Box>
            </Paper>

            {/* Floating Action Button */}
            <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, pb: 4, bgcolor: 'white', borderTop: '1px solid #f0f0f0' }}>
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={!signatureData || !odometer}
                    onClick={handleSubmit}
                    sx={{ borderRadius: 27, height: 54, fontSize: '1.1rem', fontWeight: 700 }}
                >
                    Complete Dropoff
                </Button>
            </Box>
        </Box>
    );
}
