/**
 * Converts Firebase error codes and technical errors into user-friendly messages
 */

export const getFirebaseErrorMessage = (error) => {
  // If error is a string, return it as is (for custom errors)
  if (typeof error === 'string') {
    return error;
  }

  // Get the error code from Firebase error object
  const errorCode = error?.code || '';
  const errorMessage = error?.message || '';

  // Firebase Authentication Errors
  const authErrors = {
    // Login/Sign in errors
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later or reset your password.',
    
    // Sign up errors
    'auth/email-already-in-use': 'An account with this email already exists. Please login instead.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
    
    // Network errors
    'auth/network-request-failed': 'Network connection failed. Please check your internet connection and try again.',
    'auth/timeout': 'Request timed out. Please check your internet connection and try again.',
    
    // Token errors
    'auth/invalid-api-key': 'Configuration error. Please contact support.',
    'auth/app-deleted': 'Application error. Please contact support.',
    'auth/invalid-user-token': 'Your session has expired. Please login again.',
    'auth/user-token-expired': 'Your session has expired. Please login again.',
    'auth/requires-recent-login': 'For security reasons, please login again to continue.',
    
    // Other auth errors
    'auth/popup-blocked': 'Pop-up was blocked by your browser. Please allow pop-ups and try again.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
    'auth/unauthorized-domain': 'This domain is not authorized. Please contact support.',
    'auth/missing-email': 'Please enter your email address.',
    'auth/internal-error': 'An unexpected error occurred. Please try again.',
  };

  // Firebase Firestore Errors
  const firestoreErrors = {
    'permission-denied': 'You do not have permission to access this resource.',
    'not-found': 'The requested resource was not found.',
    'already-exists': 'This resource already exists.',
    'resource-exhausted': 'Service quota exceeded. Please try again later.',
    'failed-precondition': 'Operation cannot be completed. Please try again.',
    'aborted': 'Operation was aborted. Please try again.',
    'out-of-range': 'Invalid input provided.',
    'unimplemented': 'This feature is not yet available.',
    'internal': 'An internal error occurred. Please try again.',
    'unavailable': 'Service is temporarily unavailable. Please try again later.',
    'data-loss': 'Data error occurred. Please contact support.',
    'unauthenticated': 'Please login to continue.',
    'deadline-exceeded': 'Request took too long. Please try again.',
  };

  // Firebase Storage Errors
  const storageErrors = {
    'storage/unknown': 'An unknown error occurred while uploading.',
    'storage/object-not-found': 'File not found.',
    'storage/bucket-not-found': 'Storage configuration error. Please contact support.',
    'storage/project-not-found': 'Storage configuration error. Please contact support.',
    'storage/quota-exceeded': 'Storage quota exceeded. Please contact support.',
    'storage/unauthenticated': 'Please login to upload files.',
    'storage/unauthorized': 'You do not have permission to upload files.',
    'storage/retry-limit-exceeded': 'Upload failed after multiple attempts. Please try again.',
    'storage/invalid-checksum': 'File upload was corrupted. Please try again.',
    'storage/canceled': 'Upload was cancelled.',
    'storage/invalid-event-name': 'Upload error. Please try again.',
    'storage/invalid-url': 'Invalid file URL.',
    'storage/invalid-argument': 'Invalid file provided.',
    'storage/no-default-bucket': 'Storage configuration error. Please contact support.',
    'storage/cannot-slice-blob': 'File upload error. Please try again.',
    'storage/server-file-wrong-size': 'File size mismatch. Please try again.',
  };

  // Check for specific error codes
  if (authErrors[errorCode]) {
    return authErrors[errorCode];
  }

  if (firestoreErrors[errorCode]) {
    return firestoreErrors[errorCode];
  }

  if (storageErrors[errorCode]) {
    return storageErrors[errorCode];
  }

  // Check for network errors in message
  if (errorMessage.toLowerCase().includes('network')) {
    return 'Network connection failed. Please check your internet connection and try again.';
  }

  if (errorMessage.toLowerCase().includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  if (errorMessage.toLowerCase().includes('cors')) {
    return 'Connection error. Please try again or contact support.';
  }

  // Default error messages
  return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
};

/**
 * Logs errors to console in development mode
 */
export const logError = (error, context = '') => {
  if (import.meta.env.DEV) {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
  }
};

/**
 * Handles errors and returns user-friendly message
 */
export const handleError = (error, context = '') => {
  logError(error, context);
  return getFirebaseErrorMessage(error);
};
