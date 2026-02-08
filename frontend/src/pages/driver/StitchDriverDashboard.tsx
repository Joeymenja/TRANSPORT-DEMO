/**
 * Stitch Driver Dashboard - Integrated Version
 * 
 * Based on the GVBH Transportation Driver App export with:
 * - Sky blue primary color (#0ea5e9)
 * - Neural Operations Hub with City Intelligence Pulse
 * - Map with demand hotspots
 * - Guardian status HUD
 * - Break Intelligence with AI Health Copilot
 * - Connected to TRANSPORT-DEMO backend
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth';
import { tripApi, Trip } from '../../api/trips';
import { 
  RefreshCw, 
  Bell, 
  TrendingUp, 
  ChevronDown, 
  Mic, 
  Zap, 
  Loader2, 
  Sparkles, 
  Navigation,
  Heart,
  Activity,
  MapPin,
  ArrowUpRight,
  ChevronRight,
  Coffee,
  BatteryCharging,
  ShieldCheck,
  Menu as MenuIcon
} from 'lucide-react';
import StitchBottomNav from '../../components/StitchBottomNav';
import StitchSidebar from '../../components/StitchSidebar';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { GoogleGenAI } from "@google/genai";

const COLORS = {
  primary: '#14b8a6', // Teal 500 (Changed from Sky)
  secondary: '#0ea5e9', // Sky 500 (Changed from Teal)
  accent: '#f59e0b', // Amber 500
  danger: '#ef4444', // Red 500
  success: '#10b981', // Emerald 500
  neutral: '#64748b', // Slate 500
};

const statsData = [
  { name: 'Mon', trips: 4 },
  { name: 'Tue', trips: 7 },
  { name: 'Wed', trips: 5 },
  { name: 'Thu', trips: 8 },
  { name: 'Fri', trips: 6 },
];

const StitchDriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [status, setStatus] = useState<'available' | 'break' | 'off'>('available');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cityPulse, setCityPulse] = useState<{ intel: string; risk: 'low' | 'med' | 'high'; impact: string } | null>(null);
  const [isRefreshingPulse, setIsRefreshingPulse] = useState(false);
  const [demandHotspots, setDemandHotspots] = useState<{ location: string; intensity: string; reason: string }[]>([]);
  const [breakInsight, setBreakInsight] = useState<{ title: string; desc: string; type: string } | null>(null);
  const [isLoadingBreak, setIsLoadingBreak] = useState(false);
  const [tips, setTips] = useState<{ id: string, title: string, content: string, icon: any, color: string }[]>([
    { 
      id: '1', 
      title: 'Proximity Intel', 
      content: 'I-10 E is backing up at 24th St. Use Buckeye Rd for your 10 AM medical pickup.', 
      icon: MapPin, 
      color: '#14b8a6' 
    },
    { 
      id: '2', 
      title: 'Wellness Check', 
      content: 'High UV index today. Keep water in the cab and stay hydrated between legs.', 
      icon: Coffee, 
      color: '#f59e0b' 
    },
    { 
      id: '3', 
      title: 'Compliance Tip', 
      content: 'AHCCCS requires signatures to be legible. Use the stylus for better precision.', 
      icon: ShieldCheck, 
      color: '#0ea5e9' 
    },
    { 
      id: '4', 
      title: 'Earnings Boost', 
      content: 'Complete your daily logs within 30 mins of shift end for a $5 prompt-reporting bonus.', 
      icon: Zap, 
      color: '#2dd4bf' 
    }
  ]);

  // Fetch trips from backend
  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['driver-trips'],
    queryFn: async () => {
      const response = await tripApi.getTrips();
      return response.filter((t: Trip) => 
        t.status === 'SCHEDULED' || t.status === 'IN_PROGRESS' || t.status === 'PENDING_APPROVAL'
      );
    }
  });

  const fetchCityPulse = async () => {
    setIsRefreshingPulse(true);
    try {
      // Use real AI if key is available, fallback to simulation
      if (process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash', 
          contents: "Analyze Phoenix NEMT demand data. Provide a 'City Pulse' update and 2 current high-demand 'Hotspots' for medical pickups. Format as JSON: {pulse: {intel: string, risk: 'low'|'med'|'high', impact: string}, hotspots: [{location: string, intensity: string, reason: string}]}",
          config: { responseMimeType: "application/json" }
        });
        const data = JSON.parse(response.text() || '{}');
        setCityPulse(data.pulse);
        setDemandHotspots(data.hotspots || []);
      } else {
        throw new Error("No API Key");
      }
    } catch (e) {
      console.warn("AI City Pulse failed, using fallback", e);
      // Fallback data
      setCityPulse({ 
        intel: "Heavy congestion on I-10 Westbound near 7th St.", 
        risk: "med", 
        impact: "Expect 12-minute delays." 
      });
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
      if (process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: "The driver is currently on a 30-minute break in Scottsdale, AZ. Suggest a wellness activity or logistics tip. Format as JSON: {title: string, desc: string, type: 'wellness'|'logistics'|'rest'}",
          config: { responseMimeType: "application/json" }
        });
        setBreakInsight(JSON.parse(response.text() || '{}'));
      } else {
        throw new Error("No API Key");
      }
    } catch (e) {
      console.warn("AI Break Insight failed, using fallback", e);
      setBreakInsight({ 
        title: "Stretch & Refresh", 
        desc: "Perform a 5-minute seated ergonomic stretch to stay alert for your next trip.", 
        type: "wellness" 
      });
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

  const handleStartTrip = (tripId: string) => {
    navigate(`/driver/trips/${tripId}/execute`);
  };

  const handleViewTrip = (tripId: string) => {
    navigate(`/driver/trips/${tripId}`);
  };

  const handleOpenPerformance = () => {
    navigate('/driver/logs');
  };


  // Get first trip for priority dispatch
  const priorityTrip = trips[0];
  const firstMember = priorityTrip?.members?.[0];
  const pickupStop = priorityTrip?.stops?.find((s: any) => s.stopType === 'PICKUP');

  return (
    <div className="pb-40 bg-gray-50 min-h-screen">
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
              <div className={`w-3 h-3 rounded-full ${spot.intensity === 'High' ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 'bg-teal-500 shadow-[0_0_15px_#14b8a6]'}`} />
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
            <div className="absolute top-full left-0 mt-3 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden w-64 z-50">
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

        {/* Action Header */}
        <div className="absolute top-6 right-6 z-20 flex gap-3">
          <button className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl border border-white/50 relative active:scale-95 transition-all">
            <Bell size={22} className="text-gray-900" />
            <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl border border-white/50 active:scale-95 transition-all text-gray-900"
          >
            <MenuIcon size={22} />
          </button>
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
            <div className="text-5xl font-black text-gray-900 tracking-tight">{trips.length || 0}</div>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-600 font-black uppercase tracking-widest">Active Driver</span>
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

        {/* Operational Tip Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Operational Tips</h3>
            <span className="text-[10px] font-bold text-teal-500 bg-teal-50 px-2 py-1 rounded-lg">AI Generated</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
            {tips.map((tip) => (
              <div 
                key={tip.id}
                className="min-w-[280px] bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-3 shrink-0"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: `${tip.color}15`, color: tip.color }}>
                    <tip.icon size={18} />
                  </div>
                  <h4 className="text-sm font-black text-gray-900">{tip.title}</h4>
                </div>
                <p className="text-xs font-medium text-gray-500 leading-relaxed">
                  {tip.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Guardian Status HUD */}
        <div className="bg-gray-900 rounded-[36px] p-6 flex items-center justify-between border border-white/10 shadow-2xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(20,184,166,0.3)]">
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
           <div className="bg-indigo-900 rounded-[48px] p-8 text-white shadow-2xl relative overflow-hidden">
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
                    <div className="space-y-6">
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
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-teal-500" size={32} />
                </div>
              ) : priorityTrip ? (
                <div onClick={() => handleViewTrip(priorityTrip.id)} className="flex items-center gap-6">
                   <div className="relative">
                      <div className="w-20 h-20 bg-gray-50 rounded-[32px] overflow-hidden border-4 border-white shadow-2xl relative z-10 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                         <span className="text-3xl font-black text-teal-500">
                           {firstMember?.firstName?.charAt(0) || 'M'}
                         </span>
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-teal-500 text-white p-2 rounded-xl z-20 shadow-lg"><Heart size={14} className="fill-white" /></div>
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-2 truncate">
                        {firstMember?.firstName || 'Member'} {firstMember?.lastName || ''}
                      </h4>
                      <div className="flex items-center gap-2">
                         <div className="p-1.5 bg-gray-50 text-gray-400 rounded-lg"><MapPin size={14} /></div>
                         <p className="text-sm font-bold text-gray-500 truncate">
                           {pickupStop?.address?.split(',')[0] || 'Pickup location'}
                         </p>
                    </div>
                 </div>
                 <button 
                   onClick={(e) => { e.stopPropagation(); handleStartTrip(priorityTrip.id); }} 
                   className="w-16 h-16 bg-gray-900 text-white rounded-[28px] flex items-center justify-center shadow-2xl hover:bg-teal-500 transition-colors active:scale-90"
                 >
                    <Navigation size={28} />
                 </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 font-bold">No trips scheduled</p>
                <p className="text-xs text-gray-300 mt-1">Check back later for assignments</p>
              </div>
            )}
         </div>
         )}
      </div>


      {/* Side Menu */}
      <StitchSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        user={user} 
      />

      {/* Bottom Navigation */}
      <StitchBottomNav />
    </div>
  );
};

export default StitchDriverDashboard;
