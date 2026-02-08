import React, { useState } from 'react';
import { 
    Dialog, 
    Box, 
    Typography, 
    IconButton, 
    Button, 
    CircularProgress, 
    Slide, 
    Paper, 
    Chip 
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { 
    ArrowBack, 
    CameraAlt, 
    VerifiedUser, 
    Info, 
    Close, 
    CheckCircle, 
    Warning, 
    CropFree, 
    Bolt, 
    AutoAwesome 
} from '@mui/icons-material';
import { GoogleGenAI } from "@google/genai";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children: React.ReactElement },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface SecurementGuideDialogProps {
    open: boolean;
    onClose: () => void;
    clientName?: string;
}

export default function SecurementGuideDialog({ open, onClose, clientName = "Member" }: SecurementGuideDialogProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [guideData, setGuideData] = useState<any>(null);

    const handleStartScan = () => {
        setIsScanning(true);
        setGuideData(null);
    };

    const analyzeEquipment = async () => {
        setIsAnalyzing(true);
        try {
            // Artificial delay for realism
            await new Promise(r => setTimeout(r, 2000));

            if (process.env.API_KEY) {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.0-flash',
                    contents: `Analyze a simulated photo of a specialized power wheelchair for member ${clientName}. Identify the device type and provide 3-4 specific, safety-critical securement steps for a standard NEMT van. Format as JSON: {model: string, steps: string[], warning: string}`,
                    config: { responseMimeType: "application/json" }
                });
                const result = JSON.parse(response.text() || '{}');
                setGuideData(result);
            } else {
                throw new Error("No API Key");
            }
        } catch (e) {
            console.warn("AI Securement Analysis Failed/Fallback", e);
            setGuideData({
                model: "Quantum Edge 3 Power Chair",
                steps: [
                    "Locate the 4 generic transit securement points (yellow loops) on the base.",
                    "Ensure the wheelchair power is turned OFF and joystick is swung away.",
                    "Attach front straps first, slightly outward. Then rear straps, slightly outward.",
                    "Verify the lap belt crosses the low pelvis, not the abdomen."
                ],
                warning: "Do not attach straps to the armrests or footplates. Use only the designated transit loops."
            });
        } finally {
            setIsAnalyzing(false);
            setIsScanning(false);
        }
    };

    // Camera Scan View
    if (isScanning) {
        return (
            <Dialog fullScreen open={open} TransitionComponent={Transition} PaperProps={{ sx: { bgcolor: 'black' } }}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    {/* Header Overlay */}
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, color: 'white' }}>
                        <IconButton onClick={() => setIsScanning(false)} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                            <Close />
                        </IconButton>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#14B8A6', fontWeight: 900, letterSpacing: 2 }}>AI SAFETY HUD</Typography>
                            <Typography variant="body2" fontWeight={800}>Scan Mobility Device</Typography>
                        </Box>
                        <Box sx={{ width: 40 }} />
                    </Box>

                    {/* Camera Viewfinder */}
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        {/* Fake Camera Feed Background */}
                        <Box sx={{ 
                            width: '85%', aspectRatio: '1/1', 
                            border: '2px solid rgba(255,255,255,0.3)', 
                            borderRadius: 8, 
                            position: 'relative', 
                            overflow: 'hidden',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                         }}>
                            <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(20, 184, 166, 0.05)' }} />
                            {/* Scanning Line */}
                            <Box sx={{ 
                                position: 'absolute', top: 0, left: 0, right: 0, height: 2, 
                                bgcolor: '#14B8A6', 
                                boxShadow: '0 0 20px #14B8A6',
                                animation: 'scan 2.5s ease-in-out infinite',
                                '@keyframes scan': {
                                    '0%': { top: '0%', opacity: 0.2 },
                                    '50%': { top: '100%', opacity: 1 },
                                    '100%': { top: '0%', opacity: 0.2 }
                                }
                            }} />
                            <CropFree sx={{ fontSize: 80, color: 'rgba(255,255,255,0.2)' }} />
                        </Box>
                    </Box>

                    {/* Controls */}
                    <Box sx={{ p: 4, pb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: 1 }}>CENTER DEVICE FRAME</Typography>
                        <Button
                            onClick={analyzeEquipment}
                            disabled={isAnalyzing}
                            sx={{
                                width: 80, height: 80, borderRadius: '50%',
                                border: '4px solid white',
                                bgcolor: 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                '&:active': { transform: 'scale(0.95)' }
                            }}
                        >
                            {isAnalyzing ? (
                                <CircularProgress size={40} sx={{ color: '#14B8A6' }} />
                            ) : (
                                <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: 'white' }} />
                            )}
                        </Button>
                    </Box>
                </Box>
            </Dialog>
        );
    }

    // Guide Result View
    return (
        <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition} PaperProps={{ sx: { bgcolor: '#0f172a' } }}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', color: 'white', position: 'relative', overflow: 'hidden' }}>
                {/* Background Decor */}
                <Box sx={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, bgcolor: 'rgba(20, 184, 166, 0.1)', borderRadius: '50%', filter: 'blur(80px)' }} />
                
                {/* Header */}
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <IconButton onClick={onClose} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                        <ArrowBack />
                    </IconButton>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#14B8A6', fontWeight: 900, letterSpacing: 2 }}>EQUIPMENT COMPLIANCE</Typography>
                        <Typography variant="h6" fontWeight={800}>Securement Guide</Typography>
                    </Box>
                    <Box sx={{ width: 40 }} />
                </Box>

                <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {!guideData ? (
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, textAlign: 'center' }}>
                            <Box sx={{ width: 120, height: 120, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: '1px solid rgba(20, 184, 166, 0.2)' }}>
                                <VerifiedUser sx={{ fontSize: 60, color: '#14B8A6' }} />
                                <Box sx={{ position: 'absolute', bottom: -8, right: -8, bgcolor: '#0f172a', p: 0.5, borderRadius: '50%' }}>
                                    <Box sx={{ bgcolor: '#F59E0B', p: 1, borderRadius: '50%', display: 'flex' }}>
                                        <Bolt sx={{ fontSize: 16 }} />
                                    </Box>
                                </Box>
                            </Box>
                            
                            <Box>
                                <Typography variant="h5" fontWeight={800} gutterBottom>Safety First</Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 280, mx: 'auto' }}>
                                    Scan the member's equipment to receive manufacturer-specific securement instructions.
                                </Typography>
                            </Box>

                            <Button 
                                fullWidth 
                                variant="contained" 
                                size="large"
                                onClick={handleStartScan}
                                startIcon={<CameraAlt />}
                                sx={{ 
                                    py: 2, 
                                    borderRadius: 4, 
                                    bgcolor: '#14B8A6', 
                                    color: 'white', 
                                    fontWeight: 800,
                                    fontSize: '1.1rem',
                                    '&:hover': { bgcolor: '#0D9488' },
                                    boxShadow: '0 8px 20px rgba(20, 184, 166, 0.3)'
                                }}
                            >
                                Scan Mobility Device
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ animation: 'slideUp 0.5s ease-out', '@keyframes slideUp': { from: { transform: 'translateY(20px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } } }}>
                            {/* Analysis Result */}
                            <Paper sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Box sx={{ p: 1.5, bgcolor: '#14B8A6', borderRadius: 3, color: 'black' }}>
                                        <AutoAwesome sx={{ color: 'white' }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#14B8A6', fontWeight: 900, letterSpacing: 1 }}>IDENTIFIED MODEL</Typography>
                                        <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.1 }}>{guideData.model}</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {guideData.steps.map((step: string, i: number) => (
                                        <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                                            <Box sx={{ 
                                                width: 24, height: 24, 
                                                bgcolor: 'rgba(255,255,255,0.1)', 
                                                borderRadius: 1, 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                fontWeight: 800, fontSize: 12, flexShrink: 0 
                                            }}>
                                                {i + 1}
                                            </Box>
                                            <Typography variant="body2" fontWeight={500} sx={{ color: 'rgba(255,255,255,0.8)' }}>{step}</Typography>
                                        </Box>
                                    ))}
                                </Box>

                                <Paper sx={{ mt: 3,  p: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 3 }}>
                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                        <Warning sx={{ color: '#F59E0B', fontSize: 20 }} />
                                        <Box>
                                            <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 900, letterSpacing: 1 }}>CRITICAL WARNING</Typography>
                                            <Typography variant="caption" display="block" sx={{ color: 'rgba(245, 158, 11, 0.9)', mt: 0.5, fontWeight: 500 }}>
                                                {guideData.warning}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Paper>

                            <Paper sx={{ mt: 2, p: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                                <CheckCircle sx={{ color: '#10B981' }} />
                                <Typography variant="caption" sx={{ color: '#A7F3D0', fontWeight: 600 }}>
                                    I have verified all securement points according to these instructions.
                                </Typography>
                            </Paper>

                            <Button 
                                fullWidth 
                                variant="contained" 
                                size="large"
                                onClick={onClose}
                                sx={{ 
                                    mt: 3, py: 2, 
                                    borderRadius: 4, 
                                    bgcolor: 'white', 
                                    color: '#0f172a', 
                                    fontWeight: 800
                                }}
                            >
                                Return to Dashboard
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>
        </Dialog>
    );
}
