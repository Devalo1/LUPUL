import { collection, getDocs, addDoc, doc as _doc, deleteDoc as _deleteDoc, where as _where, query as _query, serverTimestamp, Timestamp as _Timestamp } from "firebase/firestore";

// Utilitar pentru gestionarea erorilor Firestore
export const handleFirestoreError = (error: any): string => {
  console.error("Eroare Firestore:", error);
  
  // Înregistrăm tipul erorii pentru debugging
  if (error.code) {
    console.error(`Cod eroare: ${error.code}`);
  }
  
  // Returnam mesaje în limba română mai prietenoase
  switch (error.code) {
    case "permission-denied":
      return "Nu aveți permisiunea de a accesa aceste date.";
    case "not-found":
      return "Datele solicitate nu au fost găsite.";
    case "already-exists":
      return "Aceste date există deja.";
    case "resource-exhausted":
      return "Limita de acces la baza de date a fost depășită. Încercați din nou mai târziu.";
    case "unavailable":
      return "Serviciul este momentan indisponibil. Verificați conexiunea la internet.";
    case "unauthenticated":
      return "Sesiunea dumneavoastră a expirat. Vă rugăm să vă autentificați din nou.";
    default:
      return "A apărut o eroare neașteptată. Vă rugăm încercați din nou.";
  }
};

// Funcție pentru inițializarea serviciilor în Firestore
export const initializeDefaultServices = async (firestore: any) => {
  try {
    console.log("Verificăm existența serviciilor în baza de date...");
    const servicesRef = collection(firestore, "services");
    const snapshot = await getDocs(servicesRef);

    // Dacă nu există servicii în colecție, adăugăm servicii implicite
    if (snapshot.empty) {
      console.log("Nu există servicii. Adăugăm servicii implicite...");
      const defaultServices = [
        {
          name: "Consultație Psihologică",
          category: "Psihologie",
          duration: 60,
          price: 150,
          description: "Consultație individuală cu psiholog",
          isActive: true,
          createdAt: serverTimestamp()
        },
        {
          name: "Terapie de Cuplu",
          category: "Terapie",
          duration: 90,
          price: 200,
          description: "Ședință de terapie pentru cupluri",
          isActive: true,
          createdAt: serverTimestamp()
        },
        {
          name: "Coaching Personal",
          category: "Coaching",
          duration: 60,
          price: 180,
          description: "Coaching pentru dezvoltare personală",
          isActive: true,
          createdAt: serverTimestamp()
        },
        {
          name: "Consiliere Educațională",
          category: "Educație",
          duration: 45,
          price: 120,
          description: "Consiliere pentru elevi și studenți",
          isActive: true,
          createdAt: serverTimestamp()
        },
        {
          name: "Antrenament Fitness",
          category: "Sport",
          duration: 60,
          price: 100,
          description: "Antrenament personalizat de fitness",
          isActive: true,
          createdAt: serverTimestamp()
        },
        {
          name: "Yoga Terapeutică",
          category: "Sport",
          duration: 60,
          price: 120,
          description: "Ședință de yoga terapeutică",
          isActive: true,
          createdAt: serverTimestamp()
        }
      ];

      for (const service of defaultServices) {
        await addDoc(collection(firestore, "services"), service);
      }
      console.log("Servicii implicite adăugate cu succes!");
      return true;
    } else {
      console.log(`Serviciile există deja în baza de date (${snapshot.docs.length} servicii).`);
      return false;
    }
  } catch (error) {
    console.error("Eroare la inițializarea serviciilor:", error);
    throw error;
  }
};