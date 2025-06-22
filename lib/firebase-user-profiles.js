// Backend Firebase pentru profiluri utilizatori individuale
// Fiecare utilizator are propriul profil și conversații separate

const admin = require("firebase-admin");
const fetch = require("node-fetch");

// Inițializare Firebase Admin (doar dacă nu e deja inițializat)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: "lupulcorbul", // Din configurația ta Firebase
  });
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
          name: null,
          age: null,
          occupation: null,
          interests: [],
          preferences: {},
          personalityTraits: [],
          location: null,
          relationshipStatus: null,
          goals: [],
          concerns: [],
          communicationStyle: null,
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
}

// Funcție pentru extragerea informațiilor din mesaj (îmbunătățită)
function extractInfoFromMessage(message) {
  const lowerMessage = message.toLowerCase();
  const extracted = {};

  // Extragere nume
  const namePatterns = [
    /numele meu este ([a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
    /mă numesc ([a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
    /mă cheamă ([a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
    /sunt ([a-zA-ZăâîșțĂÂÎȘȚ]+)(?:\s(?:și|,|\.))/i,
    /eu sunt ([a-zA-ZăâîșțĂÂÎȘȚ]+)(?:\s(?:și|,|\.))/i,
  ];

  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1] && match[1].length > 2) {
      const potentialName =
        match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      const excludedWords = [
        "bine",
        "aici",
        "acolo",
        "foarte",
        "mult",
        "puțin",
        "mare",
        "mic",
        "fericit",
        "trist",
        "supărat",
        "bucuros",
        "calm",
        "relaxat",
        "stresat",
      ];
      if (!excludedWords.includes(potentialName.toLowerCase())) {
        extracted.name = potentialName;
        break;
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
  }

  return extracted;
}

module.exports = {
  UserProfileManager,
  extractInfoFromMessage,
};
