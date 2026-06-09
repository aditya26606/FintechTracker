import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Bell, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const location = useLocation();
  const { user } = useAuth();
  const notifRef = useRef(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 17) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');

      setCurrentTime(
        now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) +
        ' · ' +
        now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, []);

  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  
  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard': return 'Dashboard Overview';
      case '/expenses': return 'Expense Tracker';
      case '/budget': return 'Budget Management';
      case '/goals': return 'Savings Goals';
      case '/analytics': return 'Insights & Analytics';
      case '/achievements': return 'Achievements';
      case '/reports': return 'Financial Reports';
      case '/profile': return 'My Profile';
      case '/settings': return 'System Settings';
      default: return 'Automated Expense Tracker';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-darkBg text-textPrimary">
      
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      
      <div className="flex flex-col flex-grow min-w-0">

        
        <header className="flex items-center justify-between h-20 px-6 border-b border-glassBorder bg-slate-950/20 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-textSecondary hover:text-textPrimary hover:bg-slate-900/50 lg:hidden focus:outline-none"
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-textPrimary leading-tight">
                {getPageTitle(location.pathname)}
              </h1>
              {user && (
                <p className="text-xs text-textMuted leading-tight hidden sm:block">
                  {greeting}, <span className="text-textSecondary font-semibold">{user.name?.split(' ')[0]}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            
            <span className="text-xs text-textMuted font-medium hidden md:block tabular-nums">
              {currentTime}
            </span>

            
            <div className="relative" ref={notifRef}>
              <button
                id="notification-bell-btn"
                onClick={() => setNotifOpen(!notifOpen)}
                className={`p-2.5 rounded-xl border transition-all ${
                  notifOpen
                    ? 'border-neonBlue/40 bg-neonBlue/10 text-neonBlue'
                    : 'border-glassBorder bg-slate-900/30 text-textSecondary hover:text-textPrimary hover:border-slate-800'
                }`}
              >
                <Bell size={18} />
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    id="notification-dropdown"
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 top-12 w-72 glass-card border border-glassBorder z-50 overflow-hidden"
                  >
                    
                    <div className="flex items-center justify-between px-4 py-3 border-b border-glassBorder bg-slate-900/30">
                      <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">Notifications</span>
                      <span className="text-[10px] text-textMuted">All caught up</span>
                    </div>

                    
                    <div className="flex flex-col items-center justify-center py-8 gap-3 text-center px-4">
                      <div className="p-3 rounded-full bg-slate-900/50 text-textMuted">
                        <BellOff size={20} />
                      </div>
                      <p className="text-xs font-semibold text-textSecondary">No new notifications</p>
                      <p className="text-[10px] text-textMuted">
                        Budget alerts and achievement unlocks will appear here.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        
        <main className="flex-grow p-6 overflow-y-auto bg-gradient-to-b from-slate-950/50 to-darkBg">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
