
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '../../api/trips';
import { 
  ArrowLeft, 
  MapPin, 
  CheckCircle2, 
  Camera, 
  Navigation, 
  Phone, 
  AlertCircle,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

export default function DropoffConfirmationPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [photoCaptured, setPhotoCaptured] = useState(false);

  // Fetch trip details
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

  const dropoffStop = trip?.stops?.find((s: any) => s.stopType === 'DROPOFF');
  const dropoffLocation = dropoffStop?.address || "Unknown Destination";
  const clientName = trip?.members?.[0]?.member ? `${trip.members[0].member.firstName} ${trip.members[0].member.lastName}` : "Member";

  const handleCompleteTrip = () => {
    navigate(`/driver/report/${tripId}`);
  };

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col overflow-hidden font-sans relative">
      
      {/* Immersive Map Layer */}
      <div className="absolute inset-0 h-[60%] bg-gray-200 overflow-hidden">
        <img 
          src="https://picsum.photos/seed/dropoff_v4/1200/800" 
          alt="Map" 
          className="w-full h-full object-cover grayscale opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/20 via-transparent to-gray-50 pointer-events-none" />
        
        {/* Target Destination HUD */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 flex flex-col items-center">
           <div className="relative">
              <div className="w-24 h-24 bg-green-500/20 rounded-full animate-ping absolute inset-0 scale-[2.5]" />
              <div className="w-16 h-16 bg-white rounded-[24px] shadow-2xl flex items-center justify-center relative z-10 border-4 border-green-500">
                 <CheckCircle2 size={32} className="text-green-600" />
              </div>
           </div>
           <div className="mt-4 bg-gray-950/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
              <p className="text-[10px] font-black text-green-400 uppercase tracking-widest text-center">Arrival Confirmed</p>
              <p className="text-[13px] font-bold text-white text-center">{dropoffLocation.split(',')[0]}</p>
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

      {/* Completion Management Sheet */}
      <div className="flex-1 mt-[50%] relative z-30 px-6 pb-10 flex flex-col">
        <div className="bg-white rounded-[48px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-gray-100 flex flex-col flex-1 overflow-hidden animate-in slide-in-from-bottom duration-700">
          
          <div className="p-8 pb-4">
             <div className="w-12 h-1 bg-gray-100 rounded-full mx-auto mb-8" />
             
             <div className="flex items-center gap-3 mb-8">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                <h3 className="text-[10px] font-black text-green-600 uppercase tracking-[0.3em]">Destination Protocol Active</h3>
             </div>

             {/* Destination HUD */}
             <div className="bg-gray-50 rounded-[32px] p-6 flex items-center gap-6 border border-gray-100 group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity">
                   <Navigation size={80} />
                </div>
                
                <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center border-4 border-white shadow-xl relative z-10">
                   <div className="bg-green-100 text-green-600 p-3 rounded-2xl">
                      <MapPin size={32} />
                   </div>
                </div>
                
                <div className="flex-1 min-w-0 relative z-10">
                   <h4 className="text-xl font-black text-gray-900 tracking-tight leading-tight mb-1 truncate">{dropoffLocation.split(',')[0]}</h4>
                   <p className="text-[11px] font-bold text-gray-400 leading-snug truncate">
                      {dropoffLocation.split(',').slice(1).join(',')}
                   </p>
                </div>

                <button className="p-3 bg-white text-green-500 rounded-xl shadow-sm border border-gray-100 relative z-10"><Phone size={18}/></button>
             </div>

             {/* Validation Area */}
             <div className="mt-8 space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Proof of Delivery</h4>
                <button 
                  onClick={() => setPhotoCaptured(!photoCaptured)}
                  className={`w-full flex items-center justify-between p-6 rounded-[32px] border transition-all ${photoCaptured ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100 border-dashed border-2'}`}
                >
                   <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${photoCaptured ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
                         <Camera size={20} />
                      </div>
                      <div className="text-left">
                         <span className={`text-sm font-black block ${photoCaptured ? 'text-green-900' : 'text-gray-700'}`}>Facility Capture</span>
                         <span className="text-[10px] font-bold text-gray-400 uppercase">Optional Reference Photo</span>
                      </div>
                   </div>
                   <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${photoCaptured ? 'bg-green-500 border-green-500 text-white' : 'border-gray-100 bg-white'}`}>
                      {photoCaptured && <CheckCircle2 size={16} />}
                   </div>
                </button>
             </div>
          </div>

          {/* Footer Actions */}
          <div className="p-8 pt-4 flex flex-col gap-4 bg-white border-t border-gray-50 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
             <button 
               onClick={handleCompleteTrip}
               className="w-full bg-gray-900 text-white rounded-[28px] py-6 font-black text-sm uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
             >
               <Zap size={24} className="text-teal-400" />
               Finalize Trip Report
             </button>
             
             <div className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] py-2">
                <ShieldCheck size={14} className="text-teal-500" />
                Sector Compliance Active
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
