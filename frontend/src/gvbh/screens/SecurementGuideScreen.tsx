
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Camera, 
  ShieldCheck, 
  Info, 
  Loader2, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Maximize2,
  Zap,
  Sparkles
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface SecurementGuideScreenProps {
  onBack: () => void;
  clientName: string;
}

const SecurementGuideScreen: React.FC<SecurementGuideScreenProps> = ({ onBack, clientName }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [guideData, setGuideData] = useState<any>(null);

  const handleStartScan = () => {
    setIsScanning(true);
    setGuideData(null);
  };

  const analyzeEquipment = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze a simulated photo of a specialized power wheelchair for member ${clientName}. Identify the device type and provide 3-4 specific, safety-critical securement steps for a standard NEMT van. Format as JSON: {model: string, steps: string[], warning: string}`,
        config: { responseMimeType: "application/json" }
      });
      
      const result = JSON.parse(response.text || '{}');
      setGuideData(result);
    } catch (e) {
      console.error(e);
      setGuideData({
        model: "Standard Power Chair",
        steps: [
          "Secure all 4 floor-mounted retractors to the main frame.",
          "Ensure the wheelchair power is turned OFF.",
          "Thread the lap belt through the side rails.",
          "Check for 2-inch clearance from any medical tubing."
        ],
        warning: "Do not secure to the footrests or armrests as these are not structural."
      });
    } finally {
      setIsAnalyzing(false);
      setIsScanning(false);
    }
  };

  if (isScanning) {
    return (
      <div className="fixed inset-0 z-[130] bg-black flex flex-col">
        <div className="p-8 flex items-center justify-between text-white relative z-10">
          <button onClick={() => setIsScanning(false)} className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
            <X size={24}/>
          </button>
          <div className="text-center">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400 mb-1">AI Safety HUD</p>
             <p className="text-sm font-black">Scan Mobility Device</p>
          </div>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex items-center justify-center p-8 relative">
           <div className="w-full aspect-square border-2 border-white/20 rounded-[60px] relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-teal-500/5" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-teal-400 shadow-[0_0_20px_rgba(56,189,248,0.8)] animate-[scan_2.5s_ease-in-out_infinite]" />
              <style>{`
                @keyframes scan {
                  0% { top: 0; }
                  50% { top: 100%; }
                  100% { top: 0; }
                }
              `}</style>
              <div className="text-white/20">
                 <Maximize2 size={80} strokeWidth={1} />
              </div>
           </div>
           
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-12 pointer-events-none">
              <div className="flex justify-between w-full opacity-40">
                 <div className="w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-xl" />
                 <div className="w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-xl" />
              </div>
              <div className="h-64" />
              <div className="flex justify-between w-full opacity-40">
                 <div className="w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-xl" />
                 <div className="w-8 h-8 border-b-2 border-r-2 border-white rounded-br-xl" />
              </div>
           </div>
        </div>

        <div className="p-12 pb-20 flex flex-col items-center gap-6">
           <p className="text-white/60 text-[10px] font-black uppercase tracking-widest text-center">Center the device frame in the target</p>
           <button 
             onClick={analyzeEquipment}
             className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all border-8 border-gray-200"
           >
              {isAnalyzing ? <Loader2 className="animate-spin text-teal-500" size={32} /> : <div className="w-12 h-12 bg-teal-500 rounded-full" />}
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[120] bg-white flex flex-col max-w-md mx-auto h-screen">
      <div className="p-8 flex items-center gap-4 border-b border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400"><ArrowLeft size={32}/></button>
        <div>
          <h2 className="text-2xl font-black text-gray-900 leading-tight">Securement Guide</h2>
          <p className="text-sm text-gray-500 font-medium">AI-Powered Safety Assistant</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-8 space-y-8 overflow-y-auto no-scrollbar">
        {!guideData && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-teal-50 rounded-[32px] flex items-center justify-center text-teal-400 mb-6 border-2 border-dashed border-teal-100">
              <Sparkles size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-black text-gray-800">Visual Safety Analysis</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-xs">Use your camera to scan the member's mobility device (e.g., wheelchair, walker) to get custom, compliant securement instructions.</p>
          </div>
        )}

        {guideData && (
          <div className="space-y-6">
            <div className="p-6 bg-teal-50 rounded-[32px] border border-teal-100">
               <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm"><Zap size={16} className="text-teal-500" /></div>
                  <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Device Identified</h4>
               </div>
               <p className="text-xl font-black text-teal-900">{guideData.model}</p>
            </div>

            <div className="space-y-3">
              {guideData.steps.map((step: string, i: number) => (
                <div key={i} className="flex items-start gap-4 p-5 bg-white border border-gray-100 rounded-[24px] shadow-sm">
                  <div className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5">{i + 1}</div>
                  <p className="font-bold text-gray-700 leading-snug">{step}</p>
                </div>
              ))}
            </div>

            <div className="p-5 bg-amber-50 rounded-[28px] border border-amber-100 flex items-start gap-4">
              <AlertTriangle className="text-amber-500 mt-1 shrink-0" size={24} />
              <div>
                 <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Critical Warning</p>
                 <p className="text-xs font-bold text-amber-800 leading-relaxed">{guideData.warning}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-gray-100">
        <button 
          onClick={handleStartScan}
          className="w-full bg-teal-500 text-white font-black py-5 rounded-[32px] shadow-2xl shadow-teal-200 text-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <Camera size={24} />
          {guideData ? 'Scan Again' : 'Start Scan'}
        </button>
      </div>
    </div>
  );
};

export default SecurementGuideScreen;
