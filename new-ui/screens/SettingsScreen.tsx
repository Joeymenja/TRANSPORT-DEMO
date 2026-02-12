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
  X
} from 'lucide-react';
import SignaturePad from '../components/SignaturePad';

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [biometric, setBiometric] = useState(true);
  const [autoUpload, setAutoUpload] = useState(false);
  const [theme, setTheme] = useState('Light');
  
  // Signature State
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [tempSignature, setTempSignature] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('driver_signature');
    if (saved) setSavedSignature(saved);
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

  return (
    <div className="fixed inset-0 z-[65] bg-gray-50 flex flex-col max-w-md mx-auto h-screen">
      {/* Header */}
      <div className="bg-white px-6 py-6 border-b border-gray-100 shadow-sm flex items-center gap-4">
        <button onClick={onBack} className="p-1 -ml-2 text-gray-400 hover:text-gray-900">
          <ArrowLeft size={28}/>
        </button>
        <h2 className="text-xl font-black text-gray-900">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-24">
        
        {/* Compliance & Identity */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Compliance & Identity</h3>
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
             
             {/* Digital Signature Row */}
             <div className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between" onClick={() => setShowSignatureModal(true)}>
                   <div className="flex items-center gap-4">
                      <div className="p-2 bg-sky-50 text-sky-500 rounded-lg"><PenTool size={18}/></div>
                      <div>
                         <span className="text-sm font-bold text-gray-700 block">Digital Signature</span>
                         <span className={`text-[10px] font-bold uppercase ${savedSignature ? 'text-green-500' : 'text-amber-500'}`}>
                            {savedSignature ? 'Saved on Device' : 'Not Configured'}
                         </span>
                      </div>
                   </div>
                   <ChevronRight size={18} className="text-gray-300" />
                </div>
                
                {savedSignature && (
                   <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                      <img src={savedSignature} alt="Signature" className="h-8 object-contain opacity-70" />
                      <button onClick={clearSignature} className="p-2 bg-white rounded-lg text-red-400 shadow-sm active:scale-95">
                         <Trash2 size={16} />
                      </button>
                   </div>
                )}
             </div>

             <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-sky-50 text-sky-500 rounded-lg"><Shield size={18}/></div>
                <span className="text-sm font-bold text-gray-700">Biometric Login</span>
              </div>
              <button 
                onClick={() => setBiometric(!biometric)}
                className={`w-12 h-6 rounded-full transition-colors relative ${biometric ? 'bg-sky-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${biometric ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Account Security Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Account Security</h3>
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            <button className="w-full flex items-center justify-between p-5 active:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-sky-50 text-sky-500 rounded-lg"><Lock size={18}/></div>
                <span className="text-sm font-bold text-gray-700">Change Password</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
          </div>
        </section>

        {/* App Preferences Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">App Preferences</h3>
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            <button className="w-full flex items-center justify-between p-5 active:bg-gray-50 text-left">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-sky-50 text-sky-500 rounded-lg"><Globe size={18}/></div>
                <div>
                  <p className="text-sm font-bold text-gray-700">Language</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">English (US)</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
            <button className="w-full flex items-center justify-between p-5 active:bg-gray-50 text-left">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-sky-50 text-sky-500 rounded-lg"><Navigation size={18}/></div>
                <div>
                  <p className="text-sm font-bold text-gray-700">Navigation App</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Google Maps</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-sky-50 text-sky-500 rounded-lg"><Moon size={18}/></div>
                <span className="text-sm font-bold text-gray-700">Theme</span>
              </div>
              <div className="flex bg-gray-50 p-1 rounded-xl">
                {['Light', 'Dark', 'Auto'].map((t) => (
                  <button 
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${theme === t ? 'bg-white text-sky-500 shadow-sm' : 'text-gray-400'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Notifications</h3>
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            <button className="w-full flex items-center justify-between p-5 active:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-sky-50 text-sky-500 rounded-lg"><Bell size={18}/></div>
                <span className="text-sm font-bold text-gray-700">Push Notification Settings</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
          </div>
        </section>

        {/* Data & Storage Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Data & Storage</h3>
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4 text-left">
                <div className="p-2 bg-sky-50 text-sky-500 rounded-lg"><Database size={18}/></div>
                <div>
                  <p className="text-sm font-bold text-gray-700">Auto-Upload on WiFi</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Photos & Sync</p>
                </div>
              </div>
              <button 
                onClick={() => setAutoUpload(!autoUpload)}
                className={`w-12 h-6 rounded-full transition-colors relative ${autoUpload ? 'bg-sky-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${autoUpload ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            <button className="w-full flex items-center justify-between p-5 active:bg-gray-50">
              <div className="flex items-center gap-4 text-left">
                <div className="p-2 bg-red-50 text-red-500 rounded-lg"><Database size={18}/></div>
                <div>
                  <p className="text-sm font-bold text-red-600">Clear App Cache</p>
                  <p className="text-[10px] text-red-400 font-bold uppercase">Free 124 MB</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        <div className="text-center p-4">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">v1.2.3 Build 441</p>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
         <div className="fixed inset-0 z-[100] bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white w-full rounded-[40px] p-6 shadow-2xl">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-gray-900">Create Signature</h3>
                  <button onClick={() => setShowSignatureModal(false)} className="p-2 bg-gray-50 rounded-xl"><X size={20}/></button>
               </div>
               
               <div className="mb-6">
                  <SignaturePad 
                     onSave={handleSaveSignature} 
                     onClear={() => setTempSignature(null)} 
                     label="Sign within the box"
                  />
               </div>

               <button 
                  onClick={confirmSignature}
                  disabled={!tempSignature}
                  className="w-full bg-sky-500 text-white font-black py-5 rounded-[28px] shadow-xl disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                  <Save size={18} /> Save Signature
               </button>
            </div>
         </div>
      )}
    </div>
  );
};

export default SettingsScreen;