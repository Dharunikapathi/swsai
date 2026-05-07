import React, { useCallback, useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );
    
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(
        file => file.type === 'application/pdf'
      );
      if (files.length > 0) {
        onFilesSelected(files);
      }
    }
  }, [onFilesSelected]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        "relative cursor-pointer group transition-all duration-300",
        "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center gap-4",
        isDragging 
          ? "border-brand-blue bg-brand-blue-light/50" 
          : "border-slate-200 hover:border-brand-blue hover:bg-brand-blue-light/30"
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="application/pdf"
        multiple
        className="hidden"
      />
      
      <div className={cn(
        "p-4 rounded-full transition-colors",
        isDragging ? "bg-brand-blue text-white" : "bg-brand-blue-light text-brand-blue group-hover:bg-brand-blue group-hover:text-white"
      )}>
        <Upload size={32} />
      </div>

      <div className="text-center">
        <p className="text-lg font-semibold text-text-primary">
          Click to upload or drag and drop
        </p>
        <p className="text-sm text-text-secondary mt-1">
          PDF files only (max. 10MB per file)
        </p>
      </div>

      <div className="absolute inset-0 rounded-xl pointer-events-none border border-transparent group-hover:border-brand-blue/10 transition-colors" />
    </div>
  );
};
