import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Shield, TruckIcon, Notebook } from 'lucide-react';
import logoRev from '../assets/logoRev.png'
import NotificationBell from './NotificationBell';


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
        <div className="flex items-center gap-2 mb-10">
          {/* <Shield size={28} className="text-[#FF5722]" /> */}
          <div className="flex items-center gap-2">
            <div className="logo-cell w-26 h-20 bg-transparent">
              <img src={logoRev} alt="" className='w-full h-full object-contain' />
            <h1 className="font-heading font-black text-xl uppercase tracking-tight leading-none">
              GigManager
            </h1>
            </div>
          </div>
          <div>

          </div>
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


      <div className="flex items-center gap-4">
  {/* Notification Bell - solo para Lead y QC */}
  <NotificationBell user={user} />
  
  {/* Tu contenido existente del usuario */}
  <div className="user-info">
    {/* ... */}
  </div>
</div>

        <div className={`inline-block px-3 py-1 ${roleBadge.color} text-white text-xs font-bold uppercase rounded-sm`}>
          {roleBadge.text}
        </div>

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