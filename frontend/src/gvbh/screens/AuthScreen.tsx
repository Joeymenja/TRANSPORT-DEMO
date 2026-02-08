import React, { useState } from 'react';
import { Shield, Mail, Lock, User, ChevronRight, Eye, EyeOff, Fingerprint, Loader2 } from 'lucide-react';

interface AuthScreenProps {
  onLogin: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col max-w-md mx-auto h-full overflow-y-auto">
      <div className="flex-1 p-8 flex flex-col justify-center space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500 text-white rounded-lg shadow-md"><Shield size={24} /></div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">GVBH Dispatch</h1>
            <p className="text-[10px] text-teal-500 uppercase font-bold">Driver Access</p>
          </div>
        </div>

        <div className="space-y-6">
           <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 uppercase">{mode === 'login' ? 'Sign In' : 'Register'}</h2>
              <p className="text-[12px] text-slate-400">NEMT Operations Network</p>
           </div>

           <div className="space-y-3">
              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="First Name" className="w-full p-3 bg-slate-50 rounded-lg text-[13px] font-medium outline-none focus:bg-white border border-transparent focus:border-teal-200" />
                  <input type="text" placeholder="Last Name" className="w-full p-3 bg-slate-50 rounded-lg text-[13px] font-medium outline-none focus:bg-white border border-transparent focus:border-teal-200" />
                </div>
              )}
              <input type="email" placeholder="Email Address" className="w-full p-3 bg-slate-50 rounded-lg text-[13px] font-medium outline-none focus:bg-white border border-transparent focus:border-teal-200" />
              <div className="relative">
                 <input type={showPassword ? "text" : "password"} placeholder="Security Key" className="w-full p-3 bg-slate-50 rounded-lg text-[13px] font-medium outline-none focus:bg-white border border-transparent focus:border-teal-200" />
                 <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                 </button>
              </div>
           </div>

           <div className="flex gap-2">
              <button onClick={onLogin} className="flex-1 bg-teal-500 text-white font-bold py-3 rounded-lg text-[13px] uppercase shadow-md active:scale-95 transition-all">Continue</button>
              {mode === 'login' && <button className="p-3 bg-slate-900 text-white rounded-lg shadow-md active:scale-95"><Fingerprint size={20}/></button>}
           </div>

           <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="w-full text-center text-[12px] font-bold text-teal-500 uppercase mt-4">
              {mode === 'login' ? 'Request Fleet Access' : 'Return to Login'}
           </button>
        </div>

        <div className="text-center opacity-30 pt-8">
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">HIPAA COMPLIANT SECURE LOGON</p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;