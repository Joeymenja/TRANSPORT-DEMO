import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Trip } from '../types';
import {
   RefreshCw,
   ChevronDown,
   Zap,
   Activity,
   MapPin,
   Navigation,
   ShieldCheck,
   Sparkles,
   Loader2,
   TrendingUp,
   FileText,
   PlusCircle,
   Heart,
   Clock,
   ClipboardList,
   Plus
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface DashboardScreenProps {
   onStartTrip: (id: string) => void;
   onViewTrip: (id: string) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ onStartTrip, onViewTrip }) => {
   const [status, setStatus] = useState<'available' | 'break' | 'off'>('available');
   const [cityPulse, setCityPulse] = useState<any>(null);
   const [isRefreshingPulse, setIsRefreshingPulse] = useState(false);
   const [nextTrip, setNextTrip] = useState<Trip | null>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetchCityPulse();
      fetchNextTrip();
   }, []);

   const fetchNextTrip = async () => {
      try {
         const user = await api.getMe();
         if (user && user.id) {
            const driverId = user.driverId || user.id;
            const trips = await api.getDriverTrips(driverId);
            const scheduled = trips.find(t => t.status === 'SCHEDULED' || t.status === 'STARTING_SOON');
            setNextTrip(scheduled || null);
         }
      } catch (e) {
         console.error("Failed to fetch trips", e);
         // Fallback to mock for demo smoothness if API fails? 
         // For now, let's stick to real connection attempt, or null.
      } finally {
         setLoading(false);
      }
   };

   const fetchCityPulse = async () => {
      setIsRefreshingPulse(true);
      try {
         const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });
         const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: "Analyze Phoenix NEMT traffic. 1 sentence summary.",
         });
         setCityPulse(response.text || "Operational channels normal across I-10 corridor.");
      } catch (e) { setCityPulse("Service grid online. Traffic moderate."); }
      finally { setIsRefreshingPulse(false); }
   };

   const handleInitiateAdHoc = () => {
      window.dispatchEvent(new CustomEvent('open-initiate-trip'));
   };

   return (
      <div className="pb-8">
         {/* Dynamic Map Hero */}
         <div className="h-[280px] bg-gray-900 relative overflow-hidden">
            <img alt="Map Background" src="https://picsum.photos/seed/gvbh_map/1200/800" className="w-full h-full object-cover opacity-40 grayscale" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />

            <div className="absolute top-6 left-6 flex items-center justify-between right-6">
               <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 border border-white/20">
                  <div className={`w-2 h-2 rounded-full ${status === 'available' ? 'bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]' : 'bg-amber-500'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{status}</span>
               </div>

               <button
                  onClick={handleInitiateAdHoc}
                  className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white border border-white/10 hover:bg-white/20 active:scale-90 transition-all flex items-center gap-2"
               >
                  <Plus size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">New Ride</span>
               </button>
            </div>

            <div className="absolute bottom-8 left-6 right-6">
               <div className="flex items-center gap-4 text-white/60">
                  <div className="h-px flex-1 bg-white/10" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Fleet Pulse</p>
                  <div className="h-px flex-1 bg-white/10" />
               </div>
            </div>
         </div>

         <div className="px-6 -mt-4 relative z-10 space-y-4">
            {/* Primary Assigned Task */}
            <div className="bg-white p-8 rounded-[44px] border border-gray-100 shadow-xl space-y-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-sky-500 uppercase tracking-[0.2em]">Next Assignment</h3>
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                     <span className="text-[9px] font-black text-gray-400 uppercase">Active Dispatch</span>
                  </div>
               </div>
               {loading ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-sky-500" /></div>
               ) : nextTrip ? (
                  <div onClick={() => onViewTrip(nextTrip.id)} className="flex items-center gap-6 group cursor-pointer">
                     <div className="relative">
                        <img alt="Client Avatar" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nextTrip.client.name}`} className="w-20 h-20 bg-gray-50 rounded-[32px] border-4 border-white shadow-xl group-hover:scale-105 transition-transform" />
                        <div className="absolute -bottom-1 -right-1 bg-sky-500 text-white p-1.5 rounded-xl shadow-lg"><Heart size={12} className="fill-white" /></div>
                     </div>
                     <div className="flex-1">
                        <h4 className="text-2xl font-black text-gray-900 leading-none mb-1">{nextTrip.client.name}</h4>
                        <p className="text-xs font-bold text-gray-400">{new Date(nextTrip.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {nextTrip.type}</p>
                     </div>
                     <button aria-label="Start Trip" onClick={(e) => { e.stopPropagation(); onStartTrip(nextTrip.id); }} className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-xl active:scale-90 transition-all">
                        <Navigation size={24} />
                     </button>
                  </div>
               ) : (
                  <div className="text-center py-8 text-gray-400 font-medium tracking-wide text-xs uppercase">No pending assignments</div>
               )}
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div onClick={() => window.dispatchEvent(new CustomEvent('open-performance'))} className="bg-white p-6 rounded-[36px] shadow-md border border-gray-50 active:scale-95 transition-all">
                  <div className="flex justify-between items-start mb-4">
                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Shift Volume</span>
                     <Activity size={16} className="text-sky-500" />
                  </div>
                  <p className="text-3xl font-black text-gray-900">42</p>
                  <p className="text-[9px] font-bold text-green-500 uppercase mt-1">Trips Completed</p>
               </div>

               <div onClick={() => window.dispatchEvent(new CustomEvent('open-manual-report'))} className="bg-white p-6 rounded-[36px] shadow-md border border-gray-50 active:scale-95 transition-all flex flex-col justify-between group">
                  <div className="flex justify-between items-start mb-4">
                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Audit</span>
                     <FileText size={16} className="text-gray-400 group-hover:text-sky-500 transition-colors" />
                  </div>
                  <p className="text-sm font-black text-gray-800 leading-tight">Back-fill Trip Log</p>
               </div>
            </div>

            {/* Intelligence Card */}
            <div className="bg-sky-50/50 p-6 rounded-[36px] border border-sky-100 flex items-center gap-4">
               <div className="p-3 bg-white rounded-2xl shadow-sm"><Sparkles className="text-sky-500" size={20} /></div>
               <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                     <p className="text-[9px] font-black text-sky-600 uppercase tracking-widest">Network Intel</p>
                     <button onClick={fetchCityPulse}>{isRefreshingPulse ? <Loader2 className="animate-spin text-sky-300" size={10} /> : <RefreshCw className="text-sky-300" size={10} />}</button>
                  </div>
                  <p className="text-xs font-bold text-sky-900 line-clamp-2">{cityPulse || 'Retrieving latest fleet patterns...'}</p>
               </div>
            </div>
         </div>
      </div>
   );
};

export default DashboardScreen;
