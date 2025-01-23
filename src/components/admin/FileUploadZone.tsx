import React, { useState, useRef } from 'react';
import { Upload, X, Music, Image } from 'lucide-react';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  type: 'songs' | 'images';
  maxSize?: number; // in MB
}

export function FileUploadZone({ 
  onFilesSelected, 
  accept = '*/*',
  multiple = true,
  type,
  maxSize = 10 // Default 10MB
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is ${maxSize}MB`);
        return false;
      }

      // Check file type
      if (type === 'songs' && !file.type.startsWith('audio/')) {
        setError(`File ${file.name} is not an audio file`);
        return false;
      }
      if (type === 'images' && !file.type.startsWith('image/')) {
        setError(`File ${file.name} is not an image file`);
        return false;
      }

      return true;
    });

    return validFiles;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(files);
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      onFilesSelected(validFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = Array.from(e.target.files || []);
    const validFiles = validateFiles(files);
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      onFilesSelected(validFiles);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging 
            ? 'border-red-500 bg-red-900/20' 
            : 'border-red-900/20 hover:border-red-500/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p className="text-gray-400">
          Drag and drop your {type} here, or click to select files
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Maximum file size: {maxSize}MB
        </p>
      </div>

      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-red-400">Selected Files:</h4>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-zinc-800 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                {type === 'songs' ? (
                  <Music className="w-4 h-4 text-red-400" />
                ) : (
                  <Image className="w-4 h-4 text-red-400" />
                )}
                <span className="text-sm truncate">{file.name}</span>
                <span className="text-xs text-gray-400">
                  ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="p-1 hover:bg-red-900/20 rounded-full"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}