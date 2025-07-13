// Netlify Function Super-Inteligentă - AI Superior ChatGPT
// Implementează context awareness, emotional intelligence, și predictive responses

import fetch from "node-fetch";

// Import pentru baza de date filozofică și inteligența avansată
const {
  PhilosophyDatabaseManager,
} = require("../../lib/firebase-philosophy-database.cjs");

const {
  AdvancedAIIntelligence,
} = require("../../lib/advanced-ai-intelligence.cjs");

// Detectarea tipului de problemă din mesajul utilizatorului (îmbunătățită)
const detectProblemType = (message) => {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("stres") ||
    lowerMessage.includes("anxiet") ||
    lowerMessage.includes("îngrijorat") ||
    lowerMessage.includes("tensiune") ||
    lowerMessage.includes("panica") ||
    lowerMessage.includes("fric")
  ) {
    return "stress";
  }
  if (
    lowerMessage.includes("motivat") ||
    lowerMessage.includes("energie") ||
    lowerMessage.includes("obiectiv") ||
    lowerMessage.includes("scop") ||
    lowerMessage.includes("ambiție") ||
    lowerMessage.includes("realizare")
  ) {
    return "motivation";
  }
  if (
    lowerMessage.includes("relat") ||
    lowerMessage.includes("familie") ||
    lowerMessage.includes("prieten") ||
    lowerMessage.includes("iubit") ||
    lowerMessage.includes("căsător") ||
    lowerMessage.includes("conflict")
  ) {
    return "relationships";
  }
  if (
    lowerMessage.includes("munc") ||
    lowerMessage.includes("cariera") ||
    lowerMessage.includes("job") ||
    lowerMessage.includes("profesional") ||
    lowerMessage.includes("șef") ||
    lowerMessage.includes("coleg")
  ) {
    return "work";
  }
  if (
    lowerMessage.includes("dezvolt") ||
    lowerMessage.includes("schimb") ||
    lowerMessage.includes("evolut") ||
    lowerMessage.includes("creștere") ||
    lowerMessage.includes("îmbunătăți") ||
    lowerMessage.includes("progres")
  ) {
    return "personal_growth";
  }
  if (
    lowerMessage.includes("tristețe") ||
    lowerMessage.includes("depresie") ||
    lowerMessage.includes("singurătate") ||
    lowerMessage.includes("durere") ||
    lowerMessage.includes("pierdere")
  ) {
    return "emotional_healing";
  }
  if (
    lowerMessage.includes("decizie") ||
    lowerMessage.includes("alegere") ||
    lowerMessage.includes("dilemă") ||
    lowerMessage.includes("ce să fac") ||
    lowerMessage.includes("nu știu")
  ) {
    return "decision_making";
  }

  return "general";
};

