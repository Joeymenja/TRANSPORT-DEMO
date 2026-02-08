
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { GoogleGenAI } from "@google/genai";
import { tripApi } from '../../api/trips';
import { 
  ArrowLeft, 
  Navigation, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Clock, 
  Zap, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Compass
} from 'lucide-react';
import DriverMap from '../../components/dashboard/DriverMap';

export default function HeadingToPickupPage() {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [aiInsight, setAiInsight] = useState<{ advice: string; etaAdjustment: string } | null>(null);
    const [isAnalyzingRoute, setIsAnalyzingRoute] = useState(false);

    const { data: trip } = useQuery({
        queryKey: ['trip', tripId],
        queryFn: () => tripApi.getTripById(tripId!),
        enabled: !!tripId
    });

    const pickupStop = trip?.stops?.find((s: any) => s.stopType === 'PICKUP');
    const pickupLocation = pickupStop?.address || "Unknown Location";
    const clientName = trip?.members?.[0]?.member ? `${trip.members[0].member.firstName} ${trip.members[0].member.lastName}` : "Member";

    useEffect(() => {
        const analyzeRoute = async () => {
            if (!trip) return;
            setIsAnalyzingRoute(true);
            try {
                if (process.env.API_KEY) {
                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.0-flash',
                        contents: `Analyze route to pickup at ${pickupLocation}. Provide short navigation advice and traffic impact. JSON: {advice: string, etaAdjustment: string}`,
                        config: { responseMimeType: "application/json" }
                    });
                    setAiInsight(JSON.parse(response.text() || '{}'));
                } else { throw new Error("No Key"); }
            } catch (e) {
                setAiInsight({ advice: "Tactical route optimal. Maintain speed on McDowell Rd.", etaAdjustment: "-1 min" });
            } finally { setIsAnalyzingRoute(false); }
        };
        analyzeRoute();
    }, [trip, pickupLocation]);

    if (!trip) return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
      </div>
    );

    return (
        <div className="h-screen w-full bg-gray-50 flex flex-col overflow-hidden font-sans relative">
            
            {/* Full Screen Navigation Layer */}
            <div className="absolute inset-0 z-0">
               <DriverMap activeTrip={trip} showNavigation={true} />
            </div>

            {/* Tactical Navigation Overlay (Top) */}
            <div className="absolute top-6 left-6 right-6 z-50 animate-in slide-in-from-top duration-700">
               <div className="bg-gray-900/95 backdrop-blur-xl rounded-[32px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden">
                  <div className="p-6 flex items-center gap-6">
                     <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center text-gray-950 shadow-lg shadow-teal-500/20">
                        <Compass size={32} />
                     </div>
                     <div className="flex-1">
                        <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1">Navigation Intel • 0.4 mi</p>
                        <h3 className="text-xl font-black text-white tracking-tight">Turn right onto Broadway</h3>
                     </div>
                  </div>
                  
                  {/* AI Insight Channel */}
                  <div className="bg-teal-500/10 border-t border-white/5 p-4 flex items-center gap-4">
                     {isAnalyzingRoute ? (
                        <>
                           <div className="animate-spin text-teal-400"><Sparkles size={16} /></div>
                           <span className="text-[9px] font-black text-teal-400 uppercase tracking-widest">Processing Tactical Data...</span>
                        </>
                     ) : aiInsight && (
                        <>
                           <Sparkles size={16} className="text-teal-400 shrink-0" />
                           <p className="text-[11px] font-bold text-teal-300 leading-tight flex-1">{aiInsight.advice}</p>
                           <div className="px-3 py-1 bg-teal-500 text-gray-950 rounded-lg text-[9px] font-black uppercase">
                              {aiInsight.etaAdjustment}
                           </div>
                        </>
                     )}
                  </div>
               </div>
            </div>

            <div className="absolute top-40 left-6 z-50 flex flex-col gap-4">
                <button 
                  onClick={() => navigate(-1)} 
                  className="p-3.5 bg-white rounded-2xl shadow-xl border border-gray-100 active:scale-95 transition-all"
                >
                  <ArrowLeft size={22} className="text-gray-900" />
                </button>
            </div>

            {/* HUD Mission Card (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-50">
               <div className="bg-white rounded-[44px] shadow-[0_20px_80px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden animate-in slide-in-from-bottom duration-700">
                  <div className="p-8 pb-4">
                     <div className="w-12 h-1 bg-gray-100 rounded-full mx-auto mb-6" />
                     
                     <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-2xl font-black text-teal-500 border-4 border-white shadow-xl">
                              {clientName.charAt(0)}
                           </div>
                           <div>
                              <h4 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">Target Pickup</h4>
                              <p className="text-sm font-bold text-gray-400">{clientName}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-3xl font-black text-teal-500 tracking-tighter">12 <span className="text-xs text-gray-400 uppercase tracking-widest">Min</span></p>
                           <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">3.4 Miles Remaining</p>
                        </div>
                     </div>

                     <div className="flex gap-3 mb-8">
                        <button className="flex-1 bg-gray-50 p-4 rounded-2xl flex items-center justify-center gap-2 text-gray-400 hover:text-teal-500 transition-colors">
                           <Phone size={18} />
                        </button>
                        <button className="flex-1 bg-gray-50 p-4 rounded-2xl flex items-center justify-center gap-2 text-gray-400 hover:text-teal-500 transition-colors">
                           <MessageSquare size={18} />
                        </button>
                        <div className="flex-[3] bg-gray-50 p-4 rounded-2xl flex items-center gap-3 border border-gray-100/50">
                           <MapPin size={18} className="text-teal-400" />
                           <span className="text-[11px] font-bold text-gray-600 truncate">{pickupLocation}</span>
                        </div>
                     </div>
                  </div>

                  <div className="p-8 pt-4 bg-gray-50 border-t border-gray-100">
                     <button 
                         onClick={() => navigate(`/driver/trips/${tripId}/arrived`)}
                         className="w-full bg-gray-900 text-white rounded-[28px] py-6 font-black text-xs uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                     >
                       <Zap size={20} className="text-teal-400" />
                       Confirm Field Arrival
                     </button>
                  </div>
               </div>
            </div>

        </div>
    );
}
