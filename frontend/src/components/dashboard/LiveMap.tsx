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
    fullScreen?: boolean;
    theme?: 'light' | 'dark';
}

export default function LiveMap({ drivers: initialDrivers, height = 500, fullScreen = false, theme = 'light' }: LiveMapProps) {
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

    const mapStyle = theme === 'dark' 
        ? "mapbox://styles/mapbox/dark-v11" 
        : "mapbox://styles/mapbox/light-v11";

    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('your_token_here')) {
        return (
            <Paper elevation={0} variant="outlined" sx={{ height, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle1" fontWeight={700}>Mapbox Configuration Required</Typography>
            </Paper>
        );
    }

    const MapContent = (
        <Map
            initialViewState={initialViewState}
            style={{ width: '100%', height: '100%' }}
            mapStyle={mapStyle}
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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 24,
                            height: 24,
                            bgcolor: driver.currentStatus === 'AVAILABLE' ? '#4caf50' : '#2196F3',
                            borderRadius: '50%',
                            boxShadow: `0 0 10px ${driver.currentStatus === 'AVAILABLE' ? '#4caf50' : '#2196F3'}`,
                            border: '2px solid white',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.2)' }
                        }}>
                             <PersonPin sx={{ color: 'white', fontSize: 16 }} />
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
                    className="custom-popup"
                >
                    <Box sx={{ p: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                            {selectedDriver.user.firstName} {selectedDriver.user.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                             Status: {selectedDriver.currentStatus}
                        </Typography>
                    </Box>
                </Popup>
             )}
        </Map>
    );

    if (fullScreen) {
        return (
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                {MapContent}
            </Box>
        );
    }

    return (
        <Paper elevation={0} variant="outlined" sx={{ height, width: '100%', overflow: 'hidden', borderRadius: 2 }}>
            {MapContent}
        </Paper>
    );
}
