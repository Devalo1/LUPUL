import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword as firebaseSignInWithEmail,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { logger } from '../utils/debug';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: "lupulcorbul.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Debug function to check if this module is loaded properly
logger.info("Firebase services initialized", { context: "Firebase" });

// Google authentication provider
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google using popup
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    logger.info('Google sign-in successful');
    return result.user;
  } catch (error) {
    logger.error('Google sign-in error:', error);
    throw error;
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const result = await firebaseSignInWithEmail(auth, email, password);
    logger.info('Email sign-in successful');
    return result.user;
  } catch (error) {
    logger.error('Email sign-in error:', error);
    throw error;
  }
};

/**
 * Register new user with email and password
 */
export const registerWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    logger.info('User registration successful');
    return result.user;
  } catch (error) {
    logger.error('Registration error:', error);
    throw error;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    logger.info('Password reset email sent');
    return true;
  } catch (error) {
    logger.error('Password reset error:', error);
    throw error;
  }
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    logger.info('User signed out successfully');
    return true;
  } catch (error) {
    logger.error('Sign-out error:', error);
    throw error;
  }
};
