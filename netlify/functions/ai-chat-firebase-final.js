// Netlify Function pentru AI Chat cu Firebase - Memorie Persistentă
// AI-ul își amintește totul despre utilizator din baza de date Firebase

import fetch from "node-fetch";
import {
  UserProfileManager,
  extractInfoFromMessage,
} from "../../lib/firebase-user-profiles.cjs";

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
    const { prompt, assistantName, addressMode, userId } = body;

    if (!prompt || !assistantName || !addressMode || !userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error:
            "Missing required fields: prompt, assistantName, addressMode, userId",
        }),
      };
    }

    console.log(`[AI CHAT] Procesez mesajul pentru utilizatorul: ${userId}`); // Setează emulatorul Firebase pentru dezvoltare
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
      process.env.FIRESTORE_EMULATOR_HOST = "localhost:8081";
    }

    // Inițializează profilul Firebase pentru utilizator
    const profileManager = new UserProfileManager(userId);
    await profileManager.initializeProfile();

    // Verifică dacă utilizatorul întreabă despre informațiile sale personale
    const isPersonalQuestion = checkIfPersonalQuestion(prompt);

    if (isPersonalQuestion) {
      // Răspunde pe baza datelor din Firebase
      const personalResponse = await generatePersonalResponse(
        prompt,
        profileManager,
        assistantName
      );

      // Salvează conversația
      await profileManager.saveConversation(prompt, personalResponse, null);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          reply: personalResponse,
          fromDatabase: true, // Pentru debugging
        }),
      };
    } // Extrage informații din mesajul utilizatorului
    const extractedInfo = extractInfoFromMessage(prompt);
    console.log(`[AI CHAT] Informații extrase:`, extractedInfo); // VERIFICĂ CONFIRMĂRILE MAI ÎNTÂI
    const currentProfile = await profileManager.getProfile();
    if (
      extractedInfo.confirmation &&
      currentProfile?.profile?.pendingNameConfirmation
    ) {
      if (extractedInfo.confirmation === "yes") {
        // Confirmă numele din sesiunea anterioară
        await profileManager.updateProfile({
          name: currentProfile.profile.pendingNameConfirmation,
        });
        console.log(
          `[AI CHAT] Nume confirmat și salvat: ${currentProfile.profile.pendingNameConfirmation}`
        );
        extractedInfo.confirmedName =
          currentProfile.profile.pendingNameConfirmation;

        // Șterge confirmarea în așteptare
        await profileManager.updateProfile({ pendingNameConfirmation: null });
      } else {
        // Utilizatorul a negat numele
        console.log(
          `[AI CHAT] Nume respins de utilizator: ${currentProfile.profile.pendingNameConfirmation}`
        );
        await profileManager.updateProfile({ pendingNameConfirmation: null });
        extractedInfo.rejectedName =
          currentProfile.profile.pendingNameConfirmation;
      }
    } // Logică specială pentru confirmarea numelui când încrederea este scăzută
    let nameConfirmationNeeded = false;
    if (extractedInfo.needsNameConfirmation) {
      nameConfirmationNeeded = true;
      console.log(
        `[AI CHAT] Nume detectat cu încredere scăzută: ${extractedInfo.name} - necesită confirmare`
      );
      // Salvează numele ca pending până la confirmare
      await profileManager.updateProfile({
        pendingNameConfirmation: extractedInfo.name,
      });
      console.log(
        `[AI CHAT] Nume în așteptarea confirmării: ${extractedInfo.name}`
      );
    }

    // Actualizează profilul utilizatorului cu informațiile extrase
    // Pentru nume cu încredere scăzută, nu actualiza până la confirmare
    const profileUpdates = { ...extractedInfo };
    if (nameConfirmationNeeded) {
      delete profileUpdates.name; // Nu salvăm numele până nu confirmăm
      delete profileUpdates.needsNameConfirmation;
      delete profileUpdates.nameConfidence;
    }

    // Nu salvăm confirmările ca părți ale profilului
    delete profileUpdates.confirmation;
    delete profileUpdates.confirmedName;
    delete profileUpdates.rejectedName;

    if (Object.keys(profileUpdates).length > 0) {
      await profileManager.updateProfile(profileUpdates);
      console.log(`[AI CHAT] Profil actualizat pentru ${userId}`);
    }

    // Verifică dacă utilizatorul confirmă un nume anterior propus
    const profile = await profileManager.getProfile();
    if (extractedInfo.confirmation && profile?.pendingNameConfirmation) {
      if (extractedInfo.confirmation === "yes") {
        // Confirmă numele din sesiunea anterioară
        await profileManager.updateProfile({
          name: profile.pendingNameConfirmation,
        });
        console.log(
          `[AI CHAT] Nume confirmat și salvat: ${profile.pendingNameConfirmation}`
        );
        extractedInfo.confirmedName = profile.pendingNameConfirmation;

        // Șterge confirmarea în așteptare
        await profileManager.updateProfile({ pendingNameConfirmation: null });
      } else {
        // Utilizatorul a negat numele
        console.log(
          `[AI CHAT] Nume respins de utilizator: ${profile.pendingNameConfirmation}`
        );
        await profileManager.updateProfile({ pendingNameConfirmation: null });
        extractedInfo.rejectedName = profile.pendingNameConfirmation;
      }
    }

    // Dacă cere confirmare pentru un nume nou, salvează-l ca pending
    if (nameConfirmationNeeded && extractedInfo.name) {
      await profileManager.updateProfile({
        pendingNameConfirmation: extractedInfo.name,
      });
      console.log(
        `[AI CHAT] Nume în așteptarea confirmării: ${extractedInfo.name}`
      );
    }

    // Obține contextul personalizat din Firebase
    const personalContext = await profileManager.generateContextForAI();
    console.log(
      `[AI CHAT] Context personalizat generat (${personalContext.length} caractere)`
    );

    // Construiește system prompt-ul cu contextul din Firebase
    let systemPrompt = `Ești ${assistantName}, un asistent AI personal inteligent și empatic. Folosește modul de adresare: ${addressMode}.`;

    if (personalContext) {
      systemPrompt += `\n\n${personalContext}`;
      systemPrompt += `\n\nFolosește aceste informații pentru a personaliza răspunsurile tale. Dacă utilizatorul întreabă despre informații pe care le știi despre el (nume, vârstă, etc.), răspunde-i pe baza datelor pe care le ai.`;
    }

    // Pregătește mesajele pentru conversație cu istoric din Firebase
    const messages = [{ role: "system", content: systemPrompt }];

    // Adaugă ultimele conversații din Firebase pentru context
    const recentConversations = await profileManager.getRecentConversations(5);
    recentConversations.reverse().forEach((conv) => {
      if (conv.userMessage) {
        messages.push({ role: "user", content: conv.userMessage });
      }
      if (conv.aiResponse) {
        messages.push({ role: "assistant", content: conv.aiResponse });
      }
    });

    // Adaugă mesajul curent
    messages.push({ role: "user", content: prompt });

    // Apelează OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: personalContext ? 300 : 200,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `OpenAI API error: ${data.error?.message || "Unknown error"}`
      );
    }
    const aiReply =
      data.choices?.[0]?.message?.content?.trim() || "(Fără răspuns AI)";

    // Logică specială pentru confirmarea numelui
    let finalReply = aiReply;
    if (nameConfirmationNeeded && extractedInfo.name) {
      const confirmationMessages = [
        `${aiReply}\n\nApropo, să înțeleg că numele tău este ${extractedInfo.name}? Vreau să fiu sigur că îți spun corect pe nume.`,
        `${aiReply}\n\nDe altfel, este ${extractedInfo.name} numele tău? Să știu cum să mă adresez.`,
        `${aiReply}\n\nCa să fiu sigur - te cheamă ${extractedInfo.name}, corect?`,
      ];
      finalReply =
        confirmationMessages[
          Math.floor(Math.random() * confirmationMessages.length)
        ];
    } else {
      // Îmbunătățește răspunsul cu întrebări contextualizate pentru completarea profilului
      finalReply = await profileManager.generateResponseWithQuestion(aiReply);
    } // Salvează conversația în Firebase
    await profileManager.saveConversation(prompt, finalReply, extractedInfo);
    console.log(`[AI CHAT] Conversație salvată pentru ${userId}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: finalReply,
        extractedInfo: extractedInfo, // Pentru debugging
        profileUpdated: Object.keys(profileUpdates).length > 0,
        nameConfirmationNeeded: nameConfirmationNeeded,
        profileQuestionAsked: finalReply.length > aiReply.length,
      }),
    };
  } catch (error) {
    console.error("[AI CHAT] Eroare:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Server error",
        details: error.message,
      }),
    };
  }
};

// Verifică dacă utilizatorul întreabă despre informațiile sale personale
function checkIfPersonalQuestion(prompt) {
  const personalQuestions = [
    /cum m[ăa] numesc/i,
    /care (?:e|este) numele meu/i,
    /c[âa]ți? ani am/i,
    /unde lucrez/i,
    /cu ce m[ăa] ocup/i,
    /ce (?:vârst[ăa]|ocupa[țt]ie) am/i,
    /unde locuiesc/i,
    /ce (?:îmi place|interese am)/i,
    /ce știi despre mine/i,
    /spune-mi despre mine/i,
    /ce informații ai despre mine/i,
  ];

  return personalQuestions.some((pattern) => pattern.test(prompt));
}

// Generează răspuns personal bazat pe datele din Firebase
async function generatePersonalResponse(prompt, profileManager, assistantName) {
  const profile = await profileManager.getProfile();

  if (!profile || !profile.profile) {
    return "Nu am încă informații despre tine. Poți să-mi spui mai multe despre tine?";
  }

  const p = profile.profile;
  const lowerPrompt = prompt.toLowerCase();

  // Răspunsuri specifice bazate pe întrebare
  if (lowerPrompt.includes("numesc") || lowerPrompt.includes("nume")) {
    if (p.name) {
      return `Te numești ${p.name}.`;
    } else {
      return "Nu mi-ai spus încă numele tău. Cum îți place să-ți spun?";
    }
  }

  if (lowerPrompt.includes("ani") || lowerPrompt.includes("vârstă")) {
    if (p.age) {
      return `Ai ${p.age} ani.`;
    } else {
      return "Nu știu ce vârstă ai. Vrei să-mi spui?";
    }
  }

  if (lowerPrompt.includes("lucrez") || lowerPrompt.includes("ocup")) {
    if (p.occupation) {
      return `Lucrezi ca ${p.occupation}.`;
    } else {
      return "Nu știu cu ce te ocupi. Poți să-mi spui?";
    }
  }

  if (lowerPrompt.includes("locuiesc") || lowerPrompt.includes("oraș")) {
    if (p.location) {
      return `Locuiești în ${p.location}.`;
    } else {
      return "Nu știu unde locuiești. Din ce oraș ești?";
    }
  }

  if (lowerPrompt.includes("place") || lowerPrompt.includes("interese")) {
    if (p.interests.length > 0) {
      return `Îți place să ${p.interests.join(", ")}.`;
    } else {
      return "Nu știu ce îți place să faci. Ce hobby-uri ai?";
    }
  }

  // Răspuns general cu toate informațiile disponibile
  let response = `Iată ce știu despre tine:\n`;
  let hasInfo = false;

  if (p.name) {
    response += `- Te numești ${p.name}\n`;
    hasInfo = true;
  }
  if (p.age) {
    response += `- Ai ${p.age} ani\n`;
    hasInfo = true;
  }
  if (p.occupation) {
    response += `- Lucrezi ca ${p.occupation}\n`;
    hasInfo = true;
  }
  if (p.location) {
    response += `- Locuiești în ${p.location}\n`;
    hasInfo = true;
  }
  if (p.interests.length > 0) {
    response += `- Îți place să ${p.interests.join(", ")}\n`;
    hasInfo = true;
  }

  if (!hasInfo) {
    return "Nu am încă multe informații despre tine. Vrei să-mi spui mai multe despre tine?";
  }

  return response;
}
