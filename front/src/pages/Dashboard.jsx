import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Wallet, Clock, CheckCircle, TrendingUp, UserPlus, Users, ArrowRight, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [stats, setStats] = useState({ totalOwed: 0 });
  const navigate = useNavigate();

  const getName = (id) => allUsers.find(u => u.id === id)?.name || `User ${id}`;

  const fetchData = async () => {
    try {
      const [gRes, uRes] = await Promise.all([api.get('/groups'), api.get('/users')]);
      setGroups(gRes.data);
      setAllUsers(uRes.data);

      let total = 0;
      let allSets = [];
      for (const g of gRes.data) {
        const [balRes, setRes] = await Promise.all([
          api.get(`/groups/${g.id}/balances`),
          api.get(`/groups/${g.id}/settlements`).catch(() => ({data: []}))
        ]);
        balRes.data.balances?.forEach(b => total += b.amount);
        if (setRes.data) allSets = [...allSets, ...setRes.data];
      }
      setStats({ totalOwed: total });
      setSettlements(allSets.sort((a, b) => b.id - a.id).slice(0, 5));
    } catch (err) { console.error("Redirect/Data Error:", err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteGroup = async (groupId, groupName) => {
    try {
      const balRes = await api.get(`/groups/${groupId}/balances`);
      const activeBalances = balRes.data.balances || [];

      if (activeBalances.length > 0) {
        return alert(`Cannot delete "${groupName}": Some settlements are in due and must be settled first.`);
      }

      if (window.confirm(`All settlements are done. Do you want to delete "${groupName}"?`)) {
        await api.delete(`/groups/${groupId}`);
        fetchData();
      }
    } catch (err) { alert("Delete failed. Check backend connectivity."); }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    await api.post('/groups', { name: newGroupName });
    setNewGroupName('');
    fetchData();
  };

  return (
    <div className="w-full p-8 space-y-10 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-emerald-500">
          <div className="flex justify-between items-center text-emerald-600 mb-2 font-black uppercase text-[10px] tracking-widest">
            <span>Net Receivable</span>
            <TrendingUp size={16} />
          </div>
          <p className="text-3xl font-black text-slate-900">₹{(stats.totalOwed / 100).toFixed(2)}</p>
        </div>
        <button onClick={() => navigate('/users')} className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all group">
          <UserPlus size={24} className="group-hover:scale-110 transition-transform" />
          <span className="font-black uppercase tracking-widest text-sm text-center">Register New User</span>
        </button>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-blue-500 flex items-center justify-center text-slate-400 font-black uppercase text-[10px] tracking-widest text-center">Global Overview</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h2 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-2 text-slate-700"><Users className="text-blue-500" size={20} /> Manage Groups</h2>
          <form onSubmit={handleCreateGroup} className="flex gap-2 mb-8">
            <input required className="flex-grow bg-gray-50 p-4 rounded-2xl outline-none font-bold" placeholder="New Group Name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
            <button className="bg-blue-600 text-white px-6 rounded-2xl font-black uppercase text-xs">Add Group</button>
          </form>
          <div className="grid gap-3">
            {groups.map(g => (
              <div key={g.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center group border border-transparent hover:border-blue-200 transition-all shadow-sm">
                <Link to={`/groups/${g.id}`} className="font-black text-sm text-slate-800 uppercase tracking-tight flex-grow cursor-pointer">{g.name}</Link>
                <div className="flex items-center gap-4">
                  <button onClick={() => handleDeleteGroup(g.id, g.name)} className="text-rose-300 hover:text-rose-600 transition-colors cursor-pointer p-1"><Trash2 size={18}/></button>
                  {/* Arrow Link Fixed Here */}
                  <Link to={`/groups/${g.id}`} className="text-blue-300 hover:text-blue-600 p-1 transform group-hover:translate-x-1 transition-all cursor-pointer">
                    <ArrowRight size={22}/>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h2 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-2 text-slate-700"><Clock className="text-orange-500" size={20} /> Recent Settlements</h2>
          <div className="space-y-3">
            {settlements.map((s, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex flex-col">
                  <p className="text-[11px] font-bold text-slate-700 uppercase"><span className="text-emerald-600">{getName(s.payer_id)}</span> paid {getName(s.payee_id)}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">{new Date(s.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-emerald-600">₹{(s.amount / 100).toFixed(2)}</span>
                  <CheckCircle size={14} className="text-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}