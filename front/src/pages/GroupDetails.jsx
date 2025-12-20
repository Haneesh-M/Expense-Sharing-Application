// src/pages/GroupDetails.jsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import ExpenseForm from '../components/ExpenseForm';
import { UserPlus, Plus, History, Check, X, Users as UsersIcon } from 'lucide-react';

export default function GroupDetails() {
  const { id } = useParams();
  const [members, setMembers] = useState([]);
  const [balances, setBalances] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [confirming, setConfirming] = useState(null);

  const getName = (uid) => allUsers.find(u => u.id === uid)?.name || `User ${uid}`;

  const fetchDetails = async () => {
    try {
      const gRes = await api.get('/groups');
      const groupObj = gRes.data.find(g => g.id === parseInt(id));
      setCurrentGroup(groupObj);
      const mode = groupObj?.mode || 'PAIRWISE';

      const [mRes, bRes, uRes] = await Promise.all([
        api.get(`/groups/${id}/members`),
        api.get(`/groups/${id}/balances?mode=${mode}`),
        api.get('/users')
      ]);
      setMembers(mRes.data);
      setBalances(bRes.data.balances || []);
      setAllUsers(uRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchDetails(); }, [id]);

  const handleSettle = async (b) => {
    await api.post(`/groups/${id}/settle`, { payerId: b.from, payeeId: b.to, amount: b.amount });
    setConfirming(null);
    fetchDetails();
  };

  const availableUsers = allUsers.filter(u => !members.some(m => m.id === u.id));

  return (
    <div className="w-full max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      {/* Left Column (Forms & Members) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-[1.5rem] shadow-md border border-slate-50">
          <h2 className="text-base font-black mb-4 uppercase text-slate-700 flex items-center gap-3">
            <UserPlus size={20} className="text-emerald-500" /> Add Member
          </h2>
          <form onSubmit={async (e) => { e.preventDefault(); await api.post(`/groups/${id}/users`, { userId: parseInt(selectedUserId) }); fetchDetails(); }} className="space-y-4">
            <select className="w-full bg-slate-50 p-3 rounded-xl outline-none font-bold text-sm border-2 border-transparent focus:border-emerald-500" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
              <option value="">Select Registered User</option>
              {availableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest">Join Group</button>
          </form>
        </div>

        {/* Compact Members List */}
        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-50 shadow-sm">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <UsersIcon size={16} /> Members in this Split
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {members.map(m => (
              <div key={m.id} className="flex flex-col border-b border-slate-50 pb-2 last:border-0 hover:translate-x-1 transition-transform">
                <span className="font-black text-slate-800 text-sm uppercase">{m.name}</span>
                <span className="text-[10px] text-gray-400 font-bold italic lowercase">{m.email}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column (Settlements) */}
      <div className="lg:col-span-8 space-y-6">
        {/* Adjusted Mode Bar */}
        <div className="flex justify-between items-center bg-white px-8 py-4 rounded-[1.5rem] shadow-md border border-slate-100">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black uppercase text-slate-800 tracking-tight">
              {currentGroup?.name}
            </h1>
            <span className="bg-emerald-50 text-emerald-600 text-[9px] px-3 py-1 rounded-lg font-black uppercase tracking-widest border border-emerald-100">
              {currentGroup?.mode || 'PAIRWISE'}
            </span>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md">
            Split Bill
          </button>
        </div>

        {/* Scaled Settlement Blocks */}
        <div className="grid gap-4">
          {balances.map((b, i) => (
            <div key={i} className="bg-white p-6 rounded-[1.5rem] shadow-sm border-l-[10px] border-orange-500 flex justify-between items-center transition-all animate-in slide-in-from-left-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {getName(b.from)} <span className="text-slate-200 lowercase italic tracking-normal mx-1">owes</span> {getName(b.to)}
                </p>
                <p className="text-3xl font-black text-slate-900 tracking-tight leading-none">₹{(b.amount / 100).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3">
                {confirming === i ? (
                  <div className="flex gap-2 animate-in zoom-in-95">
                    <button onClick={() => handleSettle(b)} className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase shadow-md flex items-center gap-1 hover:bg-emerald-600">Confirm</button>
                    <button onClick={() => setConfirming(null)} className="bg-slate-50 text-slate-300 p-2 rounded-lg hover:text-slate-500 transition-all"><X size={18}/></button>
                  </div>
                ) : (
                  <button onClick={() => setConfirming(i)} className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-black text-xs uppercase shadow-md hover:scale-105 active:scale-95 transition-all">
                    Settle
                  </button>
                )}
              </div>
            </div>
          ))}
          {balances.length === 0 && <div className="py-20 text-center font-black text-slate-200 uppercase tracking-[0.4em] border-4 border-dashed border-slate-50 rounded-[2.5rem] text-lg">All Settled Up</div>}
        </div>
      </div>
      {showModal && <ExpenseForm groupId={id} members={members} onClose={() => setShowModal(false)} onRefresh={fetchDetails} />}
    </div>
  );
}