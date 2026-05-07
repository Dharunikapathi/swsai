import React from 'react';
import { LayoutDashboard, Bell, Settings, FileText, BarChart2, Shield } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={20} /> },
    { id: 'security', label: 'Security', icon: <Shield size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 bg-surface border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-blue/20">
          S
        </div>
        <span className="text-2xl font-bold text-text-primary tracking-tight">SWS AI</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
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
          </button>
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
    </div>
  );
};
