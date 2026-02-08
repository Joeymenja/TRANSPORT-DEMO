import { Box, Typography } from '@mui/material';
import { Map as MapIcon, PersonPin, TripOrigin, LocationOn, Navigation } from '@mui/icons-material';
import Map, { Marker, NavigationControl, Source, Layer, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMemo, useState, useEffect, useRef } from 'react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Helper to validate coordinates
const isValidCoord = (val: any): val is number => typeof val === 'number' && !isNaN(val);

interface DriverMapProps {
    activeTrip?: any;
    destination?: { lat: number; lng: number };
    showNavigation?: boolean;
    bearing?: number; // Add bearing for rotation
    pitch?: number;   // Add pitch for 3D view
}

export default function DriverMap({ activeTrip, destination, showNavigation, bearing = 0, pitch = 0 }: DriverMapProps) {
    const mapRef = useRef<MapRef>(null);
    const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);

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

    // Determine Driver Location (Mocked for now, or based on stops)
    const driverLocation = useMemo(() => {
        const firstStop = activeTrip?.stops?.[0];
        const lat = firstStop?.latitude ?? firstStop?.gpsLatitude;
        const lng = firstStop?.longitude ?? firstStop?.gpsLongitude;
        
        // Mock driver location near the first stop or default
        if (isValidCoord(lat) && isValidCoord(lng)) {
            return { lat: lat + 0.002, lng: lng + 0.002 };
        }
        return { lat: 33.4484, lng: -112.0740 };
    }, [activeTrip]);

    // Camera update effect - Handles "Follow Mode"
    useEffect(() => {
        if (!mapRef.current) return;

        if (showNavigation && destination && driverLocation) {
            // In Navigation Mode, we follow the driver closely with pitch
             mapRef.current.flyTo({
                center: [driverLocation.lng, driverLocation.lat],
                zoom: 17, // Closer zoom for navigation
                pitch: 60, // 3D Tilt
                bearing: bearing, // Rotate with car
                padding: { top: 0, bottom: 200, left: 0, right: 0 }, // Offset for controls
                duration: 1000 // Smooth transition
            });
        } else if (destination && driverLocation) {
            // Overview Mode
             const minLng = Math.min(driverLocation.lng, destination.lng);
             const maxLng = Math.max(driverLocation.lng, destination.lng);
             const minLat = Math.min(driverLocation.lat, destination.lat);
             const maxLat = Math.max(driverLocation.lat, destination.lat);
 
             mapRef.current.fitBounds(
                 [
                     [minLng, minLat],
                     [maxLng, maxLat]
                 ],
                 {
                     padding: { top: 100, bottom: 400, left: 50, right: 50 },
                     duration: 2000,
                     pitch: 0, // Reset pitch
                     bearing: 0 // Reset bearing
                 }
             );
        }
    }, [showNavigation, destination, driverLocation, bearing]);

    // Fetch Route functionality with LocalStorage Caching (Offline Support)
    useEffect(() => {
        if (!showNavigation || !destination || !driverLocation) return;
        
        const fetchRoute = async () => {
            const cacheKey = `route-${driverLocation.lng}-${driverLocation.lat}-${destination.lng}-${destination.lat}`;
            const cached = localStorage.getItem(cacheKey);
            
            if (cached) {
                try {
                    setRouteGeoJSON(JSON.parse(cached));
                    return;
                } catch (e) {
                    console.warn("Invalid cached route");
                }
            }

            try {
                const query = await fetch(
                    `https://api.mapbox.com/directions/v5/mapbox/driving/${driverLocation.lng},${driverLocation.lat};${destination.lng},${destination.lat}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`
                );
                const json = await query.json();
                if (json.routes && json.routes[0]) {
                    const data = json.routes[0];
                    const route = data.geometry.coordinates;
                    
                    const geojson = {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: route
                        }
                    };
                    setRouteGeoJSON(geojson);
                    // Cache the route
                    localStorage.setItem(cacheKey, JSON.stringify(geojson));
                }
            } catch (err) {
                console.error("Failed to fetch route", err);
            }
        };

        fetchRoute();
    }, [showNavigation, destination, driverLocation]);

    // Default view state
    const initialViewState = useMemo(() => {
        return {
            latitude: 33.448376,
            longitude: -112.074036,
            zoom: 11,
            pitch: 0,
            bearing: 0
        };
    }, []);

    const routeLayer = {
        id: 'route',
        type: 'line',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#007AFF', // Apple Maps Blue
            'line-width': 8,
            'line-opacity': 0.8
        }
    };

    // 3D Buildings Layer
    const buildingLayer = {
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height']
            ],
            'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
        }
    };

    return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
             <Map
                ref={mapRef}
                initialViewState={initialViewState}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/navigation-night-v1" // Night mode for better contrast
                mapboxAccessToken={MAPBOX_TOKEN}
                terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }} // Enable terrain
            >
                {/* Add DEM source for terrain if needed, usually requires adding source explicitly */}
                {/* <Source id="mapbox-dem" type="raster-dem" url="mapbox://mapbox.mapbox-terrain-dem-v1" tileSize={512} maxzoom={14} /> */}

                <NavigationControl position="top-right" showCompass={false} />
                
                {/* Route Line */}
                {showNavigation && routeGeoJSON && (
                    <Source id="my-data" type="geojson" data={routeGeoJSON}>
                        <Layer {...(routeLayer as any)} />
                    </Source>
                )}

                {/* 3D Buildings - Added automatically by map style usually, but explicit layer gives control */}
                {showNavigation && (
                    <Layer {...(buildingLayer as any)} />
                )}

                {/* Destination Marker */}
                {showNavigation && destination && (
                     <Marker 
                        latitude={destination.lat} 
                        longitude={destination.lng}
                        anchor="bottom"
                    >
                        <LocationOn sx={{ color: '#FF3B30', fontSize: 40, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                    </Marker>
                )}

                {/* Stops (Overview Mode) */}
                {!showNavigation && activeTrip?.stops?.map((stop: any, idx: number) => {
                    const lat = stop.latitude ?? stop.gpsLatitude;
                    const lng = stop.longitude ?? stop.gpsLongitude;
                    if (isValidCoord(lat) && isValidCoord(lng)) {
                        return (
                            <Marker key={stop.id || idx} latitude={lat} longitude={lng} anchor="bottom">
                                <TripOrigin sx={{ color: stop.stopType === 'PICKUP' ? '#34C759' : '#FF3B30', fontSize: 24 }} />
                            </Marker>
                        );
                    }
                    return null;
                })}

                {/* Driver Vehicle - 3D Puck Style */}
                <Marker 
                    latitude={driverLocation.lat} 
                    longitude={driverLocation.lng}
                    anchor="center"
                    pitchAlignment="map"
                    rotationAlignment="map"
                    rotation={bearing} // Rotate the marker itself
                >
                    <Box sx={{
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'white',
                        borderRadius: '50%',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                    }}>
                        <Navigation sx={{ fontSize: 28, color: '#007AFF', transform: `rotate(0deg)` }} /> 
                    </Box>
                </Marker>
            </Map>
        </Box>
    );
}
