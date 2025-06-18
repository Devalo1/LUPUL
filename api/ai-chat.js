// Simple Node.js Express backend for OpenAI proxy (safe for API key)
// Place your OpenAI API key in the .env file as OPENAI_API_KEY=sk-...

const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(express.json());

app.post("/api/ai-chat", async (req, res) => {
  const { prompt, assistantName, addressMode } = req.body;
  if (!prompt || !assistantName || !addressMode) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
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
    res.json({
      reply: data.choices?.[0]?.message?.content?.trim() || "(Fără răspuns AI)",
    });
  } catch (err) {
    res.status(500).json({ error: "OpenAI error", details: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AI backend running on port ${PORT}`);
});
