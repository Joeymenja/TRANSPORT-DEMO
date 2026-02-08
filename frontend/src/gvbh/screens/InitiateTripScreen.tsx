
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, MapPin, ChevronRight, CheckCircle2, 
  Zap, Building2, Clock, Calendar, ShieldCheck, ExternalLink, Loader2 
} from 'lucide-react';
import { Client, Trip, TripStatus } from '../types';
import { mapService, MapInsight } from '../services/MapService';

interface InitiateTripScreenProps {
  onBack: () => void;
  onStart: (trip: Trip) => void;
}

const InitiateTripScreen: React.FC<InitiateTripScreenProps> = ({ onBack, onStart }) => {
  const [selectedMembers, setSelectedMembers] = useState<Client[]>([]);
  const [useManualMember, setUseManualMember] = useState(false);
  const [manualMember, setManualMember] = useState({ name: '', id: '', dob: '', mailingAddress: '' });
  const [useManualDestination, setUseManualDestination] = useState(false);
  const [manualDest, setManualDest] = useState({ name: '', address: '' });
  const [destination, setDestination] = useState<{name: string, address: string} | null>(null);
  const [isVerifyingFacility, setIsVerifyingFacility] = useState(false);
  const [facilityInsight, setFacilityInsight] = useState<MapInsight | null>(null);
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [timingMode, setTimingMode] = useState<'NOW' | 'LATER'>('NOW');
  const [scheduledTime, setScheduledTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));

  const mockMembers: Client[] = [
    { id: 'M1', name: 'Alice Smith', memberId: 'AHC-111', phone: '555-1111', mobilityNeeds: ['Ambulatory'], dob: '05/20/1965', mailingAddress: '123 Apple St, Phoenix AZ' },
    { id: 'M2', name: 'Bob Jones', memberId: 'AHC-222', phone: '555-2222', mobilityNeeds: ['Wheelchair'], dob: '11/12/1950', mailingAddress: '456 Berry Ln, Mesa AZ' },
    { id: 'M3', name: 'Charlie Davis', memberId: 'AHC-333', phone: '555-3333', mobilityNeeds: ['Walker'], dob: '01/05/1972', mailingAddress: '789 Cherry Rd, Gilbert AZ' },
  ];

  const usualDestinations = [
    { name: 'Dialysis Center West', address: '124 Willow Lane, South SF' },
    { name: 'Phoenix General Hospital', address: '1001 N Central Ave, Phoenix' },
    { name: 'Behavioral Health Hub', address: '450 Stanyan St, SF' },
  ];

  useEffect(() => {
    if (destination) {
      verifyFacility(destination.name, destination.address);
    }
  }, [destination]);

  const verifyFacility = async (name: string, address: string) => {
    setIsVerifyingFacility(true);
    setFacilityInsight(null);
    const insight = await mapService.getFacilityContext(
      `${name} at ${address}`, 
      "Verify facility type and accessibility for dispatch logs."
    );
    setFacilityInsight(insight);
    setIsVerifyingFacility(false);
  };

  const toggleMember = (member: Client) => {
    setUseManualMember(false);
    if (selectedMembers.find(m => m.id === member.id)) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers([member]);
    }
  };

  const handleCommence = () => {
    let client: Client;
    if (useManualMember) {
      client = { id: `NEW-${Date.now()}`, name: manualMember.name, memberId: manualMember.id || 'NEW-MEMBER', phone: 'N/A', dob: manualMember.dob, mailingAddress: manualMember.mailingAddress, mobilityNeeds: ['Ambulatory'] };
    } else if (selectedMembers.length > 0) {
      client = selectedMembers[0];
    } else return;

    const finalDest = useManualDestination ? manualDest : destination;
    if (!finalDest || !reasonForVisit) return;
    const formattedTime = timingMode === 'NOW' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : scheduledTime;
    onStart({
      id: `ADHOC-${Date.now()}`,
      client: client,
      scheduledTime: formattedTime,
      appointmentTime: formattedTime,
      pickupAddress: 'Current Location',
      dropoffAddress: finalDest.address,
      dropoffFacility: finalDest.name,
      status: timingMode === 'NOW' ? TripStatus.IN_PROGRESS_PICKUP : TripStatus.SCHEDULED,
      estimatedDistance: 5.0,
      estimatedDuration: 15,
      type: 'SINGLE',
      isAdHoc: true,
      reasonForVisit: reasonForVisit,
    });
  };

  const isFormValid = (useManualMember ? manualMember.name.length > 0 : selectedMembers.length > 0) && (useManualDestination ? (manualDest.name.length > 0 && manualDest.address.length > 0) : destination !== null) && reasonForVisit.length > 0;

  return (
    <div className="fixed inset-0 z-[90] bg-gray-50 flex flex-col max-w-md mx-auto h-full overflow-hidden font-sans">
      <div className="bg-white px-5 py-3 border-b border-gray-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-1 text-slate-400 hover:text-slate-900 transition-colors"><ArrowLeft size={24}/></button>
          <h2 className="text-[14px] font-bold text-slate-900 uppercase tracking-tight">Initiate Dispatch</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5 pb-32">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setTimingMode('NOW')} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${timingMode === 'NOW' ? 'bg-teal-50 border-teal-500 text-teal-600 shadow-md' : 'bg-white border-gray-100 text-slate-400'}`}>
            <Zap size={22} /> <span className="font-bold text-[10px] uppercase tracking-widest text-center">Deploy Now</span>
          </button>
          <button onClick={() => setTimingMode('LATER')} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${timingMode === 'LATER' ? 'bg-teal-50 border-teal-500 text-teal-600 shadow-md' : 'bg-white border-gray-100 text-slate-400'}`}>
            <Clock size={22} /> <span className="font-bold text-[10px] uppercase tracking-widest text-center">Schedule</span>
          </button>
        </div>

        <section className="space-y-1.5">
          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Visit Reason *</label>
          <input type="text" placeholder="e.g. Behavioral Health, Lab" value={reasonForVisit} onChange={(e) => setReasonForVisit(e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded-xl font-bold text-[13px] text-slate-800 outline-none focus:border-teal-500 shadow-sm" />
        </section>

        <section className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Member Selection</h3>
            <button onClick={() => { setUseManualMember(!useManualMember); setSelectedMembers([]); }} className="text-[9px] font-bold text-teal-500 uppercase"> {useManualMember ? 'View List' : '+ Manual Entry'} </button>
          </div>
          {useManualMember ? (
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm space-y-2">
              <input type="text" placeholder="Full Member Name" value={manualMember.name} onChange={(e) => setManualMember({...manualMember, name: e.target.value})} className="w-full p-2.5 bg-slate-50 rounded-lg font-bold text-[13px] outline-none" />
              <input type="text" placeholder="Member ID" value={manualMember.id} onChange={(e) => setManualMember({...manualMember, id: e.target.value})} className="w-full p-2.5 bg-slate-50 rounded-lg font-bold text-[13px] outline-none" />
            </div>
          ) : (
            <div className="space-y-1.5">
              {mockMembers.map((m) => {
                const isSelected = selectedMembers.find(sm => sm.id === m.id);
                return (
                  <button key={m.id} onClick={() => toggleMember(m)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${isSelected ? 'bg-teal-50 border-teal-500' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] ${isSelected ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{m.name[0]}</div>
                      <div className="text-left">
                        <p className="font-bold text-[13px] text-slate-800 leading-none">{m.name}</p>
                        <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-tighter">{m.memberId}</p>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={16} className="text-teal-500" />}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Destination</h3>
            <button onClick={() => { setUseManualDestination(!useManualDestination); setDestination(null); }} className="text-[9px] font-bold text-teal-500 uppercase"> {useManualDestination ? 'Usual Spots' : '+ Manual Destination'} </button>
          </div>
          
          {useManualDestination ? (
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm space-y-2">
              <input type="text" placeholder="Facility/Building Name" value={manualDest.name} onChange={(e) => setManualDest({...manualDest, name: e.target.value})} className="w-full p-2.5 bg-slate-50 rounded-lg font-bold text-[13px] outline-none focus:ring-1 focus:ring-teal-500" />
              <input type="text" placeholder="Full Address" value={manualDest.address} onChange={(e) => setManualDest({...manualDest, address: e.target.value})} className="w-full p-2.5 bg-slate-50 rounded-lg font-bold text-[13px] outline-none focus:ring-1 focus:ring-teal-500" />
            </div>
          ) : (
            <div className="space-y-1.5">
              {usualDestinations.map((dest, idx) => (
                <button key={idx} onClick={() => setDestination(dest)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${destination?.name === dest.name ? 'bg-teal-50 border-teal-500' : 'bg-white border-gray-100'}`}>
                  <Building2 size={16} className={destination?.name === dest.name ? 'text-teal-500' : 'text-slate-300'} />
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-bold text-[13px] text-slate-800 leading-tight truncate">{dest.name}</p>
                    <p className="text-[9px] text-slate-400 truncate uppercase mt-0.5 tracking-tighter">{dest.address}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {facilityInsight && (
            <div className="p-3 bg-green-50 rounded-xl border border-green-100 animate-in fade-in">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={14} className="text-green-500" />
                <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest">Verified Target</span>
              </div>
              <p className="text-[12px] font-medium text-green-800 leading-snug">{facilityInsight.text}</p>
            </div>
          )}
        </section>
      </div>

      <div className="p-4 bg-white border-t border-gray-100 absolute bottom-0 left-0 right-0 max-w-md mx-auto z-50 pb-10">
        <button onClick={handleCommence} disabled={!isFormValid || isVerifyingFacility} className="w-full bg-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50 uppercase text-[12px] tracking-widest flex items-center justify-center gap-2">
          {isVerifyingFacility ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
          <span>{timingMode === 'NOW' ? 'Start Mission' : 'Confirm Schedule'}</span>
        </button>
      </div>
    </div>
  );
};

export default InitiateTripScreen;
