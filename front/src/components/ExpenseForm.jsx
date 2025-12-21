import { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, CheckCircle2, Calculator, Receipt, DollarSign, Users, PieChart, Percent, Hash } from 'lucide-react';

export default function ExpenseForm({ groupId, members, onClose, onRefresh }) {
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [payerId, setPayerId] = useState('');
  const [splitType, setSplitType] = useState('EQUAL'); 
  const [splitDetails, setSplitDetails] = useState([]);

  useEffect(() => {
    setSplitDetails(members.map(m => ({ userId: m.id, name: m.name, value: 0 })));
  }, [members]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amountInPaise = Math.round(parseFloat(totalAmount) * 100);

    // Validation for Exact and Percentage splits
    if (splitType === 'EXACT') {
      const sum = splitDetails.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0) * 100, 0);
      if (Math.round(sum) !== amountInPaise) {
        return alert(`Validation Error: Sum of individual shares (₹${sum/100}) must match total (₹${totalAmount})`);
      }
    } else if (splitType === 'PERCENT') {
      const sum = splitDetails.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0);
      if (sum !== 100) return alert("Validation Error: Total percentage must equal exactly 100%");
    }

    const payload = {
      groupId: parseInt(groupId),
      payerId: parseInt(payerId),
      amount: amountInPaise,
      description,
      splitType,
      splitDetails: splitDetails.map(d => ({ 
        userId: d.userId, 
        value: splitType === 'EQUAL' ? 0 : parseFloat(d.value) 
      }))
    };

    try {
      await api.post('/expenses', payload);
      onRefresh();
      onClose();
    } catch (err) { 
      alert("Neural sync failed. Please check your inputs."); 
    }
  };

  const updateValue = (userId, val) => {
    setSplitDetails(prev => prev.map(d => d.userId === userId ? { ...d, value: val } : d));
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl flex items-center justify-center p-4 z-[300] animate-in fade-in duration-300">
      <div className="bg-[#0f172a] border border-white/10 rounded-[3rem] w-full max-w-xl shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden transform transition-all animate-in zoom-in-95">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12">
            <Receipt size={160} />
          </div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-200/60 mb-1">Transaction_Protocol</p>
              <h2 className="text-3xl font-black uppercase flex items-center gap-3 italic">
                <Calculator className="text-white" /> Create_Entry
              </h2>
            </div>
            <button 
              onClick={onClose} 
              className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Description Input */}
          <div className="space-y-2 group">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Label_Details</label>
            <div className="relative">
              <input 
                required 
                placeholder="What was this for?" 
                className="w-full bg-white/5 border-2 border-white/5 focus:border-emerald-500/50 p-5 rounded-[1.5rem] text-xl font-bold text-white outline-none transition-all placeholder:text-slate-600" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
              />
            </div>
          </div>
          
          {/* Amount and Payer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Total_Value (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl font-black text-white outline-none focus:border-emerald-500/50 transition-all" 
                  placeholder="0.00"
                  value={totalAmount} 
                  onChange={e => setTotalAmount(e.target.value)} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Origin_Payer</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                <select 
                  required 
                  className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl font-black text-white outline-none appearance-none cursor-pointer focus:border-blue-500/50 transition-all" 
                  value={payerId} 
                  onChange={e => setPayerId(e.target.value)}
                >
                  <option value="" className="bg-slate-900">Choose Payer</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id} className="bg-slate-900 italic font-sans">{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Split Strategy Selector */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-center block">Division_Strategy</label>
            <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 gap-1">
              {[
                { id: 'EQUAL', icon: <Users size={14}/> },
                { id: 'EXACT', icon: <Hash size={14}/> },
                { id: 'PERCENT', icon: <Percent size={14}/> }
              ].map(({ id, icon }) => (
                <button 
                  key={id} 
                  type="button" 
                  onClick={() => setSplitType(id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black transition-all ${
                    splitType === id 
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {icon} {id}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Split Inputs */}
          {splitType !== 'EQUAL' && (
            <div className="animate-in slide-in-from-top-4 duration-300 space-y-3 bg-white/[0.02] border border-white/5 p-6 rounded-[2rem]">
              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Member_Breakdown</p>
                 <PieChart size={16} className="text-emerald-500/50" />
              </div>
              {splitDetails.map((user) => (
                <div key={user.userId} className="flex justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all group">
                  <span className="font-bold text-slate-300 uppercase text-xs tracking-tight">{user.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-600 group-hover:text-emerald-500/50 transition-colors">
                      {splitType === 'PERCENT' ? 'PCT%' : 'VAL₹'}
                    </span>
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="0"
                      className="w-24 bg-white/5 border-b border-white/10 text-right font-black text-emerald-400 outline-none p-1 focus:border-emerald-500" 
                      onChange={e => updateValue(user.userId, e.target.value)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full bg-white hover:bg-emerald-500 hover:text-white text-slate-900 py-6 rounded-[2rem] font-black shadow-2xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
          >
            <CheckCircle2 size={24}/> Commit_Entry
          </button>
        </form>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.4); }
      `}</style>
    </div>
  );
}