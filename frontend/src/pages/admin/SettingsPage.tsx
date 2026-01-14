
import { Box, Container, Typography, Paper, FormControlLabel, Switch, Divider, Grid, TextField, Button, Alert } from '@mui/material';
import { usePreferencesStore } from '../../store/preferences';
import { Receipt, Paid, DirectionsCar } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { organizationApi } from '../../api/organization';

export default function SettingsPage() {
    const { features, toggleFeature } = usePreferencesStore();
    const [orgForm, setOrgForm] = useState({
        ahcccsProviderId: '',
        address: '',
        phoneNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadOrganization();
    }, []);

    const loadOrganization = async () => {
        try {
            const org = await organizationApi.get();
            setOrgForm({
                ahcccsProviderId: org.ahcccsProviderId || '',
                address: org.address || '',
                phoneNumber: org.phoneNumber || ''
            });
        } catch (error) {
            console.error('Failed to load organization', error);
        }
    };

    const handleSaveOrg = async () => {
        setLoading(true);
        setMessage(null);
        try {
            await organizationApi.update(orgForm);
            setMessage({ type: 'success', text: 'Organization settings saved successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setLoading(false);
        }
    };

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

            <Box mb={4} />

            <Paper sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Provider Information
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                    These details will appear on the AHCCCS Trip Reports.
                </Typography>

                {message && (
                    <Alert severity={message.type} sx={{ mb: 3 }}>
                        {message.text}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="AHCCCS Provider ID"
                            value={orgForm.ahcccsProviderId}
                            onChange={(e) => setOrgForm({ ...orgForm, ahcccsProviderId: e.target.value })}
                            placeholder="e.g. 123456"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Phone Number"
                            value={orgForm.phoneNumber}
                            onChange={(e) => setOrgForm({ ...orgForm, phoneNumber: e.target.value })}
                            placeholder="(602) 555-0123"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Company Address"
                            value={orgForm.address}
                            onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                            placeholder="e.g. 123 Business St, Phoenix, AZ 85000"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            onClick={handleSaveOrg}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}
