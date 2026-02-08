
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
    <div className="fixed inset-0 z-[65] bg-gray-50 flex flex-col max-w-md mx-auto h-screen font-sans">
      {/* System Alert - Standard Scale */}
      <div className="bg-[#0f172a] px-5 py-3 flex items-center justify-between text-white shadow-lg">
         <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
               <AlertCircle size={14} />
            </div>
            <span className="text-[12px] font-bold uppercase tracking-tight">Assignment Request Ready</span>
         </div>
         <button onClick={onBack} className="p-1"><X size={16}/></button>
      </div>

      <div className="bg-white px-5 py-4 border-b border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft size={24}/>
          </button>
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Trends</h2>
        </div>
        <button onClick={generateInsight} className="p-2.5 bg-teal-50 text-teal-500 rounded-xl active:scale-90 transition-all">
           {isLoadingInsight ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20}/>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6 pb-32">
        {/* Trend Graph - Adjusted Dimensions */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ACTIVITY TRENDS</h3>
            <button className="text-[9px] font-bold text-teal-500 uppercase tracking-widest flex items-center gap-1.5 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100 shadow-sm">
               <Calendar size={12} /> CYCLE VIEW
            </button>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 800, fill: '#cbd5e1'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px -5px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="trips" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorTrips)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
           <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                 <ClipboardCheck size={12} className="text-teal-500" />
                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">UNIT COUNT</p>
              </div>
              <div className="flex items-baseline gap-1">
                 <span className="text-2xl font-black text-gray-900">42</span>
                 <span className="text-[10px] font-bold text-green-500">TRIPS</span>
              </div>
           </div>
           <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                 <ShieldCheck size={12} className="text-teal-500" />
                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">HEALTH</p>
              </div>
              <div className="flex items-center gap-1.5">
                 <span className="text-2xl font-black text-gray-900">98.4</span>
                 <span className="text-[10px] font-bold text-teal-500">%</span>
              </div>
           </div>
        </div>

        {/* Goals Progress - Standardized Scale */}
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
           <div className="flex justify-between items-center">
              <h4 className="text-[13px] font-bold text-gray-900 leading-none">Monthly Goal</h4>
              <span className="text-[11px] font-bold text-teal-600">42 / 50 UNITS</span>
           </div>
           <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
              <div className="h-full w-[84%] bg-teal-500 rounded-full shadow-sm" />
           </div>
        </div>

        {forecast && (
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <Target size={80} />
             </div>
             <div className="relative z-10 space-y-4">
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-1.5">Volume Forecast</p>
                   <h3 className="text-4xl font-black leading-none">{forecast.count}</h3>
                </div>
                <div className="p-4 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
                   <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="p-1 bg-teal-500 rounded-md shadow-sm"><Activity size={12}/></div>
                      <p className="text-[9px] font-bold text-sky-300 uppercase tracking-widest">Neural Insight</p>
                   </div>
                   <p className="text-[12px] font-bold leading-relaxed text-white/90 italic">"{forecast.tip}"</p>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceScreen;
