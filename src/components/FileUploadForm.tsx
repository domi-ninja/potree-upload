'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

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
      
      // Refresh the page after successful upload
      setTimeout(() => {
        router.refresh();
      }, 1500); // Small delay to show success message
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md w-full mt-10">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload File</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-row items-end gap-4">
        <label htmlFor="file" className="block text-sm font-medium text-gray-700 py-4">
            Select a file
          </label>
        <div className="flex-1">
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="w-full text-sm border border-gray-300 rounded-md bg-gray-50 px-3 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <button 
          type="submit"
          disabled={uploading || !file}
          className={`px-8 py-4 rounded-md font-medium ${
            uploading || !file
              ? 'bg-purple-700 opacity-50 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
          {error}storage
        </div>
      )}
      
      {uploadResult && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
          <p>Upload successful!</p>
        </div>
      )}
    </div>
  );
} 