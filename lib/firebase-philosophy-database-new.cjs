// Baza de date Firebase pentru filosofia românească și cunoștințele științifice
const admin = require("firebase-admin");

// Inițializare Firebase Admin dacă nu e deja inițializat
if (!admin.apps.length) {
  const isEmulator =
    process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_EMULATOR_HUB;

  if (isEmulator) {
    admin.initializeApp({ projectId: "lupulcorbul" });
    const emulatorHost =
      process.env.FIRESTORE_EMULATOR_HOST || "localhost:8082";
    process.env.FIRESTORE_EMULATOR_HOST = emulatorHost;
    console.log(
      `[FIREBASE-PHILOSOPHY] Folosește emulatorul pe ${emulatorHost}`
    );
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: "lupulcorbul",
    });
  }
}

class PhilosophyDatabaseManager {
  constructor() {
    this.db = admin.firestore();
    this.philosophyCollection = this.db.collection("philosophyDatabase");
  }

  // Generează contextul filozofic pentru un anumit tip de problemă
  async generatePhilosophicalContext(problemType, userMessage, userId) {
    try {
      // Obține principiile generale
      const generalDoc = await this.philosophyCollection.doc("general").get();
      const specificDoc = await this.philosophyCollection
        .doc(problemType)
        .get();

      let context = "";

      // Adaugă contextul general
      if (generalDoc.exists) {
        const generalData = generalDoc.data();
        context += `\n🧠 PRINCIPII FILOZOFICE GENERALE:\n${generalData.principii}\n`;
        context += `\n📚 CERCETĂRI ȘTIINȚIFICE RELEVANTE:\n${generalData.cercetari}\n`;
        context += `\n🇷🇴 ÎNȚELEPCIUNE ROMÂNEASCĂ:\n${generalData.intelepciune_romaneasca}\n`;
      }

      // Adaugă contextul specific problemei
      if (specificDoc.exists) {
        const specificData = specificDoc.data();
        context += `\n🎯 ABORDARE SPECIFICĂ PENTRU ${problemType.toUpperCase()}:\n`;
        context += `📊 Știința spune: ${specificData.stiinta}\n`;
        context += `🏛️ Înțelepciunea românească: ${specificData.intelepciune_romaneasca}\n`;
        context += `🛠️ Strategii practice: ${specificData.strategii_practice}\n`;
        context += `💡 Exerciții recomandate: ${specificData.exercitii}\n`;
      }

      // Adaugă contextul personalizat dacă există userId
      if (userId) {
        const personalContext = await this.getPersonalizedContext(
          userId,
          problemType
        );
        if (personalContext) {
          context += `\n👤 CONTEXT PERSONALIZAT:\n${personalContext}\n`;
        }
      }

      console.log(
        `[PHILOSOPHY_DB] Context generat pentru ${problemType}: ${context.length} caractere`
      );
      return context;
    } catch (error) {
      console.error("[PHILOSOPHY_DB] Eroare la generarea contextului:", error);
      return this.getFallbackContext(problemType);
    }
  }

  // Context personalizat bazat pe istoricul utilizatorului
  async getPersonalizedContext(userId, problemType) {
    try {
      const userProfileRef = this.db.collection("userProfiles").doc(userId);
      const userDoc = await userProfileRef.get();

      if (!userDoc.exists) return null;

      const userData = userDoc.data();
      let personalContext = "";

      // Analizează profilul pentru recomandări personalizate
      if (userData.profile && userData.profile.name) {
        personalContext += `Utilizatorul se numește ${userData.profile.name}. `;
      }

      if (
        userData.profile &&
        userData.profile.interests &&
        userData.profile.interests.length > 0
      ) {
        personalContext += `Are interese în: ${userData.profile.interests.join(", ")}. `;
      }

      if (
        userData.profile &&
        userData.profile.goals &&
        userData.profile.goals.length > 0
      ) {
        personalContext += `Obiectivele sale includ: ${userData.profile.goals.join(", ")}. `;
      }

      // Verifică progresul anterior pentru acest tip de problemă
      const progressDoc = await userProfileRef
        .collection("progress")
        .doc(problemType)
        .get();
      if (progressDoc.exists) {
        const progressData = progressDoc.data();
        personalContext += `A mai lucrat la probleme de tip ${problemType} cu progres: ${progressData.level || "începător"}. `;
      }

      return personalContext;
    } catch (error) {
      console.error("[PHILOSOPHY_DB] Eroare la contextul personalizat:", error);
      return null;
    }
  }

