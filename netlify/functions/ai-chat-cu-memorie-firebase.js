// Netlify Function pentru AI Chat cu Firebase - Memorie Persistentă
// AI-ul își amintește totul despre utilizator din baza de date Firebase

import fetch from "node-fetch";
import {
  UserProfileManager,
  extractInfoFromMessage,
} from "../../lib/firebase-user-profiles.cjs";

// Funcția principală Netlify cu Firebase
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

    console.log(
      `[AI CHAT FIREBASE] Procesez mesajul pentru utilizatorul: ${userId}`
    );

    // Inițializează managerul de profil Firebase pentru utilizator
    const profileManager = new UserProfileManager(userId);
    await profileManager.initializeProfile();

    // Extrage informații din mesajul utilizatorului
    const extractedInfo = extractInfoFromMessage(prompt);
    console.log(`[AI CHAT] Informații extrase:`, extractedInfo);

    // Actualizează profilul cu informațiile noi
    if (Object.keys(extractedInfo).length > 0) {
      await profileManager.updateProfile(extractedInfo);

      // Adaugă interese și trăsături separate
      if (extractedInfo.interests) {
        for (const interest of extractedInfo.interests) {
          await profileManager.addInterest(interest);
        }
      }
      if (extractedInfo.personalityTraits) {
        for (const trait of extractedInfo.personalityTraits) {
          await profileManager.addPersonalityTrait(trait);
        }
      }

      console.log(`[AI CHAT] Profil actualizat pentru ${userId}`);
    }

    // Generează contextul complet din Firebase
    const personalizedContext = await profileManager.generateContextForAI();
    console.log(
      `[AI CHAT] Context Firebase generat (${personalizedContext.length} caractere)`
    );

    // Construiește system prompt-ul cu contextul personalizat
    let systemPrompt = `Ești ${assistantName}, un asistent AI personal inteligent cu memorie perfectă. Folosește modul de adresare: ${addressMode}.`;

    if (personalizedContext) {
      systemPrompt += `\n\n${personalizedContext}`;
      systemPrompt += `\n\nFOLOSEȘTE ACESTE INFORMAȚII pentru a răspunde personal și relevant. Dacă utilizatorul întreabă despre sine (nume, vârstă, etc.), răspunde pe baza informațiilor pe care le știi despre el din istoric. Arată că îți amintești conversațiile anterioare.`;
    }

    // Pregătește mesajele pentru conversație
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
        max_tokens: personalizedContext ? 300 : 200,
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

    // Salvează conversația în Firebase
    await profileManager.saveConversation(prompt, aiReply, extractedInfo);
    console.log(`[AI CHAT] Conversație salvată în Firebase pentru ${userId}`);

    // Obține profilul actualizat pentru debugging
    const updatedProfile = await profileManager.getProfile();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: aiReply,
        userProfile: updatedProfile?.profile || null, // Pentru debugging
        extractedInfo: extractedInfo, // Pentru debugging
        contextGenerated: personalizedContext ? true : false,
      }),
    };
  } catch (error) {
    console.error("[AI CHAT FIREBASE] Eroare:", error);
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
