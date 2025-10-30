// Unified Storage service with ImageKit.io (primary) and Cloudinary (backup)
import {
  uploadToCloudinary,
  uploadVideoToCloudinary,
  uploadImageToCloudinary,
  uploadProfileImageToCloudinary,
  uploadDocumentToCloudinary,
  deleteFromCloudinary,
  getOptimizedImageUrl as getCloudinaryImageUrl,
  getVideoThumbnail as getCloudinaryVideoThumbnail,
  getResponsiveImageUrls as getCloudinaryResponsiveUrls
} from './cloudinary.js';

import {
  uploadToImageKit,
  uploadVideoToImageKit,
  uploadImageToImageKit,
  uploadProfileImageToImageKit,
  uploadDocumentToImageKit,
  deleteFromImageKit,
  getOptimizedImageUrl as getImageKitImageUrl,
  getVideoThumbnail as getImageKitVideoThumbnail,
  getResponsiveImageUrls as getImageKitResponsiveUrls
} from './imagekit.js';

import { uploadWithFallbacks } from './simpleUpload.js';

// Storage configuration
const STORAGE_CONFIG = {
  primary: 'cloudinary', // 'imagekit' or 'cloudinary' - using cloudinary as primary since it works
  enableFallback: true, // Try backup service if primary fails
  retryAttempts: 2
};

// Check if service is available
const isImageKitAvailable = () => {
  // Temporarily return true since we have hardcoded fallback values
  const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || 'public_pH9PXKs1K49moY/6kuypoGNv3zc=';
  const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/12345678point/';
  return !!(publicKey && urlEndpoint);
};