  // Context de rezervă când Firebase nu funcționează
  getFallbackContext(problemType) {
    const fallbackContexts = {
      stress: `
🧠 ȘTIINȚA: Cortisol-ul scade prin respirația profundă și mindfulness (studii UCLA)
🇷🇴 ÎNȚELEPCIUNEA: "Apa trece, pietrele rămân" - problemele trec, tu rămâi puternic
🛠️ PRACTICĂ: Tehnica 4-7-8 de respirație + grounding în prezent
`,
      motivation: `
🧠 ȘTIINȚA: Dopamina se eliberează prin progres mic dar constant (Stanford)
🇷🇴 ÎNȚELEPCIUNEA: "Picătura sapă piatra" - perseverența învinege talentul
🛠️ PRACTICĂ: Metoda SMART + tracking vizual zilnic
`,
      relationships: `
🧠 ȘTIINȚA: Oxitocina crește prin empatie activă și contact uman (Oxford)
🇷🇴 ÎNȚELEPCIUNEA: "Omul cu omul - împărat" - forța vine din comunitate
🛠️ PRACTICĂ: Ascultare activă + validare emoțională + timp de calitate
`,
      work: `
🧠 ȘTIINȚA: Flow-ul apare când abilitățile întâlnesc provocări (Csikszentmihalyi)
🇷🇴 ÎNȚELEPCIUNEA: "Munca cinstită nu rușinează pe nimeni"
🛠️ PRACTICĂ: Găsește elemente de sens în munca actuală + dezvoltă competențe
`,
      personal_growth: `
🧠 ȘTIINȚA: Neuroplasticitatea funcționează toată viața prin provocări graduale
🇷🇴 ÎNȚELEPCIUNEA: "Nu-i bine ca omul să rămână singur în felul lui de a fi"
🛠️ PRACTICĂ: Zone de confort extinse + feedback honest + reflecție zilnică
`,
      general: `
🧠 ȘTIINȚA: Fericirea vine 50% genetică, 10% circumstanțe, 40% alegeri zilnice
🇷🇴 ÎNȚELEPCIUNEA: "Liniștea omului nu se află într-un loc, ci într-o stare"
🛠️ PRACTICĂ: Mindfulness + obiective clare + relații de calitate + sănătate
`,
    };

    return fallbackContexts[problemType] || fallbackContexts.general;
  }

