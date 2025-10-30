// Firebase recovery utilities to handle internal assertion failures
import { getApps, deleteApp, initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, terminate, clearIndexedDbPersistence } from 'firebase/firestore';
import { firebaseConfig } from '../services/firebase';

let recoveryAttempts = 0;
const MAX_RECOVERY_ATTEMPTS = 3;

// Force restart Firebase when internal errors occur
export const forceRestartFirebase = async () => {
  try {
    console.log('🔄 Attempting Firebase recovery...');
    
    // Get all existing Firebase apps
    const apps = getApps();
    
    // Terminate and delete all existing apps
    for (const app of apps) {
      try {
        const firestore = getFirestore(app);
        await terminate(firestore);
      } catch (error) {
        console.warn('Error terminating Firestore:', error);
      }
      
      try {
        await deleteApp(app);
      } catch (error) {
        console.warn('Error deleting app:', error);
      }
    }
    
    // Clear IndexedDB persistence
    try {
      await clearIndexedDbPersistence();
    } catch (error) {
      console.warn('Error clearing persistence:', error);
    }
    
    // Wait a moment before reinitializing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reinitialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✅ Firebase recovery successful');
    
    return { app, auth, db };
  } catch (error) {
    console.error('❌ Firebase recovery failed:', error);
    throw error;
  }
};

// Monitor for Firebase internal errors and auto-recover
export const setupFirebaseErrorMonitoring = () => {
  // Listen for unhandled promise rejections (Firebase internal errors)
  window.addEventListener('unhandledrejection', async (event) => {
    const error = event.reason;
    
    if (error?.message?.includes('INTERNAL ASSERTION FAILED') || 
        error?.message?.includes('Unexpected state')) {
      
      console.error('🚨 Firebase internal error detected:', error.message);
      
      if (recoveryAttempts < MAX_RECOVERY_ATTEMPTS) {
        recoveryAttempts++;
        console.log(`🔄 Attempting recovery ${recoveryAttempts}/${MAX_RECOVERY_ATTEMPTS}`);
        
        try {
          await forceRestartFirebase();
          
          // Reload the page after successful recovery
          setTimeout(() => {
            window.location.reload();
          }, 2000);
          
        } catch (recoveryError) {
          console.error('Recovery failed:', recoveryError);
        }
      } else {
        console.error('❌ Max recovery attempts reached. Manual intervention required.');
        
        // Show user-friendly error message
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
          <div style="
            position: fixed; 
            top: 20px; 
            right: 20px; 
            background: #fee; 
            border: 1px solid #fcc; 
            padding: 15px; 
            border-radius: 8px; 
            z-index: 9999;
            max-width: 300px;
            font-family: Arial, sans-serif;
          ">
            <h4 style="margin: 0 0 10px 0; color: #c33;">Firebase Connection Issue</h4>
            <p style="margin: 0 0 10px 0; font-size: 14px;">
              Please refresh the page to restore connection.
            </p>
            <button onclick="window.location.reload()" style="
              background: #007cba; 
              color: white; 
              border: none; 
              padding: 8px 16px; 
              border-radius: 4px; 
              cursor: pointer;
            ">
              Refresh Page
            </button>
          </div>
        `;
        document.body.appendChild(errorDiv);
      }
      
      // Prevent the error from propagating
      event.preventDefault();
    }
  });
  
  // Reset recovery attempts on successful operations
  const resetRecoveryAttempts = () => {
    recoveryAttempts = 0;
  };
  
  // Reset attempts every 5 minutes
  setInterval(resetRecoveryAttempts, 5 * 60 * 1000);
  
  return resetRecoveryAttempts;
};

// Safe Firebase operation wrapper with auto-recovery
export const withFirebaseRecovery = async (operation, maxRetries = 2) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if ((error?.message?.includes('INTERNAL ASSERTION FAILED') || 
           error?.message?.includes('Unexpected state')) && 
          attempt < maxRetries) {
        
        console.log(`🔄 Retrying operation after Firebase error (attempt ${attempt + 1}/${maxRetries + 1})`);
        
        try {
          await forceRestartFirebase();
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (recoveryError) {
          console.error('Recovery failed during retry:', recoveryError);
        }
      } else {
        throw error;
      }
    }
  }
};
