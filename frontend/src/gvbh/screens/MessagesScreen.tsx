
import React, { useState } from 'react';
import { Search, Plus, MoreVertical, CheckCheck, Image as ImageIcon, MapPin, ChevronRight } from 'lucide-react';

const MessagesScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'dispatch' | 'system'>('all');
  
  const threads = [
    { id: '1', name: 'Dispatch Center', lastMsg: 'New trip assigned: TRP-1024.', time: '2m', unread: 1, type: 'dispatch', online: true },
    { id: '2', name: 'Sarah Martinez', lastMsg: 'Hey John, please update insurance.', time: '1h', unread: 0, type: 'dispatch', online: false },
    { id: '3', name: 'GVBH System', lastMsg: 'Compliance check passed.', time: '3h', unread: 0, type: 'system', online: true }
  ];

  return (
    <div className="flex flex-col h-full pb-20 bg-white">
      <div className="bg-white px-5 py-6 space-y-6 border-b border-gray-50">
        <div className="space-y-1">
           <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Inbox</h2>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fleet Communication</p>
        </div>

        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="w-full pl-11 pr-5 py-3 bg-slate-50 border-none rounded-xl text-[13px] font-bold placeholder:text-slate-300"
          />
        </div>

        <div className="flex gap-2">
          {['all', 'dispatch', 'system'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-teal-500 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pt-2 px-3">
        {threads.map((thread) => (
          <div 
            key={thread.id} 
            className="p-4 mb-2 flex items-center gap-4 active:bg-slate-50 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-slate-50 group"
            onClick={() => window.dispatchEvent(new CustomEvent('open-chat', { detail: thread }))}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-500 font-bold text-lg border border-teal-100 shadow-sm">
                {thread.name[0]}
              </div>
              {thread.online && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <h4 className={`text-[14px] font-bold truncate ${thread.unread > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                  {thread.name}
                </h4>
                <span className="text-[9px] font-bold text-slate-300 uppercase">{thread.time}</span>
              </div>
              <p className={`text-[12px] truncate ${thread.unread > 0 ? 'font-bold text-slate-600' : 'text-slate-400'}`}>
                {thread.lastMsg}
              </p>
            </div>

            {thread.unread > 0 ? (
              <div className="w-5 h-5 bg-teal-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-[10px] font-bold text-white">{thread.unread}</span>
              </div>
            ) : (
                <ChevronRight size={16} className="text-slate-200" />
            )}
          </div>
        ))}
      </div>

      <button className="fixed bottom-24 right-6 w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center justify-center active:scale-90 transition-all z-30">
        <Plus size={28} strokeWidth={3} />
      </button>
    </div>
  );
};

export default MessagesScreen;
