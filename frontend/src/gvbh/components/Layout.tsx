
import React, { useState, useEffect } from 'react';
import { NAV_ITEMS, COLORS, SHADOWS, RADII } from '../constants';
import { 
  Menu, 
  X, 
  ShieldCheck, 
  History, 
  Car, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  LogOut,
  CreditCard,
  Volume2,
  VolumeX,
  FileText
} from 'lucide-react';
import { offlineQueue } from '../services/OfflineQueue';
import { realtimeService, SocketStatus } from '../services/RealtimeService';
import { ttsService } from '../services/TTSService';

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
  title: string;
  rightAction?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children, title, rightAction }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [socketStatus, setSocketStatus] = useState<SocketStatus>(realtimeService.getStatus());
  const [isTripActive, setIsTripActive] = useState(false);
  const [isMuted, setIsMuted] = useState(ttsService.getMuted());

  useEffect(() => {
    const handleSocketChange = (e: any) => setSocketStatus(e.detail.status);
    window.addEventListener('socket-status-change', handleSocketChange);

    const handleMuteChange = (e: any) => setIsMuted(e.detail.muted);
    window.addEventListener('voice-mute-change', handleMuteChange);

    const unsubscribe = offlineQueue.subscribe((items, syncing) => {
      setIsSyncing(syncing);
    });

    const checkTrip = setInterval(() => {
      setIsTripActive(localStorage.getItem('is_trip_active') === 'true');
    }, 2000);

    return () => {
      window.removeEventListener('socket-status-change', handleSocketChange);
      window.removeEventListener('voice-mute-change', handleMuteChange);
      unsubscribe();
      clearInterval(checkTrip);
    };
  }, []);

  const menuItems = [
    { label: 'Fleet Hub', icon: Car, event: 'open-vehicles' },
    { label: 'Expense Ledger', icon: CreditCard, event: 'open-expenses' },
    { label: 'Manual Trip Log', icon: FileText, event: 'open-manual-report' },
    { label: 'Credential Vault', icon: ShieldCheck, event: 'open-docs' },
    { label: 'Trip Archive', icon: History, event: 'open-history' },
    { label: 'Operational Stats', icon: BarChart3, event: 'open-performance' },
    { label: 'Settings', icon: Settings, event: 'open-settings' },
    { label: 'Support Center', icon: HelpCircle, event: 'open-help' },
  ];

  const triggerEvent = (eventName: string) => {
    window.dispatchEvent(new CustomEvent(eventName));
    setIsDrawerOpen(false);
  };

  const toggleMute = () => {
    const newState = !isMuted;
    ttsService.setMuted(newState);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-xl overflow-hidden border-x border-gray-100 relative font-sans text-[14px]">
      {isSyncing && (
        <div className="absolute top-0 left-0 right-0 h-1 z-[110] bg-teal-100 overflow-hidden">
           <div className="h-full bg-teal-500 w-1/3 animate-[sync_1.5s_infinite_linear]" />
        </div>
      )}

      {/* Drawer */}
      <div className={`fixed inset-0 z-[100] transition-all duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
        <div className={`absolute left-0 top-0 bottom-0 w-[80%] bg-white shadow-xl transition-transform duration-300 ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 bg-slate-900 text-white flex flex-col gap-4">
             <div className="flex justify-between items-center">
                <div className="w-10 h-10 bg-teal-500 rounded-xl overflow-hidden border border-slate-700">
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2"><X size={20}/></button>
             </div>
             <div>
                <h2 className="text-lg font-bold leading-tight">John Jenkins</h2>
                <p className="text-[9px] text-teal-400 opacity-80 uppercase tracking-widest">AHCCCS-123456</p>
             </div>
          </div>
          <nav className="p-3 space-y-1">
             {menuItems.map((item, idx) => (
               <button key={idx} onClick={() => triggerEvent(item.event)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all text-left">
                 <item.icon size={18} className="text-slate-400" />
                 <span className="font-semibold text-slate-700 text-[13px]">{item.label}</span>
               </button>
             ))}
             <div className="pt-3 border-t border-slate-100 mt-3">
                <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50">
                  <LogOut size={18} /> <span className="font-bold text-[13px]">Logout</span>
                </button>
             </div>
          </nav>
        </div>
      </div>

      {/* Header - Fixed Zoom Scaling */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsDrawerOpen(true)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg">
            <Menu size={22} />
          </button>
          <div>
            <h1 className="text-[14px] font-bold text-slate-900 leading-none uppercase tracking-tight">{title}</h1>
            <div className="flex items-center gap-2 mt-1">
               <div className="flex items-center gap-1 px-1.5 py-0.5 bg-teal-50 rounded border border-teal-100/50">
                  <div className={`w-1 h-1 rounded-full ${socketStatus === SocketStatus.CONNECTED ? 'bg-teal-500' : 'bg-slate-300'}`} />
                  <span className="text-[8px] font-bold text-teal-600 uppercase tracking-widest leading-none">Live</span>
               </div>
               {isTripActive && (
                 <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 rounded border border-green-100/50">
                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[8px] font-bold text-green-600 uppercase tracking-widest leading-none">GPS</span>
                 </div>
               )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className={`p-2 rounded-lg border transition-colors ${isMuted ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-teal-50 text-teal-500 border-teal-100'}`}>
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          {rightAction}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar relative bg-slate-50/20">
        {children}
      </main>

      {/* Bottom Nav - Correct Scaling */}
      <nav className="bg-white border-t border-slate-100 flex justify-around items-center py-2 pb-10 px-1 z-10 shadow-lg">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center justify-center w-full transition-all ${isActive ? 'scale-105 opacity-100' : 'opacity-40 hover:opacity-60'}`}>
              <Icon size={20} className={isActive ? 'text-teal-500' : 'text-slate-600'} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[9px] font-bold uppercase mt-1 ${isActive ? 'text-teal-600' : 'text-slate-600'}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
