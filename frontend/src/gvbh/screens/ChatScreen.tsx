
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  MoreVertical, 
  Camera, 
  Paperclip, 
  Send, 
  Mic, 
  MapPin, 
  ImageIcon, 
  MoreHorizontal,
  Shield,
  // Added CheckCheck to the imports to fix the reference error on line 104
  CheckCheck
} from 'lucide-react';

interface ChatScreenProps {
  thread: { id: string; name: string; online: boolean };
  onBack: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ thread, onBack }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hey John, trip TRP-1024 has been assigned to you.', time: '10:00 AM', sender: 'dispatch' },
    { id: '2', text: 'Got it, heading there now.', time: '10:02 AM', sender: 'me' },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  useEffect(() => {
    if (messages[messages.length - 1].sender === 'me') {
       const timer = setTimeout(() => setIsTyping(true), 1500);
       const stopTimer = setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, {
             id: Date.now().toString(),
             text: 'Copy that. Please update arrival status upon reaching the geofence.',
             time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
             sender: 'dispatch'
          }]);
       }, 4500);
       return () => { clearTimeout(timer); clearTimeout(stopTimer); };
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'me'
    };
    setMessages([...messages, newMessage]);
    setMessage('');
  };

  return (
    <div className="fixed inset-0 z-[65] bg-gray-50 flex flex-col max-md mx-auto h-screen shadow-2xl">
      {/* Header */}
      <div className="bg-white px-8 py-10 flex items-center justify-between border-b border-gray-100 shadow-sm z-10">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400 active:scale-90 transition-all"><ArrowLeft size={32} /></button>
          <div className="relative">
            <div className="w-16 h-16 bg-teal-50 rounded-[28px] flex items-center justify-center text-teal-500 font-black text-xl border-4 border-white shadow-xl">
              {thread.name[0]}
            </div>
            {thread.online && (
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 border-4 border-white rounded-full shadow-md" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 leading-tight tracking-tight">{thread.name}</h3>
            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mt-1 ${thread.online ? 'text-green-500' : 'text-gray-300'}`}>
              {thread.online ? 'Active Channel' : 'Away'}
            </p>
          </div>
        </div>
        <button className="p-4 text-teal-500 bg-teal-50 rounded-2xl active:scale-90 transition-all shadow-sm"><Phone size={24}/></button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar bg-white">
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 bg-gray-50 px-6 py-2 rounded-full border border-gray-100 shadow-inner">
             <Shield size={12} className="text-teal-500" />
             <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">HIPAA End-to-End Secure</span>
          </div>
        </div>
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-6 rounded-[40px] shadow-2xl transition-all hover:scale-[1.02] ${msg.sender === 'me' ? 'bg-teal-500 text-white rounded-br-none shadow-teal-100/50' : 'bg-gray-50 text-gray-800 rounded-bl-none border border-gray-100 shadow-gray-100'}`}>
              <p className="text-base font-bold leading-relaxed">{msg.text}</p>
              <div className={`flex items-center gap-1.5 mt-3 ${msg.sender === 'me' ? 'text-teal-100/60' : 'text-gray-300'}`}>
                 <p className="text-[9px] font-black uppercase tracking-widest">{msg.time}</p>
                 {msg.sender === 'me' && <CheckCheck size={10} />}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-in fade-in slide-in-from-left-2">
             <div className="bg-gray-50 p-4 rounded-[28px] rounded-bl-none border border-gray-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-20" />
      </div>

      {/* Input Area */}
      <div className="p-10 bg-white border-t border-gray-50">
        <div className="flex items-end gap-4 bg-gray-50 p-4 rounded-[44px] border-2 border-transparent focus-within:border-teal-100 focus-within:bg-white transition-all shadow-inner">
          <button className="p-4 text-gray-300 hover:text-teal-500 active:scale-90 transition-all"><Paperclip size={24}/></button>
          <textarea 
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type secure response..."
            className="flex-1 bg-transparent border-none py-4 px-2 focus:ring-0 text-base font-bold text-gray-800 placeholder:text-gray-300 resize-none no-scrollbar max-h-32"
          />
          <button 
            onClick={handleSend} 
            disabled={!message.trim()}
            className={`p-4 rounded-[28px] shadow-2xl transition-all active:scale-90 flex items-center justify-center ${message.trim() ? 'bg-teal-500 text-white shadow-teal-200' : 'bg-gray-100 text-gray-300 opacity-50 cursor-not-allowed'}`}
          >
             <Send size={24} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
