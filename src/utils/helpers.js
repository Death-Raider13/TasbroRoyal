import { format } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Naira
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(date, formatStr = 'MMM dd, yyyy') {
  if (!date) return '';
  const dateObj = date?.toDate ? date.toDate() : new Date(date);
  return format(dateObj, formatStr);
}

/**
 * Format duration in seconds to readable format
 */
export function formatDuration(seconds) {
  if (!seconds) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format duration in seconds to human readable
 */
export function formatDurationHuman(seconds) {
  if (!seconds) return '0 minutes';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} minutes`;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(completed, total) {
  if (!total || total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Truncate text
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Validate email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Nigerian format)
 */
export function isValidNigerianPhone(phone) {
  // Accepts formats: +234XXXXXXXXXX, 234XXXXXXXXXX, 0XXXXXXXXXX
  const phoneRegex = /^(\+?234|0)[789]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.startsWith('+234')) {
    return cleaned;
  }
  if (cleaned.startsWith('234')) {
    return '+' + cleaned;
  }
  if (cleaned.startsWith('0')) {
    return '+234' + cleaned.substring(1);
  }
  return phone;
}

/**
 * Generate random ID
 */
export function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if file type is allowed
 */
export function isAllowedFileType(file, allowedTypes) {
  return allowedTypes.includes(file.type);
}

/**
 * Calculate commission
 */
export function calculateCommission(amount, rate = 0.75) {
  return Math.round(amount * rate);
}

/**
 * Get status color
 */
export function getStatusColor(status) {
  const colors = {
    approved: 'bg-green-100 text-green-600',
    pending: 'bg-yellow-100 text-yellow-600',
    pending_review: 'bg-yellow-100 text-yellow-600',
    rejected: 'bg-red-100 text-red-600',
    draft: 'bg-gray-100 text-gray-600',
    completed: 'bg-green-100 text-green-600',
    failed: 'bg-red-100 text-red-600'
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role) {
  const colors = {
    admin: 'bg-purple-100 text-purple-600',
    lecturer: 'bg-blue-100 text-blue-600',
    student: 'bg-green-100 text-green-600'
  };
  return colors[role] || 'bg-gray-100 text-gray-600';
}

/**
 * Sort array by key
 */
export function sortBy(array, key, order = 'asc') {
  return [...array].sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1;
    }
    return a[key] < b[key] ? 1 : -1;
  });
}

/**
 * Group array by key
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    (result[item[key]] = result[item[key]] || []).push(item);
    return result;
  }, {});
}

/**
 * Check if user has completed course
 */
export function hasCompletedCourse(enrollment) {
  return enrollment?.progress === 100;
}

/**
 * Get greeting based on time
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Download file
 */
export function downloadFile(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Share content (Web Share API)
 */
export async function shareContent(data) {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (err) {
      console.error('Error sharing:', err);
      return false;
    }
  }
  return false;
}

/**
 * Get error message from Firebase error
 */
export function getFirebaseErrorMessage(error) {
  const errorMessages = {
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'Email already in use',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/invalid-email': 'Invalid email address',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
    'permission-denied': 'You do not have permission to perform this action',
    'not-found': 'Resource not found',
    'already-exists': 'Resource already exists'
  };
  
  return errorMessages[error.code] || error.message || 'An error occurred';
}

/**
 * Validate file size
 */
export function validateFileSize(file, maxSize) {
  return file.size <= maxSize;
}

/**
 * Get video thumbnail from URL
 */
export function getVideoThumbnail(videoUrl) {
  // For Cloudinary videos, you can get thumbnail by modifying URL
  if (videoUrl.includes('cloudinary.com')) {
    return videoUrl.replace('/video/', '/video/so_0/').replace(/\.\w+$/, '.jpg');
  }
  return null;
}
