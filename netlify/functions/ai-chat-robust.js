// Netlify Function optimizată pentru AI Chat - Producție robustă
// Versiune simplificată care gestionează erorile Firebase graceful

import fetch from "node-fetch";

// Fallback simplu pentru când Firebase nu funcționează
const generateSimpleResponse = async (prompt, assistantName, addressMode, apiKey) => {
  const systemPrompt = `Ești ${assistantName}, un asistent AI prietenos și inteligent. Folosește modul de adresare: ${addressMode}. Răspunde într-un mod natural și util.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt }
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 200,
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${data.error?.message || "Unknown error"}`);
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
    const { prompt, assistantName = "Asistent AI", addressMode = "tu", userId } = body;

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

    console.log(`[AI CHAT ROBUST] Procesez mesajul pentru utilizatorul: ${userId || 'anonim'}`);

    // Încearcă să folosească Firebase, dar cu fallback
    let aiReply;
    let usedFirebase = false;

    try {
      // Importă Firebase doar dacă e necesar
      const { UserProfileManager, extractInfoFromMessage } = await import("../../lib/firebase-user-profiles.cjs");
      
      if (userId) {
        const profileManager = new UserProfileManager(userId);
        await profileManager.initializeProfile();

        // Extrage informații din mesaj
        const extractedInfo = extractInfoFromMessage(prompt);
        
        // Actualizează profilul cu informațiile noi
        if (Object.keys(extractedInfo).length > 0) {
          await profileManager.updateProfile(extractedInfo);
        }

        // Generează context personalizat
        const personalContext = await profileManager.generatePersonalizedContext();
        
        // Construiește system prompt cu context Firebase
        let systemPrompt = `Ești ${assistantName}, un asistent AI personal inteligent cu memorie perfectă. Folosește modul de adresare: ${addressMode}.`;
        
        if (personalContext) {
          systemPrompt += `\n\n${personalContext}`;
          systemPrompt += `\n\nFOLOSEȘTE ACESTE INFORMAȚII pentru a răspunde personal și relevant. Arată că îți amintești conversațiile anterioare.`;
        }

        // Pregătește mesajele cu istoric
        const messages = [{ role: "system", content: systemPrompt }];

        // Adaugă conversații recente
        const recentConversations = await profileManager.getRecentConversations(3);
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

        // Apelează OpenAI cu context Firebase
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
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
          throw new Error(`OpenAI API error: ${data.error?.message || "Unknown error"}`);
        }

        aiReply = data.choices?.[0]?.message?.content?.trim() || "(Fără răspuns AI)";
        
        // Salvează conversația în Firebase
        await profileManager.saveConversation(prompt, aiReply, extractedInfo);
        
        usedFirebase = true;
        console.log(`[AI CHAT ROBUST] Răspuns generat cu Firebase pentru ${userId}`);
      } else {
        // Fără userId, folosește răspuns simplu
        aiReply = await generateSimpleResponse(prompt, assistantName, addressMode, apiKey);
        console.log(`[AI CHAT ROBUST] Răspuns simplu generat (fără userId)`);
      }
      
    } catch (firebaseError) {
      console.warn("[AI CHAT ROBUST] Firebase indisponibil, folosesc răspuns simplu:", firebaseError.message);
      // Fallback la răspuns simplu
      aiReply = await generateSimpleResponse(prompt, assistantName, addressMode, apiKey);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: aiReply,
        withMemory: usedFirebase,
        mode: usedFirebase ? "firebase" : "simple",
      }),
    };

  } catch (error) {
    console.error("[AI CHAT ROBUST] Eroare:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Eroare la răspunsul AI. Verifică conexiunea și încearcă din nou.",
        details: error.message,
      }),
    };
  }
};
