import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, IndianRupee } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white w-full shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-black text-emerald-400 flex items-center gap-2 tracking-tighter">
          <IndianRupee size={28} strokeWidth={3} /> SPLIT LEDGER
        </Link>
        <div className="flex gap-8 font-bold text-sm uppercase tracking-widest text-gray-300">
          <Link to="/" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
            <LayoutDashboard size={18}/> Dashboard
          </Link>
          <Link to="/users" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
            <Users size={18}/> Users
          </Link>
        </div>
      </div>
    </nav>
  );
}