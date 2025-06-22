// Test pentru crearea și verificarea profilurilor de personalizare în Firestore
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// Configurația Firebase (folosește variabilele din .env)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Mock pentru a simula browser environment
if (typeof window === "undefined") {
  global.window = {};
}

console.log("🔥 Testez crearea profilului de personalizare în Firestore...");

async function testFirestorePersonalizationProfile() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const testUserId = "test-user-12345";
    const testProfile = {
      userId: testUserId,
      totalMessages: 15,
      totalConversations: 3,
      communicationStyle: {
        preferredTone: "casual",
        averageMessageLength: 45,
        usesEmojis: true,
        preferredLanguage: "ro",
      },
      interests: {
        topics: ["JavaScript", "React", "AI"],
        domains: ["programming", "technology"],
        frequentQuestions: ["how to", "examples", "best practices"],
      },
      behaviorPatterns: {
        mostActiveTimeOfDay: "evening",
        conversationFrequency: 3,
        averageConversationLength: 5,
        preferredResponseLength: "medium",
      },
      personalPreferences: {
        addressMode: "tu",
        preferredExplanationStyle: "simple",
        needsEncouragement: true,
        likesExamples: true,
      },
      emotionalProfile: {
        generalMood: "positive",
        needsSupport: false,
        appreciatesHumor: true,
      },
      learningStyle: {
        prefersStepByStep: true,
        likesVisualDescriptions: true,
        needsRepetition: false,
        asksFollowUpQuestions: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastAnalyzedConversation: null,
    };

    console.log("💾 Salvez profilul de test în Firestore...");

    const profileRef = doc(db, "userPersonalityProfiles", testUserId);
    await setDoc(profileRef, testProfile);

    console.log("✅ Profilul a fost salvat cu succes!");

    // Verifică dacă profilul poate fi citit înapoi
    console.log("📖 Verific dacă profilul poate fi citit...");
    const profileDoc = await getDoc(profileRef);

    if (profileDoc.exists()) {
      const retrievedProfile = profileDoc.data();
      console.log("✅ Profilul a fost citit cu succes!");
      console.log("📊 Profilul conține:", {
        userId: retrievedProfile.userId,
        totalMessages: retrievedProfile.totalMessages,
        preferredTone: retrievedProfile.communicationStyle?.preferredTone,
        interests: retrievedProfile.interests?.topics,
      });

      console.log(
        "🎯 TESTUL A TRECUT - Firestore funcționează corect pentru profilurile de personalizare!"
      );
    } else {
      console.log("❌ Nu am putut citi profilul înapoi din Firestore");
    }
  } catch (error) {
    console.error("❌ Eroare în testul Firestore:", error);

    if (error.code === "permission-denied") {
      console.log("🚨 PROBLEMA: Nu ai permisiuni pentru Firestore!");
      console.log("💡 SOLUȚIE: Asigură-te că:");
      console.log("   1. Ești autentificat în aplicație");
      console.log("   2. Regulile Firestore permit accesul");
      console.log("   3. Proiectul Firebase este configurat corect");
    }
  }
}

// Rulează testul
testFirestorePersonalizationProfile();
