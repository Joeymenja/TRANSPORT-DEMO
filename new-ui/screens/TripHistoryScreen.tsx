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
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-[24px] focus:bg-white focus:border-sky-500 transition-all text-sm font-medium"
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
            className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-xl ${item.status === 'COMPLETED' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                      <Calendar size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.date} • {item.time}</p>
                      <h4 className="font-black text-gray-800">{item.client}</h4>
                   </div>
                </div>
                <div className="bg-gray-50 px-2 py-1 rounded text-[9px] font-mono text-gray-400">{item.id}</div>
              </div>

              <div className="flex gap-4 mb-6">
                 <div className="flex flex-col items-center gap-1 mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div className="w-0.5 h-6 bg-gray-50" />
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                 </div>
                 <div className="space-y-2 flex-1">
                    <p className="text-xs font-bold text-gray-600 truncate">{item.pickup}</p>
                    <p className="text-xs font-bold text-gray-600 truncate">{item.dropoff}</p>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                       <MapPin size={12} className="text-gray-300" />
                       <span className="text-[10px] font-black text-gray-500 uppercase">{item.miles} mi</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <CheckCircle2 size={12} className="text-green-500" />
                       <span className="text-[10px] font-black text-green-600 uppercase">Verified</span>
                    </div>
                 </div>
                 <button className="flex items-center gap-2 bg-sky-50 text-sky-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                    View
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Detail Modal */}
      {selectedTrip && (
         <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
               <div className="relative h-40 bg-gray-100">
                  <div className="absolute top-4 right-4 z-10">
                     <button onClick={() => setSelectedTrip(null)} className="p-2 bg-white/50 backdrop-blur-md rounded-full shadow-sm"><X size={20}/></button>
                  </div>
                  <img src="https://picsum.photos/seed/map_report/600/300" className="w-full h-full object-cover opacity-50 grayscale" />
                  <div className="absolute bottom-4 left-6">
                     <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg">Trip Report #{selectedTrip.id}</p>
                  </div>
               </div>
               
               <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                     <div>
                        <h3 className="text-2xl font-black text-gray-900">{selectedTrip.client}</h3>
                        <p className="text-sm font-medium text-gray-500">{selectedTrip.date} • {selectedTrip.time}</p>
                     </div>
                     <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${selectedTrip.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {selectedTrip.status.replace('_', ' ')}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                        <div className="flex justify-between text-xs">
                           <span className="text-gray-400 font-bold uppercase tracking-wide">Distance</span>
                           <span className="font-black text-gray-900">{selectedTrip.miles} Miles</span>
                        </div>
                        <div className="flex justify-between text-xs">
                           <span className="text-gray-400 font-bold uppercase tracking-wide">Compliance</span>
                           <span className="font-black text-green-600">100% Verified</span>
                        </div>
                        <div className="flex justify-between text-xs">
                           <span className="text-gray-400 font-bold uppercase tracking-wide">Signatures</span>
                           <span className="font-black text-gray-900">Driver, Member</span>
                        </div>
                     </div>
                  </div>

                  <button 
                    onClick={handleDownload}
                    className="w-full bg-sky-500 text-white font-black py-4 rounded-[28px] shadow-xl shadow-sky-200 text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                     <Download size={18} /> Download Official PDF
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default TripHistoryScreen;