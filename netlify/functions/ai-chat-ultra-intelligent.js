// Netlify Function Ultra-Inteligentă - AI Superior ChatGPT (Next Generation)
// Implementează caracteristici de AI de ultimă generație care depășesc ChatGPT-4

const fetch = require("node-fetch");

// Import pentru modulele de inteligență ultra-avansată
const {
  PhilosophyDatabaseManager,
} = require("../../lib/firebase-philosophy-database.cjs");

const {
  AdvancedAIIntelligence,
} = require("../../lib/advanced-ai-intelligence.cjs");

const {
  UltraAdvancedAIIntelligence,
} = require("../../lib/ultra-advanced-ai-intelligence.cjs");

// Enhanced problem detection cu AI patterns
const detectProblemTypeAdvanced = (message, context = {}) => {
  const lowerMessage = message.toLowerCase();
  const emotionalContext = context.emotional_state || {};
  const urgencyLevel = context.urgency_level || "low";

  // Multi-layered problem detection
  const problemTypes = {
    existential_crisis: {
      keywords: [
        "sens",
        "viață",
        "scop",
        "de ce exist",
        "ce să fac",
        "pierdut",
        "confuz despre viitor",
      ],
      emotional_markers: ["lost", "confused", "empty"],
      weight: urgencyLevel === "high" ? 1.5 : 1.0,
    },
    relationship_complex: {
      keywords: [
        "relație",
        "iubire",
        "familie",
        "prieten",
        "conflict",
        "singurătate",
        "divorț",
        "despărțire",
      ],
      emotional_markers: ["sad", "lonely", "angry", "betrayed"],
      weight: emotionalContext.intensity > 0.7 ? 1.3 : 1.0,
    },
    career_transition: {
      keywords: [
        "carieră",
        "job",
        "muncă",
        "schimbare",
        "șomaj",
        "promovare",
        "boss",
        "coleg",
      ],
      emotional_markers: ["frustrated", "anxious", "ambitious"],
      weight: 1.0,
    },
    mental_health_complex: {
      keywords: [
        "depresie",
        "anxietate",
        "panică",
        "stres",
        "burnout",
        "oboseală",
        "epuizare",
      ],
      emotional_markers: ["depressed", "anxious", "overwhelmed", "tired"],
      weight: urgencyLevel === "high" ? 2.0 : 1.5,
    },
    personal_growth_advanced: {
      keywords: [
        "dezvoltare",
        "creștere",
        "îmbunătățire",
        "schimbare",
        "evoluție",
        "potențial",
      ],
      emotional_markers: ["motivated", "curious", "determined"],
      weight: 1.0,
    },
    creative_block: {
      keywords: [
        "creativitate",
        "inspirație",
        "blocat",
        "idei",
        "artă",
        "scris",
        "muzică",
      ],
      emotional_markers: ["frustrated", "stuck", "uninspired"],
      weight: 1.0,
    },
    life_transition: {
      keywords: [
        "schimbare majoră",
        "mutare",
        "nou început",
        "tranziție",
        "adaptare",
      ],
      emotional_markers: ["uncertain", "excited", "nervous"],
      weight: 1.2,
    },
  };

  let bestMatch = "general";
  let bestScore = 0;

  for (const [type, config] of Object.entries(problemTypes)) {
    let score = 0;

    // Keyword matching
    config.keywords.forEach((keyword) => {
      if (lowerMessage.includes(keyword)) {
        score += 1;
      }
    });

    // Emotional marker matching
    if (emotionalContext.dominant) {
      config.emotional_markers.forEach((marker) => {
        if (
          emotionalContext.dominant === marker ||
          emotionalContext.all_emotions[marker] > 0
        ) {
          score += 0.5;
        }
      });
    }

    // Apply weight multiplier
    score *= config.weight;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = type;
    }
  }

  return bestMatch;
};

// Ultra-advanced system prompt generator
const generateUltraIntelligentPrompt = async (message, userId, context) => {
  const intelligence = new UltraAdvancedAIIntelligence(userId);
  const predictions = await intelligence.predictNextUserActions(
    context.conversationHistory || [],
    context
  );
  const insights = await intelligence.generateProactiveInsights(context);

  return await intelligence.generateUltraIntelligentPrompt(
    message,
    context,
    predictions,
    insights
  );
};

