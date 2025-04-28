import { User as FirebaseUser } from "firebase/auth";
import { User as _User } from "../types/user";
import { UserExtended } from "../types/common-types";

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
    isAdmin: false, // Default value
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber,
    isAnonymous: user.isAnonymous,
    isActive: true
  };
};

/**
 * Convert Firebase User to our custom User type
 */
export const convertFirebaseUser = (firebaseUser: FirebaseUser): UserExtended => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName || null,
    photoURL: firebaseUser.photoURL || null,
    createdAt: firebaseUser.metadata?.creationTime ? new Date(firebaseUser.metadata.creationTime) : new Date(),
    lastLogin: firebaseUser.metadata?.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime) : new Date(),
    isAdmin: false, // Default value, should be updated after checking Firestore
    emailVerified: firebaseUser.emailVerified,
    phoneNumber: firebaseUser.phoneNumber,
    isAnonymous: firebaseUser.isAnonymous,
    isActive: true
  };
};
