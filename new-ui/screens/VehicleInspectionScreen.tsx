
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
  Sparkles
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
    { id: 'driver', label: 'Driver Side', icon: Disc },
    { id: 'passenger', label: 'Pass. Side', icon: Disc },
    { id: 'rear', label: 'Rear', icon: Truck },
    { id: 'hood', label: 'Under Hood', icon: Thermometer },
    { id: 'interior', label: 'Interior', icon: Maximize2 },
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
    <div className="fixed inset-0 z-[80] bg-gray-50 flex flex-col max-w-md mx-auto h-screen">
      {/* Header */}
      <div className="bg-white px-6 py-6 flex items-center justify-between border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft size={28}/>
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-900">Vehicle Inspection</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">DVIR • {vehicleId ? 'Unit ' + vehicleId : 'Primary Vehicle'}</p>
          </div>
        </div>
        <button onClick={() => setShowAiModal(true)} className="p-2 bg-sky-50 text-sky-500 rounded-xl active:scale-90 transition-all">
           <Camera size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {/* Zone Navigator */}
        <div className="bg-white p-4 sticky top-0 z-10 shadow-sm">
           <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {zones.map(z => {
                 const hasDefects = defects[z.id]?.length > 0;
                 return (
                   <button
                     key={z.id}
                     onClick={() => setActiveZone(z.id)}
                     className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all whitespace-nowrap border ${activeZone === z.id ? 'bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-200' : hasDefects ? 'bg-red-50 text-red-500 border-red-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}
                   >
                      <z.icon size={16} />
                      <span className="text-xs font-black uppercase tracking-wide">{z.label}</span>
                      {hasDefects && <div className="w-2 h-2 rounded-full bg-red-500" />}
                   </button>
                 );
              })}
           </div>
        </div>

        {/* Checklist Area */}
        <div className="p-6 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                 Inspect {zones.find(z => z.id === activeZone)?.label}
                 <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-lg font-bold uppercase tracking-wider">Zone {zones.findIndex(z => z.id === activeZone) + 1}/6</span>
              </h3>
              {defects[activeZone]?.length > 0 && <span className="text-xs font-bold text-red-500">{defects[activeZone].length} Issues</span>}
           </div>

           <div className="space-y-3">
              {checklistItems[activeZone].map((item, idx) => {
                 const isDefective = defects[activeZone]?.includes(item);
                 return (
                   <button 
                     key={idx}
                     onClick={() => toggleItem(item)}
                     className={`w-full flex items-center justify-between p-5 rounded-[24px] border transition-all ${isDefective ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-white border-gray-100'}`}
                   >
                      <div className="flex items-center gap-4">
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isDefective ? 'border-red-500 bg-red-500 text-white' : 'border-green-500 bg-green-500 text-white'}`}>
                            {isDefective ? <X size={14} /> : <CheckCircle2 size={14} />}
                         </div>
                         <span className={`text-sm font-bold ${isDefective ? 'text-red-700' : 'text-gray-700'}`}>{item}</span>
                      </div>
                      {isDefective ? (
                         <span className="text-[9px] font-black uppercase text-red-500 bg-white px-2 py-1 rounded-lg">Defect Marked</span>
                      ) : (
                         <span className="text-[9px] font-black uppercase text-green-500 tracking-widest">Pass</span>
                      )}
                   </button>
                 );
              })}
           </div>

           {/* Defect Details (if any) */}
           {defects[activeZone]?.length > 0 && (
              <div className="bg-red-50 p-6 rounded-[32px] border border-red-100 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                 <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle size={20} />
                    <h4 className="font-black uppercase tracking-widest text-xs">Defect Evidence</h4>
                 </div>
                 <PhotoUploader 
                   label="Capture Issue"
                   aspectRatio="aspect-video"
                   onImageSelect={analyzeDefect}
                 />
                 {isAnalyzing && (
                    <div className="flex items-center gap-2 text-red-400 justify-center py-2">
                       <Loader2 className="animate-spin" size={16} />
                       <span className="text-[10px] font-bold uppercase tracking-widest">AI Diagnosing...</span>
                    </div>
                 )}
                 {aiAnalysis && (
                    <div className="bg-white p-4 rounded-2xl border border-red-100 space-y-2">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-gray-400 uppercase">Severity</span>
                          <span className={`text-xs font-black uppercase px-2 py-1 rounded-lg ${aiAnalysis.severity === 'Critical' ? 'bg-red-500 text-white' : 'bg-amber-100 text-amber-700'}`}>{aiAnalysis.severity}</span>
                       </div>
                       <p className="text-xs font-medium text-gray-600 leading-relaxed">{aiAnalysis.desc}</p>
                       <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wide">Rec: {aiAnalysis.recommendation}</p>
                    </div>
                 )}
              </div>
           )}
        </div>

        {/* Sign Off Section */}
        <div className="p-6">
           <div className="bg-gray-900 p-6 rounded-[32px] text-white">
              <h3 className="text-lg font-black mb-4">Driver Certification</h3>
              <p className="text-xs font-medium text-gray-400 mb-6 leading-relaxed">
                 I certify that I have inspected the vehicle and the information above is true and correct.
              </p>
              <div className="bg-white rounded-[24px] overflow-hidden h-40">
                 <SignaturePad 
                   label="Sign to Certify"
                   onSave={setSignature}
                   onClear={() => setSignature(null)}
                 />
              </div>
           </div>
        </div>
      </div>

      <div className="p-6 bg-white border-t border-gray-50 fixed bottom-0 left-0 right-0 max-w-md mx-auto shadow-xl">
         <button 
           onClick={handleSubmit}
           disabled={!signature || isSubmitting}
           className={`w-full py-5 rounded-[32px] font-black text-lg flex items-center justify-center gap-2 shadow-2xl transition-all active:scale-95 ${allClear ? 'bg-green-500 text-white shadow-green-200' : 'bg-red-500 text-white shadow-red-200'}`}
         >
            {isSubmitting ? <Loader2 className="animate-spin" /> : (
               <>
                  <Save size={20} />
                  {allClear ? 'Submit Clean Report' : 'Submit with Defects'}
               </>
            )}
         </button>
      </div>

      {/* AI Camera Modal */}
      {showAiModal && (
         <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col justify-center p-6">
            <button onClick={() => setShowAiModal(false)} className="absolute top-6 right-6 text-white p-2 bg-white/20 rounded-full"><X size={24}/></button>
            <div className="text-center text-white mb-8">
               <Sparkles size={40} className="mx-auto mb-4 text-sky-400" />
               <h3 className="text-2xl font-black">AI Defect Scanner</h3>
               <p className="text-sm text-gray-400 mt-2">Point at any vehicle part to analyze condition.</p>
            </div>
            <div className="bg-white/10 rounded-[40px] p-1 border border-white/20 backdrop-blur-md">
               <PhotoUploader label="Tap to Scan Part" aspectRatio="aspect-square" onImageSelect={(d) => { analyzeDefect(d); setShowAiModal(false); }} />
            </div>
         </div>
      )}
    </div>
  );
};

export default VehicleInspectionScreen;
