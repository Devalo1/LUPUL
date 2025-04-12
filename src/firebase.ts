/**
 * CENTRAL FIREBASE CONFIGURATION
 * This is the main Firebase configuration file for the entire application.
 * All Firebase services should be imported from here.
 */
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  DocumentData, 
  Unsubscribe, 
  connectFirestoreEmulator 
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZEWoZn-c7NSH1AGbetWEbtxwEz-iaMR4",
  authDomain: "lupulcorbul.firebaseapp.com",
  projectId: "lupulcorbul",
  storageBucket: "lupulcorbul.appspot.com",
  messagingSenderId: "312943074536",
  appId: "1:312943074536:web:13fc0660014bc58c5c7d5d",
  measurementId: "G-38YSZKVXDC"
};

// Initialize Firebase app (singleton pattern)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('Firebase App initialized for the first time');
} else {
  app = getApp();
  console.log('Using existing Firebase App instance');
}

// Initialize Firebase services
const authService = getAuth(app);
const firestoreService = getFirestore(app);
const storageService = getStorage(app);
const functionsService = getFunctions(app);

// Initialize analytics only in browser environment
let analyticsService = null;
if (typeof window !== 'undefined') {
  try {
    analyticsService = getAnalytics(app);
  } catch (error) {
    console.error('Analytics could not be initialized:', error);
  }
}

// Check if emulators are actually running before connecting
const checkEmulatorIsRunning = async (url: string): Promise<boolean> => {
  try {
    await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return true; // If we get here, the request didn't throw
  } catch (error) {
    console.error(`Emulator not running at ${url}`);
    return false;
  }
};

// Connect to emulators in development mode
const useEmulators = false; // Changed to false to use cloud services instead of emulators

if (process.env.NODE_ENV === 'development' && useEmulators) {
  console.log('Checking and connecting to Firebase emulators...');
  
  (async () => {
    // Check for Firestore emulator
    if (await checkEmulatorIsRunning('http://127.0.0.1:8080')) {
      try {
        connectFirestoreEmulator(firestoreService, '127.0.0.1', 8080);
        console.log('✅ Connected to Firestore emulator on port 8080');
      } catch (error) {
        console.error('❌ Error connecting to Firestore emulator:', error);
      }
    }
    
    // Check for Auth emulator
    if (await checkEmulatorIsRunning('http://127.0.0.1:9099')) {
      try {
        connectAuthEmulator(authService, 'http://127.0.0.1:9099', { disableWarnings: true });
        console.log('✅ Connected to Auth emulator on port 9099');
      } catch (error) {
        console.error('❌ Error connecting to Auth emulator:', error);
      }
    }
    
    // Check for Storage emulator
    if (await checkEmulatorIsRunning('http://127.0.0.1:9199')) {
      try {
        connectStorageEmulator(storageService, '127.0.0.1', 9199);
        console.log('✅ Connected to Storage emulator on port 9199');
      } catch (error) {
        console.error('❌ Error connecting to Storage emulator:', error);
      }
    }
    
    // Check for Functions emulator
    if (await checkEmulatorIsRunning('http://127.0.0.1:5002')) {
      try {
        connectFunctionsEmulator(functionsService, '127.0.0.1', 5002);
        console.log('✅ Connected to Functions emulator on port 5002');
      } catch (error) {
        console.error('❌ Error connecting to Functions emulator:', error);
      }
    }
  })();
}

// Utility functions for session state management
const saveSessionState = (key: string, value: any) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('SessionStorage inaccessible, falling back to localStorage');
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const restoreSessionState = (key: string): any => {
  try {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error('Error restoring session state:', e);
    return null;
  }
};

// Example usage for saving and restoring state during authentication
export const saveAuthState = (state: any) => saveSessionState('authState', state);
export const getAuthState = () => restoreSessionState('authState');

// Explicit exports with clear names to avoid conflicts
export const auth = authService;
export const firestore = firestoreService;
export const db = firestoreService; // Alias for backward compatibility
export const storage = storageService;
export const functions = functionsService;
export const analytics = analyticsService;

// Test function for Firestore connection
export const testFirestoreConnection = async () => {
  try {
    const docRef = await addDoc(collection(firestore, 'test-collection'), {
      message: 'Connection to Firestore Emulator is working!',
      timestamp: new Date(),
    });
    console.log('Document added with ID:', docRef.id);
    return true;
  } catch (error) {
    console.error('Error testing Firestore connection:', error);
    return false;
  }
};

// Firestore utility functions - each with clear documentation
/**
 * Adds a document to a collection with a timestamp
 */
export const addDocument = async (collectionName: string, data: DocumentData) => {
  const collectionRef = collection(firestore, collectionName);
  const docRef = await addDoc(collectionRef, { ...data, createdAt: new Date() });
  return docRef.id;
};

/**
 * Gets a document by ID
 */
export const getDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(firestore, collectionName, docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

/**
 * Gets all documents from a collection
 */
export const getCollection = async (collectionName: string) => {
  const collectionRef = collection(firestore, collectionName);
  const snapshot = await getDocs(collectionRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Updates a document by ID
 */
export const updateDocument = async (collectionName: string, docId: string, data: DocumentData) => {
  const docRef = doc(firestore, collectionName, docId);
  await updateDoc(docRef, { ...data, updatedAt: new Date() });
  return docId;
};

/**
 * Deletes a document by ID
 */
export const deleteDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(firestore, collectionName, docId);
  await deleteDoc(docRef);
  return docId;
};

/**
 * Subscribes to document changes
 */
export const subscribeToDocument = (
  collectionName: string,
  docId: string,
  callback: (data: DocumentData | null) => void
): Unsubscribe => {
  const docRef = doc(firestore, collectionName, docId);
  return onSnapshot(docRef, (snapshot) => {
    callback(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
  });
};

// Callable function for sending order email
export const sendOrderEmail = httpsCallable(functions, 'sendOrderEmail');
// Callable function for sending event registration email
export const sendEventRegistrationEmail = httpsCallable(functions, 'sendEventRegistrationEmail');
// Callable function for sending participant details email
export const sendParticipantDetailsEmail = httpsCallable(functions, 'sendParticipantDetailsEmail');

// Export the app as default export
export default app;
