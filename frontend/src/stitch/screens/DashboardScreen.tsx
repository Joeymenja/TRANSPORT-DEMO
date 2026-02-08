
import React, { useState, useEffect } from 'react';
import { MOCK_TRIPS, COLORS } from '../constants';
import TripCard from '../components/TripCard';
import { 
  RefreshCw, 
  Bell, 
  TrendingUp, 
  ChevronDown, 
  Mic, 
  Zap, 
  AlertCircle, 
  Map as MapIcon, 
  Loader2, 
  Sparkles, 
  Navigation,
  Heart,
  Award,
  LogOut,
  X,
  Activity,
  Wind,
  CloudLightning,
  MapPin,
  ArrowUpRight,
  ChevronRight,
  Coffee,
  BatteryCharging,
  Stethoscope,
  ShieldCheck
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { GoogleGenAI } from "@google/genai";

interface DashboardScreenProps {
  onStartTrip: (id: string) => void;
  onViewTrip: (id: string) => void;
}

const statsData = [
  { name: 'Mon', trips: 4 },
  { name: 'Tue', trips: 7 },
  { name: 'Wed', trips: 5 },
  { name: 'Thu', trips: 8 },
  { name: 'Fri', trips: 6 },
];

const DashboardScreen: React.FC<DashboardScreenProps> = ({ onStartTrip, onViewTrip }) => {
  const [status, setStatus] = useState<'available' | 'break' | 'off'>('available');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [cityPulse, setCityPulse] = useState<{ intel: string; risk: 'low' | 'med' | 'high'; impact: string } | null>(null);
  const [isRefreshingPulse, setIsRefreshingPulse] = useState(false);
  const [showShiftSummary, setShowShiftSummary] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [shiftSummary, setShiftSummary] = useState<string>('');
  const [demandHotspots, setDemandHotspots] = useState<{ location: string; intensity: string; reason: string }[]>([]);
  const [breakInsight, setBreakInsight] = useState<{ title: string; desc: string; type: string } | null>(null);
  const [isLoadingBreak, setIsLoadingBreak] = useState(false);

  const fetchCityPulse = async () => {
    setIsRefreshingPulse(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Analyze Phoenix NEMT demand data. Provide a 'City Pulse' update and 2 current high-demand 'Hotspots' for medical pickups. Format as JSON: {pulse: {intel: string, risk: 'low'|'med'|'high', impact: string}, hotspots: [{location: string, intensity: string, reason: string}]}",
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || '{}');
      setCityPulse(data.pulse);
      setDemandHotspots(data.hotspots || []);
    } catch (e) {
      console.error(e);
      setCityPulse({ intel: "Heavy congestion on I-10 Westbound near 7th St.", risk: "med", impact: "Expect 12-minute delays." });
      setDemandHotspots([
        { location: "Sun City West", intensity: "High", reason: "Dialysis Shuffles" },
        { location: "Tempe Medical Hub", intensity: "Med", reason: "Specialist Discharges" }
      ]);
    } finally {
      setIsRefreshingPulse(false);
    }
  };

  const getBreakInsight = async () => {
    setIsLoadingBreak(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "The driver is currently on a 30-minute break in Scottsdale, AZ. Suggest a wellness activity or logistics tip. Format as JSON: {title: string, desc: string, type: 'wellness'|'logistics'|'rest'}",
        config: { responseMimeType: "application/json" }
      });
      setBreakInsight(JSON.parse(response.text || '{}'));
    } catch (e) {
      setBreakInsight({ title: "Stretch & Refresh", desc: "Perform a 5-minute seated ergonomic stretch to stay alert for your next trip.", type: "wellness" });
    } finally {
      setIsLoadingBreak(false);
    }
  };

  useEffect(() => {
    fetchCityPulse();
  }, []);

  useEffect(() => {
    if (status === 'break') getBreakInsight();
    else setBreakInsight(null);
  }, [status]);

  const generateShiftSummary = async () => {
    setIsGeneratingSummary(true);
    setShowShiftSummary(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate a 'Driver Impact Summary' for an NEMT shift. Stats: 12 trips completed, 100% on-time, 4 wheelchair assists, 58 miles driven. Focus on human impact.",
        config: { systemInstruction: "You are a supportive NEMT operations manager." }
      });
      setShiftSummary(response.text || "Today you ensured 12 members received care. Great work.");
    } catch (e) {
      console.error(e);
      setShiftSummary("Today you successfully completed 12 critical medical trips.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleOpenPerformance = () => {
    window.dispatchEvent(new CustomEvent('open-performance'));
  };

  return (
    <div className="pb-8">
      {/* Dynamic Intelligence Map Area */}
      <div className="h-[420px] bg-gray-200 relative overflow-hidden">
        <img 
          src="https://picsum.photos/seed/nemt_map_pro_v4/1200/800" 
          alt="Map" 
          className="w-full h-full object-cover opacity-90 transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/40 pointer-events-none" />
        
        {/* Animated Demand Hotspots on Map */}
        {demandHotspots.map((spot, idx) => (
          <div 
            key={idx} 
            className="absolute z-10 animate-pulse"
            style={{ 
              top: idx === 0 ? '30%' : '55%', 
              left: idx === 0 ? '40%' : '65%' 
            }}
          >
            <div className={`w-8 h-8 rounded-full ${spot.intensity === 'High' ? 'bg-red-500/30' : 'bg-teal-500/30'} flex items-center justify-center`}>
              <div className={`w-3 h-3 rounded-full ${spot.intensity === 'High' ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 'bg-teal-500 shadow-[0_0_15px_#0ea5e9]'}`} />
            </div>
            <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 whitespace-nowrap">
              <p className="text-[8px] font-black text-white/60 uppercase tracking-widest leading-none mb-0.5">{spot.intensity} Demand</p>
              <p className="text-[10px] font-bold text-white">{spot.location}</p>
            </div>
          </div>
        ))}

        {/* Status Bubble */}
        <div className="absolute top-6 left-6 z-20">
          <button 
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-[24px] shadow-2xl flex items-center space-x-3 border border-white/50 active:scale-95 transition-all"
          >
            <div className={`w-2.5 h-2.5 rounded-full ${status === 'available' ? 'bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)]' : status === 'break' ? 'bg-amber-500' : 'bg-gray-400'}`} />
            <span className="text-[11px] font-black text-gray-900 uppercase tracking-[0.15em]">
              {status === 'available' ? 'System Online' : status === 'break' ? 'On Break' : 'Off Duty'}
            </span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          
          {showStatusMenu && (
            <div className="absolute top-full left-0 mt-3 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden w-64 animate-in fade-in slide-in-from-top-2 z-50">
              {[
                { id: 'available', label: 'Go Online', color: 'bg-green-500', desc: 'Ready for priority dispatch' },
                { id: 'break', label: 'Take Break', color: 'bg-amber-500', desc: 'Temporary offline status' },
                { id: 'off', label: 'End Shift', color: 'bg-gray-400', desc: 'Submit daily logs' }
              ].map(s => (
                <button 
                  key={s.id}
                  onClick={() => { 
                    setStatus(s.id as any); 
                    setShowStatusMenu(false);
                    if (s.id === 'off') generateShiftSummary();
                  }}
                  className="w-full px-6 py-5 text-left hover:bg-gray-50 flex items-center gap-4 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className={`w-3 h-3 rounded-full ${s.color}`} />
                  <div>
                    <p className="text-sm font-black text-gray-900 uppercase">{s.label}</p>
                    <p className="text-[10px] text-gray-400 font-bold tracking-tight">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* City Pulse AI Feed */}
        <div className="absolute bottom-10 left-6 right-6 z-20">
          <div className="bg-gray-900/95 backdrop-blur-2xl border border-white/10 p-6 rounded-[44px] shadow-2xl space-y-5">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-teal-500 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-teal-500/40 relative">
                      <Sparkles size={24} className="animate-pulse" />
                   </div>
                   <div>
                      <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-[0.25em] mb-0.5">Neural Operations Hub</h4>
                      <p className="text-sm font-black text-white">City Intelligence Pulse</p>
                   </div>
                </div>
                <button onClick={fetchCityPulse} className="p-3 bg-white/5 rounded-2xl text-white/30 hover:text-teal-400 transition-colors">
                  {isRefreshingPulse ? <Loader2 className="animate-spin" size={18}/> : <RefreshCw size={18} />}
                </button>
             </div>

             {cityPulse && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 bg-white/5 p-4 rounded-3xl border border-white/5 group hover:border-teal-500/30 transition-colors">
                     <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${cityPulse.risk === 'high' ? 'bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]' : cityPulse.risk === 'med' ? 'bg-amber-500' : 'bg-green-500'}`} />
                     <div>
                        <p className="text-[13px] font-bold text-gray-200 leading-snug">{cityPulse.intel}</p>
                        <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest mt-2">{cityPulse.impact}</p>
                     </div>
                  </div>
                  {demandHotspots.length > 0 && (
                    <div className="flex items-center gap-3 bg-teal-500/10 p-4 rounded-3xl border border-teal-500/10">
                       <div className="p-2 bg-teal-500 rounded-xl text-white"><TrendingUp size={16}/></div>
                       <div>
                          <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-0.5">Demand Forecast</p>
                          <p className="text-[12px] font-bold text-teal-100">Peak expected in {demandHotspots[0].location}</p>
                       </div>
                    </div>
                  )}
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Stats Quick Actions & Guardian Status */}
      <div className="px-6 -mt-10 relative z-30 space-y-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={handleOpenPerformance}
            className="bg-white p-7 rounded-[44px] shadow-2xl border border-gray-100 active:scale-95 transition-all group overflow-hidden relative"
          >
            <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:scale-125 transition-transform text-teal-500">
              <Activity size={80} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trips Today</span>
              <div className="p-2 bg-green-50 text-green-500 rounded-2xl"><TrendingUp size={18} /></div>
            </div>
            <div className="text-5xl font-black text-gray-900 tracking-tight">12</div>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-600 font-black uppercase tracking-widest">Global Top 5%</span>
            </div>
          </div>
          
          <div className="bg-teal-500 p-7 rounded-[44px] shadow-2xl shadow-teal-200 active:scale-95 transition-all group text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-teal-100 uppercase tracking-widest">Shift Payout</span>
              <div className="p-2 bg-white/20 rounded-2xl"><Zap size={18} /></div>
            </div>
            <div className="text-5xl font-black tracking-tight">$284</div>
            <div className="mt-3 flex items-center gap-1.5">
              <ArrowUpRight size={14} className="text-teal-200" />
              <span className="text-[10px] text-teal-100 font-black uppercase tracking-widest">Predicting +$142</span>
            </div>
          </div>
        </div>

        {/* Guardian Status HUD */}
        <div className="bg-gray-900 rounded-[36px] p-6 flex items-center justify-between border border-white/10 shadow-2xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                 <ShieldCheck size={28} />
              </div>
              <div>
                 <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-[0.3em] mb-1">Guardian Level</h4>
                 <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-white">Platinum Elite</span>
                    <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-teal-500/30">Top Tier</span>
                 </div>
              </div>
           </div>
           <div className="text-right relative z-10">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">compliance streak</p>
              <p className="text-2xl font-black text-white">42 <span className="text-[10px] text-gray-500">Days</span></p>
           </div>
        </div>
      </div>

      {/* Main Assignment HUD or Break HUD */}
      <div className="px-6 mb-10">
         {status === 'break' ? (
           <div className="bg-indigo-900 rounded-[48px] p-8 text-white shadow-2xl relative overflow-hidden animate-in zoom-in-95">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                 <Coffee size={120} />
              </div>
              <div className="relative z-10">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                       <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                          <BatteryCharging size={24} className="text-indigo-300" />
                       </div>
                       <div>
                          <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-300">Break Intelligence</h3>
                          <p className="text-lg font-black">AI Health Copilot</p>
                       </div>
                    </div>
                    {isLoadingBreak && <Loader2 className="animate-spin text-indigo-300" size={20} />}
                 </div>

                 {breakInsight && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2">
                       <p className="text-2xl font-black leading-tight tracking-tight">{breakInsight.title}</p>
                       <div className="p-5 bg-white/10 rounded-[32px] border border-white/5 backdrop-blur-sm">
                          <p className="text-sm font-medium text-indigo-100 leading-relaxed italic">
                             "{breakInsight.desc}"
                          </p>
                       </div>
                       <button 
                         onClick={() => setStatus('available')}
                         className="w-full bg-white text-indigo-900 font-black py-4 rounded-[28px] shadow-xl active:scale-95 transition-all text-sm uppercase tracking-widest"
                       >
                         Resume Dispatch
                       </button>
                    </div>
                 )}
              </div>
           </div>
         ) : (
           <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm p-8 space-y-8 relative group cursor-pointer hover:shadow-xl transition-all border-b-4 border-b-teal-500/20">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Priority Dispatch</h3>
                 </div>
                 <div className="flex items-center gap-2 text-teal-500 font-black uppercase tracking-widest text-[9px] bg-teal-50 px-4 py-2 rounded-full border border-teal-100">
                    <Mic size={12} className="animate-pulse" /> AI Monitor Active
                 </div>
              </div>
              {MOCK_TRIPS.length > 0 && (
                <div onClick={() => onViewTrip(MOCK_TRIPS[0].id)} className="flex items-center gap-6">
                   <div className="relative">
                      <div className="w-20 h-20 bg-gray-50 rounded-[32px] overflow-hidden border-4 border-white shadow-2xl relative z-10 group-hover:scale-105 transition-transform duration-500">
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${MOCK_TRIPS[0].client.name}`} alt="Member" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-teal-500 text-white p-2 rounded-xl z-20 shadow-lg"><Heart size={14} className="fill-white" /></div>
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-2 truncate">{MOCK_TRIPS[0].client.name}</h4>
                      <div className="flex items-center gap-2">
                         <div className="p-1.5 bg-gray-50 text-gray-400 rounded-lg"><MapPin size={14} /></div>
                         <p className="text-sm font-bold text-gray-500 truncate">{MOCK_TRIPS[0].pickupAddress.split(',')[0]}</p>
                    </div>
                 </div>
                 <button 
                   onClick={(e) => { e.stopPropagation(); onStartTrip(MOCK_TRIPS[0].id); }} 
                   className="w-16 h-16 bg-gray-900 text-white rounded-[28px] flex items-center justify-center shadow-2xl hover:bg-teal-500 transition-colors active:scale-90"
                 >
                    <Navigation size={28} />
                 </button>
              </div>
            )}
         </div>
         )}
      </div>

      {/* Predictive Analytics Card */}
      <div className="px-6 pb-20">
        <div 
          onClick={handleOpenPerformance}
          className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-5 transition-opacity">
            <Sparkles size={120} className="text-teal-500" />
          </div>
          <div className="flex items-center justify-between mb-10">
            <div>
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Growth Intelligence</h3>
               <p className="text-2xl font-black text-gray-900">Earning Trajectory</p>
            </div>
            <div className="w-14 h-14 bg-teal-50 rounded-[20px] flex items-center justify-center text-teal-500 border border-teal-100">
               <TrendingUp size={28} />
            </div>
          </div>
          
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: '800', fill: '#cbd5e1'}} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 animate-in zoom-in-95">
                          <p className="text-[10px] font-black uppercase tracking-widest text-teal-400 mb-1">{payload[0].payload.name}</p>
                          <p className="text-lg font-black">{payload[0].value} Trips</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="trips" radius={[12, 12, 12, 12]} barSize={28}>
                  {statsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === statsData.length - 1 ? '#0ea5e9' : '#f1f5f9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 flex items-center justify-between p-5 bg-teal-50 rounded-[28px] border border-teal-100">
             <div className="flex items-center gap-3">
                <Sparkles size={20} className="text-teal-500" />
                <p className="text-[11px] font-bold text-teal-800 leading-snug">
                   Peak demand expected <span className="font-black">Friday PM</span>.<br/>Potential +20% revenue gain.
                </p>
             </div>
             <ChevronRight size={20} className="text-teal-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
