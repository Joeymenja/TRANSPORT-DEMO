
import React, { useState, useEffect } from 'react';
import { Trip, ReportData, TripStatus } from '../types';
import SecurementGuideScreen from './SecurementGuideScreen';
import SignaturePad from '../components/SignaturePad';
import PhotoUploader from '../components/PhotoUploader';
import { 
  X, MapPin, Phone, AlertCircle, CheckCircle2, UserCheck, Users, MessageSquare, 
  Loader2, Sparkles, ShieldCheck, HeartPulse, Car, AlertTriangle, 
  Gauge, Fingerprint, BookOpen, Siren, Navigation, Info, Trash2,
  Calendar, ClipboardCheck
} from 'lucide-react';

interface ActiveTripScreenProps {
  trip: Trip;
  onBack: () => void;
  onComplete: () => void;
}

enum Phase {
  PRE_TRIP_CHECKLIST = 'PRE_TRIP_CHECKLIST',
  EN_ROUTE_PICKUP = 'EN_ROUTE_PICKUP',
  ARRIVAL_PICKUP = 'ARRIVAL_PICKUP',
  WAIT_FOR_CLIENT = 'WAIT_FOR_CLIENT',
  IDENTITY_VERIFICATION = 'IDENTITY_VERIFICATION',
  BOARDING = 'BOARDING',
  EN_ROUTE_TRANSIT = 'EN_ROUTE_TRANSIT',
  ARRIVAL_DROPOFF = 'ARRIVAL_DROPOFF',
  SIGNATURE_COLLECTION = 'SIGNATURE_COLLECTION',
  POST_TRIP_INSPECTION = 'POST_TRIP_INSPECTION',
  FINAL_REPORT = 'FINAL_REPORT',
  PDF_PREVIEW = 'PDF_PREVIEW',
  SUCCESS = 'SUCCESS',
  NO_SHOW_REPORT = 'NO_SHOW_REPORT'
}

