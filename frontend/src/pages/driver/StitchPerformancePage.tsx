/**
 * Stitch Performance Screen - Integrated Version
 * Based on GVBH Transportation Driver App
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  Star, 
  Calendar,
  Loader2,
  Sparkles,
  Target,
  ShieldCheck,
  Medal,
  Crown,
  Award,
  Home
} from 'lucide-react';
import StitchBottomNav from '../../components/StitchBottomNav';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

const data = [
  { name: 'Mon', trips: 4, earnings: 120 },
  { name: 'Tue', trips: 7, earnings: 210 },
  { name: 'Wed', trips: 5, earnings: 150 },
  { name: 'Thu', trips: 8, earnings: 240 },
  { name: 'Fri', trips: 6, earnings: 180 },
  { name: 'Sat', trips: 2, earnings: 60 },
  { name: 'Sun', trips: 0, earnings: 0 },
];

const milestones = [
  { id: 1, label: 'Safety Scout', status: 'completed', icon: ShieldCheck },
  { id: 2, label: 'Compliance King', status: 'completed', icon: Award },
  { id: 3, label: 'Platinum Guardian', status: 'current', icon: Medal },
  { id: 4, label: 'Fleet Legend', status: 'locked', icon: Crown },
];

const StitchPerformancePage: React.FC = () => {
  const navigate = useNavigate();
  const [aiInsight, setAiInsight] = useState<string | null>("Your on-time performance at Facility West is leading the fleet.");
  const [forecast, setForecast] = useState<{ earnings: string; tip: string }>({ 
    earnings: "$1,240.00", 
    tip: "Switch to morning shifts on Friday to capture dialysis peaks." 
  });
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const generateInsight = async () => {
    setIsLoadingInsight(true);
    // Simulated AI response
    setTimeout(() => {
      setAiInsight("Your on-time performance at Facility West is leading the fleet.");
      setForecast({ earnings: "$1,240.00", tip: "Switch to morning shifts on Friday to capture dialysis peaks." });
      setIsLoadingInsight(false);
    }, 1000);
  };

  return (
    <div className="bg-gray-50 flex flex-col max-w-md mx-auto min-h-screen">
      {/* Header */}
      <div className="bg-white px-8 py-8 border-b border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft size={32}/>
          </button>
          <h2 className="text-2xl font-black text-gray-900">Performance</h2>
        </div>
        <button onClick={generateInsight} className="p-3 bg-teal-50 text-teal-500 rounded-2xl active:scale-90 transition-all">
           {isLoadingInsight ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24}/>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-40">
        {/* Guardian Milestone Path */}
        <section className="space-y-4">
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Guardian Path Milestones</h3>
           <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm flex justify-between relative overflow-hidden">
              <div className="absolute top-1/2 left-8 right-8 h-1 bg-gray-50 -translate-y-1/2 rounded-full" />
              <div className="absolute top-1/2 left-8 w-[60%] h-1 bg-teal-500 -translate-y-1/2 rounded-full shadow-[0_0_10px_#14B8A6]" />
              {milestones.map((m) => (
                <div key={m.id} className="relative z-10 flex flex-col items-center gap-3">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl transition-all ${
                     m.status === 'completed' ? 'bg-teal-500 text-white' : 
                     m.status === 'current' ? 'bg-white text-teal-500 scale-110' : 
                     'bg-gray-100 text-gray-300'
                   }`}>
                      <m.icon size={24} className={m.status === 'current' ? 'animate-pulse' : ''} />
                   </div>
                   <span className={`text-[8px] font-black uppercase tracking-tighter text-center max-w-[50px] leading-tight ${
                     m.status === 'locked' ? 'text-gray-300' : 'text-gray-900'
                   }`}>{m.label}</span>
                </div>
              ))}
           </div>
        </section>

        {/* Earnings Forecast Card */}
        {forecast && (
          <div className="bg-gray-900 rounded-[48px] p-8 text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Target size={120} />
             </div>
             <div className="relative z-10 space-y-6">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Neural Forecast • Next Week</p>
                   <h3 className="text-5xl font-black leading-none">{forecast.earnings}</h3>
                </div>
                <div className="p-5 bg-white/10 rounded-[32px] border border-white/10 backdrop-blur-md">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="p-1.5 bg-teal-500 rounded-lg"><TrendingUp size={14}/></div>
                      <p className="text-[10px] font-black text-teal-300 uppercase tracking-widest">Growth Recommendation</p>
                   </div>
                   <p className="text-sm font-bold leading-relaxed">{forecast.tip}</p>
                </div>
             </div>
          </div>
        )}

        {/* Quality Score HUD */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white p-7 rounded-[40px] border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Compliance</p>
              <div className="flex items-baseline gap-1">
                 <span className="text-3xl font-black text-gray-900">98.4</span>
                 <span className="text-[10px] font-black text-green-500">%</span>
              </div>
              <div className="mt-4 h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                 <div className="h-full w-[98.4%] bg-green-500 shadow-[0_0_10px_#22c55e]" />
              </div>
           </div>
           <div className="bg-white p-7 rounded-[40px] border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg Rating</p>
              <div className="flex items-center gap-1.5">
                 <span className="text-3xl font-black text-gray-900">4.92</span>
                 <Star size={16} className="text-amber-400 fill-amber-400" />
              </div>
              <p className="text-[9px] font-black text-gray-400 uppercase mt-2">from 142 reviews</p>
           </div>
        </div>

        {/* Activity Heatmap Area */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Activity Trends</h3>
            <button className="text-[10px] font-black text-teal-500 uppercase tracking-widest flex items-center gap-1">
               <Calendar size={14} /> Month View
            </button>
          </div>
          <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '28px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                  cursor={{ stroke: '#14B8A6', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="earnings" stroke="#14B8A6" strokeWidth={4} fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Goals Progress */}
        <div className="p-8 bg-white rounded-[44px] border border-gray-100 shadow-sm space-y-6">
           <div className="flex justify-between items-center">
              <h4 className="text-lg font-black text-gray-900">Monthly Goal</h4>
              <span className="text-sm font-black text-teal-600">$4,200 / $5,000</span>
           </div>
           <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden">
              <div className="h-full w-[84%] bg-teal-500 rounded-full shadow-[0_0_10px_#14B8A6]" />
           </div>
        </div>

        <StitchBottomNav />
      </div>
    </div>
  );
};

export default StitchPerformancePage;
