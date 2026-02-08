
import React from 'react';
import { Trip, TripStatus } from '../types';
import { Clock, MapPin, Navigation, Phone, ChevronRight } from 'lucide-react';

interface TripCardProps {
  trip: Trip;
  onStart: (id: string) => void;
  onClick: (id: string) => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onStart, onClick }) => {
  const isStartingSoon = true; // Logic for visual highlight

  return (
    <div 
      onClick={() => onClick(trip.id)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 active:scale-[0.98] transition-transform cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-gray-900">{trip.scheduledTime}</span>
          {isStartingSoon && (
            <span className="bg-teal-100 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Next Trip
            </span>
          )}
        </div>
        <div className="bg-gray-100 px-2 py-1 rounded-md text-[10px] text-gray-500 font-mono">
          {trip.id}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{trip.client.name}</h3>
        <p className="text-sm text-gray-500 flex items-center mt-1">
          <MapPin size={14} className="mr-1 text-gray-400" />
          {trip.pickupAddress.split(',')[0]}
        </p>
      </div>

      <div className="border-t border-gray-50 pt-3 flex items-center justify-between text-xs text-gray-500 mb-4">
        <span>{trip.type} RIDE</span>
        <span>•</span>
        <span>{trip.estimatedDuration} MIN</span>
        <span>•</span>
        <span>{trip.estimatedDistance} MI</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center space-x-4">
          <button className="p-2 bg-gray-50 rounded-full text-gray-600 active:bg-gray-200">
            <Phone size={18} />
          </button>
          <button className="p-2 bg-gray-50 rounded-full text-gray-600 active:bg-gray-200">
            <Navigation size={18} />
          </button>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onStart(trip.id);
          }}
          className="flex-1 bg-teal-500 text-white font-semibold py-2.5 rounded-xl hover:bg-teal-600 transition-colors active:scale-95 shadow-sm"
        >
          Start Trip
        </button>
      </div>
    </div>
  );
};

export default TripCard;
