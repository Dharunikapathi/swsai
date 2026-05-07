import React from 'react';

export const TableSkeleton: React.FC = () => {
  return (
    <div className="card overflow-hidden p-0 border-none animate-pulse">
      <div className="bg-slate-50 border-b border-slate-100 h-12 w-full" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 px-6 py-4 border-b border-slate-50">
          <div className="w-8 h-8 bg-slate-100 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-100 rounded w-1/4" />
            <div className="h-3 bg-slate-50 rounded w-1/6" />
          </div>
          <div className="w-20 h-4 bg-slate-100 rounded" />
          <div className="w-10 h-8 bg-slate-100 rounded-lg" />
        </div>
      ))}
    </div>
  );
};

export const ProgressSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card flex items-center gap-4 animate-pulse">
          <div className="w-12 h-12 bg-slate-100 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-1.5 bg-slate-100 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
};