const ActiveTripScreen: React.FC<ActiveTripScreenProps> = ({ trip, onBack, onComplete }) => {
  const [phase, setPhase] = useState<Phase>(Phase.PRE_TRIP_CHECKLIST);
  const [showSafetyMenu, setShowSafetyMenu] = useState(false);
  const [showSecurementGuide, setShowSecurementGuide] = useState(false);
  
  // Odometer & Safety
  const [preTrip, setPreTrip] = useState({ clean: false, safety: false, fuel: false, gear: false });
  const [startOdo, setStartOdo] = useState('42350');
  const [endOdo, setEndOdo] = useState('');
  const [noShowOdo, setNoShowOdo] = useState('');
  const [odoWarning, setOdoWarning] = useState<string | null>(null);

  // GPS Simulation
  const [distanceToTarget, setDistanceToTarget] = useState(2400); 
  const [inGeofence, setInGeofence] = useState(false);

  // Interaction States
  const [idVerified, setIdVerified] = useState(false);
  const [boardingChecks, setBoardingChecks] = useState({ seatbelt: false, locked: false, personalItems: false });
  const [waitTime, setWaitTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clientSignature, setClientSignature] = useState<any>(null);

  const [reportData, setReportData] = useState<ReportData>({
    appointmentType: 'Primary Care',
    reasonForVisit: trip.reasonForVisit || 'Medical Appointment',
    escortName: trip.escortName || '',
    escortRelationship: trip.escortRelationship || '',
    facilityName: trip.dropoffFacility || '',
    checkedIn: true,
    staffAck: true,
    equipmentUsed: [],
    incidents: 'None',
    notes: '',
    verificationMethod: 'digital',
    multiMemberTrip: trip.type === 'CARPOOL',
    differentLocations: false,
    tripType: 'ONE_WAY',
    additionalInfo: ''
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      if (phase === Phase.WAIT_FOR_CLIENT) setWaitTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === Phase.EN_ROUTE_PICKUP || phase === Phase.EN_ROUTE_TRANSIT) {
      const interval = setInterval(() => {
        setDistanceToTarget(prev => {
          const next = prev - 150;
          if (next <= 50) setInGeofence(true);
          return Math.max(0, next);
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const validateOdometer = () => {
    const s = parseInt(startOdo);
    const e = parseInt(endOdo);
    if (isNaN(e) || e <= s) {
      setOdoWarning("Invalid mileage sequence.");
      return false;
    }
    setOdoWarning(null);
    return true;
  };

  const nextPhase = () => {
    const sequence = [
      Phase.PRE_TRIP_CHECKLIST,
      Phase.EN_ROUTE_PICKUP,
      Phase.ARRIVAL_PICKUP,
      Phase.WAIT_FOR_CLIENT,
      Phase.IDENTITY_VERIFICATION,
      Phase.BOARDING,
      Phase.EN_ROUTE_TRANSIT,
      Phase.ARRIVAL_DROPOFF,
      Phase.SIGNATURE_COLLECTION,
      Phase.POST_TRIP_INSPECTION,
      Phase.FINAL_REPORT,
      Phase.PDF_PREVIEW,
      Phase.SUCCESS
    ];
    const currentIndex = sequence.indexOf(phase);
    if (currentIndex < sequence.length - 1) {
      setPhase(sequence[currentIndex + 1]);
      setInGeofence(false);
      setDistanceToTarget(2400);
    }
  };

  const renderContent = () => {
    if (showSecurementGuide) return <SecurementGuideScreen onBack={() => setShowSecurementGuide(false)} clientName={trip.client.name} />;

    switch (phase) {
      case Phase.PRE_TRIP_CHECKLIST:
        return (
          <div className="h-full flex flex-col p-8 space-y-8 animate-in fade-in">
            <h2 className="text-4xl font-black tracking-tight text-gray-900 leading-none">Safety<br/>Clearance</h2>
            <div className="space-y-3">
              {['clean', 'safety', 'fuel', 'gear'].map(id => (
                <button key={id} onClick={() => setPreTrip(p => ({...p, [id]: !p[id as keyof typeof preTrip]}))} className={`w-full flex items-center justify-between p-6 rounded-[32px] border-2 transition-all ${preTrip[id as keyof typeof preTrip] ? 'bg-green-50 border-green-500 shadow-md shadow-green-100' : 'bg-white border-gray-100'}`}>
                  <span className="font-black text-xs uppercase tracking-widest text-gray-700">{id.toUpperCase()} Check</span>
                  <CheckCircle2 className={preTrip[id as keyof typeof preTrip] ? 'text-green-500' : 'text-gray-200'} />
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Current Odometer *</label>
              <input type="number" value={startOdo} onChange={e => setStartOdo(e.target.value)} className="w-full p-6 bg-gray-50 rounded-[28px] border-2 border-gray-100 font-black text-2xl text-sky-600 shadow-inner outline-none" />
            </div>
            <button disabled={!Object.values(preTrip).every(v => v)} onClick={nextPhase} className="w-full bg-sky-500 text-white font-black py-6 rounded-[36px] shadow-2xl active:scale-95 transition-all disabled:opacity-30">Confirm Readiness</button>
          </div>
        );

      case Phase.EN_ROUTE_PICKUP:
      case Phase.EN_ROUTE_TRANSIT:
        return (
          <div className="h-full bg-gray-900 relative">
             <img src="https://picsum.photos/seed/map/800/1200" className="w-full h-full object-cover opacity-40 grayscale" />
             <div className="absolute top-10 left-6 right-6 p-6 bg-white/95 backdrop-blur-xl rounded-[36px] shadow-2xl">
                <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-1">{phase === Phase.EN_ROUTE_PICKUP ? 'Pickup Leg' : 'Transit Leg'}</p>
                <h3 className="text-xl font-black text-gray-900 truncate">{trip.client.name}</h3>
                <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                   <div className="h-full bg-sky-500 transition-all duration-1000" style={{ width: `${Math.min(100, (1 - distanceToTarget/2400) * 100)}%` }} />
                </div>
                <div className="flex justify-between items-center mt-3">
                   <span className="text-[9px] font-black text-gray-400 uppercase">Distance Remaining</span>
                   <span className="text-xs font-black text-gray-900">{(distanceToTarget / 1609.34).toFixed(1)} Mi</span>
                </div>
             </div>
             <div className="absolute bottom-12 left-6 right-6">
                <button disabled={!inGeofence} onClick={nextPhase} className={`w-full py-6 rounded-[36px] font-black text-xl shadow-2xl transition-all active:scale-95 ${inGeofence ? 'bg-sky-500 text-white' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}>
                  {inGeofence ? "I'VE ARRIVED" : "APPROACHING..."}
                </button>
             </div>
          </div>
        );

      case Phase.ARRIVAL_PICKUP:
      case Phase.ARRIVAL_DROPOFF:
        return (
          <div className="h-full flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in">
             <div className="w-28 h-28 bg-sky-50 rounded-[44px] flex items-center justify-center text-sky-500 shadow-2xl shadow-sky-100"><MapPin size={56} /></div>
             <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-gray-900">Location reached</h2>
                <p className="text-sm font-medium text-gray-500">Timestamp and GPS coordinates captured.</p>
             </div>
             <div className="w-full bg-gray-50 p-6 rounded-[32px] border border-gray-100 space-y-4">
                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Arrival</span><span className="text-sm font-black text-gray-900">{currentTime.toLocaleTimeString()}</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Geo-Precision</span><span className="text-[10px] font-black text-green-500 uppercase tracking-widest">99.8% Sync</span></div>
             </div>
             <button onClick={nextPhase} className="w-full bg-sky-500 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-sky-200 text-xl active:scale-95 transition-all">
                {phase === Phase.ARRIVAL_PICKUP ? "Contact Member" : "Continue to Drop-off"}
             </button>
          </div>
        );

      case Phase.WAIT_FOR_CLIENT:
        return (
          <div className="h-full flex flex-col p-8 space-y-8 animate-in fade-in">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-gray-900">Waiting</h2>
                <div className="bg-sky-50 px-6 py-3 rounded-[24px] border border-sky-100 text-center">
                   <p className="text-[9px] font-black text-sky-400 uppercase tracking-tighter">Timer</p>
                   <p className="text-2xl font-black text-sky-600 font-mono tracking-tighter">{Math.floor(waitTime/60)}:{(waitTime%60).toString().padStart(2,'0')}</p>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center gap-3 p-6 bg-white border border-gray-100 rounded-[32px] shadow-sm active:scale-95 transition-all"><Phone size={24} className="text-sky-500"/><span className="font-black text-[10px] uppercase tracking-widest">Call</span></button>
                <button className="flex flex-col items-center gap-3 p-6 bg-white border border-gray-100 rounded-[32px] shadow-sm active:scale-95 transition-all"><MessageSquare size={24} className="text-indigo-500"/><span className="font-black text-[10px] uppercase tracking-widest">Text</span></button>
             </div>
             <div className="p-6 bg-amber-50 rounded-[32px] border border-amber-100 flex gap-4">
                <AlertCircle className="text-amber-500 shrink-0 mt-1" size={18} />
                <p className="text-xs font-bold text-amber-800 leading-relaxed uppercase">Wait at least 10 minutes before reporting no-show. 3 calls required.</p>
             </div>
             <button onClick={nextPhase} className="mt-auto w-full bg-sky-500 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-sky-200 text-xl flex items-center justify-center gap-3 active:scale-95 transition-all"><UserCheck size={24}/> Member Ready</button>
          </div>
        );

      case Phase.IDENTITY_VERIFICATION:
        return (
          <div className="h-full flex flex-col p-8 space-y-8 animate-in slide-in-from-right-10">
            <h2 className="text-3xl font-black text-gray-900 leading-tight">Identify<br/>Verification</h2>
            <div className="space-y-3">
              {[`Name: ${trip.client.name}`, `DOB: ${trip.client.dob || '04/12/1978'}`, `Insurance ID: ${trip.client.memberId}`].map((item, idx) => (
                <button key={idx} onClick={() => setIdVerified(!idVerified)} className="w-full flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-[24px] shadow-sm active:scale-[0.98] transition-all">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${idVerified ? 'bg-sky-500 border-sky-500 text-white' : 'border-gray-200'}`}>{idVerified && <CheckCircle2 size={16} />}</div>
                  <span className="text-sm font-bold text-gray-700">{item}</span>
                </button>
              ))}
            </div>
            <button onClick={nextPhase} className="w-full py-6 bg-sky-500 text-white rounded-[32px] font-black text-xl shadow-2xl active:scale-95 transition-all mt-auto">Verify & Proceed</button>
          </div>
        );

      case Phase.BOARDING:
        return (
          <div className="h-full flex flex-col p-8 space-y-8 animate-in fade-in">
             <h2 className="text-3xl font-black text-gray-900">Boarding</h2>
             <div className="space-y-3">
                {['seatbelt', 'locked', 'personalItems'].map(id => (
                   <button key={id} onClick={() => setBoardingChecks(p => ({...p, [id]: !p[id as keyof typeof boardingChecks]}))} className={`w-full flex items-center justify-between p-6 rounded-[28px] border-2 transition-all ${boardingChecks[id as keyof typeof boardingChecks] ? 'bg-green-50 border-green-500' : 'bg-white border-gray-100'}`}>
                      <span className="font-bold text-sm text-gray-700 uppercase tracking-tight">{id.replace(/([A-Z])/g, ' $1')} Verified</span>
                      <CheckCircle2 className={boardingChecks[id as keyof typeof boardingChecks] ? 'text-green-500' : 'text-gray-200'} />
                   </button>
                ))}
             </div>
             <button onClick={nextPhase} className="w-full bg-sky-500 text-white font-black py-6 rounded-[32px] shadow-2xl text-xl mt-auto active:scale-95 transition-all">Start Transit</button>
          </div>
        );

      case Phase.SIGNATURE_COLLECTION:
        return (
          <div className="h-full flex flex-col p-8 space-y-8 animate-in fade-in">
             <h2 className="text-3xl font-black text-gray-900 leading-none">Member<br/>Sign-off</h2>
             <p className="text-sm font-medium text-gray-500 leading-relaxed">Please have the passenger or their authorized proxy sign below to confirm service delivery.</p>
             <div className="h-64 border-2 border-dashed border-gray-200 rounded-[32px] bg-white overflow-hidden shadow-inner">
                <SignaturePad onSave={setClientSignature} onClear={() => setClientSignature(null)} saved={clientSignature !== null} label="Sign Within Frame" />
             </div>
             <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 flex gap-3">
                <ShieldCheck size={18} className="text-sky-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-black text-sky-700 uppercase leading-relaxed">No House Staff signature required. Driver and Member only.</p>
             </div>
             <button disabled={!clientSignature} onClick={nextPhase} className="w-full bg-sky-500 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-sky-200 text-xl mt-auto disabled:opacity-30 active:scale-95 transition-all">Finalize Service</button>
          </div>
        );

      case Phase.POST_TRIP_INSPECTION:
        return (
          <div className="h-full flex flex-col p-8 space-y-8 animate-in fade-in">
             <h2 className="text-3xl font-black text-gray-900 leading-none">Vehicle<br/>Restore</h2>
             <div className="space-y-4">
                {['Vehicle sanitization applied', 'Equipment stored safely', 'Passenger belongings verified'].map((item, i) => (
                   <button key={i} className="w-full flex items-center gap-4 p-6 bg-white border border-gray-100 rounded-[32px] shadow-sm">
                      <div className="p-2 bg-green-50 rounded-xl"><CheckCircle2 size={24} className="text-green-500" /></div>
                      <span className="font-black text-xs text-gray-700 uppercase tracking-widest">{item}</span>
                   </button>
                ))}
             </div>
             <button onClick={nextPhase} className="w-full bg-gray-900 text-white font-black py-6 rounded-[32px] shadow-xl text-xl mt-auto active:scale-95 transition-all">Generate Report</button>
          </div>
        );

      case Phase.FINAL_REPORT:
        return (
          <div className="flex flex-col h-full bg-white p-8 space-y-8 animate-in fade-in">
            <h2 className="text-4xl font-black text-gray-900 leading-none">Final Log</h2>
            <div className="space-y-6">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Reason for Visit *</label>
                  <input type="text" value={reportData.reasonForVisit} onChange={e => setReportData({...reportData, reasonForVisit: e.target.value})} placeholder="e.g. Dialysis" className="w-full p-5 bg-gray-50 border-none rounded-[24px] font-black text-sm outline-none shadow-inner" />
               </div>
               
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">End Odometer Snapshot *</label>
                  <input type="number" placeholder="000000" value={endOdo} onChange={e => setEndOdo(e.target.value)} onBlur={validateOdometer} className={`w-full p-6 bg-gray-50 rounded-[28px] border-2 font-black text-3xl transition-all shadow-inner outline-none ${odoWarning ? 'border-red-400' : 'border-transparent'}`} />
               </div>

               <div className="p-6 bg-sky-50 rounded-[32px] border border-sky-100 space-y-4">
                  <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest ml-2">Compliance Review</p>
                  <label className="flex items-center gap-4 cursor-pointer group">
                     <input type="checkbox" checked={reportData.multiMemberTrip} onChange={e => setReportData({...reportData, multiMemberTrip: e.target.checked})} className="w-6 h-6 accent-sky-500 rounded-lg" />
                     <span className="text-xs font-bold text-sky-900 uppercase">Multiple Members in Vehicle?</span>
                  </label>
                  {reportData.multiMemberTrip && (
                    <label className="flex items-center gap-4 cursor-pointer animate-in slide-in-from-left-4">
                       <input type="checkbox" checked={reportData.differentLocations} onChange={e => setReportData({...reportData, differentLocations: e.target.checked})} className="w-6 h-6 accent-sky-500 rounded-lg" />
                       <span className="text-xs font-bold text-sky-900 uppercase">Varying Locations?</span>
                    </label>
                  )}
               </div>
            </div>
            <button disabled={!reportData.reasonForVisit || !endOdo} onClick={() => validateOdometer() && setPhase(Phase.PDF_PREVIEW)} className="w-full bg-sky-500 text-white font-black py-6 rounded-[36px] shadow-2xl shadow-sky-200 text-xl mt-auto active:scale-95 transition-all">Review Official PDF</button>
          </div>
        );

      case Phase.PDF_PREVIEW:
        return (
          <div className="flex flex-col h-full bg-gray-100 p-4 space-y-4 animate-in fade-in">
             <div className="p-4 bg-white border-b flex items-center justify-between rounded-t-3xl shadow-sm">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Audit Preview</h2>
                <div className="flex gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                   <span className="text-[9px] font-black text-gray-400 uppercase">Compliance v2</span>
                </div>
             </div>
             <div className="bg-white shadow-2xl rounded-b-3xl p-8 flex-1 overflow-y-auto border border-gray-200 no-scrollbar">
                <h1 className="text-xl font-black text-gray-900 mb-8 border-b-4 border-gray-900 pb-2 uppercase tracking-tighter">DAILY TRIP REPORT</h1>
                <div className="grid grid-cols-2 gap-6 mb-8 text-[10px]">
                   <div className="space-y-4">
                      <div><p className="font-black text-gray-400 uppercase tracking-widest mb-1">Provider</p><p className="font-black text-gray-900">GREAT VALUES TRANSPORT</p></div>
                      <div><p className="font-black text-gray-400 uppercase tracking-widest mb-1">Insurance ID #</p><p className="font-black text-gray-900">{trip.client.memberId}</p></div>
                      <div><p className="font-black text-gray-400 uppercase tracking-widest mb-1">Reason</p><p className="font-black text-gray-900">{reportData.reasonForVisit}</p></div>
                   </div>
                   <div className="space-y-4">
                      <div><p className="font-black text-gray-400 uppercase tracking-widest mb-1">Member</p><p className="font-black text-gray-900 uppercase">{trip.client.name}</p></div>
                      <div><p className="font-black text-gray-400 uppercase tracking-widest mb-1">Fleet ID</p><p className="font-black text-gray-900">FORD A2A843</p></div>
                      <div><p className="font-black text-gray-400 uppercase tracking-widest mb-1">Escort</p><p className="font-black text-gray-900">{reportData.escortName || 'NONE'}</p></div>
                   </div>
                </div>
                
                <div className="border-4 border-gray-900 p-4 mb-8 space-y-4 bg-gray-50">
                   <div className="flex justify-between items-center text-[11px] font-black border-b border-gray-200 pb-2">
                      <span className="text-gray-400 uppercase tracking-widest">Pickup Odo</span>
                      <span className="text-gray-900">{startOdo} MI</span>
                   </div>
                   <div className="flex justify-between items-center text-[11px] font-black">
                      <span className="text-gray-400 uppercase tracking-widest">Dropoff Odo</span>
                      <span className="text-gray-900">{endOdo} MI</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t-2 border-gray-100">
                   <div className="border-t-2 border-gray-900 pt-2 h-20 relative">
                      <p className="text-[8px] font-black uppercase text-gray-400 mb-4">Member Signature</p>
                      <Fingerprint size={32} className="absolute bottom-4 right-0 text-sky-100" />
                      <p className="text-[10px] font-serif italic text-gray-400">Captured Digitally</p>
                   </div>
                   <div className="border-t-2 border-gray-900 pt-2 h-20 relative">
                      <p className="text-[8px] font-black uppercase text-gray-400 mb-4">Driver Signature</p>
                      <ShieldCheck size={32} className="absolute bottom-4 right-0 text-sky-100" />
                      <p className="text-[10px] font-black text-gray-800">John Jenkins</p>
                   </div>
                </div>
             </div>
             <button onClick={() => setPhase(Phase.SUCCESS)} className="w-full bg-sky-500 text-white font-black py-6 rounded-[36px] shadow-2xl text-xl active:scale-95 transition-all">Transmit Official Report</button>
          </div>
        );

      case Phase.SUCCESS:
        return (
          <div className="bg-sky-500 h-full flex flex-col items-center justify-center p-12 text-center text-white">
             <div className="w-32 h-32 bg-white rounded-[48px] flex items-center justify-center mb-10 shadow-2xl animate-bounce">
                <CheckCircle2 size={72} className="text-sky-500" />
             </div>
             <h2 className="text-5xl font-black leading-none mb-4 tracking-tighter">Mission<br/>Complete</h2>
             <p className="text-sky-100/60 font-black uppercase tracking-[0.3em] mb-12">Logs Securely Synced</p>
             <button onClick={onComplete} className="w-full bg-white text-sky-600 font-black py-6 rounded-[36px] shadow-xl text-xl active:scale-95 transition-all">Back to Fleet Portal</button>
          </div>
        );

      default:
        return (
          <div className="p-8 h-full flex flex-col items-center justify-center gap-6">
             <Loader2 className="animate-spin text-sky-500" size={56} />
             <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">Initializing Trip Environment...</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col max-w-md mx-auto h-screen shadow-2xl">
      {phase !== Phase.SUCCESS && phase !== Phase.PDF_PREVIEW && (
        <div className="bg-white px-6 py-5 flex items-center justify-between border-b shadow-sm z-30">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 active:scale-90 transition-all"><X size={24} /></button>
          <div className="text-center">
             <span className="text-[10px] font-black text-sky-500 uppercase tracking-[0.2em]">{phase.replace(/_/g, ' ')}</span>
             <span className="block text-xs font-black text-gray-900 tracking-tight mt-0.5">{trip.id}</span>
          </div>
          <button onClick={() => setShowSafetyMenu(true)} className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 active:scale-90"><AlertTriangle size={20}/></button>
        </div>
      )}
      <div className="flex-1 overflow-hidden relative bg-white">{renderContent()}</div>
    </div>
  );
};

export default ActiveTripScreen;
