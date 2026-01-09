import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Paper, Fab } from '@mui/material';
import { MyLocation, Navigation } from '@mui/icons-material';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// --- Icon Fixes for Leaflet in React ---
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

// Custom Icons
const CarIcon = L.divIcon({
    html: `<div style="background-color: #2196F3; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-car-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

const LocationMarker = ({ position }: { position: L.LatLngExpression | null }) => {
    const map = useMap();
    
    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position === null ? null : (
        <>
             <Marker position={position} icon={CarIcon}>
                <Popup>You are here</Popup>
            </Marker>
            <Circle center={position} radius={50} pathOptions={{ color: '#2196F3', fillColor: '#2196F3', fillOpacity: 0.2 }} />
        </>
    );
};

// Recenter Control
const RecenterControl = ({ position, onClick }: { position: L.LatLngExpression | null, onClick: () => void }) => {
    return (
        <Box sx={{ position: 'absolute', bottom: 20, right: 20, zIndex: 1000 }}>
             <Fab color="primary" size="small" onClick={onClick} disabled={!position}>
                <MyLocation />
            </Fab>
        </Box>
    );
}

interface DriverMapProps {
    activeTrip?: any; // Pass trip data for route rendering
    className?: string;
}

export default function DriverMap({ activeTrip }: DriverMapProps) {
    const [position, setPosition] = useState<L.LatLngExpression | null>(null); // [lat, lng]
    // Default to Phoenix Area if no location yet
    const defaultCenter: L.LatLngExpression = [33.4484, -112.0740]; 

    // Geolocation Hook (Real-world readiness)
    useEffect(() => {
        if (!navigator.geolocation) {
            console.warn("Geolocation is not supported by this browser.");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition([latitude, longitude]);
            },
            (err) => {
                console.error("Geolocation error:", err);
                // Fallback or alert could go here
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000
            } // Factory config: High accuracy necessary
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    const handleRecenter = () => {
         // Logic handled by useEffect or explicit flyTo if we lift map ref state. 
         // For now, simpler: pass signal or just rely on state update if we want 'follow' mode.
         // Actually, LocationMarker automatically follows.
         // IF we want manual re-center only when requested, we would change LocationMarker logic.
         // Let's keep it auto-follow for 'Navigation' feel.
    };

    return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative', bgcolor: '#e0e0e0' }}>
            <MapContainer
                center={defaultCenter}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false} // Custom controls preferred for mobile
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Active Trip Markers */}
                {activeTrip?.stops?.map((stop: any, idx: number) => {
                     // Need lat/lng for stops. Assuming data has it or geocoded.
                     // Mocking for now if not present in generic trip object type
                     // In real app, stops MUST have LatLng.
                     // Let's mock based on Phoenix for demo if missing.
                     const mockOffsets = [[0.01, 0.01], [-0.01, -0.01]];
                     const pos: L.LatLngExpression = stop.lat && stop.lng 
                        ? [stop.lat, stop.lng] 
                        : [33.4484 + (mockOffsets[idx]?.[0] || 0), -112.0740 + (mockOffsets[idx]?.[1] || 0)];
                     
                     return (
                        <Marker key={stop.id} position={pos}>
                            <Popup>
                                <strong>{stop.stopType === 'PICKUP' ? 'Pick Up' : 'Drop Off'}</strong><br/>
                                {stop.address}
                            </Popup>
                        </Marker>
                     )
                })}

                <LocationMarker position={position} />
            </MapContainer>
            
            {/* Custom UI Overlays can go here (e.g. Speed, Distance) */}
        </Box>
    );
}
