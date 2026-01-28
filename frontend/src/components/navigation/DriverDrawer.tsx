import { Drawer, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, Divider, Chip } from '@mui/material';
import {
    HomeOutlined, CalendarMonthOutlined, ChatBubbleOutline,
    DirectionsCarOutlined, PersonOutline, FolderOutlined,
    SettingsOutlined, HelpOutline, Logout, ChevronRight,
    Person, VerifiedUser, History as BackfillIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';

interface DriverDrawerProps {
    open: boolean;
    onClose: () => void;
    driver: any;
}

export default function DriverDrawer({ open, onClose, driver }: DriverDrawerProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);

    const handleNavigate = (path: string) => {
        navigate(path);
        onClose();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return { bg: '#dcfce7', color: '#166534', label: 'Available' };
            case 'ON_BREAK': return { bg: '#fef9c3', color: '#854d0e', label: 'On Break' };
            case 'ON_TRIP': return { bg: '#dbeafe', color: '#1e40af', label: 'On Trip' };
            case 'OFF_DUTY': return { bg: '#f1f5f9', color: '#475569', label: 'Off Duty' };
            default: return { bg: '#f1f5f9', color: '#475569', label: 'Off Duty' };
        }
    };

    const statusInfo = getStatusColor(driver?.currentStatus || 'OFF_DUTY');

    const primaryNav = [
        { text: 'Dashboard', icon: <HomeOutlined />, path: '/driver' },
        { text: 'My Schedule', icon: <CalendarMonthOutlined />, path: '/driver/schedule' },
        { text: 'Trips', icon: <DirectionsCarOutlined />, path: '/driver/trips' },
        { text: 'Profile', icon: <PersonOutline />, path: '/driver/profile' },
        { text: 'Log Past Trip', icon: <BackfillIcon />, path: '/driver/backfill' },
    ];

    const secondaryNav = [
        { text: 'Documents', icon: <FolderOutlined />, path: '/driver/documents' },
        { text: 'Compliance', icon: <VerifiedUser />, path: '/driver/compliance' },
        { text: 'Settings', icon: <SettingsOutlined />, path: '/driver/settings' },
        { text: 'Help & Support', icon: <HelpOutline />, path: '/driver/help' },
    ];

    return (
        <Drawer
            anchor="left"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: '82%',
                    maxWidth: 320,
                    borderTopRightRadius: 16,
                    borderBottomRightRadius: 16,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                }
            }}
        >
            {/* Header */}
            <Box sx={{
                p: 2.5,
                pt: 'calc(env(safe-area-inset-top, 24px) + 16px)',
                bgcolor: '#fafafa',
                borderBottom: '1px solid #f0f0f0'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Avatar
                        src={user?.profileImage}
                        sx={{
                            width: 52,
                            height: 52,
                            bgcolor: '#e2e8f0',
                            color: '#64748b',
                            fontSize: '1.25rem',
                            fontWeight: 700,
                        }}
                    >
                        {user?.firstName?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1e293b', lineHeight: 1.2 }} noWrap>
                            {user?.firstName} {user?.lastName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.25 }}>
                            ID: {driver?.id?.slice(0, 8) || '---'}
                        </Typography>
                    </Box>
                </Box>

                {/* Status Pill */}
                <Box sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    bgcolor: statusInfo.bg,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 20,
                    gap: 0.75,
                }}>
                    <Box sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: statusInfo.color,
                    }} />
                    <Typography variant="caption" fontWeight={700} sx={{ color: statusInfo.color, fontSize: '0.7rem' }}>
                        {statusInfo.label}
                    </Typography>
                </Box>
            </Box>

            {/* Primary Navigation */}
            <List sx={{ pt: 1.5, px: 1 }}>
                {primaryNav.map((item) => {
                    const isActive = location.pathname === item.path || (item.path === '/driver' && (location.pathname === '/driver/' || location.pathname === '/driver/dashboard'));
                    return (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                onClick={() => handleNavigate(item.path)}
                                sx={{
                                    borderRadius: 2,
                                    mb: 0.25,
                                    py: 1.25,
                                    bgcolor: isActive ? '#eff6ff' : 'transparent',
                                    color: isActive ? '#0096D6' : '#334155',
                                    '&:hover': { bgcolor: isActive ? '#eff6ff' : '#f8fafc' },
                                    '&:active': { bgcolor: '#e0f2fe' },
                                    transition: 'background-color 0.15s ease',
                                }}
                            >
                                <ListItemIcon sx={{
                                    minWidth: 40,
                                    color: isActive ? '#0096D6' : '#94a3b8',
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: '0.9rem',
                                        fontWeight: isActive ? 700 : 500,
                                    }}
                                />
                                <ChevronRight sx={{ fontSize: 18, color: '#cbd5e1' }} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Divider sx={{ my: 1, mx: 2.5, borderColor: '#f1f5f9' }} />

            {/* Secondary Navigation */}
            <List sx={{ px: 1 }}>
                {secondaryNav.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                onClick={() => handleNavigate(item.path)}
                                sx={{
                                    borderRadius: 2,
                                    mb: 0.25,
                                    py: 1,
                                    color: isActive ? '#0096D6' : '#64748b',
                                    '&:hover': { bgcolor: '#f8fafc' },
                                    '&:active': { bgcolor: '#f1f5f9' },
                                    transition: 'background-color 0.15s ease',
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: '#94a3b8' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        color: '#64748b',
                                    }}
                                />
                                <ChevronRight sx={{ fontSize: 16, color: '#e2e8f0' }} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* Footer */}
            <Box sx={{ mt: 'auto', p: 2.5, pb: 'calc(env(safe-area-inset-bottom, 16px) + 12px)' }}>
                <Divider sx={{ mb: 2, borderColor: '#f1f5f9' }} />
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            color: '#ef4444',
                            borderRadius: 2,
                            py: 1,
                            '&:hover': { bgcolor: '#fef2f2' },
                            '&:active': { bgcolor: '#fee2e2' },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40, color: '#ef4444' }}>
                            <Logout />
                        </ListItemIcon>
                        <ListItemText
                            primary="Log Out"
                            primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                        />
                    </ListItemButton>
                </ListItem>
                <Typography variant="caption" sx={{ color: '#cbd5e1', display: 'block', mt: 1.5, textAlign: 'center', fontSize: '0.7rem' }}>
                    GVBH Transport v1.0.0
                </Typography>
            </Box>
        </Drawer>
    );
}
