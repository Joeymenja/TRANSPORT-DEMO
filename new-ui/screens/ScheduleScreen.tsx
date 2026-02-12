
import React, { useState, useEffect } from 'react';
import { MOCK_TRIPS, COLORS } from '../constants';
// Added AlertCircle to fix 'Cannot find name AlertCircle' error
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Clock, MapPin, Sparkles, TrendingUp, AlertTriangle, UserCheck, Map, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const ScheduleScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [logisticsForecast, setLogisticsForecast] = useState<string | null>(null);
  
  const weekDays = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + i);
    return d;
  });

  const fetchLogisticsForecast = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Analyze a simulated daily schedule for an NEMT driver in Phoenix. Provide a 1-sentence 'Logistics Forecast' warning about potential delays from local events or traffic patterns. Be specific.",
        config: { systemInstruction: "You are a logistics expert assistant." }
      });
      setLogisticsForecast(response.text || "Traffic on I-17 is heavier than usual near downtown due to a morning stadium event.");
    } catch (e) {
      setLogisticsForecast("Expect localized delays near major medical centers due to high morning discharge volumes.");
    }
  };

  useEffect(() => {
    fetchLogisticsForecast();
  }, []);

  return (
    <div className="pb-20 bg-gray-50 h-full overflow-y-auto no-scrollbar">
      {/* Date Selector Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between mb-6 px-2">
          <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors"><ChevronLeft size={20}/></button>
          <div className="flex items-center gap-2 font-black text-gray-900">
            <CalendarIcon size={18} className="text-sky-500" />
            <span className="text-sm">October 24, 2023</span>
          </div>
          <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors"><ChevronRight size={20}/></button>
        </div>

        {/* Week Strip */}
        <div className="flex justify-between px-2">
          {weekDays.map((date, i) => {
            const isSelected = date.getDate() === 24; 
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  {['S','M','T','W','T','F','S'][date.getDay()]}
                </span>
                <button className={`w-10 h-10 rounded-[14px] flex items-center justify-center font-black transition-all ${isSelected ? 'bg-sky-500 text-white shadow-lg shadow-sky-100' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {date.getDate()}
                </button>
                {i % 3 === 0 && <div className="w-1 h-1 rounded-full bg-sky-300" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Content */}
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Operational Timeline</h3>
          <button className="flex items-center gap-1.5 text-[9px] font-black text-sky-500 uppercase tracking-widest bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100 shadow-sm">
            <Filter size={12} />
            Filter
          </button>
        </div>

        <div className="relative pl-10 space-y-10 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 before:rounded-full">
          {MOCK_TRIPS.map((trip, idx) => (
            <div key={trip.id} className="relative group">
              <div className={`absolute -left-[30px] top-2 w-[42px] h-[42px] rounded-2xl border-4 border-white shadow-2xl flex items-center justify-center transition-all ${idx === 0 ? 'bg-sky-500 scale-110' : 'bg-gray-300'}`}>
                {idx === 0 ? <Map size={20} className="text-white" /> : <Clock size={20} className="text-white" />}
              </div>
              
              <div className={`bg-white p-6 rounded-[36px] border transition-all ${idx === 0 ? 'border-sky-500 shadow-2xl shadow-sky-100/50' : 'border-gray-100 shadow-sm opacity-80'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-gray-900 tracking-tight">{trip.scheduledTime}</p>
                    <span className="text-[8px] font-black text-gray-300 uppercase">Appt: {trip.appointmentTime}</span>
                  </div>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${idx === 0 ? 'bg-sky-50 text-sky-600 border border-sky-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                    {idx === 0 ? 'Priority' : 'Scheduled'}
                  </span>
                </div>
                
                <h4 className="text-lg font-black text-gray-800 mb-4">{trip.client.name}</h4>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <div className="min-w-0">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">Pickup Location</p>
                       <p className="text-xs font-bold text-gray-600 line-clamp-1">{trip.pickupAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    <div className="min-w-0">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">Dropoff Facility</p>
                       <p className="text-xs font-bold text-gray-600 line-clamp-1">{trip.dropoffAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex gap-2">
                    {trip.equipmentRequired?.slice(0, 2).map((eq, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg text-gray-400 border border-gray-100">
                        <AlertCircle size={10} />
                        <span className="text-[8px] font-black uppercase tracking-tighter">{eq.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                  <button className="flex items-center gap-1.5 text-[9px] font-black text-sky-500 uppercase tracking-widest active:scale-95 transition-all">
                     View Brief <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Logistics Forecast Banner (Moved into scroll area) */}
          <div className="relative pt-4 opacity-90 pr-2">
             <div className="bg-gray-900 rounded-[36px] p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 -rotate-12 group-hover:scale-110 transition-transform">
                   <Sparkles size={80} className="text-white" />
                </div>
                <div className="flex items-start gap-4 relative z-10">
                   <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                      <TrendingUp size={22} className="text-sky-300" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.25em] mb-1.5">Traffic Intelligence</p>
                      <p className="text-sm font-bold text-white leading-relaxed">
                         {logisticsForecast || 'Analyzing local Phoenix transit patterns...'}
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleScreen;
