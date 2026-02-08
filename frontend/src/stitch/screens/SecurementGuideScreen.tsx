
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
      // Fix: Followed GoogleGenAI initialization guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Simulate taking a photo of a wheelchair
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
             disabled={isAnalyzing}
             className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-90 transition-all border-8 border-gray-200"
           >
              {isAnalyzing ? <Loader2 className="animate-spin text-teal-500" size={32}/> : <div className="w-10 h-10 bg-teal-500 rounded-full" />}
           </button>
        </div>

        <style>{`
          @keyframes scan {
            0% { top: 0; opacity: 0.2; }
            50% { top: 100%; opacity: 1; }
            100% { top: 0; opacity: 0.2; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[125] bg-gray-900 flex flex-col max-w-md mx-auto h-screen overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] -ml-32 -mb-32" />

      {/* Header */}
      <div className="relative px-8 py-8 flex items-center justify-between border-b border-white/5">
        <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl text-white backdrop-blur-md">
          <ArrowLeft size={24}/>
        </button>
        <div className="text-center">
           <p className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] mb-1">Equipment Compliance</p>
           <h2 className="text-xl font-black text-white">Securement Guide</h2>
        </div>
        <div className="w-12" />
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar relative z-10">
        {!guideData ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in duration-500">
             <div className="w-32 h-32 bg-white/5 border border-white/10 rounded-[48px] flex items-center justify-center text-teal-400 relative">
                <ShieldCheck size={56} />
                <div className="absolute -bottom-2 -right-2 bg-teal-500 p-3 rounded-2xl shadow-xl"><Zap size={20} className="text-white" /></div>
             </div>
             <div className="space-y-4">
                <h3 className="text-2xl font-black text-white">Safety First</h3>
                <p className="text-gray-400 text-sm font-medium leading-relaxed px-6">
                  Taking a few seconds to scan a member's chair ensures they are secured per federal safety standards.
                </p>
             </div>
             <button 
               onClick={handleStartScan}
               className="w-full bg-teal-500 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-teal-500/20 text-lg active:scale-95 transition-all flex items-center justify-center gap-3"
             >
               <Camera size={24} /> Scan Mobility Device
             </button>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
             {/* Analysis Header */}
             <div className="bg-white/5 border border-white/10 p-8 rounded-[44px] backdrop-blur-xl">
                <div className="flex items-center gap-4 mb-6">
                   <div className="p-3 bg-teal-500 text-white rounded-2xl shadow-lg"><Sparkles size={24}/></div>
                   <div>
                      <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1">Identified Model</p>
                      <h3 className="text-2xl font-black text-white leading-none">{guideData.model}</h3>
                   </div>
                </div>

                <div className="space-y-4">
                   {guideData.steps.map((step: string, i: number) => (
                     <div key={i} className="flex gap-4 group">
                        <div className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-teal-500 transition-colors">
                           {i + 1}
                        </div>
                        <p className="text-gray-300 text-sm font-medium leading-relaxed pt-1.5">{step}</p>
                     </div>
                   ))}
                </div>

                <div className="mt-8 pt-8 border-t border-white/10">
                   <div className="flex items-start gap-4 p-5 bg-amber-500/10 border border-amber-500/20 rounded-[28px]">
                      <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                      <div>
                         <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Critical Safety Warning</p>
                         <p className="text-[11px] text-amber-200/80 font-medium leading-relaxed">{guideData.warning}</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-4 p-6 bg-green-500/10 border border-green-500/20 rounded-[32px]">
                <CheckCircle2 size={24} className="text-green-500" />
                <p className="text-xs font-bold text-green-200">I have verified all securement points according to these instructions.</p>
             </div>

             <button 
               onClick={onBack}
               className="w-full bg-white text-gray-900 font-black py-6 rounded-[32px] shadow-2xl shadow-white/5 text-lg active:scale-95 transition-all"
             >
               Return to Boarding
             </button>
          </div>
        )}
      </div>

      {/* Manual Helper */}
      {!guideData && (
        <div className="p-8 text-center pb-12">
           <button className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto">
              <Info size={14} /> View Standard Tie-Down Procedures
           </button>
        </div>
      )}
    </div>
  );
};

export default SecurementGuideScreen;
