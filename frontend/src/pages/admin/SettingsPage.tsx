
import { Box, Container, Typography, Paper, FormControlLabel, Switch, Divider, Grid } from '@mui/material';
import { usePreferencesStore } from '../../store/preferences';
import { Receipt, Paid, DirectionsCar } from '@mui/icons-material';

export default function SettingsPage() {
    const { features, toggleFeature } = usePreferencesStore();

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Customization
                </Typography>
                <Typography color="text.secondary">
                    Manage your workspace and navigation preferences.
                </Typography>
            </Box>

            <Paper sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Navigation Tabs
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                    Select which additional features you want to see in your main navigation bar.
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box display="flex" alignItems="center" gap={2}>
                                <Receipt color={features.billing ? 'primary' : 'disabled'} />
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={500}>Billing & Claims</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Access billing reports, claims management, and invoices.
                                    </Typography>
                                </Box>
                            </Box>
                            <Switch
                                checked={features.billing}
                                onChange={() => toggleFeature('billing')}
                            />
                        </Box>
                        <Divider sx={{ my: 2 }} />
                    </Grid>

                    <Grid item xs={12}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box display="flex" alignItems="center" gap={2}>
                                <Paid color={features.payroll ? 'primary' : 'disabled'} />
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={500}>Payroll</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Manage driver payments, hours, and payroll generation.
                                    </Typography>
                                </Box>
                            </Box>
                            <Switch
                                checked={features.payroll}
                                onChange={() => toggleFeature('payroll')}
                            />
                        </Box>
                        <Divider sx={{ my: 2 }} />
                    </Grid>

                    <Grid item xs={12}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box display="flex" alignItems="center" gap={2}>
                                <DirectionsCar color={features.driverView ? 'primary' : 'disabled'} />
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={500}>Driver View Mode</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Access the simplified driver interface for testing or dispatch.
                                    </Typography>
                                </Box>
                            </Box>
                            <Switch
                                checked={features.driverView}
                                onChange={() => toggleFeature('driverView')}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}
