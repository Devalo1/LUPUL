import axios from "axios";
import { AI_PROFILES, type AIProfileType } from "./aiProfiles";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Configurări AI modificabile
export const AI_CONFIG = {
  model: "gpt-3.5-turbo", // Poți schimba în "gpt-4" pentru răspunsuri mai bune
  temperature: 0.7, // 0.1-1.0: Cât de creativ/imprevizibil să fie (0.7 = echilibrat)
  max_tokens: 500, // Lungimea maximă a răspunsului
  top_p: 0.9, // Diversitatea vocabularului (0.1-1.0)
  frequency_penalty: 0.3, // Penalizează repetarea (0-2)
  presence_penalty: 0.3, // Încurajează subiecte noi (0-2)
};

export async function getTherapyResponse(
  messages: Array<{ role: string; content: string }>,
  profileType?: AIProfileType,
  customConfig?: Partial<typeof AI_CONFIG>
) {
  // Determină profilul AI de folosit
  const profile = profileType ? AI_PROFILES[profileType] : null;

  // Vite injectează variabilele de mediu cu prefixul VITE_
  const apiKey =
    import.meta.env.VITE_OPENAI_API_KEY ||
    import.meta.env.REACT_APP_OPENAI_API_KEY ||
    "";

  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.error("Nu există cheia OpenAI în variabilele de mediu!");
    throw new Error("OpenAI API key is missing");
  }

  // Combină configurația default cu profilul și configurația personalizată
  const config = {
    ...AI_CONFIG,
    ...(profile?.config || {}),
    ...customConfig,
  };

  // Pregătește mesajele cu prompt-ul de sistem din profil (dacă există)
  let processedMessages = messages;
  if (profile && messages[0]?.role !== "system") {
    processedMessages = [
      { role: "system", content: profile.systemPrompt },
      ...messages,
    ];
  } else if (profile && messages[0]?.role === "system") {
    // Înlocuiește primul mesaj de sistem cu cel din profil
    processedMessages = [
      { role: "system", content: profile.systemPrompt },
      ...messages.slice(1),
    ];
  }

  const response = await axios.post(
    OPENAI_API_URL,
    {
      model: config.model,
      messages: processedMessages,
      temperature: config.temperature,
      max_tokens: config.max_tokens,
      top_p: config.top_p,
      frequency_penalty: config.frequency_penalty,
      presence_penalty: config.presence_penalty,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content;
}
