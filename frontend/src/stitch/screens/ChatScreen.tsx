
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
  MoreHorizontal 
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
    // Simulate typing indicator from dispatch after a message
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
    <div className="fixed inset-0 z-[65] bg-white flex flex-col max-w-md mx-auto h-screen">
      {/* Header */}
      <div className="bg-white px-6 py-5 flex items-center justify-between border-b border-gray-50 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-2 text-gray-400"><ArrowLeft size={24} /></button>
          <div className="relative">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-500 font-black">
              {thread.name[0]}
            </div>
            {thread.online && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 leading-tight">{thread.name}</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {thread.online ? 'Online' : 'Away'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-teal-500 bg-teal-50 rounded-xl active:scale-90 transition-all"><Phone size={20}/></button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-gray-50">
        <div className="text-center py-4">
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-sm">Protocol: HIPAA Secure</span>
        </div>
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[80%] p-4 rounded-[24px] ${msg.sender === 'me' ? 'bg-teal-500 text-white rounded-br-none shadow-lg shadow-teal-100' : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'}`}>
              <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
              <p className={`text-[9px] font-bold mt-2 uppercase tracking-widest ${msg.sender === 'me' ? 'text-teal-100' : 'text-gray-400'}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-300">
             <div className="bg-white p-3 rounded-[20px] rounded-bl-none shadow-sm border border-gray-100 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-gray-50">
        <div className="flex items-end gap-3 bg-gray-50 p-2 rounded-[28px] border border-gray-100">
          <button className="p-3 text-gray-400 hover:text-teal-500 transition-colors"><Paperclip size={20}/></button>
          <textarea 
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Secure message..."
            className="flex-1 bg-transparent border-none py-3 px-2 focus:ring-0 text-sm font-medium resize-none no-scrollbar max-h-32"
          />
          {message.trim() && (
            <button onClick={handleSend} className="p-3 bg-teal-500 text-white rounded-2xl shadow-lg active:scale-90 transition-all"><Send size={20} /></button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
