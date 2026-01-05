import { Backdrop, CircularProgress } from '@mui/material';

interface LoadingOverlayProps {
    open: boolean;
}

export default function LoadingOverlay({ open }: LoadingOverlayProps) {
    return (
        <Backdrop
            open={open}
            sx={{
                color: '#fff',
                zIndex: (theme) => theme.zIndex.drawer + 1,
                background: 'radial-gradient(circle, rgba(0,150,214,0.1) 0%, rgba(0,150,214,0.4) 100%)',
                backdropFilter: 'blur(5px)',
            }}
        >
            <CircularProgress color="inherit" />
        </Backdrop>
    );
}
