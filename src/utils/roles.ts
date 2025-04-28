import { getFirestore, doc, getDoc, setDoc as _setDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import type { IdTokenResult } from "firebase/auth";

// Define enum for user roles to ensure consistent role values across the app
export enum UserRole {
  USER = 0,
  ADMIN = 1,
  SPECIALIST = 2
}

// Convert string role to UserRole enum
export const getUserRoleEnum = (role: unknown): UserRole => {
  // Handle potential null or undefined values
  if (!role) return UserRole.USER;
  
  // Convert to string to ensure toLowerCase works
  const roleStr = String(role).toLowerCase();
  
  if (roleStr === "admin") return UserRole.ADMIN;
  if (roleStr === "specialist") return UserRole.SPECIALIST;
  
  return UserRole.USER;
};

// Convert UserRole enum to string
export function getRoleString(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return "admin";
    case UserRole.SPECIALIST:
      return "specialist";
    default:
      return "user";
  }
}

// Helper function to parse JWT
function parseJwt(token: string): Record<string, unknown> {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  return JSON.parse(jsonPayload);
}

// Get the user's role from Firestore
export const getFirestoreRole = async (userId: string): Promise<string | null> => {
  try {
    const db = getFirestore();
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) return null;
    
    const userData = userDoc.data();
    return userData.role || null;
  } catch (error) {
    console.error("Error getting Firestore role:", error);
    return null;
  }
};

// Get the user's role from Firebase Auth token
export async function getAuthTokenRole(): Promise<string | null> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) return null;
    
    const idToken = await user.getIdToken();
    // Fix type casting with intermediate unknown assertion
    const idTokenResult = parseJwt(idToken) as unknown as IdTokenResult;
    
    if (idTokenResult.claims.admin === true) {
      return "admin";
    } else if (idTokenResult.claims.specialist === true) {
      return "specialist";
    }
    
    return "user";
  } catch (error) {
    console.error("Error getting role from auth token:", error);
    return null;
  }
}

// Check if there's a mismatch between Firestore role and Auth token role
export const checkRoleMismatch = async (userId: string): Promise<boolean> => {
  try {
    const firestoreRole = await getFirestoreRole(userId);
    
    // Get current role from auth token
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) return false;
    
    const idToken = await user.getIdToken();
    // Fix type casting with intermediate unknown assertion
    const idTokenResult = parseJwt(idToken) as unknown as IdTokenResult;
    const tokenRole = idTokenResult.claims.role;
    
    console.log(`Role check: Firestore=${firestoreRole}, Token=${tokenRole}`);
    
    // If either role is null, there's no clear mismatch
    if (!firestoreRole || !tokenRole) return false;
    
    // Safe string conversion to handle potential non-string values
    const normalizedFirestoreRole = String(firestoreRole).toLowerCase();
    const normalizedTokenRole = String(tokenRole).toLowerCase();
    
    return normalizedFirestoreRole !== normalizedTokenRole;
  } catch (error) {
    console.error("Error checking role mismatch:", error);
    return false;
  }
};

// Fix role mismatch by updating Firestore to match Auth token if needed
export const fixRoleMismatch = async (userId: string): Promise<boolean> => {
  try {
    const db = getFirestore();
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error(`User document ${userId} not found`);
      return false;
    }
    
    // Get current roles from both sources
    const firestoreRole = await getFirestoreRole(userId);
    const authTokenRole = await getAuthTokenRole();
    
    console.log(`Fixing role mismatch for user ${userId}: Firestore=${firestoreRole}, Auth=${authTokenRole}`);
    
    // If either role is null, we can't fix the mismatch
    if (!firestoreRole || !authTokenRole) {
      console.error("Cannot fix role mismatch: missing role information");
      return false;
    }
    
    // Convert to lowercase strings for comparison
    const normalizedFirestoreRole = String(firestoreRole).toLowerCase();
    const normalizedAuthRole = String(authTokenRole).toLowerCase();
    
    // If roles already match, no update needed
    if (normalizedFirestoreRole === normalizedAuthRole) {
      console.log("Roles already match, no update needed");
      return false;
    }
    
    // Update Firestore with the role from auth token
    await updateDoc(userRef, {
      role: authTokenRole,
      updatedAt: new Date()
    });
    
    console.log(`Updated user ${userId} role in Firestore to ${authTokenRole}`);
    return true;
  } catch (error) {
    console.error("Error fixing role mismatch:", error);
    return false;
  }
};