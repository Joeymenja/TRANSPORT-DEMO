import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Switch, Divider } from '@mui/material';
import { Notifications, DarkMode, Language, Security, ChevronRight } from '@mui/icons-material';
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

                <ListItem button>
                    <ListItemIcon><Language /></ListItemIcon>
                    <ListItemText primary="Language" secondary="English (US)" />
                    <ChevronRight color="action" />
                </ListItem>
                <ListItem button>
                    <ListItemIcon><Security /></ListItemIcon>
                    <ListItemText primary="Privacy & Security" />
                    <ChevronRight color="action" />
                </ListItem>
            </List>

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
