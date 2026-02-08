
import React, { useState, useEffect, useMemo } from 'react';
import { Trip, TripStatus } from '../types';
import SignaturePad from '../components/SignaturePad';
import { 
  CheckCircle2, Navigation, Edit2, Check, ArrowLeft, MoreVertical, Volume2, ShieldCheck
} from 'lucide-react';
import { ttsService } from '../services/TTSService';
import MissionMap from '../components/MissionMap';

interface ActiveTripScreenProps {
  trip: Trip;
  onBack: () => void;
  onComplete: () => void;
}

enum Phase {
  NAVIGATING_TO_PICKUP = 'NAVIGATING_TO_PICKUP',
  AT_PICKUP = 'AT_PICKUP',
  NAVIGATING_TO_DROPOFF = 'NAVIGATING_TO_DROPOFF',
  AT_DROPOFF_ODO = 'AT_DROPOFF_ODO',
  AT_DROPOFF_SIGN = 'AT_DROPOFF_SIGN',
  SUCCESS = 'SUCCESS'
}

const ActiveTripScreen: React.FC<ActiveTripScreenProps> = ({ trip, onBack, onComplete }) => {
  const [phase, setPhase] = useState<Phase>(Phase.NAVIGATING_TO_PICKUP);
  const [startOdo] = useState('42350');
  const [endOdo, setEndOdo] = useState('');
  const [isEditingOdo, setIsEditingOdo] = useState(false);
  const [clientSignature, setClientSignature] = useState<any>(null);
  const [driverSignature, setDriverSignature] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dynamic Manifest for Multi-Load Optimization
  const [manifest, setManifest] = useState<any[]>([]);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);

  useEffect(() => {
    // Initialize Manifest: Pickup -> Dropoff 1 -> Dropoff 2 ...
    const destinations = [
      { id: 'principal', name: trip.client.name, type: 'DROPOFF', address: trip.dropoffAddress, priority: 1 },
      ...(trip.passengers || []).map((p, i) => ({
        id: p.id,
        name: p.name,
        type: 'DROPOFF',
        address: p.dropoffAddress || trip.dropoffAddress, // Fallback if no specific addr
        priority: i + 2
      }))
    ];
    setManifest(destinations);
  }, [trip]);

  const currentDestination = manifest[currentTargetIndex] || { name: trip.client.name, address: trip.dropoffAddress };

  useEffect(() => {
    localStorage.setItem('is_trip_active', 'true');
    return () => localStorage.removeItem('is_trip_active');
  }, []);

  const calculatedEndOdo = useMemo(() => (parseFloat(startOdo) + (trip.estimatedDistance || 5)).toFixed(1), [startOdo, trip.estimatedDistance]);

  useEffect(() => {
    if (phase === Phase.AT_DROPOFF_ODO && !endOdo) setEndOdo(calculatedEndOdo);
    ttsService.speak(`Approaching ${phase.replace(/_/g, ' ').toLowerCase()}`);
  }, [phase]);


  const renderContent = () => {
    switch (phase) {
      case Phase.NAVIGATING_TO_PICKUP:
      case Phase.NAVIGATING_TO_DROPOFF:
        return (
          <div className="h-full relative flex flex-col justify-between p-4">
             {/* Turn-by-Turn HUD */}
             <div className="relative z-10 animate-in slide-in-from-top duration-500">
                <div className="bg-slate-900/95 backdrop-blur-2xl rounded-[28px] p-5 shadow-2xl border border-white/10 flex items-center gap-5">
                   <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-teal-500/20">
                      <Navigation size={28} strokeWidth={2.5} className="rotate-45" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em]">Next Maneuver</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">• 0.4 mi</span>
                      </div>
                      <h3 className="text-[18px] font-black text-white truncate leading-tight mt-0.5">
                        {phase === Phase.NAVIGATING_TO_PICKUP ? 'Turn Right onto Broadway' : `Continue to ${currentDestination.name}'s Target`}
                      </h3>
                   </div>
                </div>
             </div>

             {/* Dynamic Destination Banner (Only for Drop-off Phase) */}
             {phase === Phase.NAVIGATING_TO_DROPOFF && manifest.length > 1 && (
               <div className="absolute top-32 left-4 right-4 z-10">
                  <div className="bg-teal-500/10 backdrop-blur-md border border-teal-500/20 rounded-2xl px-4 py-2 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                      <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest">AI Optimized Sequence</span>
                    </div>
                    <button 
                      onClick={() => {
                        const newManifest = [...manifest];
                        const temp = newManifest[0];
                        newManifest[0] = newManifest[1];
                        newManifest[1] = temp;
                        setManifest(newManifest);
                        ttsService.speak(`Sequence updated. Navigating to ${newManifest[0].name} first.`);
                      }}
                      className="text-[9px] font-black text-white bg-slate-900 px-3 py-1 rounded-lg uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Swap Order
                    </button>
                  </div>
               </div>
             )}

             {/* Floating Bottom Mission Card */}
             <div className="relative z-10 space-y-4 animate-in slide-in-from-bottom duration-500">
                <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] p-6 shadow-2xl border border-white/20">
                   <div className="flex items-center gap-4 mb-5">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm shrink-0 flex items-center justify-center">
                         {trip.passengers && trip.passengers.length > 0 ? (
                           <div className="flex -space-x-3">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentDestination.name}`} className="w-10 h-10 rounded-full border-2 border-white bg-white" />
                              <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[10px] text-white font-black">+{trip.passengers.length}</div>
                           </div>
                         ) : (
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${trip.client.name}`} className="w-full h-full object-cover" />
                         )}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2">
                           <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${phase === Phase.NAVIGATING_TO_PICKUP ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                             {phase === Phase.NAVIGATING_TO_PICKUP ? 'Pickup Stage' : `Current Objective: ${currentTargetIndex + 1}/${manifest.length}`}
                           </span>
                           <span className="text-[10px] font-bold text-slate-400">ETA 14:32</span>
                         </div>
                         <h4 className="text-[18px] font-black text-slate-900 truncate mt-0.5">
                            {phase === Phase.NAVIGATING_TO_PICKUP ? trip.client.name : currentDestination.name}
                         </h4>
                      </div>
                      <button className="w-11 h-11 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center active:scale-90 transition-all border border-slate-200">
                         <Volume2 size={20} />
                      </button>
                   </div>

                   <div className="space-y-3 mb-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${phase === Phase.NAVIGATING_TO_PICKUP ? 'bg-teal-500' : 'bg-red-500'}`} />
                         <p className="text-[13px] font-bold text-slate-600 truncate uppercase tracking-tight">
                            {phase === Phase.NAVIGATING_TO_PICKUP ? trip.pickupAddress : currentDestination.address}
                         </p>
                      </div>
                      <div className="flex justify-between items-center ml-1">
                         <div className="flex gap-5">
                           <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Est. Travel</span>
                              <span className="text-[11px] font-black text-slate-800">12 min</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Distance</span>
                              <span className="text-[11px] font-black text-slate-800">2.4 mi</span>
                           </div>
                         </div>
                      </div>
                   </div>

                   <button 
                     onClick={() => setPhase(phase === Phase.NAVIGATING_TO_PICKUP ? Phase.AT_PICKUP : Phase.AT_DROPOFF_ODO)} 
                     className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-[13px] uppercase shadow-2xl tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-3 border border-slate-800"
                   >
                     {phase === Phase.NAVIGATING_TO_PICKUP ? 'Arrived at Pickup' : `Arrived at ${currentDestination.name}'s Target`}
                     <Check size={18} strokeWidth={3} className="text-teal-400" />
                   </button>
                </div>
             </div>
          </div>
        );

      case Phase.AT_PICKUP:
        return (
          <div className="h-full flex flex-col p-4 space-y-4 relative z-10 justify-end">
             <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] p-6 shadow-2xl border border-white/20 space-y-6 animate-in slide-in-from-bottom duration-500 max-h-[85vh] overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-start">
                   <div>
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Manifest Verification</h2>
                      <p className="text-slate-500 text-[10px] font-black mt-2 uppercase tracking-[0.2em]">Secure all passengers for transit</p>
                   </div>
                   <div className="bg-teal-50 text-teal-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">Verified Site</div>
                </div>

                <div className="space-y-4">
                   {/* Principal Member */}
                   <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-200 space-y-4">
                      <div className="flex items-center gap-4">
                         <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md shrink-0">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${trip.client.name}`} className="w-full h-full" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-[20px] font-black text-slate-900 leading-tight truncate">{trip.client.name}</p>
                            <p className="text-[11px] text-teal-500 font-black uppercase mt-1 tracking-[0.2em]">{trip.client.memberId}</p>
                         </div>
                         <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/20"><Check size={16} strokeWidth={4}/></div>
                      </div>
                   </div>

                   {/* Additional Co-Riders (Multi-Load) */}
                   {trip.passengers?.map((p) => (
                      <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
                         <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} className="w-full h-full" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-black text-slate-800 truncate">{p.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{p.memberId}</p>
                         </div>
                         <button className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-300 hover:border-green-500 hover:text-green-500 transition-all">
                            <Check size={16} strokeWidth={3} />
                         </button>
                      </div>
                   ))}
                </div>

                <div className="pt-2">
                   <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 mb-4">
                      <p className="text-[10px] font-bold text-amber-800 leading-tight">
                         <span className="font-black uppercase mr-1">Safety Check:</span> Confirm all members are securely belted and mobility devices are locked.
                      </p>
                   </div>
                   <button onClick={() => setPhase(Phase.NAVIGATING_TO_DROPOFF)} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-[13px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 border border-slate-800">
                      Commence Multi-Load Transit
                      <Navigation size={18} className="text-teal-400 rotate-45" />
                   </button>
                </div>
             </div>
          </div>
        );

      case Phase.AT_DROPOFF_ODO:
        return (
          <div className="h-full flex flex-col p-4 space-y-4 relative z-10 justify-end">
             <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] p-8 shadow-2xl border border-white/20 text-center space-y-8 animate-in slide-in-from-bottom duration-500">
                <div>
                   <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Odometer Audit</h2>
                   <p className="text-slate-500 text-[10px] font-black mt-2 uppercase tracking-[0.2em]">Compliance Verification Required</p>
                </div>

                <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-200 shadow-inner relative group">
                   <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest">End Reading</div>
                   <input 
                     type="number" 
                     value={endOdo}
                     readOnly={!isEditingOdo}
                     onChange={(e) => setEndOdo(e.target.value)}
                     className={`w-full p-2 bg-transparent font-black text-5xl text-center outline-none border-b-4 transition-all ${isEditingOdo ? 'border-teal-500 text-teal-600 scale-105' : 'border-transparent text-slate-800'}`} 
                   />
                   <button 
                     onClick={() => setIsEditingOdo(!isEditingOdo)} 
                     className={`mt-6 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isEditingOdo ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'bg-slate-200 text-slate-500'}`}
                   >
                      {isEditingOdo ? 'Sync Entry' : 'Manual Edit'}
                   </button>
                </div>

                <button onClick={() => setPhase(Phase.AT_DROPOFF_SIGN)} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-[13px] uppercase tracking-[0.2em] shadow-2xl border border-slate-800 active:scale-95 transition-all">
                   Verify & Access Sign-off
                </button>
             </div>
          </div>
        );

      case Phase.AT_DROPOFF_SIGN:
        return (
          <div className="h-full flex flex-col p-4 space-y-4 relative z-10 justify-end">
             <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] p-6 shadow-2xl border border-white/20 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500 max-h-[90vh]">
                <div className="text-center mb-6">
                   <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Trip Attestation</h2>
                   <p className="text-slate-500 text-[10px] font-black mt-2 uppercase tracking-[0.2em]">Member Sign-off Required</p>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 mb-6 pr-1">
                   {/* Member Signature Section */}
                   <div className="space-y-4">
                      <div className="space-y-2">
                         <div className="flex justify-between items-center px-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Member Signature: {trip.client.name}</label>
                            {clientSignature && <span className="text-[8px] font-bold text-green-500 uppercase">Captured</span>}
                         </div>
                         <div className="border border-slate-200 rounded-3xl p-1 bg-slate-50/30 overflow-hidden h-40 relative">
                            <SignaturePad label="Member" saved={clientSignature !== null} onSave={setClientSignature} onClear={() => setClientSignature(null)} />
                         </div>
                      </div>

                      {/* Archived Driver Signature Confirmation */}
                      <div className="bg-slate-900 p-5 rounded-3xl border border-white/10 shadow-xl flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400">
                               <ShieldCheck size={20} />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Driver Attestation</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Vault-Secured Signature Applied</p>
                            </div>
                         </div>
                         <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-green-500/20">
                            Archived
                         </div>
                      </div>

                      {/* Co-rider notification if multi-load */}
                      {trip.passengers && trip.passengers.length > 0 && (
                         <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100/50 text-center">
                            <p className="text-[10px] font-black text-teal-800 uppercase tracking-widest">Applying Single Multi-Load Sign-Off</p>
                            <p className="text-[9px] font-bold text-teal-600 mt-1 italic">Signature covers all {1 + trip.passengers.length} manifest members.</p>
                         </div>
                      )}
                   </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                   <button onClick={() => setPhase(Phase.AT_DROPOFF_ODO)} className="flex-1 py-5 bg-slate-100 rounded-[22px] text-[11px] font-black uppercase tracking-widest text-slate-500 active:scale-95 transition-all">Back</button>
                   <button 
                     disabled={!clientSignature || isSubmitting}
                     onClick={() => { setIsSubmitting(true); setTimeout(() => onComplete(), 1200); }} 
                     className="flex-[2] py-5 bg-slate-900 text-white rounded-[22px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all border border-slate-800 disabled:opacity-30"
                   >
                      {isSubmitting ? (
                         <div className="flex items-center justify-center gap-2">
                            <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                         </div>
                      ) : 'Finalize Trip'}
                   </button>
                </div>
             </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col max-w-md mx-auto h-screen shadow-2xl overflow-hidden font-sans">
      {/* Global Ambient Map Background */}
      <div className="absolute inset-0 z-0">
         <MissionMap 
           trips={[trip]} 
           activeTripId={trip.id}
         />
         {/* Subtle overlay only, reduced blur for navigation focus */}
         <div className={`absolute inset-0 bg-slate-950/20 transition-all duration-700 ${(phase === Phase.NAVIGATING_TO_PICKUP || phase === Phase.NAVIGATING_TO_DROPOFF) ? 'backdrop-blur-[1px]' : 'backdrop-blur-[3px]'}`} />
      </div>

      {/* Minimal Floating Header */}
      <div className="relative z-30 px-4 py-3 flex items-center justify-between pointer-events-none">
        <button onClick={onBack} className="p-3 bg-white/90 backdrop-blur-xl rounded-2xl text-slate-900 shadow-xl border border-white/20 active:scale-90 transition-all pointer-events-auto"><ArrowLeft size={22} /></button>
        <div className="bg-slate-900/90 backdrop-blur-xl px-5 py-2 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <h1 className="text-[12px] font-black text-white tracking-widest uppercase">{trip.id}</h1>
        </div>
        <button className="p-3 bg-white/90 backdrop-blur-xl rounded-2xl text-slate-900 shadow-xl border border-white/20 pointer-events-auto"><MoreVertical size={20}/></button>
      </div>

      <div className="flex-1 relative">{renderContent()}</div>
    </div>
  );
};

export default ActiveTripScreen;
