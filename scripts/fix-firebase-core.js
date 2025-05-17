// Fix for Firebase core.ts file
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name using ESM pattern
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const coreFilePath = join(__dirname, '..', 'src', 'firebase-core.ts');

const newCoreContent = `// filepath: d:\\LUPUL\\my-typescript-app\\src\\firebase-core.ts
// Import from our redirected Firebase modules
import { initializeApp } from "./firebase/app";
import { 
  getAuth, 
  signInWithRedirect, 
  connectAuthEmulator,
  // Renamed to avoid conflicts
  GoogleAuthProviderClass as GoogleAuthProvider
} from "./firebase/auth";

import { 
  getFirestore, 
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit as limitFn,
  startAfter,
  startAt,
  endAt,
  endBefore,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  onSnapshot,
  connectFirestoreEmulator
} from "./firebase/firestore";

import { 
  getStorage, 
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
  deleteObject,
  listAll,
  connectStorageEmulator
} from "./firebase/storage";

import { 
  getFunctions, 
  connectFunctionsEmulator, 
  httpsCallable 
} from "./firebase/functions";

import { 
  getAnalytics, 
  logEvent
} from "./firebase/analytics";

import { useEmulators } from "./utils/environment";
import logger from "./utils/logger";

// More strongly-typed Firebase API imports
import * as firebaseAuth from "./firebase/auth";
import * as firebaseFirestore from "./firebase/firestore";
import * as firebaseFunctions from "./firebase/functions";
import * as firebaseStorage from "./firebase/storage";
import * as firebaseAnalytics from "./firebase/analytics";

// Type for Analytics
type Analytics = {
  app: any;
};

// Flag to check if Firebase has been initialized
export let isInitialized = false;

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZEWoZn-c7NSH1AGbetWEbtxwEz-iaMR4",
  authDomain: "lupulcorbul.firebaseapp.com",
  projectId: "lupulcorbul",
  storageBucket: "lupulcorbul.firebasestorage.app",
  messagingSenderId: "312943074536",
  appId: "1:312943074536:web:13fc0660014bc58c5c7d5d",
  measurementId: "G-38YSZKVXDC"
};

// Function to explicitly initialize Firebase
export function initializeFirebase() {
  if (isInitialized) {
    logger.info("Firebase este deja inițializat");
    return;
  }
  
  // Set initialization flag
  isInitialized = true;
  
  logger.info("Firebase a fost inițializat cu succes");
  return app;
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
isInitialized = true; // Mark as initialized after initializeApp call
const auth = getAuth(app);
const firestore = getFirestore(app);
const db = firestore; // Alias for compatibility
const storage = getStorage(app);
const functions = getFunctions(app);

// Initialize Analytics only in browser and not in SSR or test
let analytics: Analytics | null = null;
if (typeof window !== "undefined" && import.meta.env.MODE !== "test") {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    logger.warn("Firebase Analytics nu a putut fi inițializat:", error);
  }
}

// Define a more specific emulator config structure
interface EmulatorConfig {
  auth: {
    host: string;
    port: number;
    url: string;
  };
  firestore?: {
    host: string;
    port: number;
  };
  storage?: {
    host: string;
    port: number;
  };
  functions?: {
    host: string;
    port: number;
  };
}

// Define the config object properly
const emulatorConfig: EmulatorConfig = {
  auth: {
    host: import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST || "localhost",
    port: parseInt(import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_PORT || "9099"),
    url: \`http://\${import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST || "localhost"}:\${import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_PORT || "9099"}\`
  },
  firestore: {
    host: import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST || "localhost",
    port: parseInt(import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT || "8080")
  },
  storage: {
    host: import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_HOST || "localhost",
    port: parseInt(import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_PORT || "9199")
  },
  functions: {
    host: import.meta.env.VITE_FIREBASE_FUNCTIONS_EMULATOR_HOST || "localhost",
    port: parseInt(import.meta.env.VITE_FIREBASE_FUNCTIONS_EMULATOR_PORT || "5001")
  }
};

// Check if we need to use Firebase emulators
if (useEmulators()) {
  logger.info("Folosim emulatorii Firebase pentru dezvoltare locală");
  
  // Connect Auth Emulator if configured
  if (emulatorConfig.auth) {
    try {
      connectAuthEmulator(
        auth, 
        emulatorConfig.auth.url,
        { disableWarnings: false } // Enable warnings for debugging
      );
      logger.info(\`Emulator Auth conectat: \${emulatorConfig.auth.url}\`);
    } catch (error) {
      logger.error("Eroare la conectarea la emulatorul de autentificare:", error);
      // Don't block initialization of other emulators in case of an error
    }
  }
  
  // Connect Firestore Emulator if configured
  if (emulatorConfig.firestore) {
    try {
      connectFirestoreEmulator(
        firestore, 
        emulatorConfig.firestore.host, 
        emulatorConfig.firestore.port
      );
      logger.info(\`Emulator Firestore conectat: \${emulatorConfig.firestore.host}:\${emulatorConfig.firestore.port}\`);
    } catch (error) {
      logger.error("Eroare la conectarea la emulatorul Firestore:", error);
    }
  }
  
  // Connect Storage Emulator if configured
  if (emulatorConfig.storage) {
    try {
      connectStorageEmulator(
        storage, 
        emulatorConfig.storage.host, 
        emulatorConfig.storage.port
      );
      logger.info(\`Emulator Storage conectat: \${emulatorConfig.storage.host}:\${emulatorConfig.storage.port}\`);
    } catch (error) {
      logger.error("Eroare la conectarea la emulatorul Storage:", error);
    }
  }
  
  // Connect Functions Emulator if configured
  if (emulatorConfig.functions) {
    try {
      connectFunctionsEmulator(
        functions, 
        emulatorConfig.functions.host, 
        emulatorConfig.functions.port
      );
      logger.info(\`Emulator Functions conectat: \${emulatorConfig.functions.host}:\${emulatorConfig.functions.port}\`);
    } catch (error) {
      logger.error("Eroare la conectarea la emulatorul Functions:", error);
    }
  }
}

// Export all Firebase instances to be used in other parts of the application
export {
  app,
  auth,
  firestore,
  db,
  storage,
  functions,
  analytics,
  // Export complete APIs for more flexible use
  firebaseAuth as authAPI,
  firebaseFirestore as firestoreAPI,
  firebaseFunctions as functionsAPI,
  firebaseStorage as storageAPI,
  firebaseAnalytics as analyticsAPI,
  // Export Firestore functions for compatibility
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limitFn as limit,
  startAfter,
  startAt,
  endAt,
  endBefore,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  onSnapshot,
  // Export Storage functions
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
  deleteObject,
  listAll,
  // Export Auth functions
  GoogleAuthProvider,
  signInWithRedirect,
  // Export Functions functions
  httpsCallable,
  // Export Analytics functions
  logEvent
};
`;

async function updateCoreFile() {
  try {
    await fs.writeFile(coreFilePath, newCoreContent, { encoding: 'utf8' });
    console.log('Successfully updated firebase-core.ts file.');
  } catch (error) {
    console.error('Error updating firebase-core.ts file:', error);
  }
}

updateCoreFile();