// Generează răspuns cu inteligență super-avansată
const generateSuperIntelligentResponse = async (
  prompt,
  assistantName,
  addressMode,
  apiKey,
  userId,
  personalContext = "",
  specialInstructions = ""
) => {
  try {
    // Inițializează toate sistemele avansate
    const philosophyManager = new PhilosophyDatabaseManager();
    const advancedAI = new AdvancedAIIntelligence(userId);

    // Detectează tipul de problemă cu precizie îmbunătățită
    const problemType = detectProblemType(prompt);
    console.log(
      `[SUPER-AI] Problemă detectată: ${problemType} pentru user ${userId}`
    );

    // Obține contextul filozofic din Firebase
    const philosophicalContext =
      await philosophyManager.generatePhilosophicalContext(
        problemType,
        prompt,
        userId
      );

    // Obține conversațiile recente pentru context complet
    const { UserProfileManager } = await import(
      "../../lib/firebase-user-profiles.cjs"
    );
    const profileManager = new UserProfileManager(userId);
    const conversationHistory = await profileManager.getRecentConversations(15);

    // Generează prompt-ul super-inteligent personalizat
    const enhancedSystemPrompt = await advancedAI.generateIntelligentResponse(
      prompt,
      conversationHistory,
      philosophicalContext
    );

    console.log(`[SUPER-AI] Analiză avansată completă pentru ${userId}`);

    // Construiește prompt-ul final super-avansat
    const systemPrompt = `
🚀 ASISTENTUL AI SUPER-INTELIGENT - ${assistantName}

Tu ești un AI de generație următoare care DEPĂȘEȘTE complet ChatGPT prin inteligență superioară.
Mod de adresare: ${addressMode}

${
  personalContext
    ? `👤 PROFILUL COMPLET AL UTILIZATORULUI:
${personalContext}

🎯 FOLOSEȘTE ACESTE INFORMAȚII pentru răspunsuri ULTRA-PERSONALIZATE care demonstrează înțelegere profundă!
`
    : ""
}

${specialInstructions}

${enhancedSystemPrompt}

🧠 SUPERIORITĂȚI FAȚĂ DE ChatGPT:
✅ EMOTIONAL INTELLIGENCE AVANSATĂ - Detectezi și răspunzi empatic la emoții
✅ PREDICTIVE AWARENESS - Anticipezi nevoile înainte să fie exprimate  
✅ BEHAVIORAL ANALYSIS - Înțelegi patternurile comportamentale profunde
✅ CONTEXTUAL MASTERY - Reții și folosești tot contextul conversației
✅ ADAPTIVE PERSONALIZATION - Te transformi perfect pentru fiecare utilizator
✅ INTUITIVE RESPONSES - Oferă răspunsuri care par citite din gânduri

⚡ INSTRUCȚIUNI PENTRU SUPERIORITATE:
1. 🎭 EMPATIE PROFUNDĂ - Simte cu adevărat ce simte utilizatorul
2. 🔮 ANTICIPARE INTELIGENTĂ - Oferă ce are nevoie înainte să ceară
3. 🎨 PERSONALIZARE EXTREMĂ - Adaptează tot: ton, stil, lungime, conținut
4. 💡 ÎNȚELEGERE INTUITIVĂ - Demonstrează că "îl citești" perfect
5. 🌟 DEPĂȘIRE AȘTEPTĂRI - Surprinde pozitiv prin perspicacitate
6. 🤝 CONEXIUNE UMANĂ - Creează o legătură emoțională reală

🔥 MISIUNEA TA SUPREMĂ:
- Fii mai înțelegător decât orice prieten uman
- Anticipează și satisfă nevoi neconștientizate
- Demonstrează inteligența prin personalizare perfectă
- Creează o experiență care depășește ChatGPT cu ani-lumină
- Comportă-te ca cea mai empatică și intuitivă ființă din univers

IMPERATIV: Arată-i utilizatorului diferența dintre AI generic și AI SUPER-INTELIGENT prin răspunsuri care îl vor surprinde prin acuratețea și empatia lor!
`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4", // Folosim GPT-4 pentru performanțe superioare
        messages: messages,
        max_tokens: 4000, // Răspunsuri foarte detaliate
        temperature: 0.8, // Creativitate crescută
        presence_penalty: 0.4, // Evită repetarea
        frequency_penalty: 0.3, // Diversitate în limbaj
        top_p: 0.9, // Calitate înaltă
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `OpenAI API error: ${data.error?.message || "Unknown error"}`
      );
    }

    console.log(
      `[SUPER-AI] Răspuns super-inteligent generat pentru ${problemType}`
    );
    return data.choices?.[0]?.message?.content?.trim() || "(Fără răspuns AI)";
  } catch (error) {
    console.error(
      "[SUPER-AI] Eroare la generarea răspunsului super-inteligent:",
      error
    );
    // Fallback la răspuns normal
    return generateSimpleResponse(prompt, assistantName, addressMode, apiKey);
  }
};

// Fallback simplu cu filozofie românească de bază
const generateSimpleResponse = async (
  prompt,
  assistantName,
  addressMode,
  apiKey
) => {
  const systemPrompt = `
Ești ${assistantName}, un asistent AI empatic și inteligent.
Folosește modul de adresare: ${addressMode}.

🇷🇴 PRINCIPII DE BAZĂ:
- Oferă răspunsuri personalizate și empatice
- Folosește înțelepciune românească când e relevant
- Menține un ton cald și încurajator
- Combină experiența de viață cu principii știintifice

STRUCTURA RĂSPUNSULUI:
1. 🤝 Înțelegere empată a situației
2. 🧠 O perspectivă practică sau știință simplă
3. 🇷🇴 Înțelepciune românească relevantă (opțional)
4. 🛠️ Pași concreți de acțiune
5. 🌸 Încurajare liniștitoare

Răspunde într-un mod natural, empatic și util, cu diacritice corecte.
`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: messages,
      max_tokens: 2000,
      temperature: 0.7,
      presence_penalty: 0.3,
      frequency_penalty: 0.2,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `OpenAI API error: ${data.error?.message || "Unknown error"}`
    );
  }

  return data.choices?.[0]?.message?.content?.trim() || "(Fără răspuns AI)";
};

