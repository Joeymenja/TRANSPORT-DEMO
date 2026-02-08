
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '../../api/trips';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/auth';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Play, 
  Navigation, 
  Download, 
  ExternalLink,
  ShieldCheck,
  Calendar,
  Zap,
  ChevronRight,
  Info
} from 'lucide-react';
import DriverMap from '../../components/dashboard/DriverMap';

export default function TripDetailScreen() {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);

    const { data: trip, isLoading, isError } = useQuery({
        queryKey: ['trip', tripId],
        queryFn: () => tripApi.getTripById(tripId!),
        enabled: !!tripId,
    });

    if (isLoading) return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
      </div>
    );

    if (isError || !trip) {
        return (
          <div className="p-8 text-center bg-white h-screen flex flex-col items-center justify-center">
             <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
                <Info size={40} />
             </div>
             <h3 className="text-2xl font-black text-gray-900 tracking-tight">Mission Not Found</h3>
             <p className="text-gray-500 mt-2 mb-8">This mission record is either unavailable or has been archived.</p>
             <button onClick={() => navigate('/driver/stitch')} className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">
                Return to Hub
             </button>
          </div>
        );
    }

    const canStart = trip.status === 'SCHEDULED' || trip.status === 'IN_PROGRESS';
    const safeMembers = Array.isArray(trip.members) ? trip.members : [];
    const safeStops = Array.isArray(trip.stops) ? trip.stops : [];
    const pickupStop = safeStops.find(s => s.stopType === 'PICKUP');
    const dropoffStop = safeStops.find(s => s.stopType === 'DROPOFF');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-32">
            
            {/* Header HUD */}
            <div className="bg-white px-8 py-8 border-b border-gray-100 shadow-sm flex items-center justify-between sticky top-0 z-50">
               <div className="flex items-center gap-4">
                  <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
                     <ArrowLeft size={32}/>
                  </button>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Mission Detail</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">ID: {trip.id?.slice(-8).toUpperCase()}</p>
                  </div>
               </div>
               <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center">
                  <ShieldCheck size={20} />
               </div>
            </div>

            <div className="p-6 space-y-8">
               
               {/* Map Card */}
               <div className="bg-white rounded-[44px] overflow-hidden border border-gray-100 shadow-sm">
                  <div className="h-48 relative grayscale">
                     <DriverMap activeTrip={trip} />
                     <div className="absolute inset-0 bg-teal-500/5 pointer-events-none" />
                  </div>
                  <div className="p-6 grid grid-cols-3 gap-4 bg-white border-t border-gray-50">
                     <div className="text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Time</p>
                        <p className="text-sm font-black text-gray-900 tracking-tight">~45m</p>
                     </div>
                     <div className="text-center border-x border-gray-50">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Dist</p>
                        <p className="text-sm font-black text-gray-900 tracking-tight">12.4mi</p>
                     </div>
                     <div className="text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Type</p>
                        <p className="text-sm font-black text-teal-600 tracking-tight uppercase tracking-tighter">NEMT</p>
                     </div>
                  </div>
               </div>

               {/* Passenger Card */}
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Assigned Passenger</h4>
                  {safeMembers.map((tm: any) => (
                    <div key={tm.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center text-xl font-black border border-teal-100 shadow-sm">
                             {tm.member?.firstName?.[0]}
                          </div>
                          <div>
                             <h5 className="text-lg font-black text-gray-900 tracking-tight">{tm.member?.firstName} {tm.member?.lastName}</h5>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">ID: {tm.member?.memberId}</p>
                          </div>
                       </div>
                       <button className="p-3.5 bg-gray-50 text-gray-400 rounded-2xl border border-gray-100"><Phone size={20} /></button>
                    </div>
                  ))}
               </div>

               {/* Route Card */}
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Mission Route</h4>
                  <div className="bg-white p-8 rounded-[44px] border border-gray-100 shadow-sm space-y-10 relative">
                     {/* Connector Line */}
                     <div className="absolute left-[59px] top-12 bottom-12 w-1 bg-gray-50" />
                     
                     {/* Pickup */}
                     <div className="flex gap-6 relative z-10">
                        <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center border border-teal-100 shadow-sm">
                           <MapPin size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Entry • {pickupStop?.scheduledTime ? format(new Date(pickupStop.scheduledTime), 'h:mm a') : 'TBD'}</span>
                           </div>
                           <h4 className="text-lg font-black text-gray-900 truncate tracking-tight mb-2">{pickupStop?.address?.split(',')[0]}</h4>
                           <button onClick={() => navigate(`/driver/trips/${tripId}/navigate`)} className="bg-gray-50 text-[10px] font-black text-gray-500 uppercase tracking-widest px-4 py-2 rounded-lg border border-gray-100 flex items-center gap-2">
                              Launch Nav <Navigation size={12} />
                           </button>
                        </div>
                     </div>

                     {/* Dropoff */}
                     <div className="flex gap-6 relative z-10">
                        <div className="w-14 h-14 bg-gray-50 text-gray-300 rounded-2xl flex items-center justify-center border border-gray-100">
                           <MapPin size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Exit • {dropoffStop?.scheduledTime ? format(new Date(dropoffStop.scheduledTime), 'h:mm a') : 'TBD'}</span>
                           </div>
                           <h4 className="text-lg font-black text-gray-900 truncate tracking-tight">{dropoffStop?.address?.split(',')[0]}</h4>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Post-Mission Report */}
               {(trip.status === 'COMPLETED' || trip.status === 'FINALIZED') && (
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Archived Directives</h4>
                     <div className="bg-teal-50 p-8 rounded-[44px] border border-teal-100 shadow-sm flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-white text-teal-600 rounded-2xl shadow-sm">
                              <ShieldCheck size={28} />
                           </div>
                           <div>
                              <p className="text-sm font-black text-teal-900 tracking-tight">Mission Report Generated</p>
                              <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">AHCCCS Compliance Verified</p>
                           </div>
                        </div>
                        <div className="flex gap-3">
                           <button onClick={() => tripApi.downloadReport(trip.id)} className="flex-1 bg-white text-teal-600 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-sm flex items-center justify-center gap-2">
                              <Download size={18} /> PDF
                           </button>
                           <button onClick={() => navigate(`/driver/report/${trip.id}`)} className="flex-1 bg-teal-600 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-200 flex items-center justify-center gap-2">
                              View Log
                           </button>
                        </div>
                     </div>
                  </div>
               )}

            </div>

            {/* Sticky Action Footer */}
            {user?.role === 'DRIVER' && !['COMPLETED', 'FINALIZED', 'CANCELLED'].includes(trip.status) && (
               <div className="fixed bottom-0 left-0 right-0 p-8 pt-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50">
                  <button 
                     disabled={!canStart}
                     onClick={() => navigate(`/driver/trips/${tripId}/execute`)}
                     className="w-full bg-gray-900 text-white rounded-[28px] py-6 font-black text-xs uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale"
                  >
                    <Zap size={24} className="text-teal-400" />
                    {trip.status === 'IN_PROGRESS' ? 'Resume Critical Path' : 'Initiate Mission'}
                  </button>
               </div>
            )}
        </div>
    );
}
