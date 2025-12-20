import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import GroupDetails from './pages/GroupDetails';
import UserManagement from './pages/UserManagement';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen w-screen bg-gray-50 overflow-x-hidden m-0 p-0 font-sans">
        <Navbar />
        <main className="flex-grow w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UserManagement />} />
            {/* The :id parameter is critical for capturing group IDs from the DB */}
            <Route path="/groups/:id" element={<GroupDetails />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}