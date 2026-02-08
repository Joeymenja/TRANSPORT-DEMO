
import React, { useState } from 'react';
import { ArrowLeft, Zap, Calendar, Loader2, Sparkles, Download, ClipboardCheck, FileCheck } from 'lucide-react';
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
    <div className="fixed inset-0 z-[80] bg-slate-50 flex flex-col max-w-md mx-auto h-full overflow-hidden font-sans">
      <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-1 text-slate-400 active:scale-90"><ArrowLeft size={24}/></button>
          <h2 className="text-[14px] font-bold text-slate-900 tracking-tight uppercase">Audit Metrics</h2>
        </div>
        <button onClick={() => window.dispatchEvent(new CustomEvent('open-manual-report'))} className="p-2 bg-slate-900 text-white rounded-lg active:scale-90 shadow-md"><ClipboardCheck size={18}/></button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6 pb-32">
        {/* Reports Summary Card - Smaller Scale */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <FileCheck size={80} />
           </div>
           <div className="relative z-10 space-y-5">
              <div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-1">Cycle Log Submissions</p>
                 <h3 className="text-4xl font-black leading-none">142</h3>
              </div>
              <div className="flex gap-3">
                 <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/5 shadow-md">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Time</p>
                    <p className="text-[13px] font-bold">48.5h Logs</p>
                 </div>
                 <div className="bg-teal-500/20 px-4 py-2 rounded-xl border border-teal-500/10 shadow-md">
                    <p className="text-[8px] font-bold text-sky-300 uppercase tracking-widest mb-1">Audit Pass</p>
                    <p className="text-[13px] font-bold text-white">100% Score</p>
                 </div>
              </div>
           </div>
        </div>

        {/* AI Insight Card - Scaled down */}
        <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-50 space-y-4 relative overflow-hidden">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-teal-50 text-teal-500 rounded-lg shadow-inner"><Zap size={16} /></div>
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Neural Coach</h4>
              </div>
              <button onClick={fetchInsight} className="p-2 bg-slate-50 text-teal-500 rounded-lg active:scale-95 transition-all">
                 {isAnalyzing ? <Loader2 className="animate-spin" size={14}/> : <Sparkles size={14}/>}
              </button>
           </div>
           {insight && <p className="text-[12px] font-bold text-slate-800 leading-relaxed italic">"{insight}"</p>}
        </div>

        {/* Weekly Flow - Scaled down */}
        <section className="space-y-4">
           <div className="flex items-center justify-between px-1">
              <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">WEEKLY FLOW</h3>
              <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-50">
                 <Calendar size={12} className="text-teal-500" />
                 <span className="text-[9px] font-bold text-slate-700 uppercase">Current Cycle</span>
              </div>
           </div>
           <div className="bg-white p-4 rounded-2xl border border-slate-50 h-56 shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 800, fill: '#cbd5e1'}} />
                    <Bar dataKey="total" radius={[4, 4, 4, 4]} barSize={16}>
                       {data.map((entry, index) => (
                          <Cell key={index} fill={entry.total > 10 ? '#0ea5e9' : '#f1f5f9'} />
                       ))}
                    </Bar>
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px -5px rgb(0 0 0 / 0.1)', fontSize: '10px' }} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </section>
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 fixed bottom-0 left-0 right-0 max-w-md mx-auto shadow-lg z-30">
         <button className="w-full bg-teal-500 text-white font-bold py-4 rounded-xl shadow-md text-[13px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all">
            <Download size={18} /> Export Cycle PDF
         </button>
      </div>
    </div>
  );
};

export default ReportingStatsScreen;
