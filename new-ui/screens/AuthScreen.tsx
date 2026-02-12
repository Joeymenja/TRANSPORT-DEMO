
import React, { useState } from 'react';
import { Shield, Mail, Lock, Phone, User, ChevronRight, ArrowLeft, Eye, EyeOff, Fingerprint, Loader2 } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (credentials: any) => Promise<void>;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBiometricActive, setIsBiometricActive] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await onLogin({ email, password });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    // Placeholder for Google Auth
    setIsGoogleLoading(true);
  };

  const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 48 48" className="mr-3">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col max-w-md mx-auto h-full overflow-y-auto no-scrollbar">
      <div className="flex-1 p-8 flex flex-col justify-center min-h-full">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 bg-sky-500 rounded-[24px] flex items-center justify-center text-white shadow-xl">
            <Shield size={36} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 leading-none">GVBH</h1>
            <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em] mt-1">Transportation</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">{mode === 'login' ? 'Driver Access' : 'Create Account'}</h2>
            <p className="text-gray-500 font-medium">Authorized Operator Portal</p>
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center py-4 bg-white border-2 border-gray-100 rounded-[28px] shadow-sm active:scale-[0.98] transition-all group"
          >
            {isGoogleLoading ? <Loader2 className="animate-spin text-sky-500" size={20} /> : <><GoogleIcon /><span className="text-sm font-black text-gray-700 uppercase tracking-widest">Continue with Google</span></>}
          </button>

          <div className="flex items-center gap-4 py-2 opacity-30"><div className="flex-1 h-px bg-gray-400" /><span className="text-[10px] font-black uppercase">OR</span><div className="flex-1 h-px bg-gray-400" /></div>

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Work Email"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-[24px] font-medium"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-[24px] font-medium"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </div>

          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-sky-500 text-white font-black py-5 rounded-[32px] shadow-2xl shadow-sky-200 text-lg active:scale-95 transition-all">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Sign In'}
            </button>
            <button onClick={() => setIsBiometricActive(true)} className="w-20 bg-gray-900 text-white rounded-[32px] flex items-center justify-center shadow-xl active:scale-90 transition-all">
              {isBiometricActive ? <Loader2 className="animate-spin" size={24} /> : <Fingerprint size={32} />}
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 font-bold uppercase tracking-widest pt-4">
            {mode === 'login' ? 'New to fleet?' : 'Already registered?'} <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-sky-500 font-black underline decoration-sky-200 underline-offset-4">Toggle Profile</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
