
import React, { useState } from 'react';
import { ONBOARDING_STEPS } from '../constants';
import { ChevronRight, ArrowLeft, Shield, BookOpen, CheckCircle2, X, Loader2, Sparkles, Car, Check, AlertCircle } from 'lucide-react';
import SignaturePad from '../components/SignaturePad';
import PhotoUploader from '../components/PhotoUploader';
import { GoogleGenAI } from "@google/genai";

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [signature, setSignature] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isOcrActive, setIsOcrActive] = useState(false);
  
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const quizQuestions = [
    { q: "Wait time at pickup before No-Show?", options: ["5 Mins", "10 Mins", "15 Mins"], a: 1 },
    { q: "First step for wheelchair securement?", options: ["Attach floor hooks", "Ask client", "Lock brakes"], a: 2 },
  ];
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    licenseNumber: '', licenseExp: '', agreedToBackground: false
  });

  const handleLicenseScan = async (photo: string) => {
    setIsOcrActive(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { inlineData: { mimeType: 'image/jpeg', data: photo.split(',')[1] } },
          { text: "Extract Driver License Number and Expiration Date. Return JSON: {number: string, expiry: string}" }
        ],
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || '{}');
      setFormData(prev => ({
        ...prev,
        licenseNumber: data.number || prev.licenseNumber,
        licenseExp: data.expiry || prev.licenseExp
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsOcrActive(false);
    }
  };

  const nextStep = () => { if (currentStep < 5) setCurrentStep(currentStep + 1); else onComplete(); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleAnswer = (index: number) => setSelectedAnswer(index);
  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) { setCurrentQuestion(prev => prev + 1); setSelectedAnswer(null); } 
    else { setShowQuiz(false); setQuizFinished(true); }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Identity Details</h2>
              <p className="text-[12px] text-slate-400 font-medium uppercase tracking-widest">Enter official operator credentials.</p>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="First Name" className="w-full p-4 bg-slate-50 border border-transparent focus:bg-white focus:border-teal-500 rounded-xl font-bold text-[13px] outline-none transition-all shadow-inner" />
              <input type="text" placeholder="Last Name" className="w-full p-4 bg-slate-50 border border-transparent focus:bg-white focus:border-teal-500 rounded-xl font-bold text-[13px] outline-none transition-all shadow-inner" />
              <input type="tel" placeholder="Contact Phone" className="w-full p-4 bg-slate-50 border border-transparent focus:bg-white focus:border-teal-500 rounded-xl font-bold text-[13px] outline-none transition-all shadow-inner" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-slate-900 uppercase">Certification</h2>
            <div className="grid grid-cols-2 gap-3">
              <PhotoUploader label="FRONT" aspectRatio="h-28" onImageSelect={handleLicenseScan} />
              <PhotoUploader label="REVERSE" aspectRatio="h-28" onImageSelect={() => {}} />
            </div>
            {isOcrActive && (
               <div className="flex items-center gap-2 text-teal-500 bg-teal-50 p-4 rounded-xl justify-center animate-pulse">
                  <Loader2 className="animate-spin" size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Processing OCR...</span>
               </div>
            )}
            <div className="space-y-3">
               <input type="text" placeholder="License #" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-xl font-bold text-[13px] outline-none" />
               <input type="text" placeholder="Expiry: YYYY-MM-DD" value={formData.licenseExp} onChange={e => setFormData({...formData, licenseExp: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-xl font-bold text-[13px] outline-none" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-slate-900 uppercase">Fleet Asset</h2>
            <div className="space-y-4">
               <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-md text-teal-500"><Car size={24} /></div>
                  <p className="text-[11px] text-teal-800 font-bold uppercase tracking-tight">Active unit registration required for dispatch.</p>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" placeholder="Year" 
                    className="p-4 bg-slate-50 border-none rounded-xl font-bold text-[13px] outline-none shadow-inner" 
                    onChange={e => setFormData(prev => ({...prev, vehicleYear: e.target.value}))}
                  />
                  <input 
                    type="text" placeholder="Make" 
                    className="p-4 bg-slate-50 border-none rounded-xl font-bold text-[13px] outline-none shadow-inner" 
                    onChange={e => setFormData(prev => ({...prev, vehicleMake: e.target.value}))}
                  />
                  <input 
                    type="text" placeholder="Model" 
                    className="p-4 bg-slate-50 border-none rounded-xl font-bold text-[13px] outline-none col-span-2 shadow-inner" 
                    onChange={e => setFormData(prev => ({...prev, vehicleModel: e.target.value}))}
                  />
                  <input 
                    type="text" placeholder="License Plate" 
                    className="p-4 bg-slate-50 border-none rounded-xl font-bold text-[13px] outline-none col-span-2 shadow-inner" 
                    onChange={e => setFormData(prev => ({...prev, vehiclePlate: e.target.value}))}
                  />
                  <input 
                    type="text" placeholder="VIN Number" 
                    className="p-4 bg-slate-50 border-none rounded-xl font-bold text-[13px] outline-none col-span-2 shadow-inner uppercase" 
                    onChange={e => setFormData(prev => ({...prev, vehicleVin: e.target.value}))}
                  />
               </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-slate-900 uppercase">Vetting</h2>
            <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">SSN Confirmation</label>
                  <div className="flex items-center gap-2">
                    <input type="password" maxLength={3} className="w-full p-3 bg-slate-50 rounded-xl text-center font-bold text-lg outline-none" placeholder="000" />
                    <span className="text-slate-300">-</span>
                    <input type="password" maxLength={2} className="w-full p-3 bg-slate-50 rounded-xl text-center font-bold text-lg outline-none" placeholder="00" />
                    <span className="text-slate-300">-</span>
                    <input type="text" maxLength={4} className="w-full p-3 bg-slate-50 rounded-xl text-center font-bold text-lg outline-none" placeholder="0000" />
                  </div>
               </div>
               <div className="border border-slate-100 rounded-xl overflow-hidden h-32"><SignaturePad label="Sign within frame" saved={signature} onSave={() => setSignature(true)} onClear={() => setSignature(false)} /></div>
               <label className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
                <input type="checkbox" className="mt-1" checked={formData.agreedToBackground} onChange={() => setFormData({...formData, agreedToBackground: !formData.agreedToBackground})} />
                <span className="text-[11px] text-slate-600 font-bold leading-relaxed uppercase tracking-tight">I authorize consumer report verification.</span>
              </label>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-slate-900 uppercase">Compliance</h2>
            <div className="space-y-2">
              {['HIPAA Privacy', 'Billing Integrity', 'Defensive Transit'].map((m, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-50 shadow-sm">
                   <div className="flex items-center gap-3">
                      <BookOpen size={16} className="text-teal-500"/>
                      <p className="text-[13px] font-bold text-slate-800">{m}</p>
                   </div>
                   <CheckCircle2 size={16} className="text-green-500" />
                </div>
              ))}
            </div>
            {quizFinished ? (
              <div className="p-6 bg-green-50 rounded-2xl border border-green-100 text-center space-y-2">
                <CheckCircle2 size={32} className="text-green-500 mx-auto" />
                <p className="text-[14px] font-bold text-green-900 uppercase">Eligible for Dispatch</p>
              </div>
            ) : (
              <button onClick={() => { setShowQuiz(true); setCurrentQuestion(0); }} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl uppercase tracking-widest text-[11px] shadow-lg active:scale-95 transition-all">Launch Assessment</button>
            )}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col max-w-md mx-auto h-screen font-sans">
      <div className="px-6 py-8 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg"><Shield size={24} /></div>
          <div>
             <h1 className="text-lg font-bold text-slate-900 leading-none uppercase">GVBH Fleet</h1>
             <p className="text-[9px] font-bold text-teal-500 uppercase tracking-widest mt-1.5">Step {currentStep} of 5</p>
          </div>
        </div>
        <div className="flex gap-2">
          {ONBOARDING_STEPS.map((step) => (
            <div key={step.id} className={`h-1 flex-1 rounded-full transition-all duration-700 ${step.id <= currentStep ? 'bg-teal-500' : 'bg-slate-100'}`} />
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar"> {renderStepContent()} </div>

      <div className="p-6 border-t border-slate-100 bg-white/80 backdrop-blur-md flex items-center gap-4 fixed bottom-0 left-0 right-0 max-w-md mx-auto">
        {currentStep > 1 && (
           <button onClick={prevStep} className="p-4 rounded-xl bg-slate-50 text-slate-400 border border-slate-100"><ArrowLeft size={20} /></button>
        )}
        <button onClick={nextStep} className="flex-1 bg-teal-500 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all text-[13px] uppercase tracking-widest flex items-center justify-center gap-2">
          <span>{currentStep === 5 ? 'Finalize' : 'Continue'}</span>
          <ChevronRight size={18} />
        </button>
      </div>

      {showQuiz && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col p-6 animate-in slide-in-from-bottom-5">
           <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-bold text-slate-900 uppercase">Assessment</h2>
              <button onClick={() => setShowQuiz(false)} className="p-2 bg-slate-50 rounded-lg"><X size={20}/></button>
           </div>
           <div className="flex-1 flex flex-col justify-center space-y-8">
              <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">Question {currentQuestion + 1}</p>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">{quizQuestions[currentQuestion].q}</h3>
              <div className="space-y-3">
                 {quizQuestions[currentQuestion].options.map((opt, idx) => (
                    <button key={idx} onClick={() => handleAnswer(idx)} className={`w-full p-5 rounded-xl border-2 text-left transition-all font-bold text-[14px] ${selectedAnswer === idx ? 'border-teal-500 bg-teal-50' : 'border-slate-100 bg-white text-slate-600'}`}> {opt} </button>
                 ))}
              </div>
           </div>
           <button onClick={handleNextQuestion} disabled={selectedAnswer === null} className="w-full bg-teal-500 text-white font-bold py-4 rounded-xl text-[13px] uppercase tracking-widest shadow-lg mt-8 disabled:opacity-30"> Next Question </button>
        </div>
      )}
    </div>
  );
};

export default OnboardingScreen;
