import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArwMLIjHLlWktmhMwNaW1JGWVyGBVjJgQ",
  authDomain: "ai-chatbot-57d9e.firebaseapp.com",
  projectId: "ai-chatbot-57d9e",
  storageBucket: "ai-chatbot-57d9e.firebasestorage.app",
  messagingSenderId: "1064397404355",
  appId: "1:1064397404355:web:7d61f97b0a4e8e8b6f32cb",
  measurementId: "G-1WJEX0FJZK",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkEmblemStocks() {
  try {
    console.log("Checking emblem stocks...");

    const docRef = doc(db, "emblem_stocks", "current_stock");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("Emblem stocks found:", data);
    } else {
      console.log("No emblem stocks document found");
    }
  } catch (error) {
    console.error("Error checking stocks:", error);
  }
}

checkEmblemStocks();
