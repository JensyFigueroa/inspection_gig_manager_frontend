import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Shield, TruckIcon, Notebook } from 'lucide-react';

export default function Sidebar({ user }) {
  const userRole = user.role;
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth';
  };

  const items = (userRole) => {
    switch (userRole) {
      case 'admin':
        return [
          // { path: '/', label: 'Gigs', icon: LayoutDashboard },
          { path: '/', label: 'Work Orders', icon: TruckIcon },
          { path: '/operators', label: 'Operators', icon: Users },
          { path: '/statistics', label: 'Statistics', icon: Notebook },
        ];
      case 'lead':
        return [{path: '/', label: 'Work Orders', icon: LayoutDashboard }, { path: '/operators', label: 'Operators', icon: Users }];
      case 'qc':
        return [{path: '/', label: 'Work Orders', icon: LayoutDashboard }];
      case 'worker':
        return [{path: '/', label: 'Work Orders', icon: LayoutDashboard }];
      default:
        return [
          { path: '/', label: 'Work Orders', icon: LayoutDashboard },
        ];
    }
  };
  const menuItems = items(userRole);

  const getRoleBadge = (role) => {
    const badges = {
      'qc': { text: 'QC', color: 'bg-purple-600' },
      'lead': { text: 'LEAD', color: 'bg-blue-600' },
      'worker': { text: 'WORKER', color: 'bg-green-600' },
      'admin': { text: 'ADMIN', color: 'bg-green-600' },
    };
    return badges[role] || { text: role.toUpperCase(), color: 'bg-slate-600' };
  };

  const roleBadge = getRoleBadge(userRole)

  return (
    <div className="sidebar noise-bg">
      
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          {/* <Shield size={28} className="text-[#FF5722]" /> */}
          <div className="flex items-center gap-2">
            <div className="bg-red-500 p-1.5 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-list w-6 h-4 text-white" aria-hidden="true">
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <path d="M12 11h4"></path><path d="M12 16h4"></path>
              <path d="M8 11h.01"></path>
              <path d="M8 16h.01"></path>
              </svg>
            </div>
            <h1 className="font-heading font-black text-xl uppercase tracking-tight leading-none">
              GigManager
            </h1>
          </div>
          <div>

          </div>
        </div>
        <div className={`inline-block px-3 py-1 ${roleBadge.color} text-white text-xs font-bold uppercase rounded-sm`}>
          {roleBadge.text}
        </div>
      </div>

      <nav className="mb-12">
        {
        menuItems.map((item) => {
          // console.log(item,'item')
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`sidebar-link w-full ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-700">
        <div className="mb-4 px-2">
          <p className="font-mono text-xs uppercase tracking-wider text-slate-500 mb-1">User</p>
          <p className="font-body text-sm text-white font-semibold">{user?.name}</p>
          <p className="font-mono text-xs text-slate-400">{user?.email}</p>
          {user?.station && (
            <p className="font-mono text-xs text-slate-300 mt-2">
              📍 {user.station}
            </p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:bg-red-900/20"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </button>
        
      </div>
      <p className="font-mono text-xs text-slate-300 mt-2">Inspection Gig Manager v1.0</p>
    </div>
  );
}