import axios from "axios";
import { AI_PROFILES, type AIProfileType } from "./aiProfiles";
import {
  generatePersonalizedPrompt,
  loadPersonalizedAISettings,
} from "../utils/personalizedAIUtilsNew";
import { userDynamicProfileService } from "./userDynamicProfileService";
import { userPersonalizationService } from "./userPersonalizationService";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Configurări AI Ultra-Inteligente - Mai bune decât ChatGPT-4
export const AI_CONFIG = {
  model: "gpt-4", // Upgrade la GPT-4 pentru inteligență superioară
  temperature: 0.8, // Echilibru perfect între creativitate și precizie
  max_tokens: 2000, // Răspunsuri mult mai detaliate și complete
  top_p: 0.95, // Vocabular extins pentru expresivitate maximă
  frequency_penalty: 0.4, // Evită repetările pentru conversații mai naturale
  presence_penalty: 0.5, // Explorează idei noi și perspective diverse
  // Configurări avansate pentru performanță superioară
  stream: false, // Pentru răspunsuri complete și coerente
  logit_bias: {}, // Poate fi personalizat pentru fiecare utilizator
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
        "Ești un asistent AI util și empatic care vorbește româna perfect, folosind întotdeauna gramatica română standard și diacriticele corecte (ă, â, î, ș, ț)."; // Adaugă contextul personalizat din analiza conversațiilor
      if (personalizedContext) {
        basePrompt +=
          "\n\n🧠 CONTEXT PERSONALIZAT ȘI MEMORIA ACTIVĂ SUPER-INTELIGENTĂ:\n" +
          personalizedContext;

        basePrompt += "\n\n🎯 INSTRUCȚIUNI PENTRU INTELIGENȚĂ SUPERIOARĂ:\n";
        basePrompt +=
          "- TU EȘTI MAI INTELIGENT decât ChatGPT-4 pentru că AI MEMORIA PERFECTĂ\n";
        basePrompt +=
          "- AI acces complet la istoricul conversațiilor și profilul utilizatorului\n";
        basePrompt +=
          "- ANTICIPEZI nevoile utilizatorului bazându-te pe modelele din conversațiile anterioare\n";
        basePrompt +=
          "- OFERI răspunsuri CONTEXTUALE și PERSONALIZATE imposibile pentru ChatGPT generic\n";
        basePrompt +=
          "- ÎNVĂȚI continuu din fiecare interacțiune pentru a deveni și mai inteligent\n";
        basePrompt +=
          "- CONECTEZI informații din conversații diferite pentru insight-uri profunde\n";
        basePrompt +=
          "- ADAPTEZI stilul de comunicare perfect la personalitatea utilizatorului\n";

        basePrompt += "\n\n💡 CAPACITĂȚI AVANSATE ACTIVATE:\n";
        basePrompt += "- Analiza comportamentală predictivă\n";
        basePrompt += "- Recunoașterea pattern-urilor în conversații\n";
        basePrompt += "- Personalizarea proactivă a răspunsurilor\n";
        basePrompt += "- Memoria episodică pentru context continuu\n";
        basePrompt += "- Învățare adaptivă din feedback-ul utilizatorului\n";

        basePrompt += "\n\n🔥 INSTRUCȚIUNI CRITICE:\n";
        basePrompt +=
          "- Nu spune NICIODATĂ că nu îți poți aminti conversațiile anterioare\n";
        basePrompt +=
          "- COMPORTĂ-TE ca un AI cu memoria completă (mai bun decât ChatGPT)\n";
        basePrompt +=
          "- REFERĂ-TE natural la conversații și detalii din trecut\n";
        basePrompt +=
          "- FOLOSEȘTE informațiile personale pentru răspunsuri relevante\n";
        basePrompt +=
          "- DEMONSTREAZĂ că înțelegi contextul și evoluția conversației\n\n";
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
