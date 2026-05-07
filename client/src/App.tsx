import { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { NotificationPanel } from './components/NotificationPanel';
import { useNotifications } from './hooks/useNotifications';
import { Bell } from 'lucide-react';

function App() {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  return (
    <div className="min-h-screen bg-surface-2 font-livvic">
      <nav className="bg-surface border-b border-slate-200 py-4 px-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <span className="text-xl font-bold text-brand-blue">SWS AI</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(true)}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors relative"
              >
                <Bell className="text-text-secondary" size={24} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-error text-white text-[10px] font-bold flex items-center justify-center border-2 border-surface rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-blue-light border border-brand-blue/20 flex items-center justify-center text-brand-blue font-bold text-xs">
              JD
            </div>
          </div>
        </div>
      </nav>

      <NotificationPanel 
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDelete={deleteNotification}
      />

      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
