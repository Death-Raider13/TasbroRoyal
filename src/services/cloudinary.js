// Get Cloudinary configuration
const getCloudinaryConfig = () => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  
  if (!cloudName || !uploadPreset) {
    console.error('❌ Cloudinary configuration missing');
    console.error('Required environment variables:');
    console.error('- VITE_CLOUDINARY_CLOUD_NAME:', cloudName ? '✅' : '❌');
    console.error('- VITE_CLOUDINARY_UPLOAD_PRESET:', uploadPreset ? '✅' : '❌');
    throw new Error('Cloudinary configuration missing. Please check your environment variables.');
  }
  
  // Only log in development
  if (import.meta.env.DEV) {
    console.log('🌤️ Cloudinary Config Loaded:', { cloudName, uploadPreset });
  }
  
  return { cloudName, uploadPreset };
};

// Determine resource type based on file
const getResourceType = (file) => {
  const fileType = file.type.toLowerCase();
  
  if (fileType.startsWith('video/')) return 'video';
  if (fileType.startsWith('image/')) return 'image';
  return 'raw'; // For documents, PDFs, etc.
};

// Generic upload function for all file types
export const uploadToCloudinary = async (file, onProgress, folder = '') => {
  const { cloudName, uploadPreset } = getCloudinaryConfig();
  const resourceType = getResourceType(file);
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('resource_type', resourceType);
  
  // Add additional parameters for better compatibility
  formData.append('api_key', import.meta.env.VITE_CLOUDINARY_API_KEY || '');
  formData.append('timestamp', Math.round(Date.now() / 1000));
  
  // Add folder if specified
  if (folder) {
    formData.append('folder', folder);
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
          url: response.secure_url,
          publicId: response.public_id,
          resourceType: response.resource_type,
          format: response.format,
          bytes: response.bytes,
          duration: response.duration, // For videos
          width: response.width, // For images/videos
          height: response.height, // For images/videos
          originalFilename: response.original_filename
        });
      } else {
        reject(new Error(`Upload failed with status: ${xhr.status}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });
    
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`);
    xhr.send(formData);
  });
};

// Specific upload functions for different use cases
export const uploadVideoToCloudinary = async (file, onProgress) => {
  return uploadToCloudinary(file, onProgress, 'course-videos');
};

export const uploadImageToCloudinary = async (file, onProgress) => {
  return uploadToCloudinary(file, onProgress, 'course-images');
};

export const uploadProfileImageToCloudinary = async (file, onProgress) => {
  return uploadToCloudinary(file, onProgress, 'profile-images');
};

export const uploadDocumentToCloudinary = async (file, onProgress) => {
  return uploadToCloudinary(file, onProgress, 'course-documents');
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  const { cloudName } = getCloudinaryConfig();
  
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_id: publicId,
        upload_preset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      })
    });
    
    const result = await response.json();
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

// Generate optimized URLs for different use cases
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const { cloudName } = getCloudinaryConfig();
  const {
    width = 'auto',
    height = 'auto',
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${height},c_${crop},q_${quality},f_${format}/${publicId}`;
};

export const getVideoThumbnail = (publicId, options = {}) => {
  const { cloudName } = getCloudinaryConfig();
  const {
    width = 400,
    height = 300,
    crop = 'fill',
    quality = 'auto'
  } = options;
  
  return `https://res.cloudinary.com/${cloudName}/video/upload/w_${width},h_${height},c_${crop},q_${quality},so_auto/${publicId}.jpg`;
};

// Generate different image sizes for responsive design
export const getResponsiveImageUrls = (publicId) => {
  const { cloudName } = getCloudinaryConfig();
  
  return {
    thumbnail: getOptimizedImageUrl(publicId, { width: 150, height: 150 }),
    small: getOptimizedImageUrl(publicId, { width: 300, height: 200 }),
    medium: getOptimizedImageUrl(publicId, { width: 600, height: 400 }),
    large: getOptimizedImageUrl(publicId, { width: 1200, height: 800 }),
    original: `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`
  };
};
