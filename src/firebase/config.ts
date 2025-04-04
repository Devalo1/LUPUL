import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { logger } from '../utils/debug';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "test-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "test-domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "test-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "test-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "test-sender",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "test-app-id",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "test-measurement-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let analytics = null;

isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

logger.info('Firebase initialized successfully');

export { app, auth, db, storage, analytics };
