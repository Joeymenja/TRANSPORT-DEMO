
import React, { useState, useEffect } from 'react';
import { MOCK_TRIPS } from '../constants';
import { 
  MapPin, 
  Navigation, 
  Plus,
  Compass,
  Zap,
  Route
} from 'lucide-react';
import { ttsService } from '../services/TTSService';
import MissionMap from '../components/MissionMap';

interface DashboardScreenProps {
  onStartTrip: (id: string) => void;
  onViewTrip: (id: string) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ onStartTrip, onViewTrip }) => {
  const [status, setStatus] = useState<'available' | 'break' | 'off'>('available');

  return (
    <div className="h-full bg-slate-50 font-sans overflow-y-auto no-scrollbar pb-40">
      {/* Hero Header Section */}
      <div className="h-[180px] bg-slate-900 relative overflow-hidden">
        <img src="https://picsum.photos/seed/gvbh_aerial/800/400" className="w-full h-full object-cover opacity-30 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        
        <div className="absolute top-6 left-5 right-5 flex items-center justify-between">
          <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status === 'available' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-amber-500'}`} />
            <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">{status}</span>
          </div>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-initiate-trip'))} 
            className="w-10 h-10 bg-teal-500 text-white rounded-xl shadow-lg flex items-center justify-center active:scale-90 transition-all border border-white/20"
          >
            <Plus size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="absolute bottom-6 left-5">
           <p className="text-[10px] font-black text-teal-400 uppercase tracking-[0.3em] mb-1">Fleet Sector</p>
           <h2 className="text-2xl font-black text-white tracking-tight">Phoenix Central</h2>
        </div>
      </div>

      <div className="px-5 -mt-4 relative z-10 space-y-6">


        {/* Primary Mission Card */}
        <section className="space-y-4">
           <div className="flex justify-between items-center px-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assignment Schedule</h3>
              <button className="text-[10px] font-black text-teal-500 uppercase tracking-widest">View All</button>
           </div>
           
           <div className="bg-white p-5 rounded-[32px] shadow-xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none text-slate-900"><Route size={120} /></div>
              
              <div className="flex items-center gap-4 relative z-10">
                 <div className="w-14 h-14 bg-slate-50 rounded-[22px] overflow-hidden shrink-0 border-2 border-white shadow-md">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${MOCK_TRIPS[0].client.name}`} className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded-md text-[8px] font-black uppercase tracking-tighter">Next Up</span>
                      <p className="text-[10px] font-bold text-slate-400">{MOCK_TRIPS[0].scheduledTime}</p>
                    </div>
                    <h4 className="text-[18px] font-black text-slate-900 leading-tight truncate mt-1">{MOCK_TRIPS[0].client.name}</h4>
                    <div className="flex items-center gap-1.5 mt-1">
                       <MapPin size={12} className="text-teal-500" />
                       <p className="text-[12px] font-bold text-slate-500 truncate tracking-tight uppercase">{MOCK_TRIPS[0].pickupAddress.split(',')[0]}</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => onStartTrip(MOCK_TRIPS[0].id)} 
                   className="w-14 h-14 bg-slate-900 text-white rounded-[24px] flex items-center justify-center shadow-xl active:scale-90 transition-all border border-slate-700 hover:bg-teal-500 hover:border-teal-400"
                 >
                    <Navigation size={26} strokeWidth={2.5} />
                 </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 relative z-10">
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm"><Zap size={14} className="text-amber-500" /></div>
                    <div className="min-w-0">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Urgency</p>
                       <p className="text-[11px] font-bold text-slate-800 truncate">High Priority</p>
                    </div>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm"><Compass size={14} className="text-teal-500" /></div>
                    <div className="min-w-0">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Proximity</p>
                       <p className="text-[11px] font-bold text-slate-800 truncate">2.4 Miles</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardScreen;
