import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, CheckCircle } from 'lucide-react';

interface ToastBannerProps {
  message: string;
  isVisible: boolean;
  onDismiss: () => void;
  type?: 'info' | 'success';
}

export const ToastBanner: React.FC<ToastBannerProps> = ({ 
  message, 
  isVisible, 
  onDismiss,
  type = 'info'
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-4"
        >
          <div className={`
            flex items-center gap-4 p-4 rounded-xl shadow-xl border
            ${type === 'success' 
              ? 'bg-success/10 border-success/20 text-success-700' 
              : 'bg-brand-blue text-white border-brand-blue-dark'}
          `}>
            {type === 'success' ? <CheckCircle size={24} /> : <Info size={24} />}
            
            <div className="flex-1">
              <p className="font-medium">{message}</p>
            </div>

            <button 
              onClick={onDismiss}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
