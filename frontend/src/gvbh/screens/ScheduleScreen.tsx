
import React, { useState, useEffect } from 'react';
import { MOCK_TRIPS, COLORS } from '../constants';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Clock, MapPin, Sparkles, TrendingUp, ChevronRight as RightIcon, Map, AlertCircle } from 'lucide-react';
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
    <div className="pb-32 bg-gray-50 h-full overflow-y-auto no-scrollbar">
      {/* Compact Date Selector */}
      <div className="bg-white px-5 py-5 border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between mb-6 px-1">
          <button className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"><ChevronLeft size={18}/></button>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[15px]">
              <CalendarIcon size={16} className="text-teal-500" />
              <span>October 24, 2023</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Dispatch Log</span>
          </div>
          <button className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"><ChevronRight size={18}/></button>
        </div>

        <div className="flex justify-between px-1">
          {weekDays.map((date, i) => {
            const isSelected = date.getDate() === 24; 
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase">{['S','M','T','W','T','F','S'][date.getDay()]}</span>
                <button className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[12px] transition-all ${isSelected ? 'bg-teal-500 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}>
                  {date.getDate()}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-5 py-6 space-y-10">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timeline</h3>
          <button className="flex items-center gap-1 text-[9px] font-bold text-teal-500 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-teal-100 shadow-sm">
            <Filter size={12} /> Filter
          </button>
        </div>

        <div className="relative pl-8 space-y-10 before:content-[''] before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100 before:rounded-full">
          {MOCK_TRIPS.map((trip, idx) => (
            <div key={trip.id} className="relative">
              <div className={`absolute -left-[24px] top-4 w-[24px] h-[24px] rounded-full border-4 border-white shadow-md flex items-center justify-center ${idx === 0 ? 'bg-teal-500' : 'bg-slate-200'}`} />
              
              <div className={`bg-white p-5 rounded-2xl border transition-all ${idx === 0 ? 'border-teal-500 shadow-md' : 'border-gray-50 opacity-90'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-0.5">
                    <p className="text-[15px] font-bold text-slate-900 leading-none">{trip.scheduledTime}</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase">Appt: {trip.appointmentTime}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-widest ${idx === 0 ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-400'}`}>
                    {idx === 0 ? 'Next' : 'Queue'}
                  </span>
                </div>
                
                <h4 className="text-[15px] font-bold text-slate-800 mb-4 truncate">{trip.client.name}</h4>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1 shrink-0" />
                    <div className="min-w-0 flex-1">
                       <p className="text-[13px] font-medium text-slate-600 truncate">{trip.pickupAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0" />
                    <div className="min-w-0 flex-1">
                       <p className="text-[13px] font-medium text-slate-600 truncate">{trip.dropoffAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex gap-2">
                    {trip.equipmentRequired?.slice(0, 1).map((eq, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded-md text-slate-400 border border-slate-100">
                        <AlertCircle size={10} />
                        <span className="text-[8px] font-bold uppercase">{eq.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                  <button className="flex items-center gap-1.5 text-[10px] font-bold text-teal-500 uppercase tracking-widest">
                     Details <RightIcon size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Compact Forecast Banner */}
          <div className="bg-slate-900 rounded-2xl p-5 shadow-lg relative overflow-hidden">
             <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                   <TrendingUp size={20} className="text-teal-400" />
                </div>
                <div className="flex-1">
                   <p className="text-[9px] font-bold text-teal-400 uppercase tracking-widest mb-1">Network Intel</p>
                   <p className="text-[13px] font-medium text-white leading-snug">
                      {logisticsForecast || 'Syncing transit patterns...'}
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleScreen;