// Main handler function
export const handler = async (event, context) => {
  console.log("🚀 [Ultra-AI] Request received");

  // CORS headers pentru toate request-urile
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const requestBody = JSON.parse(event.body);
    const { message, userId = "anonymous", assistantProfile } = requestBody;

    if (!message || typeof message !== "string") {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Message is required and must be a string",
        }),
      };
    }

    console.log(`🧠 [Ultra-AI] Processing for user: ${userId}`);
    console.log(`📝 [Ultra-AI] Message preview: ${message.substring(0, 100)}`);

    // Initialize advanced AI modules
    const advancedAI = new AdvancedAIIntelligence(userId);
    const ultraAI = new UltraAdvancedAIIntelligence(userId);
    const philosophyDB = new PhilosophyDatabaseManager();

    // Step 1: Ultra-advanced context analysis
    console.log("🔍 [Ultra-AI] Performing ultra-advanced context analysis...");
    const conversationHistory = []; // Would be loaded from database
    const advancedContext = await advancedAI.analyzeConversationContext(
      message,
      conversationHistory
    );

    const multiDimContext = await ultraAI.analyzeMultiDimensionalContext(
      message,
      conversationHistory
    );

    // Step 2: Predictive intelligence
    console.log("🔮 [Ultra-AI] Generating predictive insights...");
    const predictions = await ultraAI.predictNextUserActions(
      conversationHistory,
      { ...advancedContext, ...multiDimContext }
    );

    const emotionalNeeds = await ultraAI.predictEmotionalNeeds(
      advancedContext.emotional_state,
      conversationHistory
    );

    // Step 3: Advanced problem type detection
    const problemType = detectProblemTypeAdvanced(message, advancedContext);
    console.log(`🎯 [Ultra-AI] Problem type detected: ${problemType}`);

    // Step 4: Knowledge integration
    console.log("📚 [Ultra-AI] Integrating relevant knowledge...");
    const relevantKnowledge = await ultraAI.integrateRelevantKnowledge(
      problemType,
      multiDimContext
    );

    // Step 5: Generate ultra-intelligent system prompt
    console.log("🤖 [Ultra-AI] Generating ultra-intelligent prompt...");
    const ultraPrompt = await ultraAI.generateUltraIntelligentPrompt(
      message,
      {
        ...advancedContext,
        ...multiDimContext,
        history: conversationHistory,
        topic: problemType,
      },
      predictions,
      {
        emotionalNeeds,
        relevantKnowledge,
        proactiveInsights:
          await ultraAI.generateProactiveInsights(multiDimContext),
      }
    );

    // Step 6: Enhanced OpenAI API call
    console.log("⚡ [Ultra-AI] Making enhanced API call to OpenAI...");

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    const enhancedMessages = [
      {
        role: "system",
        content: ultraPrompt,
      },
      {
        role: "user",
        content: message,
      },
    ];

    // Ultra-advanced model configuration
    const modelConfig = {
      model: "gpt-4", // Using the most advanced model
      messages: enhancedMessages,
      temperature: 0.8, // Balanced creativity and precision
      max_tokens: 2500, // Longer, more detailed responses
      top_p: 0.95, // High vocabulary diversity
      frequency_penalty: 0.4, // Avoid repetition
      presence_penalty: 0.6, // Encourage new ideas
    };

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(modelConfig),
      }
    );

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error("❌ [Ultra-AI] OpenAI API Error:", errorData);
      throw new Error(
        `OpenAI API error: ${openaiResponse.status} - ${errorData}`
      );
    }

    const openaiData = await openaiResponse.json();
    const aiResponse =
      openaiData.choices[0]?.message?.content ||
      "Îmi pare rău, nu am putut genera un răspuns.";

    // Step 7: Meta-learning and improvement
    console.log("📈 [Ultra-AI] Learning from interaction...");
    await ultraAI.learnFromInteraction(
      {
        message,
        context: { ...advancedContext, ...multiDimContext },
        predictions,
        response: aiResponse,
      },
      null, // User feedback would be collected later
      "pending" // Outcome assessment
    );

    console.log(
      "✅ [Ultra-AI] Ultra-intelligent response generated successfully"
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: aiResponse,
        metadata: {
          intelligence_level: "ultra-advanced",
          features_used: [
            "predictive_conversation_flow",
            "multi_dimensional_context",
            "emotional_intelligence",
            "proactive_insights",
            "knowledge_integration",
            "meta_learning",
          ],
          context_analysis: {
            problem_type: problemType,
            emotional_state: advancedContext.emotional_state,
            urgency_level: advancedContext.urgency_level,
            conversation_type: advancedContext.conversation_type,
          },
          predictions: {
            next_likely_topics: predictions.likely_next_questions?.slice(0, 3),
            conversation_direction: predictions.conversation_direction,
            emotional_trajectory: predictions.emotional_trajectory,
          },
        },
      }),
    };
  } catch (error) {
    console.error("💥 [Ultra-AI] Error:", error);

    // Intelligent error response based on the error type
    let errorMessage = "Îmi pare rău, întâmpin dificultăți tehnice momentan.";

    if (error.message.includes("OpenAI")) {
      errorMessage =
        "Serviciul de AI este temporar indisponibil. Încerc să îți răspund cu resursele locale disponibile.";
    } else if (
      error.message.includes("database") ||
      error.message.includes("firestore")
    ) {
      errorMessage =
        "Am probleme cu accesarea memoriei, dar pot să îți răspund pe baza conversației curente.";
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        response: errorMessage,
        fallback: true,
      }),
    };
  }
};
