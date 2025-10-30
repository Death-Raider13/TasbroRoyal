// ImageKit.io service - Cloudinary alternative
// Get ImageKit configuration
const getImageKitConfig = () => {
  // Temporary hardcoded values for testing - replace with env vars once they load
  const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || 'public_pH9PXKs1K49moY/6kuypoGNv3zc=';
  const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/12345678point/';
  
  console.log('🔧 ImageKit Config:', { publicKey: publicKey?.substring(0, 20) + '...', urlEndpoint });
  
  if (!publicKey || !urlEndpoint) {
    throw new Error('ImageKit configuration missing. Please check your environment variables.');
  }
  
  return { publicKey, urlEndpoint };
};

// Determine file type
const getFileType = (file) => {
  const fileType = file.type.toLowerCase();
  
  if (fileType.startsWith('image/')) return 'image';
  if (fileType.startsWith('video/')) return 'video';
  return 'file'; // For documents, PDFs, etc.
};

// Generate authentication parameters for uploads
const getAuthParams = async () => {
  try {
    // In production, this should call your backend endpoint
    // For now, we'll use client-side upload (less secure but works)
    const response = await fetch('/api/imagekit-auth');
    if (!response.ok) {
      throw new Error('Failed to get auth params');
    }
    return await response.json();
  } catch (error) {
    // Fallback to client-side upload (for development)
    console.warn('Using client-side upload. Implement server-side auth for production.');
    return {
      signature: '',
      expire: Date.now() + 3600000, // 1 hour
      token: ''
    };
  }
};

// Generic upload function for all file types
export const uploadToImageKit = async (file, onProgress, folder = '') => {
  const { publicKey, urlEndpoint } = getImageKitConfig();
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('publicKey', publicKey);
  formData.append('fileName', file.name);
  
  // Add folder if specified
  if (folder) {
    formData.append('folder', folder);
  }
  
  // Add tags for organization
  formData.append('tags', 'naijaedu,course-content');
  
  try {
    // Get auth params (for server-side auth)
    const authParams = await getAuthParams();
    if (authParams.signature) {
      formData.append('signature', authParams.signature);
      formData.append('expire', authParams.expire);
      formData.append('token', authParams.token);
    }
  } catch (error) {
    console.warn('Auth params not available, using client-side upload');
  }
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(percentComplete);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve({
          url: response.url,
          fileId: response.fileId,
          name: response.name,
          filePath: response.filePath,
          size: response.size,
          fileType: response.fileType,
          width: response.width,
          height: response.height,
          thumbnailUrl: response.thumbnailUrl
        });
      } else {
        const errorResponse = JSON.parse(xhr.responseText);
        reject(new Error(errorResponse.message || `Upload failed with status: ${xhr.status}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });
    
    xhr.open('POST', 'https://upload.imagekit.io/api/v1/files/upload');
    xhr.send(formData);
  });
};

// Specific upload functions for different use cases
export const uploadVideoToImageKit = async (file, onProgress) => {
  return uploadToImageKit(file, onProgress, '/course-videos');
};

export const uploadImageToImageKit = async (file, onProgress) => {
  return uploadToImageKit(file, onProgress, '/course-images');
};

export const uploadProfileImageToImageKit = async (file, onProgress) => {
  return uploadToImageKit(file, onProgress, '/profile-images');
};

export const uploadDocumentToImageKit = async (file, onProgress) => {
  return uploadToImageKit(file, onProgress, '/course-documents');
};

// Delete file from ImageKit
export const deleteFromImageKit = async (fileId) => {
  try {
    // This requires server-side implementation with private key
    const response = await fetch('/api/imagekit-delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileId })
    });
    
    if (!response.ok) {
      throw new Error('Delete failed');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting from ImageKit:', error);
    return false;
  }
};

// Generate optimized URLs for different use cases
export const getOptimizedImageUrl = (filePath, options = {}) => {
  const { urlEndpoint } = getImageKitConfig();
  const {
    width,
    height,
    crop = 'maintain_ratio',
    quality = 80,
    format = 'auto'
  } = options;
  
  let transformations = [];
  
  if (width) transformations.push(`w-${width}`);
  if (height) transformations.push(`h-${height}`);
  if (crop) transformations.push(`c-${crop}`);
  if (quality) transformations.push(`q-${quality}`);
  if (format) transformations.push(`f-${format}`);
  
  const transformString = transformations.length > 0 ? `tr:${transformations.join(',')}` : '';
  
  return `${urlEndpoint}/${transformString}${filePath}`;
};

// Generate different image sizes for responsive design
export const getResponsiveImageUrls = (filePath) => {
  return {
    thumbnail: getOptimizedImageUrl(filePath, { width: 150, height: 150, crop: 'force' }),
    small: getOptimizedImageUrl(filePath, { width: 300, height: 200 }),
    medium: getOptimizedImageUrl(filePath, { width: 600, height: 400 }),
    large: getOptimizedImageUrl(filePath, { width: 1200, height: 800 }),
    original: `${getImageKitConfig().urlEndpoint}${filePath}`
  };
};

// Get video thumbnail
export const getVideoThumbnail = (filePath, options = {}) => {
  const {
    width = 400,
    height = 300,
    crop = 'force'
  } = options;
  
  return getOptimizedImageUrl(filePath, { 
    width, 
    height, 
    crop,
    format: 'jpg'
  });
};

// Batch upload multiple files
export const uploadMultipleFiles = async (files, onProgress, folder = '') => {
  const uploads = [];
  let completedUploads = 0;

  for (const file of files) {
    const upload = uploadToImageKit(file, (progress) => {
      // Calculate overall progress
      const overallProgress = ((completedUploads / files.length) * 100) + (progress / files.length);
      if (onProgress) onProgress(overallProgress);
    }, folder);

    upload.then(() => {
      completedUploads++;
    });

    uploads.push(upload);
  }

  return Promise.all(uploads);
};

export default {
  uploadVideoToImageKit,
  uploadImageToImageKit,
  uploadProfileImageToImageKit,
  uploadDocumentToImageKit,
  uploadToImageKit,
  deleteFromImageKit,
  getOptimizedImageUrl,
  getResponsiveImageUrls,
  getVideoThumbnail,
  uploadMultipleFiles
};
