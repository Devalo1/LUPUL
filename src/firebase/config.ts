import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { logger } from '../utils/debug';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZEWoZn-c7NSH1AGbetWEbtxwEz-iaMR4",
  authDomain: "lupulcorbul.firebaseapp.com",
  projectId: "lupulcorbul",
  storageBucket: "lupulcorbul.appspot.com", // Fixed the storage bucket URL
  messagingSenderId: "312943074536",
  appId: "1:312943074536:web:13fc0660014bc58c5c7d5d",
  measurementId: "G-38YSZKVXDC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let analytics = null;

// Initialize analytics if supported
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
    logger.info('Firebase Analytics initialized successfully');
  } else {
    logger.info('Firebase Analytics not supported in this environment');
  }
});

logger.info('Firebase initialized successfully');

export { app, auth, db, storage, analytics };
