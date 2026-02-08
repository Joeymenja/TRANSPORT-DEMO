
import React, { useState } from 'react';
import { Shield, Mail, Lock, Phone, User, ChevronRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface AuthScreenProps {
  onLogin: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);

  const renderLogin = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
        <p className="text-gray-500 font-medium">Log in to manage your NEMT assignments.</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="email" 
            placeholder="Email Address" 
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-[24px] focus:bg-white focus:border-teal-500 transition-all font-medium"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-[24px] focus:bg-white focus:border-teal-500 transition-all font-medium"
          />
          <button 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={() => setMode('forgot')}
          className="text-xs font-black text-teal-500 uppercase tracking-widest"
        >
          Forgot Password?
        </button>
      </div>

      <button 
        onClick={onLogin}
        className="w-full bg-teal-500 text-white font-black py-5 rounded-[32px] shadow-2xl shadow-teal-200 text-lg active:scale-95 transition-all"
      >
        Sign In Securely
      </button>

      <p className="text-center text-sm text-gray-500 font-medium">
        Don't have an account? {' '}
        <button onClick={() => setMode('signup')} className="text-teal-500 font-black">Register Now</button>
      </p>
    </div>
  );

  const renderSignup = () => (
    <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Join GVBH</h2>
        <p className="text-gray-500 font-medium">Create your driver account to begin onboarding.</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="First Name" className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-[24px] text-sm font-medium" />
          </div>
          <div className="relative">
            <input type="text" placeholder="Last Name" className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-[24px] text-sm font-medium" />
          </div>
        </div>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-[24px] text-sm font-medium" />
        </div>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="tel" placeholder="Phone Number" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-[24px] text-sm font-medium" />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="password" placeholder="Create Password" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-[24px] text-sm font-medium" />
        </div>
      </div>

      <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100">
        <p className="text-[10px] text-sky-700 font-medium leading-relaxed">
          By registering, you agree to our Terms of Service and Privacy Policy. You will be required to undergo a background check.
        </p>
      </div>

      <button 
        onClick={onLogin}
        className="w-full bg-teal-500 text-white font-black py-5 rounded-[32px] shadow-2xl shadow-teal-200 text-lg"
      >
        Create Account
      </button>

      <p className="text-center text-sm text-gray-500 font-medium">
        Already registered? {' '}
        <button onClick={() => setMode('login')} className="text-teal-500 font-black">Sign In</button>
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-white max-w-md mx-auto h-screen flex flex-col p-8">
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-14 h-14 bg-teal-500 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-teal-100">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-none">GVBH</h1>
            <p className="text-[10px] font-black text-teal-500 uppercase tracking-[0.3em] mt-1">Transportation</p>
          </div>
        </div>

        {mode === 'login' ? renderLogin() : mode === 'signup' ? renderSignup() : (
          <div className="space-y-6 animate-in slide-in-from-left-10 duration-500">
            <button onClick={() => setMode('login')} className="flex items-center gap-2 text-gray-400 font-bold text-sm mb-4">
              <ArrowLeft size={18} /> Back to Login
            </button>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Reset Password</h2>
              <p className="text-gray-500 font-medium">Enter your email to receive a recovery link.</p>
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-[24px] font-medium" />
            </div>
            <button className="w-full bg-teal-500 text-white font-black py-5 rounded-[32px] shadow-xl shadow-teal-100">
              Send Reset Link
            </button>
          </div>
        )}
      </div>

      <div className="text-center space-y-4">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">AHCCCS Compliant Platform</p>
        <div className="flex justify-center gap-6">
          <span className="text-[10px] text-gray-300 font-bold uppercase">HIPAA Secure</span>
          <span className="text-[10px] text-gray-300 font-bold uppercase">v1.2.3</span>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
