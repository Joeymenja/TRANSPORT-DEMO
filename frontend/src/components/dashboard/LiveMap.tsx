import { useSocket } from '../../context/SocketContext';
import { useEffect, useState, useMemo } from 'react';
import { Box, Paper, Typography, Chip, Avatar } from '@mui/material';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Driver } from '../../api/drivers';
import { PersonPin } from '@mui/icons-material';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Helper to validate coordinates
const isValidCoord = (val: any): val is number => typeof val === 'number' && !isNaN(val);

interface LiveMapProps {
    drivers: Driver[];
    height?: string | number;
}

export default function LiveMap({ drivers: initialDrivers, height = 500 }: LiveMapProps) {
    const socket = useSocket();
    const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    
    useEffect(() => {
        setDrivers(initialDrivers);
    }, [initialDrivers]);

    useEffect(() => {
        if (!socket) return;

        socket.emit('join_room', 'admin');

        socket.on('driver_location_updated', (data: { driverId: string, lat: number, lng: number, status: string }) => {
            setDrivers(prev => prev.map(d => {
                if (d.id === data.driverId) {
                    return {
                        ...d,
                        currentLatitude: data.lat,
                        currentLongitude: data.lng,
                        currentStatus: data.status as any,
                        lastStatusUpdate: new Date().toISOString()
                    };
                }
                return d;
            }));
        });

        return () => {
            socket.off('driver_location_updated');
            socket.emit('leave_room', 'admin');
        };
    }, [socket]);

    const initialViewState = useMemo(() => ({
        latitude: 33.4152,
        longitude: -111.8315,
        zoom: 12
    }), []);

    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('your_token_here')) {
        return (
            <Paper elevation={0} variant="outlined" sx={{ height, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle1" fontWeight={700}>Mapbox Configuration Required</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', px: 2 }}>
                    Update VITE_MAPBOX_ACCESS_TOKEN in your .env file.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={0} variant="outlined" sx={{ height, width: '100%', overflow: 'hidden', borderRadius: 2 }}>
            <Map
                initialViewState={initialViewState}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/light-v11"
                mapboxAccessToken={MAPBOX_TOKEN}
            >
                <NavigationControl position="top-right" />

                {drivers.map(driver => {
                    const hasLocation = isValidCoord(driver.currentLatitude) && isValidCoord(driver.currentLongitude);
                    if (!hasLocation) return null;

                    return (
                        <Marker
                            key={driver.id}
                            latitude={driver.currentLatitude!}
                            longitude={driver.currentLongitude!}
                            anchor="center"
                            onClick={e => {
                                e.originalEvent.stopPropagation();
                                setSelectedDriver(driver);
                            }}
                        >
                            <Box sx={{ 
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.2)' }
                            }}>
                                <PersonPin sx={{ 
                                    color: driver.currentStatus === 'AVAILABLE' ? '#4caf50' : '#2196F3',
                                    fontSize: 32,
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                }} />
                            </Box>
                        </Marker>
                    );
                })}

                {selectedDriver && isValidCoord(selectedDriver.currentLatitude) && isValidCoord(selectedDriver.currentLongitude) && (
                    <Popup
                        latitude={selectedDriver.currentLatitude!}
                        longitude={selectedDriver.currentLongitude!}
                        anchor="bottom"
                        onClose={() => setSelectedDriver(null)}
                        closeButton={true}
                        maxWidth="300px"
                    >
                        <Box sx={{ p: 1 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'primary.main' }}>
                                    {selectedDriver.user.firstName[0]}{selectedDriver.user.lastName[0]}
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        {selectedDriver.user.firstName} {selectedDriver.user.lastName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {selectedDriver.assignedVehicle?.vehicleNumber || 'No Fleet ID'}
                                    </Typography>
                                </Box>
                            </Box>
                            <Chip
                                label={(selectedDriver.currentStatus || 'OFF_DUTY').replace('_', ' ')}
                                size="small"
                                color={selectedDriver.currentStatus === 'AVAILABLE' ? 'success' : 'primary'}
                                sx={{ width: '100%', mb: 1, fontWeight: 700 }}
                            />
                            {selectedDriver.lastStatusUpdate && (
                                <Typography variant="caption" display="block" color="text.secondary" align="right">
                                    Last Update: {new Date(selectedDriver.lastStatusUpdate).toLocaleTimeString()}
                                </Typography>
                            )}
                        </Box>
                    </Popup>
                )}
            </Map>
        </Paper>
    );
}