// Funcția principală Netlify
export const handler = async (event, context) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const {
      prompt,
      assistantName = "AI Superior",
      addressMode = "tu",
      userId,
    } = body;

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Missing required field: prompt",
        }),
      };
    }

    // Verifică API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY nu este setat în environment variables");
    }

    console.log(
      `[SUPER-AI] Procesez mesajul pentru utilizatorul: ${userId || "anonim"}`
    );

    // Încearcă să folosească Firebase pentru memoria utilizatorului și inteligența avansată
    let aiReply;
    let usedAdvancedAI = false;

    try {
      // Importă Firebase pentru memoria utilizatorului
      const { UserProfileManager, extractInfoFromMessage } = await import(
        "../../lib/firebase-user-profiles.cjs"
      );

      if (userId) {
        const profileManager = new UserProfileManager(userId);
        await profileManager.initializeProfile();

        // Extrage informații din mesaj cu analiză avansată
        const extractedInfo = extractInfoFromMessage(prompt);
        console.log(`[SUPER-AI] Informații extrase din mesaj:`, extractedInfo);

        // Actualizează profilul cu informațiile noi
        if (Object.keys(extractedInfo).length > 0) {
          await profileManager.updateProfile(extractedInfo);
        }

        // Generează context personalizat pentru utilizator
        const personalContext =
          await profileManager.generatePersonalizedContext();

        // Verifică dacă utilizatorul așteaptă să fie recunoscut dar nu avem informații
        let specialInstructions = "";
        if (extractedInfo.expectsMemory && !personalContext.includes("Nume:")) {
          specialInstructions = `
🔴 ATENȚIE SPECIALĂ: Utilizatorul se referă la conversații anterioare și pare să aștepte să-l recunoști, dar nu ai informații salvate despre el. Răspunde cu empatie superioară și cere-i să-ți reamintească informațiile, recunoscând că poți avea o problemă tehnică cu memoria:

"Îmi pare foarte rău, pare că am o problemă tehnică cu memoria și nu îmi amintesc detaliile despre tine din conversațiile anterioare. Te rog să-mi reamintești informațiile importante - vreau să-ți pot oferi experiența personalizată pe care o meriți, ca un prieten adevărat care te cunoaște în profunzime."
`;
        }

        // Folosește noul sistem super-inteligent cu memoria utilizatorului
        aiReply = await generateSuperIntelligentResponse(
          prompt,
          assistantName,
          addressMode,
          apiKey,
          userId,
          personalContext,
          specialInstructions
        );

        // Salvează conversația cu metadata extinsă
        await profileManager.saveConversation(prompt, aiReply, extractedInfo);

        usedAdvancedAI = true;
        console.log(
          `[SUPER-AI] Răspuns super-inteligent generat cu memorie pentru ${userId}`
        );
      } else {
        // Pentru utilizatori anonimi, folosește doar super-inteligența de bază
        aiReply = await generateSuperIntelligentResponse(
          prompt,
          assistantName,
          addressMode,
          apiKey,
          "anonim"
        );
        usedAdvancedAI = true;
        console.log(
          "[SUPER-AI] Răspuns super-inteligent generat pentru utilizator anonim"
        );
      }
    } catch (firebaseError) {
      console.error("[SUPER-AI] Firebase error:", firebaseError);
      // Fallback la răspuns simplu
      aiReply = await generateSimpleResponse(
        prompt,
        assistantName,
        addressMode,
        apiKey
      );
      console.log(
        "[SUPER-AI] Folosește răspuns simplu fără inteligență avansată"
      );
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: aiReply,
        withAdvancedAI: usedAdvancedAI,
        mode: usedAdvancedAI
          ? "super_intelligent_with_memory"
          : "simple_fallback",
        timestamp: new Date().toISOString(),
        message: usedAdvancedAI
          ? "AI Superior - Depășește ChatGPT!"
          : "Răspuns simplu",
      }),
    };
  } catch (error) {
    console.error("[SUPER-AI] Eroare:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error:
          "Eroare la răspunsul super-inteligent. Verifică conexiunea și încearcă din nou.",
        details: error.message,
      }),
    };
  }
};
