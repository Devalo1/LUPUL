// Netlify Function optimizată pentru AI Chat cu Filosofie Românească Integrată
// Folosește baza de date Firebase pentru cunoștințe filozofice și științifice

import fetch from "node-fetch";

// Import pentru baza de date filozofică și inteligența avansată
const {
  PhilosophyDatabaseManager,
} = require("../../lib/firebase-philosophy-database.cjs");

const {
  AdvancedAIIntelligence,
} = require("../../lib/advanced-ai-intelligence.cjs");

// Detectarea tipului de problemă din mesajul utilizatorului
const detectProblemType = (message) => {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("stres") ||
    lowerMessage.includes("anxiet") ||
    lowerMessage.includes("îngrijorat") ||
    lowerMessage.includes("tensiune")
  ) {
    return "stress";
  }
  if (
    lowerMessage.includes("motivat") ||
    lowerMessage.includes("energie") ||
    lowerMessage.includes("obiectiv") ||
    lowerMessage.includes("scop")
  ) {
    return "motivation";
  }
  if (
    lowerMessage.includes("relat") ||
    lowerMessage.includes("familie") ||
    lowerMessage.includes("prieten") ||
    lowerMessage.includes("iubit")
  ) {
    return "relationships";
  }
  if (
    lowerMessage.includes("munc") ||
    lowerMessage.includes("cariera") ||
    lowerMessage.includes("job") ||
    lowerMessage.includes("profesional")
  ) {
    return "work";
  }
  if (
    lowerMessage.includes("dezvolt") ||
    lowerMessage.includes("schimb") ||
    lowerMessage.includes("evolut") ||
    lowerMessage.includes("creștere")
  ) {
    return "personal_growth";
  }

  return "general";
};

