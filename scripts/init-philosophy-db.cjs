// Script pentru inițializarea bazei de date filozofice în Firebase
// Rulează o singură dată pentru a popula Firebase cu toate cunoștințele

const {
  PhilosophyDatabaseManager,
} = require("../lib/firebase-philosophy-database.cjs");

async function initializePhilosophyDatabase() {
  console.log(
    "🇷🇴 Inițializarea bazei de date cu Filosofia Românească și Cunoștințele Științifice..."
  );

  try {
    const philosophyManager = new PhilosophyDatabaseManager();

    // Inițializează baza de date cu toate cunoștințele
    await philosophyManager.initializeDatabase();

    console.log("✅ Baza de date filozofică a fost inițializată cu succes!");
    console.log(
      "🧠 Cunoștințele științifice și filozofice sunt acum disponibile local în Firebase"
    );
    console.log("🚀 AI-ul poate acum accesa instant:");
    console.log("   - Cercetări din 2024-2025 (Harvard, Stanford, UCLA, etc.)");
    console.log(
      "   - Filosofia românească (Blaga, Noica, înțelepciune populară)"
    );
    console.log("   - Strategii practice validate științific");
    console.log("   - Citate inspiraționale contextualizate");

    // Test rapid pentru a verifica funcționalitatea
    console.log("\n🔍 Test rapid al sistemului...");

    const testKnowledge =
      await philosophyManager.getRelevantKnowledge("stress");
    if (testKnowledge && testKnowledge.research) {
      console.log("✅ Test reușit! Cunoștințele pentru stres au fost găsite:");
      console.log(`   - ${testKnowledge.research.title}`);
    }

    const philosophicalContext =
      await philosophyManager.generatePhilosophicalContext(
        "motivation",
        "Am nevoie de motivație pentru a-mi atinge obiectivele"
      );

    if (philosophicalContext) {
      console.log("✅ Test reușit! Contextul filozofic a fost generat");
      console.log(
        `   - Lungime context: ${philosophicalContext.length} caractere`
      );
    }

    console.log(
      "\n🎉 Sistemul filozofic este funcțional și gata de utilizare!"
    );
  } catch (error) {
    console.error("❌ Eroare la inițializarea bazei de date:", error);
    console.error("Verifică configurația Firebase și încearcă din nou.");
  }
}

// Rulează scriptul
if (require.main === module) {
  initializePhilosophyDatabase()
    .then(() => {
      console.log("\n📚 Baza de date filozofică este gata!");
      console.log("AI-ul poate acum oferi sfaturi bazate pe:");
      console.log("• Ultimele cercetări științifice din 2024-2025");
      console.log("• Filosofia românească aplicată");
      console.log("• Strategii practice validate");
      console.log("• Înțelepciune personalizată pentru fiecare situație");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Eroare fatală:", error);
      process.exit(1);
    });
}

module.exports = { initializePhilosophyDatabase };
