import axios from "axios";
import { AI_PROFILES, type AIProfileType } from "./aiProfiles";
import {
  generatePersonalizedPrompt,
  loadPersonalizedAISettings,
} from "../utils/personalizedAIUtilsNew";
import { userDynamicProfileService } from "./userDynamicProfileService";
import { userPersonalizationService } from "./userPersonalizationService";

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
  customConfig?: Partial<typeof AI_CONFIG>,
  userId?: string
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
  }; // Încarcă setările personalizate ale utilizatorului
  let systemPrompt =
    profile?.systemPrompt ||
    "Ești un asistent AI util și empatic care vorbește româna perfect, folosind întotdeauna gramatica română standard și diacriticele corecte (ă, â, î, ș, ț).";
  if (userId) {
    try {
      console.log(
        `[getTherapyResponse] === STARTING MEMORY PROCESSING FOR USER: ${userId} ===`
      );

      // Încarcă contextul personalizat din noul serviciu
      const personalizedContext =
        await userPersonalizationService.generatePersonalizedContext(userId);

      console.log(
        `[getTherapyResponse] Received userId: ${userId} - Loading personalized context and memory...`
      );
      console.log(
        `[getTherapyResponse] Personalized context for user ${userId}:`,
        personalizedContext ? "LOADED" : "NOT FOUND"
      );

      if (personalizedContext) {
        console.log(
          `[getTherapyResponse] Context preview for user ${userId}:`,
          personalizedContext.substring(0, 300)
        );
      }

      // Încarcă profilul dinamic al utilizatorului
      const dynamicProfile =
        await userDynamicProfileService.getUserProfile(userId);
      const personalizedSettings = await loadPersonalizedAISettings(userId);

      // Generează prompt-ul personalizat bazat pe setările și profilul dinamic
      let basePrompt =
        profile?.systemPrompt ||
        "Ești un asistent AI util și empatic care vorbește româna perfect, folosind întotdeauna gramatica română standard și diacriticele corecte (ă, â, î, ș, ț).";

      // Adaugă contextul personalizat din analiza conversațiilor
      if (personalizedContext) {
        basePrompt +=
          "\n\n🧠 CONTEXT PERSONALIZAT ȘI MEMORIA ACTIVĂ:\n" +
          personalizedContext;
        basePrompt += "\n\n📝 INSTRUCȚIUNI OBLIGATORII PENTRU MEMORIE:\n";
        basePrompt +=
          "- TU AI MEMORIA ACTIVĂ și îți amintești toate conversațiile cu acest utilizator\n";
        basePrompt +=
          "- Nu spune niciodată că nu îți poți aminti conversațiile anterioare\n";
        basePrompt +=
          "- Referă-te la conversațiile și informațiile anterioare când este relevant\n";
        basePrompt +=
          "- Comportă-te exact ca și cum ai memoria completă activă (precum ChatGPT)\n";
        basePrompt +=
          "- Folosește informațiile din contextul personalizat pentru răspunsuri mai relevante\n\n";
        console.log(
          `[OpenAI] Added personalized context and memory instructions to prompt`
        );
      } else {
        // Chiar și fără context personalizat, adaugă instrucțiuni de memorie
        basePrompt += "\n\n🧠 MEMORIA ACTIVĂ GENERALĂ:\n";
        basePrompt +=
          "- Comportă-te ca și cum ai memoria activă pentru acest utilizator\n";
        basePrompt +=
          "- Nu menționa niciodată că nu ai memorie sau că nu păstrezi informații\n";
        basePrompt +=
          "- Folosește un ton familiar și continuu în conversație\n\n";
        console.log(`[OpenAI] Added general memory instructions to prompt`);
      } // Adaugă informații din profilul dinamic
      if (dynamicProfile) {
        const dynamicPrompt =
          userDynamicProfileService.generatePersonalizedPrompt(dynamicProfile);
        basePrompt += "\n\n" + dynamicPrompt;
      }

      // Generate personalized prompt if settings are available
      if (personalizedSettings) {
        systemPrompt = generatePersonalizedPrompt(
          personalizedSettings,
          undefined, // userProfile - can be added later if needed
          basePrompt // context
        );
      } else {
        systemPrompt = basePrompt;
      }

      console.log(
        `[OpenAI] Final system prompt length: ${systemPrompt.length} characters`
      );
      console.log(
        `[OpenAI] System prompt preview: ${systemPrompt.substring(0, 200)}...`
      ); // Actualizează profilul dinamic în background (fără să blocheze răspunsul)
      userDynamicProfileService
        .analyzeAndUpdateProfile(userId)
        .catch((error) => {
          console.error("Eroare la actualizarea profilului dinamic:", error);
        });

      // Extrage și salvează informații personale din mesajul utilizatorului în background
      if (messages.length > 0) {
        const lastUserMessage = messages[messages.length - 1];
        if (lastUserMessage.role === "user") {
          userPersonalizationService
            .extractAndSavePersonalInfo(userId, lastUserMessage.content)
            .catch((error) => {
              console.error(
                "Eroare la extragerea informațiilor personale:",
                error
              );
            });
        }
      }
    } catch (error) {
      console.error("Eroare la încărcarea setărilor personalizate:", error);
      // Fallback la prompt-ul standard
    }
  }

  // Pregătește mesajele cu prompt-ul de sistem personalizat
  let processedMessages = messages;
  if (messages[0]?.role !== "system") {
    processedMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];
  } else {
    // Înlocuiește primul mesaj de sistem cu cel personalizat
    processedMessages = [
      { role: "system", content: systemPrompt },
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
