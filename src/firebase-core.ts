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
  DocumentReference,
  CollectionReference,
  Query,
  WhereFilterOp,
  DocumentData,
  QueryConstraint,
  OrderByDirection,
  Firestore,
  SetOptions,
  WriteBatch,
  FieldValue,
  QuerySnapshot,
  DocumentSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import {
  getStorage,
  connectStorageEmulator,
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
  deleteObject,
  StorageReference,
  UploadMetadata,
  StringFormat,
  UploadResult,
  ListResult,
} from "firebase/storage";
import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
} from "firebase/functions";
import { getAnalytics, Analytics } from "firebase/analytics";

import { useEmulators, getEmulatorConfig } from "./utils/environment";
import logger from "./utils/logger";

// Validare configurație Firebase - verifică că toate valorile sunt setate și nu sunt placeholders
const validateFirebaseConfig = () => {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  // Verifică că variabilele de mediu sunt setate
  const requiredFields = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ];
  const missingFields = requiredFields.filter(
    (field) => !config[field as keyof typeof config]
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Firebase configuration missing required fields: ${missingFields.join(", ")}. Please set the environment variables in Netlify dashboard.`
    );
  }

  // Verifică că nu sunt folosite valori placeholder
  const placeholderValues = [
    "your-api-key",
    "your-project-id",
    "your_app_id",
    "your_firebase_api_key_here",
    "your-sender-id",
    "your_measurement_id",
  ];
  const fieldsWithPlaceholders = Object.entries(config).filter(([_, value]) =>
    placeholderValues.some((placeholder) => value?.includes(placeholder))
  );

  if (fieldsWithPlaceholders.length > 0) {
    throw new Error(
      `Firebase configuration contains placeholder values: ${fieldsWithPlaceholders.map(([key]) => key).join(", ")}. Please set real Firebase values in environment variables.`
    );
  }

  return config;
};

// Configurație Firebase cu validare
const firebaseConfig = validateFirebaseConfig();

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

// Interfețe pentru tipuri de date Firestore
interface FirestoreDocumentData {
  [key: string]: unknown;
}

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
  // Adăugăm și alte metode pentru compatibilitate
  getFirestore,
  collection: (
    db: Firestore,
    path: string
  ): CollectionReference<DocumentData> => {
    const { collection } = require("firebase/firestore");
    return collection(db, path);
  },
  doc: (
    db: Firestore,
    path: string,
    ...pathSegments: string[]
  ): DocumentReference<DocumentData> => {
    const { doc } = require("firebase/firestore");
    return doc(db, path, ...pathSegments);
  },
  getDoc: async (
    docRef: DocumentReference<DocumentData>
  ): Promise<DocumentSnapshot<DocumentData>> => {
    const { getDoc } = require("firebase/firestore");
    return getDoc(docRef);
  },
  getDocs: async (
    query: Query<DocumentData>
  ): Promise<QuerySnapshot<DocumentData>> => {
    const { getDocs } = require("firebase/firestore");
    return getDocs(query);
  },
  setDoc: async (
    docRef: DocumentReference<DocumentData>,
    data: FirestoreDocumentData,
    options?: SetOptions
  ): Promise<void> => {
    const { setDoc } = require("firebase/firestore");
    return setDoc(docRef, data, options || { merge: false });
  },
  updateDoc: async (
    docRef: DocumentReference<DocumentData>,
    data: FirestoreDocumentData
  ): Promise<void> => {
    const { updateDoc } = require("firebase/firestore");
    return updateDoc(docRef, data);
  },
  deleteDoc: async (docRef: DocumentReference<DocumentData>): Promise<void> => {
    const { deleteDoc } = require("firebase/firestore");
    return deleteDoc(docRef);
  },
  addDoc: async (
    collectionRef: CollectionReference<DocumentData>,
    data: FirestoreDocumentData
  ): Promise<DocumentReference<DocumentData>> => {
    const { addDoc } = require("firebase/firestore");
    return addDoc(collectionRef, data);
  },
  query: (
    collectionRef: CollectionReference<DocumentData> | Query<DocumentData>,
    ...queryConstraints: QueryConstraint[]
  ): Query<DocumentData> => {
    const { query } = require("firebase/firestore");
    return query(collectionRef, ...queryConstraints);
  },
  where: (
    field: string,
    opStr: WhereFilterOp,
    value: unknown
  ): QueryConstraint => {
    const { where } = require("firebase/firestore");
    return where(field, opStr, value);
  },
  orderBy: (field: string, direction?: OrderByDirection): QueryConstraint => {
    const { orderBy } = require("firebase/firestore");
    return orderBy(field, direction);
  },
  limit: (limit: number): QueryConstraint => {
    const { limit: limitFn } = require("firebase/firestore");
    return limitFn(limit);
  },
  startAfter: (...fieldValues: unknown[]): QueryConstraint => {
    const { startAfter } = require("firebase/firestore");
    return startAfter(...fieldValues);
  },
  startAt: (...fieldValues: unknown[]): QueryConstraint => {
    const { startAt } = require("firebase/firestore");
    return startAt(...fieldValues);
  },
  endAt: (...fieldValues: unknown[]): QueryConstraint => {
    const { endAt } = require("firebase/firestore");
    return endAt(...fieldValues);
  },
  endBefore: (...fieldValues: unknown[]): QueryConstraint => {
    const { endBefore } = require("firebase/firestore");
    return endBefore(...fieldValues);
  },
  writeBatch: (db: Firestore): WriteBatch => {
    const { writeBatch } = require("firebase/firestore");
    return writeBatch(db);
  },
  increment: (amount: number): FieldValue => {
    const { increment } = require("firebase/firestore");
    return increment(amount);
  },
  arrayUnion: (...elements: unknown[]): FieldValue => {
    const { arrayUnion } = require("firebase/firestore");
    return arrayUnion(...elements);
  },
  arrayRemove: (...elements: unknown[]): FieldValue => {
    const { arrayRemove } = require("firebase/firestore");
    return arrayRemove(...elements);
  },
  serverTimestamp: (): FieldValue => {
    const { serverTimestamp } = require("firebase/firestore");
    return serverTimestamp();
  },
  onSnapshot: (
    target: Query<DocumentData> | DocumentReference<DocumentData>,
    ...args: unknown[]
  ): Unsubscribe => {
    const { onSnapshot } = require("firebase/firestore");
    return onSnapshot(target, ...args);
  },
};

export const storageAPI = {
  connectStorageEmulator,
  getStorage,
  ref: (
    storage: ReturnType<typeof getStorage>,
    path: string
  ): StorageReference => {
    return ref(storage, path);
  },
  uploadBytes: async (
    storageRef: StorageReference,
    data: ArrayBuffer | Uint8Array | Blob,
    metadata?: UploadMetadata
  ): Promise<UploadResult> => {
    return uploadBytes(storageRef, data, metadata);
  },
  uploadString: async (
    storageRef: StorageReference,
    data: string,
    format?: StringFormat,
    metadata?: UploadMetadata
  ): Promise<UploadResult> => {
    return uploadString(storageRef, data, format, metadata);
  },
  getDownloadURL: async (storageRef: StorageReference): Promise<string> => {
    return getDownloadURL(storageRef);
  },
  deleteObject: async (storageRef: StorageReference): Promise<void> => {
    return deleteObject(storageRef);
  },
  listAll: async (storageRef: StorageReference): Promise<ListResult> => {
    const { listAll } = require("firebase/storage");
    return listAll(storageRef);
  },
};

export const functionsAPI = {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
};

export const analyticsAPI = {
  getAnalytics,
  logEvent: (
    analyticsInstance: Analytics | null,
    eventName: string,
    eventParams?: Record<string, unknown>
  ): void => {
    if (analyticsInstance) {
      const { logEvent } = require("firebase/analytics");
      return logEvent(analyticsInstance, eventName, eventParams);
    }
  },
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
