import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import ExpenseForm from '../components/ExpenseForm';
import { UserPlus, Check, X, Users as UsersIcon } from 'lucide-react';

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

  const availableUsers = allUsers.filter(u => !members.some(m => m.id === u.id));

  return (
    /* Increased max-width to 7xl and padding to 8 */
    <div className="w-full max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-10 font-sans">
      
      {/* Sidebar: increased padding and text sizes */}
      <div className="lg:col-span-4 space-y-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-black mb-5 uppercase text-slate-700 flex items-center gap-3">
            <UserPlus size={18} className="text-emerald-500" /> Add Member
          </h2>
          <form onSubmit={async (e) => { 
            e.preventDefault(); 
            await api.post(`/groups/${id}/users`, { userId: parseInt(selectedUserId) }); 
            fetchDetails(); 
          }} className="space-y-4">
            <select className="w-full bg-slate-50 p-4 rounded-xl outline-none font-bold text-xs" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
              <option value="">Select User</option>
              {availableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-800 transition-colors">
              Join Group
            </button>
          </form>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-50 shadow-sm">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-3">
            <UsersIcon size={16} /> Members in this Split
          </h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {members.map(m => (
              <div key={m.id} className="flex flex-col border-b border-slate-50 pb-3 last:border-0 hover:translate-x-1 transition-transform">
                <span className="font-black text-slate-800 text-sm uppercase tracking-tight">{m.name}</span>
                <span className="text-[10px] text-gray-400 font-bold italic lowercase">{m.email}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content: Increased headers and card sizes */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex justify-between items-center bg-white px-8 py-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-black uppercase text-slate-800 tracking-tighter">
              {currentGroup?.name}
            </h1>
            <span className="bg-emerald-50 text-emerald-600 text-[11px] px-4 py-2 rounded-lg font-black uppercase tracking-widest shadow-sm">
              {currentGroup?.mode || 'PAIRWISE'}
            </span>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-emerald-600 transition-all active:scale-95">
            Split Bill
          </button>
        </div>

        <div className="grid gap-4">
          {balances.map((b, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-orange-500 flex justify-between items-center transition-all hover:shadow-md">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">
                  {getName(b.from)} <span className="text-slate-200 lowercase italic">owes</span> {getName(b.to)}
                </p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
                  ₹{(b.amount / 100).toFixed(2)}
                </p>
              </div>
              <div>
                {confirming === i ? (
                  <div className="flex gap-2 animate-in zoom-in-95">
                    <button onClick={async () => { 
                      await api.post(`/groups/${id}/settle`, { payerId: b.from, payeeId: b.to, amount: b.amount }); 
                      setConfirming(null); 
                      fetchDetails(); 
                    }} className="bg-emerald-500 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase shadow-sm hover:bg-emerald-600">
                      Confirm
                    </button>
                    <button onClick={() => setConfirming(null)} className="bg-slate-100 p-3 rounded-xl text-slate-400 hover:bg-slate-200">
                      <X size={18}/>
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirming(i)} className="bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all">
                    Settle
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {balances.length === 0 && (
            <div className="py-32 text-center font-black text-slate-200 uppercase tracking-[0.5em] border-4 border-dashed border-slate-100 rounded-[3rem] text-xl">
              Settled Up
            </div>
          )}
        </div>
      </div>
      
      {showModal && (
        <ExpenseForm 
          groupId={id} 
          members={members} 
          onClose={() => setShowModal(false)} 
          onRefresh={fetchDetails} 
        />
      )}
    </div>
  );
}