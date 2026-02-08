
import React from 'react';
/* Added ClipboardCheck to the lucide-react imports */
import { Settings, ShieldCheck, Award, FileText, ChevronRight, LogOut, Star, Car, HelpCircle, BarChart3, History, CreditCard, ClipboardCheck, Clock } from 'lucide-react';

const ProfileScreen: React.FC = () => {
  const stats = [
    { label: 'Trips', value: '142', icon: ShieldCheck, color: 'text-green-500' },
    { label: 'Rating', value: '4.9', icon: Star, color: 'text-amber-500' },
    { label: 'Active', value: '48h', icon: Clock, color: 'text-teal-500', action: 'open-earnings' }
  ];

  return (
    <div className="pb-32 bg-gray-50/30">
      {/* Compact Profile Header */}
      <div className="p-8 text-center space-y-5 bg-white border-b border-gray-100 rounded-b-[40px] shadow-sm">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-gray-200 rounded-3xl border-4 border-white shadow-xl overflow-hidden">
            <img src="https://picsum.photos/seed/driver/300/300" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-green-500 border-4 border-white w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md">
            <ShieldCheck size={18} />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">John Jenkins</h2>
          <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest mt-1">OPERATOR ID: AHCCCS-123456</p>
        </div>
      </div>

      {/* Tighter Stats Grid */}
      <div className="px-5 -mt-6 grid grid-cols-3 gap-3 mb-10 relative z-10">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl text-center shadow-md border border-white active:scale-95 transition-all cursor-pointer" onClick={() => s.action && window.dispatchEvent(new CustomEvent(s.action))}>
            <div className={`mx-auto w-8 h-8 flex items-center justify-center mb-2 ${s.color}`}><s.icon size={20} /></div>
            <p className="text-[18px] font-bold text-slate-900 leading-none mb-1">{s.value}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="px-5 space-y-8">
        <section>
          <div className="flex justify-between items-center mb-4 ml-1">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fleet Assets</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Fleet Hub', sub: 'Primary: 2022 Toyota Sienna', icon: Car, event: 'open-vehicles' },
              { label: 'Expense Ledger', sub: 'Fuel & Maintenance Logs', icon: CreditCard, event: 'open-expenses' }
            ].map((item, idx) => (
              <div key={idx} onClick={() => window.dispatchEvent(new CustomEvent(item.event))} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-50 cursor-pointer active:bg-slate-50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-teal-50 text-teal-500 shadow-inner"><item.icon size={20} /></div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[14px] leading-none">{item.label}</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 tracking-tighter">{item.sub}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Archive</h3>
          <div className="space-y-2">
            {[
              { label: 'Trip Archive', sub: '7 Years Data Retention', icon: History, event: 'open-history' },
              { label: 'Log Analytics', sub: 'Service Unit Reports', icon: ClipboardCheck, event: 'open-earnings' }
            ].map((item, idx) => (
              <div key={idx} onClick={() => window.dispatchEvent(new CustomEvent(item.event))} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-50 cursor-pointer active:bg-slate-50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-slate-50 text-slate-400 shadow-inner"><item.icon size={20} /></div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[14px] leading-none">{item.label}</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 tracking-tighter">{item.sub}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            ))}
          </div>
        </section>

        <button 
          onClick={() => { localStorage.clear(); window.location.reload(); }}
          className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 rounded-2xl text-red-600 font-bold uppercase text-[12px] tracking-widest border border-red-100 shadow-sm active:scale-95 transition-all"
        >
          <LogOut size={18} /> Secure Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;
