// Backend Firebase pentru profiluri utilizatori individuale
// Fiecare utilizator are propriul profil și conversații separate

const admin = require("firebase-admin");
const fetch = require("node-fetch");

// Inițializare Firebase Admin (doar dacă nu e deja inițializat)
if (!admin.apps.length) {
  // Detectează dacă rulează în emulator
  const isEmulator =
    process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_EMULATOR_HUB;

  if (isEmulator) {
    // Configurare pentru emulator
    admin.initializeApp({
      projectId: "lupulcorbul", // Din configurația ta Firebase
    }); // Setează emulatorul
    process.env.FIRESTORE_EMULATOR_HOST = "localhost:8081";
    console.log("[FIREBASE] Folosește emulatorul Firestore pe localhost:8081");
  } else {
    // Configurare pentru producție
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: "lupulcorbul",
    });
  }
}

const db = admin.firestore();

// Clasa pentru gestionarea profilurilor individuale
class UserProfileManager {
  constructor(userId) {
    this.userId = userId;
    this.userRef = db.collection("userProfiles").doc(userId);
    this.conversationsRef = this.userRef.collection("conversations");
  }

  // Inițializează profilul utilizatorului dacă nu există
  async initializeProfile() {
    const profileDoc = await this.userRef.get();

    if (!profileDoc.exists) {
      const initialProfile = {
        userId: this.userId,
        profile: {
          // Informații de bază
          name: null,
          age: null,
          gender: null,
          occupation: null,
          education: null,
          location: null,

          // Familie și relații
          relationshipStatus: null,
          hasChildren: null,
          familyMembers: [],
          pets: [],

          // Interese și hobby-uri
          interests: [],
          hobbies: [],
          favoriteMovies: [],
          favoriteMusic: [],
          favoriteBooks: [],
          sports: [],

          // Personalitate și comportament
          personalityTraits: [],
          communicationStyle: null,
          preferredTopics: [],
          avoidedTopics: [],
          humorType: null,

          // Obiective și aspirații
          goals: [],
          concerns: [],
          fears: [],
          dreams: [],

          // Sănătate și stil de viață
          healthConditions: [],
          allergies: [],
          dietaryRestrictions: [],
          exerciseHabits: [],
          sleepPatterns: [],

          // Preferințe și obiceiuri
          foodPreferences: [],
          travelPlaces: [],
          workStyle: null,
          learningStyle: null,

          // Context actual
          currentMood: null,
          currentProjects: [],
          currentChallenges: [],
          recentEvents: [],

          // Tehnologie și digital
          techSkills: [],
          favoriteApps: [],
          socialMediaUsage: [],

          // Financiar și carieră
          careerGoals: [],
          income_level: null,
          spendingHabits: [],

          // Preferințe conversație
          preferredLanguageStyle: "formal", // formal/informal
          responseLength: "medium", // short/medium/detailed
          topicsOfInterest: [],

          // Învățat din conversație
          frequentQuestions: [],
          commonPhrases: [],
          typicalResponseTime: null,
          conversationPatterns: [],
        },
        metadata: {
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          totalMessages: 0,
          lastActive: admin.firestore.FieldValue.serverTimestamp(),
        },
        settings: {
          privacyLevel: "standard",
          dataRetention: "1year",
          personalizationEnabled: true,
        },
      };

      await this.userRef.set(initialProfile);
      console.log(
        `[FIREBASE] Profil inițializat pentru utilizatorul: ${this.userId}`
      );
    }
  }

  // Salvează o conversație nouă
  async saveConversation(userMessage, aiResponse, extractedInfo = null) {
    const conversationData = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userMessage: userMessage,
      aiResponse: aiResponse,
      extractedInfo: extractedInfo, // Informații extrase din mesajul utilizatorului
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Salvează conversația
    await this.conversationsRef.add(conversationData);

    // Actualizează metadata
    await this.userRef.update({
      "metadata.lastUpdated": admin.firestore.FieldValue.serverTimestamp(),
      "metadata.lastActive": admin.firestore.FieldValue.serverTimestamp(),
      "metadata.totalMessages": admin.firestore.FieldValue.increment(1),
    });

    console.log(
      `[FIREBASE] Conversație salvată pentru utilizatorul: ${this.userId}`
    );
  }

