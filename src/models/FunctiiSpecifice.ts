import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, addDoc, setDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import logger from "../utils/logger";

// Check if we're in browser environment
const isBrowser = typeof window !== "undefined";

// Utility types to replace 'any'
type ProductData = Record<string, unknown>;
type FirestoreDocument = Record<string, unknown>;
type FirestoreQuery = {
  collection: string;
  field: string;
  operator: string;
  value: unknown;
};

// Safely import server-side modules
let mongoose: any;
let UserModel: any;
let ProductModel: any;

// Only attempt to import server modules if we're not in the browser
// Use a function to delay the import until runtime
const loadServerModules = async () => {
  if (isBrowser) return false;
  
  try {
    // Use dynamic import with a variable path to prevent build-time resolution
    const mongooseModule = await Function("return import(\"mongoose\")")();
    mongoose = mongooseModule.default;
    
    // Use Function constructor to create dynamic imports that won't be processed at build time
    const userServerPath = "./User.server";
    const userModule = await new Function(`return import('${userServerPath}')`)();
    UserModel = userModule.default;
    
    const productServerPath = "./Product.server";
    const productModule = await new Function(`return import('${productServerPath}')`)();
    ProductModel = productModule.default;
    
    return true;
  } catch (err) {
    logger.error("Failed to load server modules:", err);
    return false;
  }
};

// Funcții specifice pentru operații repetitive cu Firestore
export const FunctiiSpecifice = {
  // Obține un document după ID din colecția specificată
  obtineDocument: async (colectie: string, id: string) => {
    try {
      const docRef = doc(firestore, colectie, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { 
          id: docSnap.id, 
          ...docSnap.data() 
        };
      } else {
        return null;
      }
    } catch (error) {
      logger.error(`Eroare la obținerea documentului din ${colectie}:`, error);
      throw error;
    }
  },
  
  // Execută o interogare simplă și returnează rezultatele
  executaInterogare: async (interogare: FirestoreQuery) => {
    try {
      const colectieRef = collection(firestore, interogare.collection);
      const q = query(colectieRef, where(interogare.field, interogare.operator as any, interogare.value));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return [];
      }
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logger.error("Eroare la executarea interogării:", error);
      throw error;
    }
  },
  
  // Adaugă un document într-o colecție
  adaugaDocument: async (colectie: string, date: FirestoreDocument) => {
    try {
      const colectieRef = collection(firestore, colectie);
      const docRef = await addDoc(colectieRef, {
        ...date,
        createdAt: new Date()
      });
      
      logger.info(`Document adăugat în ${colectie} cu ID: ${docRef.id}`);
      
      return {
        id: docRef.id,
        ...date
      };
    } catch (error) {
      logger.error(`Eroare la adăugarea documentului în ${colectie}:`, error);
      throw error;
    }
  },
  
  // Actualizează un document existent
  actualizeazaDocument: async (colectie: string, id: string, date: FirestoreDocument) => {
    try {
      const docRef = doc(firestore, colectie, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Documentul cu ID ${id} nu a fost găsit în colecția ${colectie}`);
      }
      
      await updateDoc(docRef, {
        ...date,
        updatedAt: new Date()
      });
      
      logger.info(`Document actualizat în ${colectie} cu ID: ${id}`);
      
      return {
        id,
        ...docSnap.data(),
        ...date
      };
    } catch (error) {
      logger.error(`Eroare la actualizarea documentului din ${colectie}:`, error);
      throw error;
    }
  },
  
  // Adaugă un element în array-ul unui document
  adaugaInArray: async (colectie: string, id: string, camp: string, valoare: unknown) => {
    try {
      const docRef = doc(firestore, colectie, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Documentul cu ID ${id} nu a fost găsit în colecția ${colectie}`);
      }
      
      await updateDoc(docRef, {
        [camp]: arrayUnion(valoare)
      });
      
      logger.info(`Element adăugat în array-ul ${camp} al documentului ${id} din ${colectie}`);
      
      const updatedDoc = await getDoc(docRef);
      return {
        id,
        ...updatedDoc.data()
      };
    } catch (error) {
      logger.error(`Eroare la adăugarea în array-ul ${camp}:`, error);
      throw error;
    }
  },
  
  // Verifică dacă un document există
  documentExista: async (colectie: string, id: string): Promise<boolean> => {
    try {
      const docRef = doc(firestore, colectie, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      logger.error(`Eroare la verificarea existenței documentului ${id} din ${colectie}:`, error);
      return false;
    }
  },
  
  // Obține toate produsele dintr-o categorie
  obtineProduseDinCategorie: async (categorie: string): Promise<ProductData[]> => {
    try {
      const produseRef = collection(firestore, "products");
      const q = query(produseRef, where("category", "==", categorie));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logger.error(`Eroare la obținerea produselor din categoria ${categorie}:`, error);
      throw error;
    }
  }
};

