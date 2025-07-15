// AI API Utils - Advanced routing to super-intelligent AI function
// Uses the new super-intelligent function with robust fallback

import { AssistantProfile } from "../models/AssistantProfile";
import { getTherapyResponse } from "../services/openaiService";

// Main function that routes to the super-intelligent AI
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

  // Prepare the request payload
  const requestPayload = {
    message: userMessage,
    userId: userId || "anonymous",
    assistantProfile: assistantProfile,
    timestamp: new Date().toISOString(),
  };

  try {
    // Primary: Try the ultra-intelligent function (next generation)
    console.log(
      "[fetchAIResponseSafe] Attempting ultra-intelligent function..."
    );

    const ultraIntelligentResponse = await fetch(
      "/.netlify/functions/ai-chat-ultra-intelligent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      }
    );

    if (ultraIntelligentResponse.ok) {
      const result = await ultraIntelligentResponse.json();
      console.log(
        "[fetchAIResponseSafe] Ultra-intelligent response received successfully"
      );
      console.log(
        "[fetchAIResponseSafe] Features used:",
        result.metadata?.features_used
      );
      return (
        result.response ||
        result.message ||
        "Îmi pare rău, nu am putut procesa răspunsul."
      );
    } else {
      console.warn(
        "[fetchAIResponseSafe] Ultra-intelligent function failed, trying super-intelligent fallback..."
      );
      throw new Error(
        `Ultra-intelligent function failed with status: ${ultraIntelligentResponse.status}`
      );
    }
  } catch (error) {
    console.warn(
      "[fetchAIResponseSafe] Ultra-intelligent function error:",
      error
    );

    // Fallback 1: Try the super-intelligent function
    try {
      console.log(
        "[fetchAIResponseSafe] Attempting super-intelligent function fallback..."
      );

      const superIntelligentResponse = await fetch(
        "/.netlify/functions/ai-chat-super-intelligent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestPayload),
        }
      );

      if (superIntelligentResponse.ok) {
        const result = await superIntelligentResponse.json();
        console.log(
          "[fetchAIResponseSafe] Super-intelligent fallback response received"
        );
        return (
          result.response ||
          result.message ||
          "Îmi pare rău, nu am putut procesa răspunsul."
        );
      } else {
        console.warn(
          "[fetchAIResponseSafe] Super-intelligent function also failed, trying robust fallback..."
        );
        throw new Error(
          `Super-intelligent function failed with status: ${superIntelligentResponse.status}`
        );
      }
    } catch (superError) {
      console.warn(
        "[fetchAIResponseSafe] Super-intelligent function error:",
        superError
      );

      // Fallback 2: Try the robust function
      try {
        console.log(
          "[fetchAIResponseSafe] Attempting robust function fallback..."
        );

        const robustResponse = await fetch(
          "/.netlify/functions/ai-chat-robust",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestPayload),
          }
        );

        if (robustResponse.ok) {
          const result = await robustResponse.json();
          console.log(
            "[fetchAIResponseSafe] Robust fallback response received"
          );
          return (
            result.response ||
            result.message ||
            "Îmi pare rău, nu am putut procesa răspunsul."
          );
        } else {
          console.warn(
            "[fetchAIResponseSafe] Robust function also failed, trying local fallback..."
          );
          throw new Error(
            `Robust function failed with status: ${robustResponse.status}`
          );
        }
      } catch (robustError) {
        console.warn(
          "[fetchAIResponseSafe] Robust function error:",
          robustError
        );

        // Fallback 3: Use local getTherapyResponse
        try {
          console.log(
            "[fetchAIResponseSafe] Using local therapy response fallback..."
          );

          const localResponse = await getTherapyResponse(
            [{ role: "user", content: userMessage }],
            undefined,
            undefined,
            userId
          );

          console.log("[fetchAIResponseSafe] Local fallback response received");
          return (
            localResponse ||
            "Îmi pare rău, am întâmpinat probleme tehnice. Te rog să încerci din nou."
          );
        } catch (localError) {
          console.error(
            "[fetchAIResponseSafe] All methods failed:",
            localError
          );

          // Ultimate fallback: Intelligent error response
          return `Îmi pare rău, dar întâmpin probleme tehnice momentan. ${
            userMessage.includes("?")
              ? "Înțeleg că ai o întrebare și voi încerca să îți răspund când sistemul va fi din nou funcțional."
              : "Apreciez că vrei să vorbești cu mine și îți voi răspunde cât de curând posibil."
          } Te rog să încerci din nou în câteva momente.`;
        }
      }
    }
  }
};

// Export additional utility functions
export const isAIServiceAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch(
      "/.netlify/functions/ai-chat-ultra-intelligent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "test",
          userId: "health-check",
        }),
      }
    );

    return response.ok;
  } catch {
    return false;
  }
};

export const getAICapabilities = () => {
  return {
    hasMemory: true,
    hasEmotionalIntelligence: true,
    hasContextAwareness: true,
    hasPredictiveResponses: true,
    hasPhilosophyDatabase: true,
    hasAdvancedIntelligence: true,
    hasUltraIntelligence: true,
    hasLearningSystem: true,
    hasMultiDimensionalContext: true,
    supportedLanguages: ["ro", "en"],
    intelligenceLevel: "ultra-advanced",
    features: [
      "Persistent memory across sessions",
      "Emotional state detection and adaptation",
      "Context-aware responses",
      "Predictive intent analysis",
      "Behavioral pattern learning",
      "Philosophy and science knowledge base",
      "Advanced conversation flow management",
      "Ultra-intelligent predictive conversation flow",
      "Multi-dimensional context analysis",
      "Proactive insight generation",
      "Dynamic knowledge integration",
      "Conversation orchestration engine",
      "Meta-learning system",
      "Adaptive communication style engine",
      "Continuous learning from interactions",
      "Predictive emotional intelligence",
      "Advanced memory synthesis",
    ],
    comparisonToChatGPT: {
      memory: "Persistent across sessions vs ChatGPT's session-only memory",
      personalization: "Deep user profiling vs ChatGPT's generic responses",
      emotionalIntelligence:
        "Advanced emotion detection and adaptation vs basic sentiment",
      prediction: "Anticipates user needs vs reactive only",
      learning: "Continuously learns from each interaction vs static training",
      context: "Multi-dimensional context awareness vs limited context window",
      proactivity: "Offers insights before asked vs waits for questions",
    },
  };
};
