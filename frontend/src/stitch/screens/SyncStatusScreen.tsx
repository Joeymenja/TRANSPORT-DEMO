
import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle2, Clock, AlertCircle, Trash2, CloudOff } from 'lucide-react';

interface SyncStatusScreenProps {
  onBack: () => void;
}

const SyncStatusScreen: React.FC<SyncStatusScreenProps> = ({ onBack }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [queue, setQueue] = useState([
    { id: 'q1', type: 'Trip Report', detail: 'TRP-1022 - Client John Doe', status: 'pending', time: '10m ago' },
    { id: 'q2', type: 'Photo Upload', detail: 'Odometer reading photo', status: 'error', time: '12m ago', error: 'Network timeout' },
    { id: 'q3', type: 'Message', detail: 'To Dispatch: "Arrived at clinic"', status: 'pending', time: '5m ago' },
  ]);

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setQueue(queue.map(item => ({ ...item, status: 'success' })));
      setIsSyncing(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[75] bg-gray-50 flex flex-col max-w-md mx-auto h-screen">
      <div className="bg-white px-6 py-6 border-b border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-2 text-gray-400 hover:text-gray-900">
            <ArrowLeft size={28}/>
          </button>
          <h2 className="text-xl font-black text-gray-900">Sync Center</h2>
        </div>
        <button 
          onClick={handleSyncNow}
          className={`p-2 bg-teal-50 text-teal-500 rounded-xl transition-all ${isSyncing ? 'animate-spin' : ''}`}
        >
          <RefreshCw size={20}/>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
        <div className="p-6 bg-teal-50 rounded-[32px] border border-teal-100 text-center space-y-3">
          <CloudOff className="mx-auto text-teal-500" size={32} />
          <div>
            <p className="text-sm font-black text-teal-900">Offline Mode Active</p>
            <p className="text-[11px] text-teal-600 font-medium">Actions performed while offline are queued below. They will automatically sync when connection returns.</p>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between ml-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pending Queue ({queue.length})</h3>
            <button className="text-[10px] font-black text-red-500 uppercase tracking-widest">Clear All</button>
          </div>

          <div className="space-y-3">
            {queue.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      item.status === 'success' ? 'bg-green-50 text-green-500' : 
                      item.status === 'error' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
                    }`}>
                      {item.status === 'success' ? <CheckCircle2 size={18}/> : 
                       item.status === 'error' ? <AlertCircle size={18}/> : <Clock size={18}/>}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-800">{item.type}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{item.time}</p>
                    </div>
                  </div>
                  <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16}/>
                  </button>
                </div>
                
                <p className="text-xs text-gray-600 font-medium pl-11">{item.detail}</p>
                
                {item.error && (
                  <div className="mt-2 p-2 bg-red-50 rounded-lg flex items-center gap-2">
                    <AlertCircle size={12} className="text-red-500" />
                    <p className="text-[9px] font-bold text-red-600 uppercase">{item.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle2 size={20} />
             </div>
             <div>
                <p className="text-xs font-black text-gray-800 uppercase tracking-widest">Last Successful Sync</p>
                <p className="text-lg font-black text-green-600">Jan 4, 2026 - 10:42 AM</p>
             </div>
          </div>
          <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
            Data integrity is maintained through SQLCipher encryption. Your report signatures and coordinates are cryptographically secured until delivery.
          </p>
        </div>
      </div>

      <div className="p-6 bg-white border-t border-gray-50 fixed bottom-0 left-0 right-0 max-w-md mx-auto">
        <button 
          onClick={handleSyncNow}
          disabled={isSyncing}
          className="w-full bg-teal-500 text-white font-black py-5 rounded-[32px] shadow-2xl shadow-teal-200 text-lg active:scale-95 transition-all"
        >
          {isSyncing ? 'Syncing...' : 'Sync All Now'}
        </button>
      </div>
    </div>
  );
};

export default SyncStatusScreen;
