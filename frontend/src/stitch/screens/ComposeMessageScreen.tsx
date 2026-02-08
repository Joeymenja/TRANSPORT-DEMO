
import React, { useState } from 'react';
import { ArrowLeft, Send, Search, User, Paperclip, Camera, MapPin, X } from 'lucide-react';

interface ComposeMessageScreenProps {
  onBack: () => void;
}

const ComposeMessageScreen: React.FC<ComposeMessageScreenProps> = ({ onBack }) => {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const recipients = [
    { id: 'disp', name: 'Dispatch Center', type: 'System' },
    { id: 'sara', name: 'Sarah Martinez', type: 'Manager' },
    { id: 'supp', name: 'IT Support Team', type: 'Support' },
  ];

  const handleSend = () => {
    if (!recipient || !message) return;
    setIsSent(true);
    setTimeout(onBack, 1500);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-white flex flex-col max-w-md mx-auto h-screen">
      <div className="bg-white px-6 py-6 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft size={28}/>
          </button>
          <h2 className="text-xl font-black text-gray-900">New Message</h2>
        </div>
        {isSent ? (
          <div className="text-green-500 animate-in fade-in zoom-in duration-300">
            <Send size={24} />
          </div>
        ) : (
          <button 
            onClick={handleSend}
            disabled={!recipient || !message}
            className={`p-2 rounded-xl transition-all ${(!recipient || !message) ? 'text-gray-300' : 'bg-teal-50 text-teal-500 shadow-sm active:scale-90'}`}
          >
            <Send size={24}/>
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col p-6 space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="To: Search recipients..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-[24px] font-bold text-gray-800 text-sm focus:bg-white transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {recipients.map((r) => (
              <button 
                key={r.id}
                onClick={() => setRecipient(r.name)}
                className={`flex-shrink-0 px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${recipient === r.name ? 'bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-100' : 'bg-white border-gray-100 text-gray-500'}`}
              >
                <User size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">{r.name}</span>
              </button>
            ))}
          </div>
        </div>

        <textarea 
          placeholder="Write your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 w-full p-4 bg-gray-50 rounded-[32px] border border-gray-100 font-medium text-gray-800 text-sm focus:bg-white transition-all resize-none no-scrollbar focus:ring-2 focus:ring-teal-500/20"
        />

        <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-[24px] border border-gray-100">
           <div className="flex items-center gap-1">
              <button className="p-3 text-gray-400 hover:text-teal-500"><Paperclip size={20}/></button>
              <button className="p-3 text-gray-400 hover:text-teal-500"><Camera size={20}/></button>
              <button className="p-3 text-gray-400 hover:text-teal-500"><MapPin size={20}/></button>
           </div>
           <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mr-4">Attachment Required?</span>
        </div>
      </div>

      {isSent && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-md z-[80] flex items-center justify-center">
           <div className="bg-teal-500 text-white px-8 py-4 rounded-[24px] shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10">
              <Send size={24} className="animate-bounce" />
              <span className="font-black text-sm uppercase tracking-[0.2em]">Message Transmitted</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default ComposeMessageScreen;
