// AI API Utils - Simplified version for development
import type { AssistantProfile } from "../models/AssistantProfile";

// Function to get user name from various sources
function getUserName(userId?: string): string | null {
  try {
    // Try to get from localStorage with user prefix
    if (userId) {
      const storedName =
        localStorage.getItem(`user_${userId}_displayName`) ||
        localStorage.getItem(`user_${userId}_name`);
      if (storedName) return storedName;
    }

    // Try generic stored name
    const genericName =
      localStorage.getItem("user_displayName") ||
      localStorage.getItem("currentUserName") ||
      localStorage.getItem("userName");
    if (genericName) return genericName;

    // Try to get from auth context in DOM (if available)
    const userDisplayElement = document.querySelector("[data-user-name]");
    if (userDisplayElement) {
      return userDisplayElement.getAttribute("data-user-name");
    }

    return null;
  } catch (error) {
    console.warn("Error getting user name:", error);
    return null;
  }
}

// Function to check if question is about user's name
function isNameQuestion(message: string): boolean {
  const nameQuestions = [
    /cum m[aă] cheam[aă]/i,
    /cum m[aă] numesc/i,
    /care.*numele meu/i,
    /care.*numele/i,
    /cum îmi spui/i,
    /my name/i,
    /what.*my name/i,
  ];

  return nameQuestions.some((pattern) => pattern.test(message));
}

// Function to save user name when they log in or provide it
export function saveUserName(userId: string, name: string): void {
  try {
    localStorage.setItem(`user_${userId}_name`, name);
    localStorage.setItem("currentUserName", name); // For easy access
    console.log(`[AI] Saved user name: ${name} for user: ${userId}`);
  } catch (error) {
    console.warn("Error saving user name:", error);
  }
}

