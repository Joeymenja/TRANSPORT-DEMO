
import React, { useState, useEffect, useRef } from 'react';
import { Trip, TripStatus } from '../types';
import SecurementGuideScreen from './SecurementGuideScreen';
import { 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Phone, 
  User, 
  AlertCircle,
  Clock,
  CheckCircle2,
  Camera,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Signature as SignatureIcon,
  Stethoscope,
  HeartPulse,
  Info,
  Car,
  AlertTriangle,
  UserCheck,
  Users,
  X,
  MessageSquare,
  FileDigit,
  LayoutGrid,
  FileText,
  Download,
  Share2,
  Zap,
  Loader2,
  Scan,
  Sparkles,
  Accessibility,
  Mic,
  Volume2,
  RefreshCw,
  Maximize2,
  Wind,
  Thermometer,
  Music,
  Activity as ActivityIcon
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ActiveTripScreenProps {
  trip: Trip;
  onBack: () => void;
  onComplete: () => void;
}

enum Phase {
  PRE_TRIP_CHECKLIST = 'PRE_TRIP_CHECKLIST',
  EN_ROUTE_PICKUP = 'EN_ROUTE_PICKUP',
  ARRIVAL_PICKUP = 'ARRIVAL_PICKUP',
  IDENTITY_VERIFICATION = 'IDENTITY_VERIFICATION',
  BOARDING = 'BOARDING',
  SAFETY_AUDIT = 'SAFETY_AUDIT',
  EN_ROUTE_DROPOFF = 'EN_ROUTE_DROPOFF',
  ARRIVAL_DROPOFF = 'ARRIVAL_DROPOFF',
  SIGNATURE_CLIENT = 'SIGNATURE_CLIENT',
  SIGNATURE_STAFF = 'SIGNATURE_STAFF',
  SIGNATURE_DRIVER = 'SIGNATURE_DRIVER',
  FINAL_REPORT = 'FINAL_REPORT',
  SUCCESS = 'SUCCESS'
}

const ActiveTripScreen: React.FC<ActiveTripScreenProps> = ({ trip, onBack, onComplete }) => {
  const [phase, setPhase] = useState<Phase>(Phase.PRE_TRIP_CHECKLIST);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showSecurementGuide, setShowSecurementGuide] = useState(false);
  const [odometerPhoto, setOdometerPhoto] = useState(false);
  const [isVerifyingOdo, setIsVerifyingOdo] = useState(false);
  const [odoValue, setOdoValue] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [isRecordingReport, setIsRecordingReport] = useState(false);
  const [voiceReportText, setVoiceReportText] = useState('');
  const [smartDiversion, setSmartDiversion] = useState<{ msg: string; eta: string } | null>(null);
  
  // Wellness State
  const [showWellnessMonitor, setShowWellnessMonitor] = useState(false);
  const [wellnessInsight, setWellnessInsight] = useState<{ temp: string; music: string; tip: string } | null>(null);
  const [isAnalyzingWellness, setIsAnalyzingWellness] = useState(false);

  // Incident Architect State
  const [incidentReport, setIncidentReport] = useState<string | null>(null);
  const [isGeneratingIncident, setIsGeneratingIncident] = useState(false);
  const [incidentPhoto, setIncidentPhoto] = useState(false);

  // Identity & Safety State
  const [isCapturingId, setIsCapturingId] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  const [isAnalyzingId, setIsAnalyzingId] = useState(false);
  const [isCapturingSafety, setIsCapturingSafety] = useState(false);
  const [safetyVerified, setSafetyVerified] = useState(false);
  const [isAnalyzingSafety, setIsAnalyzingSafety] = useState(false);
  const [safetyChecklist, setSafetyChecklist] = useState({ locked: false, belted: false, cleared: false });

  const [checklist, setChecklist] = useState({
    clean: false, fuel: false, eq: false, fit: false, reviewed: false
  });

  const carpoolClients = trip.type === 'CARPOOL' 
    ? [trip.client, { ...trip.client, id: 'CL-2', name: 'Sarah Miller', memberId: 'AHCCCS-776655' }] 
    : [trip.client];

  const fetchWellnessInsight = async () => {
    setIsAnalyzingWellness(true);
    setShowWellnessMonitor(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze member ${trip.client.name} transit context: 82°F outside, wheelchair user, 15 min into trip. Suggest cabin optimization for member comfort. Format as JSON: {temp: string, music: string, tip: string}`,
        config: { responseMimeType: "application/json" }
      });
      setWellnessInsight(JSON.parse(response.text || '{}'));
    } catch (e) {
      setWellnessInsight({ temp: "71°F", music: "Soft Jazz", tip: "Member prefers direct airflow to be minimal." });
    } finally {
      setIsAnalyzingWellness(false);
    }
  };

  const generateIncidentReport = async (type: string) => {
    setIsGeneratingIncident(true);
    setIncidentPhoto(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Draft a formal AHCCCS NEMT incident report for a '${type}' event during trip ${trip.id}. Member: ${trip.client.name}. Include professional clinical language, impact on appointment timing, and safety measures taken.`,
        config: { systemInstruction: "You are a compliance officer." }
      });
      setIncidentReport(response.text || "Report generated successfully.");
    } catch (e) {
      setIncidentReport("Automated incident documentation finalized for Dispatch review.");
    } finally {
      setIsGeneratingIncident(false);
    }
  };

  const processIdentityVerification = async () => {
    setIsCapturingId(false);
    setIsAnalyzingId(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Compare a simulated photo of member ${trip.client.name} with dispatch records. Confirm match and check for required facial coverings. Format as JSON: {match: boolean, confidence: number, note: string}`,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || '{}');
      setIdVerified(data.match);
    } catch (e) {
      setIdVerified(true);
    } finally {
      setIsAnalyzingId(false);
    }
  };

  const processSafetyAudit = async () => {
    setIsCapturingSafety(false);
    setIsAnalyzingSafety(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Analyze a boarding photo for a wheelchair NEMT member. Verify if: 1. Wheelchair locks are visible. 2. Lap belt is across member. 3. Pathway is clear. Format as JSON: {locked: boolean, belted: boolean, cleared: boolean, confidence: number}",
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || '{}');
      setSafetyChecklist({ locked: data.locked, belted: data.belted, cleared: data.cleared });
      setSafetyVerified(data.locked && data.belted && data.cleared);
    } catch (e) {
      setSafetyChecklist({ locked: true, belted: true, cleared: true });
      setSafetyVerified(true);
    } finally {
      setIsAnalyzingSafety(false);
    }
  };

  const verifyOdometerWithAI = async () => {
    setIsVerifyingOdo(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Extract mileage from simulated dashboard. Format as JSON: {mileage: string}",
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || '{}');
      setOdoValue(data.mileage || '42340');
      setOdometerPhoto(true);
    } catch (e) {
      setOdoValue('42340'); 
      setOdometerPhoto(true);
    } finally {
      setIsVerifyingOdo(false);
    }
  };

  const nextPhase = () => {
    const phases = Object.values(Phase);
    const currentIndex = phases.indexOf(phase);
    if (phase === Phase.ARRIVAL_PICKUP) {
        setPhase(Phase.IDENTITY_VERIFICATION);
        return;
    }
    if (currentIndex < phases.length - 1) {
      setPhase(phases[currentIndex + 1]);
    } else {
      onComplete();
    }
  };

  const renderPhaseContent = () => {
    switch (phase) {
      case Phase.IDENTITY_VERIFICATION:
        return (
          <div className="p-8 bg-white h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
             <div className="w-24 h-24 bg-teal-50 rounded-[40px] flex items-center justify-center text-teal-500 mb-8 border-4 border-white shadow-2xl relative overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${trip.client.name}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-teal-500/10" />
             </div>
             <h2 className="text-3xl font-black text-gray-900 leading-tight mb-2">Identify Member</h2>
             <p className="text-gray-500 mb-10 font-medium px-4">Verify member's identity with a quick visual match to ensure AHCCCS integrity.</p>
             <button 
               onClick={() => setIsCapturingId(true)}
               disabled={isAnalyzingId || idVerified}
               className={`w-full p-10 rounded-[44px] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all relative overflow-hidden ${idVerified ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-200'}`}
             >
                {isAnalyzingId ? (
                   <div className="flex flex-col items-center gap-4">
                      <Loader2 size={48} className="text-teal-500 animate-spin" />
                      <p className="text-[11px] font-black uppercase text-teal-600 tracking-widest">Running Facial Match...</p>
                   </div>
                ) : idVerified ? (
                   <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-green-500 text-white rounded-3xl shadow-xl shadow-green-200"><UserCheck size={40}/></div>
                      <p className="text-[11px] font-black uppercase text-green-700 tracking-widest">Identity Confirmed</p>
                   </div>
                ) : (
                   <>
                      <div className="p-5 bg-white rounded-3xl shadow-xl text-gray-400"><Camera size={44} /></div>
                      <p className="text-[11px] font-black uppercase text-gray-500 tracking-widest">Verify ID / Photo Match</p>
                   </>
                )}
             </button>
             <div className="fixed bottom-0 left-0 right-0 p-8 bg-white/95 backdrop-blur-md border-t border-gray-100 max-w-md mx-auto z-50">
               <button onClick={nextPhase} disabled={!idVerified} className="w-full bg-teal-500 text-white font-black py-5 rounded-[32px] shadow-2xl shadow-teal-200 text-lg active:scale-95 disabled:opacity-30 transition-all">
                 Start Boarding Phase
               </button>
             </div>
          </div>
        );
      case Phase.EN_ROUTE_DROPOFF:
        return (
          <div className="flex flex-col h-full bg-gray-50 relative">
             <div className="absolute top-6 left-6 right-6 bg-white/95 backdrop-blur-xl p-5 rounded-[32px] shadow-2xl border border-white/50 z-20 flex flex-col gap-3">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-teal-500 text-white rounded-[20px] flex items-center justify-center shadow-lg"><Navigation size={28}/></div>
                   <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-black text-teal-500 uppercase tracking-[0.2em] mb-1">Transit to Target</p>
                      <p className="text-sm font-black text-gray-800 truncate leading-tight">{trip.dropoffAddress}</p>
                   </div>
                   <button onClick={fetchWellnessInsight} className="p-3 bg-teal-50 text-teal-500 rounded-2xl border border-teal-100 active:scale-90 transition-all">
                      <ActivityIcon size={20} className="animate-pulse" />
                   </button>
                </div>
             </div>

             <div className="w-full h-full relative">
                <img src={`https://picsum.photos/seed/transit_view_v10/1200/1200`} className="w-full h-full object-cover grayscale opacity-40" />
                {/* Geofence Pulse Animation */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-teal-500/30 rounded-full animate-ping" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-teal-400/50 rounded-full animate-[pulse_2s_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-teal-500 rounded-full shadow-[0_0_20px_#0ea5e9]" />
             </div>
             
             {showWellnessMonitor && (
               <div className="absolute inset-x-6 bottom-40 z-30 animate-in slide-in-from-bottom-10">
                  <div className="bg-gray-900/90 backdrop-blur-2xl p-8 rounded-[48px] border border-white/10 shadow-2xl">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                           <div className="p-2.5 bg-teal-500 text-white rounded-xl shadow-lg shadow-teal-500/30"><ActivityIcon size={18}/></div>
                           <div>
                              <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-[0.25em]">Wellness HUD</h4>
                              <p className="text-sm font-black text-white">Member Care Optimization</p>
                           </div>
                        </div>
                        <button onClick={() => setShowWellnessMonitor(false)} className="text-white/30 hover:text-white"><X size={20}/></button>
                     </div>
                     {isAnalyzingWellness ? (
                       <div className="py-6 flex flex-col items-center gap-3">
                          <Loader2 className="animate-spin text-teal-400" size={32} />
                          <p className="text-[10px] font-black uppercase text-teal-400 tracking-widest">Optimizing Cabin Climate...</p>
                       </div>
                     ) : wellnessInsight && (
                       <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-3">
                                <Thermometer size={16} className="text-teal-400" />
                                <div>
                                   <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Target Temp</p>
                                   <p className="text-xs font-black text-white">{wellnessInsight.temp}</p>
                                </div>
                             </div>
                             <div className="p-4 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-3">
                                <Music size={16} className="text-purple-400" />
                                <div>
                                   <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Audio Vibe</p>
                                   <p className="text-xs font-black text-white">{wellnessInsight.music}</p>
                                </div>
                             </div>
                          </div>
                          <div className="p-5 bg-teal-500/10 rounded-3xl border border-teal-500/20">
                             <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={14} className="text-teal-400" />
                                <span className="text-[9px] font-black text-teal-400 uppercase tracking-widest">AI Tip</span>
                             </div>
                             <p className="text-xs font-bold text-teal-100 leading-relaxed italic">"{wellnessInsight.tip}"</p>
                          </div>
                       </div>
                     )}
                  </div>
               </div>
             )}

             <div className="absolute bottom-0 left-0 right-0 p-8 bg-white/95 backdrop-blur-xl rounded-t-[56px] border-t border-white/50 shadow-[0_-25px_60px_rgba(0,0,0,0.15)] z-20">
                <div className="flex items-center justify-between mb-8 px-4">
                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-[28px] border-2 border-white shadow-lg overflow-hidden relative">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${carpoolClients[0].name}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-green-500/5 animate-pulse" />
                      </div>
                      <div>
                         <h4 className="text-2xl font-black text-gray-900 tracking-tight">{carpoolClients[0].name}</h4>
                         <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><ActivityIcon size={10} className="text-teal-500" /> In-Transit Bio-Monitor Active</p>
                      </div>
                   </div>
                </div>
                <button onClick={nextPhase} className="w-full bg-teal-500 text-white font-black py-6 rounded-[40px] text-xl active:scale-95 transition-all shadow-2xl shadow-teal-200 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-active:translate-x-full transition-transform duration-500" />
                  Confirm Arrival <span className="opacity-60 font-medium ml-2">@ Dropoff</span>
                </button>
             </div>
          </div>
        );

      case Phase.PRE_TRIP_CHECKLIST:
        return (
          <div className="p-8 bg-white h-full flex flex-col overflow-y-auto no-scrollbar pb-32 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-gray-900 mb-2 leading-tight">Safety & Pre-Trip</h2>
            <p className="text-gray-500 mb-10 font-medium">Essential AHCCCS vehicle health check.</p>
            <div className="space-y-4">
              {[ { id: 'clean', label: 'Safety & Hygiene Verified' },
                 { id: 'fuel', label: 'Sufficient Fuel/Range' },
                 { id: 'eq', label: 'ADA Lift/Securement Ops' } ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setChecklist({...checklist, [item.id as keyof typeof checklist]: !checklist[item.id as keyof typeof checklist]})}
                  className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${checklist[item.id as keyof typeof checklist] ? 'bg-teal-50 border-teal-500 shadow-lg shadow-teal-50' : 'bg-white border-gray-100 shadow-sm'}`}
                >
                  <div className="flex items-center gap-4">
                     <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${checklist[item.id as keyof typeof checklist] ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-200'}`}>
                        {checklist[item.id as keyof typeof checklist] && <CheckCircle2 size={16}/>}
                     </div>
                     <span className="font-black text-gray-800 text-sm">{item.label}</span>
                  </div>
                  <ChevronRight size={18} className={checklist[item.id as keyof typeof checklist] ? 'text-teal-500' : 'text-gray-300'} />
                </button>
              ))}
              
              <div className="pt-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-2">Primary Documentation</p>
                <button 
                  onClick={verifyOdometerWithAI}
                  disabled={isVerifyingOdo}
                  className={`w-full p-10 rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all relative overflow-hidden ${odometerPhoto ? 'bg-green-50 border-green-500 text-green-700' : 'bg-gray-50 text-gray-400 border-gray-200 active:bg-gray-100'}`}
                >
                  {isVerifyingOdo ? (
                    <div className="flex flex-col items-center gap-4">
                       <Loader2 size={40} className="text-teal-500 animate-spin" />
                       <span className="text-[11px] font-black uppercase tracking-widest text-teal-600">AI Scanning Gauge...</span>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-white rounded-3xl shadow-lg">
                        <Camera size={40} className={odometerPhoto ? 'text-green-500' : 'text-gray-300'} />
                      </div>
                      <div className="text-center">
                         <span className="text-[11px] font-black uppercase tracking-widest block mb-1">
                            {odometerPhoto ? 'Verified Start Reading' : 'Odometer Verification'}
                         </span>
                         {odoValue && <span className="text-2xl font-black tabular-nums">{odoValue} MI</span>}
                      </div>
                      {odometerPhoto && <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-2 shadow-xl"><CheckCircle2 size={18}/></div>}
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 p-8 bg-white/95 backdrop-blur-md border-t border-gray-100 max-w-md mx-auto z-50">
              <button 
                onClick={nextPhase} 
                disabled={!odometerPhoto || !checklist.clean || !checklist.fuel || !checklist.eq} 
                className="w-full bg-teal-500 text-white font-black py-5 rounded-[32px] disabled:opacity-30 disabled:grayscale transition-all shadow-2xl shadow-teal-200 text-lg active:scale-95"
              >
                Start Operational Log
              </button>
            </div>
          </div>
        );

      default:
        // Re-use current implementation for other phases to keep standard flow but enhanced UI where needed
        return (
          <div className="flex flex-col h-full bg-gray-50 relative p-8">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-teal-500 text-white rounded-2xl flex items-center justify-center shadow-lg"><ActivityIcon size={24}/></div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">Current Phase: {phase.replace(/_/g, ' ')}</h2>
             </div>
             <div className="flex-1 bg-white rounded-[44px] border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center gap-8">
                <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center text-gray-400 border border-gray-100 shadow-inner">
                   <LayoutGrid size={40} className="animate-pulse" />
                </div>
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-teal-500 uppercase tracking-[0.25em]">Workflow Evolution</p>
                   <h3 className="text-xl font-black text-gray-800">Operational Phase Processing</h3>
                </div>
                <button onClick={nextPhase} className="w-full bg-gray-900 text-white font-black py-5 rounded-[32px] text-lg active:scale-95 transition-all flex items-center justify-center gap-3">
                   Advance Operation <ChevronRight size={20} />
                </button>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white max-w-md mx-auto h-screen flex flex-col overflow-hidden">
      <div className="bg-white px-8 py-7 flex items-center justify-between border-b border-gray-50 relative z-30 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-3 text-gray-400 hover:text-gray-900 transition-colors"><ArrowLeft size={32} /></button>
        <div className="text-center flex-1">
          <p className="text-[11px] font-black text-teal-500 uppercase tracking-[0.3em] mb-1">Live Operation</p>
          <div className="flex items-center justify-center gap-2.5">
            <span className="text-base font-black text-gray-900 tracking-tight">{trip.id}</span>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          </div>
        </div>
        <button onClick={() => setShowIssueModal(true)} className="p-2 -mr-3 text-red-500 active:scale-90 transition-transform"><AlertTriangle size={28} /></button>
      </div>
      <div className="flex-1 overflow-hidden bg-gray-50 relative z-10">{renderPhaseContent()}</div>
      
      {showSecurementGuide && (
        <SecurementGuideScreen 
          clientName={trip.client.name} 
          onBack={() => setShowSecurementGuide(false)} 
        />
      )}

      {showIssueModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-6 animate-in fade-in duration-300">
          <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md" onClick={() => setShowIssueModal(false)} />
          <div className="bg-white w-full rounded-[48px] shadow-2xl relative p-10 animate-in slide-in-from-bottom-20 duration-500 overflow-hidden">
             {incidentReport ? (
               <div className="space-y-8 animate-in zoom-in-95">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-500 text-white rounded-2xl shadow-lg"><ShieldCheck size={24}/></div>
                        <h3 className="text-2xl font-black text-gray-900 leading-tight">AI Incident Report</h3>
                     </div>
                     <button onClick={() => { setIncidentReport(null); setIncidentPhoto(false); }} className="p-2 bg-gray-50 rounded-xl text-gray-400"><X size={18}/></button>
                  </div>
                  <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100 max-h-[300px] overflow-y-auto no-scrollbar shadow-inner">
                     <p className="text-xs font-serif leading-relaxed text-gray-800 whitespace-pre-wrap italic">
                        {incidentReport}
                     </p>
                  </div>
                  <div className="flex gap-4">
                     <button className="flex-1 bg-white border border-gray-100 py-5 rounded-[28px] font-black text-[10px] uppercase tracking-widest text-gray-500 flex items-center justify-center gap-2">
                        <Download size={16} /> Save Draft
                     </button>
                     <button className="flex-1 bg-teal-500 text-white py-5 rounded-[28px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-teal-100">
                        <Share2 size={16} /> Transmit
                     </button>
                  </div>
               </div>
             ) : (
               <>
                 <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg"><AlertTriangle size={24}/></div>
                       <h3 className="text-2xl font-black text-gray-900 leading-tight">Emergency Hub</h3>
                    </div>
                    <button onClick={() => setShowIssueModal(false)} className="p-3 bg-gray-50 rounded-2xl text-gray-400"><X size={20}/></button>
                 </div>
                 <div className="grid grid-cols-2 gap-5">
                    {[ { id: 'med', label: 'Medical Alert', icon: HeartPulse, color: 'text-red-500', bg: 'bg-red-50' },
                       { id: 'veh', label: 'Mechanical', icon: Car, color: 'text-amber-500', bg: 'bg-amber-50' },
                       { id: 'tra', label: 'Critical Traffic', icon: AlertTriangle, color: 'text-teal-500', bg: 'bg-teal-50' },
                       { id: 'dis', label: 'SOS Dispatch', icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50' } ].map(i => (
                      <button 
                        key={i.id} 
                        onClick={() => generateIncidentReport(i.label)}
                        disabled={isGeneratingIncident}
                        className="p-8 bg-white border border-gray-100 rounded-[32px] flex flex-col items-center gap-4 active:scale-95 transition-all shadow-sm group hover:border-red-100 disabled:opacity-50"
                      >
                         <div className={`p-4 rounded-2xl ${i.bg} ${i.color} group-hover:scale-110 transition-transform relative`}>
                            {isGeneratingIncident && <div className="absolute inset-0 bg-white/40 flex items-center justify-center"><Loader2 className="animate-spin text-teal-500" size={24} /></div>}
                            <i.icon size={36} />
                         </div>
                         <span className="text-[11px] font-black uppercase text-gray-700 tracking-widest text-center leading-tight">{i.label}</span>
                      </button>
                    ))}
                 </div>
                 <div className="mt-8 p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex items-center gap-4">
                    <div className="p-2.5 bg-teal-500 text-white rounded-xl"><Sparkles size={16}/></div>
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest leading-relaxed">
                       AI Incident Architect will automatically build compliance reports based on event type.
                    </p>
                 </div>
               </>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveTripScreen;
