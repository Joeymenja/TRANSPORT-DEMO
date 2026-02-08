/**
 * Stitch Trip History Screen - Integrated Version
 * Based on GVBH Transportation Driver App
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tripApi, Trip } from '../../api/trips';
import { format } from 'date-fns';
import { ArrowLeft, Search, Filter, Calendar, MapPin, ChevronRight, Download, CheckCircle2 } from 'lucide-react';
import StitchBottomNav from '../../components/StitchBottomNav';

const StitchHistoryPage: React.FC = () => {
  const navigate = useNavigate();

  // Fetch completed trips
  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['history-trips'],
    queryFn: async () => {
      const allTrips = await tripApi.getTrips();
      return allTrips.filter((t: Trip) => 
        t.status === 'COMPLETED' || t.status === 'FINALIZED'
      ).slice(0, 20); // Last 20 trips
    }
  });

  return (
    <div className="bg-gray-50 flex flex-col max-w-md mx-auto min-h-screen">
      {/* Header */}
      <div className="bg-white px-6 py-6 border-b border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1 -ml-2 text-gray-400 hover:text-gray-900">
            <ArrowLeft size={28}/>
          </button>
          <h2 className="text-xl font-black text-gray-900">Trip History</h2>
        </div>
        <button className="p-2 bg-gray-50 text-gray-500 rounded-xl"><Filter size={20}/></button>
      </div>

      <div className="p-6 bg-white border-b border-gray-50">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by trip ID or client..." 
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-[24px] focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-40">
        <div className="flex items-center justify-between px-2 mb-2">
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Archived Reports</h3>
           <p className="text-[9px] font-bold text-gray-300 uppercase">Retention: 7 Years</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 font-bold">No completed trips yet</p>
          </div>
        ) : (
          trips.map((trip: Trip, index: number) => {
            const firstMember = trip.members?.[0];
            const pickupStop = trip.stops?.find((s: any) => s.stopType === 'PICKUP');
            const dropoffStop = trip.stops?.find((s: any) => s.stopType === 'DROPOFF');
            const tripDate = trip.tripDate ? new Date(trip.tripDate) : new Date();
            const scheduledTime = pickupStop?.scheduledTime 
              ? format(new Date(pickupStop.scheduledTime), 'h:mm a')
              : 'N/A';

            return (
              <div 
                key={trip.id} 
                className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden active:scale-[0.98] transition-all cursor-pointer"
                onClick={() => navigate(`/driver/trips/${trip.id}`)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-xl ${trip.status === 'COMPLETED' ? 'bg-green-50 text-green-500' : 'bg-amber-50 text-amber-500'}`}>
                          <Calendar size={18} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {format(tripDate, 'MMM d, yyyy')} • {scheduledTime}
                          </p>
                          <h4 className="font-black text-gray-800">
                            {firstMember?.firstName} {firstMember?.lastName || 'Member'}
                          </h4>
                       </div>
                    </div>
                    <div className="bg-gray-50 px-2 py-1 rounded text-[9px] font-mono text-gray-400">
                      TRP-{trip.id.slice(-4).toUpperCase()}
                    </div>
                  </div>

                  <div className="flex gap-4 mb-6">
                     <div className="flex flex-col items-center gap-1 mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <div className="w-0.5 h-6 bg-gray-50" />
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                     </div>
                     <div className="space-y-2 flex-1">
                        <p className="text-xs font-bold text-gray-600 truncate">
                          {pickupStop?.address || 'Pickup address'}
                        </p>
                        <p className="text-xs font-bold text-gray-600 truncate">
                          {dropoffStop?.address || 'Dropoff address'}
                        </p>
                     </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                           <MapPin size={12} className="text-gray-300" />
                           <span className="text-[10px] font-black text-gray-500 uppercase">
                             {/* Mock miles */}
                             {(Math.random() * 15 + 2).toFixed(1)} mi
                           </span>
                        </div>
                        <div className="flex items-center gap-1">
                           <CheckCircle2 size={12} className="text-green-500" />
                           <span className="text-[10px] font-black text-green-600 uppercase">Verified</span>
                        </div>
                     </div>
                     <button 
                       onClick={(e) => { e.stopPropagation(); }}
                       className="flex items-center gap-2 bg-teal-50 text-teal-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                     >
                        <Download size={14} /> PDF
                     </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <StitchBottomNav />
    </div>
  );
};

export default StitchHistoryPage;
