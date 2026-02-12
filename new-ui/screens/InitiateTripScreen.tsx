
import React, { useState } from 'react';
import { ArrowLeft, Users, MapPin, Search, ChevronRight, CheckCircle2, UserPlus, Zap, Building2, User, CreditCard, RotateCcw, ArrowRight, Clock, Calendar, HeartPulse, ShieldCheck } from 'lucide-react';
import { Client, Trip, TripStatus } from '../types';

interface InitiateTripScreenProps {
  onBack: () => void;
  onStart: (trip: Trip) => void;
}

const InitiateTripScreen: React.FC<InitiateTripScreenProps> = ({ onBack, onStart }) => {
  const [selectedMembers, setSelectedMembers] = useState<Client[]>([]);
  const [useManualMember, setUseManualMember] = useState(false);
  const [manualMember, setManualMember] = useState({ name: '', id: '', dob: '', mailingAddress: '' });
  const [destination, setDestination] = useState<{name: string, address: string} | null>(null);
  const [tripDirection, setTripDirection] = useState<'ONE_WAY' | 'ROUND_TRIP'>('ONE_WAY');
  
  // PDF Required Specifics
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [escortName, setEscortName] = useState('');
  const [escortRelationship, setEscortRelationship] = useState('');

  // Timing State
  const [timingMode, setTimingMode] = useState<'NOW' | 'LATER'>('NOW');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
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

  const toggleMember = (member: Client) => {
    setUseManualMember(false);
    if (selectedMembers.find(m => m.id === member.id)) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
    } else {
      setSelectedMembers([member]);
    }
  };

  const handleCommence = () => {
    let client: Client;
    
    if (useManualMember) {
      client = {
        id: `NEW-${Date.now()}`,
        name: manualMember.name,
        memberId: manualMember.id || 'NEW-MEMBER',
        phone: 'N/A',
        dob: manualMember.dob,
        mailingAddress: manualMember.mailingAddress,
        mobilityNeeds: ['Ambulatory']
      };
    } else if (selectedMembers.length > 0) {
      client = selectedMembers[0];
    } else {
      return;
    }

    if (!destination || !reasonForVisit) return;

    const formattedTime = timingMode === 'NOW' 
      ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : scheduledTime;

    const newTrip: Trip = {
      id: `ADHOC-${Date.now()}`,
      client: client,
      passengers: (!useManualMember && selectedMembers.length > 1) ? selectedMembers : undefined,
      scheduledTime: formattedTime,
      appointmentTime: formattedTime,
      pickupAddress: 'Current Driver Location',
      dropoffAddress: destination.address,
      dropoffFacility: destination.name,
      status: timingMode === 'NOW' ? TripStatus.IN_PROGRESS_PICKUP : TripStatus.SCHEDULED,
      estimatedDistance: 5.0,
      estimatedDuration: 15,
      type: (!useManualMember && selectedMembers.length > 1) ? 'CARPOOL' : 'SINGLE',
      isAdHoc: true,
      reasonForVisit: reasonForVisit,
      escortName: escortName || undefined,
      escortRelationship: escortRelationship || undefined,
      specialInstructions: `${tripDirection === 'ROUND_TRIP' ? 'ROUND TRIP' : 'ONE WAY'} | Scheduled for ${scheduledDate} ${formattedTime}`
    };

    onStart(newTrip);
  };

  const isFormValid = (useManualMember ? manualMember.name.length > 0 : selectedMembers.length > 0) && destination !== null && reasonForVisit.length > 0;

  return (
    <div className="fixed inset-0 z-[90] bg-gray-50 flex flex-col max-w-md mx-auto h-full overflow-hidden">
      <div className="bg-white px-6 py-6 border-b border-gray-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft size={28}/>
          </button>
          <h2 className="text-xl font-black text-gray-900">Initiate Service</h2>
        </div>
        <div className="text-[10px] font-black text-sky-500 uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full">New Ride</div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-40">
        
        {/* Step 0: Timing Control */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Departure Timing</h3>
          <div className="grid grid-cols-2 gap-3">
             <button 
               onClick={() => setTimingMode('NOW')}
               className={`flex items-center justify-center gap-3 py-4 rounded-[24px] border-2 transition-all ${timingMode === 'NOW' ? 'bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-100' : 'bg-white text-gray-400 border-gray-100'}`}
             >
                <Zap size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Start Now</span>
             </button>
             <button 
               onClick={() => setTimingMode('LATER')}
               className={`flex items-center justify-center gap-3 py-4 rounded-[24px] border-2 transition-all ${timingMode === 'LATER' ? 'bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-100' : 'bg-white text-gray-400 border-gray-100'}`}
             >
                <Clock size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Schedule</span>
             </button>
          </div>

          {timingMode === 'LATER' && (
            <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 fade-in">
               <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase ml-4 tracking-widest">Date</p>
                  <input 
                    type="date" 
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full p-4 bg-white border border-gray-100 rounded-[20px] font-bold text-gray-800 text-sm focus:border-sky-500 outline-none" 
                  />
               </div>
               <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase ml-4 tracking-widest">Time</p>
                  <input 
                    type="time" 
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full p-4 bg-white border border-gray-100 rounded-[20px] font-bold text-gray-800 text-sm focus:border-sky-500 outline-none" 
                  />
               </div>
            </div>
          )}
        </section>

        {/* Step 1: Trip Context (Reason for Visit) */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Trip Context *</h3>
          <div className="relative">
            <HeartPulse className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400" size={18} />
            <input 
              type="text" 
              placeholder="Reason for Visit (e.g. Dialysis, PC)"
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 focus:border-sky-500 rounded-[24px] font-bold text-gray-800 transition-all outline-none"
            />
          </div>
          <div className="flex bg-white p-1.5 rounded-[24px] border border-gray-100 shadow-sm">
             <button 
               onClick={() => setTripDirection('ONE_WAY')}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] transition-all ${tripDirection === 'ONE_WAY' ? 'bg-sky-50 text-sky-600 font-black border border-sky-100' : 'text-gray-400'}`}
             >
                <ArrowRight size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">One Way</span>
             </button>
             <button 
               onClick={() => setTripDirection('ROUND_TRIP')}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] transition-all ${tripDirection === 'ROUND_TRIP' ? 'bg-sky-50 text-sky-600 font-black border border-sky-100' : 'text-gray-400'}`}
             >
                <RotateCcw size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Round Trip</span>
             </button>
          </div>
        </section>

        {/* Step 2: Member Selection */}
        <section className="space-y-4">
          <div className="flex justify-between items-center ml-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Member Details</h3>
            <button 
              onClick={() => { setUseManualMember(!useManualMember); setSelectedMembers([]); }}
              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-all ${useManualMember ? 'bg-sky-500 text-white shadow-md' : 'bg-sky-50 text-sky-600'}`}
            >
              {useManualMember ? 'Back to List' : 'Enter New Member'}
            </button>
          </div>
          
          {useManualMember ? (
            <div className="bg-white p-6 rounded-[32px] border border-sky-100 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2">
               <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Member Full Name *</p>
                  <div className="relative">
                     <User className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-300" size={18} />
                     <input 
                       type="text" 
                       placeholder="Enter Name"
                       value={manualMember.name}
                       onChange={(e) => setManualMember({...manualMember, name: e.target.value})}
                       className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-sky-500 rounded-[20px] font-bold text-gray-800 transition-all outline-none"
                     />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">AHCCCS ID # *</p>
                    <input 
                      type="text" 
                      placeholder="AHC-12345"
                      value={manualMember.id}
                      onChange={(e) => setManualMember({...manualMember, id: e.target.value})}
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-sky-500 rounded-[20px] font-bold text-gray-800 transition-all outline-none"
                    />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">DOB *</p>
                    <input 
                      type="text" 
                      placeholder="MM/DD/YYYY"
                      value={manualMember.dob}
                      onChange={(e) => setManualMember({...manualMember, dob: e.target.value})}
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-sky-500 rounded-[20px] font-bold text-gray-800 transition-all outline-none"
                    />
                 </div>
               </div>
               <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Mailing Address *</p>
                  <input 
                    type="text" 
                    placeholder="Physical Address, City, Zip"
                    value={manualMember.mailingAddress}
                    onChange={(e) => setManualMember({...manualMember, mailingAddress: e.target.value})}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-sky-500 rounded-[20px] font-bold text-gray-800 transition-all outline-none"
                  />
               </div>
            </div>
          ) : (
            <div className="space-y-2">
              {mockMembers.map((member) => {
                const isSelected = selectedMembers.find(m => m.id === member.id);
                return (
                  <button
                    key={member.id}
                    onClick={() => toggleMember(member)}
                    className={`w-full flex items-center justify-between p-4 rounded-[24px] border-2 transition-all ${isSelected ? 'bg-sky-50 border-sky-500 shadow-md scale-[1.02]' : 'bg-white border-gray-100 hover:border-sky-200'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${isSelected ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {member.name[0]}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-gray-800">{member.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{member.memberId}</p>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={20} className="text-sky-500" />}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Step 3: Escort Selection (Optional) */}
        <section className="space-y-4">
          <div className="flex justify-between items-center ml-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Escort (Optional)</h3>
            <span className="text-[8px] font-black text-gray-300 uppercase">Per PDF Guidelines</span>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 space-y-4">
             <input 
               type="text" 
               placeholder="Name of Escort"
               value={escortName}
               onChange={(e) => setEscortName(e.target.value)}
               className="w-full px-4 py-4 bg-gray-50 border-none rounded-[20px] font-bold text-gray-800 text-sm outline-none"
             />
             <input 
               type="text" 
               placeholder="Relationship"
               value={escortRelationship}
               onChange={(e) => setEscortRelationship(e.target.value)}
               className="w-full px-4 py-4 bg-gray-50 border-none rounded-[20px] font-bold text-gray-800 text-sm outline-none"
             />
          </div>
        </section>

        {/* Step 4: Destination */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Destination Facility *</h3>
          <div className="space-y-3">
            {usualDestinations.map((dest, idx) => (
              <button
                key={idx}
                onClick={() => setDestination(dest)}
                className={`w-full flex items-center gap-4 p-5 rounded-[28px] border-2 transition-all text-left ${destination?.name === dest.name ? 'bg-white border-sky-500 shadow-xl' : 'bg-white border-gray-100'}`}
              >
                <div className={`p-3 rounded-2xl ${destination?.name === dest.name ? 'bg-sky-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-800">{dest.name}</p>
                  <p className="text-[10px] font-medium text-gray-400 truncate max-w-[200px]">{dest.address}</p>
                </div>
                {destination?.name === dest.name && <div className="ml-auto w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_#0ea5e9]" />}
              </button>
            ))}
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400" size={18} />
              <input 
                type="text" 
                placeholder="Custom Destination Address..." 
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 focus:border-sky-500 rounded-[24px] text-sm font-bold transition-all outline-none shadow-sm" 
                onChange={(e) => setDestination({ name: 'Custom Point', address: e.target.value })}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="p-8 bg-white border-t border-gray-100 fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 shadow-[0_-20px_60px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleCommence}
          disabled={!isFormValid}
          className="w-full bg-sky-500 text-white font-black py-5 rounded-[32px] shadow-2xl shadow-sky-200 text-lg flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
        >
          {timingMode === 'NOW' ? (
            <>
              <Zap size={22} className={isFormValid ? 'animate-pulse' : ''} />
              Commence Service Now
            </>
          ) : (
            <>
              <Calendar size={22} />
              Schedule Trip
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InitiateTripScreen;