  // Inițializează baza de date cu cunoștințele filozofice
  async initializeDatabase() {
    try {
      console.log("[PHILOSOPHY_DB] Inițializez baza de date filozofică...");

      // Principii generale
      await this.philosophyCollection.doc("general").set({
        principii: `
🌟 FILOSOFIA PRACTICĂ ROMÂNEASCĂ - PRINCIPII DE BAZĂ:

1. EFORTUL CONȘTIENT: "Fiecare pas mic, luat cu intenție, creează transformarea"
2. RĂBDAREA ACTIVĂ: "Să lași timpul să-și facă treaba, dar nu să stai cu mâinile în sân" 
3. ECHILIBRUL DINAMIC: "Precum natura românească - sezonuri de efort și odihnă"
4. ÎNȚELEPCIUNEA APLICATĂ: "Teoria fără practică e stearpă, practica fără gândire e oarbă"
5. CONEXIUNEA UMANĂ: "Nimeni nu se vindecă singur, comunitatea hrănește sufletul"
`,
        cercetari: `
📚 CERCETĂRI ȘTIINȚIFICE ACTUALE (2024-2025):

• NEUROPLASTICITATEA: Creierul se poate remodela toată viața prin provocări graduale (Harvard, MIT)
• PSIHOLOGIA POZITIVĂ: 5 piloni ai bunăstării: PERMA - Positive emotions, Engagement, Relationships, Meaning, Achievement (Seligman)
• TEORIA FLUXULUI: Starea optimală apare când abilitățile întâlnesc provocări echilibrate (Csikszentmihalyi)
• MINDFULNESS: Reduce cortisol-ul cu 23% și îmbunătățește focusul cu 31% (UCLA, Johns Hopkins)
• OBICEIURILE: 21 de zile pentru automatizare, 66 de zile pentru integrare completă (UCL)
• MOTIVAȚIA: Autonomia, competența și conexiunea sunt motoarele intrinseci (Deci & Ryan)
`,
        intelepciune_romaneasca: `
🏛️ ÎNȚELEPCIUNEA ROMÂNEASCĂ TRADIȚIONALĂ APLICATĂ:

• "Picătura sapă piatra" - Persistența învinge talentul natural
• "Apa trece, pietrele rămân" - Dificultățile sunt temporare, caracteru permanent
• "Omul cu omul - împărat" - Forța vine din comunitate și sprijin mutual
• "Nu-i bine ca omul să rămână singur în felul lui de a fi" - Creșterea prin schimbare
• "Munca cinstită nu rușinează pe nimeni" - Satisfacția vine din contribuție
• "Liniștea omului nu se află într-un loc, ci într-o stare" - Pacea interioară e independentă de circumstanțe
`,
      });

      // Specializări pentru fiecare tip de problemă
      await this.initializeStressPhilosophy();
      await this.initializeMotivationPhilosophy();
      await this.initializeRelationshipsPhilosophy();
      await this.initializeWorkPhilosophy();
      await this.initializePersonalGrowthPhilosophy();

      console.log("[PHILOSOPHY_DB] Baza de date inițializată cu succes!");
    } catch (error) {
      console.error(
        "[PHILOSOPHY_DB] Eroare la inițializarea bazei de date:",
        error
      );
      throw error;
    }
  }

  // Inițializează secțiunea pentru stres și anxietate
  async initializeStressPhilosophy() {
    await this.philosophyCollection.doc("stress").set({
      stiinta: `
• Cortisol-ul (hormonul stresului) scade cu 68% prin respirația profundă 4-7-8 (Harvard Medical School)
• Mindfulness-ul reduce simptomele anxietății cu 58% în 8 săptămâni (Jon Kabat-Zinn, MBSR)
• Exercițiul fizic produce endorfine care contracarează stresul (Mayo Clinic)
• Somnul de calitate restaurează cortex-ul prefrontal responsabil de gestionarea emoțiilor
• Natura reduce cortisol-ul cu 21% în doar 20 minute (University of Michigan)
`,
      intelepciune_romaneasca: `
• "Apa trece, pietrele rămân" - Problemele sunt temporare, tu ești permanent
• "Nu te gândi la mâine că mâine se gândește la sine" - Focus pe prezent
• "Răbdarea e mama înțelepciunii" - Calmul aduce claritatea
• "Pe unde nu poate capul, să treacă picioarele" - Adaptabilitatea e forță
`,
      strategii_practice: `
1. TEHNICA 4-7-8: Inspiră 4 secunde, ține 7, expiră 8 (Dr. Andrew Weil)
2. GROUNDING 5-4-3-2-1: 5 lucruri văzute, 4 atinse, 3 auzite, 2 mirosuri, 1 gust
3. PLIMBĂRI ÎN NATURĂ: 20 minute zilnic pentru resetare naturală
4. JURNAL DE GÂNDURI: Scrie 3 gânduri negative + 3 alternative pozitive
5. RUTINA DE SEARĂ: Oprește stimulii cu 1 oră înainte de culcare
`,
      exercitii: `
• DIMINEAȚA: 5 minute respirație + 3 lucruri pentru care ești recunoscător
• ZIUA: La fiecare 2 ore - 1 minut respirație profundă
• SEARA: 10 minute meditație sau relaxare progresivă
• SĂPTĂMÂNAL: 2 ore petrecute în natură fără telefon
• LUNAR: Evaluează și ajustează strategiile de gestionare a stresului
`,
    });
  }

