import { auth as _auth, firestore, db } from "../firebase";
import { 
  getIdTokenResult, 
  getAuth, 
  signOut as _signOut, 
  User
} from "firebase/auth";
import type { IdTokenResult as _IdTokenResult } from "firebase/auth";
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { forceTokenRefresh, refreshUserSession } from "./tokenRefresh";
import logger from "./logger";

// Define user roles
export enum UserRole {
  USER = "user",
  SPECIALIST = "specialist",
  ADMIN = "admin"
}

// Main admin email for direct checks
export const MAIN_ADMIN_EMAIL = "dani_popa21@yahoo.ro";

export interface RoleChangeRequest {
  userId: string;
  userEmail: string;
  userName?: string;
  currentRole: string;
  requestedRole: string;
  reason: string;
  specialization?: string;
  experience?: string;
  credentials?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: any;
  updatedAt?: any;
  reviewedBy?: string;
  reviewComments?: string;
}

/**
 * Converts a role enum to a string
 */
export function roleToString(role: UserRole): string {
  switch(role) {
    case UserRole.ADMIN:
      return "admin";
    case UserRole.SPECIALIST:
      return "specialist";
    case UserRole.USER:
      return "user";
    default:
      return "user";
  }
}

/**
 * Converts a role string to enum 
 */
export function stringToRole(role: string): UserRole {
  switch(role.toLowerCase()) {
    case "admin":
      return UserRole.ADMIN;
    case "specialist":
      return UserRole.SPECIALIST;
    case "user":
      return UserRole.USER;
    default:
      return UserRole.USER;
  }
}

/**
 * Gets UserRole enum from a string - alias for stringToRole function
 * Added for backwards compatibility with code that uses getUserRoleEnum
 */
export function getUserRoleEnum(role: string): UserRole {
  return stringToRole(role);
}

/**
 * Gets the role from a Firebase user by checking custom claims
 */
export const getRoleFromUser = async (user: User | null): Promise<UserRole | null> => {
  if (!user) return null;
  
  try {
    // First check token claims
    const idTokenResult = await getIdTokenResult(user);
    
    if (idTokenResult.claims.role === roleToString(UserRole.ADMIN)) {
      return UserRole.ADMIN;
    }
    
    if (idTokenResult.claims.role === roleToString(UserRole.SPECIALIST)) {
      return UserRole.SPECIALIST;
    }
    
    // If no role in claims, check email for main admin
    if (user.email === MAIN_ADMIN_EMAIL) {
      return UserRole.ADMIN;
    }
    
    // Fallback to database check if no claims found
    const userDocRef = doc(firestore, "users", user.uid);
    const userSnapshot = await getDoc(userDocRef);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data() as Record<string, any>;
      if (userData.role === roleToString(UserRole.ADMIN) || userData.isAdmin === true) {
        return UserRole.ADMIN;
      }
      
      if (userData.role === roleToString(UserRole.SPECIALIST)) {
        return UserRole.SPECIALIST;
      }
    }
    
    // Default role is USER if nothing else is found
    return UserRole.USER;
  } catch (error) {
    console.error("Error getting user role:", error);
    return UserRole.USER; // Default to regular user if error
  }
};

/**
 * Checks if a user is an admin
 */
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    // Check Firestore for admin role
    const userDoc = doc(firestore, "users", userId);
    const userSnapshot = await getDoc(userDoc);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data() as Record<string, any>;
      
      // Check if user document has admin role
      if (userData.role === roleToString(UserRole.ADMIN) || userData.isAdmin === true) {
        return true;
      }
    }
    
    // Check admins collection as backup
    const adminsRef = collection(firestore, "admins");
    const adminSnapshot = await getDoc(doc(adminsRef, userId));
    
    return adminSnapshot.exists();
  } catch (error) {
    console.error("Error checking if user is admin:", error);
    return false;
  }
};

/**
 * Checks if a user is a specialist
 */
