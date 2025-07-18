// AI API Utils - Simplified and reliable approach
// Prioritizes local functions over Netlify functions for better reliability

import { AssistantProfile } from "../models/AssistantProfile";
import { getTherapyResponse } from "../services/openaiService";

// Main function that routes to AI with proper fallback
export const fetchAIResponseSafe = async (
  userMessage: string,
  assistantProfile?: AssistantProfile,
  userId?: string,
  historyMessages?: Array<{ role: string; content: string }>
): Promise<string> => {
  console.log("[fetchAIResponseSafe] Starting AI request...");
  console.log("[fetchAIResponseSafe] User ID:", userId);
  console.log(
    "[fetchAIResponseSafe] Message preview:",
    userMessage.substring(0, 100)
  );

  // Include user name memory and conversation history in context if available
  const prefixMessages: Array<{ role: string; content: string }> = [];
  if (memorizedUserName) {
    console.log(
      "[fetchAIResponseSafe] Injecting memorized user name into context:",
      memorizedUserName
    );
    prefixMessages.push({
      role: "system",
      content: `Numele utilizatorului este ${memorizedUserName}.`,
    });
  }
  try {
    // Primary: Try local getTherapyResponse first (with full context)
    console.log("[fetchAIResponseSafe] Using local therapy response...");

    // Build messages array: memory, history, then current user message
    const localMessages = [
      ...prefixMessages,
      ...(historyMessages || []),
      { role: "user", content: userMessage },
    ];
    const localResponse = await getTherapyResponse(
      localMessages,
      undefined,
      undefined,
      userId
    );

    if (localResponse && localResponse.trim() !== "") {
      console.log("[fetchAIResponseSafe] Local response received successfully");
      console.log(
        "[fetchAIResponseSafe] Response preview:",
        localResponse.substring(0, 100)
      );
      return localResponse;
    }

    console.log(
      "[fetchAIResponseSafe] Local response was empty, trying Netlify fallback..."
    );

    // Fallback: Try Netlify functions only if local fails
    const requestPayload = {
      message: userMessage,
      userId: userId || "anonymous",
      assistantProfile: assistantProfile,
      timestamp: new Date().toISOString(),
    };

    // Try the ultra-intelligent function
    try {
      console.log(
        "[fetchAIResponseSafe] Attempting ultra-intelligent function..."
      );

      const ultraResponse = await fetch(
        "/.netlify/functions/ai-chat-ultra-intelligent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestPayload),
        }
      );

      if (ultraResponse.ok) {
        const result = await ultraResponse.json();
        if (result.response && result.response.trim() !== "") {
          console.log(
            "[fetchAIResponseSafe] Ultra-intelligent response received"
          );
          return result.response;
        }
      }
    } catch (error) {
      console.log(
        "[fetchAIResponseSafe] Ultra-intelligent function failed:",
        error
      );
    }

    // Try the super-intelligent function
    try {
      console.log(
        "[fetchAIResponseSafe] Attempting super-intelligent function..."
      );

      const superResponse = await fetch(
        "/.netlify/functions/ai-chat-super-intelligent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestPayload),
        }
      );

      if (superResponse.ok) {
        const result = await superResponse.json();
        if (result.response && result.response.trim() !== "") {
          console.log(
            "[fetchAIResponseSafe] Super-intelligent response received"
          );
          return result.response;
        }
      }
    } catch (error) {
      console.log(
        "[fetchAIResponseSafe] Super-intelligent function failed:",
        error
      );
    }

    // Try the robust function
    try {
      console.log("[fetchAIResponseSafe] Attempting robust function...");

      const robustResponse = await fetch("/.netlify/functions/ai-chat-robust", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (robustResponse.ok) {
        const result = await robustResponse.json();
        if (result.response && result.response.trim() !== "") {
          console.log("[fetchAIResponseSafe] Robust response received");
          return result.response;
        }
      }
    } catch (error) {
      console.log("[fetchAIResponseSafe] Robust function failed:", error);
    }

    // Final fallback: Helpful response instead of error message
    console.log(
      "[fetchAIResponseSafe] All methods failed, using helpful fallback"
    );

    return await generateHelpfulResponse(userMessage);
  } catch (error) {
    console.error("[fetchAIResponseSafe] Unexpected error:", error);
    return await generateHelpfulResponse(userMessage);
  }
};

