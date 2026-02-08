
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripApi } from '../../api/trips';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  MessageSquare, 
  AlertTriangle, 
  UserX, 
  CheckCircle2,
  MoreVertical,
  Accessibility,
  Info
} from 'lucide-react';

export default function ArrivedAtPickupPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [noShowOpen, setNoShowOpen] = useState(false);

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripApi.getTripById(tripId!),
    enabled: !!tripId
  });

  const noShowMutation = useMutation({
    mutationFn: () => tripApi.markNoShow(tripId!, 'Driver reported no-show at pickup'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setNoShowOpen(false);
      navigate('/driver/stitch');
    }
  });

  if (!trip) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
    </div>
  );

  const pickupStop = trip?.stops?.find((s: any) => s.stopType === 'PICKUP');
  const firstMember = trip?.members?.[0]?.member;
  const clientName = firstMember ? `${firstMember.firstName} ${firstMember.lastName}` : "Member";

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col overflow-hidden font-sans relative">
      
      {/* Immersive Map Background Layer */}
      <div className="absolute inset-0 h-[60%] bg-gray-200 overflow-hidden">
        <img 
          src="https://picsum.photos/seed/pickup_arrival_v2/1200/800" 
          alt="Map" 
          className="w-full h-full object-cover grayscale opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/20 via-transparent to-gray-50 pointer-events-none" />
        
        {/* Animated Landing Target */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 flex flex-col items-center">
           <div className="relative">
              <div className="w-20 h-20 bg-teal-500/20 rounded-full animate-ping absolute inset-0 scale-[2.5]" />
              <div className="w-16 h-16 bg-white rounded-[24px] shadow-2xl flex items-center justify-center relative z-10 border-4 border-teal-500">
                 <MapPin size={32} className="text-teal-600" />
              </div>
           </div>
           <div className="mt-4 bg-gray-950/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
              <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest text-center">Precise Target</p>
              <p className="text-[13px] font-bold text-white text-center">{pickupStop?.address?.split(',')[0]}</p>
           </div>
        </div>
      </div>

      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 active:scale-95 transition-all"
        >
          <ArrowLeft size={22} className="text-gray-900" />
        </button>
      </div>

      {/* Arrival Management Sheet */}
      <div className="flex-1 mt-[50%] relative z-30 px-6 pb-10 flex flex-col">
        <div className="bg-white rounded-[48px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-gray-100 flex flex-col flex-1 overflow-hidden animate-in slide-in-from-bottom duration-700">
          
          <div className="p-8 pb-4">
             <div className="w-12 h-1 bg-gray-100 rounded-full mx-auto mb-8" />
             
             <div className="flex items-center gap-3 mb-8">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                <h3 className="text-[10px] font-black text-teal-500 uppercase tracking-[0.3em]">Operational Readiness Check</h3>
             </div>

             {/* Member HUD */}
             <div className="bg-gray-50 rounded-[32px] p-6 flex items-center gap-6 border border-gray-100 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity">
                   <Accessibility size={80} />
                </div>
                
                <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center text-3xl font-black text-teal-500 shadow-2xl border-4 border-white relative z-10">
                   {clientName.charAt(0)}
                </div>
                
                <div className="flex-1 min-w-0 relative z-10">
                   <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate leading-none mb-2">{clientName}</h4>
                   <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-white rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 shadow-sm">
                        {trip.mobilityRequirement}
                      </span>
                      <span className="px-3 py-1 bg-teal-50 rounded-lg text-[9px] font-black text-teal-600 uppercase tracking-widest border border-teal-100 shadow-sm">
                        Verified Member
                      </span>
                   </div>
                </div>

                <div className="flex flex-col gap-2 relative z-10">
                   <button className="p-3 bg-white text-teal-500 rounded-xl shadow-sm border border-gray-100"><Phone size={18}/></button>
                   <button className="p-3 bg-white text-teal-500 rounded-xl shadow-sm border border-gray-100"><MessageSquare size={18}/></button>
                </div>
             </div>

             <div className="mt-8 space-y-5 px-4 overflow-y-auto max-h-[140px]">
                <div className="flex items-start gap-4">
                   <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                   <div>
                      <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Pickup Location Directive</p>
                      <p className="text-sm font-bold text-gray-700 leading-snug">{pickupStop?.address}</p>
                   </div>
                </div>
                {trip.reasonForVisit && (
                  <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-[24px] border border-amber-100">
                     <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                     <p className="text-[12px] font-bold text-amber-800 leading-snug italic">
                        "{trip.reasonForVisit}"
                     </p>
                  </div>
                )}
             </div>
          </div>

          <div className="p-8 pt-4 flex flex-col gap-4 bg-white border-t border-gray-50 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
             <button 
               onClick={() => navigate(`/driver/trips/${tripId}/verification`)}
               className="w-full bg-gray-900 text-white rounded-[28px] py-6 font-black text-sm uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
             >
               <CheckCircle2 size={24} className="text-teal-400" />
               Execute Verification
             </button>
             
             <button 
               onClick={() => setNoShowOpen(true)}
               className="w-full text-gray-300 font-black text-[10px] uppercase tracking-[0.3em] py-4 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
             >
               <UserX size={14} />
               Report Member No-Show
             </button>
          </div>
        </div>
      </div>

      {/* No-Show Confirmation Overlay */}
      {noShowOpen && (
        <div className="fixed inset-0 z-[100] bg-gray-950/80 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="bg-white rounded-[44px] p-10 w-full max-w-sm text-center shadow-2xl space-y-6">
             <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-2 border border-red-100">
                <UserX size={40} />
             </div>
             <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Confirm No-Show</h3>
                <p className="text-sm font-bold text-gray-500 mt-2 leading-relaxed px-4">
                   Are you sure you want to cancel this mission? This action will be logged for AHCCCS compliance audit.
                </p>
             </div>
             
             <div className="flex flex-col gap-3">
                <button 
                  onClick={() => noShowMutation.mutate()}
                  disabled={noShowMutation.isPending}
                  className="w-full bg-red-500 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-red-100 active:scale-95 disabled:opacity-50 transition-all font-sans"
                >
                   {noShowMutation.isPending ? "Syncing..." : "Confirm & Cancel Mission"}
                </button>
                <button 
                  onClick={() => setNoShowOpen(false)}
                  className="w-full bg-gray-100 text-gray-900 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                >
                   Abort
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