export const isUserSpecialist = async (userId: string): Promise<boolean> => {
  try {
    console.log(`Checking if user ${userId} is a specialist`);
    
    // First, check Firebase Auth custom claims if this is the current user
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === userId) {
      const idTokenResult = await getIdTokenResult(currentUser);
      if (idTokenResult.claims.role === "specialist") {
        console.log("User is a specialist based on token claims");
        return true;
      }
    }
    
    // Check in specialists collection first - this is the most direct check
    const specialistsRef = collection(firestore, "specialists");
    const specialistByIdQuery = query(
      specialistsRef,
      where("userId", "==", userId)
    );
    const specialistByIdSnapshot = await getDocs(specialistByIdQuery);
    
    if (!specialistByIdSnapshot.empty) {
      console.log("User is a specialist based on specialists collection");
      return true;
    }
    
    // Also directly check if the user ID exists as a document ID in the specialists collection
    const directSpecialistRef = doc(firestore, "specialists", userId);
    const directSpecialistDoc = await getDoc(directSpecialistRef);
    
    if (directSpecialistDoc.exists()) {
      console.log("User is a specialist (direct document in specialists collection)");
      return true;
    }
    
    // Check in users collection
    const userRef = doc(firestore, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as Record<string, any>;
      console.log(`User data for specialist check:`, userData);
      
      // Check all possible ways a user could be marked as a specialist
      if (
        userData.role === "specialist" || 
        userData.isSpecialist === true || 
        userData.specializationCategory || 
        userData.specialization
      ) {
        console.log("User is a specialist based on user document fields");
        return true;
      }
    }
    
    // If user has email, check by email in specialists collection
    if (currentUser && currentUser.email) {
      const userEmail = currentUser.email.toLowerCase();
      const specialistsByEmailQuery = query(
        specialistsRef,
        where("email", "==", userEmail)
      );
      const specialistsByEmailSnapshot = await getDocs(specialistsByEmailQuery);
      if (!specialistsByEmailSnapshot.empty) {
        console.log("User is a specialist based on matching email in specialists collection");
        return true;
      }
    }
    
    console.log("User is not a specialist");
    return false;
  } catch (error) {
    console.error("Error checking if user is specialist:", error);
    return false;
  }
};

/**
 * Make a user an administrator
 * @param userId - The user ID to make admin
 */
export const makeUserAdmin = async (userId: string): Promise<void> => {
  try {
    // Update the user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      await updateDoc(userRef, {
        role: "admin",
        isAdmin: true,
        // If user was a specialist, remove that role
        isSpecialist: false,
        updatedAt: Timestamp.now()
      });
    }

    // Add entry to admins collection
    await setDoc(doc(db, "admins", userId), {
      addedAt: Timestamp.now(),
      userId
    });

    // Remove from specialists collection if present
    try {
      const specialistRef = doc(db, "specialists", userId);
      const specialistDoc = await getDoc(specialistRef);
      if (specialistDoc.exists()) {
        await updateDoc(specialistRef, {
          isActive: false,
          updatedAt: Timestamp.now()
        });
      }
    } catch (err) {
      console.error("Error updating specialist document:", err);
    }
  } catch (error) {
    console.error("Error making user admin:", error);
    throw new Error("Failed to make user admin");
  }
};

/**
 * Remove admin role from a user
 * @param userId - The user ID to remove admin rights from
 */
export const removeAdminRole = async (userId: string): Promise<void> => {
  try {
    // Update the user document
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      role: "user",
      isAdmin: false,
      updatedAt: Timestamp.now()
    });

    // Remove from admins collection
    const adminRef = doc(db, "admins", userId);
    const adminDoc = await getDoc(adminRef);
    if (adminDoc.exists()) {
      await updateDoc(adminRef, {
        removedAt: Timestamp.now(),
        active: false
      });
    }
  } catch (error) {
    console.error("Error removing admin role:", error);
    throw new Error("Failed to remove admin role");
  }
};

/**
 * Make a user a specialist
 * @param userId - The user ID to make specialist
 * @param specialization - Optional specialization category
 */
