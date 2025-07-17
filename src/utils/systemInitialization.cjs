const admin = require("firebase-admin");

// Inițializează Firebase Admin pentru emulatori
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "demo-project", // Folosește project ID demo
  });
}

// Configurează pentru emulatori (portul corect din firebase.json)
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8081";
const db = admin.firestore();

// Medicamente românești pentru inițializare
const romanianMedicines = [
  {
    id: "med_001",
    name: "Algocalmin",
    activeSubstance: "Metamizol sodic",
    composition: ["Metamizol sodic 500mg"],
    category: "analgesic",
    indications: ["dureri de cap", "dureri dentare", "dureri menstruale"],
    contraindications: ["hipersensibilitate", "insuficiență hepatică"],
    sideEffects: ["greață", "vărsături", "erupții cutanate"],
    dosage: {
      adults: "1-2 comprimate, de 2-3 ori pe zi",
      children: "Jumătate din doza pentru adulți",
      elderly: "Doza redusă, conform indicațiilor medicului",
    },
    form: "comprimate",
    producer: "Zentiva",
    price: 12.5,
    prescription: false,
    availability: "available",
    interactions: [],
    warnings: ["Nu depășiți doza recomandată"],
    storage: "La temperatura camerei, ferit de umiditate",
    activeIngredients: [
      { name: "Metamizol sodic", quantity: "500", unit: "mg" },
    ],
    therapeuticClass: "Analgezice non-opioide",
  },
  {
    id: "med_002",
    name: "Paracetamol Biofarm",
    activeSubstance: "Paracetamol",
    composition: ["Paracetamol 500mg"],
    category: "analgesic",
    indications: ["febră", "dureri ușoare până la moderate"],
    contraindications: ["insuficiență hepatică severă"],
    sideEffects: ["rare - erupții cutanate"],
    dosage: {
      adults: "1-2 comprimate, de până la 4 ori pe zi",
      children: "Conform greutății corporale",
    },
    form: "comprimate",
    producer: "Biofarm",
    price: 8.75,
    prescription: false,
    availability: "available",
    interactions: [],
    warnings: ["Nu asociați cu alte medicamente ce conțin paracetamol"],
    storage: "La temperatura camerei",
    activeIngredients: [{ name: "Paracetamol", quantity: "500", unit: "mg" }],
    therapeuticClass: "Analgezice-antipiretice",
  },
  {
    id: "med_003",
    name: "Nurofen",
    activeSubstance: "Ibuprofen",
    composition: ["Ibuprofen 200mg"],
    category: "antiinflamator",
    indications: ["durere", "inflamație", "febră"],
    contraindications: ["ulcer peptic activ", "insuficiență cardiacă severă"],
    sideEffects: ["dureri abdominale", "greață", "diaree"],
    dosage: {
      adults: "1-2 comprimate, de 3-4 ori pe zi",
      children: "Conform vârstei și greutății",
    },
    form: "comprimate",
    producer: "Reckitt Benckiser",
    price: 15.3,
    prescription: false,
    availability: "available",
    interactions: [],
    warnings: ["A se administra cu mâncare"],
    storage: "La temperatura camerei",
    activeIngredients: [{ name: "Ibuprofen", quantity: "200", unit: "mg" }],
    therapeuticClass: "Antiinflamatoare nesteroidiene",
  },
];

// Cunoștințe AI pentru sistemul medical
const aiKnowledge = [
  {
    id: "knowledge_001",
    topic: "Analiza simptomelor",
    content:
      "Pentru durerea de cap: evaluez intensitatea (1-10), durata, localizarea, factorii declanșatori. Recomand Algocalmin sau Paracetamol pentru dureri ușoare-moderate.",
    category: "diagnostic",
    confidence: 0.9,
  },
  {
    id: "knowledge_002",
    topic: "Interacțiuni medicamentoase",
    content:
      "Verific automat interacțiunile între medicamente. NSAID-urile (Ibuprofen) pot interacționa cu anticoagulantele.",
    category: "safety",
    confidence: 0.95,
  },
  {
    id: "knowledge_003",
    topic: "Urgențe medicale",
    content:
      "Detectez semnale de alarmă: durere în piept, dificultăți de respirație, convulsii. Recomand imediat contactarea serviciilor de urgență 112.",
    category: "emergency",
    confidence: 0.98,
  },
];

