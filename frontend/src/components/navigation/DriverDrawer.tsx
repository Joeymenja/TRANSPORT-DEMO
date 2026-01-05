import { Drawer, Box, List, ListItem, ListItemIcon, ListItemText, Typography, Avatar, Divider, Chip } from '@mui/material';
import {
    HomeOutlined, CalendarMonthOutlined, ChatBubbleOutline,
    DirectionsCarOutlined, PersonOutline, FolderOutlined,
    SettingsOutlined, HelpOutline, Logout, ChevronRight
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
            case 'AVAILABLE': return { bg: '#E8F5E9', color: '#2E7D32' };
            case 'ON_BREAK': return { bg: '#FFF9C4', color: '#F57F17' };
            case 'OFF_DUTY': return { bg: '#F5F5F5', color: '#616161' };
            default: return { bg: '#E3F2FD', color: '#1565C0' };
        }
    };

    const statusStyle = getStatusColor(driver?.currentStatus || 'OFF_DUTY');

    return (
        <Drawer
            anchor="left"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: '80%', maxWidth: 320,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)' // SHADOW-LEVEL-004
                }
            }}
        >
            {/* Header: NAV-HEADER-LIGHT-002 */}
            <Box sx={{ p: 2.5, pt: 6, bgcolor: 'white', borderBottom: '1px solid #f0f0f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Avatar
                        src={user?.profileImage}
                        sx={{ width: 48, height: 48, bgcolor: '#f5f5f5', color: '#666' }}
                    >
                        {user?.firstName?.[0]}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight={600} sx={{ color: '#333' }}>
                            {user?.firstName} {user?.lastName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
                            ID: {driver?.id?.slice(0, 5) || '---'}
                        </Typography>
                    </Box>
                </Box>

                {/* Status Badge */}
                <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: statusStyle.bg, px: 1, py: 0.5, borderRadius: 4 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusStyle.color, mr: 1 }} />
                    <Typography variant="caption" fontWeight={600} sx={{ color: statusStyle.color }}>
                        {driver?.currentStatus?.replace('_', ' ') || 'OFF DUTY'}
                    </Typography>
                </Box>
            </Box>

            {/* Menu Items: NAV-MENU-LIGHT-001 */}
            <List sx={{ pt: 1, px: 1 }}>
                {[
                    { text: 'Dashboard', icon: <HomeOutlined />, path: '/driver' },
                    { text: 'My Schedule', icon: <CalendarMonthOutlined />, path: '/driver/schedule' },
                    { text: 'Messages', icon: <ChatBubbleOutline />, path: '/driver/messages', badge: 3 }, // Mock badge
                    { text: 'Trips', icon: <DirectionsCarOutlined />, path: '/driver/trips' },
                    { text: 'Profile', icon: <PersonOutline />, path: '/driver/profile' },
                ].map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem
                            key={item.text}
                            button
                            onClick={() => handleNavigate(item.path)}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                bgcolor: isActive ? '#E3F2FD' : 'transparent', // Light Brand Tint active
                                color: isActive ? 'primary.main' : '#333',
                                '&:hover': { bgcolor: '#F5F5F5' }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'primary.main' : '#666' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{ fontSize: 15, fontWeight: isActive ? 600 : 500 }}
                            />
                            {item.badge && (
                                <Box sx={{
                                    bgcolor: 'primary.main', color: 'white',
                                    fontSize: 11, fontWeight: 'bold',
                                    minWidth: 18, height: 18, borderRadius: '9px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0.5, mr: 1
                                }}>
                                    {item.badge}
                                </Box>
                            )}
                            <ChevronRight sx={{ fontSize: 18, color: '#ccc' }} />
                        </ListItem>
                    );
                })}
            </List>

            <Divider sx={{ my: 1, mx: 2, borderColor: '#eee' }} />

            <List sx={{ px: 1 }}>
                {[
                    { text: 'Documents', icon: <FolderOutlined />, path: '/driver/documents' },
                    { text: 'Settings', icon: <SettingsOutlined />, path: '/driver/settings' },
                    { text: 'Help & Support', icon: <HelpOutline />, path: '/driver/help' },
                ].map((item) => (
                    <ListItem
                        key={item.text}
                        button
                        onClick={() => handleNavigate(item.path)}
                        sx={{ borderRadius: 2, mb: 0.5, color: '#333' }}
                    >
                        <ListItemIcon sx={{ minWidth: 40, color: '#666' }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }} />
                        <ChevronRight sx={{ fontSize: 18, color: '#ccc' }} />
                    </ListItem>
                ))}
            </List>

            <Box sx={{ mt: 'auto', p: 3 }}>
                <ListItem button onClick={handleLogout} sx={{ color: '#D32F2F', px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: '#D32F2F' }}><Logout /></ListItemIcon>
                    <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 500 }} />
                </ListItem>
                <Typography variant="caption" sx={{ color: '#ccc', display: 'block', mt: 2, textAlign: 'center' }}>
                    v1.0.0
                </Typography>
            </Box>
        </Drawer>
    );
}
