import { useEffect, useState } from 'react';
import api from '../api/axios';
import { TrendingUp, UserPlus, Users, ArrowRight, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [totalNet, setTotalNet] = useState(0);
  const [newGroupName, setNewGroupName] = useState('');
  const [showCreateBox, setShowCreateBox] = useState(false);
  const [selectedMode, setSelectedMode] = useState('PAIRWISE');
  const [deleteModal, setDeleteModal] = useState({ show: false, gid: null, name: '', canDelete: false });
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [gRes, uRes] = await Promise.all([api.get('/groups'), api.get('/users')]);
      setGroups(gRes.data);
      let net = 0;
      for (const g of gRes.data) {
        const balRes = await api.get(`/groups/${g.id}/balances`);
        balRes.data.balances?.forEach(b => net += (b.amount || 0));
      }
      setTotalNet(net);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const openDeleteModal = async (gid, name) => {
    const balRes = await api.get(`/groups/${gid}/balances`);
    const hasDues = balRes.data.balances?.length > 0;
    setDeleteModal({ show: true, gid, name, canDelete: !hasDues });
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      await api.post('/groups', { name: newGroupName, mode: selectedMode });
      setNewGroupName('');
      setShowCreateBox(false);
      fetchData();
    } catch (err) { alert("Delete finance.db and restart server."); }
  };

  return (
    <div className="w-full p-4 space-y-6 max-w-6xl mx-auto font-sans bg-slate-50 min-h-[calc(100vh-64px)]">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border-b-4 border-emerald-500">
          <div className="flex justify-between items-center text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">
            <span>Net Receivable</span>
            <TrendingUp size={14} />
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">₹{(totalNet / 100).toFixed(2)}</p>
        </div>
        <button onClick={() => navigate('/users')} className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg flex items-center justify-center gap-4 hover:bg-emerald-600 transition-all font-black uppercase text-xs tracking-widest">
          <UserPlus size={20} /> Register User
        </button>
      </div>

      {/* Manage Groups */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <Users className="text-blue-500" size={20} /> Manage Groups
          </h2>
          <div className="flex gap-2 max-w-md w-full">
            <input className="flex-grow bg-slate-50 p-3 rounded-xl outline-none font-bold text-sm border-2 border-transparent focus:border-blue-500" 
              placeholder="New Group Name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
            <button onClick={() => setShowCreateBox(true)} className="bg-blue-600 text-white px-6 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md">Add Group</button>
          </div>
        </div>

        <div className="grid gap-3 max-h-[50vh] overflow-y-auto pr-2">
          {groups.map(g => (
            <div key={g.id} className="p-4 bg-slate-50/50 rounded-2xl flex justify-between items-center group hover:bg-white border border-transparent hover:border-blue-100 transition-all">
              <Link to={`/groups/${g.id}`} className="flex flex-col flex-grow">
                <span className="font-black text-base text-slate-800 uppercase tracking-tight">{g.name}</span>
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-2 bg-blue-50 w-fit px-2 py-0.5 rounded">
                  {g.mode || 'PAIRWISE'}
                </span>
              </Link>
              <div className="flex items-center gap-4">
                {/* Delete button restored here */}
                <button onClick={() => openDeleteModal(g.id, g.name)} className="text-rose-200 hover:text-rose-500 p-2 rounded-full hover:bg-rose-50 transition-all">
                  <Trash2 size={18} />
                </button>
                <Link to={`/groups/${g.id}`} className="text-blue-200 hover:text-blue-500 transform group-hover:translate-x-1 transition-all">
                  <ArrowRight size={24} strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mode Selection Box */}
      {showCreateBox && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 animate-in zoom-in-95">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Split Logic</h3>
                <button onClick={() => setShowCreateBox(false)}><X size={20} className="text-slate-300 hover:text-slate-500"/></button>
              </div>
              <div className="grid gap-3">
                <button onClick={() => setSelectedMode('PAIRWISE')} className={`p-4 rounded-xl border-2 text-left transition-all ${selectedMode === 'PAIRWISE' ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-50'}`}>
                  <p className="font-black text-[10px] uppercase mb-1">Pairwise Mode</p>
                  <p className="text-[9px] text-slate-500 font-bold italic leading-tight">Direct tracking.</p>
                </button>
                <button onClick={() => setSelectedMode('SIMPLIFY')} className={`p-4 rounded-xl border-2 text-left transition-all ${selectedMode === 'SIMPLIFY' ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-50'}`}>
                  <p className="font-black text-[10px] uppercase mb-1">Simplify Mode</p>
                  <p className="text-[9px] text-slate-500 font-bold italic leading-tight">Minimized transfers.</p>
                </button>
              </div>
              <button onClick={handleCreateGroup} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">Confirm & Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Logic Box */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 animate-in zoom-in-95 text-center space-y-6">
            <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${deleteModal.canDelete ? 'bg-amber-50 text-amber-500' : 'bg-rose-50 text-rose-500'}`}>
              <AlertCircle size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase mb-2">{deleteModal.canDelete ? 'Confirm Delete' : 'Dues Pending'}</h3>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{deleteModal.canDelete ? `Delete group "${deleteModal.name}"?` : `Cannot delete "${deleteModal.name}": Some settlements are in due.`}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({show:false})} className="flex-1 py-3.5 text-slate-400 font-black uppercase text-[10px] tracking-widest bg-slate-50 rounded-xl">Cancel</button>
              {deleteModal.canDelete && <button onClick={async () => { await api.delete(`/groups/${deleteModal.gid}`); fetchData(); setDeleteModal({show:false}); }} className="flex-1 py-3.5 bg-rose-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg">Delete</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}