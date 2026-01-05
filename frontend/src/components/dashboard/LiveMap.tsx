import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import { Box, Paper, Typography, Chip, Avatar } from '@mui/material';
import { Driver } from '../../api/drivers';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + bundlers
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons could be added here based on status
const getDriverIcon = () => {
    // For now using default, but could swap colors
    return DefaultIcon;
};

interface LiveMapProps {
    drivers: Driver[];
    height?: string | number;
}

export default function LiveMap({ drivers, height = 500 }: LiveMapProps) {
    // Center map on Phoenix/Mesa area for demo
    const defaultCenter: [number, number] = [33.4152, -111.8315];

    return (
        <Paper elevation={0} variant="outlined" sx={{ height, width: '100%', overflow: 'hidden', borderRadius: 2 }}>
            <MapContainer
                center={defaultCenter}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {drivers.map(driver => {
                    // Check if driver has valid coordinates (and is active/online)
                    // For demo purposes, we might show all active drivers
                    const hasLocation = driver.currentLatitude && driver.currentLongitude;

                    if (!hasLocation) return null;

                    return (
                        <Marker
                            key={driver.id}
                            position={[driver.currentLatitude!, driver.currentLongitude!] as [number, number]}
                            icon={getDriverIcon()}
                        >
                            <Popup>
                                <Box sx={{ minWidth: 200 }}>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.9rem' }}>
                                            {driver.user.firstName[0]}{driver.user.lastName[0]}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {driver.user.firstName} {driver.user.lastName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {driver.assignedVehicle ? `${driver.assignedVehicle.make} ${driver.assignedVehicle.model}` : 'No Vehicle'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Chip
                                        label={(driver.currentStatus || 'OFF_DUTY').replace('_', ' ')}
                                        size="small"
                                        color={driver.currentStatus === 'AVAILABLE' ? 'success' : driver.currentStatus === 'ON_TRIP' ? 'primary' : 'default'}
                                        sx={{ width: '100%' }}
                                    />
                                    {driver.lastStatusUpdate && (
                                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1, textAlign: 'right' }}>
                                            Updated: {new Date(driver.lastStatusUpdate).toLocaleTimeString()}
                                        </Typography>
                                    )}
                                </Box>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </Paper>
    );
}
