import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, connectAuthEmulator } from "firebase/auth";
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
} from "firebase/firestore";
import { 
  getStorage, 
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
  deleteObject,
  listAll,
  connectStorageEmulator
} from "firebase/storage";
import { 
  getFunctions, 
  connectFunctionsEmulator, 
  httpsCallable 
} from "firebase/functions";
import { 
  getAnalytics, 
  Analytics,
  logEvent
} from "firebase/analytics";

import { useEmulators } from "./utils/environment";
import logger from "./utils/logger";

// Importăm API-urile Firebase pentru a le re-exporta
import * as firebaseAuth from "firebase/auth";
import * as firebaseFirestore from "firebase/firestore";
import * as firebaseFunctions from "firebase/functions";
import * as firebaseStorage from "firebase/storage";
import * as firebaseAnalytics from "firebase/analytics";

// Indicator pentru a verifica dacă Firebase a fost inițializat
export let isInitialized = false;

// Configurație Firebase corectată
const firebaseConfig = {
  apiKey: "AIzaSyCZEWoZn-c7NSH1AGbetWEbtxwEz-iaMR4",
  authDomain: "lupulcorbul.firebaseapp.com",
  projectId: "lupulcorbul",
  storageBucket: "lupulcorbul.firebasestorage.app", // Revenire la numele corect al bucket-ului
  messagingSenderId: "312943074536",
  appId: "1:312943074536:web:13fc0660014bc58c5c7d5d",
  measurementId: "G-38YSZKVXDC"
};

// Funcția de inițializare a Firebase care poate fi apelată explicit
export function initializeFirebase() {
  if (isInitialized) {
    logger.info("Firebase este deja inițializat");
    return;
  }
  
  // Setăm flagul de inițializare
  isInitialized = true;
  
  logger.info("Firebase a fost inițializat cu succes");
  return app;
}

// Inițializare Firebase
const app = initializeApp(firebaseConfig);
isInitialized = true; // Marcăm ca inițializat după apelul initializeApp
const auth = getAuth(app);
const firestore = getFirestore(app);
const db = firestore; // Alias pentru compatibilitate
const storage = getStorage(app);
const functions = getFunctions(app);

// Inițializează Analytics doar în browser și nu în SSR sau test
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
    url: `http://${import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST || "localhost"}:${import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_PORT || "9099"}`
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

// Add underscore prefix to unused function
const _getEmulatorConfig = () => {
  return emulatorConfig;
};

// Verificăm dacă trebuie să folosim emulatorii Firebase
if (useEmulators()) {
  logger.info("Folosim emulatorii Firebase pentru dezvoltare locală");
  
  // Conectăm Auth Emulator dacă este configurat
  if (emulatorConfig.auth) {
    try {
      connectAuthEmulator(
        auth, 
        emulatorConfig.auth.url,
        { disableWarnings: false } // Activăm avertismentele pentru debugging
      );
      logger.info(`Emulator Auth conectat: ${emulatorConfig.auth.url}`);
    } catch (error) {
      logger.error("Eroare la conectarea la emulatorul de autentificare:", error);
      // Nu blocăm inițializarea altor emulatori în cazul unei erori
    }
  }
  
  // Conectăm Firestore Emulator dacă este configurat
  if (emulatorConfig.firestore) {
    try {
      connectFirestoreEmulator(
        firestore, 
        emulatorConfig.firestore.host, 
        emulatorConfig.firestore.port
      );
      logger.info(`Emulator Firestore conectat: ${emulatorConfig.firestore.host}:${emulatorConfig.firestore.port}`);
    } catch (error) {
      logger.error("Eroare la conectarea la emulatorul Firestore:", error);
    }
  }
  
  // Conectăm Storage Emulator dacă este configurat
  if (emulatorConfig.storage) {
    try {
      connectStorageEmulator(
        storage, 
        emulatorConfig.storage.host, 
        emulatorConfig.storage.port
      );
      logger.info(`Emulator Storage conectat: ${emulatorConfig.storage.host}:${emulatorConfig.storage.port}`);
    } catch (error) {
      logger.error("Eroare la conectarea la emulatorul Storage:", error);
    }
  }
  
  // Conectăm Functions Emulator dacă este configurat
  if (emulatorConfig.functions) {
    try {
      connectFunctionsEmulator(
        functions, 
        emulatorConfig.functions.host, 
        emulatorConfig.functions.port
      );
      logger.info(`Emulator Functions conectat: ${emulatorConfig.functions.host}:${emulatorConfig.functions.port}`);
    } catch (error) {
      logger.error("Eroare la conectarea la emulatorul Functions:", error);
    }
  }
}

// Exportăm toate instanțele Firebase pentru a fi utilizate în alte părți ale aplicației
export {
  app,
  auth,
  firestore,
  db,
  storage,
  functions,
  analytics,
  // Exportăm API-urile complete pentru uz mai flexibil
  firebaseAuth as authAPI,
  firebaseFirestore as firestoreAPI,
  firebaseFunctions as functionsAPI,
  firebaseStorage as storageAPI,
  firebaseAnalytics as analyticsAPI,
  // Exportăm și funcțiile Firestore pentru compatibilitate
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
  // Exportăm și funcțiile Storage
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
  deleteObject,
  listAll,
  // Exportăm și funcțiile Auth
  GoogleAuthProvider,
  signInWithRedirect,
  // Exportăm și funcțiile Functions
  httpsCallable,
  // Exportăm și funcțiile Analytics
  logEvent
};