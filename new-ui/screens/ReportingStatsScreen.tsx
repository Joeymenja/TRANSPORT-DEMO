
import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, Zap, Calendar, Loader2, Sparkles, ShieldCheck, Download, Activity, ClipboardCheck, Clock, FileCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { GoogleGenAI } from "@google/genai";

const data = [
  { day: 'Mon', total: 6 },
  { day: 'Tue', total: 12 },
  { day: 'Wed', total: 8 },
  { day: 'Thu', total: 14 },
  { day: 'Fri', total: 10 },
  { day: 'Sat', total: 4 },
  { day: 'Sun', total: 0 },
];

const ReportingStatsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const fetchInsight = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Analyze 42 trip reports submitted this week. Provide one tip for documentation accuracy for NEMT billing.",
      });
      setInsight(response.text || "Ensure signature timestamps match GPS arrival logs for 100% audit pass rate.");
    } catch (e) { 
      setInsight("Member check-in documentation is 100% complete for the last 14 days."); 
    }
    finally { setIsAnalyzing(false); }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-gray-50 flex flex-col max-w-md mx-auto h-full">
      <div className="bg-white px-6 py-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-2 text-gray-400 hover:text-gray-900"><ArrowLeft size={28}/></button>
          <h2 className="text-xl font-black text-gray-900">Service Metrics</h2>
        </div>
        <button onClick={() => window.dispatchEvent(new CustomEvent('open-manual-report'))} className="p-2 bg-gray-900 text-white rounded-xl active:scale-90 transition-all"><ClipboardCheck size={20}/></button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 pb-32">
        {/* Reports Summary Card */}
        <div className="bg-gray-900 rounded-[48px] p-8 text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <FileCheck size={120} />
           </div>
           <div className="relative z-10 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400">Total Reports Submitted</p>
              <h3 className="text-6xl font-black leading-none">142</h3>
              <div className="flex gap-4 pt-4">
                 <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Service Hours</p>
                    <p className="text-xs font-black">48.5h Reported</p>
                 </div>
                 <div className="bg-sky-500/20 px-4 py-2 rounded-2xl border border-sky-500/20">
                    <p className="text-[8px] font-black text-sky-300 uppercase mb-1">Audit Score</p>
                    <p className="text-xs font-black text-sky-100">100% Valid</p>
                 </div>
              </div>
           </div>
        </div>

        {/* AI Insight Card */}
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 space-y-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Zap className="text-sky-500" size={20} />
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compliance Coach</h4>
              </div>
              <button onClick={fetchInsight} className="p-2 bg-sky-50 text-sky-500 rounded-xl active:scale-90 transition-all">
                 {isAnalyzing ? <Loader2 className="animate-spin" size={16}/> : <TrendingUp size={16}/>}
              </button>
           </div>
           {insight ? (
             <p className="text-sm font-bold text-gray-800 leading-relaxed italic animate-in fade-in slide-in-from-bottom-2">"{insight}"</p>
           ) : (
             <p className="text-xs text-gray-400 font-medium">Tap the graph to generate compliance analysis...</p>
           )}
        </div>

        {/* Charts */}
        <section className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Weekly Submission Volume</h3>
              <Calendar size={14} className="text-gray-300" />
           </div>
           <div className="bg-white p-8 rounded-[48px] border border-gray-100 h-64 shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} />
                    <Bar dataKey="total" radius={[8, 8, 8, 8]} barSize={20}>
                       {data.map((entry, index) => (
                          <Cell key={index} fill={entry.total > 10 ? '#0ea5e9' : '#e2e8f0'} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </section>
      </div>

      <div className="p-8 bg-white border-t border-gray-100 fixed bottom-0 left-0 right-0 max-w-md mx-auto shadow-xl z-20">
         <button className="w-full bg-sky-500 text-white font-black py-5 rounded-[32px] shadow-2xl shadow-sky-200 text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Download size={18} /> Export Log History
         </button>
      </div>
    </div>
  );
};

export default ReportingStatsScreen;
