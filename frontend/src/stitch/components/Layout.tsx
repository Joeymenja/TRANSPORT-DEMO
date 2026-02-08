
import React, { useState, useEffect } from 'react';
import { NAV_ITEMS, COLORS } from '../constants';
import { 
  Wifi, 
  WifiOff, 
  Menu, 
  X, 
  User, 
  ShieldCheck, 
  History, 
  Car, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
  title: string;
  rightAction?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children, title, rightAction }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const handleOpenSync = () => {
    window.dispatchEvent(new CustomEvent('open-sync'));
    setIsDrawerOpen(false);
  };

  const menuItems = [
    { label: 'Fleet Management', icon: Car, event: 'open-vehicles' },
    { label: 'Compliance Vault', icon: ShieldCheck, event: 'open-docs' },
    { label: 'Trip Archive', icon: History, event: 'open-history' },
    { label: 'Performance Analytics', icon: BarChart3, event: 'open-performance' },
    { label: 'App Settings', icon: Settings, event: 'open-settings' },
    { label: 'Support Center', icon: HelpCircle, event: 'open-help' },
  ];

  const triggerEvent = (eventName: string) => {
    window.dispatchEvent(new CustomEvent(eventName));
    setIsDrawerOpen(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-xl overflow-hidden border-x border-gray-200 relative">
      {/* Slide-out Drawer */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
        <div className={`absolute left-0 top-0 bottom-0 w-[80%] bg-white shadow-2xl transition-transform duration-300 transform ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-8 bg-teal-500 text-white flex flex-col gap-4">
             <div className="flex justify-between items-start">
                <div className="w-16 h-16 bg-white/20 rounded-[24px] backdrop-blur-md flex items-center justify-center border border-white/30 overflow-hidden shadow-lg">
                   <img src="https://picsum.photos/seed/driver/200/200" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 bg-black/10 rounded-xl"><X size={20}/></button>
             </div>
             <div>
                <h2 className="text-xl font-black">John Jenkins</h2>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mt-1">ID: AHCCCS-123456</p>
                <div className="flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-white/20 rounded-full w-fit">
                   <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                   <span className="text-[9px] font-black uppercase tracking-wider">Driver Active</span>
                </div>
             </div>
          </div>

          <nav className="p-4 space-y-1">
             {menuItems.map((item, idx) => (
               <button 
                 key={idx}
                 onClick={() => triggerEvent(item.event)}
                 className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-teal-50 text-gray-700 active:scale-95 transition-all group"
               >
                 <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                    <item.icon size={20} />
                 </div>
                 <span className="font-bold text-sm">{item.label}</span>
               </button>
             ))}
             
             <div className="pt-4 border-t border-gray-100 mt-4">
                <button 
                  onClick={() => { localStorage.clear(); window.location.reload(); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 active:scale-95 transition-all"
                >
                  <div className="p-2 bg-red-50 rounded-xl"><LogOut size={20} /></div>
                  <span className="font-bold text-sm">Secure Logout</span>
                </button>
             </div>
          </nav>

          <div className="absolute bottom-8 left-8 right-8">
             <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                <ShieldCheck className="text-teal-500" size={18} />
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                   GVBH Secure Infrastructure<br/>v1.2.3 • HIPAA Compliant
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 -ml-2 text-gray-400 hover:text-teal-500 active:scale-90 transition-all"
          >
            <Menu size={24} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-gray-800 leading-tight">{title}</h1>
            <button 
              onClick={handleOpenSync}
              className="flex items-center gap-1.5 mt-0.5 active:scale-95 transition-transform"
            >
              {isOnline ? (
                <div className="flex items-center gap-1">
                  <Wifi size={10} className="text-green-500" />
                  <span className="text-[8px] font-black text-green-600 uppercase tracking-widest">Sync Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <WifiOff size={10} className="text-amber-500" />
                  <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Offline Mode</span>
                </div>
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {rightAction}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative bg-gray-50">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 flex justify-around items-center py-3 pb-safe-area-inset-bottom">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center w-full space-y-1 transition-all active:scale-90"
            >
              <div className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-teal-50 text-teal-500' : 'text-gray-300'}`}>
                <Icon size={22} className={isActive ? 'fill-teal-100' : ''} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? 'text-teal-600' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
