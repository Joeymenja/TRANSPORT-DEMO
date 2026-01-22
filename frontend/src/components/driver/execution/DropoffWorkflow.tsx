import { Box, Typography, Button, Paper, TextField, Tabs, Tab, Alert, Divider, Stack } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { Draw, Save, Restore, Clear, DirectionsCar, LocationOn, Person, AccessTime } from '@mui/icons-material';
import { calculateTripDistance } from '../../../utils/distance';

interface DropoffWorkflowProps {
    onComplete: (data: { signature: string; driverSignature?: string | null; odometer: number; notes: string }) => void;
    startOdometer?: number;
    trip?: any; // Added trip object for recap
}

export default function DropoffWorkflow({ onComplete, startOdometer = 0, trip }: DropoffWorkflowProps) {
    // Auto-calculate suggested odometer
    const initialOdometer = (startOdometer !== undefined && trip?.estimatedDistance) 
        ? (startOdometer + trip.estimatedDistance).toFixed(1) 
        : '';

    const [tab, setTab] = useState(0);
    const [odometer, setOdometer] = useState<string>(initialOdometer);
    const [notes, setNotes] = useState<string>('');
    const [signatureData, setSignatureData] = useState<string | null>(null);
    const [driverSignatureData, setDriverSignatureData] = useState<string | null>(null);
    
    // Canvas refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const driverCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDrawing = useRef(false);

    // Signature logic
    const startDrawing = (e: any) => {
        isDrawing.current = true;
        const canvas = tab === 2 ? driverCanvasRef.current : canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: any) => {
        if (!isDrawing.current) return;
        const canvas = tab === 2 ? driverCanvasRef.current : canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing.current) return;
        isDrawing.current = false;
        saveSignature();
    };

    const saveSignature = () => {
        const canvas = tab === 2 ? driverCanvasRef.current : canvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL();
            if (tab === 2) {
                setDriverSignatureData(dataUrl);
            } else {
                setSignatureData(dataUrl);
            }
        }
    };

    const clearSignature = () => {
        const canvas = tab === 2 ? driverCanvasRef.current : canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (tab === 2) {
                setDriverSignatureData(null);
            } else {
                setSignatureData(null);
            }
        }
    };

    const handleUseSaved = () => {
        setSignatureData('saved_signature_v1');
    };

    // Resize canvas on mount/tab change
    useEffect(() => {
        const resizeCanvas = (canvas: HTMLCanvasElement | null) => {
            if (canvas && containerRef.current) {
                canvas.width = containerRef.current.offsetWidth;
                canvas.height = containerRef.current.offsetHeight;
                
                // Restore line style
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.lineWidth = 2;
                    ctx.lineCap = 'round';
                    ctx.strokeStyle = '#000';
                }
            }
        };

        if (tab === 0 || tab === 2) {
            // Small timeout to allow render
            setTimeout(() => {
                resizeCanvas(tab === 2 ? driverCanvasRef.current : canvasRef.current);
            }, 50);
        }
    }, [tab]);

    const handleSubmit = () => {
        onComplete({
            signature: signatureData || 'saved_signature',
            driverSignature: driverSignatureData,
            odometer: parseFloat(odometer) || 0,
            notes
        });
    };

    const clientName = trip?.members?.[0]?.member ? `${trip.members[0].member.firstName} ${trip.members[0].member.lastName}` : 'Guest';
    const pickupAddr = trip?.stops?.find((s: any) => s.stopType === 'PICKUP')?.address || 'Unknown';
    const dropoffAddr = trip?.stops?.find((s: any) => s.stopType === 'DROPOFF')?.address || 'Unknown';
    const calculatedMiles = trip?.estimatedDistance || 0;

    return (
        <Box sx={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1 }}> {/* Content wrapper */}
                
                {/* 1. Trip Recap Header */}
                <Typography variant="h5" fontWeight={900} sx={{ mt: 1, mb: 2, letterSpacing: -0.5 }}>Review & Finalize</Typography>
                
                <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 4, bgcolor: '#f8fbfc', border: '1px solid #e1e8ed' }}>
                    <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ p: 1, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                                <Person sx={{ color: '#0096D6', fontSize: 20 }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>CLIENT</Typography>
                                <Typography variant="body1" fontWeight={800}>{clientName}</Typography>
                            </Box>
                        </Box>
                        
                        <Divider />
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ p: 1, bgcolor: '#f1f8e9', borderRadius: 2 }}>
                                <LocationOn sx={{ color: '#4caf50', fontSize: 20 }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>ROUTE</Typography>
                                <Typography variant="body2" fontWeight={600}>{pickupAddr} → {dropoffAddr}</Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DirectionsCar sx={{ color: '#666', fontSize: 18 }} />
                                <Typography variant="body2" fontWeight={600}>{startOdometer} mi start</Typography>
                            </Box>
                            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTime sx={{ color: '#666', fontSize: 18 }} />
                                <Typography variant="body2" fontWeight={600}>Total {calculatedMiles} mi</Typography>
                            </Box>
                        </Box>
                    </Stack>
                </Paper>

                {/* 2. Odometer & Notes */}
                <Typography variant="caption" fontWeight={800} color="primary" sx={{ display: 'block', mb: 1, ml: 1, letterSpacing: 1 }}>FINAL MILEAGE & NOTES</Typography>
                <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 4, bgcolor: '#fff', border: '1px solid #eee' }}>
                    <TextField
                        label="Final Odometer Reading *"
                        fullWidth
                        type="number"
                        variant="outlined"
                        sx={{ mb: 2 }}
                        value={odometer}
                        onChange={(e) => setOdometer(e.target.value)}
                        placeholder="0.0"
                    />
                    <TextField
                        label="Trip Notes (Optional)"
                        fullWidth
                        multiline
                        rows={2}
                        variant="outlined"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Mention any issues, delays, or special assistance..."
                    />
                </Paper>

                {/* 3. Sequential Signature Section */}
                <Typography variant="caption" fontWeight={800} sx={{ mb: 1.5, ml: 1, display: 'block', letterSpacing: 1 }}>SIGNATURES</Typography>
                <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #eee', overflow: 'hidden', mb: 4 }}>
                    <Tabs 
                        value={tab} 
                        onChange={(_, v) => setTab(v)} 
                        variant="fullWidth" 
                        sx={{ 
                            bgcolor: '#f5f5f5',
                            '& .Mui-selected': { bgcolor: 'white', fontWeight: 800 }
                        }}
                    >
                        <Tab 
                            label={`1. CLIENT ${signatureData ? '✓' : ''}`} 
                            sx={{ fontSize: '0.75rem', color: !signatureData ? 'primary.main' : 'text.secondary' }} 
                        />
                        <Tab 
                            label="FILE" 
                            disabled={!!signatureData && signatureData !== 'saved_signature_v1'}
                            sx={{ fontSize: '0.75rem' }} 
                        />
                        <Tab 
                            label={`2. DRIVER ${driverSignatureData ? '✓' : ''}`} 
                            disabled={!signatureData}
                            sx={{ fontSize: '0.75rem', color: signatureData && !driverSignatureData ? 'primary.main' : 'text.secondary' }} 
                        />
                    </Tabs>

                    <Box sx={{ p: 2, minHeight: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {(tab === 0 || tab === 2) ? (
                            <>
                                <Box sx={{ width: '100%', mb: 1, textAlign: 'center' }}>
                                    <Typography variant="subtitle2" fontWeight={800} color="primary">
                                        {tab === 0 ? `Please have ${clientName} sign below` : 'Driver, please sign below'}
                                    </Typography>
                                </Box>
                                <Box
                                    ref={containerRef}
                                    sx={{ 
                                        border: '2px dashed #0096D6', 
                                        borderRadius: 3, 
                                        bgcolor: '#fff', 
                                        touchAction: 'none',
                                        width: '100%',
                                        height: 160,
                                        position: 'relative'
                                    }}
                                >
                                    <canvas
                                        ref={tab === 2 ? driverCanvasRef : canvasRef}
                                        style={{ width: '100%', height: '100%' }}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                    />
                                    {!((tab === 2 ? driverSignatureData : signatureData)) && (
                                        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', opacity: 0.2 }}>
                                            <Typography variant="h6" fontWeight={900}>SIGN HERE</Typography>
                                        </Box>
                                    )}
                                </Box>
                                
                
                                <Button size="small" onClick={clearSignature} startIcon={<Clear />} sx={{ mt: 1, fontWeight: 700 }}>

                                    Clear Signature
                                </Button>
                            </>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>Use signature on file for member verification?</Typography>
                                {signatureData === 'saved_signature_v1' ? (
                                    <Alert severity="success" sx={{ borderRadius: 2 }}>✓ Signature Applied from File</Alert>
                                ) : (
                                    <Button variant="contained" onClick={handleUseSaved} startIcon={<Save />} sx={{ borderRadius: 20, px: 3 }}>
                                        Apply Saved Signature
                                    </Button>
                                )}
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Box>

            {/* Sticky Bottom Action Area */}
            <Box sx={{ 
                mt: 'auto',
                position: 'sticky',
                bottom: 0,
                p: 2, 
                pb: 4, // Increased padding
                bgcolor: 'white', 
                borderTop: '1px solid #f0f0f0',
                boxShadow: '0 -10px 30px rgba(0,0,0,0.05)',
                zIndex: 50,
                mx: -3,
                px: 3
            }}>
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    // Only disabled if odometer is missing. If signatures missing, we use it to switch tabs.
                    disabled={!odometer} 
                    onClick={() => {
                        if (!signatureData) {
                            setTab(0); // Go to client tab
                        } else if (!driverSignatureData) {
                            setTab(2); // Go to driver tab
                        } else {
                            handleSubmit();
                        }
                    }}
                    sx={{ 
                        borderRadius: 27, 
                        height: 56, 
                        fontSize: '1rem', 
                        fontWeight: 900,
                        boxShadow: '0 4px 12px rgba(0,150,214,0.3)',
                        textTransform: 'uppercase',
                        bgcolor: !signatureData || !driverSignatureData ? '#0096D6' : '#4caf50',
                        '&:hover': { bgcolor: !signatureData || !driverSignatureData ? '#007bb2' : '#43a047' }
                    }}
                >
                    {!odometer ? 'Enter Odometer to Continue' : 
                     !signatureData ? 'Next: Client Signature' : 
                     !driverSignatureData ? 'Next: Driver Signature' : 
                     'Complete & Submit Report'}
                </Button>
            </Box>
        </Box>
    );
}

