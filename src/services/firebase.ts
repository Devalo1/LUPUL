import { 
  signInWithEmailAndPassword as firebaseSignIn,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { logger } from '../utils/debug';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Import Firebase instances from the main config instead of initializing again
import { auth } from '../firebase/index';

// Debug function to check if this module is loaded properly
logger.info("Auth service initialized", { context: "Auth" });

// Add Google sign-in function
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ 
      prompt: 'select_account',
      redirect_uri: window.location.origin  // ensures correct redirect
    });
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error: unknown) {
    logger.error("Google login failed", error instanceof Error ? error : new Error(String(error)), { context: "Auth" });
    throw error;
  }
};

// Add debug interceptors for Firebase
const debugAuth = (email: string, password: string) => {
  logger.info('Attempting sign in', { data: { email } });
  return firebaseSignIn(auth, email, password);
};

// Export firebase app instance
export { app, auth };
export const signInWithEmailAndPassword = debugAuth;