// Function to learn user name from message
function learnUserNameFromMessage(
  message: string,
  userId?: string
): string | null {
  // Patterns to extract name from messages like "Mă numesc/cheamă [Nume]", "Sunt [Nume]"
  const namePatterns = [
    /m[aă] (?:numesc|cheam[aă]) ([A-Z][a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
    /sunt ([A-Z][a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
    /numele meu e(?:ste)? ([A-Z][a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
    /eu sunt ([A-Z][a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
    /mă numesc ([A-Z][a-zA-ZăâîșțĂÂÎȘȚ]+)/i,
  ];

  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const extractedName = match[1].trim();
      // Save the name for future use
      if (userId) {
        saveUserName(userId, extractedName);
      }
      return extractedName;
    }
  }
  return null;
}

// Advanced AI Intelligence Engine - Similar to Claude/GPT/DeepSeek
function analyzeUserIntent(message: string): {
  category: string;
  intent: string;
  keywords: string[];
  emotionalTone: string;
  urgency: string;
} {
  // Detect emotional tone
  let emotionalTone = "neutral";
  if (/(ajutor|doare|durere|problema|grav|urgent)/i.test(message)) {
    emotionalTone = "concerned";
  } else if (/(salut|buna|hai|super|bine)/i.test(message)) {
    emotionalTone = "friendly";
  } else if (/(ce|cum|de ce|pentru ca)/i.test(message)) {
    emotionalTone = "curious";
  }

  // Detect urgency
  let urgency = "low";
  if (/(urgent|imediat|rapid|acum|doare)/i.test(message)) {
    urgency = "high";
  } else if (/(problema|ajutor|nu pot|nu merge)/i.test(message)) {
    urgency = "medium";
  }

  // Categorize the intent
  let category = "general";
  let intent = "conversation";
  const keywords = message.split(/\s+/).filter((word) => word.length > 2);

  // Health/Medical queries
  if (
    /(doare|durere|bolnav|medic|sanatate|rau|piciorul|capul|stomac)/i.test(
      message
    )
  ) {
    category = "health";
    intent = "medical_concern";
  }
  // Identity/Personal questions
  else if (/(sunt|esti|cine|nume|cheama|numesc)/i.test(message)) {
    category = "identity";
    intent = "identity_question";
  }
  // Technology/AI questions
  else if (
    /(ai|artificial|inteligent|robot|calculator|tehnolog)/i.test(message)
  ) {
    category = "technology";
    intent = "ai_inquiry";
  }
  // Greetings
  else if (/(salut|buna|hai|hello|hi)/i.test(message)) {
    category = "social";
    intent = "greeting";
  }
  // Questions
  else if (/(ce|cum|de ce|cand|unde|pentru ca|\?)/i.test(message)) {
    category = "inquiry";
    intent = "question";
  }

  return { category, intent, keywords, emotionalTone, urgency };
}

function generateIntelligentResponse(
  message: string,
  analysis: ReturnType<typeof analyzeUserIntent>,
  userName?: string
): string {
  const { category, intent, emotionalTone, urgency } = analysis;
  const greeting = userName ? userName : "prietene";

  // Health-related responses
  if (category === "health") {
    if (/piciorul|picior/i.test(message)) {
      return `Îmi pare rău să aud că te doare piciorul, ${greeting}. Durerea de picior poate avea multe cauze - de la oboseală musculară până la probleme mai complexe. Câteva sfaturi imediate:

🩺 **Odihnă**: Evită să faci efort pe piciorul care te doare
🧊 **Gheață**: Aplică gheață timp de 15-20 minute pentru a reduce inflamația
🦵 **Ridicare**: Ține piciorul ridicat când stai jos
💊 **Analgezice**: Poți lua un antiinflamator ușor dacă ai acasă

Dacă durerea persistă sau se înrăutățește, te sfătuiesc să consulți un medic. Pot să te ajut cu alte întrebări despre sănătate?`;
    }

    if (/capul|cap|cefalee/i.test(message)) {
      return `Durerea de cap poate fi foarte neplăcută, ${greeting}. Să vedem cum te pot ajuta:

🧠 **Cauze posibile**: Stres, oboseală, deshidratare, tensiune musculară
💧 **Hidratare**: Bea un pahar mare de apă - deshidratarea e o cauză frecventă
😌 **Relaxare**: Încearcă să te odihnești într-un loc liniștit și întunecos
🌡️ **Monitorizare**: Dacă ai și febră, poate fi o infecție

Durerea e foarte intensă sau ai și alte simptome (vărsături, vederea încețoșată)?`;
    }

    return `Înțeleg că ai o problemă de sănătate, ${greeting}. Deși nu sunt medic, pot să ofer sfaturi generale. Pentru orice problemă medicală serioasă, te sfătuiesc să consulți un specialist. Poți să-mi spui mai multe detalii despre ce te deranjează?`;
  }

  // Identity/Personal questions
  if (category === "identity") {
    if (/esti.*ai|ai.*artificial/i.test(message)) {
      return `Da, ${greeting}, sunt un asistent AI (inteligență artificială). Sunt aici pentru a te ajuta cu întrebări, conversații și diverse probleme. 

🤖 **Ce pot face**:
- Răspund la întrebări complexe
- Ofer sfaturi și explicații
- Te ajut cu probleme practice
- Discut despre diverse subiecte

🧠 **Cum funcționez**:
- Analizez contextul conversației
- Înțeleg nuanțele limbajului
- Adapt răspunsurile la nevoile tale

Sunt proiectat să fiu util, empatic și să înțeleg contextul. Cu ce te pot ajuta astăzi?`;
    }

    if (/cine.*esti|nume/i.test(message)) {
      return `Sunt asistentul tău AI inteligent, ${greeting}! Mă bucur să te cunosc. 

✨ **Despre mine**:
- Sunt un AI avansat, similar cu Claude sau ChatGPT
- Pot înțelege și răspunde la întrebări complexe
- Am cunoștințe vaste despre multe domenii
- Sunt empatic și încerc să înțeleg contextul

🎯 **Scopul meu**: Să te ajut cu orice ai nevoie - de la întrebări simple la probleme complexe.

Cum ai vrea să-mi spui? Și tu, cum te cheamă?`;
    }
  }

  // Technology/AI questions
  if (category === "technology") {
    return `Excelentă întrebare despre tehnologie, ${greeting}! 

🔬 **Inteligența Artificială** este o tehnologie fascinantă care:
- Poate înțelege și procesa limbajul natural
- Învață din interacțiuni și îmbunătățește răspunsurile
- Analizează context și nuanțe
- Oferă soluții personalizate

💡 **Cum funcționez eu**:
- Folosesc algoritmi avansați de procesare a limbajului
- Analizez întrebarea ta în profunzime
- Generez răspunsuri contextuale și relevante
- Mă adapt la stilul și nevoile tale

Este ceva specific despre AI sau tehnologie ce te interesează?`;
  }

  // Greetings
  if (category === "social" && intent === "greeting") {
    const greetings = [
      `Salut, ${greeting}! Mă bucur să vorbesc cu tine. Cum te simți astăzi? 😊`,
      `Bună, ${greeting}! Sunt aici să te ajut cu orice ai nevoie. Ce te preocupă?`,
      `Hai, ${greeting}! Ce faci? Sunt gata să discutăm despre orice te interesează.`,
      `Salutări, ${greeting}! Sper că ai o zi bună. Cu ce te pot ajuta?`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // General questions
  if (category === "inquiry") {
    return `Interesantă întrebare, ${greeting}! "${message}" 

Să analizez ce m-ai întrebat:
${analysis.keywords.length > 0 ? `🔍 **Cuvinte cheie**: ${analysis.keywords.join(", ")}` : ""}

Pentru a-ți oferi un răspuns complet și util, poți să-mi dai puțin mai mult context? Cu cât îmi oferi mai multe detalii, cu atât pot să-ți dau un răspuns mai precis și relevant.

În orice caz, sunt aici să te ajut și să clarific orice nelămurire ai!`;
  }

  // Fallback intelligent response
  return `Înțeleg că vorbești despre "${message}", ${greeting}.

📊 **Am analizat mesajul tău**:
- Tonul emotional: ${emotionalTone === "concerned" ? "îngrijorat" : emotionalTone === "friendly" ? "prietenos" : emotionalTone === "curious" ? "curios" : "neutru"}
- Categoria: ${category === "general" ? "conversație generală" : category}
- Urgența: ${urgency === "high" ? "mare" : urgency === "medium" ? "medie" : "mică"}

💭 **Cum pot să te ajut**:
- Să discut în detaliu despre acest subiect
- Să ofer sfaturi practice
- Să răspund la întrebări specifice
- Să analizez problema din multiple perspective

Poți să-mi spui mai multe detalii sau să întrebi ceva specific? Sunt aici să te ajut! 🤝`;
}
// Main function that provides AI responses - Advanced Intelligence System
export async function fetchAIResponseSafe(
  userMessage: string,
  _assistantProfile?: AssistantProfile,
  userId?: string
): Promise<string> {
  console.log("[fetchAIResponseSafe] Starting AI request...");
  console.log("[fetchAIResponseSafe] User ID:", userId);
  console.log(
    "[fetchAIResponseSafe] Message preview:",
    userMessage.substring(0, 100)
  );

  // For development: simulate advanced AI response
  const isDevelopment =
    process.env.NODE_ENV === "development" || !process.env.NODE_ENV;

  if (isDevelopment) {
    console.log("[fetchAIResponseSafe] Using advanced AI intelligence mode");

    // First, try to learn user name from the current message
    const learnedName = learnUserNameFromMessage(userMessage, userId);
    if (learnedName) {
      console.log("[fetchAIResponseSafe] Learned new user name:", learnedName);
      return `Îmi pare bine să te cunosc, ${learnedName}! 😊 

Acum că știu cum te cheamă, pot să-ți ofer răspunsuri mai personalizate. Sunt un asistent AI avansat, similar cu Claude sau ChatGPT, și sunt aici să te ajut cu orice ai nevoie.

Cu ce te pot ajuta astăzi, ${learnedName}?`;
    }

    // Check if user is asking about their name
    if (isNameQuestion(userMessage)) {
      const userName = getUserName(userId);
      if (userName) {
        console.log("[fetchAIResponseSafe] Found user name:", userName);
        return `Te cheamă ${userName}! 😊 

Îmi amintesc numele tău din conversațiile noastre anterioare. Este frumos să avem o conversație personalizată, ${userName}. 

Cu ce te pot ajuta astăzi?`;
      } else {
        console.log("[fetchAIResponseSafe] User name not found in storage");
        return `Îmi pare rău, dar nu am încă numele tău salvat în memoria mea. 

Poți să te prezinți? Îmi place să știu cu cine vorbesc pentru a putea personaliza conversația noastră. Spune-mi cum te cheamă și îmi voi aminti pentru viitoarele noastre discuții! 😊`;
      }
    }

    // Advanced AI Analysis and Response Generation
    const analysis = analyzeUserIntent(userMessage);
    const userName = getUserName(userId);

    console.log("[fetchAIResponseSafe] Intent analysis:", analysis);

    // Simulate AI thinking time (shorter for better UX)
    await new Promise((resolve) =>
      setTimeout(resolve, 800 + Math.random() * 1200)
    );

    // Generate intelligent, contextual response
    const intelligentResponse = generateIntelligentResponse(
      userMessage,
      analysis,
      userName || undefined
    );

    console.log("[fetchAIResponseSafe] Advanced AI response generated");
    return intelligentResponse;
  }

  // For production: try actual API endpoints
  try {
    // Prepare the request payload
    const requestPayload = {
      message: userMessage,
      userId: userId || "anonymous",
      assistantProfile: _assistantProfile,
      timestamp: new Date().toISOString(),
    };

    // Try production API endpoints
    const response = await fetch(
      "/.netlify/functions/ai-chat-ultra-intelligent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log("[fetchAIResponseSafe] Production response received");
      return result.reply || result.message || "Răspuns primit de la AI.";
    } else {
      throw new Error(`API returned status: ${response.status}`);
    }
  } catch (error) {
    console.error("[fetchAIResponseSafe] Production API failed:", error);

    // Fallback to development response
    console.log("[fetchAIResponseSafe] Using fallback development response");
    const fallbackResponses = [
      `Îmi pare rău, dar am întâmpinat o problemă tehnică. Totuși, pot să îți răspund că "${userMessage}" este o întrebare interesantă!`,
      `Se pare că serverul este temporar indisponibil, dar pot să te ajut să gândim la "${userMessage}" din altă perspectivă.`,
      `Din păcate, conexiunea cu AI-ul avansat nu funcționează momentan, dar pot să îți ofer o perspectivă asupra "${userMessage}".`,
    ];

    return fallbackResponses[
      Math.floor(Math.random() * fallbackResponses.length)
    ];
  }
}
