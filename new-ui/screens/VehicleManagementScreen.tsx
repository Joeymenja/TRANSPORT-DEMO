
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
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<{ risk: string; advice: string; priority: string } | null>(null);
  const [isDecodingVin, setIsDecodingVin] = useState(false);
  
  // Registration State
  const [isRegistering, setIsRegistering] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    year: '', make: '', model: '', plate: '', vin: '', type: 'Sedan',
    insuranceFront: '', insuranceBack: '', registration: ''
  });

  const decodeVin = async () => {
    if (!newVehicle.vin || newVehicle.vin.length < 11) return;
    setIsDecodingVin(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Decode this vehicle VIN: "${newVehicle.vin}". Return JSON: {year: string, make: string, model: string, type: string}`,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || '{}');
      setNewVehicle(prev => ({
        ...prev,
        year: data.year || '',
        make: data.make || '',
        model: data.model || '',
        type: data.type || 'Sedan'
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsDecodingVin(false);
    }
  };

  const handleAddVehicle = () => {
    if (!newVehicle.make || !newVehicle.plate) return;
    const v: Vehicle = {
      id: `v${Date.now()}`,
      year: newVehicle.year || '2024',
      make: newVehicle.make,
      model: newVehicle.model || 'Model',
      plate: newVehicle.plate,
      type: newVehicle.type,
      isPrimary: vehicles.length === 0,
      status: 'pending',
      complianceHealth: 100
    };
    setVehicles([...vehicles, v]);
    setIsRegistering(false);
    setNewVehicle({ year: '', make: '', model: '', plate: '', vin: '', type: 'Sedan', insuranceFront: '', insuranceBack: '', registration: '' });
  };

  return (
    <div className="fixed inset-0 z-[55] bg-gray-50 flex flex-col max-w-md mx-auto h-screen">
      <div className="bg-white px-6 py-6 flex items-center justify-between border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-2 text-gray-400 hover:text-gray-900 transition-colors"><ArrowLeft size={28}/></button>
          <h2 className="text-xl font-black text-gray-900">Fleet Management</h2>
        </div>
        <button onClick={() => setIsRegistering(true)} className="p-2 bg-sky-50 text-sky-500 rounded-xl active:scale-90 transition-transform"><Plus size={24}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32">
        <div className="p-5 bg-sky-50 rounded-[28px] border border-sky-100 flex items-start gap-4">
           <div className="p-2 bg-white rounded-xl shadow-sm"><ShieldCheck size={20} className="text-sky-500" /></div>
           <p className="text-[11px] text-sky-800 font-medium leading-relaxed">Multi-point safety inspection required every 3,000 miles for AHCCCS compliance.</p>
        </div>

        <div className="space-y-4">
          {vehicles.map((v) => (
            <div key={v.id} className={`bg-white rounded-[40px] border transition-all overflow-hidden ${v.isPrimary ? 'border-sky-500 shadow-xl shadow-sky-100/50' : 'border-gray-100 shadow-sm'}`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border-2 ${v.isPrimary ? 'bg-sky-500 text-white border-sky-400' : 'bg-gray-50 text-gray-400 border-gray-100'}`}><Car size={32} /></div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 leading-tight">{v.year} {v.make} {v.model}</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase mt-1">{v.plate} • {v.type}</p>
                    </div>
                  </div>
                  {v.isPrimary && <div className="bg-sky-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-sky-100">Primary</div>}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-6 pt-6 border-t border-gray-50">
                   <button onClick={() => setShowDiagnostics(true)} className="flex items-center justify-center gap-2 p-2 bg-sky-50 text-sky-600 rounded-xl"><Activity size={14} /><span className="text-[9px] font-black uppercase">AI Diagnostic</span></button>
                   <button onClick={() => window.dispatchEvent(new CustomEvent('open-inspection'))} className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded-xl"><CheckCircle2 size={14} className="text-green-500" /><span className="text-[9px] font-black uppercase">Safety Insp.</span></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isRegistering && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
           <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <button onClick={() => setIsRegistering(false)} className="p-1 -ml-2 text-gray-400"><X size={28}/></button>
                 <h2 className="text-xl font-black text-gray-900">Register Vehicle</h2>
              </div>
              <button onClick={handleAddVehicle} className="bg-sky-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg">Save</button>
           </div>
           <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
              <div className="space-y-4">
                 <div className="relative">
                    <input type="text" placeholder="VIN (17 Chars)" value={newVehicle.vin} onChange={e => setNewVehicle({...newVehicle, vin: e.target.value.toUpperCase()})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] font-bold text-gray-800 pr-24" />
                    <button onClick={decodeVin} disabled={isDecodingVin || newVehicle.vin.length < 11} className="absolute right-2 top-2 bottom-2 bg-sky-50 text-sky-600 px-3 rounded-xl text-[9px] font-black uppercase flex items-center gap-1.5 active:scale-95 disabled:opacity-30">
                       {isDecodingVin ? <Loader2 className="animate-spin" size={12}/> : <Sparkles size={12}/>} Decode
                    </button>
                 </div>
                 <div className="flex gap-4">
                    <input type="text" placeholder="Year" value={newVehicle.year} onChange={e => setNewVehicle({...newVehicle, year: e.target.value})} className="w-1/3 p-4 bg-gray-50 border border-gray-100 rounded-[20px] font-bold" />
                    <input type="text" placeholder="Make" value={newVehicle.make} onChange={e => setNewVehicle({...newVehicle, make: e.target.value})} className="w-2/3 p-4 bg-gray-50 border border-gray-100 rounded-[20px] font-bold" />
                 </div>
                 <input type="text" placeholder="Model" value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] font-bold" />
                 <input type="text" placeholder="License Plate" value={newVehicle.plate} onChange={e => setNewVehicle({...newVehicle, plate: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] font-bold uppercase" />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagementScreen;
