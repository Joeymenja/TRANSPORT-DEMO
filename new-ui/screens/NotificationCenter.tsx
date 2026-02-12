
import React from 'react';
import { X, Bell, Zap, FileText, CheckCircle2, Shield, ChevronRight } from 'lucide-react';

interface NotificationCenterProps {
  items: any[];
  onClose: () => void;
  onMarkRead: () => void;
  onAction: (id: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ items, onClose, onMarkRead, onAction }) => {
  return (
    <div className="h-full w-full bg-white/95 backdrop-blur-xl flex flex-col animate-in slide-in-from-right duration-300">
      <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-sky-50 text-sky-500 rounded-xl">
            <Bell size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Activity Center</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Fleet Logs & Tasks</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 bg-gray-50 rounded-2xl text-gray-400 active:scale-90 transition-all">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 pb-24">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Submissions</h3>
          <button onClick={onMarkRead} className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Clear Badge</button>
        </div>

        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="py-20 text-center space-y-4 opacity-40">
              <Shield size={48} className="mx-auto text-gray-300" />
              <p className="text-sm font-black text-gray-400">No new submissions detected.</p>
            </div>
          ) : items.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onAction(item.id)}
              className={`p-5 rounded-[32px] border transition-all active:scale-[0.98] relative overflow-hidden group ${item.read ? 'bg-white border-gray-50 opacity-70' : 'bg-white border-sky-100 shadow-lg shadow-sky-100/50'}`}
            >
              {!item.read && <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-500" />}
              
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${item.type === 'trip' ? 'bg-sky-50 text-sky-500' : 'bg-amber-50 text-amber-500'}`}>
                  {item.type === 'trip' ? <Zap size={20} /> : <FileText size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-black text-gray-900 leading-tight truncate pr-4">{item.title}</h4>
                    <span className="text-[9px] font-bold text-gray-400 uppercase whitespace-nowrap">{item.time}</span>
                  </div>
                  <p className="text-xs font-medium text-gray-600 leading-relaxed">{item.body}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 mt-1 group-hover:text-sky-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* Audit Log Footer */}
        <div className="pt-6 border-t border-gray-100">
           <div className="bg-gray-50 p-6 rounded-[32px] flex items-center gap-4">
              <CheckCircle2 size={24} className="text-green-500" />
              <div>
                 <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">Compliance Health</p>
                 <p className="text-xs font-medium text-gray-500">All trip signatures from the last 24h have been verified and submitted to House Manager portal.</p>
              </div>
           </div>
        </div>
      </div>

      <div className="p-8 bg-white border-t border-gray-50 fixed bottom-0 left-0 right-0 max-w-md mx-auto">
        <button 
          onClick={onClose}
          className="w-full bg-gray-900 text-white font-black py-5 rounded-[28px] shadow-2xl active:scale-95 transition-all text-sm uppercase tracking-widest"
        >
          Close Activity Center
        </button>
      </div>
    </div>
  );
};

export default NotificationCenter;