  // Actualizează profilul utilizatorului cu informații noi
  async updateProfile(updates) {
    const updateData = {};

    // Construiește calea de update pentru fiecare câmp
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== null && updates[key] !== undefined) {
        updateData[`profile.${key}`] = updates[key];
      }
    });

    if (Object.keys(updateData).length > 0) {
      updateData["metadata.lastUpdated"] =
        admin.firestore.FieldValue.serverTimestamp();
      await this.userRef.update(updateData);
      console.log(
        `[FIREBASE] Profil actualizat pentru ${this.userId}:`,
        updates
      );
    }
  }

  // Adaugă un interes nou (fără duplicate)
  async addInterest(interest) {
    await this.userRef.update({
      "profile.interests": admin.firestore.FieldValue.arrayUnion(interest),
      "metadata.lastUpdated": admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  // Adaugă o trăsătură de personalitate
  async addPersonalityTrait(trait) {
    await this.userRef.update({
      "profile.personalityTraits": admin.firestore.FieldValue.arrayUnion(trait),
      "metadata.lastUpdated": admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  // Obține profilul complet al utilizatorului
  async getProfile() {
    await this.initializeProfile();
    const profileDoc = await this.userRef.get();
    return profileDoc.exists ? profileDoc.data() : null;
  }

  // Obține ultimele conversații pentru context
  async getRecentConversations(limit = 10) {
    const conversations = await this.conversationsRef
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    return conversations.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(),
    }));
  }

  // Caută în conversațiile utilizatorului
  async searchConversations(searchTerm, limit = 5) {
    // Firebase nu suportă full-text search nativ, dar putem face o căutare simplă
    const conversations = await this.conversationsRef
      .orderBy("timestamp", "desc")
      .limit(50) // Luăm mai multe pentru a căuta
      .get();

    const results = [];
    const searchLower = searchTerm.toLowerCase();

    for (const doc of conversations.docs) {
      const data = doc.data();
      const userMsg = data.userMessage?.toLowerCase() || "";
      const aiMsg = data.aiResponse?.toLowerCase() || "";

      if (userMsg.includes(searchLower) || aiMsg.includes(searchLower)) {
        results.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate(),
        });

        if (results.length >= limit) break;
      }
    }

    return results;
  }

  // Generează context pentru AI bazat pe profilul și istoricul utilizatorului
  async generateContextForAI() {
    const profile = await this.getProfile();
    const recentConversations = await this.getRecentConversations(5);

    if (!profile) return "";

    let context = `Informații despre utilizatorul ${this.userId}:\n`;

    // Informații de bază
    if (profile.profile.name) {
      context += `- Nume: ${profile.profile.name}\n`;
    }
    if (profile.profile.age) {
      context += `- Vârstă: ${profile.profile.age} ani\n`;
    }
    if (profile.profile.occupation) {
      context += `- Ocupație: ${profile.profile.occupation}\n`;
    }
    if (profile.profile.location) {
      context += `- Locație: ${profile.profile.location}\n`;
    }

    // Interese
    if (profile.profile.interests.length > 0) {
      context += `- Interese: ${profile.profile.interests.join(", ")}\n`;
    }

    // Trăsături de personalitate
    if (profile.profile.personalityTraits.length > 0) {
      context += `- Personalitate: ${profile.profile.personalityTraits.join(", ")}\n`;
    }

    // Obiective și preocupări
    if (profile.profile.goals.length > 0) {
      context += `- Obiective: ${profile.profile.goals.join(", ")}\n`;
    }
    if (profile.profile.concerns.length > 0) {
      context += `- Preocupări: ${profile.profile.concerns.join(", ")}\n`;
    } // Context din conversațiile recente
    if (recentConversations.length > 0) {
      context += "\nConversații recente:\n";
      recentConversations.reverse().forEach((conv, index) => {
        if (conv.userMessage) {
          const userMsg = conv.userMessage.substring(0, 100);
          const userMsgSuffix = conv.userMessage.length > 100 ? "..." : "";
          context += `${index + 1}. User: "${userMsg}${userMsgSuffix}"\n`;
        }
        if (conv.aiResponse) {
          const aiMsg = conv.aiResponse.substring(0, 100);
          const aiMsgSuffix = conv.aiResponse.length > 100 ? "..." : "";
          context += `   AI: "${aiMsg}${aiMsgSuffix}"\n`;
        }
      });
    }

    // Metadata
    const lastActiveDate =
      profile.metadata.lastActive && profile.metadata.lastActive.toDate
        ? profile.metadata.lastActive.toDate().toLocaleDateString()
        : "N/A";
    context += `\nStatistici: ${profile.metadata.totalMessages} mesaje, activ ultima dată: ${lastActiveDate}`;

    return context;
  }

  // Generează context personalizat pentru AI (alias pentru generateContextForAI)
  async generatePersonalizedContext() {
    return await this.generateContextForAI();
  }

  // Analizează ce informații lipsesc din profil și generează întrebări relevante
  async analyzeProfileGaps() {
    const profile = await this.getProfile();
    if (!profile) return [];

    const missingInfo = [];
    const p = profile.profile;

    // Verifică informații de bază
    if (!p.name)
      missingInfo.push({
        type: "name",
        question: "Apropo, cum îți place să-mi spui pe nume?",
      });
    if (!p.age)
      missingInfo.push({
        type: "age",
        question:
          "Ca să pot să-ți ofer sfaturi mai potrivite, te deranjează să-mi spui în ce grupă de vârstă te situezi?",
      });
    if (!p.occupation)
      missingInfo.push({
        type: "occupation",
        question: "Cu ce te ocupi în general? Lucrezi undeva sau studiezi?",
      });
    if (!p.location)
      missingInfo.push({
        type: "location",
        question: "Din ce oraș ești, dacă nu e secret?",
      });

    // Verifică interese și hobby-uri
    if (p.interests.length === 0) {
      missingInfo.push({
        type: "interests",
        question:
          "Ce îți place să faci în timpul liber? Ai hobby-uri sau pasiuni?",
      });
    }

    // Verifică obiective și aspirații
    if (p.goals.length === 0) {
      missingInfo.push({
        type: "goals",
        question:
          "Ai planuri sau obiective pe care lucrezi să le îndeplinești?",
      });
    }

    // Verifică preferințe comunicare
    if (!p.preferredLanguageStyle) {
      missingInfo.push({
        type: "communication",
        question:
          "Preferi să vorbim mai formal sau informal? Cum ți-ar plăcea să-ți răspund?",
      });
    }

    // Verifică domenii de interes pentru conversație
    if (p.preferredTopics.length === 0) {
      missingInfo.push({
        type: "topics",
        question:
          "Ce subiecte te interesează cel mai mult? Despre ce îți place să vorbești?",
      });
    }

    return missingInfo;
  }

  // Generează o întrebare contextuală pentru a completa profilul
  async generateContextualQuestion() {
    const missingInfo = await this.analyzeProfileGaps();
    const recentConversations = await this.getRecentConversations(3);

    if (missingInfo.length === 0) return null;

    // Alege întrebarea cea mai relevantă pe baza contextului conversației
    let selectedQuestion = missingInfo[0]; // Default la prima

    // Analizează conversațiile recente pentru context
    if (recentConversations.length > 0) {
      const lastConversation = recentConversations[0];
      const lastMessage = lastConversation.userMessage?.toLowerCase() || "";

      // Dacă vorbește despre muncă/ocupație, întreabă despre locație sau interese
      if (
        lastMessage.includes("lucrez") ||
        lastMessage.includes("job") ||
        lastMessage.includes("muncă")
      ) {
        const locationQ = missingInfo.find((info) => info.type === "location");
        const interestsQ = missingInfo.find(
          (info) => info.type === "interests"
        );
        selectedQuestion = locationQ || interestsQ || selectedQuestion;
      }

      // Dacă pare fericit/pozitiv, întreabă despre hobby-uri sau obiective
      if (
        lastMessage.includes("fericit") ||
        lastMessage.includes("bine") ||
        lastMessage.includes("super")
      ) {
        const interestsQ = missingInfo.find(
          (info) => info.type === "interests"
        );
        const goalsQ = missingInfo.find((info) => info.type === "goals");
        selectedQuestion = interestsQ || goalsQ || selectedQuestion;
      }

      // Dacă pare să aibă probleme, întreabă despre obiective sau preocupări
      if (
        lastMessage.includes("problemă") ||
        lastMessage.includes("greu") ||
        lastMessage.includes("dificil")
      ) {
        const goalsQ = missingInfo.find((info) => info.type === "goals");
        selectedQuestion = goalsQ || selectedQuestion;
      }
    }

    return selectedQuestion;
  }

  // Verifică dacă ar trebui să întrebe ceva pentru a completa profilul
  async shouldAskProfileQuestion() {
    const profile = await this.getProfile();
    const missingInfo = await this.analyzeProfileGaps();

    // Nu întreba dacă are deja informații suficiente
    if (missingInfo.length === 0) return false;

    // Nu întreba prea des - maxim o întrebare la 3-4 mesaje
    const totalMessages = profile.metadata.totalMessages || 0;
    const basicInfoMissing = missingInfo.some((info) =>
      ["name", "age", "occupation"].includes(info.type)
    );

    // Întreabă mai des pentru informații de bază
    if (basicInfoMissing && totalMessages % 2 === 0) return true;

    // Întreabă mai rar pentru informații suplimentare
    if (!basicInfoMissing && totalMessages % 5 === 0) return true;

    return false;
  }

  // Generează un răspuns care include o întrebare contextuală
  async generateResponseWithQuestion(baseResponse) {
    const shouldAsk = await this.shouldAskProfileQuestion();

    if (!shouldAsk) return baseResponse;

    const question = await this.generateContextualQuestion();
    if (!question) return baseResponse;

    // Integrează întrebarea în mod natural în răspuns
    const transitions = [
      "\n\nApropo, ",
      "\n\nDacă nu te deranjează să întreb, ",
      "\n\nSunt curios, ",
      "\n\nCa să te pot ajuta mai bine, ",
      "\n\nDe altfel, ",
    ];

    const randomTransition =
      transitions[Math.floor(Math.random() * transitions.length)];
    return baseResponse + randomTransition + question.question;
  }

  // ...existing code...
}

