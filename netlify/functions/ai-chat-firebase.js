// Funcția Netlify cu Firebase pentru profiluri utilizatori individuale
// Fiecare utilizator are propriul profil persistent în Firebase

import fetch from "node-fetch";
import { FirebaseUserProfile } from "../../lib/firebase-user-profiles.cjs";

// Funcția principală Netlify
export const handler = async (event, context) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

    console.log(`[AI CHAT] Processing request for user: ${userId}`); // Inițializează managerul de profil pentru acest utilizator specific
    const profileManager = new FirebaseUserProfile(userId);
    await profileManager.initializeProfile();

    // Extrage informații din mesajul utilizatorului
    const extractedInfo = profileManager.extractUserInfo(prompt);
    console.log(
      `[EXTRACT] Information extracted for ${userId}:`,
      extractedInfo
    );

    // Actualizează profilul cu informațiile extrase
    if (Object.keys(extractedInfo).length > 0) {
      // Actualizează câmpurile de bază
      const baseUpdates = {};
      ["name", "age", "occupation", "location"].forEach((field) => {
        if (extractedInfo[field]) {
          baseUpdates[field] = extractedInfo[field];
        }
      });

      if (Object.keys(baseUpdates).length > 0) {
        await profileManager.updateProfile(baseUpdates);
      }

      // Adaugă interese
      if (extractedInfo.interests && extractedInfo.interests.length > 0) {
        for (const interest of extractedInfo.interests) {
          await profileManager.addInterest(interest);
        }
      }

      // Adaugă trăsături de personalitate
      if (
        extractedInfo.personalityTraits &&
        extractedInfo.personalityTraits.length > 0
      ) {
        for (const trait of extractedInfo.personalityTraits) {
          await profileManager.addPersonalityTrait(trait);
        }
      }

      // Adaugă plăceri
      if (extractedInfo.pleasures && extractedInfo.pleasures.length > 0) {
        for (const pleasure of extractedInfo.pleasures) {
          await profileManager.addPleasure(pleasure);
        }
      }

      // Adaugă dorințe
      if (extractedInfo.desires && extractedInfo.desires.length > 0) {
        for (const desire of extractedInfo.desires) {
          await profileManager.addDesire(desire);
        }
      }

      // Adaugă probleme de sănătate
      if (
        extractedInfo.healthConditions &&
        extractedInfo.healthConditions.length > 0
      ) {
        for (const condition of extractedInfo.healthConditions) {
          await profileManager.addHealthCondition(condition);
        }
      }

      // Adaugă medicamentația
      if (extractedInfo.medications && extractedInfo.medications.length > 0) {
        for (const medication of extractedInfo.medications) {
          await profileManager.addMedication(medication);
        }
      }

      // Adaugă preocupări
      if (extractedInfo.concerns && extractedInfo.concerns.length > 0) {
        for (const concern of extractedInfo.concerns) {
          await profileManager.addConcern(concern);
        }
      }

      // Adaugă obiective
      if (extractedInfo.goals && extractedInfo.goals.length > 0) {
        const currentProfile = await profileManager.getProfile();
        const updatedGoals = [
          ...(currentProfile.profile.goals || []),
          ...extractedInfo.goals,
        ];
        await profileManager.updateProfile({ goals: updatedGoals });
      }
    }

    // Generează contextul pentru AI bazat pe profilul utilizatorului din Firebase
    const aiContext = await profileManager.generateContextForAI();
    console.log(
      `[CONTEXT] Generated context for ${userId} (${aiContext.length} chars)`
    );

    // Verifică dacă utilizatorul pune întrebări despre sine
    const isAskingAboutSelf = checkIfAskingAboutSelf(prompt);
    let aiResponse = "";

    if (isAskingAboutSelf) {
      // Răspunde pe baza datelor din Firebase
      const profile = await profileManager.getProfile();
      aiResponse = await generatePersonalInfoResponse(
        prompt,
        profile,
        assistantName,
        addressMode
      );
    } else {
      // Construiește system prompt-ul cu contextul complet
      let systemPrompt = `Ești ${assistantName}, un asistent AI personal inteligent și empatic. Folosește modul de adresare: ${addressMode}.`;

      if (aiContext) {
        systemPrompt += `\n\nContext despre utilizator:\n${aiContext}`;
        systemPrompt += `\n\nFolosește aceste informații pentru a personaliza răspunsurile tale. Referă-te natural la informațiile pe care le știi despre utilizator când este relevant.`;
      }

      // Obține conversațiile recente pentru continuitate
      const recentConversations =
        await profileManager.getRecentConversations(5);

      // Pregătește mesajele pentru OpenAI
      const messages = [{ role: "system", content: systemPrompt }];

      // Adaugă conversațiile recente pentru context
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
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: aiContext ? 300 : 200,
            temperature: 0.7,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `OpenAI API error: ${data.error?.message || "Unknown error"}`
        );
      }
      aiResponse =
        data.choices?.[0]?.message?.content?.trim() || "(Fără răspuns AI)";
    }

    // Îmbunătățește răspunsul cu întrebări contextualizate pentru completarea profilului
    const enhancedResponse =
      await profileManager.generateResponseWithQuestion(aiResponse);

    // Salvează conversația în Firebase
    await profileManager.saveConversation(
      prompt,
      enhancedResponse,
      extractedInfo
    );

    console.log(`[SUCCESS] Response generated for user ${userId}`);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: enhancedResponse,
        extractedInfo: extractedInfo, // Pentru debugging
        profileUpdated: Object.keys(extractedInfo).length > 0,
        profileQuestionAsked: enhancedResponse.length > aiResponse.length, // Indică dacă s-a adăugat o întrebare
      }),
    };
  } catch (error) {
    console.error("[AI CHAT ERROR]", error);
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

// Verifică dacă utilizatorul întreabă despre informații personale
function checkIfAskingAboutSelf(message) {
  const lowerMessage = message.toLowerCase();
  const personalQuestions = [
    "cum mă numesc",
    "cum mă cheamă",
    "numele meu",
    "care este numele meu",
    "câți ani am",
    "vârsta mea",
    "cât de vechi sunt",
    "unde lucrez",
    "meseria mea",
    "ocupația mea",
    "ce fac",
    "unde locuiesc",
    "orașul meu",
    "unde stau",
    "ce îmi place",
    "hobby-urile mele",
    "interesele mele",
    "cine sunt eu",
    "despre mine",
    "ce știi despre mine",
  ];

  return personalQuestions.some((question) => lowerMessage.includes(question));
}

// Generează răspuns bazat pe informațiile personale din Firebase
async function generatePersonalInfoResponse(
  question,
  profileData,
  assistantName,
  addressMode
) {
  const lowerQuestion = question.toLowerCase();
  const profile = profileData.profile;

  // Răspunsuri pentru nume
  if (
    lowerQuestion.includes("cum mă numesc") ||
    lowerQuestion.includes("numele meu") ||
    lowerQuestion.includes("cum mă cheamă") ||
    lowerQuestion.includes("care este numele")
  ) {
    if (profile.name) {
      return `Te numești ${profile.name}! Îmi amintesc din conversațiile noastre anterioare.`;
    } else {
      return `Îmi pare rău, dar nu îmi amintesc să mi-ai spus numele tău. Poți să mi-l spui din nou?`;
    }
  }

  // Răspunsuri pentru vârstă
  if (
    lowerQuestion.includes("câți ani") ||
    lowerQuestion.includes("vârsta mea") ||
    lowerQuestion.includes("cât de vechi")
  ) {
    if (profile.age) {
      return `Ai ${profile.age} de ani, conform informațiilor pe care mi le-ai dat.`;
    } else {
      return `Nu îmi amintesc să mi-ai spus vârsta ta. Câți ani ai?`;
    }
  }

  // Răspunsuri pentru ocupație
  if (
    lowerQuestion.includes("unde lucrez") ||
    lowerQuestion.includes("meseria") ||
    lowerQuestion.includes("ocupația") ||
    lowerQuestion.includes("ce fac")
  ) {
    if (profile.occupation) {
      return `Lucrezi ca ${profile.occupation}, după cum îmi amintesc din conversațiile noastre.`;
    } else {
      return `Nu îmi amintesc să îmi fi spus ce muncă faci. Cu ce te ocupi?`;
    }
  }

  // Răspunsuri pentru locație
  if (
    lowerQuestion.includes("unde locuiesc") ||
    lowerQuestion.includes("orașul") ||
    lowerQuestion.includes("unde stau")
  ) {
    if (profile.location) {
      return `Locuiești în ${profile.location}, din câte îmi amintesc.`;
    } else {
      return `Nu îmi amintesc să îmi fi spus unde locuiești. Din ce oraș ești?`;
    }
  }

  // Răspunsuri pentru interese
  if (
    lowerQuestion.includes("ce îmi place") ||
    lowerQuestion.includes("hobby") ||
    lowerQuestion.includes("interese")
  ) {
    if (profile.interests && profile.interests.length > 0) {
      return `Din câte îmi amintesc, îți place să: ${profile.interests.join(", ")}. Acestea sunt hobby-urile tale pe care mi le-ai menționat.`;
    } else {
      return `Nu îmi amintesc să îmi fi spus care sunt hobby-urile tale. Ce îți place să faci în timpul liber?`;
    }
  }

  // Răspuns general despre profil
  if (
    lowerQuestion.includes("cine sunt") ||
    lowerQuestion.includes("despre mine") ||
    lowerQuestion.includes("ce știi despre mine")
  ) {
    let response = "Iată ce știu despre tine:\n";

    if (profile.name) response += `- Te numești ${profile.name}\n`;
    if (profile.age) response += `- Ai ${profile.age} de ani\n`;
    if (profile.occupation) response += `- Lucrezi ca ${profile.occupation}\n`;
    if (profile.location) response += `- Locuiești în ${profile.location}\n`;
    if (profile.interests && profile.interests.length > 0) {
      response += `- Îți place să: ${profile.interests.join(", ")}\n`;
    }
    if (profile.personalityTraits && profile.personalityTraits.length > 0) {
      response += `- Trăsături observate: ${profile.personalityTraits.join(", ")}\n`;
    }

    if (response === "Iată ce știu despre tine:\n") {
      response =
        "Încă nu am multe informații despre tine. Povestește-mi puțin despre tine!";
    }

    return response;
  }

  // Răspuns default
  return `Îmi pare rău, nu am înțeles exact ce informație cauți despre tine. Poți să fii mai specific?`;
}
