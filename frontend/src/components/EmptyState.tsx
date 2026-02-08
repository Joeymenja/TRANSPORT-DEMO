import { Box, Typography, Button, Paper } from '@mui/material';
import { ReactNode } from 'react';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: ReactNode;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({ title, description, icon, actionLabel, onAction }: EmptyStateProps) {
    return (
        <Paper 
            elevation={0}
            sx={{ 
                p: 6, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                textAlign: 'center',
                borderRadius: 4,
                bgcolor: 'white',
                border: '1px solid #f1f5f9'
            }}
        >
            {icon && (
                <Box sx={{ 
                    mb: 3, 
                    p: 3, 
                    borderRadius: '50%', 
                    bgcolor: '#f1f5f9', 
                    color: '#94a3b8' 
                }}>
                    {icon}
                </Box>
            )}
            
            <Typography variant="h6" fontWeight={800} gutterBottom>
                {title}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 300 }}>
                {description}
            </Typography>

            {actionLabel && onAction && (
                <Button 
                    variant="contained" 
                    onClick={onAction}
                    sx={{ 
                        fontWeight: 700, 
                        borderRadius: 2, 
                        px: 4,
                        py: 1.5,
                        bgcolor: '#14B8A6',
                        boxShadow: '0 4px 15px rgba(20, 184, 166, 0.3)',
                        '&:hover': { bgcolor: '#0D9488' }
                    }}
                >
                    {actionLabel}
                </Button>
            )}
        </Paper>
    );
}
