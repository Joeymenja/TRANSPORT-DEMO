import React, { useState } from 'react';
import { Trip } from '../types';
import { ArrowLeft, Phone, Heart, Volume2, Zap, ChevronRight, MapPin, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { ttsService } from '../services/TTSService';

interface TripDetailScreenProps {
  trip: Trip;
  onBack: () => void;
  onStart: (id: string) => void;
}

const TripDetailScreen: React.FC<TripDetailScreenProps> = ({ trip, onBack, onStart }) => {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleSmartRecap = async () => {
    setIsSummarizing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Summarize in 10 words: "${trip.client.specialInstructions}"`,
      });
      setSummary(response.text || "Standard front door pickup.");
    } catch (e) { setSummary("Standard protocols required."); }
    finally { setIsSummarizing(false); }
  };

  return (
    <div className="fixed inset-0 z-[55] bg-white flex flex-col max-w-md mx-auto h-screen overflow-hidden">
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-50 shadow-sm">
        <button onClick={onBack} className="p-1 -ml-1 text-slate-400"><ArrowLeft size={20} /></button>
        <h2 className="text-[14px] font-bold uppercase tracking-tight">Mission Detail</h2>
        <div className="w-5" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 bg-slate-50/20">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center space-y-3">
          <div className="w-16 h-16 bg-teal-50 rounded-lg overflow-hidden mx-auto border border-slate-100">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${trip.client.name}`} className="w-full h-full" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-none">{trip.client.name}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">ID: {trip.client.memberId}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-teal-500 text-white py-2 rounded-lg font-bold text-[11px] uppercase flex items-center justify-center gap-1.5 shadow-sm"><Phone size={14} /> Call</button>
            <button onClick={handleSmartRecap} className="bg-white border border-teal-100 text-teal-500 py-2 rounded-lg font-bold text-[11px] uppercase flex items-center justify-center gap-1.5">{isSummarizing ? <Loader2 size={12} className="animate-spin"/> : <Zap size={12}/>} AI Recap</button>
          </div>

          <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100 text-left">
            <p className="text-[13px] font-medium text-amber-900 italic leading-snug">"{summary || trip.client.specialInstructions || "Standard dispatch procedures."}"</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
           <p className="text-[10px] font-bold text-slate-300 uppercase mb-3">Service Timeline</p>
           <div className="space-y-3">
              <div className="flex gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1" />
                 <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{trip.scheduledTime}</p>
                    <p className="text-[13px] font-bold text-slate-900 uppercase truncate">{trip.pickupAddress}</p>
                 </div>
              </div>
              <div className="flex gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1" />
                 <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Destination</p>
                    <p className="text-[13px] font-bold text-slate-900 uppercase truncate">{trip.dropoffAddress}</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="p-3 bg-white border-t border-slate-50 absolute bottom-0 left-0 right-0 max-w-md mx-auto">
        <button onClick={() => onStart(trip.id)} className="w-full bg-teal-500 text-white py-3 rounded-xl font-bold text-[13px] uppercase tracking-widest shadow-md">Start Trip</button>
      </div>
    </div>
  );
};

export default TripDetailScreen;