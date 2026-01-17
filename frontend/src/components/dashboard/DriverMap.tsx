import { Box, Typography } from '@mui/material';
import { Map as MapIcon, PersonPin, TripOrigin, LocationOn } from '@mui/icons-material';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMemo } from 'react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Helper to validate coordinates
const isValidCoord = (val: any): val is number => typeof val === 'number' && !isNaN(val);

export default function DriverMap({ activeTrip }: any) {
    // If we don't have a token, show a friendly message
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('your_token_here')) {
        return (
            <Box sx={{ width: '100%', height: '100%', bgcolor: '#f0f2f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center' }}>
                <MapIcon sx={{ fontSize: 48, color: '#90a4ae', mb: 2 }} />
                <Typography variant="h6" color="text.primary" fontWeight={700}>Mapbox Setup Required</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, mt: 1 }}>
                    Please add your Mapbox Access Token to the <strong>.env</strong> file (<code>VITE_MAPBOX_ACCESS_TOKEN</code>) to enable the live map.
                </Typography>
            </Box>
        );
    }

    // Default to Phoenix area
    const initialViewState = useMemo(() => {
        const firstStop = activeTrip?.stops?.[0];
        if (firstStop && isValidCoord(firstStop.latitude) && isValidCoord(firstStop.longitude)) {
            return {
                latitude: firstStop.latitude,
                longitude: firstStop.longitude,
                zoom: 12
            };
        }
        return {
            latitude: 33.448376,
            longitude: -112.074036,
            zoom: 11
        };
    }, [activeTrip]);

    return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
            <Map
                initialViewState={initialViewState}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                mapboxAccessToken={MAPBOX_TOKEN}
            >
                <NavigationControl position="top-right" />
                
                {/* Render Stops if present */}
                {activeTrip?.stops?.map((stop: any, idx: number) => (
                    isValidCoord(stop.latitude) && isValidCoord(stop.longitude) && (
                        <Marker 
                            key={stop.id || idx} 
                            latitude={stop.latitude} 
                            longitude={stop.longitude}
                            anchor="bottom"
                        >
                            {stop.stopType === 'PICKUP' ? (
                                <TripOrigin sx={{ color: '#4caf50', fontSize: 24 }} />
                            ) : (
                                <LocationOn sx={{ color: '#f44336', fontSize: 24 }} />
                            )}
                        </Marker>
                    )
                ))}

                {/* Simulated Driver Marker */}
                {(() => {
                    const firstStop = activeTrip?.stops?.[0];
                    if (firstStop && isValidCoord(firstStop.latitude) && isValidCoord(firstStop.longitude)) {
                        return (
                             <Marker 
                                latitude={firstStop.latitude + 0.002} 
                                longitude={firstStop.longitude + 0.002}
                                anchor="center"
                            >
                                <PersonPin sx={{ color: '#2196F3', fontSize: 32 }} />
                            </Marker>
                        );
                    }
                    return null;
                })()}
            </Map>
        </Box>
    );
}
