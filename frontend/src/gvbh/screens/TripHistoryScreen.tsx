import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, Calendar, MapPin, ChevronRight, FileText, Download, CheckCircle2, X } from 'lucide-react';
import { generateTripReport } from '../utils/ReportGenerator';

interface TripHistoryScreenProps {
  onBack: () => void;
}

interface HistoryItem {
  id: string;
  client: string;
  date: string;
  time: string;
  miles: number;
  status: 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
  pickup: string;
  dropoff: string;
}

const TripHistoryScreen: React.FC<TripHistoryScreenProps> = ({ onBack }) => {
  const [selectedTrip, setSelectedTrip] = useState<HistoryItem | null>(null);

  const history: HistoryItem[] = [
    { 
      id: 'TRP-1022', 
      client: 'John Doe', 
      date: 'Jan 4, 2026', 
      time: '09:00 AM', 
      miles: 4.2, 
      status: 'COMPLETED',
      pickup: '450 Stanyan St',
      dropoff: 'Dialysis Center West'
    },
    { 
      id: 'TRP-1020', 
      client: 'Sarah Miller', 
      date: 'Jan 3, 2026', 
      time: '01:30 PM', 
      miles: 12.8, 
      status: 'COMPLETED',
      pickup: 'Residential Ave',
      dropoff: 'General Hospital'
    },
    { 
      id: 'TRP-1018', 
      client: 'Robert Fox', 
      date: 'Jan 3, 2026', 
      time: '10:15 AM', 
      miles: 2.1, 
      status: 'NO_SHOW',
      pickup: 'Oak St',
      dropoff: 'Clinic North'
    }
  ];

  const handleDownload = () => {
    if (selectedTrip) {
      generateTripReport({
        id: selectedTrip.id,
        client: selectedTrip.client,
        pickup: selectedTrip.pickup,
        dropoff: selectedTrip.dropoff,
        miles: selectedTrip.miles,
        // Mock specific times/odos as they aren't in summary
        pickupTime: selectedTrip.time,
        dropoffTime: 'N/A',
        startOdo: '40,000',
        endOdo: `40,0${Math.floor(selectedTrip.miles)}` 
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[65] bg-gray-50 flex flex-col max-w-md mx-auto h-screen">
      {/* Header */}
      <div className="bg-white px-6 py-6 border-b border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-2 text-gray-400 hover:text-gray-900">
            <ArrowLeft size={28}/>
          </button>
          <h2 className="text-xl font-black text-gray-900">Trip History</h2>
        </div>
        <button className="p-2 bg-gray-50 text-gray-500 rounded-xl"><Filter size={20}/></button>
      </div>

      <div className="p-6 bg-white border-b border-gray-50">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by trip ID or client..." 
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-[24px] focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4 pb-20">
        <div className="flex items-center justify-between px-2 mb-2">
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Archived Reports</h3>
           <p className="text-[9px] font-bold text-gray-300 uppercase">Retention: 7 Years</p>
        </div>

        {history.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedTrip(item)}
            className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden active:scale-[0.98] transition-all cursor-pointer hover:border-teal-100"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.date} • {item.time}</p>
                    <h4 className="text-lg font-black text-gray-900 mt-1">{item.client}</h4>
                 </div>
                 <div className="flex flex-col items-end gap-1">
                    <div className="bg-gray-50 px-2.5 py-1 rounded-lg text-[9px] font-black text-gray-400 tracking-wider">#{item.id}</div>
                    <div className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${item.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                       {item.status}
                    </div>
                 </div>
              </div>

              <div className="bg-slate-50/50 rounded-2xl p-4 mb-4 border border-slate-50">
                 <div className="space-y-3">
                    <div className="flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                       <p className="text-xs font-bold text-gray-600 truncate">{item.pickup}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                       <p className="text-xs font-bold text-gray-600 truncate">{item.dropoff}</p>
                    </div>
                 </div>
              </div>

              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                       <MapPin size={12} className="text-gray-300" />
                       <span className="text-[10px] font-black text-gray-500 uppercase">{item.miles} mi</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <CheckCircle2 size={12} className="text-green-500" />
                       <span className="text-[10px] font-black text-gray-400 uppercase">Archived</span>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button className="text-teal-500 hover:text-teal-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 transition-colors">
                       Inspect
                    </button>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Detail Modal */}
      {selectedTrip && (
         <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
               <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-3 bg-teal-50 text-teal-500 rounded-2xl"><FileText size={24}/></div>
                     <button onClick={() => setSelectedTrip(null)} className="p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 transition-colors"><X size={20}/></button>
                  </div>

                  <div className="mb-8">
                     <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-teal-500 bg-teal-50 px-2 py-0.5 rounded-md uppercase tracking-widest">{selectedTrip.id}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedTrip.date}</span>
                     </div>
                     <h3 className="text-2xl font-black text-gray-900 tracking-tight">{selectedTrip.client}</h3>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Route Log</p>
                        <div className="p-4 bg-gray-50 border border-gray-100 rounded-3xl space-y-4">
                           <div className="flex gap-3">
                              <div className="flex flex-col items-center gap-1 mt-1">
                                 <div className="w-2 h-2 rounded-full border-2 border-teal-500" />
                                 <div className="w-0.5 h-4 bg-gray-200" />
                                 <div className="w-2 h-2 rounded-full border-2 border-red-400" />
                              </div>
                              <div className="flex-1 space-y-3">
                                 <div>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Origin</p>
                                    <p className="text-xs font-bold text-gray-700 leading-tight">{selectedTrip.pickup}</p>
                                 </div>
                                 <div className="pt-1">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Target</p>
                                    <p className="text-xs font-bold text-gray-700 leading-tight">{selectedTrip.dropoff}</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 border border-gray-100 rounded-3xl">
                           <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Distance</p>
                           <p className="text-lg font-black text-gray-900">{selectedTrip.miles}<span className="text-[10px] ml-1">mi</span></p>
                        </div>
                        <div className="p-4 bg-gray-50 border border-gray-100 rounded-3xl">
                           <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Audit Status</p>
                           <p className="text-sm font-black text-green-600 uppercase">Verified</p>
                        </div>
                     </div>
                  </div>

                  <div className="mt-10 flex gap-3">
                     <button 
                       onClick={handleDownload}
                       className="flex-1 bg-white border-2 border-slate-100 text-slate-500 font-black py-4 rounded-[24px] text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all"
                     >
                        <Download size={16} /> PDF
                     </button>
                     <button 
                       className="flex-[2] bg-slate-900 text-white font-black py-4 rounded-[24px] text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-slate-200 active:scale-95 transition-all"
                     >
                        Detailed View
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default TripHistoryScreen;