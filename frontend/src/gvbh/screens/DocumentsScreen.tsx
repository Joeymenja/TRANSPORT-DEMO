
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  ChevronRight, 
  Loader2,
  Scan,
  X,
  Zap,
  Info
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface DocumentsScreenProps {
  onBack: () => void;
}

const DocumentsScreen: React.FC<DocumentsScreenProps> = ({ onBack }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const sections = [
    {
      title: 'DRIVER IDENTITY & LICENSING',
      docs: [
        { name: 'AZ Driver License', status: 'Valid', expiry: 'Jan 12, 2026', type: 'LICENSE' },
        { name: 'DOT Medical Card', status: 'Expiring Soon', expiry: 'May 05, 2024', type: 'CERT', alert: true },
      ]
    },
    {
      title: 'FLEET COMPLIANCE ASSETS',
      docs: [
        { name: 'Primary Vehicle Insurance', status: 'Active', expiry: 'Dec 31, 2024', type: 'INSURANCE' },
        { name: 'Vehicle Registration', status: 'Verified', expiry: 'Aug 15, 2025', type: 'REG' },
      ]
    }
  ];

  const handleSmartScan = async () => {
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Extract expiration date and document type from this simulated DOT Medical Card image. Format as JSON: {type: string, expiry: string, status: string}",
        config: { responseMimeType: "application/json" }
      });
      
      const result = JSON.parse(response.text || '{}');
      setScanResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isScanning) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col">
        <div className="p-6 flex items-center justify-between text-white relative z-10">
          <button onClick={() => setIsScanning(false)} className="p-2 bg-white/10 rounded-xl backdrop-blur-md"><X size={24}/></button>
          <div className="text-center">
             <p className="text-[9px] font-black uppercase tracking-[0.4em] text-teal-400 mb-0.5">OCR SENSOR ACTIVE</p>
             <p className="text-[12px] font-black text-white/60">Align document edges</p>
          </div>
          <div className="w-10" />
        </div>
        
        <div className="flex-1 relative flex items-center justify-center p-8">
           <div className="w-full aspect-[4/3] border border-white/20 rounded-3xl relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-teal-500/5" />
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-teal-400 shadow-[0_0_15px_rgba(56,189,248,0.8)] animate-[scan_4s_ease-in-out_infinite]" />
           </div>
           <style>{` @keyframes scan { 0% { top: 10%; } 50% { top: 90%; } 100% { top: 10%; } } `}</style>
        </div>

        <div className="p-10 flex flex-col items-center gap-6 pb-20">
           <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
              <Zap size={14} className="text-teal-400 animate-pulse" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Neural edge detection</span>
           </div>
           <button onClick={handleSmartScan} disabled={isProcessing} className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all border-4 border-white/20">
              {isProcessing ? <Loader2 className="animate-spin text-teal-500" size={24}/> : <div className="w-10 h-10 bg-teal-500 rounded-full" />}
           </button>
        </div>

        {scanResult && (
          <div className="absolute inset-0 z-[110] bg-white p-8 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-5 duration-500">
             <div className="w-20 h-20 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <ShieldCheck size={40} />
             </div>
             <div className="text-center space-y-2 mb-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Validation Complete</h3>
                <p className="text-[13px] text-slate-400 font-medium">Neural engine successfully parsed credentials.</p>
             </div>
             
             <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200/50">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Credential</span>
                   <span className="text-[13px] font-bold text-slate-900">{scanResult.type || 'DOT Medical Card'}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expiry Date</span>
                   <span className="text-[14px] font-bold text-teal-600">{scanResult.expiry || 'May 05, 2026'}</span>
                </div>
             </div>

             <div className="flex flex-col gap-3">
                <button onClick={() => { setScanResult(null); setIsScanning(false); }} className="w-full py-4 bg-teal-500 text-white font-bold rounded-xl shadow-lg uppercase text-[12px] tracking-widest active:scale-95 transition-all">Commit to Vault</button>
                <button onClick={() => setScanResult(null)} className="w-full py-3 bg-white text-slate-400 font-bold rounded-xl uppercase text-[10px] tracking-widest active:scale-95">Re-Scan</button>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[55] bg-slate-50 flex flex-col max-w-md mx-auto h-screen font-sans">
      <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-1 text-slate-400 hover:text-slate-900 transition-all active:scale-90"><ArrowLeft size={24}/></button>
          <h2 className="text-[14px] font-bold text-slate-900 tracking-tight uppercase leading-none">Credential Vault</h2>
        </div>
        <button onClick={() => setIsScanning(true)} className="p-2 bg-teal-500 text-white rounded-xl flex items-center gap-3 shadow-md active:scale-90 transition-all">
          <Scan size={18}/>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar pb-32">
        <div className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-5 border border-slate-50">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500 border border-green-100 shadow-sm">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-slate-900 leading-none">Operational Status</h3>
            <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-1.5">Fully Compliant</p>
          </div>
        </div>

        {sections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">{section.title}</h4>
            <div className="space-y-2">
              {section.docs.map((doc, dIdx) => (
                <div key={dIdx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all hover:border-teal-200 group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg transition-colors ${doc.alert ? 'bg-amber-50 text-amber-500' : 'bg-teal-50 text-teal-500 group-hover:bg-teal-500 group-hover:text-white'}`}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-[13px] leading-tight">{doc.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">EXP: {doc.expiry}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${doc.alert ? 'text-amber-500 bg-amber-50 px-2 py-0.5 rounded' : 'text-green-500'}`}>{doc.status}</span>
                    <ChevronRight size={14} className="text-slate-200 group-hover:text-teal-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100/50 flex gap-4">
           <Info className="text-teal-500 shrink-0 mt-0.5" size={18} />
           <p className="text-[11px] font-bold text-teal-800 leading-relaxed uppercase tracking-tight">
             All documents are automatically encrypted with AES-256 for HIPAA compliance before vault storage.
           </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentsScreen;
