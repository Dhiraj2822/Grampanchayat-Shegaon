import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { FILE_UPLOAD_CONFIG, formatFileSize, useFileUpload } from '../lib/fileUpload';
import { useAuth } from '../contexts/AuthContext';

interface FileUploadProps {
  onFileUploaded: (filePath: string) => void;
  uploadType: 'citizen_docs' | 'signed_certificates' | 'complaint_photos';
  isMarathi?: boolean;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileUploaded, 
  uploadType, 
  isMarathi = false,
  label,
  required = false,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useFileUpload(isMarathi);
  const { user } = useAuth();

  // Configuration based on upload type
  const getUploadConfig = () => {
    switch (uploadType) {
      case 'citizen_docs':
        return {
          maxSize: FILE_UPLOAD_CONFIG.MAX_SIZES.CITIZEN_DOCS,
          allowedTypes: FILE_UPLOAD_CONFIG.ALLOWED_TYPES.DOCUMENTS,
          bucket: FILE_UPLOAD_CONFIG.BUCKETS.CITIZEN_UPLOADS,
          folder: 'documents' // Will be prefixed with user ID in upload function
        };
      case 'signed_certificates':
        return {
          maxSize: FILE_UPLOAD_CONFIG.MAX_SIZES.SIGNED_CERTIFICATES,
          allowedTypes: FILE_UPLOAD_CONFIG.ALLOWED_TYPES.CERTIFICATES,
          bucket: FILE_UPLOAD_CONFIG.BUCKETS.OFFICIAL_DOCS,
          folder: FILE_UPLOAD_CONFIG.FOLDERS.CERTIFICATES
        };
      case 'complaint_photos':
        return {
          maxSize: FILE_UPLOAD_CONFIG.MAX_SIZES.COMPLAINT_PHOTOS,
          allowedTypes: FILE_UPLOAD_CONFIG.ALLOWED_TYPES.IMAGES,
          bucket: FILE_UPLOAD_CONFIG.BUCKETS.CITIZEN_UPLOADS,
          folder: 'complaints' // Will be prefixed with user ID in upload function
        };
    }
  };

  const config = getUploadConfig();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    try {
      const result = await uploadFile(file, config.bucket, config.folder, {
        maxSize: config.maxSize,
        allowedTypes: config.allowedTypes
      }, user?.id); // Pass user ID for folder isolation

      if (result.success && result.path) {
        setUploadedFile(file.name);
        // Convert storage path to public URL
        try {
          const { supabase } = await import('../lib/supabase');
          const { data: publicData } = supabase.storage.from(config.bucket).getPublicUrl(result.path);
          if (publicData && publicData.publicUrl) {
            onFileUploaded(publicData.publicUrl);
          } else {
            // Fallback to returning storage path
            onFileUploaded(result.path);
          }
        } catch {
          onFileUploaded(result.path);
        }
      } else {
        setError(result.error || (isMarathi ? 'अपलोड में त्रुटि' : 'Upload error'));
      }
    } catch {
      setError(isMarathi ? 'अपलोड में त्रुटि' : 'Upload error');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileUploaded(''); // Clear the uploaded file path
  };

  const getFileSizeLimit = () => {
    return formatFileSize(config.maxSize);
  };

  const getAcceptedTypes = () => {
    return config.allowedTypes.map(type => {
      switch (type) {
        case 'application/pdf': return 'PDF';
        case 'image/jpeg':
        case 'image/jpg': return 'JPG';
        case 'image/png': return 'PNG';
        default: return type;
      }
    }).join(', ');
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-400 transition-colors">
        {!uploadedFile ? (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || disabled}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isMarathi ? 'अपलोड हो रहा है...' : 'Uploading...'}
                    </div>
                  ) : (
                    isMarathi ? 'फाइल चुनें' : 'Choose File'
                  )}
                </button>
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  {isMarathi ? 'अधिकतम आकार: ' : 'Max size: '}{getFileSizeLimit()}
                </p>
                <p>
                  {isMarathi ? 'स्वीकृत प्रारूप: ' : 'Accepted formats: '}{getAcceptedTypes()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-green-50 p-3 rounded-md">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800">{uploadedFile}</p>
                <p className="text-xs text-green-600">
                  {isMarathi ? 'सफलतापूर्वक अपलोड हुआ' : 'Successfully uploaded'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="text-red-500 hover:text-red-700 p-1"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center text-red-600 text-sm mt-2">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={config.allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading || disabled}
      />
    </div>
  );
};

export default FileUpload;