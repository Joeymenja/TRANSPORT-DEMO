import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle2, Clock, AlertCircle, Trash2, CloudOff, FileDigit, Server } from 'lucide-react';
import { offlineQueue, QueueItem } from '../services/OfflineQueue';

interface SyncStatusScreenProps {
  onBack: () => void;
}

const SyncStatusScreen: React.FC<SyncStatusScreenProps> = ({ onBack }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictItem, setConflictItem] = useState<QueueItem | null>(null);

  useEffect(() => {
    // Subscribe to queue changes
    const unsubscribe = offlineQueue.subscribe((items) => {
      setQueue(items.sort((a, b) => b.timestamp - a.timestamp));
    });
    return unsubscribe;
  }, []);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    await offlineQueue.sync();
    setIsSyncing(false);
  };

  const handleClearAll = () => {
    // Basic implementation: clear all (mock)
    queue.forEach(item => offlineQueue.removeItem(item.id));
  };

  const openConflict = (item: QueueItem) => {
    setConflictItem(item);
    setShowConflictModal(true);
  };

  const resolveConflict = (useLocal: boolean) => {
    if (conflictItem) {
      if (useLocal) {
        // Retry as normal update
        offlineQueue.updateStatus(conflictItem.id, 'PENDING');
      } else {
        // Discard local change
        offlineQueue.removeItem(conflictItem.id);
      }
    }
    setShowConflictModal(false);
    setConflictItem(null);
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
            <p className="text-sm font-black text-teal-900">Queue Manager</p>
            <p className="text-[11px] text-teal-600 font-medium">Actions are stored securely locally until connection is verified.</p>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between ml-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pending Queue ({queue.length})</h3>
            {queue.length > 0 && (
              <button onClick={handleClearAll} className="text-[10px] font-black text-red-500 uppercase tracking-widest">Clear All</button>
            )}
          </div>

          <div className="space-y-3">
            {queue.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                 <CheckCircle2 size={32} className="mx-auto mb-2 opacity-30" />
                 <p className="text-xs font-bold">All caught up!</p>
              </div>
            ) : queue.map((item) => (
              <div 
                key={item.id} 
                className={`bg-white p-5 rounded-[24px] border shadow-sm space-y-3 ${item.status === 'CONFLICT' ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'}`}
                onClick={() => item.status === 'CONFLICT' && openConflict(item)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      item.status === 'SYNCING' ? 'bg-teal-50 text-teal-500' : 
                      item.status === 'ERROR' ? 'bg-red-50 text-red-500' : 
                      item.status === 'CONFLICT' ? 'bg-amber-50 text-amber-500' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.status === 'SYNCING' ? <RefreshCw size={18} className="animate-spin"/> : 
                       item.status === 'ERROR' ? <AlertCircle size={18}/> : 
                       item.status === 'CONFLICT' ? <FileDigit size={18}/> : <Clock size={18}/>}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-800">{item.type.replace('_', ' ')}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{new Date(item.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); offlineQueue.removeItem(item.id); }} 
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
                
                <p className="text-xs text-gray-600 font-medium pl-11 truncate">
                   ID: {item.id.substring(0, 12)}...
                </p>
                
                {item.error && (
                  <div className={`mt-2 p-2 rounded-lg flex items-center justify-between gap-2 ${item.status === 'CONFLICT' ? 'bg-amber-100' : 'bg-red-50'}`}>
                    <div className="flex items-center gap-2">
                       <AlertCircle size={12} className={item.status === 'CONFLICT' ? 'text-amber-600' : 'text-red-500'} />
                       <p className={`text-[9px] font-bold uppercase ${item.status === 'CONFLICT' ? 'text-amber-700' : 'text-red-600'}`}>{item.error || 'Sync Failed'}</p>
                    </div>
                    {item.status === 'CONFLICT' && (
                       <span className="text-[9px] font-black text-amber-600 uppercase underline">Resolve</span>
                    )}
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

      {/* Conflict Resolution Modal */}
      {showConflictModal && conflictItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full rounded-[40px] p-8 shadow-2xl space-y-6">
              <div className="text-center">
                 <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-amber-100">
                    <FileDigit size={32} />
                 </div>
                 <h3 className="text-2xl font-black text-gray-900">Data Conflict</h3>
                 <p className="text-xs text-gray-500 font-medium mt-2">Server data differs from your local changes.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-[24px] border-2 border-teal-500 bg-teal-50 relative overflow-hidden">
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-2">Your Version</p>
                    <p className="text-sm font-bold text-gray-900">{conflictItem.type}</p>
                    <div className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full" />
                 </div>
                 <div className="p-4 rounded-[24px] border border-gray-200 bg-gray-50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Server size={10}/> Server</p>
                    <p className="text-sm font-bold text-gray-500">Updated remotely</p>
                 </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                 <button 
                   onClick={() => resolveConflict(true)}
                   className="w-full bg-teal-500 text-white font-black py-4 rounded-[24px] shadow-lg active:scale-95 transition-all text-sm uppercase tracking-widest"
                 >
                    Keep My Version
                 </button>
                 <button 
                   onClick={() => resolveConflict(false)}
                   className="w-full bg-white text-gray-500 font-bold py-4 rounded-[24px] border border-gray-200 active:scale-95 transition-all text-sm uppercase tracking-widest"
                 >
                    Use Server Data
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SyncStatusScreen;