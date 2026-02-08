/**
 * Stitch Messages Screen - Integrated Version
 * Based on GVBH Transportation Driver App
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import StitchBottomNav from '../../components/StitchBottomNav';

const StitchMessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'dispatch' | 'system'>('all');
  
  const threads = [
    { 
      id: '1', 
      name: 'Dispatch Center', 
      lastMsg: 'New trip assigned: TRP-1024. Please review details.', 
      time: '2m', 
      unread: 1, 
      type: 'dispatch',
      online: true 
    },
    { 
      id: '2', 
      name: 'Sarah Martinez', 
      lastMsg: 'Hey, please update your insurance docs.', 
      time: '1h', 
      unread: 0, 
      type: 'dispatch',
      online: false 
    },
    { 
      id: '3', 
      name: 'GVBH System', 
      lastMsg: 'Compliance check passed for your primary vehicle.', 
      time: '3h', 
      unread: 0, 
      type: 'system',
      online: true 
    }
  ];

  const filteredThreads = activeTab === 'all' 
    ? threads 
    : threads.filter(t => t.type === activeTab);


  return (
    <div className="flex flex-col h-screen pb-32 bg-gray-50">
      {/* Inbox Search & Filter */}
      <div className="bg-white p-4 space-y-4 border-b border-gray-50">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-[20px] focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'dispatch', 'system'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-100' 
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto">
        {filteredThreads.map((thread) => (
          <div 
            key={thread.id} 
            className="p-4 flex items-center gap-4 active:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50/50"
            onClick={() => navigate(`/driver/stitch/chat/${thread.id}`)}
          >
            <div className="relative">
              <div className="w-14 h-14 bg-teal-50 rounded-[22px] flex items-center justify-center text-teal-500 border border-teal-100">
                <span className="font-black text-lg">{thread.name[0]}</span>
              </div>
              {thread.online && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h4 className={`font-black truncate ${thread.unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                  {thread.name}
                </h4>
                <span className="text-[10px] font-bold text-gray-400">{thread.time}</span>
              </div>
              <p className={`text-xs truncate ${thread.unread > 0 ? 'font-bold text-gray-600' : 'text-gray-400'}`}>
                {thread.lastMsg}
              </p>
            </div>

            {thread.unread > 0 && (
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{thread.unread}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button 
        className="fixed bottom-24 right-6 w-14 h-14 bg-teal-500 text-white rounded-[24px] shadow-2xl shadow-teal-200 flex items-center justify-center active:scale-90 transition-transform z-30"
      >
        <Plus size={28} />
      </button>

      {/* Bottom Navigation */}
      <StitchBottomNav />
    </div>
  );
};

export default StitchMessagesPage;
