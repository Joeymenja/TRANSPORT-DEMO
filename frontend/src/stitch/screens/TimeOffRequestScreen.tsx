
import React, { useState } from 'react';
import { ArrowLeft, Calendar, Info, Check, ChevronRight } from 'lucide-react';

interface TimeOffRequestScreenProps {
  onBack: () => void;
}

const TimeOffRequestScreen: React.FC<TimeOffRequestScreenProps> = ({ onBack }) => {
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[70] bg-white flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto h-screen">
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-[32px] flex items-center justify-center mb-6 animate-in zoom-in duration-500">
          <Check size={48} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Request Sent</h2>
        <p className="text-gray-500 font-medium mb-12">Your time-off request has been submitted to your House Manager for review.</p>
        <button 
          onClick={onBack}
          className="w-full bg-teal-500 text-white font-black py-5 rounded-[32px] shadow-2xl shadow-teal-200 active:scale-95 transition-all"
        >
          Back to Availability
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] bg-gray-50 flex flex-col max-w-md mx-auto h-screen">
      <div className="bg-white px-6 py-6 border-b border-gray-100 shadow-sm flex items-center gap-4">
        <button onClick={onBack} className="p-1 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
          <ArrowLeft size={28}/>
        </button>
        <h2 className="text-xl font-black text-gray-900">Request Time Off</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-32">
        <div className="p-5 bg-amber-50 rounded-[28px] border border-amber-100 flex items-start gap-4">
          <Info className="text-amber-500 mt-1 shrink-0" size={20} />
          <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
            Requests should be submitted at least 48 hours in advance. Approved time-off will automatically block trip assignments for the selected period.
          </p>
        </div>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Request Period</h3>
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-4">Start Date</label>
                <div className="relative">
                   <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                   <input required type="date" className="w-full pl-11 pr-4 py-4 bg-white border border-gray-100 rounded-[24px] shadow-sm font-bold text-gray-700 text-sm focus:border-teal-500" />
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-4">End Date</label>
                <div className="relative">
                   <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                   <input required type="date" className="w-full pl-11 pr-4 py-4 bg-white border border-gray-100 rounded-[24px] shadow-sm font-bold text-gray-700 text-sm focus:border-teal-500" />
                </div>
             </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Request Details</h3>
          <div className="space-y-3">
             <select 
               required
               value={reason}
               onChange={(e) => setReason(e.target.value)}
               className="w-full px-6 py-5 bg-white border border-gray-100 rounded-[24px] shadow-sm font-bold text-gray-700 text-sm appearance-none focus:border-teal-500"
             >
                <option value="">Select Reason for Leave...</option>
                <option value="vacation">Vacation / Personal</option>
                <option value="medical">Medical Appointment</option>
                <option value="family">Family Emergency</option>
                <option value="vehicle">Vehicle Maintenance</option>
                <option value="other">Other</option>
             </select>

             <textarea 
               placeholder="Additional description (optional)..."
               className="w-full px-6 py-5 bg-white border border-gray-100 rounded-[32px] shadow-sm font-medium text-gray-700 text-sm min-h-[150px] focus:border-teal-500"
             />
          </div>
        </section>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-50 max-w-md mx-auto">
          <button 
            type="submit"
            className="w-full bg-teal-500 text-white font-black py-5 rounded-[32px] shadow-2xl shadow-teal-200 text-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Submit Approval Request <ChevronRight size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default TimeOffRequestScreen;