export const makeUserSpecialist = async (userId: string, specialization?: string): Promise<void> => {
  try {
    // Get user data first
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User does not exist");
    }
    
    const userData = userDoc.data() as Record<string, any>;
    
    // Update the user document with specialist role
    await updateDoc(userRef, {
      role: "specialist",
      isSpecialist: true,
      // If user was an admin, remove that role
      isAdmin: false,
      specialization: specialization || userData.specialization || "General",
      updatedAt: Timestamp.now()
    });

    // Check if user already exists in specialists collection
    const specialistRef = doc(db, "specialists", userId);
    const specialistDoc = await getDoc(specialistRef);
    
    if (specialistDoc.exists()) {
      // Update existing specialist document
      await updateDoc(specialistRef, {
        isActive: true,
        specialization: specialization || specialistDoc.data().specialization || "General",
        updatedAt: Timestamp.now()
      });
    } else {
      // Create new specialist document
      await setDoc(specialistRef, {
        userId,
        fullName: userData.displayName || userData.email || "Specialist",
        email: userData.email || "",
        phone: userData.phoneNumber || userData.phone || "",
        specialization: specialization || userData.specialization || "General",
        bio: userData.bio || "",
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        imageUrl: userData.photoURL || "",
      });
    }

    // Remove from admins collection if present
    try {
      const adminRef = doc(db, "admins", userId);
      const adminDoc = await getDoc(adminRef);
      if (adminDoc.exists()) {
        await updateDoc(adminRef, {
          active: false,
          removedAt: Timestamp.now()
        });
      }
    } catch (err) {
      console.error("Error updating admin document:", err);
    }
  } catch (error) {
    console.error("Error making user specialist:", error);
    throw new Error("Failed to make user a specialist");
  }
};

/**
 * Remove specialist role from a user
 * @param userId - The user ID to remove specialist role from
 */
export const removeSpecialistRole = async (userId: string): Promise<void> => {
  try {
    // Update the user document
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      role: "user",
      isSpecialist: false,
      updatedAt: Timestamp.now()
    });

    // Update specialists collection
    const specialistRef = doc(db, "specialists", userId);
    const specialistDoc = await getDoc(specialistRef);
    if (specialistDoc.exists()) {
      await updateDoc(specialistRef, {
        isActive: false,
        updatedAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error("Error removing specialist role:", error);
    throw new Error("Failed to remove specialist role");
  }
};

/**
 * Get user role information
 * @param userId - The user ID to check
 * @returns Object containing user role information
 */
export const getUserRoleInfo = async (userId: string): Promise<{
  isAdmin: boolean;
  isSpecialist: boolean;
  role: string;
}> => {
  try {
    // Default response
    let roleInfo = {
      isAdmin: false,
      isSpecialist: false,
      role: "user"
    };

    // Check user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as Record<string, any>;
      
      if (userData.role) {
        roleInfo.role = userData.role;
      }
      
      if (userData.isAdmin) {
        roleInfo.isAdmin = true;
        roleInfo.role = "admin";
      }
      
      if (userData.isSpecialist) {
        roleInfo.isSpecialist = true;
        roleInfo.role = "specialist";
      }
    }

    // Double-check admin collection
    const adminRef = doc(db, "admins", userId);
    const adminDoc = await getDoc(adminRef);
    
    if (adminDoc.exists() && !adminDoc.data()?.active === false) {
      roleInfo.isAdmin = true;
      roleInfo.role = "admin";
    }

    // Double-check specialists collection
    const specialistRef = doc(db, "specialists", userId);
    const specialistDoc = await getDoc(specialistRef);
    
    if (specialistDoc.exists() && specialistDoc.data()?.isActive !== false) {
      roleInfo.isSpecialist = true;
      roleInfo.role = "specialist";
    }

    return roleInfo;
  } catch (error) {
    console.error("Error getting user role info:", error);
    return {
      isAdmin: false,
      isSpecialist: false,
      role: "user"
    };
  }
};

/**
 * Requests a role change for a user
 * @param userId - The ID of the user requesting the role change
 * @param userEmail - The email of the user requesting the role change
 * @param currentRole - The user's current role
 * @param requestedRole - The role the user is requesting
 * @param reason - The reason for the request
 * @param additionalInfo - Additional information to support the request
 */
