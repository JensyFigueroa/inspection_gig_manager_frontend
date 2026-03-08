import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, TruckIcon, Notebook, Menu, X, TrendingUp } from 'lucide-react';
import logoRev from '../assets/logoRev.png';
import NotificationBell from './NotificationBell';

export default function Sidebar({ user }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
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
          { path: '/', label: 'Work Orders', icon: TruckIcon },
          { path: '/operators', label: 'Operators', icon: Users },
          { path: '/statistics', label: 'Statistics', icon: Notebook },
        ];
      case 'lead':
        return [
          { path: '/', label: 'Work Orders', icon: LayoutDashboard },
          { path: '/operators', label: 'Operators', icon: Users },
          { path: '/efficiency', label: 'Efficiency', icon: TrendingUp },
        ];
      case 'qc':
        return [{ path: '/', label: 'Work Orders', icon: LayoutDashboard }];
      case 'worker':
        return [{ path: '/', label: 'Work Orders', icon: LayoutDashboard }];
      default:
        return [{ path: '/', label: 'Work Orders', icon: LayoutDashboard }];
    }
  };
  
  const menuItems = items(userRole);

  const getRoleBadge = (role) => {
    const badges = {
      'qc': { text: 'QC', color: 'bg-purple-600' },
      'lead': { text: 'LEAD', color: 'bg-blue-600' },
      'worker': { text: 'WORKER', color: 'bg-green-600' },
      'admin': { text: 'ADMIN', color: 'bg-red-600' },
    };
    return badges[role] || { text: role.toUpperCase(), color: 'bg-slate-600' };
  };

  const roleBadge = getRoleBadge(userRole);

  return (
    <>
      {/* Botón hamburguesa - visible en tablet/mobile */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-[60] lg:hidden bg-slate-800 text-white p-2 rounded-lg shadow-lg hover:bg-slate-700 transition-colors"
      >
        {!isCollapsed ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para cerrar sidebar */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          sidebar noise-bg fixed left-0 top-0 h-screen z-50
          transition-transform duration-300 ease-in-out
          ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
          lg:translate-x-0
          w-56 lg:w-64
          p-4 lg:p-6
        `}
      >
        <div className="mb-6 lg:mb-12 pt-12 lg:pt-0">
          <div className="flex items-center gap-2 mb-6 lg:mb-10">
            <div className="logo-cell w-16 h-12 lg:w-20 lg:h-16 bg-transparent">
              <img src={logoRev} alt="" className='w-full h-full object-contain' />
            </div>
            <h1 className="font-heading font-black text-base lg:text-xl uppercase tracking-tight leading-none">
              GigManager
            </h1>
          </div>
        </div>

        <nav className="mb-6 lg:mb-12">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsCollapsed(true);
                }}
                className={`sidebar-link w-full ${isActive ? 'active' : ''} text-sm lg:text-base py-2 lg:py-3`}
              >
                <Icon size={18} className="mr-2 lg:mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <NotificationBell user={user} />
        </div>

        <div className={`inline-block px-2 lg:px-3 py-1 ${roleBadge.color} text-white text-[10px] lg:text-xs font-bold uppercase rounded-sm mt-4`}>
          {roleBadge.text}
        </div>

        <div className="mt-auto pt-4 lg:pt-6 border-t border-slate-700">
          <div className="mb-3 lg:mb-4 px-2">
            <p className="font-mono text-[10px] lg:text-xs uppercase tracking-wider text-slate-500 mb-1">User</p>
            <p className="font-body text-xs lg:text-sm text-white font-semibold truncate">{user?.fullName || user?.name}</p>
            <p className="font-mono text-[10px] lg:text-xs text-slate-400 truncate">{user?.email}</p>
            {user?.station && (
              <p className="font-mono text-[10px] lg:text-xs text-slate-300 mt-2">📍 {user.station}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:bg-red-900/20 text-sm lg:text-base"
          >
            <LogOut size={18} className="mr-2 lg:mr-3" />
            Logout
          </button>
        </div>
        <p className="font-mono text-[10px] lg:text-xs text-slate-300 mt-2">v1.0</p>
      </div>
    </>
  );
}
