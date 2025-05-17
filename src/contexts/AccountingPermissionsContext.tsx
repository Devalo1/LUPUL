import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";
import { 
  AccountingPermission, 
  getAccountingPermissions, 
  hasPermission 
} from "../utils/accountingPermissions";

interface AccountingPermissionsContextType {
  isAdmin: boolean;
  isAccountant: boolean;
  permissions: Set<AccountingPermission>;
  hasPermission: (permission: AccountingPermission) => boolean;
  loading: boolean;
  isLoading: boolean; // Added for backward compatibility
  error: string | null;
}

const defaultContext: AccountingPermissionsContextType = {
  isAdmin: false,
  isAccountant: false,
  permissions: new Set<AccountingPermission>(),
  hasPermission: () => false,
  loading: true,
  isLoading: true, // Added for backward compatibility
  error: null
};

const AccountingPermissionsContext = createContext<AccountingPermissionsContextType>(defaultContext);

/**
 * Hook pentru a utiliza contextul de permisiuni contabile
 */
export const useAccountingPermissions = () => useContext(AccountingPermissionsContext);

interface AccountingPermissionsProviderProps {
  children: ReactNode;
}

/**
 * Provider pentru contextul de permisiuni contabile
 * Gestionează determinarea rolurilor și permisiunilor utilizatorului
 */
export const AccountingPermissionsProvider: React.FC<AccountingPermissionsProviderProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAccountant, setIsAccountant] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<Set<AccountingPermission>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
        setIsAccountant(false);
        setPermissions(new Set());
        setLoading(false);
        return;
      }

      try {
        // Obține rolurile utilizatorului din Firestore
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          setError("Profilul utilizatorului nu a fost găsit");
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        
        // Determină rolurile utilizatorului
        const userIsAdmin = 
          userData.role === "admin" || 
          userData.isAdmin === true || 
          (userData.roles && userData.roles.admin === true);
          
        const userIsAccountant = 
          userData.role === "accountant" || 
          userData.isAccountant === true || 
          (userData.roles && userData.roles.accountant === true);
        
        // Actualizează starea
        setIsAdmin(userIsAdmin);
        setIsAccountant(userIsAccountant);
        
        // Obține permisiunile bazate pe roluri
        const userPermissions = getAccountingPermissions(userIsAdmin, userIsAccountant);
        setPermissions(userPermissions);
        
      } catch (err) {
        console.error("Error fetching user roles:", err);
        setError("Nu s-au putut încărca permisiunile utilizatorului");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Funcție pentru a verifica dacă utilizatorul are o permisiune specifică
  const checkPermission = (permission: AccountingPermission): boolean => {
    return hasPermission(permissions, permission);
  };
  const value = {
    isAdmin,
    isAccountant,
    permissions,
    hasPermission: checkPermission,
    loading,
    isLoading: loading, // Added for backward compatibility
    error
  };

  return (
    <AccountingPermissionsContext.Provider value={value}>
      {children}
    </AccountingPermissionsContext.Provider>
  );
};

export default AccountingPermissionsProvider;