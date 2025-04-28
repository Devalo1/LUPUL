import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User as _User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import { UserDocument } from "../types/models";
import { AppError, handleUnknownError } from "../utils/firebase-errors";

/**
 * Types for user data hook
 */
export interface UseUserDataResult {
  userData: UserDocument | null;
  loading: boolean;
  error: AppError | null;
  refreshUserData: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage user data from Firestore
 */
export function useUserData(userId?: string): UseUserDataResult {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AppError | null>(null);

  const targetUserId = userId || user?.uid;

  const fetchUserData = async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userDocRef = doc(firestore, "users", targetUserId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data() as Omit<UserDocument, "id">;
        setUserData({ 
          id: userDoc.id, 
          ...(data as UserDocument) 
        });
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError(handleUnknownError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [targetUserId]);

  return {
    userData,
    loading,
    error,
    refreshUserData: fetchUserData
  };
}

/**
 * Types for the useFirestoreDocument hook
 */
export interface UseFirestoreDocumentResult<T> {
  document: T | null;
  loading: boolean;
  error: AppError | null;
  refreshDocument: () => Promise<void>;
}

/**
 * Generic hook to fetch a document from Firestore
 */
export function useFirestoreDocument<T>(
  collectionName: string,
  documentId?: string
): UseFirestoreDocumentResult<T> {
  const [document, setDocument] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AppError | null>(null);

  const fetchDocument = async () => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const docRef = doc(firestore, collectionName, documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setDocument({ id: docSnap.id, ...docSnap.data() } as unknown as T);
      } else {
        setDocument(null);
      }
    } catch (error) {
      console.error(`Error fetching document from ${collectionName}:`, error);
      setError(handleUnknownError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [collectionName, documentId]);

  return {
    document,
    loading,
    error,
    refreshDocument: fetchDocument
  };
}