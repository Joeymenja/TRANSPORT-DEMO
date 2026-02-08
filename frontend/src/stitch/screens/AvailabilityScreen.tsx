
import React, { useState } from 'react';
import { ChevronRight, Calendar, Clock, Plus, Trash2, Copy, ShieldCheck, AlertCircle } from 'lucide-react';

const AvailabilityScreen: React.FC = () => {
  const [schedule, setSchedule] = useState([
    { day: 'Monday', enabled: true, start: '08:00 AM', end: '05:00 PM' },
    { day: 'Tuesday', enabled: true, start: '08:00 AM', end: '05:00 PM' },
    { day: 'Wednesday', enabled: true, start: '08:00 AM', end: '05:00 PM' },
    { day: 'Thursday', enabled: true, start: '08:00 AM', end: '05:00 PM' },
    { day: 'Friday', enabled: true, start: '08:00 AM', end: '05:00 PM' },
    { day: 'Saturday', enabled: false, start: '09:00 AM', end: '02:00 PM' },
    { day: 'Sunday', enabled: false, start: '09:00 AM', end: '02:00 PM' }
  ]);

  const handleOpenTimeOff = () => {
    window.dispatchEvent(new CustomEvent('open-timeoff'));
  };

  const copyToAll = () => {
    const monday = schedule[0];
    setSchedule(schedule.map(s => ({ ...s, start: monday.start, end: monday.end, enabled: monday.enabled })));
  };

  return (
    <div className="pb-32">
      <div className="p-8 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2 bg-teal-50 text-teal-500 rounded-lg"><Clock size={20}/></div>
           <h2 className="text-2xl font-black text-gray-900">Weekly Schedule</h2>
        </div>
        <p className="text-xs text-gray-500 font-medium leading-relaxed">Regular hours ensure automated dispatching for recurring AHCCCS appointments.</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Sync Status Banner */}
        <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-3">
           <ShieldCheck className="text-green-500" size={18} />
           <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Synced with Dispatch</p>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Recurring Hours</h3>
            <button onClick={copyToAll} className="flex items-center gap-1.5 text-[10px] font-black text-teal-500 uppercase tracking-widest active:scale-95 transition-all">
              <Copy size={12} /> Copy Monday
            </button>
          </div>
          
          <div className="space-y-3">
            {schedule.map((item, idx) => (
              <div key={idx} className={`bg-white p-5 rounded-[28px] border transition-all flex items-center justify-between ${item.enabled ? 'border-teal-100 shadow-sm' : 'border-gray-50 opacity-60'}`}>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      const newSched = [...schedule];
                      newSched[idx].enabled = !newSched[idx].enabled;
                      setSchedule(newSched);
                    }}
                    className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-all ${item.enabled ? 'bg-teal-500 text-white shadow-lg shadow-teal-100' : 'bg-gray-100 text-gray-400'}`}
                  >
                    <span className="font-black text-sm">{item.day[0]}</span>
                  </button>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{item.day}</h4>
                    {item.enabled ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] font-black text-teal-600 uppercase tracking-tighter">{item.start}</span>
                        <span className="text-[9px] font-bold text-gray-300">to</span>
                        <span className="text-[10px] font-black text-teal-600 uppercase tracking-tighter">{item.end}</span>
                      </div>
                    ) : (
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Unavailable</p>
                    )}
                  </div>
                </div>
                {item.enabled && (
                  <div className="flex items-center gap-2">
                    <button className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-teal-500 transition-colors">
                      <Clock size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Time Off Section */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Planned Absences</h3>
            <button 
              onClick={handleOpenTimeOff}
              className="flex items-center gap-2 bg-teal-50 text-teal-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
            >
              <Plus size={14} /> Request Leave
            </button>
          </div>
          
          <div className="bg-white rounded-[32px] border border-gray-100 p-6 space-y-4 shadow-sm">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                   <Calendar size={22} />
                </div>
                <div className="flex-1">
                   <p className="text-sm font-black text-gray-800">No Pending Requests</p>
                   <p className="text-[10px] text-gray-400 font-medium">All time-off requests must be AHCCCS compliant.</p>
                </div>
             </div>
          </div>
        </section>

        {/* Blackout Dates Info */}
        <div className="p-6 bg-amber-50 rounded-[32px] border border-amber-100 flex gap-4">
           <AlertCircle size={20} className="text-amber-500 shrink-0 mt-1" />
           <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
             Marking yourself unavailable after a trip is assigned requires House Manager approval and may affect your on-time performance rating.
           </p>
        </div>
      </div>

      <div className="p-6 fixed bottom-20 left-0 right-0 max-w-md mx-auto">
        <button className="w-full bg-teal-500 text-white font-black py-5 rounded-[32px] shadow-2xl shadow-teal-200 active:scale-95 transition-all">
          Update Dispatch Profile
        </button>
      </div>
    </div>
  );
};

export default AvailabilityScreen;
