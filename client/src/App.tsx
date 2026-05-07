import React, { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { NotificationsPage } from './pages/Notifications';
import { Sidebar } from './components/Sidebar';
import { NotificationPanel } from './components/NotificationPanel';
import { useNotifications } from './hooks/useNotifications';
import { Bell, Search, ChevronRight } from 'lucide-react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';

function App() {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const location = useLocation();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/notifications') return 'Notifications';
    return 'Dashboard';
  };

  return (
    <div className="flex min-h-screen bg-surface-2 font-livvic">
      <Sidebar activeTab={location.pathname === '/notifications' ? 'notifications' : 'dashboard'} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-surface/80 backdrop-blur-md border-b border-slate-200 py-4 px-8 sticky top-0 z-50 flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm text-text-secondary gap-2">
              <Link to="/" className="hover:text-brand-blue transition-colors">Home</Link>
              <ChevronRight size={14} />
              <span className="text-brand-blue font-semibold">{getBreadcrumb()}</span>
            </div>
            
            <div className="ml-8 relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search documents..."
                className="bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(true)}
                className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors relative"
              >
                <Bell className="text-text-secondary" size={24} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-error text-white text-[10px] font-bold flex items-center justify-center border-2 border-surface rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
            
            <div className="h-10 w-px bg-slate-200" />
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-text-primary leading-tight">Dharunika T.</p>
                <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-blue-light border border-brand-blue/20 flex items-center justify-center text-brand-blue font-bold shadow-sm">
                DT
              </div>
            </div>
          </div>
        </header>

        <NotificationPanel 
          isOpen={isNotifOpen}
          onClose={() => setIsNotifOpen(false)}
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
        />

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
