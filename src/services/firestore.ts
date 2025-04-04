import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
  serverTimestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { firestore } from './firebase';

// Add a document to a collection
export const addDocument = async (collectionName: string, data: DocumentData) => {
  return addDoc(collection(firestore, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

// Get a document by ID
export const getDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(firestore, collectionName, docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

// Get all documents from a collection
export const getCollection = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(firestore, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Query documents with constraints
export const queryDocuments = async (
  collectionName: string, 
  constraints: QueryConstraint[]
) => {
  const q = query(collection(firestore, collectionName), ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as DocumentData)
  }));
};

// Listen to real-time updates on a collection
export const subscribeToCollection = (
  collectionName: string,
  callback: (data: Array<DocumentData>) => void,
  constraints: QueryConstraint[] = []
): Unsubscribe => {
  const q = query(collection(firestore, collectionName), ...constraints);
  
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

// Listen to real-time updates on a document
export const subscribeToDocument = (
  collectionName: string,
  docId: string,
  callback: (data: DocumentData | null) => void
): Unsubscribe => {
  const docRef = doc(firestore, collectionName, docId);
  
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    } else {
      callback(null);
    }
  });
};

// Update a document
export const updateDocument = async (
  collectionName: string, 
  docId: string, 
  data: DocumentData
) => {
  const docRef = doc(firestore, collectionName, docId);
  return updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

// Delete a document
export const deleteDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(firestore, collectionName, docId);
  return deleteDoc(docRef);
};

// Helper functions to construct queries
export const queryWhere = (field: string, operator: string, value: unknown) => where(field, operator, value);
export const queryOrderBy = (field: string, direction: 'asc' | 'desc' = 'asc') => orderBy(field, direction);
export const queryLimit = (limitCount: number) => limit(limitCount);
