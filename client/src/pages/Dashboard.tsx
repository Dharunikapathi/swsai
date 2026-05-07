import React, { useState, useCallback, useEffect } from 'react';
import { UploadZone } from '../components/UploadZone';
import { FileProgressCard } from '../components/FileProgressCard';
import { DocumentTable } from '../components/DocumentTable';
import { ToastBanner } from '../components/ToastBanner';
import { TableSkeleton } from '../components/LoadingSkeleton';
import api from '../api/client';
import { useWS } from '../context/WSContext';
import { useNotifications } from '../hooks/useNotifications';
import { FileText, HardDrive, Bell } from 'lucide-react';

interface UploadingFile {
  id: string; 
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'failed';
}

interface Stats {
  totalDocs: number;
  totalStorage: number;
}

export const Dashboard: React.FC = () => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats>({ totalDocs: 0, totalStorage: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { unreadCount } = useNotifications();
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success'; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false
  });

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await api.get('/documents/list');
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/documents/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, [fetchDocuments, fetchStats]);

  const onMessage = useCallback((data: any) => {
    if (data.event === 'file_progress') {
      setUploadingFiles(prev => prev.map(f => 
        f.file.name === data.name 
          ? { ...f, progress: data.percent, status: data.status }
          : f
      ));

      if (data.status === 'complete') {
        fetchDocuments();
        fetchStats();
      }
    } else if (data.event === 'bulk_complete') {
      setToast({
        message: `${data.fileCount} files uploaded successfully — ${new Date(data.timestamp).toLocaleTimeString()}`,
        type: 'success',
        visible: true
      });
      fetchDocuments();
      fetchStats();
      
      // Auto-dismiss after 8s
      setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 8000);
    }
  }, [fetchDocuments, fetchStats]);

  useWS(onMessage);

  const formatSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFilesSelected = async (files: File[]) => {
    const newFiles: UploadingFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending'
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);

    // Parallel individual uploads
    files.forEach((file, i) => {
      const currentFileId = newFiles[i].id;
      const formData = new FormData();
      formData.append('files', file);

      setUploadingFiles(prev => prev.map(uf => 
        uf.id === currentFileId ? { ...uf, status: 'uploading' } : uf
      ));

      api.post('/documents', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadingFiles(prev => prev.map(uf => 
            uf.id === currentFileId ? { ...uf, progress: percentCompleted } : uf
          ));
        }
      }).catch(err => {
        console.error(`Upload failed for ${file.name}:`, err);
        setUploadingFiles(prev => prev.map(uf => 
          uf.id === currentFileId ? { ...uf, status: 'failed' } : uf
        ));
      });
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      <ToastBanner 
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onDismiss={() => setToast(prev => ({ ...prev, visible: false }))}
      />

      <header className="mb-8">
        <h1 className="text-4xl font-bold text-text-primary mb-2">Document Management</h1>
        <p className="text-text-secondary">Upload, manage and track your PDF documents in real-time.</p>
      </header>

      {/* Stats Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card flex items-center gap-4 p-6 border-l-4 border-l-brand-blue">
          <div className="p-3 bg-brand-blue-light rounded-xl text-brand-blue">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Total Documents</p>
            <p className="text-2xl font-bold text-text-primary">{stats.totalDocs}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-6 border-l-4 border-l-emerald-500">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500">
            <HardDrive size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Storage Used</p>
            <p className="text-2xl font-bold text-text-primary">{formatSize(stats.totalStorage)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-6 border-l-4 border-l-amber-500">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
            <Bell size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Unread Alerts</p>
            <p className="text-2xl font-bold text-text-primary">{unreadCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <UploadZone onFilesSelected={handleFilesSelected} />
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text-primary">Recent Documents</h2>
            {isLoading ? <TableSkeleton /> : <DocumentTable documents={documents} />}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-text-primary">Upload Progress</h2>
          <div className={`space-y-4 pr-2 custom-scrollbar overflow-y-auto ${uploadingFiles.length > 5 ? 'max-h-[400px]' : ''}`}>
            {uploadingFiles.length === 0 ? (
              <div className="text-center py-8 text-text-secondary border-2 border-dashed border-slate-200 rounded-xl">
                <p>No active uploads</p>
              </div>
            ) : (
              uploadingFiles.map(file => (
                <FileProgressCard 
                  key={file.id}
                  name={file.file.name}
                  size={file.file.size}
                  progress={file.progress}
                  status={file.status}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