export async function requestRoleChange(
  userId: string, 
  userEmail: string, 
  userName: string,
  currentRole: UserRole, 
  requestedRole: UserRole, 
  reason: string,
  specialization?: string,
  experience?: string,
  credentials?: string
): Promise<boolean> {
  try {
    // Check if there's already a pending request
    const hasPending = await checkPendingRoleRequests(userId);
    if (hasPending) {
      console.error("User already has a pending role change request");
      return false;
    }
    
    // Create the request
    const request: RoleChangeRequest = {
      userId,
      userEmail,
      userName,
      currentRole: roleToString(currentRole),
      requestedRole: roleToString(requestedRole),
      reason,
      specialization,
      experience,
      credentials,
      status: "pending",
      createdAt: serverTimestamp()
    };

    // Add the request to Firestore
    const requestsCollection = collection(firestore, "roleChangeRequests");
    await addDoc(requestsCollection, request);
    console.log("Role change request submitted successfully");

    // Refresh the token after submitting the request
    await forceTokenRefresh();

    return true;
  } catch (error) {
    console.error("Error submitting role change request:", error);
    return false;
  }
}

/**
 * Checks if a user has any pending role change requests
 * @param userId - The ID of the user to check
 * @returns Promise<boolean> - True if the user has pending requests
 */
export async function checkPendingRoleRequests(userId: string): Promise<boolean> {
  try {
    const requestsCollection = collection(firestore, "roleChangeRequests");
    const pendingQuery = query(
      requestsCollection, 
      where("userId", "==", userId),
      where("status", "==", "pending")
    );
    
    const querySnapshot = await getDocs(pendingQuery);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking pending role requests:", error);
    return false;
  }
}

/**
 * Refreshes the user's authentication token to reflect any role changes
 * @returns Promise<boolean> - True if the refresh was successful
 */
export async function refreshUserAuthToken(): Promise<boolean> {
  try {
    await refreshUserSession();
    return true;
  } catch (error) {
    console.error("Error refreshing auth token:", error);
    return false;
  }
}

/**
 * Refreshes the user's authentication token
 * A utility function to refresh the token after role changes
 */
export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    await refreshUserSession();
    return true;
  } catch (error) {
    logger.error("Error refreshing authentication token:", error);
    return false;
  }
};

/**
 * Verifică și actualizează rolurile utilizatorului în token-ul de autentificare
 * Folosiți această funcție când modificați rolul unui utilizator în Firestore
 */
export const refreshUserAuthTokenUtil = async (user?: User): Promise<boolean> => {
  try {
    const auth = getAuth();
    const currentUser = user || auth.currentUser;
    
    if (!currentUser) {
      logger.warn("Încercare de actualizare token fără utilizator autentificat");
      return false;
    }
    
    logger.info(`Actualizare token pentru utilizatorul ${currentUser.email}`);
    
    // Forțăm reîmprospătarea token-ului pentru a sincroniza cu Firestore
    await forceTokenRefresh();
    
    return true;
  } catch (error) {
    logger.error("Eroare la actualizarea token-ului utilizatorului:", error);
    return false;
  }
};

/**
 * Verifică dacă un utilizator are un anumit rol
 * Folosește această funcție când trebuie să verifici rolul utilizatorului din Firestore
 */
export const checkUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    const userRef = doc(firestore, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const userData = userDoc.data() as Record<string, any>;
    
    if (role === UserRole.ADMIN) {
      return userData.isAdmin === true || userData.role === UserRole.ADMIN;
    }
    
    if (role === UserRole.SPECIALIST) {
      return userData.role === UserRole.SPECIALIST || userData.isSpecialist === true;
    }
    
    return true; // Oricine are rol de utilizator implicit
  } catch (error) {
    logger.error(`Eroare la verificarea rolului ${role} pentru utilizatorul ${userId}:`, error);
    return false;
  }
};

/**
 * Asigură că token-ul utilizatorului este sincronizat cu datele din Firestore
 * și că rolurile sunt actualizate corect
 */
export const syncUserRoleAndToken = async (userId: string): Promise<boolean> => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser || currentUser.uid !== userId) {
      logger.warn("Utilizatorul nu este autentificat sau ID-urile nu coincid");
      return false;
    }
    
    // Verificăm dacă utilizatorul are rol de specialist în Firestore
    const isSpecialist = await checkUserRole(userId, UserRole.SPECIALIST);
    
    if (isSpecialist) {
      logger.info(`Utilizatorul ${currentUser.email} este specialist, actualizăm token-ul`);
      
      // Forțăm reîmprospătarea token-ului pentru a include rolul de specialist
      await refreshUserAuthTokenUtil(currentUser);
      
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error("Eroare la sincronizarea rolului și token-ului:", error);
    return false;
  }
};

