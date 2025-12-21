import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { UserPlus, Mail, User, ShieldCheck, Fingerprint, Globe, Search } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error("Fetch error", err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/users', newUser);
      setNewUser({ name: '', email: '' });
      fetchUsers();
    } catch (err) {
      alert("Registration failed: Email may already exist in the neural net.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans p-6 lg:p-12 overflow-x-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none"></div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        
        {/* Left Side: Registration Glass Terminal */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
              <Fingerprint className="text-emerald-400" size={40} />
              Identity <span className="text-emerald-400">Vault</span>
            </h1>
            <p className="text-slate-500 font-medium">Provision new accounts into the secure ledger.</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck size={120} />
            </div>
            
            <h2 className="text-xl font-black text-white mb-8 flex items-center gap-2 uppercase tracking-widest text-[12px]">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              Auth_Protocol: Initialize
            </h2>

            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Legal Identity</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    required 
                    className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 pl-12 pr-4 py-4 rounded-2xl outline-none text-white transition-all placeholder:text-slate-600" 
                    placeholder="e.g. Satoshi Nakamoto" 
                    value={newUser.name} 
                    onChange={e => setNewUser({...newUser, name: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Neural Link (Email)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    required 
                    type="email" 
                    className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 pl-12 pr-4 py-4 rounded-2xl outline-none text-white transition-all placeholder:text-slate-600" 
                    placeholder="protocol@network.com" 
                    value={newUser.email} 
                    onChange={e => setNewUser({...newUser, email: e.target.value})} 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="group w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-5 rounded-2xl font-black transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "Syncing..." : "Authorize Entity"}
                <UserPlus size={18} className="group-hover:rotate-12 transition-transform" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Exploratory User List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search User..."
                className="w-full bg-white/5 border border-white/5 pl-12 pr-4 py-3 rounded-full text-sm outline-none focus:border-blue-500/50 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-2">
              <Globe size={14} className="text-blue-400 animate-spin-slow" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Network: {users.length} Nodes</span>
            </div>
          </div>

          <div className="grid gap-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {filteredUsers.map((u, idx) => (
              <div 
                key={u.id} 
                className="group flex justify-between items-center p-6 bg-slate-900/30 border border-white/5 rounded-[2rem] hover:bg-white/[0.04] hover:border-emerald-500/30 transition-all animate-in slide-in-from-right duration-300"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                    <span className="text-xl font-black text-emerald-400">{u.name.charAt(0)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-white text-lg tracking-tight uppercase">{u.name}</span>
                    <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                      <Mail size={12} /> {u.email}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[9px] font-black bg-white/5 text-slate-400 px-3 py-1 rounded-md border border-white/5 tracking-tighter">
                    UID::{u.id.toString().padStart(4, '0')}
                  </span>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-white/5">
                  <Search className="text-slate-700" />
                </div>
                <p className="text-slate-600 font-bold italic">Zero entities match your current query.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(52, 211, 153, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(52, 211, 153, 0.4); }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
    </div>
  );
}