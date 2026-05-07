import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Bell, Trash2, Check, CheckCircle, AlertCircle, Info, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const { notifications, markAsRead, deleteNotification, markAllAsRead } = useNotifications();
  // Note: Using a simple state for navigation if react-router is not fully set up, 
  // but I'll assume standard navigation for a prototype.
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-success" size={24} />;
      case 'error': return <AlertCircle className="text-error" size={24} />;
      default: return <Info className="text-brand-blue" size={24} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">All Notifications</h1>
          <p className="text-text-secondary mt-1">Stay updated with your document processing status.</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="btn-primary flex items-center gap-2"
        >
          <Check size={18} />
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="card py-20 text-center">
            <Bell className="mx-auto text-slate-200 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-text-primary">No notifications yet</h3>
            <p className="text-text-secondary mt-1">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id}
              className={`
                card flex items-start gap-6 transition-all duration-200 group relative
                ${!n.isRead ? 'border-l-4 border-l-brand-blue bg-brand-blue-light/20' : 'bg-surface'}
              `}
            >
              <div className="mt-1">
                {getIcon(n.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <p className={`text-lg ${!n.isRead ? 'font-bold text-text-primary' : 'text-text-secondary font-medium'}`}>
                    {n.message}
                  </p>
                  <span className="text-sm text-text-secondary whitespace-nowrap">
                    {format(new Date(n.createdAt), 'MMM d, h:mm a')}
                  </span>
                </div>
                
                <div className="mt-4 flex items-center gap-4">
                  {!n.isRead && (
                    <button 
                      onClick={() => markAsRead(n.id)}
                      className="text-sm font-semibold text-brand-blue hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(n.id)}
                    className="text-sm font-semibold text-error hover:underline flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