// Funcție pentru a repara utilizatorul admin principal
export const reparareDaniPopaAdmin = async (): Promise<boolean> => {
  try {
    const email = "dani_popa21@yahoo.ro";
    
    // Skip MongoDB operations in browser environment
    if (!isBrowser) {
      try {
        const modulesLoaded = await loadServerModules();
        
        if (modulesLoaded && mongoose.connection.readyState) {
          const userMongo = await UserModel.findOne({ email });
          if (userMongo) {
            if (!userMongo.isAdmin) {
              userMongo.isAdmin = true;
              await userMongo.save();
              logger.info("Reparat rol admin în MongoDB pentru", email);
            }
          }
        }
      } catch (err) {
        logger.warn("Operațiuni MongoDB ignorate în mediul browser:", err);
      }
    }
    
    // Firebase operations work in both environments
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      if (!userData.isAdmin) {
        await updateDoc(doc(firestore, "users", userDoc.id), {
          isAdmin: true,
          role: "admin"
        });
        logger.info("Reparat rol admin în Firestore pentru", email);
      }
    } else {
      // Creare utilizator nou dacă nu există
      await setDoc(doc(firestore, "users", email), {
        email,
        isAdmin: true,
        role: "admin",
        displayName: "Administrator",
        createdAt: new Date()
      });
      logger.info("Creat utilizator admin în Firestore pentru", email);
    }
    
    return true;
  } catch (error) {
    logger.error("Eroare la repararea utilizatorului admin:", error);
    return false;
  }
};

// Funcție pentru a restaura produsul "Dulceață de afine"
export const restaurareProdusAfine = async (): Promise<boolean> => {
  try {
    // Skip MongoDB operations in browser environment
    if (!isBrowser) {
      try {
        const modulesLoaded = await loadServerModules();
        
        if (modulesLoaded && mongoose.connection.readyState) {
          const produs = await ProductModel.findOne({ 
            name: { $regex: /dulceață de afine/i }
          });
          
          if (!produs) {
            // Căutăm în produsele șterse
            const produsInactiv = await ProductModel.findOneDeleted({
              name: { $regex: /dulceață de afine/i }
            });
            
            if (produsInactiv) {
              await produsInactiv.restore();
              logger.info("Produsul dulceață de afine restaurat din coșul de gunoi");
            } else {
              // Creăm produs nou
              const produsNou = new ProductModel({
                name: "Dulceață de afine",
                description: "Dulceață tradițională de afine",
                price: 25.0,
                category: "produse tradiționale",
                images: ["afine1.jpg", "afine2.jpg"],
                active: true
              });
              await produsNou.save();
              logger.info("Produs nou dulceață de afine creat");
            }
          } else if (!produs.active || produs.category !== "produse tradiționale") {
            produs.active = true;
            produs.category = "produse tradiționale";
            await produs.save();
            logger.info("Produsul dulceață de afine actualizat");
          }
        }
      } catch (err) {
        logger.warn("Operațiuni MongoDB ignorate în mediul browser:", err);
      }
    }
    
    // Firebase operations work in both environments
    const produseRef = collection(firestore, "produse");
    const q = query(produseRef, where("name", "==", "Dulceață de afine"));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Creare produs în Firestore dacă nu există
      await setDoc(doc(produseRef), {
        name: "Dulceață de afine",
        description: "Dulceață tradițională de afine",
        price: 25.0,
        category: "produse tradiționale",
        images: ["afine1.jpg", "afine2.jpg"],
        active: true,
        createdAt: new Date()
      });
      logger.info("Produs Firestore creat: Dulceață de afine");
    } else {
      // Actualizare produs existent
      const produsDoc = querySnapshot.docs[0];
      const produsData = produsDoc.data();
      
      if (!produsData.active || produsData.category !== "produse tradiționale") {
        await updateDoc(doc(firestore, "produse", produsDoc.id), {
          active: true,
          category: "produse tradiționale"
        });
        logger.info("Produs Firestore actualizat: Dulceață de afine");
      }
    }
    
    return true;
  } catch (error) {
    logger.error("Eroare la restaurarea produsului dulceață de afine:", error);
    return false;
  }
};
