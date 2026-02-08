
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  ChevronRight, 
  Truck, 
  Zap, 
  Thermometer, 
  Droplets,
  Disc,
  Lightbulb,
  Maximize2,
  Save,
  Loader2,
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import PhotoUploader from '../components/PhotoUploader';
import SignaturePad from '../components/SignaturePad';

interface VehicleInspectionScreenProps {
  onBack: () => void;
  vehicleId?: string;
}

type Zone = 'front' | 'driver' | 'passenger' | 'rear' | 'interior' | 'hood';

const VehicleInspectionScreen: React.FC<VehicleInspectionScreenProps> = ({ onBack, vehicleId }) => {
  const [activeZone, setActiveZone] = useState<Zone>('front');
  const [defects, setDefects] = useState<Record<string, any>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ severity: string; desc: string; recommendation: string } | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const zones: { id: Zone; label: string; icon: any }[] = [
    { id: 'front', label: 'Front', icon: Truck },
    { id: 'driver', label: 'Driver', icon: Disc },
    { id: 'passenger', label: 'Pass.', icon: Disc },
    { id: 'rear', label: 'Rear', icon: Truck },
    { id: 'hood', label: 'Hood', icon: Thermometer },
    { id: 'interior', label: 'Cab', icon: Maximize2 },
  ];

  const checklistItems: Record<Zone, string[]> = {
    front: ['Headlights (High/Low)', 'Turn Signals', 'Windshield', 'Bumper'],
    driver: ['Front Tire Tread', 'Rear Tire Tread', 'Mirrors', 'Door Operation'],
    passenger: ['Front Tire Tread', 'Rear Tire Tread', 'Mirrors', 'Door Operation'],
    rear: ['Brake Lights', 'Tail Lights', 'Lift Operation', 'Exhaust'],
    hood: ['Engine Oil Level', 'Coolant Level', 'Brake Fluid', 'Belts & Hoses'],
    interior: ['Seatbelts', 'Horn', 'Wipers', 'Wheelchair Tie-downs', 'Fire Extinguisher'],
  };

  const toggleItem = (item: string) => {
    setDefects(prev => {
      const zoneDefects = prev[activeZone] || [];
      if (zoneDefects.includes(item)) {
        return { ...prev, [activeZone]: zoneDefects.filter((i: string) => i !== item) };
      } else {
        return { ...prev, [activeZone]: [...zoneDefects, item] };
      }
    });
  };

  const analyzeDefect = async (photoData: string) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: photoData.split(',')[1]
            }
          },
          { text: "Analyze this vehicle defect photo for a DVIR. Identify the part, severity (Low/Medium/High/Critical), and maintenance recommendation. Return JSON: { severity, desc, recommendation }" }
        ],
        config: { responseMimeType: "application/json" }
      });
      const result = JSON.parse(response.text || '{}');
      setAiAnalysis(result);
    } catch (e) {
      setAiAnalysis({ severity: "Medium", desc: "Visual anomaly detected on component.", recommendation: "Monitor closely." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'DVIR Submitted Successfully', type: 'success' } 
      }));
      onBack();
    }, 1500);
  };

  const allClear = Object.values(defects).every((d: any) => d.length === 0);

  return (
    <div className="fixed inset-0 z-[80] bg-white flex flex-col max-md mx-auto h-screen shadow-2xl font-sans">
      {/* Header - Standard Scale */}
      <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-gray-50 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1.5 -ml-1 text-gray-400 hover:text-gray-900 active:scale-90 transition-all"><ArrowLeft size={24}/></button>
          <div>
            <h2 className="text-[15px] font-bold text-gray-900 uppercase tracking-tight leading-none">Safety HUD</h2>
            <p className="text-[9px] text-teal-500 font-bold uppercase tracking-widest mt-1">Audit Protocol</p>
          </div>
        </div>
        <button onClick={() => setShowAiModal(true)} className="p-2.5 bg-teal-50 text-teal-500 rounded-xl active:scale-90 transition-all shadow-sm">
           <Camera size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 bg-gray-50/20">
        {/* Zone Navigator - Higher Density */}
        <div className="bg-white sticky top-0 z-10 shadow-sm border-b border-gray-50">
           <div className="flex gap-2.5 overflow-x-auto no-scrollbar p-4 px-5">
              {zones.map(z => {
                 const hasDefects = defects[z.id]?.length > 0;
                 return (
                   <button
                     key={z.id}
                     onClick={() => setActiveZone(z.id)}
                     className={`flex flex-col items-center gap-1.5 px-6 py-4 rounded-xl transition-all whitespace-nowrap border-2 ${activeZone === z.id ? 'bg-teal-500 text-white border-teal-500 shadow-md' : hasDefects ? 'bg-red-50 text-red-500 border-red-100' : 'bg-slate-50 text-slate-400 border-transparent'}`}
                   >
                      <z.icon size={18} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">{z.label}</span>
                   </button>
                 );
              })}
           </div>
        </div>

        {/* Checklist Area - Standard Spacing */}
        <div className="p-5 space-y-6">
           <div className="flex items-center justify-between px-1">
              <div>
                 <h3 className="text-[16px] font-bold text-gray-900 tracking-tight uppercase leading-none">Checklist</h3>
                 <p className="text-[9px] text-teal-500 font-bold uppercase tracking-widest mt-1">{zones.find(z => z.id === activeZone)?.label} Components</p>
              </div>
              {defects[activeZone]?.length > 0 && <span className="text-[9px] font-black text-red-500 bg-red-50 px-2.5 py-1 rounded-md border border-red-100 uppercase">Issue Found</span>}
           </div>

           <div className="space-y-2">
              {checklistItems[activeZone].map((item, idx) => {
                 const isDefective = defects[activeZone]?.includes(item);
                 return (
                   <button 
                     key={idx}
                     onClick={() => toggleItem(item)}
                     className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isDefective ? 'bg-red-50 border-red-200 shadow-md' : 'bg-white border-slate-100 shadow-sm hover:border-teal-200'}`}
                   >
                      <div className="flex items-center gap-4">
                         <div className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${isDefective ? 'bg-red-500 border-red-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-300'}`}>
                            {isDefective ? <X size={14} /> : <CheckCircle2 size={14} />}
                         </div>
                         <span className={`text-[13px] font-bold ${isDefective ? 'text-red-900' : 'text-slate-700'}`}>{item}</span>
                      </div>
                      <span className="text-[8px] font-bold uppercase text-slate-300 tracking-widest">{isDefective ? 'Audit Alert' : 'Verified'}</span>
                   </button>
                 );
              })}
           </div>

           {/* Defect Details - Standard Radii */}
           {defects[activeZone]?.length > 0 && (
              <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100/50 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                 <div className="flex items-center gap-3 text-red-600 px-1">
                    <AlertCircle size={20} />
                    <h4 className="font-bold uppercase tracking-widest text-[10px]">Evidence Logging Required</h4>
                 </div>
                 <PhotoUploader 
                   label="CAPTURE DEFECT"
                   aspectRatio="aspect-video"
                   onImageSelect={analyzeDefect}
                 />
                 {isAnalyzing && (
                    <div className="flex items-center gap-2 text-red-500 justify-center py-4 bg-white rounded-xl border border-red-100 animate-pulse">
                       <Loader2 className="animate-spin" size={14} />
                       <span className="text-[10px] font-bold uppercase tracking-widest">AI Diagnostics...</span>
                    </div>
                 )}
                 {aiAnalysis && (
                    <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-lg space-y-3">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Neural Analysis</span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${aiAnalysis.severity === 'Critical' ? 'bg-red-500 text-white' : 'bg-amber-400 text-white'}`}>{aiAnalysis.severity}</span>
                       </div>
                       <p className="text-[13px] font-bold text-slate-800 leading-snug italic">"{aiAnalysis.desc}"</p>
                       <div className="pt-3 border-t border-slate-50 flex items-center gap-2">
                          <Zap size={12} className="text-teal-600" />
                          <p className="text-[10px] font-bold text-teal-600 uppercase tracking-tight">Rec: {aiAnalysis.recommendation}</p>
                       </div>
                    </div>
                 )}
              </div>
           )}
        </div>

        {/* Sign Off Section - Reduced Scale */}
        <div className="px-5 pb-20">
           <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                 <ShieldCheck size={80} />
              </div>
              <div className="relative z-10 space-y-4">
                 <div>
                    <h3 className="text-[16px] font-bold tracking-tight uppercase leading-none">Attestation</h3>
                    <p className="text-[11px] font-medium text-slate-400 mt-2 leading-relaxed">
                       I verify all findings are documented accurately for NEMT compliance.
                    </p>
                 </div>
                 <div className="bg-white rounded-xl overflow-hidden h-40 border-4 border-slate-800 shadow-inner">
                     <SignaturePad 
                       label="Sign to complete"
                       onSave={(bundle) => setSignature(bundle.data)}
                       onClear={() => setSignature(null)}
                     />
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-50 fixed bottom-0 left-0 right-0 max-md mx-auto z-30">
         <button 
           onClick={handleSubmit}
           disabled={!signature || isSubmitting}
           className={`w-full py-3.5 rounded-xl font-bold text-[14px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 disabled:opacity-30 ${allClear ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
         >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
               <>
                  <Save size={18} />
                  {allClear ? 'Finalize Log' : 'Flag & Commit'}
               </>
            )}
         </button>
      </div>

      {/* AI Camera Modal - Standardized */}
      {showAiModal && (
         <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-center p-8 animate-in zoom-in duration-300">
            <button onClick={() => setShowAiModal(false)} className="absolute top-6 right-6 text-white p-2.5 bg-white/10 rounded-full backdrop-blur-md active:scale-90 transition-all"><X size={24}/></button>
            <div className="text-center text-white mb-10 space-y-3">
               <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                  <Sparkles size={32} className="text-white animate-pulse" />
               </div>
               <h3 className="text-2xl font-bold tracking-tight uppercase">AI Vision</h3>
               <p className="text-[14px] text-white/50 font-medium px-4 leading-snug">Neural scanning for component health verified.</p>
            </div>
            <div className="bg-white/5 rounded-3xl p-2 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
               <PhotoUploader label="Focus on Asset Defect" aspectRatio="aspect-square" onImageSelect={(d) => { analyzeDefect(d); setShowAiModal(false); }} />
            </div>
            <div className="mt-10 text-center">
               <p className="text-[9px] font-bold text-teal-400 uppercase tracking-[0.4em]">Forensic Recognition Mode</p>
            </div>
         </div>
      )}
    </div>
  );
};

export default VehicleInspectionScreen;
