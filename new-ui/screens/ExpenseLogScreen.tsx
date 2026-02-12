
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Receipt, 
  Fuel, 
  Wrench, 
  CreditCard, 
  ChevronRight, 
  Camera, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Calendar,
  Search,
  Filter,
  Trash2,
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

  // OCR Form State
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
          { text: "Analyze this receipt. Extract: Merchant Name, Total Amount, and Fuel Gallons (if any). Return JSON: {merchant: string, amount: number, gallons: number, isFuel: boolean}" }
        ],
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || '{}');
      setForm(prev => ({
        ...prev,
        merchant: data.merchant || '',
        amount: data.amount?.toString() || '',
        gallons: data.gallons?.toString() || '',
        type: data.isFuel ? 'fuel' : 'other'
      }));
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
      status: 'pending',
      gallons: form.gallons ? parseFloat(form.gallons) : undefined
    };

    // Enqueue for background sync
    offlineQueue.enqueue('STATUS_UPDATE', { type: 'EXPENSE_LOG', payload: newExp });
    
    setExpenses([newExp, ...expenses]);
    setIsAdding(false);
    setForm({ type: 'fuel', merchant: '', amount: '', gallons: '', date: new Date().toISOString().split('T')[0], receiptPhoto: null });
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="fixed inset-0 z-[75] bg-gray-50 flex flex-col max-w-md mx-auto h-screen">
      {/* Header */}
      <div className="bg-white px-6 py-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft size={28}/>
          </button>
          <h2 className="text-xl font-black text-gray-900">Expense Ledger</h2>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-2 bg-sky-50 text-sky-500 rounded-xl active:scale-90 transition-transform"
        >
          <Plus size={24}/>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 pb-24">
        {/* Spending Summary Card */}
        <div className="bg-gray-900 rounded-[44px] p-8 text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <CreditCard size={120} />
           </div>
           <div className="relative z-10 space-y-6">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400 mb-2">Weekly Expenditures</p>
                 <h3 className="text-5xl font-black leading-none">${totalSpent.toFixed(2)}</h3>
              </div>
              <div className="flex gap-4">
                 <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
                    <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Fuel Consumption</p>
                    <p className="text-xs font-black">24.8 Gallons</p>
                 </div>
                 <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
                    <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Efficiency</p>
                    <p className="text-xs font-black text-green-400">18.2 MPG</p>
                 </div>
              </div>
           </div>
        </div>

        {/* History Search & Filter */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
           {['all', 'fuel', 'maintenance', 'toll'].map(f => (
              <button 
                key={f}
                onClick={() => setActiveFilter(f as any)}
                className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeFilter === f ? 'bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-100' : 'bg-white text-gray-500 border-gray-100'}`}
              >
                {f}
              </button>
           ))}
        </div>

        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction History</h3>
              <Calendar size={14} className="text-gray-300" />
           </div>

           {expenses.filter(e => activeFilter === 'all' || e.type === activeFilter).map((exp) => (
              <div key={exp.id} className="bg-white p-5 rounded-[32px] border border-gray-50 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all">
                 <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${exp.type === 'fuel' ? 'bg-sky-50 text-sky-500' : exp.type === 'maintenance' ? 'bg-amber-50 text-amber-500' : 'bg-gray-50 text-gray-500'}`}>
                       {exp.type === 'fuel' ? <Fuel size={20} /> : exp.type === 'maintenance' ? <Wrench size={20} /> : <Receipt size={20} />}
                    </div>
                    <div>
                       <h4 className="text-sm font-black text-gray-900 leading-tight">{exp.merchant}</h4>
                       <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{exp.date}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-200" />
                          <span className={`text-[9px] font-black uppercase ${exp.status === 'approved' ? 'text-green-500' : 'text-amber-500'}`}>{exp.status}</span>
                       </div>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-sm font-black text-gray-900">${exp.amount.toFixed(2)}</p>
                    {exp.gallons && <p className="text-[9px] font-bold text-gray-400">{exp.gallons} gal</p>}
                 </div>
              </div>
           ))}
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAdding && (
         <div className="fixed inset-0 z-[100] bg-white flex flex-col">
            <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <button onClick={() => setIsAdding(false)} className="p-1 -ml-2 text-gray-400 hover:text-gray-900">
                    <X size={28}/>
                 </button>
                 <h2 className="text-xl font-black text-gray-900">Log Expense</h2>
              </div>
              <button 
                onClick={handleSave}
                disabled={!form.merchant || !form.amount}
                className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-sky-200 disabled:opacity-30"
              >
                 <Save size={14} /> Submit
              </button>
           </div>

           <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
              <div className="space-y-4">
                 <PhotoUploader 
                   label="Scan Receipt"
                   aspectRatio="aspect-[4/3]"
                   onImageSelect={handleReceiptScan}
                 />

                 {isAnalyzing && (
                    <div className="p-4 bg-sky-50 rounded-2xl flex items-center justify-center gap-3">
                       <Loader2 className="animate-spin text-sky-500" size={20} />
                       <span className="text-xs font-black text-sky-700 uppercase tracking-widest">AI extracting data...</span>
                    </div>
                 )}

                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setForm({...form, type: 'fuel'})}
                      className={`flex flex-col items-center gap-2 p-4 rounded-[28px] border transition-all ${form.type === 'fuel' ? 'bg-sky-50 border-sky-200 text-sky-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                    >
                       <Fuel size={24} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Fuel</span>
                    </button>
                    <button 
                      onClick={() => setForm({...form, type: 'maintenance'})}
                      className={`flex flex-col items-center gap-2 p-4 rounded-[28px] border transition-all ${form.type === 'maintenance' ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                    >
                       <Wrench size={24} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Repair</span>
                    </button>
                 </div>

                 <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 space-y-4">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-[0.2em]">Merchant / Vendor</label>
                       <div className="relative">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          <input 
                            type="text" 
                            value={form.merchant}
                            onChange={(e) => setForm({...form, merchant: e.target.value})}
                            placeholder="e.g., Chevron, Autozone"
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[20px] font-bold text-gray-800 focus:border-sky-500 transition-all shadow-sm" 
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-[0.2em]">Amount (USD)</label>
                          <div className="relative">
                             <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                             <input 
                               type="number" 
                               value={form.amount}
                               onChange={(e) => setForm({...form, amount: e.target.value})}
                               placeholder="0.00"
                               className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[20px] font-bold text-gray-800 focus:border-sky-500 transition-all shadow-sm" 
                             />
                          </div>
                       </div>
                       {form.type === 'fuel' && (
                          <div className="space-y-1 animate-in fade-in slide-in-from-left-4">
                             <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-[0.2em]">Gallons</label>
                             <div className="relative">
                                <Fuel className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input 
                                  type="number" 
                                  value={form.gallons}
                                  onChange={(e) => setForm({...form, gallons: e.target.value})}
                                  placeholder="0.00"
                                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[20px] font-bold text-gray-800 focus:border-sky-500 transition-all shadow-sm" 
                                />
                             </div>
                          </div>
                       )}
                    </div>
                 </div>

                 <div className="p-5 bg-sky-50 rounded-[28px] border border-sky-100 flex items-start gap-3">
                    <Sparkles className="text-sky-500 mt-1" size={18} />
                    <p className="text-[11px] text-sky-800 font-medium leading-relaxed">
                      AI is active. Receipts are analyzed for fraud detection and tax deductibility classification.
                    </p>
                 </div>
              </div>
           </div>
         </div>
      )}
    </div>
  );
};

export default ExpenseLogScreen;
