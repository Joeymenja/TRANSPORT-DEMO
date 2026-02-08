
import React, { useMemo } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { Trip } from '../types';

const MAPBOX_TOKEN = "pk.eyJ1Ijoiam8zbTNuajQiLCJhIjoiY21raGc0M3NjMGpxdzNmb2d1ejd6OXNkMiJ9.kc2_UkVmDNcSyb7trtwZCg";

interface MissionMapProps {
  trips: Trip[];
  activeTripId?: string | null;
  onTripClick?: (id: string) => void;
}

const MissionMap: React.FC<MissionMapProps> = ({ trips, activeTripId, onTripClick }) => {
  const initialViewState = useMemo(() => ({
    latitude: 33.4484, // Phoenix
    longitude: -112.0740,
    zoom: 11
  }), []);

  return (
    <div className="w-full h-full relative">
      <Map
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <div className="absolute top-4 right-4 z-10 transition-all opacity-40 hover:opacity-100">
           <NavigationControl showCompass={false} />
        </div>


        {trips.map((trip) => {
          const isActive = trip.id === activeTripId;
          
          // Seeded coordinates based on ID for consistence
          // Using Phoenix area coordinates
          const seedPickup = (trip.id.charCodeAt(0) + trip.id.charCodeAt(trip.id.length-1)) / 500;
          const plat = 33.4484 + (seedPickup - 0.5) * 0.15;
          const plng = -112.0740 + (seedPickup - 0.4) * 0.15;

          const seedDropoff = (trip.id.charCodeAt(1) + trip.id.charCodeAt(trip.id.length-2)) / 500;
          const dlat = 33.4484 + (seedDropoff - 0.5) * 0.15;
          const dlng = -112.0740 + (seedDropoff - 0.4) * 0.15;

          return (
            <React.Fragment key={trip.id}>
              {/* Pickup Marker */}
              <Marker
                latitude={plat}
                longitude={plng}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  onTripClick?.(trip.id);
                }}
              >
                <div className={`cursor-pointer transition-all duration-300 transform hover:scale-125 ${isActive ? 'scale-125 z-50' : 'scale-100 z-10'}`}>
                  <div className={`p-2 rounded-2xl shadow-2xl relative ${isActive ? 'bg-teal-500 text-white' : 'bg-white/80 backdrop-blur-md text-slate-400 border border-white/20'}`}>
                    <MapPin size={isActive ? 20 : 16} fill={isActive ? "currentColor" : "none"} />
                    {isActive && (
                      <div className="absolute -inset-1 bg-teal-500 rounded-2xl animate-ping opacity-20 pointer-events-none" />
                    )}
                  </div>
                  {isActive && (
                    <div className="mt-2 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-lg shadow-xl border border-white/10">
                      <p className="text-[9px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">Neural Pickup</p>
                    </div>
                  )}
                </div>
              </Marker>

              {/* Only show dropoff for active trip or specifically requested */}
              {isActive && (
                <Marker
                  latitude={dlat}
                  longitude={dlng}
                  anchor="bottom"
                >
                  <div className="scale-100 z-50">
                    <div className="p-2 bg-slate-900/90 text-teal-400 rounded-2xl shadow-2xl border border-teal-500/30">
                      <MapPin size={20} fill="currentColor" className="animate-pulse" />
                    </div>
                    <div className="mt-2 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-lg shadow-xl border border-teal-500/20">
                      <p className="text-[9px] font-black text-teal-400 uppercase tracking-[0.2em] whitespace-nowrap">AI Destination</p>
                    </div>
                  </div>
                </Marker>
              )}
            </React.Fragment>
          );
        })}
      </Map>
      
      {/* Map Gradient Overlays */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/40" />
    </div>
  );
};

export default MissionMap;
