import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Avatar, Button, Container, TextField, IconButton } from '@mui/material';
import { ArrowBack, CameraAlt, Save } from '@mui/icons-material';
import { useAuthStore } from '../../store/auth';

import { useToastStore } from '../../store/toast';

export default function EditDriverProfilePage() {
    const navigate = useNavigate();
    const { showToast } = useToastStore();
    const user = useAuthStore((state) => state.user);
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [phone, setPhone] = useState(user?.phone || '+1 (602) 555-0100');
    const [email, setEmail] = useState(user?.email || '');

    const handleSave = () => {
        // Mock save
        showToast('Profile updated successfully.', 'success');
        navigate('/driver/profile');
    };

    return (
        <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ p: 2, pt: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'white', borderBottom: '1px solid #eee' }}>
                <Button onClick={() => navigate(-1)} sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Cancel
                </Button>
                <Typography variant="h6" fontWeight={800}>
                    Edit Profile
                </Typography>
                <Button onClick={handleSave} sx={{ color: '#14B8A6', fontWeight: 800 }}>
                    Save
                </Button>
            </Box>

            <Container maxWidth="sm" sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ position: 'relative' }}>
                        <Avatar 
                            sx={{ width: 100, height: 100, border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', bgcolor: '#263238' }}
                            src={user?.profileImage}
                        >
                            {user?.firstName?.[0]}
                        </Avatar>
                        <IconButton 
                            sx={{ 
                                position: 'absolute', 
                                bottom: 0, 
                                right: 0, 
                                bgcolor: '#14B8A6', 
                                color: 'white', 
                                border: '2px solid white',
                                '&:hover': { bgcolor: '#0D9488' }
                            }}
                        >
                            <CameraAlt sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Box>
                    <Typography variant="caption" color="primary" fontWeight={700} sx={{ mt: 2 }}>
                        CHANGE PHOTO
                    </Typography>
                </Box>

                <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block' }}>
                    PERSONAL INFORMATION
                </Typography>
                <Paper sx={{ p: 2, borderRadius: 3, mb: 4 }}>
                    <TextField 
                        fullWidth 
                        label="First Name" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)}
                        variant="outlined" 
                        sx={{ mb: 2 }}
                    />
                    <TextField 
                        fullWidth 
                        label="Last Name" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)}
                        variant="outlined" 
                        sx={{ mb: 2 }}
                    />
                    <TextField 
                        fullWidth 
                        label="Phone Number" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        variant="outlined" 
                        sx={{ mb: 2 }}
                    />
                     <TextField 
                        fullWidth 
                        label="Email" 
                        value={email} 
                        disabled
                        variant="filled" 
                        helperText="Contact support to change email"
                    />
                </Paper>

                <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block' }}>
                    VEHICLE DETAILS
                </Typography>
                <Paper sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">Make / Model</Typography>
                        <Typography variant="body2" fontWeight={700}>Toyota Sienna 2023</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">License Plate</Typography>
                        <Typography variant="body2" fontWeight={700}>AZ BMT-4829</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        *Vehicle information is managed by fleet admin.
                    </Typography>
                </Paper>

            </Container>
        </Box>
    );
}
