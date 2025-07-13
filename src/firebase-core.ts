// Versiune compatibilă care evită TDZ dar păstrează compatibilitatea cu codul existent
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  connectAuthEmulator,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
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
  limit,
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
} from "firebase/firestore";
import {
  getStorage,
  connectStorageEmulator,
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
} from "firebase/functions";
import { getAnalytics, logEvent, Analytics } from "firebase/analytics";

import { useEmulators, getEmulatorConfig } from "./utils/environment";
import logger from "./utils/logger";

// Configurație Firebase - folosind environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lupulcorbul.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lupulcorbul", 
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lupulcorbul.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "312943074536",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:312943074536:web:13fc0660014bc58c5c7d5d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-38YSZKVXDC",
};

// Inițializare Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const db = firestore; // Alias pentru compatibilitate
const storage = getStorage(app);
const functions = getFunctions(app);
let analytics: Analytics | null = null;

// Încercăm să inițializăm analytics doar în browser
try {
  if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
  }
} catch (error) {
  logger.warn("Analytics nu a putut fi inițializat", error);
}

// Marcăm inițializarea
const isInitialized = true;

// Flag global pentru a indica inițializarea Firebase
if (typeof window !== "undefined") {
  window.__FIREBASE_INITIALIZED__ = true;
}

// Declarație pentru TypeScript
declare global {
  interface Window {
    __FIREBASE_INITIALIZED__?: boolean;
    __EMULATORS_CONNECTED__?: boolean;
  }
}

// Exportăm toate instanțele Firebase
export {
  app,
  auth,
  firestore,
  db,
  storage,
  functions,
  analytics,
  isInitialized,
};

// Exportăm API-urile pentru a fi utilizate de alte module
export const authAPI = {
  GoogleAuthProvider,
  signInWithRedirect,
  connectAuthEmulator,
  // Adăugăm toate metodele utilizate în aplicație
  getAuth,
};

export const firestoreAPI = {
  connectFirestoreEmulator,
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
  limit,
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
};

export const storageAPI = {
  connectStorageEmulator,
  getStorage,
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
  deleteObject,
  listAll,
};

export const functionsAPI = {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
};

export const analyticsAPI = {
  getAnalytics,
  logEvent,
};

// Funcția de inițializare pentru compatibilitate cu codul existent
export const initializeFirebase = () => {
  // Conectarea la emulatori dacă este necesar
  if (
    useEmulators() &&
    typeof window !== "undefined" &&
    !window.__EMULATORS_CONNECTED__
  ) {
    logger.info("Conectare la emulatorii Firebase...");

    try {
      const emulatorConfig = getEmulatorConfig();
      if (emulatorConfig) {
        // Conectăm emulatorii doar dacă avem configurații valide
        if (emulatorConfig.auth) {
          try {
            connectAuthEmulator(
              auth,
              `http://${emulatorConfig.auth.host}:${emulatorConfig.auth.port}`,
              { disableWarnings: true }
            );
            logger.info("Auth emulator connected successfully");
          } catch (e) {
            logger.error("Eroare la conectarea emulatorului Auth:", e);
          }
        }

        if (emulatorConfig.firestore) {
          try {
            connectFirestoreEmulator(
              firestore,
              emulatorConfig.firestore.host,
              emulatorConfig.firestore.port
            );
            logger.info("Firestore emulator connected successfully");
          } catch (e) {
            logger.error("Eroare la conectarea emulatorului Firestore:", e);
          }
        }

        if (emulatorConfig.storage) {
          try {
            connectStorageEmulator(
              storage,
              emulatorConfig.storage.host,
              emulatorConfig.storage.port
            );
            logger.info("Storage emulator connected successfully");
          } catch (e) {
            logger.error("Eroare la conectarea emulatorului Storage:", e);
          }
        }

        if (emulatorConfig.functions) {
          try {
            connectFunctionsEmulator(
              functions,
              emulatorConfig.functions.host,
              emulatorConfig.functions.port
            );
            logger.info("Functions emulator connected successfully");
          } catch (e) {
            logger.error("Eroare la conectarea emulatorului Functions:", e);
          }
        }

        // Marcăm emulatorii ca fiind conectați
        window.__EMULATORS_CONNECTED__ = true;
        logger.info("All emulators connected");
      }
    } catch (error) {
      logger.error("Eroare la inițializarea emulatorilor:", error);
    }
  }

  logger.info("Firebase already initialized");
  return { app, auth, firestore, storage, functions };
};
