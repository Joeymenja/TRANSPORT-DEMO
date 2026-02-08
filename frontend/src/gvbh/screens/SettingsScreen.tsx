
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Lock, 
  Shield, 
  Globe, 
  Navigation, 
  Moon, 
  Bell, 
  Database, 
  ChevronRight,
  PenTool,
  Trash2,
  Save,
  X,
  UserCheck,
  Volume2,
  VolumeX
} from 'lucide-react';
import SignaturePad from '../components/SignaturePad';
import { ttsService } from '../services/TTSService';

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [biometric, setBiometric] = useState(true);
  const [autoUpload, setAutoUpload] = useState(false);
  const [theme, setTheme] = useState('Light');
  const [isVoiceMuted, setIsVoiceMuted] = useState(ttsService.getMuted());
  
  // Signature State
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [tempSignature, setTempSignature] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('driver_signature');
    if (saved) setSavedSignature(saved);
    
    const handleMuteChange = (e: any) => setIsVoiceMuted(e.detail.muted);
    window.addEventListener('voice-mute-change', handleMuteChange);
    return () => window.removeEventListener('voice-mute-change', handleMuteChange);
  }, []);

  const handleSaveSignature = (data: string) => {
    setTempSignature(data);
  };

  const confirmSignature = () => {
    if (tempSignature) {
      localStorage.setItem('driver_signature', tempSignature);
      setSavedSignature(tempSignature);
      setShowSignatureModal(false);
    }
  };

  const clearSignature = () => {
    localStorage.removeItem('driver_signature');
    setSavedSignature(null);
    setTempSignature(null);
  };

  const toggleVoice = () => {
    const newState = !isVoiceMuted;
    ttsService.setMuted(newState);
  };

  return (
    <div className="fixed inset-0 z-[65] bg-gray-50 flex flex-col max-w-md mx-auto h-screen overflow-hidden font-sans">
      {/* Header - Standard Scale */}
      <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-1 text-gray-400 active:scale-90 transition-all">
            <ArrowLeft size={24}/>
          </button>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none uppercase">Settings</h2>
        </div>
        <div className="w-10 h-10 bg-teal-50 text-teal-500 rounded-xl flex items-center justify-center shadow-inner"><UserCheck size={20}/></div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6 pb-32">
        
        {/* Compliance & Identity */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">SECURITY & IDENTITY</h3>
          <div className="bg-white rounded-2xl border border-gray-50 shadow-sm overflow-hidden divide-y divide-gray-50">
             
             {/* Digital Signature Row - Standardized */}
             <div className="p-5 space-y-4">
                <div className="flex items-center justify-between group cursor-pointer" onClick={() => setShowSignatureModal(true)}>
                   <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-teal-50 text-teal-500 rounded-xl shadow-inner group-hover:bg-teal-100 transition-colors"><PenTool size={20}/></div>
                      <div>
                         <span className="text-[14px] font-bold text-gray-800 block">Digital Identity</span>
                         <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 inline-block ${savedSignature ? 'text-green-500' : 'text-amber-500'}`}>
                            {savedSignature ? 'SECURED' : 'ACTION REQUIRED'}
                         </span>
                      </div>
                   </div>
                   <ChevronRight size={16} className="text-gray-200 group-hover:text-teal-500 transition-colors" />
                </div>
                
                {savedSignature && (
                   <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between shadow-inner">
                      <img src={savedSignature} alt="Signature" className="h-8 object-contain opacity-50 grayscale" />
                      <button onClick={clearSignature} className="p-2.5 bg-white rounded-lg text-red-400 shadow-md active:scale-90 border border-red-50 transition-colors">
                         <Trash2 size={16} />
                      </button>
                   </div>
                )}
             </div>

             <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-teal-50 text-teal-500 rounded-xl shadow-inner"><Shield size={20}/></div>
                <span className="text-[14px] font-bold text-gray-800">Biometric Link</span>
              </div>
              <button 
                onClick={() => setBiometric(!biometric)}
                className={`w-10 h-5 rounded-full transition-all relative ${biometric ? 'bg-teal-500 shadow-md' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${biometric ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* System Preferences */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">OPERATIONAL CORE</h3>
          <div className="bg-white rounded-2xl border border-gray-50 shadow-sm divide-y divide-gray-50">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl shadow-inner transition-colors ${isVoiceMuted ? 'bg-slate-100 text-slate-400' : 'bg-teal-50 text-teal-500'}`}>
                  {isVoiceMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}
                </div>
                <div>
                   <p className="text-[14px] font-bold text-gray-800 leading-none">Voice Assistant</p>
                   <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-widest">{isVoiceMuted ? 'DISABLED' : 'ACTIVE'}</p>
                </div>
              </div>
              <button 
                onClick={toggleVoice}
                className={`w-10 h-5 rounded-full transition-all relative ${!isVoiceMuted ? 'bg-teal-500 shadow-md' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${!isVoiceMuted ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <button className="w-full flex items-center justify-between p-5 active:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-4 text-left">
                <div className="p-2.5 bg-gray-50 text-gray-400 rounded-xl shadow-inner group-hover:text-teal-500 group-hover:bg-teal-50 transition-all"><Globe size={20}/></div>
                <div>
                  <p className="text-[14px] font-bold text-gray-800 leading-none">Language</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-widest">English (US-INT)</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-gray-200" />
            </button>
            
            <button className="w-full flex items-center justify-between p-5 active:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-4 text-left">
                <div className="p-2.5 bg-gray-50 text-gray-400 rounded-xl shadow-inner group-hover:text-teal-500 group-hover:bg-teal-50 transition-all"><Navigation size={20}/></div>
                <div>
                  <p className="text-[14px] font-bold text-gray-800 leading-none">Mapping Engine</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Google Fleet Maps</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-gray-200" />
            </button>
          </div>
        </section>

        <div className="text-center pt-6 pb-20 opacity-40">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">GVBH CORE v1.2.3 • B-441</p>
          <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-1">HIPAA 2026 COMPLIANCE PROTOCOL</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
