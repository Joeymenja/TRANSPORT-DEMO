import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Delete, Check } from '@mui/icons-material';

interface SignaturePadProps {
    onSave: (base64: string) => void;
    onCancel: () => void;
}

export default function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        // Handle window resize or initial size
        const parent = canvas.parentElement;
        if (parent) {
            canvas.width = parent.clientWidth;
            canvas.height = 200;
        }
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.beginPath();
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const rect = canvas.getBoundingClientRect();
        let x, y;

        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            // Check if canvas is blank (simplified)
            const blank = document.createElement('canvas');
            blank.width = canvas.width;
            blank.height = canvas.height;
            if (canvas.toDataURL() === blank.toDataURL()) {
                alert('Please provide a signature.');
                return;
            }
            onSave(canvas.toDataURL());
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                Sign here (Touch/Mouse)
            </Typography>
            <Box
                sx={{
                    border: '2px dashed #0096D6',
                    borderRadius: 2,
                    bgcolor: '#fff',
                    touchAction: 'none',
                    mb: 2
                }}
            >
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{ display: 'block', cursor: 'crosshair' }}
                />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Button
                    startIcon={<Delete />}
                    variant="outlined"
                    color="inherit"
                    onClick={clear}
                    size="small"
                >
                    Clear
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={onCancel} color="inherit" size="small">Cancel</Button>
                    <Button
                        startIcon={<Check />}
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        size="small"
                    >
                        Save Signature
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
