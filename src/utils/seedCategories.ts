import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Încarcă categorii de bază în colecția 'categories' din Firestore
 * Această funcție verifică mai întâi dacă există categorii în baza de date
 * și adaugă doar datele esențiale dacă colecția este goală
 */
export const seedCategories = async (): Promise<boolean> => {
  try {
    console.log("Verificăm colecția de categorii...");
    
    // Referință la colecția de categorii
    const categoriesRef = collection(db, "categories");
    
    // Verificăm dacă există deja categorii
    const snapshot = await getDocs(categoriesRef);
    
    if (snapshot.empty) {
      console.log("Nu s-au găsit categorii în baza de date. Se adaugă categorii implicite...");
      
      // Lista de categorii de bază pentru încărcare
      const sampleCategories = [
        {
          name: "Produse Tradiționale",
          slug: "traditionale",
          description: "Produse autentice românești, preparate după rețete tradiționale.",
          imageUrl: "/images/romanian-pattern.png",
          order: 1
        },
        {
          name: "Suplimente Nutritive",
          slug: "suplimente",
          description: "Suplimente naturale pentru întărirea sistemului imunitar și sănătate optimă.",
          imageUrl: "/images/AdobeStock_370191089.jpeg",
          order: 2
        },
        {
          name: "Cărți și Resurse",
          slug: "carti",
          description: "Resurse educaționale pentru dezvoltare personală și un stil de viață sănătos.",
          imageUrl: "/images/AdobeStock_217770381.jpeg",
          order: 3
        }
      ];
      
      // Adăugăm categoriile în Firestore
      for (const category of sampleCategories) {
        try {
          // Verificăm dacă categoria există deja după slug
          const q = query(categoriesRef, where("slug", "==", category.slug));
          const categoryCheck = await getDocs(q);
          
          if (categoryCheck.empty) {
            const docRef = await addDoc(categoriesRef, {
              ...category,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            console.log(`Categorie adăugată cu succes: ${category.name} (ID: ${docRef.id})`);
          } else {
            console.log(`Categoria ${category.name} există deja.`);
          }
        } catch (error) {
          console.error(`Eroare la adăugarea categoriei ${category.name}:`, error);
        }
      }
      
      console.log("Categoriile de bază au fost adăugate cu succes!");
      return true;
    } else {
      console.log(`Colecția de categorii conține deja ${snapshot.docs.length} documente.`);
      return false;
    }
  } catch (error) {
    console.error("Eroare la inițializarea categoriilor:", error);
    return false;
  }
};

export default seedCategories;