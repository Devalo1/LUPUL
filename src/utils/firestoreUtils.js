import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase";

// Funcție pentru gestionarea erorilor Firestore într-un mod mai prietenos pentru utilizator
const handleFirestoreError = (error, message) => {
  console.error(`${message}:`, error);
  
  let errorMessage = "A apărut o eroare la comunicarea cu baza de date. Vă rugăm încercați din nou.";
  
  if (error.code === 'permission-denied') {
    errorMessage = "Nu aveți permisiunea de a accesa această resursă.";
  } else if (error.code === 'not-found') {
    errorMessage = "Resursa solicitată nu a fost găsită în baza de date.";
  } else if (error.code === 'unavailable') {
    errorMessage = "Serviciul este temporar indisponibil. Vă rugăm încercați mai târziu.";
  } else if (error.code === 'resource-exhausted') {
    errorMessage = "Numărul de cereri către server a fost depășit. Vă rugăm încercați mai târziu.";
  }
  
  return {
    error: true,
    message: errorMessage,
    originalError: error
  };
};

// Hook pentru încărcarea și gestionarea serviciilor
export const useServices = (specialistId = null) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Încercăm întâi să încărcăm serviciile specifice specialistului
        if (specialistId) {
          const specialistServicesRef = collection(firestore, "specialistServices");
          const q = query(
            specialistServicesRef, 
            where("specialistId", "==", specialistId),
            where("isActive", "==", true)
          );
          
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            const specialistServicesData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            setServices(specialistServicesData);
            setLoading(false);
            return;
          }
        }
        
        // Dacă nu există servicii specifice sau nu avem specialistId, încărcăm toate serviciile
        const servicesRef = collection(firestore, "services");
        const snapshot = await getDocs(servicesRef);
        
        if (!snapshot.empty) {
          const servicesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setServices(servicesData);
        } else {
          // Servicii implicite în cazul în care colecția este goală
          setServices([
            {
              id: "default1",
              name: "Consultație Psihologică",
              category: "Psihologie",
              duration: 60,
              price: 150,
              description: "Consultație individuală cu psiholog"
            },
            {
              id: "default2",
              name: "Terapie de Cuplu",
              category: "Terapie",
              duration: 90,
              price: 200,
              description: "Ședință de terapie pentru cupluri"
            },
            {
              id: "default3",
              name: "Coaching Personal",
              category: "Coaching",
              duration: 60,
              price: 180,
              description: "Coaching pentru dezvoltare personală"
            }
          ]);
        }
      } catch (err) {
        console.error("Eroare la încărcarea serviciilor:", err);
        setError("A apărut o eroare la încărcarea serviciilor. Vă rugăm încercați din nou.");
        
        // Servicii implicite în caz de eroare
        setServices([
          {
            id: "fallback1",
            name: "Consultație Psihologică",
            category: "Psihologie",
            duration: 60,
            price: 150,
            description: "Consultație individuală cu psiholog"
          },
          {
            id: "fallback2",
            name: "Terapie de Cuplu",
            category: "Terapie",
            duration: 90,
            price: 200,
            description: "Ședință de terapie pentru cupluri"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, [specialistId]);
  
  return { services, loading, error };
};

// Verifică dacă un utilizator este specialist
export const isUserSpecialist = async (userId) => {
  if (!userId) return false;
  
  try {
    console.log("Checking if user is specialist:", userId);
    // Verificare în colecția de utilizatori
    const userRef = doc(firestore, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      console.log("User data for specialist check:", userData);
      
      // Check if user has specialist role or isSpecialist flag
      if ((userData.role === "SPECIALIST" || userData.role === "specialist" || userData.isSpecialist === true) &&
          userData.isActive !== false) {
        console.log("User is specialist based on users collection");
        return true;
      }
    }
    
    // Backup: Check specialists collection
    try {
      const specialistsRef = collection(firestore, "specialists");
      // Important: Check both where userId equals and where id equals
      const byUserId = query(specialistsRef, where("userId", "==", userId));
      
      const [byUserIdSnap] = await Promise.all([
        getDocs(byUserId)
      ]);
      
      if (!byUserIdSnap.empty) {
        console.log("User is specialist based on specialists collection (userId match)");
        return true;
      }
      
      // Last resort: direct document check
      const directSpecialistRef = doc(firestore, "specialists", userId);
      const directSpecialistSnap = await getDoc(directSpecialistRef);
      
      if (directSpecialistSnap.exists()) {
        console.log("User is specialist based on direct specialists collection lookup");
        return true;
      }
    } catch (specialistsError) {
      console.error("Error checking specialists collection:", specialistsError);
    }
    
    console.log("User is NOT a specialist");
    return false;
  } catch (error) {
    console.error("Error checking specialist status:", error);
    return false;
  }
};

// Verifică dacă există cereri de rol în așteptare
export const checkPendingRoleRequests = async (userId) => {
  if (!userId) return false;
  
  try {
    const requestsRef = collection(firestore, "roleChangeRequests");
    const q = query(
      requestsRef, 
      where("userId", "==", userId),
      where("status", "==", "pending")
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking pending role requests:", error);
    return false;
  }
};

export { handleFirestoreError };