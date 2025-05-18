'use client';

import { useState } from 'react';

interface UploadResult {
  success: boolean;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath?: string;
  publicUrl?: string;
}

export default function FileUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0] as File);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }
      
      setUploadResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="p-4 bg-slate-800 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4">Upload File</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="file" className="block text-sm font-medium">
            Select a file
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="w-full text-sm border border-slate-600 rounded-md bg-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <button
          type="submit"
          disabled={uploading || !file}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            uploading || !file
              ? 'bg-purple-700 opacity-50 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-900 text-white rounded-md">
          {error}
        </div>
      )}
      
      {uploadResult && (
        <div className="mt-4 p-3 bg-green-900 text-white rounded-md">
          <p>Upload successful!</p>
          <p className="text-sm mt-1">File: {uploadResult.fileName}</p>
          <p className="text-sm">Size: {Math.round(uploadResult.fileSize / 1024)} KB</p>
          {uploadResult.publicUrl && (
            <div className="mt-2">
              <p className="text-sm font-semibold">Supabase Storage URL:</p>
              <a 
                href={uploadResult.publicUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-300 hover:underline break-all"
              >
                {uploadResult.publicUrl}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 