
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Save, User, MapPin, Calendar, Clock, ClipboardCheck, 
  CheckCircle2, Loader2, X, Users, HeartPulse, UserPlus, 
  Fingerprint, ShieldCheck, Eye, ChevronRight, FileDigit, Gauge, BookOpen, AlertCircle
} from 'lucide-react';
import SignaturePad from '../components/SignaturePad';
import PhotoUploader from '../components/PhotoUploader';
import { generateTripReport } from '../utils/ReportGenerator';

interface ManualReportScreenProps {
  onBack: () => void;
}

const TimePicker: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => {
  const [hour, setHour] = useState(value ? value.split(':')[0] : '08');
  const [min, setMin] = useState(value ? value.split(':')[1].split(' ')[0] : '00');
  const [period, setPeriod] = useState(value ? value.split(' ')[1] : 'AM');

  const update = (h: string, m: string, p: string) => {
    onChange(`${h}:${m} ${p}`);
  };

  return (
    <div className="bg-white p-3 rounded-[28px] border border-gray-100 shadow-sm space-y-2">
      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest text-center">{label}</p>
      <div className="flex items-center justify-center gap-1">
        <select 
          value={hour} 
          onChange={(e) => { setHour(e.target.value); update(e.target.value, min, period); }} 
          className="p-1.5 bg-gray-50 rounded-xl font-black text-center outline-none border-none text-[10px] appearance-none w-10"
        >
          {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <span className="font-black text-gray-200 text-[10px]">:</span>
        <select 
          value={min} 
          onChange={(e) => { setMin(e.target.value); update(e.target.value, min, period); }} 
          className="p-1.5 bg-gray-50 rounded-xl font-black text-center outline-none border-none text-[10px] appearance-none w-10"
        >
          {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <div className="flex bg-gray-50 p-0.5 rounded-lg border border-gray-100 ml-0.5">
          {['AM', 'PM'].map(p => (
            <button 
              key={p} 
              type="button"
              onClick={() => { setPeriod(p); update(hour, min, p); }} 
              className={`px-1.5 py-1 rounded-md text-[7px] font-black transition-all ${period === p ? 'bg-white text-sky-500 shadow-sm' : 'text-gray-300'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ManualReportScreen: React.FC<ManualReportScreenProps> = ({ onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [signatures, setSignatures] = useState({ driver: false, member: false });
  
  const [form, setForm] = useState({
    memberName: '',
    memberId: '',
    dob: '',
    mailingAddress: '',
    reasonForVisit: '',
    escortName: '',
    escortRelationship: '',
    startOdo: '',
    endOdo: '',
    date: new Date().toISOString().split('T')[0],
    pickupTime: '08:00 AM',
    dropoffTime: '08:30 AM',
    multiMember: false,
    diffLocations: false,
    pickupAddr: '',
    dropoffAddr: ''
  });

  const calculatedMiles = useMemo(() => {
    const start = parseFloat(form.startOdo);
    const end = parseFloat(form.endOdo);
    if (isNaN(start) || isNaN(end)) return 0;
    return Math.max(0, end - start);
  }, [form.startOdo, form.endOdo]);

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    // Generate the official PDF for device storage/sync
    setTimeout(() => {
      generateTripReport({
        ...form,
        client: form.memberName,
        totalMiles: calculatedMiles
      });
      setIsSubmitting(false);
      setShowSuccess(true);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Audit Log Synchronized', type: 'success' } }));
    }, 1800);
  };

  const isFormValid = form.memberName && form.memberId && form.dob && form.mailingAddress && form.reasonForVisit && form.startOdo && form.endOdo && form.pickupAddr && form.dropoffAddr && calculatedMiles > 0;

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-[120] bg-sky-500 flex flex-col items-center justify-center p-12 text-center text-white max-w-md mx-auto h-screen animate-in fade-in">
        <div className="w-32 h-32 bg-white rounded-[48px] flex items-center justify-center mb-10 shadow-2xl animate-bounce">
          <CheckCircle2 size={72} className="text-sky-500" />
        </div>
        <h2 className="text-5xl font-black leading-none mb-4 tracking-tighter uppercase">Audit<br/>Synchronized</h2>
        <p className="text-sky-100/60 font-black uppercase tracking-[0.3em] mb-4">Transmission ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-[32px] border border-white/10 mb-12 w-full">
           <p className="text-xs font-bold leading-relaxed">
             Trip report for <strong>{form.memberName}</strong> including <strong>{calculatedMiles} miles</strong> has been archived.
           </p>
        </div>
        <button 
          onClick={onBack} 
          className="w-full bg-white text-sky-600 font-black py-6 rounded-[36px] shadow-xl text-xl active:scale-95 transition-all"
        >
          Return to Portal
        </button>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="fixed inset-0 z-[110] bg-gray-100 flex flex-col max-w-md mx-auto h-full animate-in fade-in">
        <div className="bg-white px-6 py-6 border-b border-gray-100 flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-4">
              <button onClick={() => setShowPreview(false)} className="p-1 -ml-2 text-gray-400 hover:text-gray-900 transition-colors"><ArrowLeft size={28}/></button>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Audit Verification</h2>
           </div>
           <FileDigit size={24} className="text-sky-500" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
           <div className="bg-white shadow-2xl rounded-[4px] min-h-[900px] w-full p-6 font-serif border border-gray-300 relative">
              <div className="flex justify-between items-start border-b-2 border-gray-900 pb-3 mb-4">
                <div className="max-w-[50%]">
                  <p className="text-[7px] font-black text-gray-900">Provider Information</p>
                  <div className="p-1 border border-gray-900 mt-1">
                    <p className="text-[8px] font-black uppercase">GREAT VALUES TRANSPORTATION</p>
                  </div>
                </div>
                <div className="text-right">
                   <h1 className="text-[10px] font-black text-gray-900 uppercase">DAILY TRIP REPORT</h1>
                   <p className="text-[7px] font-bold">Date: {form.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-2 border border-gray-900">
                   <p className="text-[6px] font-black text-gray-400 uppercase">Member Name</p>
                   <p className="text-[9px] font-black uppercase">{form.memberName}</p>
                </div>
                <div className="p-2 border border-gray-900">
                   <p className="text-[6px] font-black text-gray-400 uppercase">ID #</p>
                   <p className="text-[9px] font-black">{form.memberId}</p>
                </div>
                <div className="p-2 border border-gray-900">
                   <p className="text-[6px] font-black text-gray-400 uppercase">DOB</p>
                   <p className="text-[9px] font-black uppercase">{form.dob}</p>
                </div>
                <div className="p-2 border border-gray-900">
                   <p className="text-[6px] font-black text-gray-400 uppercase">Mailing Address</p>
                   <p className="text-[8px] font-black truncate">{form.mailingAddress}</p>
                </div>
              </div>

              <div className="bg-gray-100 p-2 text-center border border-gray-900 mb-4">
                 <p className="text-[10px] font-black">TOTAL SERVICE MILEAGE: {calculatedMiles.toFixed(1)}</p>
              </div>

              <div className="border border-gray-900 mb-4">
                <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-900 text-[6px] font-black uppercase text-center p-1">
                  <div className="col-span-8 text-left">Location Detail</div>
                  <div className="col-span-2">Time</div>
                  <div className="col-span-2">Odo</div>
                </div>
                <div className="grid grid-cols-12 border-b border-gray-200 p-1.5">
                  <div className="col-span-8"><p className="text-[8px] font-bold uppercase truncate">{form.pickupAddr}</p></div>
                  <div className="col-span-2 text-center text-[8px] font-black">{form.pickupTime}</div>
                  <div className="col-span-2 text-center text-[8px] font-black">{form.startOdo}</div>
                </div>
                <div className="grid grid-cols-12 p-1.5">
                  <div className="col-span-8"><p className="text-[8px] font-bold uppercase truncate">{form.dropoffAddr}</p></div>
                  <div className="col-span-2 text-center text-[8px] font-black">{form.dropoffTime}</div>
                  <div className="col-span-2 text-center text-[8px] font-black">{form.endOdo}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mt-12">
                 <div className="border-t border-gray-900 pt-1 h-16 relative">
                    <p className="text-[6px] font-black uppercase text-gray-400">Member Initials / Proxy</p>
                    <p className="text-[7px] italic text-gray-400 mt-2">Captured Locally</p>
                 </div>
                 <div className="border-t border-gray-900 pt-1 h-16 relative">
                    <p className="text-[6px] font-black uppercase text-gray-400">Driver Signature</p>
                    <p className="text-[8px] font-black text-gray-800 mt-2">John Jenkins</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="p-8 bg-white border-t space-y-3">
           <button onClick={() => setShowPreview(false)} className="w-full bg-gray-50 text-gray-400 font-black py-4 rounded-[28px] text-[10px] uppercase tracking-widest">Edit Details</button>
           <button 
             onClick={handleFinalSubmit}
             className="w-full bg-sky-500 text-white font-black py-6 rounded-[36px] shadow-2xl text-xl flex items-center justify-center gap-3 transition-all active:scale-95"
           >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={24} /> Transmit Official Log</>}
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col max-w-md mx-auto h-full">
      <div className="bg-[#0f172a] px-6 py-4 flex items-center justify-between text-white shadow-xl">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center">
               <AlertCircle size={16} />
            </div>
            <span className="text-sm font-bold">New Trip Request Received</span>
         </div>
         <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><X size={18}/></button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-40">
        <section className="space-y-4">
          <div className="flex justify-between items-center ml-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">MEMBER IDENTITY</h3>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-[44px] border border-gray-100 shadow-sm space-y-5">
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Full Member Name *" 
                  value={form.memberName} 
                  onChange={e => setForm({...form, memberName: e.target.value})} 
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-[28px] font-bold text-gray-700 text-sm outline-none" 
                />
             </div>
             <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="ID # *" 
                  value={form.memberId} 
                  onChange={e => setForm({...form, memberId: e.target.value})} 
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-[24px] font-bold text-gray-700 text-[12px] outline-none placeholder:text-gray-300" 
                />
                <input 
                  type="text" 
                  placeholder="DOB (MM/DD/YYYY) *" 
                  value={form.dob} 
                  onChange={e => setForm({...form, dob: e.target.value})} 
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-[24px] font-bold text-gray-700 text-[12px] outline-none placeholder:text-gray-300" 
                />
             </div>
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Mailing Address *" 
                  value={form.mailingAddress} 
                  onChange={e => setForm({...form, mailingAddress: e.target.value})} 
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-[28px] font-bold text-gray-700 text-sm outline-none" 
                />
             </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center ml-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">LOCATIONS</h3>
          </div>
          <div className="bg-white rounded-[44px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-5">
            <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                <input 
                  type="text" 
                  placeholder="Pick-up Address *" 
                  value={form.pickupAddr} 
                  onChange={e => setForm({...form, pickupAddr: e.target.value})} 
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-[28px] font-bold text-gray-700 text-sm outline-none" 
                />
            </div>
            <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                <input 
                  type="text" 
                  placeholder="Drop-off Address *" 
                  value={form.dropoffAddr} 
                  onChange={e => setForm({...form, dropoffAddr: e.target.value})} 
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-[28px] font-bold text-gray-700 text-sm outline-none" 
                />
            </div>
          </div>
        </section>

        <section className="space-y-4">
           <div className="flex justify-between items-center ml-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">TRIP METRICS</h3>
              {calculatedMiles > 0 && (
                <span className="text-[10px] font-black text-sky-500 bg-sky-50 px-3 py-1 rounded-full animate-in fade-in">
                  {calculatedMiles.toFixed(1)} MILES CALCULATED
                </span>
              )}
           </div>
           
           <div className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm space-y-5">
              <div className="relative">
                 <HeartPulse className="absolute left-6 top-1/2 -translate-y-1/2 text-sky-300" size={18} />
                 <input 
                   type="text" 
                   placeholder="Reason for Visit *" 
                   value={form.reasonForVisit} 
                   onChange={e => setForm({...form, reasonForVisit: e.target.value})} 
                   className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-[24px] font-bold text-gray-700 text-sm outline-none" 
                 />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <TimePicker label="PICKUP TIME" value={form.pickupTime} onChange={v => setForm({...form, pickupTime: v})} />
              <TimePicker label="DROPOFF TIME" value={form.dropoffTime} onChange={v => setForm({...form, dropoffTime: v})} />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[36px] border border-gray-100 shadow-sm space-y-2 text-center">
                 <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">START ODOMETER</p>
                 <input type="number" placeholder="000000" value={form.startOdo} onChange={e => setForm({...form, startOdo: e.target.value})} className="w-full p-2 bg-gray-50 rounded-2xl font-black text-lg text-center outline-none text-sky-500" />
              </div>
              <div className="bg-white p-6 rounded-[36px] border border-gray-100 shadow-sm space-y-2 text-center">
                 <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">END ODOMETER</p>
                 <input type="number" placeholder="000000" value={form.endOdo} onChange={e => setForm({...form, endOdo: e.target.value})} className="w-full p-2 bg-gray-50 rounded-2xl font-black text-lg text-center outline-none text-sky-500" />
              </div>
           </div>
        </section>

        <section className="space-y-6 pb-20">
           <div className="flex justify-between items-center ml-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">SIGN OFF</h3>
              <span className="text-[8px] font-black text-sky-500 uppercase tracking-widest bg-sky-50 px-2 py-1 rounded-lg">Member Initials Acceptable</span>
           </div>
           <div className="space-y-8">
              <div className="space-y-3">
                 <div className="flex items-center gap-2 ml-4">
                    <UserPlus size={14} className="text-gray-400" />
                    <p className="text-[9px] font-black text-gray-400 uppercase">Member Initials / Proxy</p>
                 </div>
                 <SignaturePad label="Sign or Initial" saved={signatures.member} onSave={() => setSignatures({...signatures, member: true})} onClear={() => setSignatures({...signatures, member: false})} />
              </div>
              
              <div className="space-y-3">
                 <div className="flex items-center gap-2 ml-4">
                    <ShieldCheck size={14} className="text-sky-500" />
                    <p className="text-[9px] font-black text-sky-500 uppercase">Driver Attestation</p>
                 </div>
                 <SignaturePad label="Driver System Login" saved={signatures.driver} onSave={() => setSignatures({...signatures, driver: true})} onClear={() => setSignatures({...signatures, driver: false})} />
              </div>
           </div>
        </section>
      </div>

      <div className="p-8 bg-white/80 backdrop-blur-md border-t border-gray-100 fixed bottom-0 left-0 right-0 max-w-md mx-auto shadow-2xl z-50">
         <button 
           onClick={() => setShowPreview(true)}
           disabled={!signatures.driver || !signatures.member || !isFormValid}
           className={`w-full font-black py-5 rounded-[40px] shadow-lg text-lg flex items-center justify-center gap-3 active:scale-95 transition-all ${!signatures.driver || !signatures.member || !isFormValid ? 'bg-[#cbd5e1] text-white cursor-not-allowed' : 'bg-[#1e293b] text-white shadow-[#1e293b]/20'}`}
         >
            <Eye size={20} /> Preview Audit Log
         </button>
      </div>
    </div>
  );
};

export default ManualReportScreen;
