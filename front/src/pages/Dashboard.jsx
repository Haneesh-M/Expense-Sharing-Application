import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { TrendingUp, UserPlus, Users, Trash2, X, AlertCircle, Plus, Zap, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [totalNet, setTotalNet] = useState(0);
  const [newGroupName, setNewGroupName] = useState('');
  const [showCreateBox, setShowCreateBox] = useState(false);
  const [selectedMode, setSelectedMode] = useState('PAIRWISE');
  const [deleteModal, setDeleteModal] = useState({ show: false, gid: null, name: '', canDelete: false });
  const navigate = useNavigate();

  // Optimized Fetch Logic
  const fetchData = useCallback(async () => {
    try {
      const gRes = await api.get('/groups');
      const groupsData = gRes.data;
      setGroups(groupsData);

      let net = 0;
      // Fetch balances for each group to calculate total net
      const balancePromises = groupsData.map(g => api.get(`/groups/${g.id}/balances`));
      const balancesResults = await Promise.all(balancePromises);
      
      balancesResults.forEach(res => {
        res.data.balances?.forEach(b => {
          net += (b.amount || 0);
        });
      });
      setTotalNet(net);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // FIXED: Delete Modal Logic
  const openDeleteModal = async (gid, name) => {
    try {
      const balRes = await api.get(`/groups/${gid}/balances`);
      // A group is only deletable if there are no balances OR if all balance amounts are 0
      const hasActiveDues = balRes.data.balances?.some(b => Math.abs(b.amount) > 0);
      
      setDeleteModal({ 
        show: true, 
        gid, 
        name, 
        canDelete: !hasActiveDues 
      });
    } catch (err) {
      console.error("Error checking group status:", err);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      await api.post('/groups', { name: newGroupName, mode: selectedMode });
      setNewGroupName('');
      setShowCreateBox(false);
      fetchData(); // Refresh list
    } catch (err) {
      console.error("Error creating group:", err);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/groups/${deleteModal.gid}`);
      setDeleteModal({ show: false, gid: null, name: '', canDelete: false });
      fetchData(); // Refresh list after deletion
    } catch (err) {
      console.error("Error deleting group:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans overflow-x-hidden pb-20">
      {/* Global Style for Custom Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
      `}</style>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-12 space-y-12">
        
        {/* Header with Glassmorphism */}
        <header className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
          <div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full w-fit mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-emerald-400">System Active</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-white">
              Pulse <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Vault</span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 p-6 rounded-[2.5rem] flex items-center gap-6 shadow-2xl">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Balance</p>
                <p className="text-3xl font-black text-white italic">₹{(totalNet / 100).toFixed(2)}</p>
              </div>
              <div className="p-4 bg-blue-500/20 text-blue-400 rounded-2xl">
                <TrendingUp size={28} />
              </div>
            </div>

            <button 
              onClick={() => navigate('/users')}
              className="hidden sm:flex flex-col items-center justify-center w-28 h-28 bg-white text-slate-900 rounded-[2rem] hover:bg-blue-500 hover:text-white transition-all hover:-rotate-6 active:scale-90"
            >
              <UserPlus size={28} />
              <span className="text-[9px] font-black uppercase mt-2 text-center px-2">Manage Users</span>
            </button>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Panel: Create Group */}
          <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl shadow-blue-900/20">
            <div className="space-y-4">
              <Zap size={40} className="text-white/80 fill-white/20" />
              <h2 className="text-3xl font-black text-white leading-tight">Create a<br/>New Circle</h2>
              <p className="text-blue-100/70 text-sm font-medium">Define your group logic and start tracking expenses instantly.</p>
            </div>
            
            <div className="mt-12 space-y-4">
              <input 
                className="w-full bg-white/10 border-2 border-white/20 focus:border-white p-4 rounded-2xl outline-none font-bold text-white transition-all placeholder:text-blue-200/50"
                placeholder="Circle Name..."
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
              />
              <button 
                onClick={() => setShowCreateBox(true)}
                className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-xs tracking-widest hover:scale-[1.02] transition-all active:scale-95"
              >
                SETUP STRATEGY
              </button>
            </div>
          </div>

          {/* Right Panel: Group List */}
          <div className="col-span-12 lg:col-span-8 bg-white/[0.02] border border-white/10 rounded-[3rem] p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white flex items-center gap-3 italic">
                <Users className="text-blue-400" /> ACTIVE_SQUADS
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
              {groups.map((g) => (
                <div key={g.id} className="group bg-slate-900/40 border border-white/5 p-6 rounded-[2rem] hover:bg-white/[0.05] transition-all flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest bg-blue-400/10 px-2 py-1 rounded">
                      {g.mode || 'PAIRWISE'}
                    </span>
                    <h4 className="text-lg font-black text-white mt-2">{g.name}</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => openDeleteModal(g.id, g.name)}
                      className="p-3 text-slate-500 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                    <Link to={`/groups/${g.id}`} className="p-4 bg-white/5 hover:bg-blue-600 rounded-2xl transition-all">
                      <ChevronRight size={20} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Logic Modal */}
      {showCreateBox && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[200] p-6">
          <div className="bg-[#1e293b] border border-white/10 rounded-[3rem] w-full max-w-md p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-white italic">SELECT_LOGIC</h3>
              <button onClick={() => setShowCreateBox(false)} className="text-slate-500 hover:text-white"><X size={24}/></button>
            </div>

            <div className="space-y-4 mb-8">
              <button 
                onClick={() => setSelectedMode('PAIRWISE')} 
                className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${selectedMode === 'PAIRWISE' ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/5'}`}
              >
                <p className="font-black text-white uppercase text-xs mb-1 tracking-widest">Pairwise</p>
                <p className="text-xs text-slate-400 font-medium">Direct one-to-one mapping between friends.</p>
              </button>
              <button 
                onClick={() => setSelectedMode('SIMPLIFY')} 
                className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${selectedMode === 'SIMPLIFY' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/5'}`}
              >
                <p className="font-black text-white uppercase text-xs mb-1 tracking-widest">Simplify</p>
                <p className="text-xs text-slate-400 font-medium">Minimize total payments within the group.</p>
              </button>
            </div>

            <button onClick={handleCreateGroup} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black tracking-widest text-xs shadow-lg shadow-blue-500/20">
              ACTIVATE CIRCLE
            </button>
          </div>
        </div>
      )}

      {/* FIXED: Delete Modal Component */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[250] p-6">
          <div className="bg-slate-900 border border-white/10 rounded-[3rem] w-full max-w-sm p-10 text-center shadow-2xl">
            <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${deleteModal.canDelete ? 'bg-amber-500/20 text-amber-500' : 'bg-rose-500/20 text-rose-500'}`}>
              <AlertCircle size={32} />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">{deleteModal.canDelete ? 'Are you sure?' : 'Action Blocked'}</h3>
            <p className="text-sm text-slate-400 font-medium mb-8">
              {deleteModal.canDelete 
                ? `You are about to dissolve "${deleteModal.name}". This cannot be undone.` 
                : `Cannot delete "${deleteModal.name}" while there are outstanding balances to be settled.`}
            </p>
            <div className="grid gap-3">
              {deleteModal.canDelete && (
                <button onClick={confirmDelete} className="w-full py-4 bg-rose-600 text-white font-black text-xs tracking-widest rounded-2xl">
                  YES, DELETE GROUP
                </button>
              )}
              <button onClick={() => setDeleteModal({show:false, gid:null, name:'', canDelete:false})} className="w-full py-4 bg-white/5 text-slate-400 font-bold text-xs tracking-widest rounded-2xl">
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}