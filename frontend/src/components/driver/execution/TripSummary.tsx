import { Box, Typography, Button, Paper, Divider, Grid } from '@mui/material';
import { CheckCircleOutline, DirectionsCar, Description, Edit } from '@mui/icons-material';

interface TripSummaryProps {
    startOdometer: number;
    endOdometer?: number;
    notes?: string;
    signature?: string | null;
    onSubmit: () => void;
}

export default function TripSummary({ startOdometer, endOdometer, notes, signature, onSubmit }: TripSummaryProps) {
    const distance = endOdometer && startOdometer ? (endOdometer - startOdometer).toFixed(1) : '0.0';

    return (
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
            <Box sx={{ textAlign: 'center', mb: 3, mt: 2 }}>
                <CheckCircleOutline sx={{ fontSize: 64, color: 'success.main', mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>Trip Completed!</Typography>
                <Typography variant="body2" color="text.secondary">
                    Your trip report has been submitted successfully.
                </Typography>
            </Box>

            <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: '#fafafa' }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DirectionsCar fontSize="small" color="primary" />
                    Trip Details
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Start Odometer</Typography>
                        <Typography variant="body1" fontWeight={500}>{startOdometer} mi</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">End Odometer</Typography>
                        <Typography variant="body1" fontWeight={500}>{endOdometer || '--'} mi</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">Total Distance</Typography>
                            <Typography variant="h6" fontWeight={700} color="primary.main">{distance} mi</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {notes && (
                <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Description fontSize="small" color="action" />
                        Notes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {notes}
                    </Typography>
                </Paper>
            )}

            {signature && (
                <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Edit fontSize="small" color="action" />
                        Client Signature
                    </Typography>
                    <Box sx={{
                        height: 80,
                        bgcolor: '#fff',
                        border: '1px dashed #e0e0e0',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}>
                        <img src={signature} alt="Client Signature" style={{ maxHeight: '100%', maxWidth: '100%' }} />
                    </Box>
                </Paper>
            )}

            <Box sx={{ mt: 'auto' }}>
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={onSubmit}
                    sx={{ borderRadius: 3, height: 50, fontSize: '1rem', textTransform: 'none' }}
                >
                    Back to Dashboard
                </Button>
            </Box>
        </Box>
    );
}
