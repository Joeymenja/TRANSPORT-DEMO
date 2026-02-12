
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Siren, 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Camera, 
  Mic, 
  FileText, 
  CheckCircle2, 
  User, 
  Car, 
  Save, 
  Loader2, 
  Sparkles, 
  X,
  ChevronRight
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-red-50 p-6 rounded-[32px] border border-red-100 text-center space-y-4">
             <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white mx-auto shadow-xl shadow-red-200">
                <Siren size={32} className="animate-pulse" />
             </div>
             <h3 className="text-xl font-black text-red-900">Safety Triage</h3>
             <p className="text-sm font-medium text-red-700">Are you, the member, and all parties safe and in a secure location?</p>
             
             <div className="grid grid-cols-2 gap-4 pt-2">
                <button 
                  onClick={() => setIsSafe(false)}
                  className="bg-white border-2 border-red-200 text-red-600 font-black py-4 rounded-[24px] uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-colors"
                >
                   No - Need 911
                </button>
                <button 
                  onClick={() => { setIsSafe(true); setStep(2); }}
                  className="bg-red-600 text-white font-black py-4 rounded-[24px] uppercase text-xs tracking-widest shadow-lg shadow-red-200"
                >
                   Yes - Proceed
                </button>
             </div>
          </div>

          {!isSafe && isSafe !== null && (
             <div className="bg-gray-900 text-white p-8 rounded-[32px] text-center space-y-6">
                <h2 className="text-3xl font-black text-red-500">STOP</h2>
                <p className="font-bold text-lg">Call 911 Immediately.</p>
                <a href="tel:911" className="block w-full bg-red-600 py-6 rounded-[28px] text-2xl font-black shadow-2xl animate-pulse">
                   Dial 911
                </a>
                <p className="text-xs text-gray-400">Do not proceed with reporting until emergency services arrive.</p>
             </div>
          )}
        </div>
      );
    }

    if (step === 2) {
       return (
         <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
            <h3 className="text-lg font-black text-gray-900">Classify Incident</h3>
            <div className="grid grid-cols-2 gap-4">
               {[
                 { id: 'accident', label: 'Collision', icon: Car },
                 { id: 'medical', label: 'Medical', icon: FileText },
                 { id: 'behavioral', label: 'Behavior', icon: User },
                 { id: 'vehicle', label: 'Breakdown', icon: AlertTriangle },
               ].map((item) => (
                 <button 
                   key={item.id}
                   onClick={() => { setType(item.id as IncidentType); setStep(3); }}
                   className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-gray-100 rounded-[32px] shadow-sm active:scale-95 transition-all hover:border-sky-200"
                 >
                    <div className="p-3 bg-gray-50 rounded-2xl text-gray-600">
                       <item.icon size={28} />
                    </div>
                    <span className="font-black text-sm text-gray-800">{item.label}</span>
                 </button>
               ))}
            </div>
         </div>
       );
    }

    if (step === 3) {
       return (
         <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
            <h3 className="text-lg font-black text-gray-900">Incident Statement</h3>
            
            <div className="relative">
               <textarea 
                 value={statement}
                 onChange={(e) => setStatement(e.target.value)}
                 placeholder="Describe exactly what happened. Be specific about location, speed, and actions..."
                 className="w-full p-5 bg-white border border-gray-200 rounded-[32px] min-h-[200px] text-sm font-medium leading-relaxed focus:ring-2 focus:ring-sky-500/20 transition-all resize-none shadow-sm"
               />
               <div className="absolute bottom-4 right-4 flex gap-2">
                  <button className="p-2 bg-gray-100 rounded-xl text-gray-500"><Mic size={20}/></button>
                  <button 
                    onClick={handleSmartPolish}
                    disabled={isPolishing}
                    className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-sky-200"
                  >
                     {isPolishing ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                     AI Polish
                  </button>
               </div>
            </div>

            <button onClick={() => setStep(4)} className="w-full bg-gray-900 text-white font-black py-5 rounded-[32px] shadow-xl">
               Next: Evidence
            </button>
         </div>
       );
    }

    if (step === 4) {
       return (
         <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
            <h3 className="text-lg font-black text-gray-900">Evidence & Analysis</h3>
            
            <div className="space-y-4">
               <PhotoUploader 
                 label="Add Photo (Scene/Damage)" 
                 aspectRatio="aspect-video"
                 onImageSelect={analyzeDamage}
               />
               
               {isAnalyzing && (
                  <div className="p-4 bg-sky-50 rounded-2xl flex items-center gap-3">
                     <Loader2 className="animate-spin text-sky-500" size={20} />
                     <p className="text-xs font-black text-sky-700 uppercase tracking-widest">AI Analyzing Damage...</p>
                  </div>
               )}

               {damageAnalysis && (
                  <div className="p-5 bg-white border border-gray-100 rounded-[24px] shadow-sm">
                     <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={14} className="text-sky-500" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Forensic Insight</span>
                     </div>
                     <p className="text-sm font-medium text-gray-800 leading-relaxed">{damageAnalysis}</p>
                  </div>
               )}

               <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                  {photos.map((p, i) => (
                     <div key={i} className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-200 shrink-0">
                        <img src={p} className="w-full h-full object-cover" />
                     </div>
                  ))}
               </div>
            </div>

            <button onClick={() => setStep(5)} className="w-full bg-gray-900 text-white font-black py-5 rounded-[32px] shadow-xl">
               Next: Parties Involved
            </button>
         </div>
       );
    }

    if (step === 5) {
       return (
         <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
            <h3 className="text-lg font-black text-gray-900">Involved Parties</h3>
            
            <div className="space-y-4">
               <div className="bg-white p-6 rounded-[32px] border border-gray-100 space-y-4 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Other Driver / Witness</p>
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={involvedParty.name}
                    onChange={(e) => setInvolvedParty({...involvedParty, name: e.target.value})}
                    className="w-full p-4 bg-gray-50 border-none rounded-[20px] font-bold text-sm"
                  />
                  <input 
                    type="tel" 
                    placeholder="Phone Number" 
                    value={involvedParty.phone}
                    onChange={(e) => setInvolvedParty({...involvedParty, phone: e.target.value})}
                    className="w-full p-4 bg-gray-50 border-none rounded-[20px] font-bold text-sm"
                  />
                  <input 
                    type="text" 
                    placeholder="Insurance Provider (If applicable)" 
                    value={involvedParty.insurance}
                    onChange={(e) => setInvolvedParty({...involvedParty, insurance: e.target.value})}
                    className="w-full p-4 bg-gray-50 border-none rounded-[20px] font-bold text-sm"
                  />
               </div>
            </div>

            <button onClick={handleSubmit} className="w-full bg-red-600 text-white font-black py-5 rounded-[32px] shadow-2xl shadow-red-200 text-lg flex items-center justify-center gap-3">
               <Save size={20} /> Submit Report
            </button>
         </div>
       );
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-gray-50 flex flex-col max-w-md mx-auto h-screen">
      {/* Header */}
      <div className="bg-white px-6 py-6 border-b border-gray-100 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-1 -ml-2 text-gray-400 hover:text-gray-900"><ArrowLeft size={28}/></button>
            <div>
               <h2 className="text-xl font-black text-gray-900">Incident Protocol</h2>
               <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Critical Reporting</p>
            </div>
         </div>
         <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(i => (
               <div key={i} className={`h-1.5 w-4 rounded-full transition-all ${i <= step ? 'bg-red-500' : 'bg-gray-200'}`} />
            ))}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6">
         {renderStep()}
      </div>
    </div>
  );
};

export default IncidentReportScreen;