const isCloudinaryAvailable = () => {
  return !!(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && 
           import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
};

// Unified upload with automatic fallback
const uploadWithFallback = async (file, onProgress, uploadType, folder = '') => {
  const primaryService = STORAGE_CONFIG.primary;
  const useImageKitFirst = primaryService === 'imagekit' && isImageKitAvailable();
  const useCloudinaryFirst = primaryService === 'cloudinary' && isCloudinaryAvailable();
  
  // Define upload functions for each service
  const imagekitUploaders = {
    image: uploadImageToImageKit,
    video: uploadVideoToImageKit,
    profile: uploadProfileImageToImageKit,
    document: uploadDocumentToImageKit,
    generic: uploadToImageKit
  };
  
  const cloudinaryUploaders = {
    image: uploadImageToCloudinary,
    video: uploadVideoToCloudinary,
    profile: uploadProfileImageToCloudinary,
    document: uploadDocumentToCloudinary,
    generic: uploadToCloudinary
  };
  
  // Progress tracking for fallback
  let progressCallback = onProgress;
  if (STORAGE_CONFIG.enableFallback) {
    progressCallback = (progress) => {
      // Adjust progress for potential retry (50% for first attempt, 50% for fallback)
      if (onProgress) onProgress(progress * 0.5);
    };
  }
  
  // Try primary service first
  try {
    if (useImageKitFirst) {
      console.log('📤 Uploading to ImageKit.io (primary)...');
      const uploader = imagekitUploaders[uploadType] || imagekitUploaders.generic;
      const result = await uploader(file, progressCallback, folder);
      return { ...result, service: 'imagekit', isPrimary: true };
    } else if (useCloudinaryFirst) {
      console.log('📤 Uploading to Cloudinary (primary)...');
      const uploader = cloudinaryUploaders[uploadType] || cloudinaryUploaders.generic;
      const result = await uploader(file, progressCallback, folder);
      return { ...result, service: 'cloudinary', isPrimary: true };
    }
  } catch (error) {
    console.warn(`❌ Primary service (${primaryService}) failed:`, error.message);
    
    if (!STORAGE_CONFIG.enableFallback) {
      throw error;
    }
    
    // Try fallback service
    try {
      if (primaryService === 'imagekit' && isCloudinaryAvailable()) {
        console.log('🔄 Falling back to Cloudinary...');
        const uploader = cloudinaryUploaders[uploadType] || cloudinaryUploaders.generic;
        const result = await uploader(file, (progress) => {
          if (onProgress) onProgress(50 + (progress * 0.5)); // Second half of progress
        }, folder);
        return { ...result, service: 'cloudinary', isPrimary: false };
      } else if (primaryService === 'cloudinary' && isImageKitAvailable()) {
        console.log('🔄 Falling back to ImageKit.io...');
        const uploader = imagekitUploaders[uploadType] || imagekitUploaders.generic;
        const result = await uploader(file, (progress) => {
          if (onProgress) onProgress(50 + (progress * 0.5)); // Second half of progress
        }, folder);
        return { ...result, service: 'imagekit', isPrimary: false };
      }
    } catch (fallbackError) {
      console.error('❌ Fallback service also failed:', fallbackError.message);
      
      // Try our simple upload as final fallback
      try {
        console.log('🔄 Trying simple upload fallback...');
        const result = await uploadWithFallbacks(file, (progress) => {
          if (onProgress) onProgress(75 + (progress * 0.25)); // Final quarter of progress
        });
        return { ...result, service: 'simple', isPrimary: false };
      } catch (simpleError) {
        console.error('❌ Simple upload also failed:', simpleError.message);
        throw new Error(`All upload services failed. Primary: ${error.message}, Fallback: ${fallbackError.message}, Simple: ${simpleError.message}`);
      }
    }
  }
  
  // If no primary service is available, try simple upload directly
  try {
    console.log('🔄 No primary service available, using simple upload...');
    const result = await uploadWithFallbacks(file, onProgress);
    return { ...result, service: 'simple', isPrimary: true };
  } catch (error) {
    throw new Error('No upload service available. Please check your configuration.');
  }
};

// File type validation
export const validateFile = (file, type = 'any') => {
  const maxSizes = {
    image: 10 * 1024 * 1024, // 10MB
    video: 500 * 1024 * 1024, // 500MB
    document: 50 * 1024 * 1024, // 50MB
    any: 500 * 1024 * 1024 // 500MB
  };

  const allowedTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    any: []
  };

  // Check file size
  if (file.size > maxSizes[type]) {
    throw new Error(`File size exceeds ${maxSizes[type] / (1024 * 1024)}MB limit`);
  }

  // Check file type
  if (type !== 'any' && allowedTypes[type].length > 0) {
    if (!allowedTypes[type].includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes[type].join(', ')}`);
    }
  }

  return true;
};

// Unified upload functions with automatic fallback
export const uploadCourseThumbnail = async (file, onProgress) => {
  validateFile(file, 'image');
  return uploadWithFallback(file, onProgress, 'image');
};

export const uploadCourseVideo = async (file, onProgress) => {
  validateFile(file, 'video');
  return uploadWithFallback(file, onProgress, 'video');
};

export const uploadProfileImage = async (file, onProgress) => {
  validateFile(file, 'image');
  return uploadWithFallback(file, onProgress, 'profile');
};

export const uploadCourseDocument = async (file, onProgress) => {
  validateFile(file, 'document');
  return uploadWithFallback(file, onProgress, 'document');
};

export const uploadFile = async (file, onProgress, folder = '') => {
  validateFile(file, 'any');
  return uploadWithFallback(file, onProgress, 'generic', folder);
};

// Smart delete function (tries to detect service from URL/ID)
export const deleteFile = async (identifier, resourceType = 'image') => {
  // Try to detect which service the file is from
  if (typeof identifier === 'object' && identifier.service) {
    // If we have service info from upload result
    if (identifier.service === 'imagekit') {
      return deleteFromImageKit(identifier.fileId || identifier.publicId);
    } else {
      return deleteFromCloudinary(identifier.publicId, resourceType);
    }
  }
  
  // Try both services (fallback approach)
  try {
    if (isImageKitAvailable()) {
      return await deleteFromImageKit(identifier);
    }
  } catch (error) {
    console.warn('ImageKit delete failed, trying Cloudinary...');
  }
  
  if (isCloudinaryAvailable()) {
    return deleteFromCloudinary(identifier, resourceType);
  }
  
  throw new Error('No delete service available');
};

// Smart URL generation (detects service and generates appropriate URL)
export const getImageUrl = (identifier, options = {}) => {
  // If identifier contains service info
  if (typeof identifier === 'object') {
    if (identifier.service === 'imagekit') {
      return getImageKitImageUrl(identifier.filePath || identifier.url, options);
    } else {
      return getCloudinaryImageUrl(identifier.publicId || identifier.url, options);
    }
  }
  
  // Try to detect from URL pattern
  if (typeof identifier === 'string') {
    if (identifier.includes('ik.imagekit.io')) {
      // Extract file path from ImageKit URL
      const urlParts = identifier.split('ik.imagekit.io/');
      const filePath = urlParts[1] ? '/' + urlParts[1].split('?')[0] : identifier;
      return getImageKitImageUrl(filePath, options);
    } else if (identifier.includes('cloudinary.com')) {
      // Extract public ID from Cloudinary URL
      const urlParts = identifier.split('/upload/');
      const publicId = urlParts[1] ? urlParts[1].split('.')[0] : identifier;
      return getCloudinaryImageUrl(publicId, options);
    }
  }
  
  // Default: try primary service first
  if (STORAGE_CONFIG.primary === 'imagekit' && isImageKitAvailable()) {
    return getImageKitImageUrl(identifier, options);
  } else if (isCloudinaryAvailable()) {
    return getCloudinaryImageUrl(identifier, options);
  }
  
  return identifier; // Return as-is if can't process
};

// Get video thumbnail
export const getVideoThumbnailUrl = (publicId, options = {}) => {
  return getVideoThumbnail(publicId, options);
};

// Generate different image sizes for responsive design
export const getResponsiveImageUrls = (publicId) => {
  const { cloudName } = {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  };

  return {
    thumbnail: getImageUrl(publicId, { width: 150, height: 150 }),
    small: getImageUrl(publicId, { width: 300, height: 200 }),
    medium: getImageUrl(publicId, { width: 600, height: 400 }),
    large: getImageUrl(publicId, { width: 1200, height: 800 }),
    original: `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`
  };
};

// Batch upload multiple files
export const uploadMultipleFiles = async (files, onProgress, folder = '') => {
  const uploads = [];
  let completedUploads = 0;

  for (const file of files) {
    const upload = uploadFile(file, (progress) => {
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

// Get file info from URL
export const getFileInfoFromUrl = (url) => {
  try {
    const urlParts = url.split('/');
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExtension.split('.')[0];
    const resourceType = urlParts.includes('video') ? 'video' : 
                       urlParts.includes('image') ? 'image' : 'raw';
    
    return { publicId, resourceType };
  } catch (error) {
    console.error('Error parsing Cloudinary URL:', error);
    return null;
  }
};

// Transform video for different qualities
export const getVideoUrls = (publicId) => {
  const { cloudName } = {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  };

  return {
    sd: `https://res.cloudinary.com/${cloudName}/video/upload/q_auto:low/${publicId}`,
    hd: `https://res.cloudinary.com/${cloudName}/video/upload/q_auto:good/${publicId}`,
    original: `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}`,
    thumbnail: getVideoThumbnailUrl(publicId)
  };
};

