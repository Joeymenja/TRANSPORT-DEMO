
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle2, Loader2, X, ShieldCheck, FileDigit, Save, AlertOctagon, User, Clock, Info, CalendarDays, ChevronDown, MapPin, Building2, Plus, Trash2, Milestone, Users
} from 'lucide-react';
import SignaturePad from '../components/SignaturePad';
import { generateTripReport } from '../utils/ReportGenerator';

interface ManualReportScreenProps {
  onBack: () => void;
}

interface TripLeg {
  id: string;
  pickupAddr: string;
  pickupTime: string;
  startOdo: string;
  dropoffAddr: string;
  dropoffTime: string;
  endOdo: string;
}

// --- Wheel Picker Components ---

const WHEEL_ITEM_HEIGHT = 40;

const WheelColumn: React.FC<{ 
  options: string[], 
  value: string, 
  onChange: (val: string) => void 
}> = ({ options, value, onChange }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial scroll position on mount
  useEffect(() => {
    if (scrollRef.current) {
      const index = options.indexOf(value);
      if (index >= 0) {
        scrollRef.current.scrollTop = index * WHEEL_ITEM_HEIGHT;
      }
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const index = Math.round(container.scrollTop / WHEEL_ITEM_HEIGHT);
    const selected = options[index];
    if (selected && selected !== value) {
      onChange(selected);
    }
  };

  return (
    <div className="relative h-48 w-full overflow-hidden font-sans group">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar"
      >
        <div className="h-[76px]" /> {/* Padding to center first item */}
        {options.map((opt) => (
          <div 
            key={opt} 
            className={`h-10 flex items-center justify-center snap-center transition-all duration-200 cursor-pointer ${opt === value ? 'text-xl font-black text-slate-900 scale-110' : 'text-base font-medium text-slate-300'}`}
          >
            {opt}
          </div>
        ))}
        <div className="h-[76px]" /> {/* Padding to center last item */}
      </div>
    </div>
  );
};

const TimePickerDrawer: React.FC<{
  isOpen: boolean,
  onClose: () => void,
  value: string,
  onChange: (val: string) => void,
  label: string
}> = ({ isOpen, onClose, value, onChange, label }) => {
  if (!isOpen) return null;

  // Safe parsing
  const [timeStr, amp] = value.includes(' ') ? value.split(' ') : ['08:00', 'AM'];
  const [hh, mm] = timeStr.includes(':') ? timeStr.split(':') : ['08', '00'];

  const hours = Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'));
  const amps = ['AM', 'PM'];

  const update = (type: 'h'|'m'|'p', val: string) => {
    const newH = type === 'h' ? val : hh;
    const newM = type === 'm' ? val : mm;
    const newP = type === 'p' ? val : amp;
    onChange(`${newH}:${newM} ${newP}`);
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-t-[32px] shadow-2xl p-6 pb-10 animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">{label}</h3>
          <button onClick={onClose} className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all">
            Confirm Time
          </button>
        </div>

        <div className="relative h-48 flex justify-center items-center bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 shadow-inner">
          {/* Highlight Bar */}
          <div className="absolute top-1/2 -translate-y-1/2 w-[90%] h-10 bg-white rounded-xl shadow-sm border border-teal-100 pointer-events-none z-0" />
          
          {/* Columns */}
          <div className="flex w-full px-4 relative z-10 gap-2">
            <WheelColumn options={hours} value={hh} onChange={(v) => update('h', v)} />
            <div className="flex items-center justify-center h-48 pb-1 w-4 shrink-0"><span className="text-xl font-black text-slate-300">:</span></div>
            <WheelColumn options={minutes} value={mm} onChange={(v) => update('m', v)} />
            <div className="w-4 shrink-0" />
            <WheelColumn options={amps} value={amp} onChange={(v) => update('p', v)} />
          </div>

          {/* Gradients */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-slate-50 via-slate-50/80 to-transparent pointer-events-none z-20" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent pointer-events-none z-20" />
        </div>
      </div>
    </div>
  );
};

// --- Main Screen ---

const ManualReportScreen: React.FC<ManualReportScreenProps> = ({ onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [signatures, setSignatures] = useState({ driver: false, member: false });
  
  // Time Picker State
  const [activePicker, setActivePicker] = useState<{ id: string, field: 'pickupTime' | 'dropoffTime', label: string } | null>(null);

  // Member Info State
  const [memberInfo, setMemberInfo] = useState({ 
    memberName: '', 
    memberId: '', 
    memberDob: '', 
    mailingAddress: '', 
    reasonForVisit: '',
    escortName: '',
    escortRelationship: ''
  });

  // Multi-Load State
  const [additionalPassengers, setAdditionalPassengers] = useState<Array<{id: string, name: string, memberId: string}>>([]);

  const addPassenger = () => {
    setAdditionalPassengers(prev => [...prev, { id: `p-${Date.now()}`, name: '', memberId: '' }]);
  };

  const removePassenger = (id: string) => {
    setAdditionalPassengers(prev => prev.filter(p => p.id !== id));
  };

  const updatePassenger = (id: string, field: 'name' | 'memberId', value: string) => {
    setAdditionalPassengers(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Multi-Leg State
  const [legs, setLegs] = useState<TripLeg[]>([{
    id: 'leg-1',
    pickupAddr: '', 
    pickupTime: '08:00 AM',
    startOdo: '', 
    dropoffAddr: '', 
    dropoffTime: '08:30 AM',
    endOdo: '' 
  }]);

  const calculatedMiles = useMemo(() => {
    return legs.reduce((acc, leg) => {
       const start = parseFloat(leg.startOdo);
       const end = parseFloat(leg.endOdo);
       const legMiles = (!isNaN(start) && !isNaN(end)) ? Math.max(0, end - start) : 0;
       return acc + legMiles;
    }, 0);
  }, [legs]);

  const handleLegChange = (id: string, field: keyof TripLeg, value: string) => {
    setLegs(prev => prev.map(leg => leg.id === id ? { ...leg, [field]: value } : leg));
  };

  const addLeg = () => {
    const lastLeg = legs[legs.length - 1];
    setLegs(prev => [...prev, {
      id: `leg-${Date.now()}`,
      pickupAddr: lastLeg.dropoffAddr, // Smart fill: Pickup where last dropped off
      pickupTime: lastLeg.dropoffTime,
      startOdo: lastLeg.endOdo,        // Smart fill: Odo continues
      dropoffAddr: '',
      dropoffTime: lastLeg.dropoffTime,
      endOdo: ''
    }]);
  };

  const removeLeg = (id: string) => {
    if (legs.length > 1) {
      setLegs(prev => prev.filter(l => l.id !== id));
    }
  };

  const handleFinalize = () => {
    setIsSubmitting(true);
    generateTripReport({
      id: `MANUAL-${Date.now()}`,
      client: memberInfo.memberName,
      memberId: memberInfo.memberId,
      memberDob: memberInfo.memberDob,
      mailingAddress: memberInfo.mailingAddress,
      reasonForVisit: memberInfo.reasonForVisit,
      escortName: memberInfo.escortName,
      escortRelationship: memberInfo.escortRelationship,
      additionalPassengers: additionalPassengers, // Pass co-riders
      legs: legs
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
    }, 2000);
  };

  const attestationText = "I certify that this service was provided as described and that the mileage reported is accurate.";

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-[120] bg-slate-900 flex flex-col items-center justify-center p-8 text-center text-white max-w-md mx-auto h-full font-sans">
        <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl animate-bounce">
          <CheckCircle2 size={32} className="text-white" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight mb-2">Audit Committed</h2>
        <p className="text-slate-400 text-[14px] mb-10 leading-relaxed px-4">Manual log has been cryptographically signed and archived for compliance retrieval.</p>
        <button onClick={onBack} className="w-full bg-teal-500 text-white font-bold py-4 rounded-xl text-[14px] uppercase tracking-widest shadow-lg">Back to Fleet HUD</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col max-w-md mx-auto h-full overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-slate-900 px-5 py-4 flex items-center justify-between text-white shadow-lg z-20">
         <div className="flex items-center gap-3">
            <div className="p-1.5 bg-teal-500 rounded-lg shadow-inner"><AlertOctagon size={18} className="text-white" /></div>
            <div>
               <h2 className="text-[14px] font-bold uppercase tracking-tight leading-none">Official NEMT Service Log</h2>
               <p className="text-[9px] font-bold text-teal-400 uppercase tracking-widest mt-1">Provider Compliance V2.3</p>
            </div>
         </div>
         <button onClick={onBack} className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors active:scale-90"><X size={20}/></button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6 pb-44">
        
        {/* Section 0: Provider Information (Static for Demo) */}
        <section className="space-y-2">
           <div className="flex items-center gap-2 px-1">
              <Building2 size={12} className="text-slate-400" />
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Provider Identification</h3>
           </div>
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-2 gap-4">
              <div>
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Company</p>
                 <p className="text-[11px] font-black text-slate-800 uppercase">Great Values Transport</p>
              </div>
              <div>
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">NPI/ID</p>
                 <p className="text-[11px] font-black text-slate-800">1234567890</p>
              </div>
           </div>
        </section>

        {/* Section 1: Member & Visit Metadata */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
             <User size={12} className="text-slate-400" />
             <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Member & Visit Verification</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
             <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Member Identity *</label>
                <input type="text" placeholder="Full Legal Name" value={memberInfo.memberName} onChange={e => setMemberInfo({...memberInfo, memberName: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-800 outline-none focus:bg-white focus:border-sky-300 transition-all" />
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                   <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">AHCCCS ID *</label>
                   <input type="text" placeholder="A12345678" value={memberInfo.memberId} onChange={e => setMemberInfo({...memberInfo, memberId: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-800 outline-none focus:bg-white focus:border-sky-300" />
                </div>
                <div className="space-y-1">
                   <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Member DOB *</label>
                   <input type="text" placeholder="MM/DD/YYYY" value={memberInfo.memberDob} onChange={e => setMemberInfo({...memberInfo, memberDob: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-800 outline-none focus:bg-white focus:border-sky-300" />
                </div>
             </div>

             <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Residential/Mailing Address (Optional)</label>
                <div className="relative">
                   <input type="text" placeholder="Home Address" value={memberInfo.mailingAddress} onChange={e => setMemberInfo({...memberInfo, mailingAddress: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-800 outline-none focus:bg-white focus:border-sky-300" />
                   <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                </div>
             </div>

             <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Condition/Reason for Visit *</label>
                <input type="text" placeholder="e.g. Dialysis, Regular Medical" value={memberInfo.reasonForVisit} onChange={e => setMemberInfo({...memberInfo, reasonForVisit: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-800 outline-none focus:bg-white focus:border-sky-300" />
             </div>
             
             <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                   <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Escort Name</label>
                   <input type="text" placeholder="Enter name" value={memberInfo.escortName} onChange={e => setMemberInfo({...memberInfo, escortName: e.target.value})} className="w-full p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-[11px] font-semibold text-slate-600 outline-none" />
                </div>
                <div className="space-y-1">
                   <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Relationship</label>
                   <input type="text" placeholder="Parent, Aide, etc." value={memberInfo.escortRelationship} onChange={e => setMemberInfo({...memberInfo, escortRelationship: e.target.value})} className="w-full p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-[11px] font-semibold text-slate-600 outline-none" />
                </div>
             </div>

             {/* Multi-Load / Co-Riders Section */}
             <div className="pt-4 border-t border-slate-100 mt-2">
                <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2">
                      <Users size={12} className="text-teal-500" />
                      <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Multi-Load Co-Riders</h4>
                   </div>
                   <button onClick={addPassenger} className="text-[9px] font-black text-teal-500 uppercase tracking-widest bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100 transition-all hover:bg-teal-500 hover:text-white hover:border-teal-500">+ Co-Rider</button>
                </div>
                
                {additionalPassengers.length > 0 ? (
                  <div className="space-y-3">
                     {additionalPassengers.map((p, idx) => (
                       <div key={p.id} className="flex gap-2 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="mt-2.5 text-[9px] font-black text-slate-300 uppercase w-4 text-center">{idx + 1}</span>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                             <input type="text" placeholder="Name" value={p.name} onChange={e => updatePassenger(p.id, 'name', e.target.value)} className="w-full p-2 bg-white rounded-lg text-[11px] font-bold text-slate-800 outline-none border border-slate-200" />
                             <input type="text" placeholder="ID #" value={p.memberId} onChange={e => updatePassenger(p.id, 'memberId', e.target.value)} className="w-full p-2 bg-white rounded-lg text-[11px] font-bold text-slate-800 outline-none border border-slate-200" />
                          </div>
                          <button onClick={() => removePassenger(p.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                       </div>
                     ))}
                  </div>
                ) : (
                  <div className="py-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center">
                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">No Multi-Load Members Attached</p>
                  </div>
                )}
             </div>
          </div>
        </section>

        {/* Section 2: Chronological Service Log */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
             <div className="flex items-center gap-2">
                <Clock size={12} className="text-slate-400" />
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Chronological Service Log</h3>
             </div>
             {legs.length > 1 && (
                <span className="text-[9px] font-black text-teal-500 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">{legs.length} Trip Legs</span>
             )}
          </div>

          <div className="space-y-5">
             {legs.map((leg, index) => (
               <div key={leg.id} className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm relative group">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                     <div className="bg-slate-800 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                        Segment #{index + 1}
                     </div>
                     {index > 0 && (
                        <button onClick={() => removeLeg(leg.id)} className="p-1 px-2 text-[9px] font-black text-red-400 uppercase hover:bg-red-50 rounded-md transition-colors">
                           Remove Segment
                        </button>
                     )}
                  </div>
                  
                  <div className="p-4 space-y-4">
                     {/* Pickup Node */}
                     <div className="space-y-3">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pickup Data</span>
                        </div>
                        <div className="relative">
                           <input type="text" placeholder="Pickup Address *" value={leg.pickupAddr} onChange={e => handleLegChange(leg.id, 'pickupAddr', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-bold text-slate-800 outline-none" />
                           <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="space-y-1">
                              <label className="text-[8px] font-black text-slate-400 uppercase ml-1 tracking-widest">Pickup Time</label>
                              <button 
                                onClick={() => setActivePicker({ id: leg.id, field: 'pickupTime', label: 'Set Pickup Time' })}
                                className="w-full p-2.5 bg-slate-50 rounded-xl text-[12px] font-black text-slate-800 border-2 border-slate-100 flex justify-between items-center active:bg-slate-100 transition-colors"
                              >
                                {leg.pickupTime}
                                <ChevronDown size={14} className="text-slate-400" />
                              </button>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[8px] font-black text-slate-400 uppercase ml-1 tracking-widest">Start Odo *</label>
                              <input type="number" placeholder="000,000" value={leg.startOdo} onChange={e => handleLegChange(leg.id, 'startOdo', e.target.value)} className="w-full p-2.5 bg-teal-50/50 border-2 border-teal-100 rounded-xl text-[12px] font-black text-teal-600 outline-none text-right" />
                           </div>
                        </div>
                     </div>

                     <div className="border-t border-slate-100 pt-4 space-y-3">
                        {/* Dropoff Node */}
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Dropoff Data</span>
                        </div>
                        <div className="relative">
                           <input type="text" placeholder="Dropoff Address *" value={leg.dropoffAddr} onChange={e => handleLegChange(leg.id, 'dropoffAddr', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-bold text-slate-800 outline-none" />
                           <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="space-y-1">
                              <label className="text-[8px] font-black text-slate-400 uppercase ml-1 tracking-widest">Dropoff Time</label>
                              <button 
                                onClick={() => setActivePicker({ id: leg.id, field: 'dropoffTime', label: 'Set Dropoff Time' })}
                                className="w-full p-2.5 bg-slate-50 rounded-xl text-[12px] font-black text-slate-800 border-2 border-slate-100 flex justify-between items-center active:bg-slate-100 transition-colors"
                              >
                                {leg.dropoffTime}
                                <ChevronDown size={14} className="text-slate-400" />
                              </button>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[8px] font-black text-slate-400 uppercase ml-1 tracking-widest">End Odo *</label>
                              <input type="number" placeholder="000,000" value={leg.endOdo} onChange={e => handleLegChange(leg.id, 'endOdo', e.target.value)} className="w-full p-2.5 bg-teal-50/50 border-2 border-teal-100 rounded-xl text-[12px] font-black text-teal-600 outline-none text-right" />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
             ))}

             <button 
               onClick={addLeg}
               className="w-full py-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center gap-3 text-slate-400 hover:text-teal-500 hover:border-teal-400 hover:bg-teal-50 transition-all group active:scale-95"
             >
                <div className="p-1 bg-white rounded-lg border border-slate-200 group-hover:border-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all"><Plus size={16}/></div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Append Trip Segment</span>
             </button>
          </div>

          {calculatedMiles > 0 && (
             <div className="bg-slate-900 mx-auto w-[90%] p-4 rounded-2xl text-center shadow-xl relative overflow-hidden mt-4 border border-white/10">
                <div className="absolute top-0 left-0 w-1 h-full bg-teal-500" />
                <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest mb-1">Audit-Verified Range</p>
                <p className="text-3xl font-black text-white">{calculatedMiles.toFixed(1)} <span className="text-[14px] text-slate-400">Miles</span></p>
             </div>
          )}
        </section>

        {/* Section 3: Legal Compliance & Sign-Off */}
        <section className="space-y-5 pb-20">
           <div className="flex items-center gap-2 px-1">
              <ShieldCheck size={12} className="text-slate-400" />
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Certification & Submission</h3>
           </div>
           
           <div className="bg-amber-50 p-5 rounded-2xl border-2 border-amber-100/50 flex gap-4 shadow-sm">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-lg shrink-0 h-fit"><Info size={20}/></div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-amber-900 uppercase tracking-tight leading-none mb-1">NEMT Attestation</p>
                 <p className="text-[11px] font-bold text-amber-800 leading-snug italic">"{attestationText}"</p>
              </div>
           </div>

           <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                 <div className="flex justify-between items-center px-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Member Certification *</label>
                    {signatures.member && <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">Digitally Signed</span>}
                 </div>
                 <div className="border-2 border-slate-200 rounded-[32px] p-2 bg-white shadow-xl overflow-hidden h-32 relative">
                    <SignaturePad label="Member" saved={signatures.member} onSave={() => setSignatures({...signatures, member: true})} onClear={() => setSignatures({...signatures, member: false})} />
                    <div className="absolute bottom-4 right-4 pointer-events-none opacity-20"><User size={40}/></div>
                 </div>
              </div>
              
              <div className="space-y-2">
                 <div className="flex justify-between items-center px-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Operator Certification *</label>
                    {signatures.driver && <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">Digitally Signed</span>}
                 </div>
                 <div className="border-2 border-slate-200 rounded-[32px] p-2 bg-white shadow-xl overflow-hidden h-32 relative">
                    <SignaturePad label="Operator" saved={signatures.driver} onSave={() => setSignatures({...signatures, driver: true})} onClear={() => setSignatures({...signatures, driver: false})} />
                    <div className="absolute bottom-4 right-4 pointer-events-none opacity-20"><ShieldCheck size={40}/></div>
                 </div>
              </div>
           </div>
        </section>
      </div>

      {/* Primary Action Dock */}
      <div className="p-5 bg-white border-t border-slate-200 absolute bottom-0 left-0 right-0 max-w-md mx-auto z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
         <button 
           disabled={!signatures.driver || !signatures.member || !memberInfo.memberName || !memberInfo.memberId || !memberInfo.memberDob || !memberInfo.reasonForVisit || calculatedMiles <= 0 || isSubmitting}
           onClick={handleFinalize} 
           className="w-full bg-slate-900 text-white font-black py-5 rounded-[24px] text-[13px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-4 border border-white/10"
         >
            {isSubmitting ? (
               <>
                  <Loader2 className="animate-spin text-teal-400" size={20} />
                  <span>Generating Service Record...</span>
               </>
            ) : (
               <>
                  <FileDigit size={20} className="text-teal-400" />
                  <span>Commit Official Log</span>
               </>
            )}
         </button>
      </div>

      {/* Wheel Time Picker Drawer */}
      {activePicker && (
        <TimePickerDrawer 
          key={`${activePicker.id}-${activePicker.field}`}
          isOpen={!!activePicker}
          onClose={() => setActivePicker(null)}
          value={legs.find(l => l.id === activePicker.id)?.[activePicker.field] || '08:00 AM'}
          onChange={(val) => handleLegChange(activePicker.id, activePicker.field, val)}
          label={activePicker.label}
        />
      )}
    </div>
  );
};

export default ManualReportScreen;
