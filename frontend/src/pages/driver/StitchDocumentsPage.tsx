/**
 * Stitch Documents/Compliance Screen - Integrated Version
 * Based on GVBH Transportation Driver App
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  ChevronRight, 
  Loader2,
  X,
  Zap
} from 'lucide-react';
import StitchBottomNav from '../../components/StitchBottomNav';

const StitchDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const sections = [
    {
      title: 'Driver License & Identity',
      docs: [
        { name: 'AZ Driver License', status: 'Valid', expiry: 'Jan 12, 2026', type: 'LICENSE' },
        { name: 'DOT Medical Card', status: 'Expiring', expiry: 'May 05, 2024', type: 'CERT', alert: true },
      ]
    },
    {
      title: 'Vehicle Documents',
      docs: [
        { name: 'Primary Vehicle Insurance', status: 'Valid', expiry: 'Dec 31, 2024', type: 'INSURANCE' },
        { name: 'Vehicle Registration', status: 'Valid', expiry: 'Aug 15, 2025', type: 'REG' },
      ]
    }
  ];

  const handleSmartScan = async () => {
    setIsProcessing(true);
    // Simulated AI scan
    setTimeout(() => {
      setScanResult({ type: 'DOT Medical Card', expiry: 'May 05, 2026', status: 'Valid' });
      setIsProcessing(false);
    }, 2000);
  };

  if (isScanning) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col">
        <div className="p-6 flex items-center justify-between text-white relative z-10">
          <button onClick={() => setIsScanning(false)}><X size={28}/></button>
          <span className="text-xs font-black uppercase tracking-widest">AHCCCS Document Scanner</span>
          <div className="w-10" />
        </div>
        
        <div className="flex-1 relative flex items-center justify-center p-12">
           <div className="w-full aspect-[3/2] border-2 border-white/30 rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-teal-500/10" />
              {/* Scanning line animation */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 bg-teal-400 shadow-[0_0_15px_rgba(56,189,248,0.8)]"
                style={{ animation: 'scan 3s ease-in-out infinite' }}
              />
           </div>
           <p className="absolute bottom-20 text-center text-white/60 text-xs font-bold px-12">
             Align the document within the frame. Detection is automatic.
           </p>
        </div>

        <div className="p-12 flex justify-center pb-20">
           <button 
             onClick={handleSmartScan}
             disabled={isProcessing}
             className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all border-8 border-gray-200"
           >
              {isProcessing ? <Loader2 className="animate-spin text-teal-500" size={32}/> : <div className="w-10 h-10 bg-teal-500 rounded-full" />}
           </button>
        </div>

        {scanResult && (
          <div className="absolute inset-0 z-[110] bg-white p-8 flex flex-col justify-center">
             <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={40} />
             </div>
             <h3 className="text-2xl font-black text-gray-900 text-center">Data Verified</h3>
             <p className="text-gray-500 text-center mb-10">AI extracted the following compliance data.</p>
             
             <div className="space-y-4 bg-gray-50 p-6 rounded-[32px] border border-gray-100 mb-10">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-gray-400 uppercase">Document Type</span>
                   <span className="text-sm font-black text-gray-900">{scanResult.type}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-gray-400 uppercase">Expiration</span>
                   <span className="text-sm font-black text-teal-600">{scanResult.expiry}</span>
                </div>
             </div>

             <div className="flex gap-4">
                <button onClick={() => setScanResult(null)} className="flex-1 py-5 bg-gray-100 text-gray-500 font-black rounded-[28px] uppercase text-xs">Retry</button>
                <button onClick={() => { setScanResult(null); setIsScanning(false); }} className="flex-1 py-5 bg-teal-500 text-white font-black rounded-[28px] shadow-xl shadow-teal-100 uppercase text-xs">Update Vault</button>
             </div>
          </div>
        )}

        <style>{`
          @keyframes scan {
            0% { top: 0; }
            50% { top: calc(100% - 4px); }
            100% { top: 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 flex flex-col max-w-md mx-auto min-h-screen">
      {/* Header */}
      <div className="bg-white px-6 py-6 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1 -ml-2 text-gray-400"><ArrowLeft size={24}/></button>
          <h2 className="text-xl font-black text-gray-900">Compliance Center</h2>
        </div>
        <button onClick={() => setIsScanning(true)} className="p-2 bg-teal-50 text-teal-500 rounded-xl flex items-center gap-2">
          <Zap size={16}/>
          <span className="text-[10px] font-black uppercase">Smart Scan</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-40">
        {/* Status Overview Card */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-green-50 rounded-[24px] flex items-center justify-center text-green-500 border border-green-100">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h3 className="font-black text-gray-900 leading-tight">Status: Compliant</h3>
            <p className="text-xs text-gray-500 font-medium">Verified for AHCCCS Operations</p>
          </div>
        </div>

        {/* Sections */}
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{section.title}</h4>
            <div className="space-y-3">
              {section.docs.map((doc, dIdx) => (
                <div key={dIdx} className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${doc.alert ? 'bg-amber-50 text-amber-500' : 'bg-teal-50 text-teal-500'}`}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-sm leading-tight">{doc.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Expires: {doc.expiry}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase ${doc.alert ? 'text-amber-500' : 'text-green-500'}`}>{doc.status}</span>
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}<StitchBottomNav />
      </div>
    </div>
  );
};

export default StitchDocumentsPage;
