import { create } from 'zustand';
import { auth, db } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { handleError } from '../utils/errorMessages';

const useAuthStore = create((set, get) => {
  let unsubscribe = null;
  
  return {
    user: null,
    userData: null,
    loading: true,
    initialized: false,
    
    login: async (email, password) => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        const userData = { ...userDoc.data(), uid: userCredential.user.uid };
        set({ user: userCredential.user, userData });
        return userData;
      } catch (error) {
        const errorMessage = handleError(error, 'Login');
        throw new Error(errorMessage);
      }
    },
    
    signup: async (email, password, userData) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = {
          ...userData,
          uid: userCredential.user.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
        set({ user: userCredential.user, userData: newUser });
        return newUser;
      } catch (error) {
        const errorMessage = handleError(error, 'Signup');
        throw new Error(errorMessage);
      }
    },
    
    logout: async () => {
      try {
        await signOut(auth);
        set({ user: null, userData: null });
      } catch (error) {
        const errorMessage = handleError(error, 'Logout');
        throw new Error(errorMessage);
      }
    },
    
    initAuth: () => {
      return new Promise((resolve) => {
        const { initialized } = get();
        
        // Prevent multiple initializations
        if (initialized) {
          resolve();
          return;
        }
        
        // Clean up previous listener if exists
        if (unsubscribe) {
          unsubscribe();
        }
        
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          try {
            if (user) {
              // Wait a bit for auth to fully initialize
              await new Promise(resolve => setTimeout(resolve, 100));
              
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              const userData = userDoc.exists() ? userDoc.data() : null;
              // Include uid in userData for easier access
              set({ 
                user, 
                userData: { ...userData, uid: user.uid }, 
                loading: false, 
                initialized: true 
              });
            } else {
              set({ 
                user: null, 
                userData: null, 
                loading: false, 
                initialized: true 
              });
            }
            resolve();
          } catch (error) {
            handleError(error, 'Auth State Change');
            set({ 
              user: null, 
              userData: null, 
              loading: false, 
              initialized: true 
            });
            resolve();
          }
        });
      });
    }
  };
});

export default useAuthStore;
