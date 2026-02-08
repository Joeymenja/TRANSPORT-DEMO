import { Snackbar, Alert, Fade } from '@mui/material';
import { useToastStore } from '../store/toast';

export default function GlobalToast() {
    const { open, message, severity, hideToast } = useToastStore();

    return (
        <Snackbar 
            open={open} 
            autoHideDuration={4000} 
            onClose={hideToast}
            TransitionComponent={Fade}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Top center for mobile visibility
            sx={{ top: { xs: 80, sm: 24 } }}
        >
            <Alert 
                onClose={hideToast} 
                severity={severity} 
                variant="filled"
                sx={{ 
                    width: '100%', 
                    borderRadius: 3, 
                    fontWeight: 600,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                    alignItems: 'center'
                }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
}
