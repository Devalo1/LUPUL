// Funcție simplă de test pentru OpenAI API
const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  // Headers pentru CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { messages, userId } = JSON.parse(event.body);

    console.log("[AI-TEST-SIMPLE] Request primit:", {
      userId,
      messageCount: messages?.length,
    });

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Messages array is required" }),
      };
    }

    // Mesaj simplu fără OpenAI pentru testare
    const response = {
      message: `Salut! Sunt filozoful practic român. Am primit mesajul tău: "${messages[messages.length - 1]?.content}". 
      
🧠 Din perspectiva filozofiei aplicabile, îți pot spune că:
• Fiecare întrebare reflectă o căutare a înțelepciunii
• "Cine întreabă mult, mult învață" - proverb românesc
• Curiositatea ta este primul pas către cunoaștere

🏛️ Din studiile de filosofie cunosc:
- Filosofia antică (Socrate, Platon, Aristotel, Stoicii)
- Filosofia românească (Lucian Blaga, Constantin Noica) 
- Filosofia practică modernă și psihologia pozitivă
- Cercetări actuale despre fericire și împlinire

Ce anume te interesează să discutăm despre filosofie?`,
      userId: userId,
      timestamp: new Date().toISOString(),
      isPhilosopher: true,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("[AI-TEST-SIMPLE] Eroare:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        message:
          "Îmi pare rău, am întâmpinat o problemă tehnică. Încearcă din nou.",
      }),
    };
  }
};