  // Inițializează secțiunea pentru motivație
  async initializeMotivationPhilosophy() {
    await this.philosophyCollection.doc("motivation").set({
      stiinta: `
• Dopamina se eliberează prin progresul mic dar constant, nu prin obiective mari (Stanford)
• Regula 1%: Îmbunătățire zilnică de 1% = progres de 37x într-un an
• Motivația intrinsecă (autonomie, competență, scop) învinge recompensele externe (Deci & Ryan)
• Vizualizarea succesului activează aceleași zone cerebrale ca experiența reală (UCLA)
• Accountability partner-ul crește șansele de succes cu 65% (American Society of Training and Development)
`,
      intelepciune_romaneasca: `
• "Picătura sapă piatra" - Consistența învinge intensitatea
• "Drum lung cu încetul se face" - Progresul gradual e durabil
• "Începutul e jumătate din treabă" - Primul pas e cel mai important
• "Mâna care dă, nu sărăcește niciodată" - Contribuția aduce satisfacție
`,
      strategii_practice: `
1. METODA SMART: Specific, Măsurabil, Atingibil, Relevant, Temporizat
2. TRACKING VIZUAL: Hartă de progres zilnic afișată vizibil
3. MICRO-OBIECTIVE: Împarte țelurile mari în pași de 15 minute
4. RITUALIZE SUCCESS: Celebrează fiecare progres mic realizat
5. ACCOUNTABILITY: Spune unei persoane de încredere obiectivele tale
`,
      exercitii: `
• DIMINEAȚA: Scrie 3 obiective mici pentru ziua curentă
• ZIUA: La fiecare obiectiv îndeplinit - sărbătorește 1 minut
• SEARA: Notează progresul și 1 lecție învățată
• SĂPTĂMÂNAL: Revizuiește și ajustează obiectivele
• LUNAR: Celebrează progresul și stabilește obiective noi
`,
    });
  }

  // Inițializează secțiunea pentru relații
  async initializeRelationshipsPhilosophy() {
    await this.philosophyCollection.doc("relationships").set({
      stiinta: `
• Oxitocina ("hormonul iubirii") crește prin contact fizic și empatie activă (Oxford)
• Relațiile de calitate sunt cel mai puternic predictor al fericirii (Harvard Study of Adult Development)
• Ascultarea activă îmbunătățește satisfacția relațională cu 40% (Gottman Institute)
• Validarea emoțională reduce conflictele cu 67% (Dr. John Gottman)
• 5:1 raportul interacțiuni pozitive vs negative în relațiile sănătoase
`,
      intelepciune_romaneasca: `
• "Omul cu omul - împărat" - Forța vine din comunitate
• "Prietenul la nevoie se cunoaște" - Relațiile se testează în dificultăți
• "Două capete mai mult gândesc decât unul" - Colaborarea e superioară concurenței
• "Vorbă dulce mult aduce" - Comunicarea blândă e mai eficientă
`,
      strategii_practice: `
1. ASCULTARE ACTIVĂ: 100% atenție, fără judecată, reformulează ce ai înțeles
2. VALIDARE EMOȚIONALĂ: "Înțeleg că te simți..." înainte de soluții
3. TIMP DE CALITATE: 15 minute zilnic fără distrageri cu persoanele importante
4. EXPRIMAREA APRECIERII: Spune zilnic unei persoane ce apreciezi la ea
5. CONFLICTE CONSTRUCTIVE: Atacă problema, nu persoana
`,
      exercitii: `
• DIMINEAȚA: Trimite 1 mesaj de apreciere unei persoane importante
• ZIUA: Practică ascultarea activă în fiecare conversație
• SEARA: Întreabă o persoană dragă "Cum a fost ziua ta?" și ascultă cu atenție
• SĂPTĂMÂNAL: Petrece timp de calitate fără telefon cu familia/prietenii
• LUNAR: Evaluează și îmbunătățește relațiile importante
`,
    });
  }

