import { firestore } from "../firebase";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";

// Funcție pentru a curăța evenimente duplicate
export const curataEvenimenteDuplicate = async () => {
  try {
    // Obținem toate evenimentele
    const evenimenteRef = collection(firestore, "evenimente");
    const querySnapshot = await getDocs(evenimenteRef);
    
    // Verificăm duplicate după titlu
    const titluriUnice = new Set<string>();
    const evenimenteDuplicate: string[] = [];
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (titluriUnice.has(data.title)) {
        evenimenteDuplicate.push(doc.id);
      } else {
        titluriUnice.add(data.title);
      }
    });
    
    // Ștergem evenimentele duplicate
    if (evenimenteDuplicate.length > 0) {
      // Ștergem documentele duplicate
      const deletePromises = evenimenteDuplicate.map(id => 
        deleteDoc(doc(firestore, "evenimente", id))
      );
      
      await Promise.all(deletePromises);
      
      return {
        success: true,
        message: `S-au eliminat ${evenimenteDuplicate.length} evenimente duplicate`
      };
    }
    
    return {
      success: true,
      message: "Nu s-au găsit evenimente duplicate"
    };
  } catch (error) {
    console.error("Eroare la curățarea evenimentelor duplicate:", error);
    return {
      success: false,
      message: "Eroare la procesarea evenimentelor"
    };
  }
};
