
import React, { useState } from 'react';
import { 
  ArrowLeft, Car, Plus, ShieldCheck, AlertCircle, Trash2, CheckCircle2, ChevronRight, Info, Zap, 
  FileText, Camera, Loader2, Sparkles, Activity, Settings, X, Save
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import PhotoUploader from '../components/PhotoUploader';

interface Vehicle {
  id: string;
  year: string;
  make: string;
  model: string;
  plate: string;
  type: string;
  isPrimary: boolean;
  status: 'active' | 'pending' | 'expired';
  complianceHealth: number;
}

interface VehicleManagementScreenProps {
  onBack: () => void;
}

const VehicleManagementScreen: React.FC<VehicleManagementScreenProps> = ({ onBack }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: 'v1', year: '2022', make: 'Toyota', model: 'Sienna', plate: 'AZ-BGT542', type: 'Wheelchair Van', isPrimary: true, status: 'active', complianceHealth: 100 },
    { id: 'v2', year: '2020', make: 'Ford', model: 'Transit', plate: 'AZ-992JKF', type: 'Full-size Van', isPrimary: false, status: 'expired', complianceHealth: 40 }
  ]);
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    year: '', make: '', model: '', plate: '', vin: '', type: 'Sedan',
    insuranceFront: '', insuranceBack: '', registration: ''
  });

  return (
    <div className="fixed inset-0 z-[55] bg-slate-50 flex flex-col max-w-md mx-auto h-screen font-sans">
      <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1.5 -ml-1 text-slate-400 hover:text-slate-900 transition-all active:scale-90"><ArrowLeft size={24}/></button>
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 tracking-tight uppercase leading-none">Fleet Control</h2>
            <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest mt-1.5">Asset Registry</p>
          </div>
        </div>
        <button onClick={() => setIsRegistering(true)} className="p-3 bg-teal-500 text-white rounded-xl active:scale-90 transition-all shadow-md"><Plus size={18} strokeWidth={3}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar pb-32">
        <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 flex items-start gap-4">
           <ShieldCheck size={20} className="text-teal-500 shrink-0 mt-0.5" />
           <p className="text-[12px] font-bold text-teal-900 uppercase tracking-tight leading-snug">Asset safety audits are mandated every 3,000 service miles.</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Registered Units</h3>
          {vehicles.map((v) => (
            <div key={v.id} className={`bg-white rounded-2xl border transition-all overflow-hidden ${v.isPrimary ? 'border-teal-500 shadow-lg' : 'border-slate-100 shadow-sm'}`}>
              <div className="p-5">
                <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner ${v.isPrimary ? 'bg-teal-500 text-white border-white shadow-md' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                       <Car size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] font-bold text-slate-900 leading-none truncate">{v.year} {v.make}</h3>
                      <p className="text-[13px] font-bold text-slate-400 mt-1.5 truncate">{v.model}</p>
                      <div className="flex items-center gap-2.5 mt-2.5">
                         <span className="text-[10px] font-black px-2 py-0.5 bg-slate-50 text-slate-500 rounded uppercase tracking-tight">{v.plate}</span>
                         <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tight ${v.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{v.status}</span>
                      </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-slate-50">
                   <button className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-600 rounded-xl active:scale-95 transition-all">
                      <Activity size={16} />
                      <span className="text-[11px] font-bold uppercase tracking-widest">Diagnostic</span>
                   </button>
                   <button onClick={() => window.dispatchEvent(new CustomEvent('open-inspection'))} className="flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl shadow-lg active:scale-95 transition-all">
                      <CheckCircle2 size={16} className="text-green-400" />
                      <span className="text-[11px] font-bold uppercase tracking-widest">Safety HUD</span>
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Modal */}
      {isRegistering && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-white w-full rounded-t-[32px] rounded-b-2xl p-6 space-y-6 animate-in slide-in-from-bottom-10 duration-300">
             <div className="flex justify-between items-center">
                <div>
                   <h3 className="text-lg font-bold text-slate-900 uppercase">Unit Registration</h3>
                   <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest">Add New Fleet Asset</p>
                </div>
                <button onClick={() => setIsRegistering(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400"><X size={20}/></button>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" placeholder="Year" 
                  value={newVehicle.year} onChange={e => setNewVehicle({...newVehicle, year: e.target.value})}
                  className="p-3 bg-slate-50 border-none rounded-xl font-bold text-[12px] outline-none" 
                />
                <input 
                  type="text" placeholder="Make" 
                  value={newVehicle.make} onChange={e => setNewVehicle({...newVehicle, make: e.target.value})}
                  className="p-3 bg-slate-50 border-none rounded-xl font-bold text-[12px] outline-none" 
                />
                <input 
                  type="text" placeholder="Model" 
                  value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})}
                  className="p-3 bg-slate-50 border-none rounded-xl font-bold text-[12px] outline-none col-span-2" 
                />
                <input 
                  type="text" placeholder="License Plate" 
                  value={newVehicle.plate} onChange={e => setNewVehicle({...newVehicle, plate: e.target.value})}
                  className="p-3 bg-slate-50 border-none rounded-xl font-bold text-[12px] outline-none" 
                />
                <select 
                  value={newVehicle.type} onChange={e => setNewVehicle({...newVehicle, type: e.target.value})}
                  className="p-3 bg-slate-50 border-none rounded-xl font-bold text-[12px] outline-none"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Wheelchair Van">Wheelchair Van</option>
                  <option value="Full-size Van">Full-size Van</option>
                </select>
                <input 
                  type="text" placeholder="VIN Number" 
                  value={newVehicle.vin} onChange={e => setNewVehicle({...newVehicle, vin: e.target.value})}
                  className="p-3 bg-slate-50 border-none rounded-xl font-bold text-[12px] outline-none col-span-2" 
                />
             </div>

             <button 
                onClick={() => {
                  const id = 'v' + (vehicles.length + 1);
                  setVehicles([...vehicles, { ...newVehicle, id, isPrimary: false, status: 'pending', complianceHealth: 50 } as any]);
                  setIsRegistering(false);
                  setNewVehicle({ year: '', make: '', model: '', plate: '', vin: '', type: 'Sedan', insuranceFront: '', insuranceBack: '', registration: '' });
                }}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-xl active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
             >
                <Save size={18} />
                <span>Save Asset</span>
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagementScreen;

