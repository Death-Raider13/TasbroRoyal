// Simple, working upload service for course thumbnails
// This uses a basic approach that should work immediately

// Convert file to base64 for simple storage
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Simple Cloudinary upload with minimal configuration
export const uploadToCloudinarySimple = async (file, onProgress) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    throw new Error('Cloudinary cloud name not configured');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ml_default'); // Use default unsigned preset
  formData.append('resource_type', 'auto');

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
          format: response.format,
          bytes: response.bytes,
          width: response.width,
          height: response.height
        });
      } else {
        console.error('Cloudinary upload failed:', xhr.responseText);
        reject(new Error(`Cloudinary upload failed with status: ${xhr.status}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during Cloudinary upload'));
    });
    
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);
    xhr.send(formData);
  });
};

// Simple ImageKit upload without authentication
export const uploadToImageKitSimple = async (file, onProgress) => {
  const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
  const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;
  
  if (!publicKey || !urlEndpoint) {
    throw new Error('ImageKit configuration missing');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('publicKey', publicKey);
  formData.append('fileName', `course_${Date.now()}_${file.name}`);
  formData.append('folder', '/course-thumbnails');

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
          size: response.size,
          width: response.width,
          height: response.height
        });
      } else {
        console.error('ImageKit upload failed:', xhr.responseText);
        const errorResponse = xhr.responseText ? JSON.parse(xhr.responseText) : {};
        reject(new Error(errorResponse.message || `ImageKit upload failed with status: ${xhr.status}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during ImageKit upload'));
    });
    
    xhr.open('POST', 'https://upload.imagekit.io/api/v1/files/upload');
    xhr.send(formData);
  });
};

// Fallback to local storage (for development/testing)
export const uploadToLocalStorage = async (file, onProgress) => {
  console.log('📁 Using local storage fallback for:', file.name);
  
  // Simulate upload progress
  for (let i = 0; i <= 100; i += 10) {
    await new Promise(resolve => setTimeout(resolve, 50));
    if (onProgress) onProgress(i);
  }
  
  const base64 = await fileToBase64(file);
  const fileName = `local_${Date.now()}_${file.name}`;
  
  // Store in localStorage for development
  localStorage.setItem(`upload_${fileName}`, base64);
  
  return {
    url: base64, // Return base64 as URL for immediate display
    publicId: fileName,
    format: file.type.split('/')[1],
    bytes: file.size,
    width: null,
    height: null,
    isLocal: true
  };
};

// Main upload function with fallbacks
export const uploadWithFallbacks = async (file, onProgress) => {
  console.log('🚀 Starting upload for:', file.name);
  
  // Try Cloudinary with default preset first
  try {
    console.log('☁️ Trying Cloudinary with default preset...');
    const result = await uploadToCloudinarySimple(file, onProgress);
    console.log('✅ Cloudinary upload successful!');
    return result;
  } catch (error) {
    console.log('❌ Cloudinary failed:', error.message);
  }
  
  // Try ImageKit without auth
  try {
    console.log('🖼️ Trying ImageKit without auth...');
    const result = await uploadToImageKitSimple(file, onProgress);
    console.log('✅ ImageKit upload successful!');
    return result;
  } catch (error) {
    console.log('❌ ImageKit failed:', error.message);
  }
  
  // Fallback to local storage
  try {
    console.log('💾 Falling back to local storage...');
    const result = await uploadToLocalStorage(file, onProgress);
    console.log('✅ Local storage fallback successful!');
    return result;
  } catch (error) {
    console.error('❌ All upload methods failed:', error);
    throw new Error('All upload services failed. Please try again.');
  }
};

export default {
  uploadWithFallbacks,
  uploadToCloudinarySimple,
  uploadToImageKitSimple,
  uploadToLocalStorage
};
