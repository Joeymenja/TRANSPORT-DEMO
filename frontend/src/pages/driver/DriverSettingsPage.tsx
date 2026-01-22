import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Switch, Divider } from '@mui/material';
import { Notifications, DarkMode, Language, Security, ChevronRight, Add } from '@mui/icons-material';
import MobileHeader from '../../components/layout/MobileHeader';
import DriverSignatureSettings from './settings/DriverSignatureSettings';

export default function DriverSettingsPage() {
    return (
        <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
            <MobileHeader title="Settings" />
            <List sx={{ p: 2 }}>
                <ListItem>
                    <ListItemIcon><Notifications /></ListItemIcon>
                    <ListItemText primary="Notifications" secondary="Push notifications for new trips" />
                    <Switch defaultChecked />
                </ListItem>
                <Divider variant="inset" component="li" />

                <ListItem>
                    <ListItemIcon><DarkMode /></ListItemIcon>
                    <ListItemText primary="Dark Mode" secondary="Coming soon" />
                    <Switch disabled />
                </ListItem>
                <Divider variant="inset" component="li" />

                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon><Language /></ListItemIcon>
                        <ListItemText primary="Language" secondary="English (US)" />
                        <ChevronRight color="action" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon><Security /></ListItemIcon>
                        <ListItemText primary="Privacy & Security" />
                        <ChevronRight color="action" />
                    </ListItemButton>
                </ListItem>
            </List>

            <Divider />
            
            <Box sx={{ px: 2, py: 2 }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>
                    Testing & Demos
                </Typography>
                <List disablePadding>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => window.location.href = '/driver/create-trip'}>
                            <ListItemIcon><Box sx={{ bgcolor: 'primary.main', borderRadius: '50%', p: 0.5, display: 'flex' }}><Add sx={{ color: '#fff', fontSize: 20 }} /></Box></ListItemIcon>
                            <ListItemText 
                                primary="Create Demo Trip" 
                                secondary="Manually create a trip for testing"
                            />
                            <ChevronRight color="action" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>

            <Divider />
            <Box sx={{ px: 2, pb: 2 }}>
                <DriverSignatureSettings />
            </Box>

            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                    Version 1.0.0 (Build 20240104)
                </Typography>
            </Box>
        </Box>
    );
}
