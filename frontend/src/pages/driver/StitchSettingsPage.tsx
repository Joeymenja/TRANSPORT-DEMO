/**
 * Stitch Settings Screen - Integrated Version
 * Based on GVBH Transportation Driver App
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Lock, 
  Shield, 
  Globe, 
  Navigation, 
  Moon, 
  Bell, 
  Database, 
  ChevronRight
} from 'lucide-react';
import StitchBottomNav from '../../components/StitchBottomNav';

const StitchSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [biometric, setBiometric] = useState(true);
  const [autoUpload, setAutoUpload] = useState(false);
  const [theme, setTheme] = useState('Light');

  return (
    <div className="bg-gray-50 flex flex-col max-w-md mx-auto min-h-screen">
      {/* Header */}
      <div className="bg-white px-6 py-6 border-b border-gray-100 shadow-sm flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-1 -ml-2 text-gray-400 hover:text-gray-900">
          <ArrowLeft size={28}/>
        </button>
        <h2 className="text-xl font-black text-gray-900">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-40">
        {/* Account Security Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Account Security</h3>
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            <button className="w-full flex items-center justify-between p-5 active:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-teal-50 text-teal-500 rounded-lg"><Lock size={18}/></div>
                <span className="text-sm font-bold text-gray-700">Change Password</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-teal-50 text-teal-500 rounded-lg"><Shield size={18}/></div>
                <span className="text-sm font-bold text-gray-700">Biometric Login</span>
              </div>
              <button 
                onClick={() => setBiometric(!biometric)}
                className={`w-12 h-6 rounded-full transition-colors relative ${biometric ? 'bg-teal-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${biometric ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* App Preferences Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">App Preferences</h3>
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            <button className="w-full flex items-center justify-between p-5 active:bg-gray-50 text-left">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-teal-50 text-teal-500 rounded-lg"><Globe size={18}/></div>
                <div>
                  <p className="text-sm font-bold text-gray-700">Language</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">English (US)</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
            <button className="w-full flex items-center justify-between p-5 active:bg-gray-50 text-left">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-teal-50 text-teal-500 rounded-lg"><Navigation size={18}/></div>
                <div>
                  <p className="text-sm font-bold text-gray-700">Navigation App</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Google Maps</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-teal-50 text-teal-500 rounded-lg"><Moon size={18}/></div>
                <span className="text-sm font-bold text-gray-700">Theme</span>
              </div>
              <div className="flex bg-gray-50 p-1 rounded-xl">
                {['Light', 'Dark', 'Auto'].map((t) => (
                  <button 
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${theme === t ? 'bg-white text-teal-500 shadow-sm' : 'text-gray-400'}`}
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
                <div className="p-2 bg-teal-50 text-teal-500 rounded-lg"><Bell size={18}/></div>
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
                <div className="p-2 bg-teal-50 text-teal-500 rounded-lg"><Database size={18}/></div>
                <div>
                  <p className="text-sm font-bold text-gray-700">Auto-Upload on WiFi</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Photos & Sync</p>
                </div>
              </div>
              <button 
                onClick={() => setAutoUpload(!autoUpload)}
                className={`w-12 h-6 rounded-full transition-colors relative ${autoUpload ? 'bg-teal-500' : 'bg-gray-200'}`}
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
      <StitchBottomNav />
    </div>
  );
};

export default StitchSettingsPage;
