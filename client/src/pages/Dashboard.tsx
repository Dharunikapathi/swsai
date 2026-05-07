import React, { useState, useCallback, useEffect } from 'react';
import { UploadZone } from '../components/UploadZone';
import { FileProgressCard } from '../components/FileProgressCard';
import { DocumentTable } from '../components/DocumentTable';
import { ToastBanner } from '../components/ToastBanner';
import { TableSkeleton } from '../components/LoadingSkeleton';
import api from '../api/client';
import { useWebSocket } from '../hooks/useWebSocket';

interface UploadingFile {
  id: string; 
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'failed';
}

export const Dashboard: React.FC = () => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const onMessage = useCallback((data: any) => {
    if (data.event === 'file_progress') {
      setUploadingFiles(prev => prev.map(f => 
        f.file.name === data.name 
          ? { ...f, progress: data.percent, status: data.status }
          : f
      ));

      if (data.status === 'complete') {
        fetchDocuments();
      }
    } else if (data.event === 'bulk_complete') {
      setToast({
        message: `${data.fileCount} files uploaded successfully — ${new Date(data.timestamp).toLocaleTimeString()}`,
        type: 'success',
        visible: true
      });
      fetchDocuments();
      
      // Auto-dismiss after 8s
      setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 8000);
    }
  }, [fetchDocuments]);

  useWebSocket(onMessage);

  const handleFilesSelected = async (files: File[]) => {
    const isBulk = files.length > 3;

    if (isBulk) {
      setToast({
        message: `Upload in progress — processing ${files.length} files in background.`,
        type: 'info',
        visible: true
      });
    }

    const newFiles: UploadingFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending'
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);

    // Grouping files for parallel upload or sequential as per need
    // For this prototype, we send them all in one request if possible, 
    // but the backend expects `upload.array('files')`.
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    setUploadingFiles(prev => prev.map(uf => 
      newFiles.some(nf => nf.id === uf.id) ? { ...uf, status: 'uploading' } : uf
    ));

    try {
      await api.post('/documents', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadingFiles(prev => prev.map(uf => 
            newFiles.some(nf => nf.id === uf.id) ? { ...uf, progress: percentCompleted } : uf
          ));
        }
      });
    } catch (error) {
      setUploadingFiles(prev => prev.map(uf => 
        newFiles.some(nf => nf.id === uf.id) ? { ...uf, status: 'failed' } : uf
      ));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 relative">
      <ToastBanner 
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onDismiss={() => setToast(prev => ({ ...prev, visible: false }))}
      />

      <header className="mb-12">
        <h1 className="text-4xl font-bold text-text-primary mb-2">Document Management</h1>
        <p className="text-text-secondary">Upload, manage and track your PDF documents in real-time.</p>
      </header>

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
