/**
 * Utilități pentru gestionarea specialiștilor
 * Acest fișier conține funcții pentru detectarea și gestionarea specialiștilor în aplicație
 */

import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Verifică dacă un utilizator este specialist pe baza ID-ului sau emailului
 * Caută în multiple locații pentru a asigura detectarea corectă
 */
export const isUserSpecialist = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // Verificare 1: Verifică dacă există un document în colecția "specialists" cu acest ID
    const specialistRef = doc(db, "specialists", userId);
    const specialistDoc = await getDoc(specialistRef);
    
    if (specialistDoc.exists()) {
      console.log("Specialist găsit direct în colecția specialists");
      return true;
    }
    
    // Verificare 2: Caută în colecția "specialists" un document cu câmpul userId = userId
    const specialistsQuery = query(
      collection(db, "specialists"),
      where("userId", "==", userId)
    );
    
    const specialistsSnapshot = await getDocs(specialistsQuery);
    
    if (!specialistsSnapshot.empty) {
      console.log("Specialist găsit în colecția specialists după userId");
      return true;
    }
    
    // Verificare 3: Verifică în colecția "users" dacă utilizatorul are rolul de specialist
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      if (
        userData.role === "specialist" ||
        userData.isSpecialist === true ||
        userData.specialization
      ) {
        console.log("Utilizator cu rol de specialist găsit în colecția users");
        return true;
      }
    }
    
    // Nu s-a găsit specialist cu acest ID
    return false;
  } catch (error) {
    console.error("Eroare la verificarea rolului de specialist:", error);
    return false;
  }
};

/**
 * Obține informațiile complete despre un specialist din oricare colecție disponibilă
 * Returnează doar informațiile adăugate explicit de specialist, fără completare automată
 */
export const getSpecialistData = async (specialistId: string) => {
  if (!specialistId) return null;
  
  try {
    // Verifică mai întâi în colecția "specialists"
    const specialistRef = doc(db, "specialists", specialistId);
    const specialistDoc = await getDoc(specialistRef);
    
    if (specialistDoc.exists()) {
      const data = specialistDoc.data();
      return {
        id: specialistDoc.id,
        ...data,
        source: "specialists_collection_direct"
      };
    }
    
    // Caută după userId în colecția "specialists"
    const specialistsQuery = query(
      collection(db, "specialists"),
      where("userId", "==", specialistId)
    );
    
    const specialistsSnapshot = await getDocs(specialistsQuery);
    
    if (!specialistsSnapshot.empty) {
      const specialistData = specialistsSnapshot.docs[0];
      return {
        id: specialistData.id,
        ...specialistData.data(),
        source: "specialists_collection_by_userId"
      };
    }
    
    // Verifică în colecția "users"
    const userRef = doc(db, "users", specialistId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Verifică dacă utilizatorul are rol de specialist
      if (
        userData.role === "specialist" ||
        userData.isSpecialist === true ||
        userData.specialization
      ) {
        return {
          id: userDoc.id,
          fullName: userData.displayName || userData.fullName || null,
          specialization: userData.specialization || null,
          email: userData.email || null,
          phone: userData.phone || userData.phoneNumber || null,
          bio: userData.bio || userData.description || null,
          isActive: userData.isActive ?? true,
          photoURL: userData.photoURL || userData.imageUrl || null,
          education: userData.education || null,
          certifications: userData.certifications || null,
          experience: userData.experience || null,
          languages: userData.languages || null,
          awards: userData.awards || null,
          publications: userData.publications || null,
          userId: userDoc.id,
          source: "users_collection"
        };
      }
    }
    
    // Specialist negăsit în nicio colecție
    return null;
  } catch (error) {
    console.error("Eroare la obținerea datelor specialistului:", error);
    return null;
  }
};

/**
 * Sincronizează informațiile despre un specialist între colecții
 * Asigură consistența datelor specialistului în întreaga aplicație
 */
export const syncSpecialistData = async (_specialistId: string) => {
  // Implementare în viitor
};

export default {
  isUserSpecialist,
  getSpecialistData,
  syncSpecialistData
};