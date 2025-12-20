import { useEffect, useState } from 'react';
import api from '../api/axios';
import { UserPlus, Mail, User, Trash2 } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '' });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) { console.error("Fetch error", err); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', newUser);
      setNewUser({ name: '', email: '' });
      fetchUsers();
    } catch (err) { alert("Email already exists!"); }
  };

  return (
    <div className="max-w-4xl mx-auto p-10 space-y-10">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2 uppercase tracking-tight">
          <UserPlus className="text-emerald-500" /> Register New User
        </h2>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-4 text-gray-400" size={20} />
            <input required className="w-full bg-gray-50 pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none" 
              placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-gray-400" size={20} />
            <input required type="email" className="w-full bg-gray-50 pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none" 
              placeholder="Email Address" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-emerald-500 transition-all uppercase tracking-widest shadow-lg">
            Add User to Database
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-6">Registered System Users</h3>
        <div className="grid gap-4">
          {users.map(u => (
            <div key={u.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex flex-col">
                <span className="font-bold text-slate-700 text-lg uppercase tracking-tight">{u.name}</span>
                <span className="text-sm text-gray-400 font-medium">{u.email}</span>
              </div>
              <div className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase">
                Active ID: {u.id}
              </div>
            </div>
          ))}
          {users.length === 0 && <p className="text-center text-gray-400 italic">No users registered yet.</p>}
        </div>
      </div>
    </div>
  );
}