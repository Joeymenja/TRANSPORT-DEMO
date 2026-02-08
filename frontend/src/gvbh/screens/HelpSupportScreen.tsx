
import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Phone, Mail, HelpCircle, ChevronRight, Search, BookOpen, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';

interface HelpSupportScreenProps {
  onBack: () => void;
}

const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const faqs = [
    { q: 'How do I handle a No-Show?', a: 'Wait at least 10 minutes at the pickup location, make 3 contact attempts via phone and knock, then document with a photo in-app before leaving.' },
    { q: 'What is AHCCCS compliance?', a: 'It refers to the Arizona Health Care Cost Containment System requirements which mandate specific trip reporting, GPS logging, and driver certification.' },
    { q: 'Vehicle issues during a trip?', a: 'Immediately use the "Report Issue" button in the active trip screen to notify dispatch and safety teams.' }
  ];

  return (
    <div className="fixed inset-0 z-[55] bg-gray-50 flex flex-col max-w-md mx-auto h-screen overflow-hidden font-sans">
      {/* Header - Standard Scale */}
      <div className="bg-white px-5 py-4 border-b border-gray-100 shadow-sm flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-1 text-gray-400 hover:text-gray-900 active:scale-90 transition-all">
            <ArrowLeft size={24}/>
          </button>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight leading-none uppercase">Support</h2>
        </div>
        <div className="w-10 h-10 bg-teal-50 text-teal-500 rounded-xl flex items-center justify-center shadow-inner"><HelpCircle size={20}/></div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6 pb-32">
        {/* Search Bar - Standard Scale */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-teal-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search help articles..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-xl shadow-sm font-bold text-[14px] focus:border-teal-500 outline-none transition-all placeholder:text-gray-300"
          />
        </div>

        {/* Quick Help Tile - Reduced Padding and Radius */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <Zap size={80} />
           </div>
           <div className="relative z-10 space-y-4">
              <div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-1">Intelligence Link</p>
                 <h3 className="text-[16px] font-bold leading-tight">Need immediate technical assist?</h3>
              </div>
              <button className="flex items-center gap-2 bg-teal-500 px-5 py-2.5 rounded-lg font-bold text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-md">
                 Connect to IT <ArrowUpRight size={14} />
              </button>
           </div>
        </div>

        {/* Support Channels - Standard Grid */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">DIRECT CHANNELS</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Briefing', icon: MessageSquare, color: 'text-teal-500', bg: 'bg-teal-50' },
              { label: 'Secure Dial', icon: Phone, color: 'text-green-500', bg: 'bg-green-50' },
              { label: 'E-Mail', icon: Mail, color: 'text-amber-500', bg: 'bg-amber-50' }
            ].map((channel, i) => (
              <button key={i} className="bg-white p-4 rounded-xl border border-gray-50 shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-all group">
                <div className={`p-3 rounded-lg transition-colors ${channel.bg} ${channel.color} group-hover:bg-slate-900 group-hover:text-white`}>
                  <channel.icon size={20} />
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{channel.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* FAQ Section - Standard Radii */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">KNOWLEDGE BASE</h3>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2 active:scale-[0.99] transition-all group cursor-pointer">
                <div className="flex justify-between items-start gap-4">
                  <h4 className="font-bold text-slate-800 text-[14px] leading-tight group-hover:text-teal-600 transition-colors">{faq.q}</h4>
                  <ChevronRight size={16} className="text-gray-200 shrink-0 group-hover:text-teal-500" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Resources - Compact List */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">GOVERNANCE</h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md divide-y divide-gray-50 overflow-hidden">
            {[
              { label: 'Fleet Handbook 2026', icon: BookOpen },
              { label: 'HIPAA Data Protocols', icon: ShieldCheck },
              { label: 'Driver Agreement', icon: HelpCircle }
            ].map((item, i) => (
              <button key={i} className="w-full flex items-center justify-between p-5 active:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-teal-50 group-hover:text-teal-500 transition-all"><item.icon size={18}/></div>
                  <span className="text-[14px] font-bold text-gray-700 leading-none">{item.label}</span>
                </div>
                <ChevronRight size={14} className="text-gray-200" />
              </button>
            ))}
          </div>
        </section>

        <div className="text-center pt-12 pb-8 opacity-40">
           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">GVBH TRANSPORTATION v1.2.3 (441)</p>
           <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">SECURED NODES: PHOENIX • MESA • GILBERT</p>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportScreen;
