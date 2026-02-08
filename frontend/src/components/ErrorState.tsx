import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry?: () => void;
}

export default function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps) {
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
                bgcolor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#991B1B'
            }}
        >
            <Box sx={{ 
                mb: 3, 
                p: 2, 
                borderRadius: '50%', 
                bgcolor: '#FEE2E2', 
                color: '#EF4444' 
            }}>
                <ErrorOutline sx={{ fontSize: 40 }} />
            </Box>
            
            <Typography variant="h6" fontWeight={800} gutterBottom>
                {title}
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4, maxWidth: 300, opacity: 0.8 }}>
                {message}
            </Typography>

            {onRetry && (
                <Button 
                    variant="outlined" 
                    startIcon={<Refresh />}
                    onClick={onRetry}
                    color="error"
                    sx={{ 
                        fontWeight: 700, 
                        borderRadius: 2, 
                        px: 4,
                        py: 1.5,
                        borderColor: '#FCA5A5',
                        '&:hover': { bgcolor: '#FEF2F2', borderColor: '#F87171' }
                    }}
                >
                    Try Again
                </Button>
            )}
        </Paper>
    );
}
