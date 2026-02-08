
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '../../api/trips';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Navigation
} from 'lucide-react';

export default function MemberBoardingPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripApi.getTripById(tripId!),
    enabled: !!tripId
  });

  if (!trip) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
    </div>
  );

  const clientName = trip?.members?.[0]?.member ? `${trip.members[0].member.firstName} ${trip.members[0].member.lastName}` : "Member";

  const handleStartTrip = async () => {
    try {
      if (trip.status === 'SCHEDULED') {
        await tripApi.startTrip(trip.id);
      }
      navigate(`/driver/trips/${tripId}/execute`);
    } catch (error) {
      console.error("Failed to start trip", error);
      navigate(`/driver/trips/${tripId}/execute`);
    }
  };

  return (
    <div className="h-screen w-full bg-gray-950 flex flex-col overflow-hidden font-sans relative">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-teal-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-blue-500/20 blur-[120px] rounded-full" />
      </div>

      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 active:scale-95 transition-all text-white"
        >
          <ArrowLeft size={22} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 text-center">
         
         <div className="relative mb-12">
            <div className="absolute inset-0 bg-teal-400 blur-[40px] opacity-40 animate-pulse" />
            <div className="w-32 h-32 bg-white rounded-[44px] shadow-2xl flex items-center justify-center relative border-4 border-teal-400/50">
               <CheckCircle2 size={64} className="text-teal-500" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-teal-500 text-white p-3 rounded-2xl shadow-2xl border-4 border-gray-950">
               <Sparkles size={20} />
            </div>
         </div>

         <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tight leading-tight">Member Secured</h2>
            <p className="text-teal-400 font-bold uppercase tracking-[0.3em] text-[10px]">Onboarding Protocol Finalized</p>
         </div>

         <div className="mt-12 w-full max-w-sm bg-white/5 backdrop-blur-2xl rounded-[44px] p-8 border border-white/10 space-y-8">
            <div className="flex items-center gap-6 text-left">
               <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-3xl font-black text-teal-600 shadow-2xl">
                  {clientName.charAt(0)}
               </div>
               <div>
                  <h4 className="text-xl font-black text-white tracking-tight">{clientName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest bg-teal-500/10 px-3 py-1 rounded-lg">Verified Onboard</span>
                  </div>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="p-5 bg-white/5 rounded-[32px] border border-white/5 text-left">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-sm font-black text-white">Safe & Locked</p>
               </div>
               <div className="p-5 bg-white/5 rounded-[32px] border border-white/5 text-left">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Compliance</p>
                  <p className="text-sm font-black text-white">Verified</p>
               </div>
            </div>
         </div>
      </div>

      <div className="p-8 pb-12 z-10 flex flex-col gap-4">
         <button 
           onClick={handleStartTrip}
           className="w-full bg-white text-gray-950 rounded-[32px] py-7 font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_60px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
         >
           <Navigation size={24} className="text-teal-500" />
           Engage Drive to Destination
         </button>
         
         <div className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">
            <ShieldCheck size={14} />
            Sector Protocol Enabled
         </div>
      </div>

    </div>
  );
}
