// Complete implementation of firestore service
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, 
  updateDoc, deleteDoc, query, onSnapshot, DocumentData, 
  QueryConstraint, Unsubscribe } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('Firebase inițializat:', app);

export const auth = getAuth(app);
console.log('Serviciul de autentificare inițializat:', auth);

export const firestore = getFirestore(app);
console.log('Serviciul Firestore inițializat:', firestore);

export const storage = getStorage(app);
console.log('Serviciul de stocare inițializat:', storage);

export default app;

// Firestore service methods
export const addDocument = async (collectionName: string, data: DocumentData) => {
  const collectionRef = collection(firestore, collectionName);
  const docRef = await addDoc(collectionRef, { ...data, createdAt: new Date() });
  return docRef.id;
};

export const getDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(firestore, collectionName, docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const getCollection = async (collectionName: string) => {
  const collectionRef = collection(firestore, collectionName);
  const snapshot = await getDocs(collectionRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateDocument = async (collectionName: string, docId: string, data: DocumentData) => {
  const docRef = doc(firestore, collectionName, docId);
  await updateDoc(docRef, { ...data, updatedAt: new Date() });
  return docId;
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(firestore, collectionName, docId);
  await deleteDoc(docRef);
  return docId;
};

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