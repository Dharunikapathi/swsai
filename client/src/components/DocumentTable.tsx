import React, { useState } from 'react';
import { Download, FileText, Upload, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFViewerModal } from './PDFViewerModal';

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

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  complete: { label: 'Complete', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  uploading: { label: 'Uploading', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  failed: { label: 'Failed', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

export const DocumentTable: React.FC<DocumentTableProps> = ({ documents }) => {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

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

  const handleView = (doc: Document) => {
    setSelectedDoc(doc);
    setIsViewerOpen(true);
  };

  if (documents.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card py-24 flex flex-col items-center justify-center text-center bg-slate-50/50 border-dashed border-2"
      >
        <div className="w-20 h-20 bg-brand-blue-light text-brand-blue rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Upload size={40} />
        </div>
        <h3 className="text-2xl font-bold text-text-primary">Your library is empty</h3>
        <p className="text-text-secondary mt-2 max-w-xs mx-auto">
          Upload your first PDF document to start using SWS AI document intelligence.
        </p>
        <div className="mt-8 flex items-center gap-2 text-brand-blue font-bold animate-bounce">
          <Upload size={20} />
          <span>Upload now →</span>
        </div>
      </motion.div>
    );
  }

  return (
    <>
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
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence initial={false}>
                {documents.map((doc) => {
                  const status = statusConfig[doc.status] || statusConfig.complete;
                  return (
                    <motion.tr
                      key={doc.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="hover:bg-slate-50/50 even:bg-slate-50/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-brand-blue-light rounded-lg text-brand-blue">
                            <FileText size={18} />
                          </div>
                          <button
                            onClick={() => handleView(doc)}
                            className="font-medium text-text-primary max-w-[200px] truncate hover:text-brand-blue transition-colors cursor-pointer text-left"
                            title="Click to view"
                          >
                            {doc.name}
                          </button>
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
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${status.bg} ${status.text} ${status.border}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleView(doc)}
                            className="p-2 text-brand-blue hover:bg-brand-blue-light rounded-lg transition-colors inline-flex items-center gap-1 text-sm font-medium"
                            title="View & Analyze"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleDownload(doc.id)}
                            className="p-2 text-slate-500 hover:text-brand-blue hover:bg-brand-blue-light rounded-lg transition-colors inline-flex items-center gap-2"
                            title="Download"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <PDFViewerModal
        document={selectedDoc}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </>
  );
};