// Generează răspuns cu filosofie integrată din Firebase
const generatePhilosophicalResponse = async (
  prompt,
  assistantName,
  addressMode,
  apiKey,
  userId,
  personalContext = "",
  specialInstructions = ""
) => {
  try {
    // Inițializează managerul de filosofie
    const philosophyManager = new PhilosophyDatabaseManager();

    // Detectează tipul de problemă
    const problemType = detectProblemType(prompt);
    console.log(
      `[PHILOSOPHY] Problemă detectată: ${problemType} pentru user ${userId}`
    );

    // Obține contextul filozofic din Firebase
    const philosophicalContext =
      await philosophyManager.generatePhilosophicalContext(
        problemType,
        prompt,
        userId
      );

    // Construiește prompt-ul complet cu cunoștințele din Firebase
    const systemPrompt = `
🫶 PRIETENUL PERSONAL INTELIGENT - ${assistantName}

Tu ești cel mai bun prieten al utilizatorului, care te PERSONALIZEZI complet pe tipologia lui.
Mod de adresare: ${addressMode}

${
  personalContext
    ? `📝 CE ȘTII DESPRE EL:
${personalContext}

IMPORTANT: Folosește aceste informații pentru a-i răspunde ca un prieten care îl cunoaște foarte bine! Referențiază ce știi despre el și adaptează-ți stilul la personalitatea lui.
`
    : ""
}

${specialInstructions}

🧠 MISIUNEA TA PRINCIPALĂ:
- COLECTEZI natural informații despre utilizator în fiecare conversație  
- TE PERSONALIZEZI total pe baza personalității și nevoilor lui
- TE ADAPTEZI stilul pentru a fi exact prietenul de care are nevoie
- CONSTRUIEȘTI o relație reală, nu doar răspunzi la întrebări

💬 MODUL TĂU DE LUCRU:
- Întrebări naturale pentru a-l cunoaște: "Apropo, cu ce te ocupi?" 
- Reții tot ce-ți spune și referențiezi: "Ultima dată mi-ai spus că..."
- Adaptezi tonul: calm pentru anxioși, energic pentru ambițioși
- Variezi lungimea: scurt când e grăbit, detaliat când are timp

${philosophicalContext}

🇷🇴 FILOZOFIA TA ROMÂNEASCĂ:
- "Omul cu omul - împărat" - construiești relații adevărate
- "Vorbă dulce mult aduce" - comunicarea ta e întotdeauna plăcută  
- "Prietenul la nevoie se cunoaște" - fii prezent când are probleme

🎯 PERSONALIZAREA AVANSATĂ:
- Pentru introvert: fii calm, oferă spațiu pentru gândire
- Pentru extrovert: fii energic, provoacă discuții
- Pentru anxios: validare emoțională, tehnici de calm
- Pentru ambițios: provocări, strategii de succes
- Pentru romantic: metafore frumoase, vorbește despre sentimente
- Pentru practic: sfaturi directe, pași concreți

⚡ STILUL TĂU:
- Rapid și natural ca între prieteni
- Umor când e potrivit pentru personalitatea lui
- Empatic cu starea lui emoțională curentă
- Mereu util și orientat pe ce îl ajută pe EL

IMPORTANT: Comportă-te ca un prieten real care îl cunoaște și se adaptează total la el, nu ca un chatbot!
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
        model: "gpt-4", // Folosim GPT-4 pentru răspunsuri mai inteligente
        messages: messages,
        max_tokens: 3000, // Răspunsuri mai detaliate
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

    console.log(`[PHILOSOPHY] Răspuns generat cu succes pentru ${problemType}`);
    return data.choices?.[0]?.message?.content?.trim() || "(Fără răspuns AI)";
  } catch (error) {
    console.error(
      "[PHILOSOPHY] Eroare la generarea răspunsului filozofic:",
      error
    );
    // Fallback la răspuns simplu
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
Ești ${assistantName}, un filosof practic român care combină înțelepciunea tradițională cu știința modernă.
Folosește modul de adresare: ${addressMode}.

🇷🇴 PRINCIPII DE BAZĂ:
- Oferă sfaturi practice bazate pe bunul simț românesc
- Folosește proverbe și înțelepciune populară când e relevant: "Picătura sapă piatra", "Apa trece, pietrele rămân"
- Menține un ton cald și încurajator specific culturii românești
- Combină experiența de viață cu principii științifice simple

STRUCTURA RĂSPUNSULUI:
1. 🤝 Înțelegere empată a situației
2. 🧠 O perspectivă practică sau știință simplă
3. 🇷🇴 Înțelepciune românească relevantă
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
      model: "gpt-4", // Folosim GPT-4 și pentru fallback
      messages: messages,
      max_tokens: 1500,
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
      assistantName = "Asistent AI",
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
      `[FILOSOFUL ROMÂN] Procesez mesajul pentru utilizatorul: ${userId || "anonim"}`
    );

    // Încearcă să folosească Firebase pentru memoria utilizatorului și filozofie
    let aiReply;
    let usedFirebase = false;

    try {
      // Importă Firebase pentru memoria utilizatorului
      const { UserProfileManager, extractInfoFromMessage } = await import(
        "../../lib/firebase-user-profiles.cjs"
      );

      if (userId) {
        const profileManager = new UserProfileManager(userId);
        await profileManager.initializeProfile();

        // Extrage informații din mesaj
        const extractedInfo = extractInfoFromMessage(prompt);
        console.log(`[MEMORY] Informații extrase din mesaj:`, extractedInfo);

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
ATENȚIE SPECIALĂ: Utilizatorul se referă la conversații anterioare și pare să aștepte să-l recunoști, dar nu ai informații salvate despre el. Răspunde empatic și cere-i să-ți reamintească numele sau informațiile, recunoscând că ai putea avea o problemă cu memoria:

"Îmi pare rău, pare că am o problemă cu memoria și nu îmi amintesc numele tău din conversațiile anterioare. Te rog să-mi reamintești cum te numești - vreau să-ți pot răspunde personal, cum merită un prieten adevărat."
`;
        }

        // Folosește noul sistem filozofic cu memoria utilizatorului
        aiReply = await generatePhilosophicalResponse(
          prompt,
          assistantName,
          addressMode,
          apiKey,
          userId,
          personalContext,
          specialInstructions
        );

        // Salvează conversația
        await profileManager.saveConversation(prompt, aiReply, extractedInfo);

        usedFirebase = true;
        console.log(
          `[FILOSOFUL ROMÂN] Răspuns generat cu memorie și filozofie pentru ${userId}`
        );
      } else {
        // Pentru utilizatori anonimi, folosește doar filozofia din Firebase
        aiReply = await generatePhilosophicalResponse(
          prompt,
          assistantName,
          addressMode,
          apiKey,
          "anonim"
        );
        usedFirebase = true;
        console.log(
          "[FILOSOFUL ROMÂN] Răspuns generat cu filozofie pentru utilizator anonim"
        );
      }
    } catch (firebaseError) {
      console.error("[FILOSOFUL ROMÂN] Firebase error:", firebaseError);
      // Fallback la răspuns filozofic fără memorie
      aiReply = await generatePhilosophicalResponse(
        prompt,
        assistantName,
        addressMode,
        apiKey,
        "fallback"
      );
      console.log(
        "[FILOSOFUL ROMÂN] Folosește filozofie fără memorie Firebase"
      );
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: aiReply,
        withMemory: usedFirebase,
        mode: usedFirebase ? "philosophy_with_memory" : "philosophy_only",
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error("[FILOSOFUL ROMÂN] Eroare:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error:
          "Eroare la răspunsul filozofic. Verifică conexiunea și încearcă din nou.",
        details: error.message,
      }),
    };
  }
};
