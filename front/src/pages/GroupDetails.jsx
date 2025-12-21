import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import ExpenseForm from '../components/ExpenseForm';
import { UserPlus, Check, X, Users as UsersIcon, CreditCard, Wallet, ArrowRightLeft, Sparkles, Hash } from 'lucide-react';

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

  const fetchDetails = useCallback(async () => {
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
  }, [id]);

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  const availableUsers = allUsers.filter(u => !members.some(m => m.id === u.id));

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans p-4 lg:p-10 relative overflow-hidden">
      {/* Abstract Background Accents */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-5%] w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        
        {/* SIDEBAR: Controls & Roster */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Group Meta Card */}
          <div className="bg-slate-900/50 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 text-white/[0.03] group-hover:text-emerald-500/10 transition-colors">
              <Sparkles size={160} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Hash className="text-emerald-500" size={16} />
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-500">Terminal_ID: {id}</span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase italic">
                {currentGroup?.name}
              </h1>
              <div className="flex gap-2">
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest border border-emerald-500/20">
                  {currentGroup?.mode || 'PAIRWISE'}
                </span>
              </div>
            </div>
          </div>

          {/* Add Member - Neural Style */}
          <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-md">
            <h2 className="text-[11px] font-black mb-6 uppercase text-slate-400 flex items-center gap-3 tracking-[0.2em]">
              <UserPlus size={18} className="text-blue-400" /> Expand_Circle
            </h2>
            <form onSubmit={async (e) => { 
              e.preventDefault(); 
              if(!selectedUserId) return;
              await api.post(`/groups/${id}/users`, { userId: parseInt(selectedUserId) }); 
              setSelectedUserId('');
              fetchDetails(); 
            }} className="space-y-4">
              <div className="relative">
                <select 
                  className="w-full bg-slate-950 border border-white/10 p-4 rounded-2xl outline-none font-bold text-xs text-white appearance-none cursor-pointer focus:border-blue-500/50 transition-colors" 
                  value={selectedUserId} 
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="" className="bg-slate-900">Select Identity</option>
                  {availableUsers.map(u => <option key={u.id} value={u.id} className="bg-slate-900">{u.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <Sparkles size={14} />
                </div>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                Grant Access
              </button>
            </form>
          </div>

          {/* Members Roster */}
          <div className="bg-slate-900/30 border border-white/5 p-8 rounded-[2.5rem]">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
              <UsersIcon size={16} /> All Users
            </h3>
            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/30 transition-colors">
                    <span className="text-xs font-black text-emerald-400">{m.name.charAt(0)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-slate-200 text-xs uppercase tracking-tight">{m.name}</span>
                    <span className="text-[9px] text-slate-500 font-bold tracking-wider">{m.email}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN: Ledger & Balances */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Ledger Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 p-8 rounded-[3rem] border border-white/10 shadow-2xl gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-emerald-500/10 rounded-[1.5rem] text-emerald-400">
                <Wallet size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white italic tracking-tighter">LEDGER_FLOW</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active debt redistribution</p>
              </div>
            </div>
            <button 
              onClick={() => setShowModal(true)} 
              className="group bg-white hover:bg-emerald-500 hover:text-white text-slate-950 px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center gap-3"
            >
              <CreditCard size={18} />
              Inject Expense
            </button>
          </div>

          {/* Balance Cards Grid */}
          <div className="grid gap-6">
            {balances.map((b, i) => (
              <div key={i} className="group bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row justify-between items-center transition-all hover:bg-white/[0.03] hover:border-emerald-500/20 relative overflow-hidden">
                {/* Visual Flow Indicator */}
                <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
                  <ArrowRightLeft size={80} />
                </div>

                <div className="flex flex-col items-center md:items-start text-center md:text-left z-10 mb-6 md:mb-0">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-white uppercase">{getName(b.from)}</span>
                    <ArrowRightLeft size={14} className="text-emerald-500" />
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-white uppercase">{getName(b.to)}</span>
                  </div>
                  <p className="text-5xl font-black text-white tracking-tighter leading-none flex items-start gap-1">
                    <span className="text-xl text-emerald-500 mt-1">₹</span>
                    {(b.amount / 100).toFixed(2)}
                  </p>
                </div>

                <div className="z-10">
                  {confirming === i ? (
                    <div className="flex gap-3 animate-in slide-in-from-right-4">
                      <button 
                        onClick={async () => { 
                          await api.post(`/groups/${id}/settle`, { payerId: b.from, payeeId: b.to, amount: b.amount }); 
                          setConfirming(null); 
                          fetchDetails(); 
                        }} 
                        className="bg-emerald-500 text-slate-950 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:brightness-110"
                      >
                        Execute
                      </button>
                      <button 
                        onClick={() => setConfirming(null)} 
                        className="bg-white/5 p-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <X size={20}/>
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirming(i)} 
                      className="bg-transparent border-2 border-emerald-500/30 hover:border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                    >
                      Settle Balance
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {balances.length === 0 && (
              <div className="relative py-40 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[4rem] group overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Sparkles size={48} className="text-emerald-500/20 mb-6 group-hover:animate-pulse" />
                <p className="font-black text-slate-700 uppercase tracking-[0.8em] text-2xl group-hover:text-emerald-500/30 transition-colors">
                  Zero_Gravity
                </p>
                <p className="text-[10px] font-bold text-slate-500 mt-4 tracking-widest uppercase">All accounts are currently in equilibrium</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl transform transition-all animate-in zoom-in-95 duration-300">
            <ExpenseForm 
              groupId={id} 
              members={members} 
              onClose={() => setShowModal(false)} 
              onRefresh={fetchDetails} 
            />
          </div>
        </div>
      )}

      {/* Global CSS for custom scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(52, 211, 153, 0.3); }
      `}</style>
    </div>
  );
}