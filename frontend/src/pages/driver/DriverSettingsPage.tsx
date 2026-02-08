import React, { useState } from 'react';
import { Box, Typography, Paper, Avatar, Button, Container, Switch, Divider, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, ListItemIcon, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { 
    ArrowBack, 
    Notifications, 
    Fingerprint, 
    DarkMode, 
    Map, 
    RecordVoiceOver, 
    Language, 
    Help, 
    PrivacyTip, 
    Logout,
    ChevronRight,
    Settings,
    AutoAwesome
} from '@mui/icons-material';
import { useAuthStore } from '../../store/auth';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../../store/settings';

export default function DriverSettingsPage() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    
    // Global Settings State
    const { 
        notifications, toggleNotifications,
        biometric, toggleBiometric,
        darkMode, toggleDarkMode,
        voiceGuidance, toggleVoiceGuidance,
        showNetworkCard, toggleNetworkCard
    } = useSettingsStore();

    const [openLogout, setOpenLogout] = useState(false);

    const handleLogout = () => {
        setOpenLogout(true);
    };

    const confirmLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', pb: 8 }}>
            {/* Header */}
            <Box sx={{ p: 2, pt: 6, display: 'flex', alignItems: 'center', bgcolor: 'white', borderBottom: '1px solid #eee' }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h6" fontWeight={800} sx={{ flex: 1, textAlign: 'center', mr: 5 }}>
                    Settings
                </Typography>
            </Box>

            <Container maxWidth="sm" sx={{ p: 0 }}>
                {/* User Summary */}
                <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'white', mb: 1 }}>
                    <Avatar 
                        sx={{ width: 64, height: 64, bgcolor: '#263238' }}
                        src={user?.profileImage}
                    >
                        {user?.firstName?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={800}>
                            {user?.firstName} {user?.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {user?.role || 'Driver'} • {user?.email}
                        </Typography>
                    </Box>
                    <IconButton onClick={() => navigate('/driver/profile/edit')}>
                        <Settings color="action" />
                    </IconButton>
                </Box>

                <SectionHeader title="PREFERENCES" />
                <SettingsList>
                    <SettingItem 
                        icon={<Notifications />} 
                        title="Push Notifications" 
                        action={<Switch checked={notifications} onChange={toggleNotifications} />} 
                    />
                    <Divider variant="inset" component="li" />
                    <SettingItem 
                        icon={<Fingerprint />} 
                        title="Biometric Login" 
                        action={<Switch checked={biometric} onChange={toggleBiometric} />} 
                    />
                    <Divider variant="inset" component="li" />
                    <SettingItem 
                        icon={<DarkMode />} 
                        title="Dark Mode" 
                        action={<Switch checked={darkMode} onChange={toggleDarkMode} />} 
                    />
                </SettingsList>

                <SectionHeader title="NAVIGATION & UX" />
                <SettingsList>
                    <SettingItem 
                        icon={<Map />} 
                        title="Map Display" 
                        action={<Typography variant="body2" color="primary" fontWeight={700}>Standard</Typography>} 
                    />
                    <Divider variant="inset" component="li" />
                    <SettingItem 
                        icon={<RecordVoiceOver />} 
                        title="Voice Guidance" 
                        action={<Switch checked={voiceGuidance} onChange={toggleVoiceGuidance} />} 
                    />
                    <Divider variant="inset" component="li" />
                     <SettingItem 
                        icon={<AutoAwesome />} // Using AutoAwesome for AI
                        title="Show Network Pulse (AI)" 
                        action={<Switch checked={showNetworkCard} onChange={toggleNetworkCard} />} 
                    />
                    <Divider variant="inset" component="li" />
                    <SettingItem 
                        icon={<Language />} 
                        title="Language" 
                        action={<Typography variant="body2" color="text.secondary">English</Typography>} 
                    />
                </SettingsList>


                <SectionHeader title="INTEGRATIONS" />
                <SettingsList>
                    <SettingItem 
                        icon={<Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.2rem', color: '#006BFF' }}>C</Typography>} 
                        title="Connect Calendly" 
                        action={<Switch color="primary" defaultChecked />} 
                    />
                </SettingsList>

                <SectionHeader title="ACCOUNT & SUPPORT" />
                <SettingsList>
                    <SettingItem 
                        icon={<Help />} 
                        title="Help Center" 
                        action={<ChevronRight color="action" />} 
                        onClick={() => navigate('/driver/help')}
                    />
                    <Divider variant="inset" component="li" />
                    <SettingItem 
                        icon={<PrivacyTip />} 
                        title="Privacy Policy" 
                        action={<ChevronRight color="action" />} 
                    />
                    <Divider variant="inset" component="li" />
                    <SettingItem 
                        icon={<Fingerprint />} 
                        title="Stored Signature" 
                        action={<Typography variant="body2" color="primary" fontWeight={700}>Auto-Signature</Typography>} 
                        onClick={() => navigate('/driver/profile/signature')}
                    />
                </SettingsList>

                <Box sx={{ p: 3, mt: 2 }}>
                    <Button 
                        fullWidth 
                        variant="outlined" 
                        color="error"
                        size="large"
                        startIcon={<Logout />}
                        onClick={handleLogout}
                        sx={{ 
                            borderRadius: 3, 
                            py: 1.5, 
                            fontWeight: 700, 
                            borderWidth: 2,
                            '&:hover': { borderWidth: 2, bgcolor: '#FEF2F2' }
                        }}
                    >
                        Log Out
                    </Button>
                    <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', mt: 2 }}>
                        App Version 2.4.0 (Build 8829)
                    </Typography>
                </Box>
            </Container>

            <Dialog
                open={openLogout}
                onClose={() => setOpenLogout(false)}
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Confirm Logout</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to log out? Your shift data has been synchronized.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenLogout(false)} sx={{ color: 'text.secondary', fontWeight: 600 }}>Stay Logged In</Button>
                    <Button 
                        variant="contained" 
                        color="error" 
                        onClick={confirmLogout}
                        sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
                    >
                        Log Out
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}

function SectionHeader({ title }: { title: string }) {
    return (
        <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ px: 3, mt: 3, mb: 1, display: 'block' }}>
            {title}
        </Typography>
    );
}

function SettingsList({ children }: { children: React.ReactNode }) {
    return (
        <Paper elevation={0} sx={{ borderRadius: 0 }}>
            <List disablePadding>
                {children}
            </List>
        </Paper>
    );
}

function SettingItem({ icon, title, action, onClick }: { icon: React.ReactNode, title: string, action?: React.ReactNode, onClick?: () => void }) {
    return (
        <ListItem button={!!onClick} onClick={onClick}>
            <ListItemIcon sx={{ minWidth: 40, color: '#64748B' }}>
                {icon}
            </ListItemIcon>
            <ListItemText 
                primary={<Typography variant="body2" fontWeight={600}>{title}</Typography>} 
            />
            {action && (
                <ListItemSecondaryAction>
                    {action}
                </ListItemSecondaryAction>
            )}
        </ListItem>
    );
}
