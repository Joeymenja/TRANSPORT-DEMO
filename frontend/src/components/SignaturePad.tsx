import { useRef, useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Checkbox, TextField, Grid, Typography } from '@mui/material';

interface SignaturePadProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: { signatureBase64: string; isProxy?: boolean; proxySignerName?: string; proxyRelationship?: string; proxyReason?: string }) => void;
    title?: string;
}

export default function SignaturePad({ open, onClose, onSave, title = 'Sign Below' }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    // Proxy Signature State
    const [isProxy, setIsProxy] = useState(false);
    const [proxyName, setProxyName] = useState('');
    const [proxyRelationship, setProxyRelationship] = useState('');
    const [proxyReason, setProxyReason] = useState('');

    useEffect(() => {
        if (open && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#000';
                ctx.lineCap = 'round';
            }
            setHasSignature(false);
            // Reset proxy state when opening
            setIsProxy(false);
            setProxyName('');
            setProxyRelationship('');
            setProxyReason('');
        }
    }, [open]);

    const startDrawing = (e: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
        const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;

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
        const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
        const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        setHasSignature(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            setHasSignature(false);
        }
    };

    const handleSave = () => {
        if (canvasRef.current) {
            onSave({
                signatureBase64: canvasRef.current.toDataURL(),
                isProxy,
                proxySignerName: isProxy ? proxyName : undefined,
                proxyRelationship: isProxy ? proxyRelationship : undefined,
                proxyReason: isProxy ? proxyReason : undefined
            });
            onClose();
        }
    };

    const isSaveDisabled = !hasSignature || (isProxy && (!proxyName || !proxyRelationship || !proxyReason));

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                        control={<Checkbox checked={isProxy} onChange={(e) => setIsProxy(e.target.checked)} />}
                        label="Client unable to sign (Proxy Signature)"
                    />
                </Box>

                {isProxy && (
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Signer Name"
                                size="small"
                                value={proxyName}
                                onChange={(e) => setProxyName(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Relationship"
                                size="small"
                                value={proxyRelationship}
                                onChange={(e) => setProxyRelationship(e.target.value)}
                                placeholder="e.g. Caregiver, Staff"
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Reason Client Unable to Sign"
                                size="small"
                                value={proxyReason}
                                onChange={(e) => setProxyReason(e.target.value)}
                                placeholder="e.g. Physical condition, Not present"
                                multiline
                                rows={2}
                                required
                            />
                        </Grid>
                    </Grid>
                )}

                <Box
                    sx={{
                        border: '1px solid #ccc',
                        borderRadius: 1,
                        bgcolor: '#f5f5f5',
                        touchAction: 'none',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mb: 1
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        width={500}
                        height={200}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        style={{ maxWidth: '100%', height: 'auto', cursor: 'crosshair' }}
                    />
                </Box>
                <Typography variant="caption" color="text.secondary">
                    {isProxy ? "The responsible person must sign above on behalf of the client." : "The passenger must sign above."}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClear}>Clear</Button>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" disabled={isSaveDisabled}>
                    Save Signature
                </Button>
            </DialogActions>
        </Dialog>
    );
}
