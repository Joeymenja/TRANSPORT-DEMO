
import React, { useState } from 'react';
import { 
  ArrowLeft, Siren, AlertTriangle, Phone, MapPin, Camera, Mic, FileText, CheckCircle2, User, Car, Save, Loader2, Sparkles, X, ChevronRight
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import PhotoUploader from '../components/PhotoUploader';

interface IncidentReportScreenProps {
  onBack: () => void;
}

type IncidentType = 'accident' | 'medical' | 'behavioral' | 'vehicle';

const IncidentReportScreen: React.FC<IncidentReportScreenProps> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<IncidentType | null>(null);
  const [isSafe, setIsSafe] = useState<boolean | null>(null);
  
  // Data State
  const [statement, setStatement] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [damageAnalysis, setDamageAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [involvedParty, setInvolvedParty] = useState({ name: '', phone: '', insurance: '' });

  const handleSmartPolish = async () => {
    if (!statement.trim()) return;
    setIsPolishing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Rewrite this rough driver incident statement into a formal, objective legal report suitable for insurance and AHCCCS submission. Keep facts, remove emotion. Input: "${statement}"`,
      });
      if (response.text) setStatement(response.text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPolishing(false);
    }
  };

  const analyzeDamage = async (photo: string) => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { inlineData: { mimeType: 'image/jpeg', data: photo.split(',')[1] } },
          { text: "Analyze vehicle damage. List affected panels and estimate severity (Minor/Moderate/Severe). concise." }
        ]
      });
      setDamageAnalysis(response.text || "Damage recorded.");
      setPhotos([...photos, photo]);
    } catch (e) {
      setPhotos([...photos, photo]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = () => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: 'Incident Report Filed & Escalated', type: 'success' }
    }));
    onBack();
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center space-y-4 shadow-sm">
             <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white mx-auto shadow-lg shadow-red-200">
                <Siren size={24} className="animate-pulse" />
             </div>
             <h3 className="text-[16px] font-bold text-red-900 uppercase tracking-tight">Safety Triage</h3>
             <p className="text-[13px] font-medium text-red-700 leading-snug">Confirm operational safety before proceeding.</p>
             
             <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={() => setIsSafe(false)}
                  className="bg-white border border-red-200 text-red-600 font-bold py-3 rounded-xl uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-colors"
                >
                   Need 911
                </button>
                <button 
                  onClick={() => { setIsSafe(true); setStep(2); }}
                  className="bg-red-600 text-white font-bold py-3 rounded-xl uppercase text-[10px] tracking-widest shadow-md"
                >
                   All Safe
                </button>
             </div>
          </div>

          {!isSafe && isSafe !== null && (
             <div className="bg-slate-900 text-white p-6 rounded-2xl text-center space-y-5 shadow-xl">
                <h2 className="text-xl font-black text-red-500 uppercase tracking-tighter">Emergency Alert</h2>
                <p className="font-bold text-[14px] leading-tight">Terminate report. Contact dispatch and EMS.</p>
                <a href="tel:911" className="block w-full bg-red-600 py-4 rounded-xl text-lg font-black shadow-lg animate-pulse uppercase tracking-widest">
                   Dial 911
                </a>
             </div>
          )}
        </div>
      );
    }

    if (step === 2) {
       return (
         <div className="space-y-4 animate-in fade-in">
            <h3 className="text-[14px] font-bold text-slate-900 uppercase tracking-tight ml-1">Classify Incident</h3>
            <div className="grid grid-cols-2 gap-3">
               {[
                 { id: 'accident', label: 'Collision', icon: Car },
                 { id: 'medical', label: 'Medical', icon: FileText },
                 { id: 'behavioral', label: 'Behavior', icon: User },
                 { id: 'vehicle', label: 'Mechanical', icon: AlertTriangle },
               ].map((item) => (
                 <button 
                   key={item.id}
                   onClick={() => { setType(item.id as IncidentType); setStep(3); }}
                   className="flex flex-col items-center justify-center gap-2.5 p-5 bg-white border border-slate-100 rounded-xl shadow-sm active:scale-95 transition-all hover:border-teal-200"
                 >
                    <div className="p-2.5 bg-slate-50 rounded-lg text-slate-600">
                       <item.icon size={22} />
                    </div>
                    <span className="font-bold text-[12px] text-slate-800 uppercase tracking-tight">{item.label}</span>
                 </button>
               ))}
            </div>
         </div>
       );
    }

    if (step === 3) {
       return (
         <div className="space-y-4 animate-in fade-in">
            <h3 className="text-[14px] font-bold text-slate-900 uppercase ml-1">Statement</h3>
            <div className="relative">
               <textarea 
                 value={statement}
                 onChange={(e) => setStatement(e.target.value)}
                 placeholder="Specific location and actions..."
                 className="w-full p-4 bg-white border border-slate-200 rounded-2xl min-h-[160px] text-[13px] font-medium leading-relaxed focus:border-teal-400 outline-none transition-all resize-none shadow-sm"
               />
               <div className="absolute bottom-3 right-3 flex gap-2">
                  <button className="p-2 bg-slate-50 rounded-lg text-slate-400"><Mic size={16}/></button>
                  <button 
                    onClick={handleSmartPolish}
                    disabled={isPolishing}
                    className="flex items-center gap-1.5 bg-teal-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-md"
                  >
                     {isPolishing ? <Loader2 className="animate-spin" size={10} /> : <Sparkles size={10} />}
                     Polish
                  </button>
               </div>
            </div>
            <button onClick={() => setStep(4)} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl uppercase tracking-widest text-[12px] shadow-lg">Next: Evidence</button>
         </div>
       );
    }

    if (step === 4) {
       return (
         <div className="space-y-4 animate-in fade-in">
            <h3 className="text-[14px] font-bold text-slate-900 uppercase ml-1">Evidence</h3>
            <div className="space-y-3">
               <PhotoUploader label="Capture Scene" aspectRatio="aspect-video" onImageSelect={analyzeDamage} />
               {isAnalyzing && (
                  <div className="p-3 bg-teal-50 rounded-xl flex items-center gap-2 animate-pulse">
                     <Loader2 className="animate-spin text-teal-500" size={14} />
                     <p className="text-[9px] font-bold text-sky-700 uppercase tracking-widest">Neural Forensic Scan...</p>
                  </div>
               )}
               {damageAnalysis && (
                  <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                     <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles size={12} className="text-teal-500" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">AI Result</span>
                     </div>
                     <p className="text-[12px] font-bold text-slate-800 leading-snug italic">"{damageAnalysis}"</p>
                  </div>
               )}
            </div>
            <button onClick={() => setStep(5)} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl uppercase tracking-widest text-[12px] shadow-lg">Next: Involved Parties</button>
         </div>
       );
    }

    if (step === 5) {
       return (
         <div className="space-y-4 animate-in fade-in">
            <h3 className="text-[14px] font-bold text-slate-900 uppercase ml-1">Other Parties</h3>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3 shadow-sm">
               <input type="text" placeholder="Full Name" value={involvedParty.name} onChange={(e) => setInvolvedParty({...involvedParty, name: e.target.value})} className="w-full p-3 bg-slate-50 rounded-lg font-bold text-[13px] outline-none" />
               <input type="tel" placeholder="Phone Number" value={involvedParty.phone} onChange={(e) => setInvolvedParty({...involvedParty, phone: e.target.value})} className="w-full p-3 bg-slate-50 rounded-lg font-bold text-[13px] outline-none" />
               <input type="text" placeholder="Insurance Co" value={involvedParty.insurance} onChange={(e) => setInvolvedParty({...involvedParty, insurance: e.target.value})} className="w-full p-3 bg-slate-50 rounded-lg font-bold text-[13px] outline-none" />
            </div>
            <button onClick={handleSubmit} className="w-full bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-100 uppercase text-[12px] tracking-widest flex items-center justify-center gap-2">
               <Save size={18} /> Submit Formal Report
            </button>
         </div>
       );
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-gray-50 flex flex-col max-w-md mx-auto h-screen font-sans">
      <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1 -ml-1 text-slate-400 hover:text-slate-900"><ArrowLeft size={22}/></button>
            <div>
               <h2 className="text-[14px] font-bold text-slate-900 uppercase tracking-tight leading-none">Incident Protocol</h2>
               <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map(i => (
                     <div key={i} className={`h-1 w-3 rounded-full transition-all ${i <= step ? 'bg-red-500' : 'bg-slate-100'}`} />
                  ))}
               </div>
            </div>
         </div>
         <AlertTriangle size={18} className="text-red-500" />
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-5"> {renderStep()} </div>
    </div>
  );
};

export default IncidentReportScreen;
