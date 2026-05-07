import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  FileText, Calendar, HardDrive, Copy, Check,
  BookOpen, Type, Hash, AlignLeft, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/client';

// Note: CSS imports might need to be adjusted based on the version of react-pdf.
// If these cause build errors, they can be moved to index.css.
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure pdf.js worker using a standard URL pattern for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentData {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  status: string;
  uploadedAt: string;
}

interface AnalysisData {
  pageCount: number;
  wordCount: number;
  charCount: number;
  textPreview: string;
  headings: string[];
}

interface PDFViewerModalProps {
  document: DocumentData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({ document: doc, isOpen, onClose }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  useEffect(() => {
    if (isOpen && doc) {
      setPageNumber(1);
      setScale(1.0);
      setPdfLoading(true);
      setAnalysis(null);
      setAnalysisError(null);

      // Fetch analysis
      setAnalysisLoading(true);
      api.get(`/documents/${doc.id}/analyze`)
        .then(res => setAnalysis(res.data))
        .catch(() => setAnalysisError('Failed to analyze document'))
        .finally(() => setAnalysisLoading(false));
    }
  }, [isOpen, doc]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const formatSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCopyText = async () => {
    if (analysis?.textPreview) {
      await navigator.clipboard.writeText(analysis.textPreview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    complete: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    uploading: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    failed: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };

  if (!doc) return null;

  const statusStyle = statusColors[doc.status] || statusColors.complete;

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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-6 lg:inset-8 bg-white rounded-2xl shadow-2xl z-[201] flex flex-col overflow-hidden"
          >
            {/* Header with metadata strip */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
              <div className="flex items-center gap-4 min-w-0">
                <div className="p-2 bg-brand-blue-light rounded-lg text-brand-blue shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-text-primary truncate">{doc.name}</h2>
                  <div className="flex items-center gap-4 mt-0.5 text-xs text-text-secondary">
                    <span className="flex items-center gap-1"><HardDrive size={12} /> {formatSize(doc.size)}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {format(new Date(doc.uploadedAt), 'MMM d, yyyy HH:mm')}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                      {doc.status}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body: PDF viewer (left) + Analysis panel (right) */}
            <div className="flex-1 flex overflow-hidden">
              {/* LEFT — PDF Viewer (60%) */}
              <div className="w-[60%] flex flex-col bg-slate-100 border-r border-slate-200">
                {/* PDF Navigation Controls */}
                <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                      disabled={pageNumber <= 1}
                      className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm font-medium text-text-secondary min-w-[100px] text-center">
                      Page {pageNumber} of {numPages || '...'}
                    </span>
                    <button
                      onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                      disabled={pageNumber >= numPages}
                      className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                      disabled={scale <= 0.5}
                      className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    >
                      <ZoomOut size={18} />
                    </button>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={Math.round(scale * 100)}
                      onChange={e => setScale(Number(e.target.value) / 100)}
                      className="w-24 accent-brand-blue"
                    />
                    <span className="text-xs font-semibold text-text-secondary w-10 text-right">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      onClick={() => setScale(s => Math.min(2, s + 0.1))}
                      disabled={scale >= 2}
                      className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    >
                      <ZoomIn size={18} />
                    </button>
                  </div>
                </div>

                {/* PDF Document */}
                <div className="flex-1 overflow-auto flex justify-center p-4">
                  {pdfLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="space-y-4 w-[60%] max-w-md">
                        <div className="h-[600px] bg-white rounded-xl animate-pulse shadow-lg" />
                      </div>
                    </div>
                  )}
                  <Document
                    file={`${apiBase}/documents/${doc.id}/file`}
                    onLoadSuccess={({ numPages: n }) => {
                      setNumPages(n);
                      setPdfLoading(false);
                    }}
                    onLoadError={() => setPdfLoading(false)}
                    loading={null}
                    className="flex justify-center"
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      className="shadow-xl rounded-lg overflow-hidden"
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                  </Document>
                </div>
              </div>

              {/* RIGHT — Analysis Panel (40%) */}
              <div className="w-[40%] flex flex-col bg-white overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                    <BookOpen size={18} className="text-brand-blue" />
                    Document Analysis
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  {analysisLoading ? (
                    <div className="space-y-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-20 bg-slate-100 rounded-xl" />
                        </div>
                      ))}
                    </div>
                  ) : analysisError ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <AlertCircle className="text-error mb-3" size={32} />
                      <p className="text-text-secondary">{analysisError}</p>
                    </div>
                  ) : analysis ? (
                    <>
                      {/* Metric Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <MetricCard 
                          icon={<BookOpen size={18} />}
                          label="Pages" 
                          value={analysis.pageCount.toString()} 
                          color="blue"
                        />
                        <MetricCard 
                          icon={<Type size={18} />}
                          label="Words" 
                          value={analysis.wordCount.toLocaleString()} 
                          color="emerald"
                        />
                        <MetricCard 
                          icon={<Hash size={18} />}
                          label="Characters" 
                          value={analysis.charCount.toLocaleString()} 
                          color="violet"
                        />
                        <MetricCard 
                          icon={<AlignLeft size={18} />}
                          label="Headings" 
                          value={analysis.headings.length.toString()} 
                          color="amber"
                        />
                      </div>

                      {/* Detected Headings */}
                      {analysis.headings.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-text-primary mb-3">Detected Headings</h4>
                          <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                            {analysis.headings.map((h, i) => (
                              <div key={i} className="text-xs bg-slate-50 px-3 py-2 rounded-lg text-text-secondary font-medium truncate border border-slate-100">
                                {h.trim()}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Text Preview */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-bold text-text-primary">Text Preview</h4>
                          <button
                            onClick={handleCopyText}
                            className="flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:text-brand-blue-dark transition-colors"
                          >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Copied!' : 'Copy text'}
                          </button>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 text-xs text-text-secondary leading-relaxed max-h-64 overflow-y-auto custom-scrollbar border border-slate-100 font-mono">
                          {analysis.textPreview || 'No text content detected.'}
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Metric Card sub-component
const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'emerald' | 'violet' | 'amber';
}> = ({ icon, label, value, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  const iconColorMap = {
    blue: 'text-blue-500',
    emerald: 'text-emerald-500',
    violet: 'text-violet-500',
    amber: 'text-amber-500',
  };

  return (
    <div className={`rounded-xl p-4 border ${colorMap[color]}`}>
      <div className={`mb-2 ${iconColorMap[color]}`}>{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
    </div>
  );
};
