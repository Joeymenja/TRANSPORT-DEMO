
import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, CheckCircle2, Save, Car, Gauge, Info, Loader2, 
  Sparkles, Truck, AlertTriangle, Wifi, MapPin, FileText, 
  ChevronRight, Zap, RefreshCw, ClipboardCheck, Briefcase
} from 'lucide-react';

interface PreTripCheckScreenProps {
  onBack: () => void;
  onComplete: () => void;
}

const PreTripCheckScreen: React.FC<PreTripCheckScreenProps> = ({ onBack, onComplete }) => {
  const [odo, setOdo] = useState('42350');
  const [isSystemChecking, setIsSystemChecking] = useState(true);
  const [diagnostics, setDiagnostics] = useState({
    gps: { status: 'testing', label: 'Locking Satellites...', precision: '0.0m' },
    network: { status: 'testing', label: 'Verifying Secure Node...', latency: '0ms' },
    docs: { status: 'testing', label: 'Vault Verification...', expiry: '--' }
  });

  const [checks, setChecks] = useState({
    exterior: false,
    fluids: false,
    brakes: false,
    interior: false,
    equipmentMatching: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulated System Diagnostics on Mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setDiagnostics({
        gps: { status: 'success', label: 'GPS Precision High', precision: '4.2m' },
        network: { status: 'success', label: 'Network Secured', latency: '42ms' },
        docs: { status: 'success', label: 'Compliance Valid', expiry: 'Jan 2026' }
      });
      setIsSystemChecking(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggleCheck = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isAllChecked = Object.values(checks).every(v => v) && odo.length > 3 && !isSystemChecking;

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onComplete();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-white flex flex-col max-w-md mx-auto h-screen shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
      {/* Header */}
      <div className="bg-white px-8 py-8 flex items-center justify-between border-b shadow-sm z-30">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 active:scale-90 transition-all"><X size={32} /></button>
        <div className="text-center">
             <span className="text-[10px] font-black text-teal-500 uppercase tracking-[0.4em]">Fleet Readiness</span>
             <span className="block text-sm font-black text-gray-900 tracking-tighter mt-0.5">Asset ID: GV-FORD-843</span>
        </div>
        <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-500 shadow-inner">
           <Truck size={24}/>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-12">
         <div className="space-y-3">
            <h2 className="text-4xl font-black text-[#0f172a] tracking-tighter leading-none">Shift Starter</h2>
            <p className="text-gray-400 font-medium text-base">Initialize dispatch parameters and safety clearance.</p>
         </div>

         {/* System Diagnostics Section */}
         <section className="space-y-6">
            <div className="flex justify-between items-center px-2">
               <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">System Pulse</h3>
               {isSystemChecking && <Loader2 size={14} className="animate-spin text-teal-500" />}
            </div>
            
            <div className="grid grid-cols-1 gap-4">
               {/* GPS Accuracy */}
               <div className={`p-6 rounded-[36px] border-2 transition-all flex items-center justify-between ${diagnostics.gps.status === 'success' ? 'bg-green-50/50 border-green-100' : 'bg-gray-50 border-gray-100 animate-pulse'}`}>
                  <div className="flex items-center gap-4">
                     <div className={`p-3 rounded-2xl ${diagnostics.gps.status === 'success' ? 'bg-white text-green-500 shadow-md' : 'bg-gray-200 text-gray-400'}`}>
                        <MapPin size={20} />
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">GPS Precision</p>
                        <p className={`text-sm font-black ${diagnostics.gps.status === 'success' ? 'text-green-800' : 'text-gray-400'}`}>{diagnostics.gps.label}</p>
                     </div>
                  </div>
                  {diagnostics.gps.status === 'success' && <span className="text-[10px] font-black text-green-500">{diagnostics.gps.precision}</span>}
               </div>

               {/* Network Connectivity */}
               <div className={`p-6 rounded-[36px] border-2 transition-all flex items-center justify-between ${diagnostics.network.status === 'success' ? 'bg-teal-50/50 border-teal-100' : 'bg-gray-50 border-gray-100 animate-pulse'}`}>
                  <div className="flex items-center gap-4">
                     <div className={`p-3 rounded-2xl ${diagnostics.network.status === 'success' ? 'bg-white text-teal-500 shadow-md' : 'bg-gray-200 text-gray-400'}`}>
                        <Wifi size={20} />
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Secure Link</p>
                        <p className={`text-sm font-black ${diagnostics.network.status === 'success' ? 'text-teal-800' : 'text-gray-400'}`}>{diagnostics.network.label}</p>
                     </div>
                  </div>
                  {diagnostics.network.status === 'success' && <span className="text-[10px] font-black text-teal-500">{diagnostics.network.latency}</span>}
               </div>

               {/* Insurance / Registration Check */}
               <div className={`p-6 rounded-[36px] border-2 transition-all flex items-center justify-between ${diagnostics.docs.status === 'success' ? 'bg-amber-50/50 border-amber-100' : 'bg-gray-50 border-gray-100 animate-pulse'}`}>
                  <div className="flex items-center gap-4">
                     <div className={`p-3 rounded-2xl ${diagnostics.docs.status === 'success' ? 'bg-white text-amber-500 shadow-md' : 'bg-gray-200 text-gray-400'}`}>
                        <FileText size={20} />
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Asset Credential</p>
                        <p className={`text-sm font-black ${diagnostics.docs.status === 'success' ? 'text-amber-800' : 'text-gray-400'}`}>{diagnostics.docs.label}</p>
                     </div>
                  </div>
                  {diagnostics.docs.status === 'success' && <span className="text-[10px] font-black text-amber-500">Exp: {diagnostics.docs.expiry}</span>}
               </div>
            </div>
         </section>

         {/* Odometer Entry */}
         <div className="bg-[#f8fafc] p-10 rounded-[56px] border border-gray-100 space-y-8 relative overflow-hidden group shadow-inner">
            <div className="flex items-center justify-between relative z-10 px-2">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-[#0ea5e9]"><Gauge size={20} /></div>
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Start Odometer *</span>
               </div>
               <p className="text-[10px] font-black text-[#0ea5e9] bg-teal-50 px-3 py-1 rounded-full uppercase">Sync Active</p>
            </div>
            <div className="relative z-10">
               <input 
                 type="number" 
                 value={odo} 
                 onChange={e => setOdo(e.target.value)}
                 placeholder="000000"
                 className="w-full bg-white p-10 rounded-[44px] border-[6px] border-white font-black text-6xl text-[#0ea5e9] shadow-2xl outline-none text-center transition-all focus:ring-[12px] focus:ring-teal-100/50" 
               />
               <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full border border-gray-100 shadow-md flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Capture</span>
               </div>
            </div>
         </div>

         {/* Visual Inspection Grid */}
         <div className="space-y-6">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4">Compliance Checklist</h3>
            <div className="space-y-4">
               {[
                 { id: 'exterior', label: 'Exterior HUD', desc: 'Lighting, tires, mirrors verified' },
                 { id: 'fluids', label: 'Fluid Integrity', desc: 'Oil, coolant, brake levels secure' },
                 { id: 'brakes', label: 'Kinetic Check', desc: 'Brakes and steering responsive' },
                 { id: 'interior', label: 'Sanitation Node', desc: 'Cabin environment clean & secure' },
                 { id: 'equipmentMatching', label: 'Equipment Loadout', desc: 'First aid, fire ext, tie-downs onboard' },
               ].map(item => (
                 <button 
                   key={item.id}
                   onClick={() => toggleCheck(item.id as keyof typeof checks)}
                   className={`w-full flex items-center justify-between p-8 rounded-[48px] border-2 transition-all text-left group ${checks[item.id as keyof typeof checks] ? 'bg-green-50 border-green-500 shadow-xl shadow-green-100/30' : 'bg-white border-gray-100 shadow-sm hover:border-teal-200'}`}
                 >
                   <div className="flex flex-col gap-1">
                      <span className={`text-lg font-black leading-tight ${checks[item.id as keyof typeof checks] ? 'text-green-900' : 'text-[#0f172a]'}`}>{item.label}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.desc}</span>
                   </div>
                   <div className={`w-10 h-10 rounded-[18px] border-2 flex items-center justify-center transition-all ${checks[item.id as keyof typeof checks] ? 'bg-green-500 border-green-500 text-white shadow-lg' : 'border-gray-100 bg-gray-50'}`}>
                      {checks[item.id as keyof typeof checks] ? <CheckCircle2 size={24} /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-200 group-hover:bg-teal-200 transition-colors" />}
                   </div>
                 </button>
               ))}
            </div>
         </div>

         {/* Mandatory Attestation */}
         <div className="p-8 bg-amber-50 rounded-[48px] border border-amber-100 flex gap-6 shadow-sm">
            <div className="p-3 bg-white rounded-2xl shadow-md text-amber-500 shrink-0 h-fit"><AlertTriangle size={28} /></div>
            <p className="text-sm font-bold text-amber-800 leading-relaxed uppercase tracking-tight pt-1">I certify that I have personally verified all safety protocols and this asset is in peak operating condition for healthcare transport.</p>
         </div>
         
         <div className="pb-40" />
      </div>

      {/* Action Footer */}
      <div className="p-10 bg-white/80 backdrop-blur-3xl border-t border-gray-100 fixed bottom-0 left-0 right-0 max-w-md mx-auto shadow-[0_-20px_60px_rgba(0,0,0,0.08)] z-40">
         <button 
           disabled={!isAllChecked || isSubmitting}
           onClick={handleSubmit}
           className={`w-full py-8 rounded-[48px] font-black text-[24px] flex items-center justify-center gap-6 shadow-3xl transition-all active:scale-95 relative group overflow-hidden ${!isAllChecked || isSubmitting ? 'bg-gray-100 text-gray-400 cursor-not-allowed grayscale' : 'bg-[#0f172a] text-white shadow-slate-900/20'}`}
         >
            {isSubmitting ? (
               <div className="flex items-center gap-4">
                  <Loader2 className="animate-spin" size={32} />
                  <span>TRANSMITTING...</span>
               </div>
            ) : (
               <>
                  <ShieldCheck size={36} className={isAllChecked ? 'text-green-400 animate-pulse' : ''}/>
                  <span className="tracking-tight">Commit & Start Shift</span>
                  <ChevronRight size={32} className="opacity-20 group-hover:translate-x-1 transition-transform" />
               </>
            )}
            
            {isAllChecked && !isSubmitting && (
               <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-in slide-in-from-left duration-1000" />
            )}
         </button>
      </div>
    </div>
  );
};

export default PreTripCheckScreen;
