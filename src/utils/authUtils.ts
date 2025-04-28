import { User as _BaseUser } from "../types/auth";
import { 
  collection as _collection, 
  query as _query, 
  where as _where, 
  getDocs as _getDocs, 
  getDoc, 
  doc, 
  addDoc as _addDoc 
} from "firebase/firestore";
import { db as _db, firestore } from "../firebase";
import { getAuth, signOut as _signOut } from "firebase/auth";

/**
 * Verifică dacă un utilizator are rol de administrator
 * @param userId ID-ul utilizatorului de verificat
 * @returns Promise care se rezolvă cu true dacă utilizatorul este admin, false în caz contrar
 */
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const db = firestore;
    
    // Verificăm dacă utilizatorul există în colecția de admini
    const adminDocRef = doc(db, "admins", userId);
    const adminDocSnap = await getDoc(adminDocRef);
    
    if (adminDocSnap.exists()) {
      return true;
    }
    
    // Verificăm dacă utilizatorul are flag-ul isAdmin în profilul său
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists() && userDocSnap.data()?.isAdmin === true) {
      return true;
    }
    
    // Verificăm custom claims (token) pentru admin
    const auth = getAuth();
    const idTokenResult = await auth.currentUser?.getIdTokenResult();
    
    if (idTokenResult?.claims?.admin === true) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

/**
 * Verifică dacă un utilizator are rol de specialist
 * @param userId ID-ul utilizatorului de verificat
 * @returns Promise care se rezolvă cu true dacă utilizatorul este specialist, false în caz contrar
 */
export const isUserSpecialist = async (userId: string): Promise<boolean> => {
  try {
    const db = firestore;
    
    // Verificăm dacă utilizatorul există în colecția de specialiști
    const specialistDocRef = doc(db, "specialists", userId);
    const specialistDocSnap = await getDoc(specialistDocRef);
    
    if (specialistDocSnap.exists()) {
      return true;
    }
    
    // Verificăm dacă utilizatorul are rol de specialist în profilul său
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists() && userDocSnap.data()?.role === "specialist") {
      return true;
    }
    
    // Verificăm custom claims pentru rol de specialist
    const auth = getAuth();
    const idTokenResult = await auth.currentUser?.getIdTokenResult();
    
    if (idTokenResult?.claims?.role === "specialist") {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking specialist status:", error);
    return false;
  }
};

/**
 * Verifică dacă un utilizator are un anumit rol specific
 * @param userId ID-ul utilizatorului
 * @param role Rolul care trebuie verificat
 * @returns Promise care se rezolvă cu true dacă utilizatorul are rolul, false în caz contrar
 */
export const hasUserRole = async (userId: string, role: string): Promise<boolean> => {
  try {
    const db = firestore;
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      
      // Verificăm dacă utilizatorul are rolul specificat în array-ul de roluri
      if (userData.roles && Array.isArray(userData.roles)) {
        return userData.roles.includes(role);
      }
      
      // Sau verificăm dacă utilizatorul are rolul specificat ca proprietate
      if (userData.role === role) {
        return true;
      }
    }
    
    // Verificăm în custom claims
    const auth = getAuth();
    const idTokenResult = await auth.currentUser?.getIdTokenResult();
    
    if (idTokenResult?.claims?.role === role) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error checking role ${role}:`, error);
    return false;
  }
};

/**
 * Obține toate rolurile unui utilizator
 * @param userId ID-ul utilizatorului
 * @returns Promise care se rezolvă cu array-ul de roluri ale utilizatorului
 */
export const getUserRoles = async (userId: string): Promise<string[]> => {
  try {
    const db = firestore;
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    const roles: string[] = [];
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      
      // Adăugăm toate rolurile din array-ul de roluri, dacă există
      if (userData.roles && Array.isArray(userData.roles)) {
        roles.push(...userData.roles);
      }
      
      // Adăugăm rolul principal, dacă există și nu este deja în array
      if (userData.role && !roles.includes(userData.role)) {
        roles.push(userData.role);
      }
    }
    
    // Verificăm dacă utilizatorul este admin
    const isAdmin = await isUserAdmin(userId);
    if (isAdmin && !roles.includes("admin")) {
      roles.push("admin");
    }
    
    // Verificăm dacă utilizatorul este specialist
    const isSpecialist = await isUserSpecialist(userId);
    if (isSpecialist && !roles.includes("specialist")) {
      roles.push("specialist");
    }
    
    return roles;
  } catch (error) {
    console.error("Error getting user roles:", error);
    return [];
  }
};
