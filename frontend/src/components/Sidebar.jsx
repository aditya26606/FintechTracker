import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BACKEND_URL } from '../api';

import {
  LayoutDashboard,
  Receipt,
  Wallet,
  PiggyBank,
  TrendingUp,
  Award,
  FileText,
  User,
  Settings,
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/expenses', label: 'Expense Tracker', icon: Receipt },
    { to: '/budget', label: 'Budget Management', icon: Wallet },
    { to: '/goals', label: 'Savings Goals', icon: PiggyBank },
    { to: '/analytics', label: 'Insights & Analytics', icon: TrendingUp },
    { to: '/achievements', label: 'Achievements', icon: Award },
    { to: '/reports', label: 'Reports', icon: FileText },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <>
      
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-64 h-screen
        bg-[#070b13]/95 backdrop-blur-glass border-r border-glassBorder
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        <div className="flex items-center justify-between h-20 px-6 border-b border-glassBorder shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-neonIndigo to-neonBlue text-white font-bold shadow-glow-blue text-base">
              💰
            </span>
            <span className="text-xl font-bold tracking-tight text-textPrimary">
              Fintech<span className="text-neonBlue">Tracker</span>
            </span>
          </div>
          <button onClick={toggleSidebar} className="p-1.5 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-slate-800/50 transition-colors lg:hidden">
            <X size={18} />
          </button>
        </div>

        
        {user && (
          <div className="px-5 py-4 border-b border-glassBorder bg-gradient-to-r from-slate-900/40 to-transparent shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `${BACKEND_URL}${user.profilePhoto}`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-neonBlue/30"
                  />
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-neonIndigo to-neonBlue text-white text-sm font-bold border-2 border-neonBlue/20">
                    {getInitials(user.name)}
                  </div>
                )}
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <h4 className="text-sm font-bold text-textPrimary truncate">{user.name}</h4>
                <p className="text-[11px] text-textMuted truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        
        <nav className="flex-grow px-3 py-4 overflow-y-auto space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                className={({ isActive }) => `
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative
                  ${isActive
                    ? 'bg-gradient-to-r from-neonIndigo/25 to-neonBlue/10 text-neonBlue font-semibold border border-neonBlue/15 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                    : 'text-textMuted hover:text-textPrimary hover:bg-slate-800/40 border border-transparent'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-neonBlue shadow-glow-blue" />
                    )}
                    <Icon size={17} className={`shrink-0 transition-colors duration-200 ${isActive ? 'text-neonBlue' : 'text-textMuted group-hover:text-textSecondary'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        
        <div className="p-3 border-t border-glassBorder shrink-0">
          <a
            href="#logout"
            onClick={handleLogout}
            className="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-textMuted hover:text-neonRose hover:bg-neonRose/8 rounded-xl transition-all duration-200 border border-transparent hover:border-neonRose/15"
          >
            <LogOut size={17} className="shrink-0 group-hover:text-neonRose transition-colors" />
            <span>Logout</span>
          </a>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
