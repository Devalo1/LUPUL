import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { Medication } from "../models/Medication";

// Recomandare personalizată, mentor/prieten
export async function getPersonalizedMedicationRecommendation(
  userId: string
): Promise<string> {
  // 1. Preia profilul utilizatorului
  const userProfileRef = doc(firestore, "userPersonalityProfiles", userId);
  const userProfileSnap = await getDoc(userProfileRef);
  if (!userProfileSnap.exists()) {
    return "Nu am găsit profilul tău. Spune-mi câteva lucruri despre tine și te pot ajuta mai bine!";
  }
  const profile = userProfileSnap.data();

  // 2. Extrage probleme de sănătate, preferințe, interese
  const healthConditions: string[] = profile?.profile?.healthConditions || [];
  const name: string = profile?.profile?.name || "prietenul meu";

  // 3. Caută medicamente relevante
  let meds: Medication[] = [];
  if (healthConditions.length > 0) {
    const medsQuery = query(
      collection(firestore, "medications"),
      where("recommendedFor", "array-contains-any", healthConditions)
    );
    const medsSnap = await getDocs(medsQuery);
    meds = medsSnap.docs.map((doc) => doc.data() as Medication);
  }

  // 4. Formulează răspunsul prietenos
  if (meds.length === 0) {
    return `Hei, ${name}, nu am găsit medicamente potrivite pentru tine momentan. Dacă vrei, povestește-mi mai multe despre ce simți sau ce ai nevoie și voi căuta soluții împreună cu tine!`;
  }

  let response = `Dragă ${name}, am analizat profilul tău și cred că următoarele medicamente ar putea fi potrivite pentru tine, ținând cont de ce mi-ai spus. Îți recomand să discuți cu medicul tău înainte de orice decizie!\n\n`;
  meds.forEach((med) => {
    response += `• ${med.name}: ${med.description || "Fără descriere"}\n`;
    if (med.sideEffects && med.sideEffects.length > 0) {
      response += `  Efecte adverse: ${med.sideEffects.join(", ")}\n`;
    }
    if (med.interactions && med.interactions.length > 0) {
      response += `  Interacțiuni: ${med.interactions.join(", ")}\n`;
    }
    response += "\n";
  });
  response += `\nDacă ai întrebări sau vrei să povestim mai mult, sunt aici pentru tine ca un prieten de încredere! 😊`;
  return response;
}
