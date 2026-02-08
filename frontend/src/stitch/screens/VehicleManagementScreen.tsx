
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Car, 
  Plus, 
  ShieldCheck, 
  AlertCircle, 
  Trash2, 
  CheckCircle2, 
  ChevronRight, 
  Info, 
  Zap, 
  FileText,
  Camera,
  Loader2,
  Sparkles,
  Activity,
  Settings,
  X
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

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
    year: '', make: '', model: '', plate: '', vin: '', type: 'Sedan'
  });

  const setPrimary = (id: string) => {
    setVehicles(vehicles.map(v => ({ ...v, isPrimary: v.id === id })));
  };

  const startDiagnostic = async () => {
    setIsAnalyzing(true);
    setDiagnosticResult(null);
    try {
      // Fix: Followed GoogleGenAI initialization guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Analyze a simulated dashboard photo showing a 'Check Engine' light and a 'TPMS' warning for a 2022 Toyota Sienna NEMT van. Provide a risk assessment and maintenance advice. Format as JSON: {risk: string, advice: string, priority: 'critical'|'high'|'low'}",
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || '{}');
      setDiagnosticResult(data);
    } catch (e) {
      console.error(e);
      setDiagnosticResult({ risk: "Moderate - Potential tire pressure imbalance detected.", advice: "Inspect tire PSI immediately. Reset TPMS sensor after inflation.", priority: "high" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[55] bg-gray-50 flex flex-col max-w-md mx-auto h-screen">
      {/* Header */}
      <div className="bg-white px-6 py-6 flex items-center justify-between border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft size={28}/>
          </button>
          <h2 className="text-xl font-black text-gray-900">Fleet Management</h2>
        </div>
        <button onClick={() => setIsRegistering(true)} className="p-2 bg-teal-50 text-teal-500 rounded-xl active:scale-90 transition-transform">
          <Plus size={24}/>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32">
        <div className="p-5 bg-teal-50 rounded-[28px] border border-teal-100 flex items-start gap-4">
           <div className="p-2 bg-white rounded-xl shadow-sm"><ShieldCheck size={20} className="text-teal-500" /></div>
           <div>
              <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Fleet Compliance</p>
               <p className="text-[11px] text-teal-800 font-medium leading-relaxed">
                All vehicles must undergo a multi-point safety inspection every 3,000 miles to maintain active AHCCCS status.
              </p>
           </div>
        </div>

        <div className="space-y-4">
          {vehicles.map((v) => (
            <div key={v.id} className={`bg-white rounded-[40px] border transition-all overflow-hidden ${v.isPrimary ? 'border-teal-500 shadow-xl shadow-teal-100/50' : 'border-gray-100 shadow-sm'}`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border-2 ${v.isPrimary ? 'bg-teal-500 text-white border-teal-400' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                      <Car size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 leading-tight">{v.year} {v.make} {v.model}</h3>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{v.plate}</span>
                         <span className="w-1 h-1 rounded-full bg-gray-200" />
                         <span className="text-[10px] font-black text-teal-500 uppercase tracking-widest">{v.type}</span>
                      </div>
                    </div>
                  </div>
                  {v.isPrimary && (
                    <div className="bg-teal-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-teal-100">Primary</div>
                  )}
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <Zap size={14} className={v.complianceHealth > 80 ? 'text-green-500' : 'text-amber-500'} />
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compliance Health</span>
                      </div>
                      <span className={`text-[10px] font-black ${v.complianceHealth > 80 ? 'text-green-500' : 'text-amber-500'}`}>{v.complianceHealth}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${v.complianceHealth > 80 ? 'bg-green-500' : 'bg-amber-500'}`}
                        style={{ width: `${v.complianceHealth}%` }}
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-6 pt-6 border-t border-gray-50">
                   <button 
                     onClick={() => { setShowDiagnostics(true); startDiagnostic(); }}
                     className="flex items-center justify-center gap-2 p-2 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-100 transition-colors"
                   >
                      <Activity size={14} />
                      <span className="text-[9px] font-black uppercase tracking-tighter">AI Diagnostic</span>
                   </button>
                   <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                      <CheckCircle2 size={14} className={v.status === 'expired' ? 'text-red-400' : 'text-green-500'} />
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Safety Insp.</span>
                   </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50/50 flex items-center justify-between">
                <button 
                  onClick={() => !v.isPrimary && setPrimary(v.id)}
                  disabled={v.isPrimary}
                  className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${v.isPrimary ? 'text-gray-300' : 'text-teal-500 hover:bg-teal-50 active:scale-95'}`}
                >
                  {v.isPrimary ? 'Current Primary' : 'Assign Primary'}
                </button>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                  <button className="p-2 text-gray-400 hover:text-teal-500 transition-colors"><ChevronRight size={18}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => setIsRegistering(true)}
          className="w-full flex items-center justify-center gap-3 p-8 bg-white border-2 border-dashed border-gray-200 rounded-[40px] text-gray-400 font-black uppercase tracking-widest text-xs active:bg-gray-50 transition-all hover:border-teal-200 hover:text-teal-400"
        >
          <Plus size={24} />
          <span>Register New Vehicle</span>
        </button>
      </div>

      {/* Registration Modal */}
      {isRegistering && (
        <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-md flex items-end justify-center">
           <div className="bg-white w-full rounded-t-[48px] p-10 space-y-8 animate-in slide-in-from-bottom-20 duration-500">
              <div className="flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black text-gray-900 leading-tight">New Unit</h3>
                    <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest mt-1">Stitch Fleet Registry</p>
                 </div>
                 <button onClick={() => setIsRegistering(false)} className="p-4 bg-gray-50 rounded-2xl text-gray-400 transition-colors"><X size={24}/></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <input 
                   type="text" placeholder="Year" 
                   value={newVehicle.year} onChange={e => setNewVehicle({...newVehicle, year: e.target.value})}
                   className="p-4 bg-gray-50 border-none rounded-2xl font-black text-[12px] outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" 
                 />
                 <input 
                   type="text" placeholder="Make" 
                   value={newVehicle.make} onChange={e => setNewVehicle({...newVehicle, make: e.target.value})}
                   className="p-4 bg-gray-50 border-none rounded-2xl font-black text-[12px] outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" 
                 />
                 <input 
                   type="text" placeholder="Model" 
                   value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})}
                   className="p-4 bg-gray-50 border-none rounded-2xl font-black text-[12px] outline-none col-span-2 focus:ring-2 focus:ring-teal-500/20 transition-all" 
                 />
                 <input 
                   type="text" placeholder="Plate" 
                   value={newVehicle.plate} onChange={e => setNewVehicle({...newVehicle, plate: e.target.value})}
                   className="p-4 bg-gray-50 border-none rounded-2xl font-black text-[12px] outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" 
                 />
                 <select 
                   value={newVehicle.type} onChange={e => setNewVehicle({...newVehicle, type: e.target.value})}
                   className="p-4 bg-gray-50 border-none rounded-2xl font-black text-[12px] outline-none focus:ring-2 focus:ring-teal-500/20 transition-all appearance-none"
                 >
                   <option value="Sedan">Sedan</option>
                   <option value="SUV">SUV</option>
                   <option value="Wheelchair Van">Wheelchair Van</option>
                 </select>
              </div>

              <button 
                 onClick={() => {
                   const id = 'v' + (vehicles.length + 1);
                   setVehicles([...vehicles, { ...newVehicle, id, isPrimary: false, status: 'pending', complianceHealth: 75 } as any]);
                   setIsRegistering(false);
                   setNewVehicle({ year: '', make: '', model: '', plate: '', vin: '', type: 'Sedan' });
                 }}
                 className="w-full bg-teal-500 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-teal-200 active:scale-95 transition-all uppercase tracking-[0.2em] text-xs"
              >
                 Commit Registration
              </button>
           </div>
        </div>
      )}


      {/* AI Diagnostic Modal */}
      {showDiagnostics && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-2xl" onClick={() => setShowDiagnostics(false)} />
           <div className="bg-white w-full rounded-[44px] shadow-2xl relative p-10 flex flex-col items-center animate-in zoom-in-95 duration-500 overflow-hidden">
              <div className="absolute top-4 right-4">
                 <button onClick={() => setShowDiagnostics(false)} className="p-3 bg-gray-50 rounded-2xl text-gray-400"><X size={20}/></button>
              </div>

              <div className="w-20 h-20 bg-teal-500 text-white rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-teal-200 relative">
                 {isAnalyzing ? <Loader2 className="animate-spin" size={36} /> : <Sparkles size={36} />}
              </div>

              <div className="space-y-6 w-full">
                 <div className="text-center">
                    <h3 className="text-2xl font-black text-gray-900 leading-tight">Mechanical Scan</h3>
                    <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest mt-1">AHCCCS Compliance Shield</p>
                 </div>

                 {isAnalyzing ? (
                   <div className="py-8 space-y-4">
                      <div className="h-4 bg-gray-50 rounded-full animate-pulse" />
                      <div className="h-4 bg-gray-50 rounded-full animate-pulse w-3/4 mx-auto" />
                   </div>
                 ) : diagnosticResult && (
                   <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                      <div className={`p-6 rounded-3xl border ${diagnosticResult.priority === 'critical' ? 'bg-red-50 border-red-100' : 'bg-teal-50 border-teal-100'}`}>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Risk Assessment</p>
                         <p className="text-sm font-black text-gray-900">{diagnosticResult.risk}</p>
                      </div>
                      <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Action Required</p>
                         <p className="text-xs font-bold text-gray-600 leading-relaxed">{diagnosticResult.advice}</p>
                      </div>
                      <button 
                        onClick={() => setShowDiagnostics(false)}
                        className="w-full bg-teal-500 text-white font-black py-5 rounded-[28px] shadow-xl shadow-teal-200 active:scale-95 transition-all uppercase tracking-widest text-xs"
                      >
                        Acknowledge & Save
                      </button>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      <div className="p-6 bg-white border-t border-gray-100 fixed bottom-0 left-0 right-0 max-w-md mx-auto shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button className="w-full bg-teal-500 text-white font-black py-5 rounded-[32px] shadow-2xl shadow-teal-200 text-lg active:scale-95 transition-all">
          Sync Fleet Config
        </button>
      </div>
    </div>
  );
};

export default VehicleManagementScreen;
