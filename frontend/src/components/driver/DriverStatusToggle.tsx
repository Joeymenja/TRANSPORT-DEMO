import { useState, useEffect } from 'react';
import { Box, ToggleButtonGroup, ToggleButton, Typography, CircularProgress } from '@mui/material';
import { CheckCircle, PauseCircle, Dangerous } from '@mui/icons-material'; // Icons
import { driverApi } from '../../api/drivers';
import { useAuthStore } from '../../store/auth';

interface Props {
    driverId: string;
    initialStatus?: string;
    onChange?: (newStatus: string) => void;
}

export default function DriverStatusToggle({ driverId, initialStatus = 'OFF_DUTY', onChange }: Props) {
    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);

    const handleStatusChange = async (event: React.MouseEvent<HTMLElement>, newStatus: string) => {
        if (!newStatus || newStatus === status) return;

        setLoading(true);
        try {
            // Get location if possible
            let lat, lng;
            if (navigator.geolocation) {
                try {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                    });
                    lat = position.coords.latitude;
                    lng = position.coords.longitude;
                } catch (e) {
                    console.warn('Location access denied or failed', e);
                }
            }

            await driverApi.updateStatus({
                driverId,
                status: newStatus,
                lat,
                lng
            });
            setStatus(newStatus);
            if (onChange) onChange(newStatus);
        } catch (err: any) {
            console.error('Failed to update status', err);
            alert(`Failed to update status: ${err.response?.data?.message || err.message}`);
            // Revert or show error
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ width: '100%', mb: 2 }}>
            <Typography variant="overline" color="text.secondary" fontWeight={700}>
                Current Status
            </Typography>
            <ToggleButtonGroup
                color="primary"
                value={status}
                exclusive
                onChange={handleStatusChange}
                fullWidth
                disabled={loading}
                sx={{
                    mt: 1,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    '& .MuiToggleButton-root': { py: 1.5 }
                }}
            >
                <ToggleButton value="AVAILABLE" color="success">
                    <CheckCircle sx={{ mr: 1, fontSize: 20 }} />
                    Available
                </ToggleButton>
                <ToggleButton value="ON_BREAK" color="warning">
                    <PauseCircle sx={{ mr: 1, fontSize: 20 }} />
                    Break
                </ToggleButton>
                <ToggleButton value="OFF_DUTY" color="error">
                    <Dangerous sx={{ mr: 1, fontSize: 20 }} />
                    Off Duty
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
}
