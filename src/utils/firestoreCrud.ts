import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { User } from "../models/User";
import { Medication } from "../models/Medication";
import { Conversation } from "../models/Conversation";

// Adaugă un utilizator
export async function addUser(user: User) {
  await addDoc(collection(firestore, "users"), user);
}

// Adaugă un medicament
export async function addMedication(med: Medication) {
  await addDoc(collection(firestore, "medications"), med);
}

// Adaugă o conversație
export async function addConversation(conv: Conversation) {
  await addDoc(collection(firestore, "conversations"), conv);
}

// Obține utilizator după ID
export async function getUserById(id: string): Promise<User | null> {
  const userRef = doc(firestore, "users", id);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? (userSnap.data() as User) : null;
}

// Obține medicamente relevante pentru o condiție
export async function getMedicationsForCondition(
  condition: string
): Promise<Medication[]> {
  const medsQuery = query(
    collection(firestore, "medications"),
    where("recommendedFor", "array-contains", condition)
  );
  const medsSnap = await getDocs(medsQuery);
  return medsSnap.docs.map((doc) => doc.data() as Medication);
}

// Obține conversații pentru un utilizator
export async function getConversationsForUser(
  userId: string
): Promise<Conversation[]> {
  const convQuery = query(
    collection(firestore, "conversations"),
    where("userId", "==", userId)
  );
  const convSnap = await getDocs(convQuery);
  return convSnap.docs.map((doc) => doc.data() as Conversation);
}
