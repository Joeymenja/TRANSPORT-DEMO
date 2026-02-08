
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Car, 
  History, 
  ShieldCheck, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  LogOut,
  FileText,
  CreditCard,
  User,
  Sparkles
} from 'lucide-react';

interface StitchSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const StitchSidebar: React.FC<StitchSidebarProps> = ({ isOpen, onClose, user }) => {
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Fleet Hub', icon: Car, route: '/driver/stitch/vehicle' },
    { label: 'Performance Analytics', icon: BarChart3, route: '/driver/stitch/performance' },
    { label: 'Trip History', icon: '/driver/stitch/history' }, // Wait, check path
    { label: 'Credential Vault', icon: ShieldCheck, route: '/driver/stitch/documents' },
    { label: 'Operational Stats', icon: CreditCard, route: '/driver/stitch/performance' },
    { label: 'Settings', icon: '/driver/stitch/settings' },
    { label: 'Support Center', icon: HelpCircle, route: '/driver/stitch/help' },
  ];

  // Fix routes based on App.tsx
  const items = [
    { label: 'Fleet Hub', icon: Car, route: '/driver/stitch/vehicle' },
    { label: 'Performance', icon: BarChart3, route: '/driver/stitch/performance' },
    { label: 'Trip History', icon: History, route: '/driver/stitch/history' },
    { label: 'Security & Docs', icon: ShieldCheck, route: '/driver/stitch/documents' },
    { label: 'Settings', icon: Settings, route: '/driver/stitch/settings' },
    { label: 'Help Center', icon: HelpCircle, route: '/driver/stitch/help' },
  ];

  const handleNavigate = (route: string) => {
    navigate(route);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[100] transition-all duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={onClose} />
        
        {/* Sidebar Panel */}
        <div 
          className={`absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="p-8 bg-gray-900 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                <Sparkles size={120} className="text-teal-400" />
             </div>
             
             <div className="relative z-10 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                   <div className="w-16 h-16 bg-white rounded-[24px] overflow-hidden border-4 border-white/10 shadow-2xl flex items-center justify-center">
                      <span className="text-2xl font-black text-teal-600">
                        {user?.firstName?.charAt(0) || 'D'}
                      </span>
                   </div>
                   <button 
                     onClick={onClose}
                     className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                   >
                     <X size={20} />
                   </button>
                </div>
                
                <div>
                   <h2 className="text-xl font-black">{user?.firstName || 'Driver'} {user?.lastName || ''}</h2>
                   <p className="text-[10px] text-teal-400 font-black uppercase tracking-[0.3em] mt-1 opacity-80">
                      ID: AHCCCS-992841
                   </p>
                </div>
             </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
             {items.map((item, idx) => (
               <button 
                 key={idx} 
                 onClick={() => handleNavigate(item.route)}
                 className="w-full flex items-center gap-4 p-4 rounded-[24px] hover:bg-teal-50 group transition-all text-left"
               >
                 <div className="p-2.5 bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-teal-500 group-hover:shadow-lg rounded-xl transition-all">
                    <item.icon size={20} />
                 </div>
                 <span className="font-bold text-gray-700 group-hover:text-gray-900 text-[13px]">{item.label}</span>
               </button>
             ))}
             
             <div className="pt-4 border-t border-gray-100 mt-4 px-2">
                <button 
                  onClick={() => { localStorage.clear(); navigate('/login'); }}
                  className="w-full flex items-center gap-4 p-4 rounded-[24px] text-red-500 hover:bg-red-50 transition-all font-bold text-[13px]"
                >
                  <div className="p-2.5 bg-red-50 rounded-xl">
                    <LogOut size={20} />
                  </div>
                  Sign Out
                </button>
             </div>
          </nav>

          {/* Footer Info */}
          <div className="absolute bottom-10 left-0 right-0 px-8 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest leading-loose">
             System v4.2.1 • Phoenix Sector<br/>
             Authorized Personnel Only
          </div>
        </div>
      </div>
    </>
  );
};

export default StitchSidebar;
