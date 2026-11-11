// File Upload Utilities and Size Limits for Gram Panchayat Application
export const FILE_UPLOAD_CONFIG = {
  // File size limits in bytes
  MAX_SIZES: {
    // User document uploads (Aadhaar, PAN, etc.)
    CITIZEN_DOCS: 5 * 1024 * 1024, // 5MB
    
    // Admin uploaded signed certificates
    SIGNED_CERTIFICATES: 5 * 1024 * 1024, // 5MB
    
    // Complaint photo evidence
    COMPLAINT_PHOTOS: 3 * 1024 * 1024, // 3MB
  },
  
  // Allowed file types
  ALLOWED_TYPES: {
    DOCUMENTS: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    IMAGES: ['image/jpeg', 'image/jpg', 'image/png'],
    CERTIFICATES: ['application/pdf']
  },
  
  // Storage buckets
  BUCKETS: {
    CITIZEN_UPLOADS: 'uploads',
    OFFICIAL_DOCS: 'uploads'
  },
  
  // Folder structure for organized storage
  FOLDERS: {
    USER_DOCUMENTS: (userId: string) => `${userId}/documents`,
    COMPLAINT_PHOTOS: (userId: string) => `${userId}/complaints`,
    CERTIFICATES: 'certificates',
    ADMIN_UPLOADS: 'admin'
  }
};

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateFile = (
  file: File, 
  maxSize: number, 
  allowedTypes: string[],
  isMarathi: boolean = false
): FileValidationResult => {
  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      isValid: false,
      error: isMarathi 
        ? `फाइल साइज ${maxSizeMB}MB से कम होना चाहिए` 
        : `File size must be less than ${maxSizeMB}MB`
    };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: isMarathi 
        ? 'केवल PDF, JPG या PNG फाइल अपलोड करें' 
        : 'Only PDF, JPG or PNG files are allowed'
    };
  }
  
  return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate unique filename for storage
export const generateFileName = (originalName: string, prefix: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `${prefix}_${timestamp}_${random}.${extension}`;
};

// File upload hook for components
export const useFileUpload = (isMarathi: boolean = false) => {
  const uploadFile = async (
    file: File,
    bucketName: string,
    folder: string,
    validation: { maxSize: number; allowedTypes: string[] },
    userId?: string
  ): Promise<{ success: boolean; path?: string; error?: string }> => {
    try {
      // Validate file
      const validationResult = validateFile(
        file, 
        validation.maxSize, 
        validation.allowedTypes, 
        isMarathi
      );
      
      if (!validationResult.isValid) {
        return { success: false, error: validationResult.error };
      }
      
      // Generate unique filename
      const fileName = generateFileName(file.name, folder);
      
      // Create folder path with user isolation for citizen uploads
      let filePath: string;
      // Use user isolation for documents and complaints if userId is present
      // This logic handles the case where we use a shared 'uploads' bucket
      if (userId && (folder === 'documents' || folder === 'complaints')) {
        filePath = `${userId}/${folder}/${fileName}`;
      } else {
        filePath = `${folder}/${fileName}`;
      }
      
      // Upload to Supabase
      const { supabase } = await import('../lib/supabase');
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);
      
      if (error) {
        return { 
          success: false, 
          error: isMarathi ? 'फाइल अपलोड में त्रुटि' : 'File upload error' 
        };
      }
      
      return { success: true, path: data.path };
      
    } catch {
      return { 
        success: false, 
        error: isMarathi ? 'फाइल अपलोड में त्रुटि' : 'File upload error' 
      };
    }
  };
  
  return { uploadFile };
};

// Storage quota management
export const STORAGE_RECOMMENDATIONS = {
  CITIZEN_UPLOADS: {
    description: 'User documents (Aadhaar, PAN, Photos)',
    maxSizePerFile: '2MB',
    recommendedFormats: 'PDF, JPG, PNG',
    retention: 'Keep for legal compliance (7 years)',
    cleanup: 'Auto-delete after certificate approval + retention period'
  },
  
  OFFICIAL_DOCS: {
    description: 'Signed certificates and official documents',
    maxSizePerFile: '5MB', 
    recommendedFormats: 'PDF (preferred)',
    retention: 'Permanent (legal requirement)',
    cleanup: 'Never delete - government records'
  },
  
  COMPLAINT_PHOTOS: {
    description: 'Complaint evidence photos',
    maxSizePerFile: '3MB',
    recommendedFormats: 'JPG, PNG',
    retention: 'Keep until complaint resolution + 2 years',
    cleanup: 'Auto-delete after resolution + retention period'
  }
};

// File compression utility (optional)
export const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      const maxDim = 1920; // Max dimension for GP documents
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxDim) {
          height = (height * maxDim) / width;
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = (width * maxDim) / height;
          height = maxDim;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Compression failed'));
          }
        },
        file.type,
        0.8 // 80% quality
      );
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};