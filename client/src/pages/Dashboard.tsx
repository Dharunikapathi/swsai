import React, { useState, useCallback, useEffect } from 'react';
import { UploadZone } from '../components/UploadZone';
import { FileProgressCard } from '../components/FileProgressCard';
import api from '../api/client';
import { useWebSocket } from '../hooks/useWebSocket';

interface UploadingFile {
  id: string; // client-side temp id or file name
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'failed';
}

export const Dashboard: React.FC = () => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await api.get('/documents/list');
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const onMessage = useCallback((data: any) => {
    if (data.event === 'file_progress') {
      // Update progress for a specific file
      // We'll match by name since we don't have the server-side ID yet on the client for "uploading" state
      setUploadingFiles(prev => prev.map(f => 
        f.file.name === data.name 
          ? { ...f, progress: data.percent, status: data.status }
          : f
      ));

      if (data.status === 'complete') {
        fetchDocuments();
      }
    }
  }, [fetchDocuments]);

  useWebSocket(onMessage);

  const handleFilesSelected = async (files: File[]) => {
    const newFiles: UploadingFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending'
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);

    // Start uploading each file
    for (const f of newFiles) {
      const formData = new FormData();
      formData.append('files', f.file);

      setUploadingFiles(prev => prev.map(uf => 
        uf.id === f.id ? { ...uf, status: 'uploading' } : uf
      ));

      try {
        await api.post('/documents', formData, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setUploadingFiles(prev => prev.map(uf => 
              uf.id === f.id ? { ...uf, progress: percentCompleted } : uf
            ));
          }
        });
      } catch (error) {
        setUploadingFiles(prev => prev.map(uf => 
          uf.id === f.id ? { ...uf, status: 'failed' } : uf
        ));
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-text-primary mb-2">Document Management</h1>
        <p className="text-text-secondary">Upload, manage and track your PDF documents in real-time.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <UploadZone onFilesSelected={handleFilesSelected} />
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text-primary">Recent Documents</h2>
            {/* DocumentTable will go here */}
            <div className="card text-center py-12 text-text-secondary">
              <p>Document table coming soon...</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-text-primary">Upload Progress</h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
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