// Funcție pentru extragerea informațiilor din mesaj (îmbunătățită cu detecție contextuală)
function extractInfoFromMessage(message) {
  const lowerMessage = message.toLowerCase();
  const extracted = {};

  // === DETECȚIA INTELIGENTĂ A NUMELUI ===
  // 1. Pattern-uri explicite (când utilizatorul spune clar numele)
  const explicitNamePatterns = [
    /numele meu este ([a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
    /mă numesc ([a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
    /ma numesc ([a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
    /mă cheamă ([a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
    /ma cheama ([a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
    /sunt ([a-zA-ZăâîșțĂÂÎȘȚ]+)(?:\s*[,\.])/i,
    /sunt ([a-zA-ZăâîșțĂÂÎȘȚ]+)(?:\s+am\s+\d)/i,
    /sunt ([a-zA-ZăâîșțĂÂÎȘȚ]+)(?:\s*$)/i,
    /sunt ([a-zA-ZăâîșțĂÂÎȘȚ]+)(?:\s+și)/i, // pentru "sunt Dani și..."
    /sunt ([a-zA-ZăâîșțĂÂÎȘȚ]+)(?:\s+si)/i, // pentru "sunt Dani si..." (fără diactritice)
    /eu sunt ([a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
    /da,?\s*sunt ([a-zA-ZăâîșțĂÂÎȘȚ]+)/i, // pentru confirmări cu nume
    /corect,?\s*sunt ([a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
  ];

  // 2. Pattern-uri contextuale (când AI întreabă și utilizatorul răspunde cu numele)
  const contextualNamePatterns = [
    // Pentru cazuri când AI întreabă despre nume și utilizatorul răspunde
    /^([A-ZĂÂÎȘȚ][a-zăâîșț]{2,20})\.?!?\s*$/, // "Andreea", "Dumitru", "Maria"
    /^([A-ZĂÂÎȘȚ][a-zăâîșț]{2,20})\s+([A-ZĂÂÎȘȚ][a-zăâîșț]{2,20})\.?!?\s*$/, // "Ana Maria", "Ion Popescu"
  ];

  // 3. Detecție de context implicit (când utilizatorul se referă la conversații anterioare)
  const contextualIndicators = [
    /ba\s+da\s+doar\s+vorbim/i, // "ba da doar vorbim"
    /ti.?am\s+(spus|zis|mentionat)/i, // "ti-am spus", "ti am zis"
    /am\s+(vorbit|discutat)\s+despre/i, // "am vorbit despre"
    /stii\s+(deja|de mult)/i, // "stii deja", "stii de mult"
    /dar\s+stii/i, // "dar stii"
    /trebuie\s+sa\s+(iti\s+amintesti|tii\s+minte)/i, // "trebuie sa iti amintesti"
    /in\s+(discutiile|conversatiile)\s+anterioare/i, // "in discutiile anterioare"
    /anterior\s+am\s+spus/i, // "anterior am spus"
    /de\s+(atat|mult)\s+timp/i, // "de atat timp", "de mult timp"
  ];

  // Verifică dacă utilizatorul se referă la conversații anterioare
  let hasContextualReference = false;
  for (const pattern of contextualIndicators) {
    if (pattern.test(message)) {
      hasContextualReference = true;
      extracted.expectsMemory = true; // Marchează că utilizatorul așteaptă să fie recunoscut
      break;
    }
  }

  // Lista de cuvinte care NU sunt nume (pentru a evita false positive)
  const excludedWords = [
    "bine",
    "foarte",
    "mult",
    "puțin",
    "mare",
    "mic",
    "aici",
    "acolo",
    "fericit",
    "trist",
    "supărat",
    "bucuros",
    "calm",
    "relaxat",
    "stresat",
    "mulțumesc",
    "mersi",
    "scuze",
    "pardon",
    "salut",
    "bună",
    "ziua",
    "dimineața",
    "seara",
    "noaptea",
    "azi",
    "mâine",
    "ieri",
    "acum",
    "prima",
    "doua",
    "treia",
    "ultima",
    "următoarea",
    "precedenta",
    "sigur",
    "desigur",
    "evident",
    "normal",
    "ciudat",
    "strange",
    "perfect",
    "excelent",
    "minunat",
    "frumos",
    "urât",
    "nasol",
  ];

  // Lista de nume comune românești pentru validare suplimentară
  const commonRomanianNames = [
    "alexandra",
    "andreea",
    "ana",
    "maria",
    "elena",
    "diana",
    "cristina",
    "mihaela",
    "alexandru",
    "andrei",
    "adrian",
    "mihai",
    "ion",
    "george",
    "cristian",
    "daniel",
    "dumitru",
    "gheorghe",
    "nicolae",
    "petru",
    "vasile",
    "stefan",
    "florin",
    "bogdan",
    "laura",
    "monica",
    "simona",
    "gabriela",
    "daniela",
    "carmen",
    "ioana",
    "raluca",
  ];

  // Încearcă pattern-urile explicite mai întâi
  for (const pattern of explicitNamePatterns) {
    const match = message.match(pattern);
    if (match && match[1] && match[1].length >= 2) {
      const potentialName =
        match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      if (!excludedWords.includes(potentialName.toLowerCase())) {
        extracted.name = potentialName;
        extracted.nameConfidence = "high"; // Nume explicit menționat
        break;
      }
    }
  }

  // Dacă nu s-a găsit nume explicit, încearcă detecția contextuală
  if (!extracted.name) {
    for (const pattern of contextualNamePatterns) {
      const match = message.match(pattern);
      if (match && match[1] && match[1].length >= 2) {
        const potentialName =
          match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();

        // Verifică dacă nu e în lista de cuvinte excluse
        if (!excludedWords.includes(potentialName.toLowerCase())) {
          // Verifică dacă pare să fie un nume real
          const isCommonName = commonRomanianNames.includes(
            potentialName.toLowerCase()
          );
          const hasNameStructure = /^[A-ZĂÂÎȘȚ][a-zăâîșț]+$/.test(
            potentialName
          );

          if (isCommonName || hasNameStructure) {
            extracted.name = potentialName;
            extracted.nameConfidence = isCommonName ? "medium" : "low"; // Nivel de încredere

            // Pentru nume compuse (prenume + nume)
            if (match[2] && match[2].length >= 2) {
              const lastName =
                match[2].charAt(0).toUpperCase() +
                match[2].slice(1).toLowerCase();
              extracted.name = `${potentialName} ${lastName}`;
              extracted.nameConfidence = "medium";
            }

            // Marchează că ar trebui să întrebe pentru confirmare dacă încrederea e scăzută
            if (extracted.nameConfidence === "low") {
              extracted.needsNameConfirmation = true;
            }
            break;
          }
        }
      }
    }
  }

  // Extragere vârstă
  const agePatterns = [
    /am (\d{1,2}) (?:ani|de ani)/i,
    /sunt în vârstă de (\d{1,2})/i,
    /(\d{1,2}) ani/i,
  ];

  for (const pattern of agePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const age = parseInt(match[1]);
      if (age >= 13 && age <= 100) {
        extracted.age = age;
        break;
      }
    }
  }

  // Extragere ocupație
  const occupationPatterns = [
    /lucrez ca ([a-zA-ZăâîșțĂÂÎȘȚ\s]+?)(?:\s(?:și|,|\.))/i,
    /sunt ([a-zA-ZăâîșțĂÂÎȘȚ\s]*(?:student|programator|inginer|doctor|designer|avocat|chef|artist|medic|profesor)[a-zA-ZăâîșțĂÂÎȘȚ\s]*?)(?:\s(?:și|,|la|\.))/i,
    /profesiunea mea este ([a-zA-ZăâîșțĂÂÎȘȚ\s]+)/i,
    /sunt (?:un|o) ([a-zA-ZăâîșțĂÂÎȘȚ\s]+?)(?:\s(?:și|,|de|\.))/i,
  ];

  for (const pattern of occupationPatterns) {
    const match = message.match(pattern);
    if (match && match[1] && match[1].trim().length > 2) {
      extracted.occupation = match[1].trim();
      break;
    }
  }

  // Extragere interese
  const interestPatterns = [
    /îmi place să ([a-zA-ZăâîșțĂÂÎȘȚ\s]+)/i,
    /îmi plac ([a-zA-ZăâîșțĂÂÎȘȚ\s]+)/i,
    /hobby-ul meu este ([a-zA-ZăâîșțĂÂÎȘȚ\s]+)/i,
    /pasiunea mea este ([a-zA-ZăâîșțĂÂÎȘȚ\s]+)/i,
  ];

  const interests = [];
  for (const pattern of interestPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      interests.push(match[1].trim());
    }
  }
  if (interests.length > 0) {
    extracted.interests = interests;
  }

  // Extragere locație
  const locationPatterns = [
    /locuiesc în ([a-zA-ZăâîșțĂÂÎȘȚ\s]+?)(?:\s(?:și|,|\.))/i,
    /sunt din ([a-zA-ZăâîșțĂÂÎȘȚ\s]+?)(?:\s(?:și|,|\.))/i,
    /trăiesc în ([a-zA-ZăâîșțĂÂÎȘȚ\s]+?)(?:\s(?:și|,|\.))/i,
  ];

  for (const pattern of locationPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      extracted.location = match[1].trim();
      break;
    }
  }

  // Extragere stare emoțională
  if (lowerMessage.includes("trist") || lowerMessage.includes("supărat")) {
    extracted.currentMood = "trist";
    extracted.personalityTraits = ["emotiv"];
  } else if (
    lowerMessage.includes("fericit") ||
    lowerMessage.includes("bucuros")
  ) {
    extracted.currentMood = "fericit";
    extracted.personalityTraits = ["optimist"];
  } else if (
    lowerMessage.includes("stres") ||
    lowerMessage.includes("anxios")
  ) {
    extracted.currentMood = "stresat";
    extracted.personalityTraits = ["sensibil la stres"];
  }

  // Extragere obiective/dorințe
  const goalPatterns = [
    /vreau să ([a-zA-ZăâîșțĂÂÎȘȚ\s]+)/i,
    /îmi doresc să ([a-zA-ZăâîșțĂÂÎȘȚ\s]+)/i,
    /scopul meu este să ([a-zA-ZăâîșțĂÂÎȘȚ\s]+)/i,
  ];

  const goals = [];
  for (const pattern of goalPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      goals.push(match[1].trim());
    }
  }
  if (goals.length > 0) {
    extracted.goals = goals;
  } // === DETECȚIA CONFIRMĂRILOR ===

  // Verifică dacă utilizatorul confirmă sau infirmă informații
  const confirmationPatterns = [
    // Confirmări pozitive (foarte permisiv)
    /\b(da|yes|corect|exact|așa|asa|adevărat|adevarat)\b/i,
    // Confirmări negative
    /\b(nu|no|greșit|gresit|fals|incorect)\b/i,
  ];

  // Verifică confirmările - prioritate pentru pozitive
  if (/\b(da|yes|corect|exact|așa|asa|adevărat|adevarat)\b/i.test(message)) {
    extracted.confirmation = "yes";
  } else if (
    /\b(nu|no|greșit|gresit|fals|incorect)\b/i.test(message) &&
    !/\b(da|yes|corect|exact|așa|asa|adevărat|adevarat)\b/i.test(message)
  ) {
    extracted.confirmation = "no";
  }

  return extracted;
}

module.exports = {
  UserProfileManager,
  extractInfoFromMessage,
};
