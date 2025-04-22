import { User as FirebaseUser } from "firebase/auth";
import { User } from "../types/user";

/**
 * Format user data for storing in Firestore
 */
export const formatUserData = (user: FirebaseUser) => {
  return {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "",
    photoURL: user.photoURL || "",
    createdAt: new Date(),
    lastLogin: new Date(),
    isAdmin: false // Default value
  };
};

/**
 * Convert Firebase User to our custom User type
 */
export const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName || undefined,
    photoURL: firebaseUser.photoURL || undefined,
    createdAt: firebaseUser.metadata?.creationTime ? new Date(firebaseUser.metadata.creationTime) : new Date(),
    lastLogin: firebaseUser.metadata?.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime) : new Date(),
    isAdmin: false // Default value, should be updated after checking Firestore
  };
};