// Integrare fallback real de research online folosind DuckDuckGo Instant Answer API
async function fetchWebSearchResult(query: string): Promise<string | null> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.AbstractText) return data.AbstractText;
    if (data.Answer) return data.Answer;
    if (
      data.RelatedTopics &&
      data.RelatedTopics.length > 0 &&
      data.RelatedTopics[0].Text
    ) {
      return data.RelatedTopics[0].Text;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// Memorie simplă pentru nume (doar pe sesiune)
let memorizedUserName: string | null = null;

const extractName = (msg: string): string | null => {
  // Caută patternuri de prezentare: "ma numesc X", "sunt X", "numele meu este X"
  const lower = msg.toLowerCase();
  let match = lower.match(
    /(?:ma numesc|mă numesc|numele meu este|sunt)\s+([a-zăâîșț\- ]{2,})/i
  );
  if (match && match[1]) {
    // Returnează numele cu majusculă la început
    return match[1].trim().replace(/\b\w/g, (l) => l.toUpperCase());
  }
  return null;
};

const generateHelpfulResponse = async (
  userMessage: string
): Promise<string> => {
  const message = userMessage.toLowerCase();

  // Încearcă să memoreze numele dacă utilizatorul se prezintă
  const possibleName = extractName(userMessage);
  if (possibleName) {
    memorizedUserName = possibleName;
    return `Încântat de cunoștință, ${memorizedUserName}! Am reținut numele tău.`;
  }

  // Salutări
  if (
    message.includes("bună") ||
    message.includes("salut") ||
    message.includes("hello")
  ) {
    return "Salut! Sunt aici să te ajut. Cu ce pot să îți fiu de folos astăzi?";
  }

  // Întrebări despre nume
  if (
    (message.includes("cum ma numesc") ||
      message.includes("cum mă numesc") ||
      message.includes("care este numele meu") ||
      message.includes("cum ma cheama") ||
      message.includes("cum mă cheamă") ||
      message.includes("numele meu") ||
      message.includes("ce nume am") ||
      message.includes("ma cheama") ||
      message.includes("mă cheamă")) &&
    message.includes("?")
  ) {
    if (memorizedUserName) {
      return `Te cheamă ${memorizedUserName}. Dacă vrei să schimbi numele, spune-mi din nou cum te numești!`;
    }
    return "Nu am acces la numele tău, dar te pot ajuta cu orice altceva! Dacă vrei, îmi poți spune tu cum te cheamă.";
  }

  // Întrebări de tip "cum"
  if (message.includes("cum") && message.includes("?")) {
    return "Înțeleg că ai o întrebare despre cum să faci ceva. Vrei să caut online sau să folosesc cele mai noi informații pentru tine? Dă-mi mai multe detalii și voi încerca să găsesc răspunsul cel mai bun.";
  }

  // Ajutor
  if (message.includes("ajutor") || message.includes("help")) {
    return "Sunt aici să te ajut! Spune-mi cu ce pot să te ajut sau dacă vrei să caut informații online pentru tine.";
  }

  // Mulțumiri
  if (message.includes("mulțumesc") || message.includes("thanks")) {
    return "Cu drag! Sunt mereu aici când ai nevoie de ajutor.";
  }

  // Întrebări generale
  if (message.includes("?")) {
    // Încearcă research online
    const result = await fetchWebSearchResult(userMessage);
    if (result && result.length > 10) {
      return `Am găsit online: ${result}`;
    }
    return `Nu am găsit un răspuns direct, dar pot încerca să caut online sau să folosesc cele mai noi date disponibile. Vrei să fac research pentru tine?`;
  }

  // Fallback general
  return `Mulțumesc că îmi scrii! Dacă vrei să caut ceva online sau să folosesc cele mai noi informații din baza de date OpenAI, spune-mi ce te interesează.`;
};

// Check if AI service is available
export const isAIServiceAvailable = async (): Promise<boolean> => {
  try {
    // First check local service
    const testResponse = await getTherapyResponse(
      [{ role: "user", content: "test" }],
      undefined,
      undefined,
      "test"
    );

    if (testResponse && testResponse.trim() !== "") {
      return true;
    }

    // Then check Netlify functions
    const response = await fetch(
      "/.netlify/functions/ai-chat-ultra-intelligent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "test",
          userId: "test",
          timestamp: new Date().toISOString(),
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.log("[isAIServiceAvailable] Service check failed:", error);
    return false;
  }
};

// Default export pentru compatibilitate
export default fetchAIResponseSafe;