  // Inițializează secțiunea pentru muncă/carieră
  async initializeWorkPhilosophy() {
    await this.philosophyCollection.doc("work").set({
      stiinta: `
• Flow-ul (starea optimală) apare când provocările echilibrează abilitățile (Csikszentmihalyi)
• Angajații cu scop clar sunt 4x mai productivi și 3x mai fericiți (Gallup)
• Autonomia la locul de muncă crește satisfacția cu 50% (Self-Determination Theory)
• Pauzele regulate (tehnica Pomodoro) îmbunătățesc focusul cu 25%
• Învățarea continuă menține creativitatea și previne burnout-ul
`,
      intelepciune_romaneasca: `
• "Munca cinstită nu rușinează pe nimeni" - Satisfacția vine din contribuție
• "Meșteru fără ucenici rămâne singur" - Împărtășirea cunoștințelor e crucială
• "Nu lăsa pe mâine ce poți face azi" - Procrastinarea creează stres
• "Cine nu muncește, să nu mănânce" - Efortul aduce recompensa
`,
      strategii_practice: `
1. GĂSEȘTE SENSUL: Identifică cum ajuți pe alții prin munca ta
2. DEZVOLTĂ COMPETENȚE: 30 minute zilnic pentru învățare nouă
3. ORGANIZEAZĂ PRIORITĂȚILE: Metoda Eisenhower (urgent/important)
4. CREEAZĂ FLOW: Echilibrează provocarea cu abilitățile actuale
5. NETWORKING AUTENTIC: Construiește relații bazate pe valoare reciprocă
`,
      exercitii: `
• DIMINEAȚA: Stabilește 3 priorități pentru ziua de lucru
• ZIUA: Lucrează în blocuri de 25 minute cu pauze de 5
• SEARA: Reflectează la o realizare din ziua de lucru
• SĂPTĂMÂNAL: Învață ceva nou legat de domeniul tău
• LUNAR: Evaluează progresul și stabilește obiective profesionale noi
`,
    });
  }

  // Inițializează secțiunea pentru dezvoltare personală
  async initializePersonalGrowthPhilosophy() {
    await this.philosophyCollection.doc("personal_growth").set({
      stiinta: `
• Neuroplasticitatea permite schimbări cerebrale la orice vârstă prin practică deliberată
• Growth mindset vs Fixed mindset determină capacitatea de dezvoltare (Carol Dweck)
• Zona de confort extinsă gradual previne overwhelm-ul și susține creșterea
• Feedback-ul honest accelerează învățarea cu 40% (Harvard Business Review)
• Auto-reflecția zilnică îmbunătățește conștiința de sine cu 23%
`,
      intelepciune_romaneasca: `
• "Nu-i bine ca omul să rămână singur în felul lui de a fi" - Creșterea prin schimbare
• "Învață carte să ajungi om mare" - Educația continuă e cheie
• "Din greșeli înveți" - Eșecurile sunt lecții valoroase
• "Cât trăiești, atât înveți" - Dezvoltarea nu are vârstă
`,
      strategii_practice: `
1. ZONA DE CONFORT: Fă zilnic ceva care te provoacă ușor
2. REFLECȚIA ZILNICĂ: 10 minute seara pentru autoevaluare
3. FEEDBACK SEEKING: Cere părerea oamenilor de încredere
4. CITIT/ASCULTAT: 20 minute zilnic conținut educațional
5. EXPERIMENTARE: Încearcă lunar ceva complet nou
`,
      exercitii: `
• DIMINEAȚA: Stabilește o provocare mică pentru ziua curentă
• ZIUA: Observă și notează 1 gând/emoție/reacție interesantă
• SEARA: Scrie 3 lucruri învățate + 1 îmbunătățire pentru mâine
• SĂPTĂMÂNAL: Încearcă o activitate nouă sau abordare diferită
• LUNAR: Evaluează progresul și stabilește obiective de dezvoltare
`,
    });
  }
}

// Funcție fallback pentru când Firebase nu e disponibil
function generateSimplePhilosophicalResponse(
  prompt,
  assistantName,
  addressMode
) {
  const fallbackWisdom = {
    greeting: "Bună ziua! Sunt aici să te ajut cu înțelepciune practică.",
    encouragement:
      "Fiecare pas mic te apropie de obiectivul tău. Ai încredere în procesul de creștere.",
    stress:
      "Respiră adânc. 'Apa trece, pietrele rămân' - și tu ești piatra puternică care rezistă.",
    motivation:
      "'Picătura sapă piatra' - consistența ta zilnică va aduce rezultate.",
    general:
      "Înțelepciunea vine din experiență, iar experiența din acțiune. Să facem primul pas împreună.",
  };

  return fallbackWisdom.general;
}

module.exports = {
  PhilosophyDatabaseManager,
  generateSimplePhilosophicalResponse,
};
