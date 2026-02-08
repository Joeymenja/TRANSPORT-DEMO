
import React, { useState, useEffect } from 'react';
import { MOCK_TRIPS, COLORS } from '../constants';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Clock, MapPin, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const ScheduleScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [logisticsForecast, setLogisticsForecast] = useState<string | null>(null);
  
  // Generate week strip
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
    <div className="pb-20">
      {/* Date Selector Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-6">
          <button className="p-2 hover:bg-gray-50 rounded-full transition-colors"><ChevronLeft size={20}/></button>
          <div className="flex items-center gap-2 font-black text-gray-900">
            <CalendarIcon size={18} className="text-teal-500" />
            <span>October 24, 2023</span>
          </div>
          <button className="p-2 hover:bg-gray-50 rounded-full transition-colors"><ChevronRight size={20}/></button>
        </div>

        {/* Week Strip */}
        <div className="flex justify-between">
          {weekDays.map((date, i) => {
            const isSelected = date.getDate() === 24; // Mock selection
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {['S','M','T','W','T','F','S'][date.getDay()]}
                </span>
                <button className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${isSelected ? 'bg-teal-500 text-white shadow-lg shadow-teal-100' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {date.getDate()}
                </button>
                {i % 3 === 0 && <div className="w-1.5 h-1.5 rounded-full bg-sky-300" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Logistics Forecast Banner */}
      <div className="px-4 pt-4">
         <div className="bg-teal-900 rounded-[32px] p-5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12 group-hover:scale-110 transition-transform">
               <Sparkles size={64} className="text-white" />
            </div>
            <div className="flex items-start gap-4 relative z-10">
               <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                  <TrendingUp size={18} className="text-sky-300" />
               </div>
               <div>
                  <p className="text-[9px] font-black text-teal-400 uppercase tracking-[0.25em] mb-1">Daily Logistics Intel</p>
                  <p className="text-[11px] font-bold text-white leading-relaxed">
                     {logisticsForecast || 'Calculating daily route efficiency...'}
                  </p>
               </div>
            </div>
         </div>
      </div>

      {/* Timeline Content */}
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Today's Timeline</h3>
          <button className="flex items-center gap-1 text-[10px] font-black text-teal-500 uppercase tracking-widest">
            <Filter size={14} />
            Filter
          </button>
        </div>

        <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 before:rounded-full">
          {/* Timeline Items */}
          {MOCK_TRIPS.map((trip, idx) => (
            <div key={trip.id} className="relative">
              <div className={`absolute -left-8 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${idx === 0 ? 'bg-teal-500' : 'bg-gray-300'}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              
              <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm active:scale-[0.98] transition-transform">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-teal-500" />
                    <span className="text-sm font-black text-gray-900">{trip.scheduledTime}</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${idx === 0 ? 'bg-teal-50 text-teal-600' : 'bg-gray-50 text-gray-400'}`}>
                    {idx === 0 ? 'Next' : 'Upcoming'}
                  </span>
                </div>
                
                <h4 className="font-bold text-gray-800 mb-2">{trip.client.name}</h4>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    <p className="text-xs text-gray-500 line-clamp-1">{trip.pickupAddress}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <p className="text-xs text-gray-500 line-clamp-1">{trip.dropoffAddress}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex gap-2">
                    {trip.equipmentRequired?.map((eq, i) => (
                      <div key={i} className="p-1.5 bg-gray-50 rounded-lg text-gray-400" title={eq}>
                        <MapPin size={12} />
                      </div>
                    ))}
                  </div>
                  <button className="text-[10px] font-black text-teal-500 uppercase tracking-widest">Details</button>
                </div>
              </div>
            </div>
          ))}

          {/* Empty Slots */}
          <div className="py-4 flex items-center gap-4 opacity-40">
            <span className="text-[10px] font-black text-gray-400 uppercase">02:00 PM</span>
            <div className="flex-1 border-t border-dashed border-gray-300" />
            <span className="text-[10px] font-black text-gray-400 uppercase italic">Free Time</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleScreen;
