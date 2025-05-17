// Fix for Firebase auth and firestore modules
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name using ESM pattern
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const authFilePath = join(__dirname, '..', 'src', 'firebase', 'auth', 'index.ts');
const firestoreFilePath = join(__dirname, '..', 'src', 'firebase', 'firestore', 'index.ts');

const newAuthContent = `// filepath: d:\\LUPUL\\my-typescript-app\\src\\firebase\\auth\\index.ts

// Define Firebase types that we need
export type FirebaseApp = {
  name: string;
  options: Record<string, unknown>;
  automaticDataCollectionEnabled: boolean;
};

// Define Auth and User interfaces
export interface User {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  isAnonymous: boolean;
  tenantId: string | null;
  providerId?: string;
  providerData: Array<{
    uid: string;
    displayName: string | null;
    photoURL: string | null;
    email: string | null;
    phoneNumber: string | null;
    providerId: string;
  }>;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  refreshToken?: string;
}

// Define Auth interface
export interface Auth {
  app: FirebaseApp;
  name: string;
  currentUser: User | null;
}

// Export functions using dynamic require to avoid circular references
export function getAuth(app?: FirebaseApp): Auth {
  // Use dynamic import for Firebase Auth
  const firebaseAuth = require("firebase/auth");
  return firebaseAuth.getAuth(app);
}

export function onAuthStateChanged(
  auth: Auth,
  nextOrObserver: ((user: User | null) => void),
  error?: (error: Error) => void,
  completed?: () => void
): (() => void) {
  const firebaseAuth = require("firebase/auth");
  return firebaseAuth.onAuthStateChanged(auth, nextOrObserver, error, completed);
}

export function signInWithRedirect(auth: Auth, provider: any): Promise<void> {
  const firebaseAuth = require("firebase/auth");
  return firebaseAuth.signInWithRedirect(auth, provider);
}

export function connectAuthEmulator(auth: Auth, url: string, options?: { disableWarnings?: boolean }): void {
  const firebaseAuth = require("firebase/auth");
  return firebaseAuth.connectAuthEmulator(auth, url, options);
}

// Export commonly used functions with better type definitions
export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<{user: User}> {
  const firebaseAuth = require("firebase/auth");
  return firebaseAuth.signInWithEmailAndPassword(auth, email, password);
}

export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<{user: User}> {
  const firebaseAuth = require("firebase/auth");
  return firebaseAuth.createUserWithEmailAndPassword(auth, email, password);
}

export function signOut(auth: Auth): Promise<void> {
  const firebaseAuth = require("firebase/auth");
  return firebaseAuth.signOut(auth);
}

// Re-export GoogleAuthProvider directly from Firebase
export const GoogleAuthProvider = {
  PROVIDER_ID: "google.com",
  GOOGLE_SIGN_IN_METHOD: "google.com",
  
  credential: (idToken?: string, accessToken?: string) => {
    const firebaseAuth = require("firebase/auth");
    return firebaseAuth.GoogleAuthProvider.credential(idToken, accessToken);
  },
  
  new: () => {
    const firebaseAuth = require("firebase/auth");
    return new firebaseAuth.GoogleAuthProvider();
  }
};
`;

const newFirestoreContent = `// filepath: d:\\LUPUL\\my-typescript-app\\src\\firebase\\firestore\\index.ts

// Define essential types for Firestore
export type FirebaseApp = {
  name: string;
  options: Record<string, unknown>;
  automaticDataCollectionEnabled: boolean;
};

export interface DocumentData {
  [field: string]: unknown;
}

export interface QueryDocumentSnapshot<T = DocumentData> {
  id: string;
  exists(): boolean;
  data(): T;
  get(fieldPath: string): unknown;
  ref: any;
}

// Timestamp implementation
export class Timestamp {
  seconds: number;
  nanoseconds: number;
  
  constructor(seconds: number, nanoseconds: number) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }
  
  toDate(): Date {
    return new Date(this.seconds * 1000 + this.nanoseconds / 1000000);
  }
  
  static now(): Timestamp {
    const now = new Date();
    return new Timestamp(Math.floor(now.getTime() / 1000), (now.getTime() % 1000) * 1000000);
  }
  
  static fromDate(date: Date): Timestamp {
    return new Timestamp(Math.floor(date.getTime() / 1000), (date.getTime() % 1000) * 1000000);
  }
}

// Export Firestore functions using dynamic require
export function getFirestore(app?: FirebaseApp): any {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.getFirestore(app);
}

export function collection(firestore: any, path: string, ...pathSegments: string[]): any {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.collection(firestore, path, ...pathSegments);
}

export function doc(firestoreOrCollectionRef: any, path?: string, ...pathSegments: string[]): any {
  const firestoreModule = require("firebase/firestore");
  if (path) {
    return firestoreModule.doc(firestoreOrCollectionRef, path, ...pathSegments);
  }
  return firestoreModule.doc(firestoreOrCollectionRef);
}

export function getDoc(docRef: any): Promise<any> {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.getDoc(docRef);
}

export function getDocs(query: any): Promise<any> {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.getDocs(query);
}

export function setDoc(docRef: any, data: any, options?: any): Promise<void> {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.setDoc(docRef, data, options);
}

export function updateDoc(docRef: any, data: any): Promise<void> {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.updateDoc(docRef, data);
}

export function deleteDoc(docRef: any): Promise<void> {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.deleteDoc(docRef);
}

export function addDoc(collectionRef: any, data: any): Promise<any> {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.addDoc(collectionRef, data);
}

export function query(collectionRef: any, ...queryConstraints: any[]): any {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.query(collectionRef, ...queryConstraints);
}

export function where(fieldPath: string, opStr: string, value: any): any {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.where(fieldPath, opStr, value);
}

export function orderBy(fieldPath: string, directionStr?: "asc" | "desc"): any {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.orderBy(fieldPath, directionStr);
}

export function limit(limit: number): any {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.limit(limit);
}

export function startAfter(...fieldValues: any[]): any {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.startAfter(...fieldValues);
}

export function startAt(...fieldValues: any[]): any {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.startAt(...fieldValues);
}

export function endAt(...fieldValues: any[]): any {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.endAt(...fieldValues);
}

export function endBefore(...fieldValues: any[]): any {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.endBefore(...fieldValues);
}

export function writeBatch(firestore: any): any {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.writeBatch(firestore);
}

export function arrayUnion(...elements: any[]): any {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.arrayUnion(...elements);
}

export function arrayRemove(...elements: any[]): any {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.arrayRemove(...elements);
}

export function increment(n: number): any {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.increment(n);
}

export function serverTimestamp(): any {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.serverTimestamp();
}

export function onSnapshot(reference: any, ...args: any[]): () => void {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.onSnapshot(reference, ...args);
}

export function connectFirestoreEmulator(firestore: any, host: string, port: number): void {
  const firestoreModule = require("firebase/firestore");
  return firestoreModule.connectFirestoreEmulator(firestore, host, port);
}
`;

async function updateFiles() {
  try {
    await fs.writeFile(authFilePath, newAuthContent, { encoding: 'utf8' });
    console.log('Successfully updated auth index.ts file.');
    
    await fs.writeFile(firestoreFilePath, newFirestoreContent, { encoding: 'utf8' });
    console.log('Successfully updated firestore index.ts file.');
  } catch (error) {
    console.error('Error updating files:', error);
  }
}

updateFiles();
