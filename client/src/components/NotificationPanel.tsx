import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Bell, Trash2, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  isRead: boolean;
  createdAt: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-success" size={20} />;
      case 'error': return <AlertCircle className="text-error" size={20} />;
      default: return <Info className="text-brand-blue" size={20} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-surface shadow-2xl z-[101] flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="text-brand-blue" size={24} />
                <h2 className="text-xl font-bold text-text-primary">Notifications</h2>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={onMarkAllAsRead}
                  className="text-xs font-semibold text-brand-blue hover:text-brand-blue-dark transition-colors"
                >
                  Mark all as read
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                  <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                    <Bell size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">No notifications</h3>
                  <p className="text-text-secondary mt-1">We'll notify you when your files are ready.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {notifications.map((n) => (
                    <div 
                      key={n.id}
                      className={`
                        p-6 flex gap-4 transition-colors relative group
                        ${!n.isRead ? 'bg-brand-blue-light/30' : 'hover:bg-slate-50'}
                      `}
                    >
                      {!n.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-blue" />
                      )}
                      
                      <div className="mt-1">
                        {getIcon(n.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.isRead ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                          {n.message}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.isRead && (
                          <button 
                            onClick={() => onMarkAsRead(n.id)}
                            className="p-1.5 text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => onDelete(n.id)}
                          className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
