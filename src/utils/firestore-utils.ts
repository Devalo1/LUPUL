import { 
  doc, 
  getDoc, 
  getDocs, 
  collection, 
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  Query,
  DocumentData,
  WithFieldValue,
  setDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { FirestoreDocument, TimestampedDocument } from "./models";

/**
 * Generic function to get a document by ID with proper typing
 */
export async function getDocumentById<T extends FirestoreDocument>(
  collectionName: string, 
  docId: string
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as Record<string, any>) } as T;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to get all documents from a collection with proper typing
 */
export async function getCollection<T extends FirestoreDocument>(
  collectionName: string
): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Record<string, any>)
    } as T));
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to query a collection with proper typing
 */
export async function queryCollection<T extends FirestoreDocument>(
  collectionName: string,
  conditions: {
    fieldPath: string;
    operation: "==" | "!=" | ">" | ">=" | "<" | "<=";
    value: any;
  }[],
  orderByField?: string,
  orderDirection?: "asc" | "desc",
  limitCount?: number
): Promise<T[]> {
  try {
    let q: Query<DocumentData> = query(collection(db, collectionName));
    
    // Add all where conditions
    conditions.forEach(condition => {
      q = query(q, where(condition.fieldPath, condition.operation, condition.value));
    });
    
    // Add ordering if specified
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection || "asc"));
    }
    
    // Add limit if specified
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Record<string, any>)
    } as T));
  } catch (error) {
    console.error(`Error querying collection ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to add a document with proper typing and timestamps
 */
export async function addDocument<T extends TimestampedDocument>(
  collectionName: string,
  data: Omit<T, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = doc(collectionRef);
    
    const timestamp = Timestamp.now();
    const documentData = {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp
    } as WithFieldValue<DocumentData>;
    
    await setDoc(docRef, documentData);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to update a document with proper typing
 */
export async function updateDocument<T extends TimestampedDocument>(
  collectionName: string,
  docId: string,
  data: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    
    const updateData = {
      ...data,
      updatedAt: Timestamp.now()
    } as WithFieldValue<DocumentData>;
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to delete a document
 */
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
}