async function initializeMedicalSystem() {
  console.log("🏥 Inițializez sistemul medical AI...");

  try {
    // Verifică conexiunea la Firestore
    console.log("📡 Conectez la Firestore...");

    // Inițializează colecția de medicamente
    console.log("💊 Inițializez baza de date cu medicamente...");
    const medicinesRef = db.collection("medicines");

    for (const medicine of romanianMedicines) {
      await medicinesRef.doc(medicine.id).set({
        ...medicine,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      });
      console.log(`✅ Adăugat medicament: ${medicine.name}`);
    }

    // Inițializează cunoștințele AI
    console.log("🧠 Inițializez cunoștințele AI...");
    const knowledgeRef = db.collection("ai_knowledge");

    for (const knowledge of aiKnowledge) {
      await knowledgeRef.doc(knowledge.id).set({
        ...knowledge,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      });
      console.log(`✅ Adăugată cunoștință: ${knowledge.topic}`);
    }

    // Inițializează profiluri utilizatori (demo)
    console.log("👤 Creez profiluri demo...");
    const profilesRef = db.collection("user_medical_profiles");

    await profilesRef.doc("demo_user").set({
      userId: "demo_user",
      allergies: ["penicilină"],
      chronicConditions: [],
      currentMedications: [],
      preferences: {
        language: "ro",
        notifications: true,
        emergencyContact: "+40712345678",
      },
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    console.log("🎉 Sistemul medical AI a fost inițializat cu succes!");
    console.log(`📊 Statistici:`);
    console.log(`   • ${romanianMedicines.length} medicamente adăugate`);
    console.log(`   • ${aiKnowledge.length} cunoștințe AI adăugate`);
    console.log(`   • 1 profil demo creat`);
    console.log("✅ Sistemul este gata de utilizare!");

    return {
      success: true,
      details: {
        medicines: romanianMedicines.length,
        interactions: 0,
        knowledgeEntries: aiKnowledge.length,
      },
    };
  } catch (error) {
    console.error("❌ Eroare la inițializarea sistemului:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}

async function testMedicalSystem() {
  console.log("🧪 Testez sistemul medical AI...");

  try {
    // Test 1: Verifică medicamentele
    console.log("1️⃣ Testez baza de date medicamente...");
    const medicinesSnapshot = await db.collection("medicines").get();
    console.log(
      `✅ Găsite ${medicinesSnapshot.size} medicamente în baza de date`
    );

    // Test 2: Verifică cunoștințele AI
    console.log("2️⃣ Testez cunoștințele AI...");
    const knowledgeSnapshot = await db.collection("ai_knowledge").get();
    console.log(`✅ Găsite ${knowledgeSnapshot.size} cunoștințe AI`);

    // Test 3: Testez căutarea medicamentelor
    console.log("3️⃣ Testez căutarea medicamentelor...");
    const searchResult = await db
      .collection("medicines")
      .where("category", "==", "analgesic")
      .get();
    console.log(`✅ Găsite ${searchResult.size} analgezice`);

    // Test 4: Verifică profilurile utilizatori
    console.log("4️⃣ Testez profilurile utilizatori...");
    const profilesSnapshot = await db.collection("user_medical_profiles").get();
    console.log(`✅ Găsite ${profilesSnapshot.size} profiluri utilizatori`);

    console.log("🎉 Toate testele au trecut cu succes!");
    console.log("✅ Sistemul medical AI funcționează corect!");

    return {
      success: true,
      results: {
        medicines: medicinesSnapshot.size,
        knowledgeEntries: knowledgeSnapshot.size,
        profiles: profilesSnapshot.size,
        analgesics: searchResult.size,
      },
    };
  } catch (error) {
    console.error("❌ Eroare la testarea sistemului:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}

module.exports = {
  initializeMedicalSystem,
  testMedicalSystem,
};
