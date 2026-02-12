
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  Star, 
  Clock, 
  MapPin, 
  Calendar,
  ChevronRight,
  ChevronLeft,
  Filter,
  Award,
  Zap,
  Loader2,
  Sparkles,
  ArrowUpRight,
  Activity,
  Target,
  CheckCircle2,
  ShieldCheck,
  Medal,
  Crown,
  ClipboardCheck,
  Car,
  FileText,
  AlertCircle,
  X
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

interface PerformanceScreenProps {
  onBack: () => void;
}

const data = [
  { name: 'Mon', trips: 4 },
  { name: 'Tue', trips: 7 },
  { name: 'Wed', trips: 5 },
  { name: 'Thu', trips: 8 },
  { name: 'Fri', trips: 6 },
  { name: 'Sat', trips: 2 },
  { name: 'Sun', trips: 0 },
];

const PerformanceScreen: React.FC<PerformanceScreenProps> = ({ onBack }) => {
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [forecast, setForecast] = useState<{ count: string; tip: string } | null>(null);

  useEffect(() => {
    generateInsight();
  }, []);

  const generateInsight = async () => {
    setIsLoadingInsight(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Analyze NEMT driver stats: 98.4% compliance. 42 trips completed. Provide 1 weekly trip volume forecast. Format as JSON: {forecast: {count: string, tip: string}}",
        config: { responseMimeType: "application/json" }
      });
      const res = JSON.parse(response.text || '{}');
      setForecast(res.forecast);
    } catch (e) {
      setForecast({ count: "52 Trips", tip: "Expect high volume for therapy discharge drops on Thursday." });
    } finally {
      setIsLoadingInsight(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[65] bg-gray-50 flex flex-col max-w-md mx-auto h-screen">
      {/* Dark Notification Bar from Screenshot */}
      <div className="bg-[#0f172a] px-6 py-4 flex items-center justify-between text-white shadow-lg">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center">
               <AlertCircle size={16} />
            </div>
            <span className="text-sm font-bold">New Trip Request Received</span>
         </div>
         <button onClick={onBack} className="p-1"><X size={18}/></button>
      </div>

      <div className="bg-white px-8 py-6 border-b border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft size={32}/>
          </button>
          <h2 className="text-2xl font-black text-gray-900">Activity Trends</h2>
        </div>
        <button onClick={generateInsight} className="p-3 bg-sky-50 text-sky-500 rounded-2xl active:scale-90 transition-all">
           {isLoadingInsight ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24}/>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8 pb-32">
        {/* Trend Graph Area */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">ACTIVITY TRENDS</h3>
            <button className="text-[10px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-1 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100">
               <Calendar size={14} /> MONTH VIEW
            </button>
          </div>
          <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '28px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                />
                <Area type="monotone" dataKey="trips" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorTrips)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white p-7 rounded-[40px] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                 <ClipboardCheck size={14} className="text-sky-500" />
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">LOGS FILED</p>
              </div>
              <div className="flex items-baseline gap-1">
                 <span className="text-3xl font-black text-gray-900">42</span>
                 <span className="text-[10px] font-black text-green-500">TRIPS</span>
              </div>
           </div>
           <div className="bg-white p-7 rounded-[40px] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                 <ShieldCheck size={14} className="text-sky-500" />
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">COMPLIANCE</p>
              </div>
              <div className="flex items-center gap-1.5">
                 <span className="text-3xl font-black text-gray-900">98.4</span>
                 <span className="text-[10px] font-black text-sky-500">%</span>
              </div>
           </div>
        </div>

        {/* Goals Progress - Refined to counts only */}
        <div className="p-10 bg-white rounded-[44px] border border-gray-100 shadow-sm space-y-6">
           <div className="flex justify-between items-center">
              <h4 className="text-lg font-black text-gray-900 leading-none">Monthly Goal</h4>
              <span className="text-sm font-black text-sky-600">42 / 50 TRIPS</span>
           </div>
           <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
              <div className="h-full w-[84%] bg-sky-500 rounded-full shadow-[0_0_10px_#0ea5e9]" />
           </div>
        </div>

        {forecast && (
          <div className="bg-gray-900 rounded-[48px] p-8 text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Target size={120} />
             </div>
             <div className="relative z-10 space-y-6">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400 mb-2">Fleet Volume Forecast</p>
                   <h3 className="text-5xl font-black leading-none">{forecast.count}</h3>
                </div>
                <div className="p-5 bg-white/10 rounded-[32px] border border-white/10 backdrop-blur-md">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="p-1.5 bg-sky-500 rounded-lg"><Activity size={14}/></div>
                      <p className="text-[10px] font-black text-sky-300 uppercase tracking-widest">Efficiency Insight</p>
                   </div>
                   <p className="text-sm font-bold leading-relaxed">{forecast.tip}</p>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceScreen;
