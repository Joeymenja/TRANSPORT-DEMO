
import React, { useState } from 'react';
import { ONBOARDING_STEPS, COLORS } from '../constants';
import { ChevronRight, Camera, Check, ArrowLeft, Shield, PlayCircle, BookOpen, PenTool, AlertCircle, CheckCircle2, X, Loader2, Sparkles, Car } from 'lucide-react';
import SignaturePad from '../components/SignaturePad';
import PhotoUploader from '../components/PhotoUploader';
import { GoogleGenAI } from "@google/genai";

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [ssn, setSsn] = useState(['', '', '']);
  const [signature, setSignature] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isOcrActive, setIsOcrActive] = useState(false);
  
  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const quizQuestions = [
    { q: "Wait time at pickup before No-Show?", options: ["5 Mins", "10 Mins", "15 Mins"], a: 1 },
    { q: "First step for wheelchair securement?", options: ["Attach floor hooks", "Ask client", "Lock brakes"], a: 2 },
    { q: "Who signs drop-off report?", options: ["Driver Only", "Client & Driver", "Staff Only"], a: 1 },
    { q: "When to report vehicle issues?", options: ["End of shift", "Immediately", "Next morning"], a: 1 }
  ];
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', dob: '',
    licenseNumber: '', licenseExp: '', licenseFront: '', licenseBack: '',
    agreedToBackground: false
  });

  const handleLicenseScan = async (photo: string) => {
    setFormData(prev => ({ ...prev, licenseFront: photo }));
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

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
    else onComplete();
  };

  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleAnswer = (index: number) => setSelectedAnswer(index);

  const handleNextQuestion = () => {
    if (selectedAnswer === quizQuestions[currentQuestion].a) setQuizScore(prev => prev + 1);
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setShowQuiz(false);
      setQuizFinished(true);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900">Personal Information</h2>
            <div className="space-y-3 pt-4">
              <input type="text" placeholder="First Name" className="w-full p-4 bg-white border border-gray-200 rounded-[20px] font-bold" />
              <input type="text" placeholder="Last Name" className="w-full p-4 bg-white border border-gray-200 rounded-[20px] font-bold" />
              <input type="tel" placeholder="Phone Number" className="w-full p-4 bg-white border border-gray-200 rounded-[20px] font-bold" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900">License & Certs</h2>
            <div className="grid grid-cols-2 gap-3 pt-4">
              <PhotoUploader label="Front Side" aspectRatio="aspect-[4/3]" onImageSelect={handleLicenseScan} />
              <PhotoUploader label="Back Side" aspectRatio="aspect-[4/3]" onImageSelect={d => setFormData({...formData, licenseBack: d})} />
            </div>
            {isOcrActive && (
               <div className="flex items-center gap-2 text-sky-500 bg-sky-50 p-3 rounded-xl justify-center">
                  <Loader2 className="animate-spin" size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">AI Scanning License...</span>
               </div>
            )}
            <div className="space-y-3">
               <input type="text" placeholder="License Number" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-[20px] font-bold" />
               <div className="relative">
                <input type="text" placeholder="YYYY-MM-DD" value={formData.licenseExp} onChange={e => setFormData({...formData, licenseExp: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-[20px] font-bold" />
                <p className="absolute -top-2.5 left-4 bg-white px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Expiration Date</p>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900">Vehicle Information</h2>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">You can add your primary vehicle now. VIN decoding will happen automatically in the Fleet section.</p>
            <div className="p-8 bg-sky-50 rounded-[40px] border border-sky-100 flex flex-col items-center text-center gap-4">
               <Car size={48} className="text-sky-500" />
               <p className="text-sm font-bold text-sky-900">Vehicle registration is required for insurance compliance.</p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900">Background Authorization</h2>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Social Security Number</label>
              <div className="flex items-center gap-2 px-2">
                <input type="password" maxLength={3} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] text-center font-black text-lg" placeholder="000" />
                <span className="font-black text-gray-300">-</span>
                <input type="password" maxLength={2} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] text-center font-black text-lg" placeholder="00" />
                <span className="font-black text-gray-300">-</span>
                <input type="text" maxLength={4} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] text-center font-black text-lg" placeholder="0000" onChange={e => setSsn(['','', e.target.value])} />
              </div>
              <SignaturePad label="Applicant Signature" saved={signature} onSave={() => setSignature(true)} onClear={() => setSignature(false)} />
              <label className="flex items-start gap-4 p-6 bg-gray-50 rounded-[32px] border border-gray-100 cursor-pointer">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.agreedToBackground ? 'bg-sky-500 border-sky-500 text-white' : 'bg-white border-gray-200'}`}>
                  <input type="checkbox" className="hidden" checked={formData.agreedToBackground} onChange={() => setFormData({...formData, agreedToBackground: !formData.agreedToBackground})} />
                  {formData.agreedToBackground && <Check size={16} />}
                </div>
                <span className="text-[11px] text-gray-600 font-medium leading-relaxed">I authorize GVBH to obtain a consumer report for background screening.</span>
              </label>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900">Policies & Training</h2>
            <div className="space-y-3">
              {['HIPAA Privacy', 'Insurance Compliance', 'Safe Driving'].map((m, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-white rounded-[24px] border border-gray-100 shadow-sm">
                   <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-sky-50 text-sky-500"><BookOpen size={20}/></div>
                      <p className="text-sm font-black text-gray-800">{m}</p>
                   </div>
                   <CheckCircle2 className="text-green-500" size={20} />
                </div>
              ))}
            </div>
            {quizFinished ? (
              <div className="p-8 bg-green-50 rounded-[40px] border border-green-100 text-center">
                <CheckCircle2 size={32} className="text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-black text-green-800">Quiz Passed!</h3>
                <p className="text-sm text-green-600 font-bold mt-1">Status: Compliance Verified</p>
              </div>
            ) : (
              <div className="p-8 bg-sky-50 rounded-[40px] border border-sky-100 text-center">
                <AlertCircle size={32} className="text-sky-500 mx-auto mb-4" />
                <h3 className="text-lg font-black text-sky-800">Final Compliance Quiz</h3>
                <button onClick={() => { setShowQuiz(true); setCurrentQuestion(0); setQuizScore(0); }} className="mt-6 w-full bg-sky-500 text-white font-black py-4 rounded-[20px] uppercase tracking-widest text-xs">Start Quiz</button>
              </div>
            )}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col max-w-md mx-auto h-screen">
      <div className="px-6 py-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500 rounded-2xl flex items-center justify-center text-white"><Shield size={24} /></div>
            <div><h1 className="text-lg font-black text-gray-900">GVBH Onboarding</h1><p className="text-[9px] font-black text-sky-500 uppercase tracking-[0.2em]">Step {currentStep}/5</p></div>
          </div>
        </div>
        <div className="flex gap-2">
          {ONBOARDING_STEPS.map((step) => (
            <div key={step.id} className={`h-1.5 flex-1 rounded-full ${step.id <= currentStep ? 'bg-sky-500 shadow-md' : 'bg-gray-100'}`} />
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-32">{renderStepContent()}</div>
      <div className="p-8 border-t bg-white flex items-center justify-between gap-4">
        {currentStep > 1 && <button onClick={prevStep} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[11px]"><span>Back</span></button>}
        <button onClick={nextStep} className="flex-1 bg-sky-500 text-white font-black py-5 rounded-[28px] shadow-2xl active:scale-95 text-sm uppercase tracking-widest">
          <span>{currentStep === 5 ? 'Finalize Profile' : 'Save & Continue'}</span>
          <ChevronRight size={18} />
        </button>
      </div>

      {showQuiz && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
           <div className="px-6 py-6 border-b flex items-center justify-between"><h2 className="text-xl font-black">Quiz</h2><button onClick={() => setShowQuiz(false)}><X size={20}/></button></div>
           <div className="flex-1 p-8 flex flex-col justify-center">
              <h3 className="text-2xl font-black mb-8 leading-tight">{quizQuestions[currentQuestion].q}</h3>
              <div className="space-y-4">
                 {quizQuestions[currentQuestion].options.map((opt, idx) => (
                    <button key={idx} onClick={() => handleAnswer(idx)} className={`w-full p-6 rounded-[24px] border-2 text-left transition-all ${selectedAnswer === idx ? 'border-sky-500 bg-sky-50 font-bold' : 'border-gray-100 font-medium'}`}>
                       {opt}
                    </button>
                 ))}
              </div>
           </div>
           <div className="p-8 border-t"><button onClick={handleNextQuestion} disabled={selectedAnswer === null} className="w-full bg-sky-500 text-white font-black py-5 rounded-[32px] disabled:opacity-50">Next Question</button></div>
        </div>
      )}
    </div>
  );
};

export default OnboardingScreen;
