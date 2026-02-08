/**
 * Stitch Schedule Page - Integrated Version
 * 
 * Based on the GVBH Transportation Driver App export
 * Connected to TRANSPORT-DEMO backend
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tripApi, Trip } from '../../api/trips';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Filter, 
  Clock, 
  MapPin, 
  Sparkles, 
  TrendingUp,
  Navigation
} from 'lucide-react';
import StitchBottomNav from '../../components/StitchBottomNav';

const StitchSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [logisticsForecast, setLogisticsForecast] = useState<string | null>(null);
  
  // Generate week strip
  const weekStart = startOfWeek(selectedDate);
  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));

  // Fetch trips for selected date
  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['schedule-trips', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const allTrips = await tripApi.getTrips({ 
        date: format(selectedDate, 'yyyy-MM-dd') 
      });
      return allTrips.filter((t: Trip) => 
        t.status !== 'CANCELLED' && t.status !== 'COMPLETED' && t.status !== 'FINALIZED'
      );
    }
  });

  // Simulated AI logistics forecast
  useEffect(() => {
    setLogisticsForecast("Expect localized delays near major medical centers due to high morning discharge volumes.");
  }, [selectedDate]);

  const handleViewTrip = (tripId: string) => {
    navigate(`/driver/trips/${tripId}`);
  };

  const handleStartTrip = (tripId: string) => {
    navigate(`/driver/trips/${tripId}/execute`);
  };


  return (
    <div className="pb-40 bg-gray-50 min-h-screen">
      {/* Date Selector Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setSelectedDate(addDays(selectedDate, -7))}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ChevronLeft size={20}/>
          </button>
          <div className="flex items-center gap-2 font-black text-gray-900">
            <CalendarIcon size={18} className="text-teal-500" />
            <span>{format(selectedDate, 'MMMM d, yyyy')}</span>
          </div>
          <button 
            onClick={() => setSelectedDate(addDays(selectedDate, 7))}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ChevronRight size={20}/>
          </button>
        </div>

        {/* Week Strip */}
        <div className="flex justify-between">
          {weekDays.map((date, i) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            const hasTrips = i % 3 === 0; // Visual indicator
            
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {['S','M','T','W','T','F','S'][date.getDay()]}
                </span>
                <button 
                  onClick={() => setSelectedDate(date)}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${
                    isSelected 
                      ? 'bg-teal-500 text-white shadow-lg shadow-teal-100' 
                      : isToday 
                        ? 'bg-teal-100 text-teal-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {date.getDate()}
                </button>
                {hasTrips && <div className="w-1.5 h-1.5 rounded-full bg-sky-300" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Logistics Forecast Banner */}
      <div className="px-4 pt-4">
         <div className="bg-teal-900 rounded-[32px] p-5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12 group-hover:scale-110 transition-transform">
               <Sparkles size={64} className="text-white" />
            </div>
            <div className="flex items-start gap-4 relative z-10">
               <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                  <TrendingUp size={18} className="text-sky-300" />
               </div>
               <div>
                  <p className="text-[9px] font-black text-teal-400 uppercase tracking-[0.25em] mb-1">Daily Logistics Intel</p>
                  <p className="text-[11px] font-bold text-white leading-relaxed">
                     {trips.length} trips scheduled. {logisticsForecast || 'Calculating daily route efficiency...'}
                  </p>
               </div>
            </div>
         </div>
      </div>

      {/* Timeline Content */}
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Today's Timeline</h3>
          <button className="flex items-center gap-1 text-[10px] font-black text-teal-500 uppercase tracking-widest">
            <Filter size={14} />
            Filter
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white p-8 rounded-[28px] border border-gray-100 shadow-sm text-center">
            <CalendarIcon size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold">No trips scheduled</p>
            <p className="text-xs text-gray-300 mt-1">for {format(selectedDate, 'MMMM d, yyyy')}</p>
          </div>
        ) : (
          <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 before:rounded-full">
            {/* Timeline Items */}
            {trips.map((trip: Trip, idx: number) => {
              const firstMember = trip.members?.[0];
              const pickupStop = trip.stops?.find((s: any) => s.stopType === 'PICKUP');
              const dropoffStop = trip.stops?.find((s: any) => s.stopType === 'DROPOFF');
              const scheduledTime = pickupStop?.scheduledTime 
                ? format(new Date(pickupStop.scheduledTime), 'h:mm a')
                : 'TBD';
              const isFirst = idx === 0;

              return (
                <div key={trip.id} className="relative">
                  <div className={`absolute -left-8 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${isFirst ? 'bg-teal-500' : 'bg-gray-300'}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  
                  <div 
                    onClick={() => handleViewTrip(trip.id)}
                    className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-teal-500" />
                        <span className="text-sm font-black text-gray-900">{scheduledTime}</span>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        isFirst ? 'bg-teal-50 text-teal-600' : 'bg-gray-50 text-gray-400'
                      }`}>
                        {isFirst ? 'Next' : 'Upcoming'}
                      </span>
                    </div>
                    
                    <h4 className="font-bold text-gray-800 mb-2">
                      {firstMember?.firstName} {firstMember?.lastName || 'Member'}
                    </h4>
                    
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {pickupStop?.address || 'Pickup address TBD'}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {dropoffStop?.address || 'Dropoff address TBD'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex gap-2">
                        {trip.mobilityRequirement && (
                          <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400" title={trip.mobilityRequirement}>
                            <MapPin size={12} />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStartTrip(trip.id); }}
                          className="flex items-center gap-1 text-[10px] font-black text-white bg-teal-500 px-3 py-1.5 rounded-full uppercase tracking-widest hover:bg-teal-600 transition-colors"
                        >
                          <Navigation size={10} /> Start
                        </button>
                        <button className="text-[10px] font-black text-teal-500 uppercase tracking-widest">
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty Slots */}
            <div className="py-4 flex items-center gap-4 opacity-40">
              <span className="text-[10px] font-black text-gray-400 uppercase">02:00 PM</span>
              <div className="flex-1 border-t border-dashed border-gray-300" />
              <span className="text-[10px] font-black text-gray-400 uppercase italic">Free Time</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <StitchBottomNav />
    </div>
  );
};

export default StitchSchedulePage;
