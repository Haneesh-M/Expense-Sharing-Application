import { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, CheckCircle2, Calculator } from 'lucide-react';

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
        return alert(`Total shares (₹${sum/100}) must equal total (₹${totalAmount})`);
      }
    } else if (splitType === 'PERCENT') {
      const sum = splitDetails.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0);
      if (sum !== 100) return alert("Total percentage must equal 100%");
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
    } catch (err) { alert("Error saving expense."); }
  };

  const updateValue = (userId, val) => {
    setSplitDetails(prev => prev.map(d => d.userId === userId ? { ...d, value: val } : d));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-black uppercase flex items-center gap-2">
            <Calculator className="text-emerald-400" /> New Expense
          </h2>
          <button onClick={onClose} className="hover:bg-slate-700 p-2 rounded-full"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[85vh] overflow-y-auto">
          <input required placeholder="Expense Description" className="w-full text-2xl font-bold border-b-2 border-gray-100 p-2 outline-none focus:border-emerald-500" 
            value={description} onChange={e => setDescription(e.target.value)} />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total (₹)</label>
              <input required type="number" step="0.01" className="w-full bg-gray-50 border-none p-4 rounded-2xl font-bold" 
                value={totalAmount} onChange={e => setTotalAmount(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Paid By</label>
              <select required className="w-full bg-gray-50 border-none p-4 rounded-2xl font-bold" value={payerId} onChange={e => setPayerId(e.target.value)}>
                <option value="">Select...</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex bg-gray-100 rounded-2xl p-1">
            {['EQUAL', 'EXACT', 'PERCENT'].map(type => (
              <button key={type} type="button" onClick={() => setSplitType(type)}
                className={`flex-1 py-3 rounded-xl text-xs font-black ${splitType === type ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}>
                {type}
              </button>
            ))}
          </div>

          {splitType !== 'EQUAL' && (
            <div className="space-y-3 bg-gray-50 p-4 rounded-2xl">
              {splitDetails.map((user) => (
                <div key={user.userId} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm">
                  <span className="font-bold text-slate-700">{user.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">{splitType === 'PERCENT' ? '%' : '₹'}</span>
                    <input type="number" step="0.01" className="w-20 text-right font-black text-emerald-600 outline-none" 
                      onChange={e => updateValue(user.userId, e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 transition-all uppercase tracking-widest">
            <CheckCircle2 size={24}/> Add Expense
          </button>
        </form>
      </div>
    </div>
  );
}   