// Funcție Netlify simplă pentru AI Chat - backup fără Firebase
// Folosește doar OpenAI API pentru răspunsuri rapide

import fetch from "node-fetch";

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
    const { prompt, assistantName = "Asistent AI", addressMode = "tu" } = body;

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

    console.log(`[AI CHAT SIMPLE] Procesez mesajul...`);

    // Construiește system prompt-ul simplu
    const systemPrompt = `Ești ${assistantName}, un asistent AI prietenos și inteligent. Folosește modul de adresare: ${addressMode}. Răspunde într-un mod natural și util.`;

    // Pregătește mesajele pentru conversație
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ];

    console.log(`[AI CHAT SIMPLE] Apelează OpenAI API...`);

    // Apelează OpenAI API
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
    console.log(`[AI CHAT SIMPLE] OpenAI răspuns status: ${response.status}`);

    if (!response.ok) {
      console.error("[AI CHAT SIMPLE] OpenAI API Error:", data);
      throw new Error(
        `OpenAI API error: ${data.error?.message || "Unknown error"}`
      );
    }

    const aiReply =
      data.choices?.[0]?.message?.content?.trim() || "(Fără răspuns AI)";

    console.log(`[AI CHAT SIMPLE] Răspuns generat cu succes`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: aiReply,
        mode: "simple", // Indicator că rulează în modul simplu
      }),
    };
  } catch (error) {
    console.error("[AI CHAT SIMPLE] Eroare:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error:
          "Eroare la răspunsul AI. Verifică conexiunea și încearcă din nou.",
        details: error.message,
      }),
    };
  }
};
