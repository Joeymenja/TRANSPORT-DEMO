
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Receipt, 
  Fuel, 
  Wrench, 
  CreditCard, 
  Camera, 
  Loader2, 
  Sparkles, 
  Calendar,
  X,
  Save,
  DollarSign
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import PhotoUploader from '../components/PhotoUploader';
import { offlineQueue } from '../services/OfflineQueue';

interface Expense {
  id: string;
  type: 'fuel' | 'maintenance' | 'toll' | 'other';
  merchant: string;
  amount: number;
  date: string;
  status: 'approved' | 'pending' | 'flagged';
  details?: string;
  gallons?: number;
}

interface ExpenseLogScreenProps {
  onBack: () => void;
}

const ExpenseLogScreen: React.FC<ExpenseLogScreenProps> = ({ onBack }) => {
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', type: 'fuel', merchant: 'Shell Phoenix', amount: 48.20, date: 'Today', status: 'approved', gallons: 12.4 },
    { id: '2', type: 'maintenance', merchant: 'Valvoline', amount: 89.99, date: 'Yesterday', status: 'approved', details: 'Oil Change' },
    { id: '3', type: 'toll', merchant: 'AZ-101 Toll', amount: 4.50, date: 'Jan 4', status: 'pending' }
  ]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'fuel' | 'maintenance'>('all');

  const [form, setForm] = useState({
    type: 'fuel' as any,
    merchant: '',
    amount: '',
    gallons: '',
    date: new Date().toISOString().split('T')[0],
    receiptPhoto: null as string | null
  });

  const handleReceiptScan = async (photo: string) => {
    setForm(prev => ({ ...prev, receiptPhoto: photo }));
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { inlineData: { mimeType: 'image/jpeg', data: photo.split(',')[1] } },
          { text: "Analyze this receipt. Extract Merchant and Amount. JSON: {merchant, amount}" }
        ],
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || '{}');
      setForm(prev => ({ ...prev, merchant: data.merchant || '', amount: data.amount?.toString() || '' }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    const newExp: Expense = {
      id: Date.now().toString(),
      type: form.type,
      merchant: form.merchant,
      amount: parseFloat(form.amount) || 0,
      date: 'Today',
      status: 'pending'
    };
    offlineQueue.enqueue('STATUS_UPDATE', { type: 'EXPENSE_LOG', payload: newExp });
    setExpenses([newExp, ...expenses]);
    setIsAdding(false);
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="fixed inset-0 z-[75] bg-slate-50 flex flex-col max-w-md mx-auto h-screen font-sans">
      <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-1 text-slate-400 active:scale-90"><ArrowLeft size={24}/></button>
          <h2 className="text-[14px] font-bold text-slate-900 uppercase">Expense Ledger</h2>
        </div>
        <button onClick={() => setIsAdding(true)} className="p-2 bg-teal-50 text-teal-500 rounded-lg shadow-sm"><Plus size={20}/></button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6 pb-24">
        {/* Weekly Expenditures - Smaller HERO */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <CreditCard size={80} />
           </div>
           <div className="relative z-10 space-y-4">
              <div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-1">Weekly Expenditures</p>
                 <h3 className="text-4xl font-black leading-none">${totalSpent.toFixed(2)}</h3>
              </div>
              <div className="flex gap-3">
                 <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">
                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">MPG Average</p>
                    <p className="text-[12px] font-bold text-green-400">18.2 MPG</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
           {['all', 'fuel', 'maintenance', 'toll'].map(f => (
              <button key={f} onClick={() => setActiveFilter(f as any)} className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest whitespace-nowrap border ${activeFilter === f ? 'bg-teal-500 text-white border-teal-500 shadow-md' : 'bg-white text-slate-500 border-slate-100'}`}> {f} </button>
           ))}
        </div>

        <div className="space-y-3">
           <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Transaction History</h3>
           {expenses.filter(e => activeFilter === 'all' || e.type === activeFilter).map((exp) => (
              <div key={exp.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all">
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${exp.type === 'fuel' ? 'bg-teal-50 text-teal-500' : 'bg-slate-50 text-slate-400'}`}>
                       {exp.type === 'fuel' ? <Fuel size={16} /> : <Receipt size={16} />}
                    </div>
                    <div>
                       <h4 className="text-[13px] font-bold text-slate-900 truncate max-w-[150px] leading-none">{exp.merchant}</h4>
                       <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{exp.date} • {exp.status}</p>
                    </div>
                 </div>
                 <p className="text-[14px] font-bold text-slate-900">${exp.amount.toFixed(2)}</p>
              </div>
           ))}
        </div>
      </div>

      {isAdding && (
         <div className="fixed inset-0 z-[100] bg-white flex flex-col p-5 animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-3">
                  <button onClick={() => setIsAdding(false)} className="p-1 -ml-1 text-slate-400"><X size={24}/></button>
                  <h2 className="text-[14px] font-bold text-slate-900 uppercase">Log Expense</h2>
               </div>
               <button onClick={handleSave} className="bg-teal-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-md">Save</button>
            </div>
            <div className="space-y-4">
               <PhotoUploader label="Scan Receipt" onImageSelect={handleReceiptScan} />
               {isAnalyzing && (
                  <div className="p-3 bg-teal-50 rounded-xl flex items-center justify-center gap-2 animate-pulse">
                     <Loader2 className="animate-spin text-teal-500" size={14} />
                     <span className="text-[10px] font-bold text-sky-700 uppercase tracking-widest">Extracting...</span>
                  </div>
               )}
               <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                  <div className="space-y-1">
                     <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Merchant</label>
                     <input type="text" value={form.merchant} onChange={(e) => setForm({...form, merchant: e.target.value})} className="w-full p-3 bg-white rounded-lg font-bold text-[13px] border border-slate-200" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Amount</label>
                     <input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className="w-full p-3 bg-white rounded-lg font-bold text-[13px] border border-slate-200" />
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default ExpenseLogScreen;
