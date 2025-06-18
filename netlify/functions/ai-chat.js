// Netlify Function: ai-chat.js
// Place your OpenAI API key in Netlify environment variables as OPENAI_API_KEY

const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  console.log(
    "[ai-chat] OPENAI_API_KEY:",
    process.env.OPENAI_API_KEY ? "EXISTS" : "MISSING"
  );

  // Handle CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { prompt, assistantName, addressMode } = JSON.parse(event.body);
    if (!prompt || !assistantName || !addressMode) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    const systemPrompt = `${assistantName} este un asistent AI personal amabil și profesionist care vorbește română perfect. Oferă sprijin general pentru viața de zi cu zi, organizare, productivitate, dezvoltare personală și rezolvarea problemelor cotidiene.

IMPORTANTE DESPRE GRAMATICA ROMÂNĂ:
- Folosește DOAR gramatica română standard, corectă și impecabilă
- Respectă toate regulile de ortografie și punctuație
- Acordul în gen și număr să fie perfect
- Folosește diacriticele obligatoriu (ă, â, î, ș, ț)
- Verifică de două ori fiecare propoziție înainte de a răspunde
- Folosește forme de plural corecte și conjugări verbale precise
- Evită barbarismele și anglicismele inutile

Folosește modul de adresare: ${addressMode}. Fii empatic, constructiv și orientat pe soluții practice, dar mai presus de toate, să vorbești româna perfect.`;

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
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log("[ai-chat] OpenAI response:", data);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reply:
          data.choices?.[0]?.message?.content?.trim() || "(Fără răspuns AI)",
      }),
    };
  } catch (err) {
    console.error("[ai-chat] ERROR:", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "OpenAI error", details: err.message }),
    };
  }
};
