import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import ExpenseForm from '../components/ExpenseForm';
import { UserPlus, Plus, History, Check, X, Users as UsersIcon, Receipt } from 'lucide-react';

export default function GroupDetails() {
  const { id } = useParams(); // Successfully captures the :id from App.jsx
  const [members, setMembers] = useState([]);
  const [balances, setBalances] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [confirming, setConfirming] = useState(null);

  const getName = (userId) => {
    const user = allUsers.find(u => u.id === userId);
    return user ? user.name : `User ${userId}`;
  };

  const fetchDetails = async () => {
    try {
      // Fetches group data using your backend endpoints
      const [mRes, bRes, uRes] = await Promise.all([
        api.get(`/groups/${id}/members`),
        api.get(`/groups/${id}/balances`),
        api.get('/users')
      ]);
      setMembers(mRes.data);
      setBalances(bRes.data.balances || []);
      setAllUsers(uRes.data);
    } catch (err) {
      console.error("Group Data Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleSettle = async (b) => {
    try {
      // Posts to your settlement endpoint to update finance.db [cite: 22, 23]
      await api.post(`/groups/${id}/settle`, { 
        payerId: b.from, 
        payeeId: b.to, 
        amount: b.amount 
      });
      setConfirming(null);
      fetchDetails(); 
    } catch (err) {
      alert("Settlement failed.");
    }
  };

  // Filters dropdown to show only users not already in this specific group
  const availableUsers = allUsers.filter(u => !members.some(m => m.id === u.id));

  return (
    <div className="w-full max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-black mb-4 uppercase text-slate-700 flex items-center gap-2">
            <UserPlus size={18} className="text-emerald-500" /> Add Member
          </h2>
          <form onSubmit={async (e) => { 
            e.preventDefault(); 
            if(!selectedUserId) return; 
            await api.post(`/groups/${id}/users`, { userId: parseInt(selectedUserId) }); 
            setSelectedUserId(''); 
            fetchDetails(); 
          }} className="space-y-3">
            <select 
              className="w-full bg-gray-50 p-3 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-emerald-400" 
              value={selectedUserId} 
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">Select Registered User</option>
              {availableUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">
              Join Group
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <UsersIcon size={14} /> Members
          </h3>
          <div className="space-y-2">
            {members.map(m => (
              <div key={m.id} className="font-bold text-slate-800 border-b border-gray-50 py-2 text-sm uppercase">
                {m.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black uppercase text-slate-800 flex items-center gap-2">
            <History className="text-emerald-500" /> Group Balances
          </h1>
          <button 
            onClick={() => setShowExpenseModal(true)} 
            className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black shadow-lg text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Plus size={16} strokeWidth={3} /> Split Bill
          </button>
        </div>

        <div className="grid gap-3">
          {balances.length > 0 ? balances.map((b, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-500 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                  {getName(b.from)} owes {getName(b.to)}
                </p>
                <p className="text-2xl font-black text-slate-900 leading-tight">
                  ₹{(b.amount / 100).toFixed(2)}
                </p>
              </div>

              <div>
                {confirming === i ? (
                  <div className="flex gap-1">
                    <button onClick={() => handleSettle(b)} className="bg-emerald-500 text-white px-3 py-2 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 shadow-md">
                      <Check size={12}/> Confirm
                    </button>
                    <button onClick={() => setConfirming(null)} className="bg-gray-100 text-gray-400 p-2 rounded-lg hover:bg-gray-200">
                      <X size={12}/>
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirming(i)} className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg font-black text-[10px] uppercase border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                    Settle
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div className="py-20 text-center font-black text-gray-200 uppercase tracking-widest border-2 border-dashed border-gray-100 rounded-3xl">
              <Receipt className="mx-auto mb-2 opacity-20" size={48} />
              All Settled
            </div>
          )}
        </div>
      </div>

      {showExpenseModal && (
        <ExpenseForm 
          groupId={id} 
          members={members} 
          onClose={() => setShowExpenseModal(false)} 
          onRefresh={fetchDetails} 
        />
      )}
    </div>
  );
}