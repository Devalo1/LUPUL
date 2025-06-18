// Netlify Function: ai-chat.js
// Place your OpenAI API key in Netlify environment variables as OPENAI_API_KEY

const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  console.log(
    "[ai-chat] OPENAI_API_KEY:",
    process.env.OPENAI_API_KEY ? "EXISTS" : "MISSING"
  );
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }
  try {
    const { prompt, assistantName, addressMode } = JSON.parse(event.body);
    if (!prompt || !assistantName || !addressMode) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }
    const systemPrompt = `${assistantName} este un asistent AI personal. Folosește modul de adresare: ${addressMode}. Răspunde la mesajul: ${prompt}`;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: 120,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    console.log("[ai-chat] OpenAI response:", data);
    return {
      statusCode: 200,
      body: JSON.stringify({
        reply:
          data.choices?.[0]?.message?.content?.trim() || "(Fără răspuns AI)",
      }),
    };
  } catch (err) {
    console.error("[ai-chat] ERROR:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "OpenAI error", details: err.message }),
    };
  }
};
