
import React, { useState } from 'react';
import { ONBOARDING_STEPS, COLORS } from '../constants';
import { ChevronRight, Camera, Check, ArrowLeft, Shield, PlayCircle, BookOpen, Signature as SignatureIcon, AlertCircle, CheckCircle2 } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [ssn, setSsn] = useState(['', '', '']);
  const [signature, setSignature] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    licenseNumber: '',
    licenseExp: '',
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: '',
    vin: '',
    agreedToBackground: false,
    quizPassed: false
  });

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-900">Personal Information</h2>
            <p className="text-sm text-gray-500 font-medium">Let's start with your basic details for AHCCCS verification.</p>
            <div className="space-y-3 pt-4">
              <input type="text" placeholder="First Name" className="w-full p-4 bg-white border border-gray-200 rounded-[20px] font-bold text-gray-800" />
              <input type="text" placeholder="Last Name" className="w-full p-4 bg-white border border-gray-200 rounded-[20px] font-bold text-gray-800" />
              <input type="email" placeholder="Email Address" className="w-full p-4 bg-white border border-gray-200 rounded-[20px] font-bold text-gray-800" />
              <input type="tel" placeholder="Phone Number" className="w-full p-4 bg-white border border-gray-200 rounded-[20px] font-bold text-gray-800" />
              <div className="relative">
                <input type="date" className="w-full p-4 bg-white border border-gray-200 rounded-[20px] font-bold text-gray-800" />
                <p className="absolute -top-2.5 left-4 bg-white px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date of Birth</p>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-900">License & Certs</h2>
            <p className="text-sm text-gray-500 font-medium">Upload your valid driver's license and medical certificates.</p>
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button className="flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[28px] hover:bg-teal-50 hover:border-teal-200 transition-all group">
                <Camera className="text-gray-300 mb-2 group-hover:text-teal-500 transition-colors" size={32} />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-teal-600">Front Side</span>
              </button>
              <button className="flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[28px] hover:bg-teal-50 hover:border-teal-200 transition-all group">
                <Camera className="text-gray-300 mb-2 group-hover:text-teal-500 transition-colors" size={32} />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-teal-600">Back Side</span>
              </button>
            </div>
            <div className="space-y-3">
               <input type="text" placeholder="License Number" className="w-full p-4 bg-white border border-gray-200 rounded-[20px] font-bold text-gray-800" />
               <div className="relative">
                <input type="date" className="w-full p-4 bg-white border border-gray-200 rounded-[20px] font-bold text-gray-800" />
                <p className="absolute -top-2.5 left-4 bg-white px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Expiration Date</p>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-900">Vehicle Information</h2>
            <p className="text-sm text-gray-500 font-medium">At least one primary vehicle is required to receive assignments.</p>
            <div className="space-y-3 pt-4">
              <div className="flex gap-2">
                <input type="text" placeholder="Year" className="w-1/3 p-4 bg-white border border-gray-200 rounded-[20px] font-bold text-gray-800" />
                <input type="text" placeholder="Make" className="w-2/3 p-4 bg-white border border-gray-200 rounded-[20px] font-bold text-gray-800" />
              </div>
              <input type="text" placeholder="Model" className="w-full p-4 bg-white border border-gray-200 rounded-[20px] font-bold text-gray-800" />
              <input type="text" placeholder="VIN (17 Characters)" className="w-full p-4 bg-white border border-gray-200 rounded-[20px] font-bold text-gray-800 uppercase" />
              <div className="p-5 bg-teal-50 rounded-[24px] flex items-start gap-4 border border-teal-100">
                <Shield size={24} className="text-teal-500 mt-1 shrink-0" />
                <p className="text-xs text-sky-700 font-medium leading-relaxed">Ensure your vehicle insurance covers NEMT operations as per Arizona state requirements for AHCCCS providers.</p>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-900">Background Authorization</h2>
            <p className="text-sm text-gray-500 font-medium">Compliance requires a criminal and motor vehicle background check.</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Social Security Number</label>
                <div className="flex items-center gap-2 px-2">
                  <input 
                    type="password" 
                    maxLength={3} 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] text-center font-black text-lg focus:bg-white focus:border-teal-500 transition-all" 
                    placeholder="000"
                    onChange={(e) => { const n = [...ssn]; n[0] = e.target.value; setSsn(n); }}
                  />
                  <span className="font-black text-gray-300">-</span>
                  <input 
                    type="password" 
                    maxLength={2} 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] text-center font-black text-lg focus:bg-white focus:border-teal-500 transition-all" 
                    placeholder="00"
                    onChange={(e) => { const n = [...ssn]; n[1] = e.target.value; setSsn(n); }}
                  />
                  <span className="font-black text-gray-300">-</span>
                  <input 
                    type="text" 
                    maxLength={4} 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] text-center font-black text-lg focus:bg-white focus:border-teal-500 transition-all" 
                    placeholder="0000"
                    onChange={(e) => { const n = [...ssn]; n[2] = e.target.value; setSsn(n); }}
                  />
                </div>
              </div>

              <div className="p-6 bg-white border-2 border-dashed border-gray-200 rounded-[32px] text-center space-y-4 relative active:bg-gray-50 transition-colors" onClick={() => setSignature(true)}>
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mx-auto">
                  <SignatureIcon size={28} />
                </div>
                {signature ? (
                  <p className="text-3xl font-serif italic text-gray-800 animate-in zoom-in duration-300">John Jenkins</p>
                ) : (
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Sign here with finger</p>
                )}
                {signature && <button className="absolute top-4 right-4 text-[10px] font-black text-teal-500 uppercase" onClick={(e) => { e.stopPropagation(); setSignature(false); }}>Clear</button>}
              </div>

              <div className="space-y-3 p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                <label className="flex items-start gap-4 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.agreedToBackground ? 'bg-teal-500 border-teal-500 text-white shadow-lg' : 'bg-white border-gray-200'}`}>
                    <input type="checkbox" className="hidden" checked={formData.agreedToBackground} onChange={() => setFormData({...formData, agreedToBackground: !formData.agreedToBackground})} />
                    {formData.agreedToBackground && <Check size={16} />}
                  </div>
                  <span className="text-[11px] text-gray-600 font-medium leading-relaxed">I authorize GVBH to obtain a consumer report for employment purposes and certify that all information is true.</span>
                </label>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-900">Policies & Training</h2>
            <p className="text-sm text-gray-500 font-medium">Complete these mandatory modules to activate your account.</p>
            
            <div className="space-y-3">
              {[
                { title: 'HIPAA Privacy & Security', duration: '15 min', icon: Shield, completed: true },
                { title: 'AHCCCS Compliance', duration: '10 min', icon: BookOpen, completed: true },
                { title: 'Safe Driving Practices', duration: '20 min', icon: PlayCircle, completed: false },
              ].map((m, i) => (
                <div key={i} className={`flex items-center justify-between p-5 rounded-[24px] border ${m.completed ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100 shadow-sm'}`}>
                   <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${m.completed ? 'bg-green-500 text-white' : 'bg-teal-50 text-teal-500'}`}><m.icon size={20}/></div>
                      <div>
                        <p className={`text-sm font-black ${m.completed ? 'text-green-800' : 'text-gray-800'}`}>{m.title}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{m.duration}</p>
                      </div>
                   </div>
                   {m.completed ? (
                     <CheckCircle2 className="text-green-500" size={20} />
                   ) : (
                     <button className="bg-teal-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Start</button>
                   )}
                </div>
              ))}
            </div>

            {quizFinished ? (
              <div className="p-8 bg-green-50 rounded-[40px] border border-green-100 text-center animate-in zoom-in duration-500">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-green-100">
                   <Check size={32} />
                </div>
                <h3 className="text-xl font-black text-green-800">Quiz Passed!</h3>
                <p className="text-sm text-green-600 font-bold mt-1">Score: 19/20 (95%)</p>
                <div className="mt-6 flex justify-center gap-3">
                  <button className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-green-700 border border-green-200 uppercase">View Certificate</button>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-teal-50 rounded-[40px] border border-teal-100 text-center">
                <AlertCircle size={32} className="text-teal-500 mx-auto mb-4" />
                <h3 className="text-lg font-black text-teal-800">Final Compliance Quiz</h3>
                <p className="text-xs text-teal-600 font-medium mt-2 leading-relaxed">Required to complete onboarding. Minimum 80% score required to pass.</p>
                <button 
                  onClick={() => setQuizFinished(true)}
                  className="mt-6 w-full bg-teal-500 text-white font-black py-4 rounded-[20px] shadow-lg shadow-teal-100 active:scale-95 transition-all uppercase tracking-widest text-xs"
                >
                  Start Quiz (20 Qs)
                </button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col max-w-md mx-auto h-screen">
      {/* Header */}
      <div className="px-6 py-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-100">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900 leading-none">GVBH Onboarding</h1>
              <p className="text-[9px] font-black text-teal-500 uppercase tracking-[0.2em] mt-1">Compliance Wizard</p>
            </div>
          </div>
          <div className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Step {currentStep}/5</span>
          </div>
        </div>
        
        {/* Progress Dots */}
        <div className="flex gap-2">
          {ONBOARDING_STEPS.map((step) => (
            <div 
              key={step.id} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step.id <= currentStep ? 'bg-teal-500 shadow-[0_0_8px_rgba(14,165,233,0.3)]' : 'bg-gray-100'}`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 no-scrollbar pb-32">
        {renderStepContent()}
      </div>

      {/* Footer Actions */}
      <div className="p-8 border-t border-gray-100 bg-white flex items-center justify-between gap-4">
        {currentStep > 1 && (
          <button 
            onClick={prevStep}
            className="flex items-center gap-2 text-gray-400 font-black px-4 py-3 uppercase tracking-widest text-[11px] hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        )}
        <button 
          onClick={nextStep}
          disabled={currentStep === 4 && (!signature || !formData.agreedToBackground || !ssn[2])}
          className={`flex-1 flex items-center justify-center gap-3 bg-teal-500 text-white font-black py-5 rounded-[28px] shadow-2xl shadow-teal-200 active:scale-95 transition-all text-sm uppercase tracking-widest ${currentStep === 1 ? 'w-full' : ''} ${currentStep === 4 && (!signature || !formData.agreedToBackground || !ssn[2]) ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
        >
          <span>{currentStep === 5 ? 'Finalize Profile' : 'Save & Continue'}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
