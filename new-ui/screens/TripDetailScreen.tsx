import React, { useState, useEffect, useRef } from 'react';
import { Trip } from '../types';
import { 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Phone, 
  User, 
  Info, 
  FileText, 
  ShieldCheck, 
  Clock,
  MoreVertical,
  Calendar,
  Volume2,
  Loader2,
  Accessibility,
  HeartPulse,
  Siren,
  Copy,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  XCircle,
  Paperclip,
  ChevronRight,
  Zap,
  CheckCircle2,
  Sparkles,
  Users,
  RefreshCw,
  X,
  Edit,
  Map as MapIcon,
  Play,
  Pause,
  Maximize,
  HelpCircle,
  ParkingCircle
} from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";

interface TripDetailScreenProps {
  trip: Trip;
  onBack: () => void;
  onStart: (id: string) => void;
}

const TripDetailScreen: React.FC<TripDetailScreenProps> = ({ trip, onBack, onStart }) => {
  const [activeTab, setActiveTab] = useState<'briefing' | 'route'>('briefing');
  
  // Briefing State
  const [isReading, setIsReading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [smartSummary, setSmartSummary] = useState<string[] | null>(null);
  const [showCareInsights, setShowCareInsights] = useState(false);
  const [careInsights, setCareInsights] = useState<any>(null);
  const [isLoadingCare, setIsLoadingCare] = useState(false);
  const [showModModal, setShowModModal] = useState(false);

  // Route Scout State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  // Audio Decoding
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // --- Briefing Methods ---

  const generateSmartSummary = async () => {
    if (isSummarizing) return;
    setIsSummarizing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze these NEMT trip instructions and distill them into 3-4 ultra-concise, actionable bullet points for the driver. Instructions: ${trip.client.specialInstructions || 'Client requires door-to-door assist and has oxygen equipment.'}`,
        config: { systemInstruction: "You are a specialized dispatcher assistant for NEMT drivers. Provide only clear, short bullet points. Do not include introductory text." }
      });
      const text = response.text || "";
      const points = text.split('\n').filter(p => p.trim()).map(p => p.replace(/^[*-]\s*/, ''));
      setSmartSummary(points);
    } catch (e) {
      console.error("Gemini Error:", e);
    } finally {
      setIsSummarizing(false);
    }
  };

  const fetchCareInsights = async () => {
    setIsLoadingCare(true);
    setShowCareInsights(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on a history of 45 trips, generate a sensitivity profile for NEMT member ${trip.client.name}. Include: Preferences (temp, music), Communication style, and Mobility tip. Format as JSON: {temp: string, vibe: string, mobility: string, mood: string}`,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || '{}');
      setCareInsights(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingCare(false);
    }
  };

  const readInstructionsAloud = async () => {
    if (isReading) return;
    setIsReading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Read these NEMT trip instructions clearly for a driver: ${trip.client.specialInstructions || 'No special instructions provided.'}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const bytes = decode(base64Audio);
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.onended = () => setIsReading(false);
        source.start();
      } else {
        setIsReading(false);
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setIsReading(false);
    }
  };

  const handleOpenChat = () => {
    const event = new CustomEvent('open-chat', { 
      detail: { id: trip.id, name: 'Dispatch Center', online: true } 
    });
    window.dispatchEvent(event);
  };

  // --- Route Scout Methods ---

  useEffect(() => {
    let interval: any;
    if (isSimulating) {
      interval = setInterval(() => {
        setSimProgress(prev => {
          if (prev >= 100) {
            setIsSimulating(false);
            return 100;
          }
          return prev + 1;
        });
      }, 50); // 5 seconds for full route
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  const askCoPilot = async () => {
    if (!question.trim()) return;
    setIsAsking(true);
    setAnswer(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are an expert NEMT route planner. Answer this specific driver question about the destination "${trip.dropoffAddress}": "${question}". Keep it short and logistical.`,
      });
      setAnswer(response.text || "Information not available at this time.");
    } catch (e) {
      setAnswer("Unable to retrieve facility details right now.");
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[55] bg-gray-50 flex flex-col max-w-md mx-auto h-screen">
      {/* Header */}
      <div className="bg-white px-6 py-6 flex items-center justify-between border-b border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
          <ArrowLeft size={28} />
        </button>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
           <button 
             onClick={() => setActiveTab('briefing')}
             className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'briefing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
           >
             Briefing
           </button>
           <button 
             onClick={() => setActiveTab('route')}
             className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'route' ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
           >
             Route Scout
           </button>
        </div>
        <button 
          onClick={() => setShowModModal(true)} 
          className="p-2 -mr-2 text-gray-400 active:bg-gray-50 rounded-full transition-colors"
        >
          <Edit size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 pb-40">
        
        {/* === BRIEFING TAB === */}
        {activeTab === 'briefing' && (
          <>
            {/* Status & Trip Type */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                <span className="text-[11px] font-black text-gray-700 uppercase tracking-widest">{trip.status}</span>
              </div>
              <div className="flex gap-2">
                 <div className="bg-sky-50 text-sky-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight border border-sky-100">
                   {trip.type} RIDE
                 </div>
                 {trip.type === 'CARPOOL' && (
                   <div className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 border border-indigo-100 shadow-sm">
                     <Users size={12} /> {trip.passengers?.length} PAX
                   </div>
                 )}
              </div>
            </div>

            {/* Client Core Profile */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden group">
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-sky-50 rounded-[34px] flex items-center justify-center text-sky-500 border-4 border-white shadow-xl relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${trip.client.name}`} alt="Member" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-black text-gray-900 leading-none tracking-tight">{trip.client.name}</h3>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-100">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Member ID</p>
                         <p className="text-xs font-black text-gray-700">{trip.client.memberId}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2.5 py-4 bg-sky-500 text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-sky-100">
                    <Phone size={18} /> Call Member
                  </button>
                  <button 
                    onClick={fetchCareInsights}
                    className="flex items-center justify-center gap-2.5 py-4 bg-white border-2 border-sky-100 rounded-[24px] text-sky-600 font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-sm"
                  >
                    <Sparkles size={18} /> Care Insights
                  </button>
                </div>
              </div>
              
              <div className="bg-amber-50/50 p-8 border-t border-amber-100">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-200"><HeartPulse size={16} /></div>
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Special Handling</p>
                  </div>
                  <div className="flex gap-2.5">
                    <button 
                      onClick={generateSmartSummary}
                      className="flex items-center gap-2 bg-sky-500 px-4 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-sky-200"
                    >
                      {isSummarizing ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                      Smart Recap
                    </button>
                    <button 
                      onClick={readInstructionsAloud}
                      className="p-2 bg-amber-200/50 text-amber-700 rounded-full active:scale-90 transition-all border border-amber-300/30"
                    >
                      {isReading ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
                    </button>
                  </div>
                </div>

                {smartSummary ? (
                  <div className="space-y-3">
                    {smartSummary.map((point, i) => (
                      <div key={i} className="flex items-start gap-4 bg-white p-4 rounded-2xl border border-amber-200 shadow-sm">
                        <CheckCircle2 size={16} className="text-sky-500 mt-0.5 shrink-0" />
                        <p className="text-sm font-bold text-gray-800 leading-tight">{point}</p>
                      </div>
                    ))}
                    <button onClick={() => setSmartSummary(null)} className="text-[10px] font-black text-sky-600 uppercase tracking-widest mt-3 ml-2 flex items-center gap-1.5">
                       <ChevronRight size={14} className="rotate-180" /> Show Original Detail
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-white/40 rounded-2xl border border-amber-100 border-dashed">
                     <p className="text-sm text-amber-900 font-bold leading-relaxed italic">"{trip.client.specialInstructions || 'No special instructions provided for this member.'}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule & Route Panel */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Geographic Context</h4>
              <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Navigation size={120} />
                </div>
                <div className="flex gap-6 relative">
                  <div className="flex flex-col items-center gap-2 mt-1 z-10">
                    <div className="w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-lg shadow-green-200" />
                    <div className="w-1 h-28 bg-gray-100 rounded-full" />
                    <div className="w-4 h-4 rounded-full bg-red-500 border-4 border-white shadow-lg shadow-red-200" />
                  </div>
                  <div className="space-y-10 flex-1">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                         <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Departure ({trip.scheduledTime})</p>
                         <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">ON TIME</span>
                      </div>
                      <p className="text-base font-black text-gray-900 leading-tight">{trip.pickupAddress}</p>
                      <p className="text-[11px] text-sky-600 font-black uppercase mt-2 tracking-widest flex items-center gap-1.5">
                         <MapPin size={12} /> {trip.pickupFacility || 'Residential Pickpoint'}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                         <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Arrival (Appt: {trip.appointmentTime})</p>
                         <span className="text-[10px] font-black text-gray-300 bg-gray-50 px-2 py-0.5 rounded-lg">CALCULATING</span>
                      </div>
                      <p className="text-base font-black text-gray-900 leading-tight">{trip.dropoffAddress}</p>
                      <p className="text-[11px] text-sky-600 font-black uppercase mt-2 tracking-widest flex items-center gap-1.5">
                         <MapPin size={12} /> {trip.dropoffFacility || 'Medical Destination'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* === ROUTE SCOUT TAB === */}
        {activeTab === 'route' && (
          <div className="space-y-6">
             <div className="bg-gray-900 rounded-[40px] p-6 text-white shadow-2xl relative overflow-hidden">
                {/* Simulated Map View */}
                <div className="h-48 w-full bg-gray-800 rounded-[32px] mb-6 relative overflow-hidden">
                   <img src="https://picsum.photos/seed/route_preview/800/400" className="w-full h-full object-cover opacity-60 grayscale" />
                   
                   {/* Simulation Path */}
                   <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                      <path 
                        d="M 40,150 C 100,150 150,50 300,50" 
                        stroke="#0ea5e9" 
                        strokeWidth="4" 
                        fill="none" 
                        strokeDasharray="5"
                        className="animate-pulse"
                      />
                      {/* Moving Marker */}
                      <circle cx="0" cy="0" r="6" fill="white" className="shadow-lg">
                         <animateMotion 
                           dur={isSimulating ? "5s" : "0s"} 
                           repeatCount="1" 
                           path="M 40,150 C 100,150 150,50 300,50" 
                           fill="freeze"
                           keyPoints={isSimulating ? "0;1" : `${simProgress/100};${simProgress/100}`}
                           keyTimes="0;1"
                           calcMode="linear"
                         />
                      </circle>
                   </svg>

                   <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-sky-400">Preview Mode</p>
                   </div>
                </div>

                <div className="flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Simulated Duration</p>
                      <p className="text-2xl font-black">{trip.estimatedDuration} Minutes</p>
                   </div>
                   <button 
                     onClick={() => { setIsSimulating(!isSimulating); if(!isSimulating) setSimProgress(0); }}
                     className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-all"
                   >
                      {isSimulating ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                   </button>
                </div>
             </div>

             <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                   <MapIcon size={20} className="text-sky-500" />
                   Arrival Logic
                </h3>
                <div className="space-y-6">
                   <div className="flex items-start gap-4">
                      <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl"><ParkingCircle size={20} /></div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Parking</p>
                         <p className="text-sm font-bold text-gray-800">Garage B, Level 2 (Medical Staff)</p>
                         <p className="text-xs text-gray-500 mt-1">Height Clearance: 8'2"</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><Zap size={20} /></div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gate Code</p>
                         <p className="text-2xl font-black text-gray-900 tracking-widest">#4589</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-sky-50 rounded-[40px] p-8 border border-sky-100">
                <div className="flex items-center gap-3 mb-4">
                   <div className="p-2 bg-white rounded-xl shadow-sm"><HelpCircle size={18} className="text-sky-500"/></div>
                   <h3 className="text-sm font-black text-sky-800 uppercase tracking-widest">Ask Co-Pilot</h3>
                </div>
                
                {answer && (
                   <div className="mb-6 p-4 bg-white rounded-2xl border border-sky-100 animate-in fade-in slide-in-from-bottom-2">
                      <p className="text-sm font-medium text-gray-700 leading-relaxed">{answer}</p>
                   </div>
                )}

                <div className="relative">
                   <input 
                     type="text" 
                     value={question}
                     onChange={(e) => setQuestion(e.target.value)}
                     placeholder='e.g., "Where is the wheelchair ramp?"'
                     className="w-full pl-5 pr-14 py-4 bg-white border border-sky-200 rounded-[24px] text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:ring-4 focus:ring-sky-200 transition-all"
                   />
                   <button 
                     onClick={askCoPilot}
                     className="absolute right-2 top-2 bottom-2 w-10 bg-sky-500 rounded-[18px] flex items-center justify-center text-white active:scale-90 transition-all"
                   >
                      {isAsking ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={20} />}
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* Secondary Actions (Briefing Only) */}
        {activeTab === 'briefing' && (
          <div className="grid grid-cols-2 gap-4 pb-12">
             <button 
               onClick={handleOpenChat}
               className="flex items-center justify-center gap-3 py-5 bg-white border border-gray-100 rounded-[28px] text-sky-600 font-black text-[11px] uppercase tracking-widest active:scale-95 shadow-sm transition-all"
             >
                <div className="p-2 bg-sky-50 rounded-xl"><MessageSquare size={18} /></div> Dispatch
             </button>
             <button className="flex items-center justify-center gap-3 py-5 bg-white border border-gray-100 rounded-[28px] text-red-600 font-black text-[11px] uppercase tracking-widest active:scale-95 shadow-sm transition-all">
                <div className="p-2 bg-red-50 rounded-xl"><XCircle size={18} /></div> Cancel Ride
             </button>
          </div>
        )}
      </div>

      {/* Modification Request Modal */}
      {showModModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-gray-900/50 backdrop-blur-sm">
           <div className="bg-white w-full max-w-sm rounded-[40px] p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center mx-auto">
                 <Edit size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">Request Modification</h3>
                <p className="text-xs text-gray-500 font-medium mt-2">Send a request to dispatch to modify trip details.</p>
              </div>
              
              <div className="space-y-3">
                 {['Change Pickup Time', 'Change Address', 'Wrong Equipment', 'Client Unreachable'].map(reason => (
                    <button 
                      key={reason}
                      onClick={() => { setShowModModal(false); alert('Request sent to dispatch.'); }}
                      className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                    >
                       {reason}
                    </button>
                 ))}
              </div>
              <button onClick={() => setShowModModal(false)} className="w-full py-4 bg-white border border-gray-100 text-gray-400 rounded-[24px] font-black uppercase text-xs">Cancel</button>
           </div>
        </div>
      )}

      {/* Care Insights Modal Overlay */}
      {showCareInsights && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-xl" onClick={() => setShowCareInsights(false)} />
           <div className="bg-white w-full rounded-[44px] shadow-2xl relative p-10 duration-300">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-lg"><Sparkles size={24}/></div>
                    <h3 className="text-2xl font-black text-gray-900">Care Insights</h3>
                 </div>
                 <button onClick={() => setShowCareInsights(false)} className="p-3 bg-gray-50 rounded-2xl text-gray-400"><X size={20}/></button>
              </div>

              {isLoadingCare ? (
                <div className="py-20 flex flex-col items-center gap-6">
                   <div className="relative">
                      <Loader2 className="animate-spin text-sky-500" size={56} />
                      <div className="absolute inset-0 flex items-center justify-center"><Users size={20} className="text-sky-300" /></div>
                   </div>
                   <p className="text-xs font-black text-sky-600 uppercase tracking-[0.2em] animate-pulse">Analyzing Member History...</p>
                </div>
              ) : careInsights && (
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-sky-50 rounded-3xl border border-sky-100">
                         <p className="text-[9px] font-black text-sky-600 uppercase tracking-widest mb-2">Atmosphere</p>
                         <p className="text-sm font-black text-sky-900">{careInsights.temp}</p>
                      </div>
                      <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100">
                         <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest mb-2">Social Vibe</p>
                         <p className="text-sm font-black text-purple-900">{careInsights.vibe}</p>
                      </div>
                   </div>
                   <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
                      <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-2">Mobility Tip</p>
                      <p className="text-sm font-black text-green-900">{careInsights.mobility}</p>
                   </div>
                   <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Likely Mood</p>
                      <p className="text-sm font-black text-gray-700 leading-relaxed italic">"{careInsights.mood}"</p>
                   </div>
                   <button 
                     onClick={() => setShowCareInsights(false)}
                     className="w-full bg-sky-500 text-white font-black py-5 rounded-[28px] shadow-xl shadow-sky-100 mt-4 active:scale-95 transition-all"
                   >
                     Acknowledge Insights
                   </button>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Primary Execution Footer */}
      <div className="p-8 bg-white border-t border-gray-100 fixed bottom-0 left-0 right-0 max-w-md mx-auto shadow-[0_-20px_60px_rgba(0,0,0,0.08)]">
         <button 
           onClick={() => onStart(trip.id)}
           className="w-full bg-sky-500 text-white font-black py-5 rounded-[32px] shadow-2xl shadow-sky-200 text-xl active:scale-95 transition-all flex items-center justify-center gap-4 group"
         >
           Commence Service <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
         </button>
      </div>
    </div>
  );
};

export default TripDetailScreen;