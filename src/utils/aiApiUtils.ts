// AI API Utils - Simplified and reliable approach
// Prioritizes local functions over Netlify functions for better reliability

import { AssistantProfile } from "../models/AssistantProfile";
import { getTherapyResponse } from "../services/openaiService";

// Main function that routes to AI with proper fallback
export const fetchAIResponseSafe = async (
  userMessage: string,
  assistantProfile?: AssistantProfile,
  userId?: string
): Promise<string> => {
  console.log("[fetchAIResponseSafe] Starting AI request...");
  console.log("[fetchAIResponseSafe] User ID:", userId);
  console.log(
    "[fetchAIResponseSafe] Message preview:",
    userMessage.substring(0, 100)
  );

  try {
    // Primary: Try local getTherapyResponse first (most reliable)
    console.log("[fetchAIResponseSafe] Using local therapy response...");

    const localResponse = await getTherapyResponse(
      [{ role: "user", content: userMessage }],
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

    return generateHelpfulResponse(userMessage);
  } catch (error) {
    console.error("[fetchAIResponseSafe] Unexpected error:", error);
    return generateHelpfulResponse(userMessage);
  }
};

// Generate a helpful response based on the user's message
const generateHelpfulResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();

  if (
    message.includes("bună") ||
    message.includes("salut") ||
    message.includes("hello")
  ) {
    return "Salut! Sunt aici să te ajut. Cu ce pot să îți fiu de folos astăzi?";
  }

  if (message.includes("cum") && message.includes("?")) {
    return "Înțeleg că ai o întrebare despre cum să faci ceva. Deși am probleme tehnice momentan, îți sugerez să îmi oferi mai multe detalii despre situația ta și voi încerca să te ajut cât de curând posibil.";
  }

  if (message.includes("ajutor") || message.includes("help")) {
    return "Sunt aici să te ajut! Chiar dacă întâmpin probleme tehnice temporare, poți să îmi spui despre ce ai nevoie și voi reveni cu un răspuns cât de curând.";
  }

  if (message.includes("mulțumesc") || message.includes("thanks")) {
    return "Cu drag! Sunt mereu aici când ai nevoie de ajutor.";
  }

  if (message.includes("?")) {
    return `Înțeleg că ai o întrebare importantă. Deși întâmpin probleme tehnice momentan, am notat întrebarea ta și voi reveni cu un răspuns detaliat cât de curând posibil. Te rog să ai puțină răbdare.`;
  }

  return `Mulțumesc că îmi scrii! Deși am probleme tehnice temporare, am primit mesajul tău și voi reveni cu un răspuns personalizat cât de curând. În între timp, poți să îmi oferi mai multe detalii despre situația ta.`;
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
