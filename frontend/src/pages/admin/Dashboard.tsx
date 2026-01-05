import { Box, Typography, Grid, Paper } from '@mui/material';
import { Assessment, Group, DirectionsCar } from '@mui/icons-material';

export default function Dashboard() {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Assessment color="primary" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6">Trips</Typography>
                        <Typography variant="h4">24</Typography>
                        <Typography variant="body2" color="text.secondary">Today</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <DirectionsCar color="primary" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6">Active Drivers</Typography>
                        <Typography variant="h4">8</Typography>
                        <Typography variant="body2" color="text.secondary">Online</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Group color="primary" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6">Clients</Typography>
                        <Typography variant="h4">156</Typography>
                        <Typography variant="body2" color="text.secondary">Total</Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
