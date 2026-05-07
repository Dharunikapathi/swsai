import React from 'react';
import { Download, FileText, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface Document {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  status: string;
  uploadedAt: string;
}

interface DocumentTableProps {
  documents: Document[];
}

export const DocumentTable: React.FC<DocumentTableProps> = ({ documents }) => {
  const formatSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (id: string) => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/documents/${id}/download`;
    window.open(url, '_blank');
  };

  if (documents.length === 0) {
    return (
      <div className="card py-20 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-brand-blue-light text-brand-blue rounded-full flex items-center justify-center mb-4">
          <Upload size={32} />
        </div>
        <h3 className="text-xl font-semibold text-text-primary">No documents yet</h3>
        <p className="text-text-secondary mt-1">Upload your first document to get started →</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0 border-none shadow-brand">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Size</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Type</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Uploaded At</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-secondary text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <AnimatePresence initial={false}>
              {documents.map((doc) => (
                <motion.tr
                  key={doc.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-blue-light rounded-lg text-brand-blue">
                        <FileText size={18} />
                      </div>
                      <span className="font-medium text-text-primary max-w-[200px] truncate">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {formatSize(doc.size)}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    PDF
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {format(new Date(doc.uploadedAt), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
                      Complete
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDownload(doc.id)}
                      className="p-2 text-brand-blue hover:bg-brand-blue-light rounded-lg transition-colors inline-flex items-center gap-2"
                      title="Download"
                    >
                      <Download size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};


