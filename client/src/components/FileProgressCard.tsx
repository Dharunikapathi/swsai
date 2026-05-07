import React from 'react';
import { FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface FileProgressCardProps {
  name: string;
  size: number;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'failed';
}

export const FileProgressCard: React.FC<FileProgressCardProps> = ({ 
  name, 
  size, 
  progress, 
  status 
}) => {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = () => {
    switch (status) {
      case 'complete': return 'bg-success';
      case 'failed': return 'bg-error';
      default: return 'bg-brand-blue';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'complete': return <CheckCircle className="text-success" size={20} />;
      case 'failed': return <AlertCircle className="text-error" size={20} />;
      case 'uploading': return <Loader2 className="text-brand-blue animate-spin" size={20} />;
      default: return <FileText className="text-slate-400" size={20} />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card relative overflow-hidden flex items-center gap-4 group"
    >
      {/* Left side colored stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getStatusColor()}`} />
      
      <div className="bg-slate-50 p-3 rounded-lg">
        <FileText className="text-brand-blue" size={24} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="text-sm font-semibold text-text-primary truncate">{name}</h4>
          {getStatusIcon()}
        </div>
        
        <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
          <span>{formatSize(size)}</span>
          <span className="font-medium">{status === 'complete' ? 'Completed' : `${progress}%`}</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full ${getStatusColor()} ${status === 'uploading' ? 'shimmer' : ''}`}
          />
        </div>
      </div>
    </motion.div>
  );
};
