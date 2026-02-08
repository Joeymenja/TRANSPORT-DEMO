
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '../../api/trips';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Navigation, 
  MapPin, 
  CheckCircle2, 
  RefreshCw, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Phone,
  MessageSquare
} from 'lucide-react';
import DriverMap from '../../components/dashboard/DriverMap';

export default function TripExecutionPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripApi.getTripById(tripId!),
    enabled: !!tripId,
  });

  const [isSynced, setIsSynced] = useState(true);

  if (!trip) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <RefreshCw className="animate-spin text-teal-500" size={32} />
    </div>
  );

  const pickup = trip.stops?.find((s: any) => s.stopType === 'PICKUP');
  const dropoff = trip.stops?.find((s: any) => s.stopType === 'DROPOFF');
  const firstMember = trip.members?.[0]?.member;

  const openMapApp = (address: string) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const destination = encodeURIComponent(address);
    if (isIOS) {
      window.location.href = `maps://?daddr=${destination}`;
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
    }
  };

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col overflow-hidden font-sans">
      
      {/* Map & Header Area */}
      <div className="h-[45%] relative border-b border-gray-100">
        <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center pointer-events-none">
          <button 
            onClick={() => navigate('/driver/stitch')} 
            className="p-3.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 active:scale-95 transition-all pointer-events-auto"
          >
            <ArrowLeft size={22} className="text-gray-900" />
          </button>
          
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-xl border border-white/50 pointer-events-auto">
             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
             <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
                Synced Ops Hub
             </span>
          </div>
        </div>
        
        <DriverMap activeTrip={trip} showNavigation={true} />
        
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Floating Mission Card */}
      <div className="flex-1 -mt-12 relative z-30 px-6 pb-10 flex flex-col">
        <div className="bg-white rounded-[48px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col flex-1 overflow-hidden">
          
          {/* Mission Header */}
          <div className="p-8 pb-4 text-center">
             <div className="w-12 h-1 bg-gray-100 rounded-full mx-auto mb-6" />
             <h3 className="text-[10px] font-black text-teal-500 uppercase tracking-[0.3em] mb-1">Active Mission Directive</h3>
             <p className="text-2xl font-black text-gray-900 tracking-tight">Priority Medical Pickup</p>
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto px-8 py-4 space-y-10">
             
             {/* Pickup Point */}
             <div className="flex gap-6">
                <div className="flex flex-col items-center">
                   <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center border border-teal-100 shadow-sm relative z-10">
                      <MapPin size={24} />
                   </div>
                   <div className="w-1 h-20 bg-teal-50 -mt-2 border-x border-teal-50/20" />
                </div>
                <div className="pt-2 flex-1 min-w-0">
                   <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Pickup • {format(new Date(pickup?.scheduledTime), 'h:mm a')}</span>
                   </div>
                   <h4 className="text-lg font-black text-gray-900 truncate tracking-tight">{pickup?.address?.split(',')[0]}</h4>
                   <p className="text-[11px] font-bold text-gray-400 leading-snug mt-1">
                      Passenger: <span className="text-gray-600">{firstMember?.firstName} {firstMember?.lastName}</span><br/>
                      Mobility: <span className="text-gray-600">{trip.mobilityRequirement}</span>
                   </p>
                </div>
             </div>

             {/* Actions Container */}
             <div className="pl-[70px] -mt-6">
                <div className="flex flex-col gap-3">
                   <button 
                     onClick={() => openMapApp(pickup?.address)}
                     className="w-full bg-gray-900 text-white rounded-[24px] py-6 font-black text-xs uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                   >
                     <Navigation size={18} className="text-teal-400" />
                     Initiate Tactical Guidance
                   </button>
                   
                   <button 
                     onClick={() => navigate(`/driver/trips/${tripId}/arrived`)}
                     className="w-full bg-white border-2 border-gray-900 text-gray-900 rounded-[24px] py-6 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                   >
                     <Zap size={18} className="text-teal-500" />
                     Broadcast Arrival Status
                   </button>
                </div>
             </div>

             {/* Dropoff Point (Peek) */}
             <div className="flex gap-6 opacity-40 grayscale">
                <div className="flex flex-col items-center">
                   <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center border border-gray-200">
                      <CheckCircle2 size={24} />
                   </div>
                </div>
                <div className="pt-2 flex-1 min-w-0">
                   <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Drop-off • {format(new Date(dropoff?.scheduledTime), 'h:mm a')}</span>
                   </div>
                   <h4 className="text-lg font-black text-gray-900 truncate tracking-tight">{dropoff?.address?.split(',')[0]}</h4>
                </div>
             </div>

          </div>

          {/* HUD Footer */}
          <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-teal-500">
                   <ShieldCheck size={24} />
                </div>
                <div>
                   <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compliance Status</h5>
                   <p className="text-xs font-black text-gray-900 uppercase">Sector Verified</p>
                </div>
             </div>
             
             <button className="flex items-center gap-2 p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400">
                <MessageSquare size={20} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
