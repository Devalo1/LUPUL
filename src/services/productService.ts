import { firestore } from "../firebase";
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";

// Funcție pentru a verifica și restaura produsul "Dulceață de afine"
export const verificaRestaurareProdusTradițional = async () => {
  try {
    // Verificăm dacă există produsul
    const produseRef = collection(firestore, "produse");
    const q = query(produseRef, where("name", "==", "Dulceață de afine"));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Produsul nu există, îl creăm
      await addDoc(produseRef, {
        name: "Dulceață de afine",
        description: "Dulceață tradițională de afine, preparată după rețeta bunicii",
        price: 25.0,
        category: "produse tradiționale",
        images: ["afine1.jpg", "afine2.jpg"],
        active: true,
        createdAt: new Date()
      });
      
      return {
        success: true,
        message: "Un nou produs \"Dulceață de afine\" a fost creat"
      };
    } else {
      // Produsul există, verificăm statusul și categoria
      const produsDoc = querySnapshot.docs[0];
      const produsData = produsDoc.data();
      
      if (!produsData.active || produsData.category !== "produse tradiționale") {
        // Actualizăm produsul
        await updateDoc(doc(firestore, "produse", produsDoc.id), {
          active: true,
          category: "produse tradiționale"
        });
        
        return {
          success: true,
          message: "Produsul \"Dulceață de afine\" a fost actualizat și activat"
        };
      } else {
        return {
          success: true,
          message: "Produsul \"Dulceață de afine\" există deja și este activ"
        };
      }
    }
  } catch (error) {
    console.error("Eroare la verificarea/restaurarea produsului:", error);
    return {
      success: false,
      message: "Eroare la procesarea produsului"
    };
  }
};
