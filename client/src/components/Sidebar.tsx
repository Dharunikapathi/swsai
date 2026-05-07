import React from 'react';
import { LayoutDashboard, Bell, Settings, FileText, BarChart2, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/', disabled: false },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} />, path: '/notifications', disabled: false },
    { id: 'documents', label: 'Documents', icon: <FileText size={20} />, path: '/', disabled: false },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={20} />, path: '#', disabled: true },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '#', disabled: true },
  ];

  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-[150] w-64 bg-surface border-r border-slate-200 flex flex-col transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:sticky md:top-0 md:h-screen
      `}
    >
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-blue/20">
            S
          </Link>
          <span className="text-2xl font-bold text-text-primary tracking-tight">SWS AI</span>
        </div>
        <button onClick={onClose} className="md:hidden p-2 text-text-secondary hover:bg-slate-100 rounded-lg">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          item.disabled ? (
            <div
              key={item.id}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 cursor-not-allowed group relative"
              title="Coming Soon"
            >
              <span className="text-slate-300">
                {item.icon}
              </span>
              {item.label}
              <span className="absolute right-4 text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                Soon
              </span>
            </div>
          ) : (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => { if(window.innerWidth < 768) onClose(); }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                ${activeTab === item.id 
                  ? 'bg-brand-blue-light text-brand-blue font-semibold' 
                  : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'}
              `}
            >
              {activeTab === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-brand-blue rounded-r-full" />
              )}
              <span className={activeTab === item.id ? 'text-brand-blue' : 'text-slate-400 group-hover:text-text-primary transition-colors'}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        ))}
      </nav>

      <div className="p-6 border-t border-slate-100">
        <div className="bg-brand-blue-light/50 p-4 rounded-xl">
          <p className="text-xs font-bold text-brand-blue uppercase tracking-wider mb-1">Plan</p>
          <p className="text-sm font-semibold text-text-primary">Enterprise Client</p>
          <div className="mt-3 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-brand-blue w-3/4 h-full" />
          </div>
          <p className="text-[10px] text-text-secondary mt-2">7.5 GB / 10 GB used</p>
        </div>
      </div>
    </aside>
  );
};
