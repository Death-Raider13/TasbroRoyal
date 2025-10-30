// Firebase connection helper utilities
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Check if Firebase is properly initialized and user is authenticated
export const checkFirebaseConnection = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve({
        isConnected: !!auth.app,
        isAuthenticated: !!user,
        user: user
      });
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      unsubscribe();
      resolve({
        isConnected: false,
        isAuthenticated: false,
        user: null
      });
    }, 5000);
  });
};

// Safe wrapper for Firestore operations
export const safeFirestoreOperation = async (operation, fallbackValue = null) => {
  try {
    const connection = await checkFirebaseConnection();
    
    if (!connection.isConnected) {
      console.warn('Firebase not connected, returning fallback value');
      return fallbackValue;
    }
    
    if (!connection.isAuthenticated) {
      console.warn('User not authenticated, returning fallback value');
      return fallbackValue;
    }
    
    return await operation();
  } catch (error) {
    console.error('Firestore operation failed:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'permission-denied') {
      console.error('🚨 PERMISSION DENIED - Firestore rules deployed successfully, but user may lack permissions');
    } else if (error.message.includes('INTERNAL ASSERTION FAILED')) {
      console.error('🚨 FIREBASE INTERNAL ERROR - Auto-recovery system will handle this');
      // The error monitoring system will catch this and attempt recovery
    }
    
    return fallbackValue;
  }
};

// Retry mechanism for failed operations
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.log(`Operation failed, retrying... (${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
};