// Configuration functions
export const getStorageConfig = () => STORAGE_CONFIG;

export const setStorageConfig = (config) => {
  Object.assign(STORAGE_CONFIG, config);
};

export const switchPrimaryService = (service) => {
  if (service === 'imagekit' || service === 'cloudinary') {
    STORAGE_CONFIG.primary = service;
    console.log(`🔄 Switched primary storage service to: ${service}`);
  } else {
    throw new Error('Invalid service. Use "imagekit" or "cloudinary"');
  }
};

export const getServiceStatus = () => {
  return {
    imagekit: {
      available: isImageKitAvailable(),
      configured: !!(import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY && 
                    import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT)
    },
    cloudinary: {
      available: isCloudinaryAvailable(),
      configured: !!(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && 
                    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
    },
    primary: STORAGE_CONFIG.primary,
    fallbackEnabled: STORAGE_CONFIG.enableFallback
  };
};

// Test upload function
export const testUpload = async (testFile = null) => {
  const status = getServiceStatus();
  console.log('🔍 Storage Service Status:', status);
  
  if (!testFile) {
    // Create a small test file
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#4F46E5';
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('TEST', 30, 55);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], 'test-image.png', { type: 'image/png' });
        resolve(uploadFile(file, (progress) => {
          console.log(`Test upload progress: ${progress}%`);
        }, 'test-uploads'));
      });
    });
  }
  
  return uploadFile(testFile, (progress) => {
    console.log(`Test upload progress: ${progress}%`);
  }, 'test-uploads');
};

export default {
  // Upload functions
  uploadCourseThumbnail,
  uploadCourseVideo,
  uploadProfileImage,
  uploadCourseDocument,
  uploadFile,
  uploadMultipleFiles,
  
  // URL generation
  getImageUrl,
  getVideoThumbnailUrl,
  getResponsiveImageUrls,
  getVideoUrls,
  
  // File management
  deleteFile,
  validateFile,
  getFileInfoFromUrl,
  
  // Configuration
  getStorageConfig,
  setStorageConfig,
  switchPrimaryService,
  getServiceStatus,
  testUpload
};
