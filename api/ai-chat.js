// Simple Node.js Express backend for OpenAI proxy (safe for API key)
// Place your OpenAI API key in the .env file as OPENAI_API_KEY=sk-...

const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(express.json());

app.post("/api/ai-chat", async (req, res) => {
  const {
    prompt,
    assistantName,
    addressMode,
    personalizedContext,
    conversationHistory,
  } = req.body;
  if (!prompt || !assistantName || !addressMode) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Construiește system prompt-ul cu contextul personalizat
    let systemPrompt = `${assistantName} este un asistent AI personal. Folosește modul de adresare: ${addressMode}.`;

    // Adaugă contextul personalizat dacă există
    if (personalizedContext) {
      systemPrompt += `\n\n${personalizedContext}`;
    }

    // Pregătește mesajele pentru conversație
    const messages = [{ role: "system", content: systemPrompt }];

    // Adaugă istoricul conversației dacă există (pentru context)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      // Adaugă ultimele 10 mesaje pentru context, dar limitat pentru a nu depăși token-urile
      const recentHistory = conversationHistory.slice(-10);

      recentHistory.forEach((msg) => {
        if (msg.sender === "user") {
          messages.push({ role: "user", content: msg.content });
        } else if (msg.sender === "ai") {
          messages.push({ role: "assistant", content: msg.content });
        }
      });
    }

    // Adaugă mesajul curent
    messages.push({ role: "user", content: prompt });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: personalizedContext ? 200 : 120, // Mai multe token-uri dacă avem context personalizat
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `OpenAI API error: ${data.error?.message || "Unknown error"}`
      );
    }

    res.json({
      reply: data.choices?.[0]?.message?.content?.trim() || "(Fără răspuns AI)",
    });
  } catch (err) {
    console.error("AI Chat Error:", err);
    res.status(500).json({ error: "OpenAI error", details: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AI backend running on port ${PORT}`);
});
