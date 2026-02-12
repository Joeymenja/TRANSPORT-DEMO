
import React from 'react';
import { Settings, ShieldCheck, Award, FileText, ChevronRight, LogOut, Star, Car, HelpCircle, BarChart3, History, CreditCard, ClipboardList, Clock } from 'lucide-react';

const ProfileScreen: React.FC = () => {
  const stats = [
    { label: 'Completed', value: '142', icon: ShieldCheck, color: 'text-green-500' },
    { label: 'Avg Rating', value: '4.9', icon: Star, color: 'text-amber-500' },
    { label: 'Service Units', value: '48h', icon: Clock, color: 'text-sky-500', action: 'open-earnings' }
  ];

  const handleOpenDocs = () => window.dispatchEvent(new CustomEvent('open-docs'));
  const handleOpenVehicles = () => window.dispatchEvent(new CustomEvent('open-vehicles'));
  const handleOpenExpenses = () => window.dispatchEvent(new CustomEvent('open-expenses'));
  const handleOpenEarnings = () => window.dispatchEvent(new CustomEvent('open-earnings'));
  const handleOpenHelp = () => window.dispatchEvent(new CustomEvent('open-help'));
  const handleOpenSettings = () => window.dispatchEvent(new CustomEvent('open-settings'));
  const handleOpenPerformance = () => window.dispatchEvent(new CustomEvent('open-performance'));
  const handleOpenHistory = () => window.dispatchEvent(new CustomEvent('open-history'));

  return (
    <div className="pb-24">
      {/* Profile Header */}
      <div className="p-8 text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-28 h-28 bg-gray-200 rounded-[40px] border-4 border-white shadow-2xl overflow-hidden">
            <img src="https://picsum.photos/seed/driver/300/300" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white w-10 h-10 rounded-2xl flex items-center justify-center text-white">
            < ShieldCheck size={18} />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 leading-tight">John Jenkins</h2>
          <p className="text-xs font-bold text-sky-500 uppercase tracking-widest mt-1">NEMT Driver • ID: AHCCCS-123456</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 grid grid-cols-3 gap-3 mb-10">
        {stats.map((s, i) => (
          <div 
            key={i} 
            className="bg-white p-4 rounded-[28px] text-center border border-gray-50 shadow-sm active:scale-95 transition-all cursor-pointer" 
            onClick={() => s.action ? window.dispatchEvent(new CustomEvent(s.action)) : handleOpenPerformance()}
          >
            <div className={`mx-auto w-8 h-8 flex items-center justify-center mb-2 ${s.color}`}>
              <s.icon size={20} />
            </div>
            <p className="text-lg font-black text-gray-900 leading-none mb-1">{s.value}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Account Settings List */}
      <div className="px-6 space-y-6">
        <section>
          <div className="flex justify-between items-center mb-4 ml-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Compliance & Fleet</h3>
            <button onClick={handleOpenDocs} className="text-[10px] font-black text-sky-500 uppercase">Manage</button>
          </div>
          <div className="space-y-2">
            <div 
              onClick={handleOpenVehicles}
              className="flex items-center justify-between p-5 bg-white rounded-[24px] border border-gray-50 shadow-sm active:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-sky-50 text-sky-500"><Car size={20} /></div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Vehicle Management</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Primary: 2022 Toyota Sienna</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-gray-300" />
            </div>

            <div 
              onClick={handleOpenExpenses}
              className="flex items-center justify-between p-5 bg-white rounded-[24px] border border-gray-50 shadow-sm active:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-sky-50 text-sky-500"><CreditCard size={20} /></div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Operation Expenses</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Fuel, Tolls, & Maintenance</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-gray-300" />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-2">Audit History</h3>
          <div className="space-y-2">
            <div 
              onClick={handleOpenHistory}
              className="flex items-center justify-between p-5 bg-white rounded-[24px] border border-gray-100 shadow-sm active:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4 text-gray-700">
                <div className="p-2 bg-sky-50 text-sky-500 rounded-lg"><History size={20} /></div>
                <span className="font-bold text-sm">Past Trip Reports</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </div>

            <div 
              onClick={handleOpenEarnings}
              className="flex items-center justify-between p-5 bg-white rounded-[24px] border border-gray-100 shadow-sm active:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4 text-gray-700">
                <div className="p-2 bg-sky-50 text-sky-500 rounded-lg"><ClipboardList size={20} /></div>
                <span className="font-bold text-sm">Service Analytics</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </div>
          </div>
        </section>

        <section>
          <div className="pt-4">
            <button 
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="w-full flex items-center justify-between p-5 bg-red-50 rounded-[24px] border border-red-100 text-red-600 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <LogOut size={20} />
                <span className="font-bold text-sm">Sign Out Securely</span>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfileScreen;
