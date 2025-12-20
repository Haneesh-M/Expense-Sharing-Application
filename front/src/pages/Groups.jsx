import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import api from '../api/axios';

export default function Groups() {
  const { groups, refreshData } = useApp();
  const [name, setName] = useState('');

  const createGroup = async (e) => {
    e.preventDefault();
    await api.post('/groups', { name });
    setName('');
    refreshData();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Groups</h1>
        <form onSubmit={createGroup} className="flex gap-2">
          <input className="border p-2 rounded" placeholder="Group Name" value={name} onChange={e => setName(e.target.value)} />
          <button className="bg-splitwise-green text-white p-2 rounded"><Plus /></button>
        </form>
      </div>
      <div className="grid gap-4">
        {groups.map(g => (
          <Link key={g.id} to={`/groups/${g.id}`} className="bg-white p-4 rounded shadow hover:border-splitwise-green border transition-all flex items-center gap-4">
            <Users className="text-splitwise-green" />
            <span className="font-bold text-lg">{g.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}