/**
 * Stitch Help & Support Screen - Integrated Version
 * Based on GVBH Transportation Driver App
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Phone, Mail, HelpCircle, ChevronRight, Search, BookOpen, ShieldCheck } from 'lucide-react';
import StitchBottomNav from '../../components/StitchBottomNav';

const StitchHelpPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const faqs = [
    { q: 'How do I handle a No-Show?', a: 'Wait at least 10 minutes at the pickup location, make 3 contact attempts via phone and knock, then document with a photo in-app before leaving.' },
    { q: 'What is AHCCCS compliance?', a: 'It refers to the Arizona Health Care Cost Containment System requirements which mandate specific trip reporting, GPS logging, and driver certification.' },
    { q: 'Vehicle issues during a trip?', a: 'Immediately use the "Report Issue" button in the active trip screen to notify dispatch and safety teams.' }
  ];

  return (
    <div className="bg-gray-50 flex flex-col max-w-md mx-auto min-h-screen">
      {/* Header */}
      <div className="bg-white px-6 py-6 border-b border-gray-100 shadow-sm flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-1 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
          <ArrowLeft size={28}/>
        </button>
        <h2 className="text-xl font-black text-gray-900">Help & Support</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-40">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search help articles..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[24px] shadow-sm font-medium text-sm focus:border-teal-500 transition-all"
          />
        </div>

        {/* Support Channels */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Contact Channels</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Chat', icon: MessageSquare, color: 'text-teal-500', bg: 'bg-teal-50' },
              { label: 'Call', icon: Phone, color: 'text-green-500', bg: 'bg-green-50' },
              { label: 'Email', icon: Mail, color: 'text-amber-500', bg: 'bg-amber-50' }
            ].map((channel, i) => (
              <button key={i} className="bg-white p-4 rounded-[28px] border border-gray-50 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-all">
                <div className={`p-3 rounded-xl ${channel.bg} ${channel.color}`}>
                  <channel.icon size={20} />
                </div>
                <span className="text-[10px] font-black text-gray-700 uppercase">{channel.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Frequent Questions</h3>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-800 text-sm leading-tight pr-4">{faq.q}</h4>
                  <ChevronRight size={16} className="text-gray-300 shrink-0" />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full flex items-center justify-center gap-2 text-teal-500 font-black text-xs uppercase tracking-widest py-2">
            View All FAQ <ChevronRight size={14} />
          </button>
        </section>

        {/* Legal & Docs */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Resources</h3>
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm divide-y divide-gray-50">
            {[
              { label: 'Driver Handbook', icon: BookOpen },
              { label: 'Privacy Policy', icon: ShieldCheck },
              { label: 'Terms of Service', icon: HelpCircle }
            ].map((item, i) => (
              <button key={i} className="w-full flex items-center justify-between p-5 first:rounded-t-[32px] last:rounded-b-[32px] active:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><item.icon size={18}/></div>
                  <span className="text-sm font-bold text-gray-700">{item.label}</span>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </button>
            ))}
          </div>
        </section>

         <div className="text-center pt-10 pb-6 opacity-40">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">TRANSPORT-DEMO v1.0.0</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">AHCCCS COMPLIANT • HIPAA SECURE</p>
         </div>
      </div>
      <StitchBottomNav />
    </div>
  );
};

export default StitchHelpPage;
