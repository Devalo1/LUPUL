import { doc, setDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { firestore, db } from "../firebase"; // Direct import from the central firebase.ts
import logger from "./logger"; // Import the logger utility

// Create a component-specific logger
const userRolesLogger = logger.createLogger("UserRoles");

// Define main admin email in a constant to avoid inconsistencies
export const MAIN_ADMIN_EMAIL = "dani_popa21@yahoo.ro";

// Define all admin emails in one place
export const ADMIN_EMAILS = [
  MAIN_ADMIN_EMAIL,
  // Add other admin emails here
];

/**
 * Checks if a user with the given email has admin privileges
 * Implementare simplificată care nu mai generează erori de permisiuni
 */
export const isUserAdmin = async (userEmail: string): Promise<boolean> => {
  if (!userEmail) return false;
  
  // First check if email is in the hardcoded admin list
  if (ADMIN_EMAILS.includes(userEmail)) {
    userRolesLogger.info(`Admin detected from hardcoded list: ${userEmail}`);
    return true;
  }
  
  try {
    // Metoda simplificată: Verifică doar documentul utilizatorului, fără a verifica colecția de admini
    const usersCollection = collection(firestore, "users");
    const userQuery = query(usersCollection, where("email", "==", userEmail));
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();
      if (userData.isAdmin === true || userData.role === "admin") {
        userRolesLogger.info(`User ${userEmail} has admin flag in user document`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    userRolesLogger.error("Error checking admin status:", error);
    // Fallback pentru email-ul principal de admin
    return ADMIN_EMAILS.includes(userEmail);
  }
};

/**
 * Makes a user admin by adding their email to the admins collection
 */
export const makeUserAdmin = async (userEmail: string): Promise<boolean> => {
  if (!userEmail) return false;
  
  try {
    // First check if user is already admin
    if (await isUserAdmin(userEmail)) {
      userRolesLogger.info(`User ${userEmail} is already an admin.`);
      return true;
    }
    
    // Add to admins collection only if needed
    try {
      await ensureAdminInCollection(userEmail);
    } catch (error) {
      userRolesLogger.error("Could not add to admins collection, trying user document update:", error);
      // Fallback: update user document directly
      const usersCollection = collection(firestore, "users");
      const userQuery = query(usersCollection, where("email", "==", userEmail));
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        await setDoc(doc(firestore, "users", userDoc.id), {
          isAdmin: true,
          role: "admin",
          updatedAt: new Date()
        }, { merge: true });
      }
    }
    
    userRolesLogger.info(`User ${userEmail} has been made an admin.`);
    return true;
  } catch (error) {
    userRolesLogger.error("Error making user admin:", error);
    return false;
  }
};

/**
 * Ensures a user is added to the admins collection
 */
export const ensureAdminInCollection = async (userEmail: string): Promise<void> => {
  try {
    // Check if admin document already exists
    const adminsCollection = collection(firestore, "admins");
    const q = query(adminsCollection, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Add to admins collection if not present
      await addDoc(adminsCollection, {
        email: userEmail,
        createdAt: new Date()
      });
      userRolesLogger.info(`Admin added to collection: ${userEmail}`);
    }
  } catch (error) {
    userRolesLogger.error("Error ensuring admin in collection:", error);
    throw error; // Re-throw for handling in caller
  }
};

export const assignRoleToUser = async (userId: string, role: string): Promise<void> => {
  try {
    const userRoleRef = doc(db, "userRoles", userId);
    await setDoc(userRoleRef, { role, updatedAt: new Date() }, { merge: true });
  } catch (error) {
    userRolesLogger.error("Error assigning role to user:", error);
  }
};
