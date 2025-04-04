import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

console.log('Firebase Config:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Optional: configure Firebase emulators for local development
if (import.meta.env.VITE_USE_EMULATORS === 'false') {
  console.log('Firebase emulators are disabled.');
} else if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  import('firebase/auth').then(({ connectAuthEmulator }) => {
    connectAuthEmulator(auth, 'http://localhost:9099');
  });

  import('firebase/firestore').then(({ connectFirestoreEmulator }) => {
    connectFirestoreEmulator(firestore, 'localhost', 8080);
  });

  import('firebase/storage').then(({ connectStorageEmulator }) => {
    connectStorageEmulator(storage, 'localhost', 9199);
  });
}

// For debugging
if (import.meta.env.DEV) {
  // @ts-ignore
  window.checkFirebase = () => {
    console.log('Firebase initialized with:', {
      auth: auth ? 'Auth initialized' : 'Auth not initialized',
      firestore: firestore ? 'Firestore initialized' : 'Firestore not initialized',
      storage: storage ? 'Storage initialized' : 'Storage not initialized',
    });
  };
}

export default app;
