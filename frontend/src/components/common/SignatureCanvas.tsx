import { useRef, useState } from 'react';
import SignaturePad from 'react-signature-canvas';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Clear, Check } from '@mui/icons-material';

interface SignatureCanvasProps {
    onSave: (signatureDataUrl: string) => void;
    onCancel?: () => void;
    label?: string;
}

export default function SignatureCanvas({ onSave, onCancel, label = 'Sign Below' }: SignatureCanvasProps) {
    const padRef = useRef<SignaturePad>(null);
    const [isEmpty, setIsEmpty] = useState(true);

    const handleClear = () => {
        padRef.current?.clear();
        setIsEmpty(true);
    };

    const handleSave = () => {
        if (padRef.current && !padRef.current.isEmpty()) {
            onSave(padRef.current.getTrimmedCanvas().toDataURL('image/png'));
        }
    };

    return (
        <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom align="center" color="text.secondary">
                {label}
            </Typography>

            <Box sx={{ border: '1px dashed #ccc', borderRadius: 1, height: 200, bgcolor: '#f9f9f9', mb: 2 }}>
                <SignaturePad
                    ref={padRef}
                    canvasProps={{
                        className: 'signature-canvas',
                        style: { width: '100%', height: '100%' }
                    }}
                    onBegin={() => setIsEmpty(false)}
                />
            </Box>

            <Box display="flex" gap={2} justifyContent="space-between">
                <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleClear}
                    startIcon={<Clear />}
                >
                    Clear
                </Button>

                <Box display="flex" gap={1}>
                    {onCancel && (
                        <Button onClick={onCancel} color="inherit">
                            Cancel
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={isEmpty}
                        startIcon={<Check />}
                    >
                        Save Signature
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
}
