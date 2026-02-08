
import React, { useState } from 'react';
import { ChevronRight, Calendar, Clock, Plus, Trash2, Copy, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

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
    <div className="pb-32 bg-white h-full overflow-y-auto no-scrollbar font-sans">
      <div className="p-6 space-y-6">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-50 text-teal-500 rounded-xl shadow-inner"><Clock size={20}/></div>
              <div>
                 <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight leading-none">Recurring Shift</h2>
                 <p className="text-[10px] font-bold text-teal-500 uppercase tracking-[0.2em] leading-none mt-1.5">Fleet Sync Status</p>
              </div>
           </div>
           <p className="text-[13px] text-slate-500 font-medium leading-relaxed px-1">Route optimization engine uses these verified availability slots for member transport assignments.</p>
        </div>

        {/* Sync Status Banner */}
        <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white rounded-lg shadow-sm"><ShieldCheck className="text-green-500" size={16} /></div>
              <p className="text-[11px] font-bold text-green-700 uppercase tracking-widest leading-none">Node Synchronized</p>
           </div>
           <RefreshCw size={12} className="text-green-300" />
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Schedule</h3>
            <button onClick={copyToAll} className="flex items-center gap-2 text-[10px] font-bold text-teal-500 uppercase tracking-widest bg-teal-50 px-3 py-1.5 rounded-lg transition-all active:scale-95">
              <Copy size={12} /> Sync Weekdays
            </button>
          </div>
          
          <div className="space-y-2">
            {schedule.map((item, idx) => (
              <div key={idx} className={`bg-white p-4 rounded-2xl border transition-all flex items-center justify-between ${item.enabled ? 'border-teal-500 shadow-md' : 'border-slate-50 opacity-60 bg-slate-50/40'}`}>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      const newSched = [...schedule];
                      newSched[idx].enabled = !newSched[idx].enabled;
                      setSchedule(newSched);
                    }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${item.enabled ? 'bg-teal-500 text-white shadow-md' : 'bg-white border border-slate-100 text-slate-300'}`}
                  >
                    <span className="font-bold text-[14px]">{item.day[0]}</span>
                  </button>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[14px] leading-none">{item.day}</h4>
                    {item.enabled ? (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] font-bold text-teal-600 uppercase tracking-tight">{item.start}</span>
                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className="text-[11px] font-bold text-teal-600 uppercase tracking-tight">{item.end}</span>
                      </div>
                    ) : (
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Standby</p>
                    )}
                  </div>
                </div>
                {item.enabled && (
                  <button className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 hover:text-teal-500 transition-colors">
                    <Clock size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Time Off Section */}
        <section className="space-y-4 pt-6 border-t border-slate-50">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Absence Registry</h3>
            <button 
              onClick={handleOpenTimeOff}
              className="flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md active:scale-95 transition-all"
            >
              <Plus size={14} /> New Request
            </button>
          </div>
          
          <div className="bg-slate-50/50 rounded-2xl border border-dashed border-slate-100 p-8 text-center space-y-2">
             <Calendar className="mx-auto text-slate-200" size={24} />
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No Active PTO Records</p>
          </div>
        </section>
      </div>

      <div className="p-5 fixed bottom-16 left-0 right-0 max-w-md mx-auto z-20 bg-white/80 backdrop-blur-md">
        <button className="w-full bg-teal-500 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all text-[14px] uppercase tracking-widest">
          Sync Fleet Availability
        </button>
      </div>
    </div>
  );
};

export default AvailabilityScreen;
