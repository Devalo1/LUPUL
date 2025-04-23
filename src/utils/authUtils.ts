import { User as BaseUser } from "../types/auth";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc 
} from "firebase/firestore";
import { db } from "../firebase";

// Move context type definition here
export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // ...other properties
}

// Move default context value here
export const defaultAuthContext: AuthContextType = {
  currentUser: null,
  login: async () => {},
  signUp: async () => {},
  logout: async () => {},
  // ...other default values
};

// Move non-component exports here
export const authConstants = {
  // Constants that were in AuthContext.tsx
};

export const authHelpers = {
  // Helper functions that were in AuthContext.tsx
};

// Authentication utility constants
export const AUTH_ERRORS = {
  "auth/user-not-found": "Nu există un cont cu acest email.",
  "auth/wrong-password": "Parolă incorectă.",
  "auth/email-already-in-use": "Există deja un cont cu acest email.",
  "auth/weak-password": "Parola trebuie să aibă minim 6 caractere.",
  "auth/invalid-email": "Adresa de email nu este validă."
};

// Move constants, types, and helper functions here
export const AUTH_STORAGE_KEY = "auth_user";

export interface User extends BaseUser {
  // Additional properties
}

/**
 * Verifică dacă un utilizator are rol de administrator
 * 
 * @param email - Email-ul utilizatorului de verificat
 * @returns Promisiune care se rezolvă cu true dacă utilizatorul este admin, false în caz contrar
 */
export const isUserAdmin = async (email: string): Promise<boolean> => {
  if (!email) return false;
  
  try {
    // Cazul special pentru administratorul principal
    if (email === "dani_popa21@yahoo.ro") {
      console.log("Email administrator principal detectat:", email);
      return true;
    }
    
    // Verificăm în colecția de utilizatori
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      // Verificăm câmpul isAdmin sau rolul de admin
      if (userData.isAdmin === true || userData.role === "admin") {
        console.log("Utilizator admin găsit în baza de date:", email);
        return true;
      }
    }
    
    // Verificăm și în colecția dedicată de admini (dacă există)
    try {
      const adminDocRef = doc(db, "admins", email.replace(/[.@]/g, "_"));
      const adminDoc = await getDoc(adminDocRef);
      
      if (adminDoc.exists()) {
        console.log("Admin găsit în colecția de admini:", email);
        return true;
      }
    } catch (err) {
      // Ignorăm erorile aici, deoarece colecția poate să nu existe
      console.log("Eroare la verificarea colecției de admini (poate lipsi):", err);
    }
    
    console.log("Utilizatorul nu este admin:", email);
    return false;
  } catch (error) {
    console.error("Eroare la verificarea rolului de administrator:", error);
    // În caz de eroare, presupunem că utilizatorul nu este admin
    return false;
  }
};