export default {
  refreshUserAuthTokenUtil,
  checkUserRole,
  syncUserRoleAndToken,
  UserRole
};

/**
 * Gets the current user's role from Firestore
 * @param userId - The ID of the user
 * @returns Promise<string> - The user's role as a string
 */
export async function getUserRoleFromFirestore(userId: string): Promise<string> {
  try {
    const userDoc = await getDoc(doc(firestore, "users", userId));
    if (userDoc.exists()) {
      return (userDoc.data() as Record<string, any>).role || "user";
    }
    return "user";
  } catch (error) {
    console.error("Error getting user role from Firestore:", error);
    return "user";
  }
}

/**
 * Checks if the user's Firestore role matches their authentication token role
 * @param userId - The ID of the user
 * @returns Promise<boolean> - True if the roles match, false if they don't
 */
export async function checkRoleConsistency(userId: string): Promise<boolean> {
  try {
    // Get role from Firestore
    const firestoreRole = await getUserRoleFromFirestore(userId);
    
    // Get role from auth token
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.error("No user is currently signed in");
      return false;
    }
    
    const tokenResult = await user.getIdTokenResult();
    const tokenRole = tokenResult.claims.role || "user";
    
    // Compare the roles
    const rolesMatch = firestoreRole === tokenRole;
    console.log(`Role consistency check: Firestore=${firestoreRole}, Token=${tokenRole}, Match=${rolesMatch}`);
    
    return rolesMatch;
  } catch (error) {
    console.error("Error checking role consistency:", error);
    return false;
  }
}

/**
 * Processes a role change request (approve or reject)
 * @param requestId - The ID of the role change request
 * @param status - 'approved' or 'rejected'
 * @param reviewerId - The ID of the admin processing the request
 * @param comments - Optional comments explaining the decision
 * @returns Promise<boolean> - True if the processing was successful
 */
export async function processRoleChangeRequest(
  requestId: string,
  status: "approved" | "rejected",
  reviewerId: string,
  comments?: string
): Promise<boolean> {
  try {
    // Get the request document
    const requestRef = doc(firestore, "roleChangeRequests", requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (!requestSnap.exists()) {
      console.error("Role change request not found");
      return false;
    }
    
    const requestData = requestSnap.data() as Record<string, any>;
    
    // Update the request status
    await updateDoc(requestRef, {
      status,
      reviewedBy: reviewerId,
      reviewComments: comments || "",
      updatedAt: serverTimestamp()
    });
    
    // If approved, update the user's role
    if (status === "approved") {
      const userRef = doc(firestore, "users", requestData.userId);
      
      // Update the user's role in Firestore
      await updateDoc(userRef, {
        role: requestData.requestedRole,
        updatedAt: serverTimestamp()
      });
      
      // Also update roles collection for consistency
      await setDoc(doc(firestore, "roles", requestData.userId), {
        role: requestData.requestedRole,
        updatedAt: serverTimestamp()
      });
      
      console.log(`User ${requestData.userId} role updated to ${requestData.requestedRole}`);
    }
    
    return true;
  } catch (error) {
    console.error("Error processing role change request:", error);
    return false;
  }
}

/**
 * Gets all role change requests
 * @param status - Optional filter by status
 * @returns Promise<Array> - Array of role change requests
 */
export async function getRoleChangeRequests(status?: "pending" | "approved" | "rejected"): Promise<RoleChangeRequest[]> {
  try {
    const requestsCollection = collection(firestore, "roleChangeRequests");
    let requestsQuery;
    
    if (status) {
      requestsQuery = query(
        requestsCollection,
        where("status", "==", status)
      );
    } else {
      requestsQuery = query(requestsCollection);
    }
    
    const querySnapshot = await getDocs(requestsQuery);
    
    return querySnapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...(doc.data() as Record<string, any>)
      } as RoleChangeRequest & { id: string };
    });
  } catch (error) {
    console.error("Error getting role change requests:", error);
    return [];
  }
}
