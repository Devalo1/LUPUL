// Advanced AI Features pentru Widget Modern
// Funcționalități extra pentru tineri: emoji reactions, quick responses, mood tracking

import OpenAI from "openai";

export interface MoodEntry {
  timestamp: Date;
  mood: "😊" | "😐" | "😔" | "😤" | "😴" | "🔥" | "🤔" | "💪";
  intensity: 1 | 2 | 3 | 4 | 5;
  note?: string;
}

export interface QuickResponse {
  id: string;
  emoji: string;
  text: string;
  category: "motivation" | "fun" | "study" | "wellness" | "social";
}

export const MOOD_OPTIONS = [
  { emoji: "😊", label: "Fericit", color: "#4CAF50" },
  { emoji: "😐", label: "Neutru", color: "#9E9E9E" },
  { emoji: "😔", label: "Trist", color: "#2196F3" },
  { emoji: "😤", label: "Frustrat", color: "#FF5722" },
  { emoji: "😴", label: "Obosit", color: "#673AB7" },
  { emoji: "🔥", label: "Energic", color: "#FF9800" },
  { emoji: "🤔", label: "Confuz", color: "#795548" },
  { emoji: "💪", label: "Motivat", color: "#E91E63" },
];

export const QUICK_RESPONSES: QuickResponse[] = [
  // Motivation
  {
    id: "1",
    emoji: "💪",
    text: "Vreau motivație pentru ziua de azi",
    category: "motivation",
  },
  {
    id: "2",
    emoji: "🎯",
    text: "Ajută-mă să îmi setez obiective",
    category: "motivation",
  },
  {
    id: "3",
    emoji: "⚡",
    text: "Am nevoie de energie și entuziasm",
    category: "motivation",
  },

  // Fun
  {
    id: "4",
    emoji: "🎮",
    text: "Recomandă-mi ceva fun de făcut",
    category: "fun",
  },
  { id: "5", emoji: "🎵", text: "Să vorbim despre muzică", category: "fun" },
  {
    id: "6",
    emoji: "🎬",
    text: "Sugerează-mi un film sau serial",
    category: "fun",
  },

  // Study
  {
    id: "7",
    emoji: "📚",
    text: "Ajută-mă să învăț mai eficient",
    category: "study",
  },
  {
    id: "8",
    emoji: "🧠",
    text: "Vreau să dezvolt o abilitate nouă",
    category: "study",
  },
  {
    id: "9",
    emoji: "⏰",
    text: "Planificare și management al timpului",
    category: "study",
  },

  // Wellness
  {
    id: "10",
    emoji: "🧘",
    text: "Tehnici de relaxare și mindfulness",
    category: "wellness",
  },
  {
    id: "11",
    emoji: "😌",
    text: "Cum să gestionez stresul",
    category: "wellness",
  },
  {
    id: "12",
    emoji: "💚",
    text: "Sfaturi pentru un stil de viață sănătos",
    category: "wellness",
  },

  // Social
  {
    id: "13",
    emoji: "👥",
    text: "Sfaturi pentru relații sociale",
    category: "social",
  },
  {
    id: "14",
    emoji: "💬",
    text: "Cum să comunic mai bine",
    category: "social",
  },
  {
    id: "15",
    emoji: "❤️",
    text: "Vorbesc despre dragoste și relații",
    category: "social",
  },
];

export const CONVERSATION_STARTERS = [
  "Ce planuri ai pentru weekend?",
  "Ce te face fericit în ultima vreme?",
  "La ce visezi cel mai mult?",
  "Ce skill nou ai vrea să înveți?",
  "Care e cel mai mare challenge al tău acum?",
  "Ce muzică asculți când vrei să te motivezi?",
  "Cum îți imaginezi viitorul tău ideal?",
  "Ce activitate îți dă cea mai multă energie?",
];

export const EMOJI_REACTIONS = [
  "👍",
  "❤️",
  "😂",
  "😊",
  "🤔",
  "👏",
  "🔥",
  "💯",
  "🎉",
  "✨",
];

// Funcții pentru tracking-ul mood-ului
export const saveMoodEntry = async (userId: string, mood: MoodEntry) => {
  try {
    const moodData = {
      ...mood,
      userId,
      timestamp: new Date().toISOString(),
    };

    // Salvează în localStorage pentru demo (în producție ar fi Firebase)
    const existingMoods = JSON.parse(
      localStorage.getItem(`moods_${userId}`) || "[]"
    );
    existingMoods.push(moodData);
    localStorage.setItem(`moods_${userId}`, JSON.stringify(existingMoods));

    return true;
  } catch (error) {
    console.error("Error saving mood:", error);
    return false;
  }
};

export const getMoodHistory = (
  userId: string,
  days: number = 7
): MoodEntry[] => {
  try {
    const moods = JSON.parse(localStorage.getItem(`moods_${userId}`) || "[]");
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return moods
      .filter((mood: any) => new Date(mood.timestamp) > cutoff)
      .sort(
        (a: any, b: any) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  } catch (error) {
    console.error("Error getting mood history:", error);
    return [];
  }
};

export const getPersonalizedQuickResponses = (
  moodHistory: MoodEntry[]
): QuickResponse[] => {
  if (moodHistory.length === 0) return QUICK_RESPONSES.slice(0, 6);

  const recentMood = moodHistory[0]?.mood;
  let recommendedCategories: Array<QuickResponse["category"]> = [];

  switch (recentMood) {
    case "😔":
      recommendedCategories = ["motivation", "wellness", "fun"];
      break;
    case "😤":
      recommendedCategories = ["wellness", "motivation"];
      break;
    case "😴":
      recommendedCategories = ["motivation", "wellness"];
      break;
    case "🔥":
      recommendedCategories = ["study", "motivation"];
      break;
    case "💪":
      recommendedCategories = ["study", "motivation"];
      break;
    default:
      recommendedCategories = ["fun", "study", "social"];
  }

  const filtered = QUICK_RESPONSES.filter((qr) =>
    recommendedCategories.includes(qr.category)
  );

  return filtered.slice(0, 6);
};

// Funcții pentru personalizarea conversației
export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour < 12) return "Bună dimineața! ☀️";
  if (hour < 17) return "Bună ziua! 🌞";
  if (hour < 21) return "Bună seara! 🌅";
  return "Bună seara! 🌙";
};

export const getContextualSuggestions = (lastMessage: string): string[] => {
  const lowerMessage = lastMessage.toLowerCase();

  if (lowerMessage.includes("trist") || lowerMessage.includes("deprimat")) {
    return [
      "Vrei să vorbim despre ce te face să te simți așa?",
      "Poate te ajută niște activități relaxante?",
      "Să explorăm împreună modalități de a te simți mai bine",
    ];
  }

  if (lowerMessage.includes("stres") || lowerMessage.includes("anxios")) {
    return [
      "Să încercăm niște tehnici de respirație împreună?",
      "Vrei să organizăm prioritățile pentru a reduce stresul?",
      "Ce zici de o pauză și câteva exerciții de relaxare?",
    ];
  }

  if (lowerMessage.includes("învăț") || lowerMessage.includes("studiu")) {
    return [
      "Să creăm un plan de studiu personalizat?",
      "Vrei să discutăm despre tehnici de memorare eficiente?",
      "Ce materie îți dă cele mai mari bătăi de cap?",
    ];
  }

  if (lowerMessage.includes("viitor") || lowerMessage.includes("carieră")) {
    return [
      "Să explorăm împreună opțiunile de carieră?",
      "Vrei să îți identific punctele forte?",
      "Ce domeniu te pasionează cel mai mult?",
    ];
  }

  return [
    "Poți să îmi spui mai multe despre asta?",
    "Cum te simți în legătură cu situația asta?",
    "Ce ai încercat până acum?",
  ];
};

// Funcție pentru generarea de insights bazate pe patterns
export const generatePersonalizedInsights = (
  moodHistory: MoodEntry[],
  conversationCount: number
): string[] => {
  const insights: string[] = [];

  if (moodHistory.length >= 7) {
    const avgIntensity =
      moodHistory.reduce((sum, mood) => sum + mood.intensity, 0) /
      moodHistory.length;
    if (avgIntensity > 3.5) {
      insights.push(
        "💪 Văd că ai avut o săptămână intensă din punct de vedere emoțional. Să vorbim despre cum să găsești echilibrul?"
      );
    } else if (avgIntensity < 2.5) {
      insights.push(
        "🌈 Pare că ai fost într-o dispoziție mai liniștită. Vrei să explorăm modalități de a adăuga mai multă energie în viața ta?"
      );
    }
  }

  if (conversationCount > 10) {
    insights.push(
      "🎉 Wow, avem deja multe conversații împreună! Am observat că îți place să explorezi idei noi. Ce domeniu nou ai vrea să descoperim?"
    );
  }

  if (conversationCount > 5 && moodHistory.length < 3) {
    insights.push(
      "📊 Știai că pot să îți urmăresc mood-ul de-a lungul timpului? Încearcă să îmi spui cum te simți mai des pentru insights personalizate!"
    );
  }

  return insights;
};

// Generare automată de titluri pentru conversații (similar ChatGPT)
export const generateConversationTitle = async (
  firstUserMessage: string,
  aiResponse?: string
): Promise<string> => {
  try {
    // Dacă avem și răspunsul AI-ului, folosim ambele pentru context
    const context = aiResponse
      ? `User: ${firstUserMessage}\nAI: ${aiResponse}`
      : `User: ${firstUserMessage}`;

    // Folosim OpenAI direct pentru generarea titlului
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Ești un asistent care generează titluri scurte și descriptive pentru conversații în română. Răspunde doar cu titlul, fără explicații suplimentare.",
        },
        {
          role: "user",
          content: `Analizează următoarea conversație și generează un titlu scurt și descriptiv (maxim 4-5 cuvinte) în română:

${context}

Instrucțiuni:
- Titlul trebuie să fie scurt și să reflecte subiectul principal
- Nu folosi ghilimele sau alte marcaje
- Folosește un limbaj natural și accesibil
- Exemplu de format: "Ajutor cu matematica", "Sfaturi pentru somn", "Planuri de weekend"

Titlu:`,
        },
      ],
      max_tokens: 20,
      temperature: 0.7,
    });

    const generatedTitle = response.choices[0]?.message?.content?.trim();

    if (generatedTitle && generatedTitle.length > 3) {
      // Curățare și validare titlu
      let cleanTitle = generatedTitle
        .replace(/^["']|["']$/g, "") // Elimină ghilimelele
        .replace(/^Titlu:?\s*/i, "") // Elimină prefixul "Titlu:"
        .trim();

      // Limitează lungimea la 50 de caractere
      if (cleanTitle.length > 50) {
        cleanTitle = cleanTitle.substring(0, 47) + "...";
      }

      return cleanTitle;
    }
  } catch (error) {
    console.error("Error generating conversation title:", error);
  }

  // Fallback: generare titlu bazat pe primul mesaj
  return generateFallbackTitle(firstUserMessage);
};

// Generare titlu fallback bazat pe primul mesaj
const generateFallbackTitle = (message: string): string => {
  // Curățarea mesajului
  let cleanMessage = message.trim().toLowerCase();

  // Eliminarea cuvintelor comune
  const stopWords = [
    "și",
    "cu",
    "de",
    "la",
    "în",
    "pe",
    "să",
    "am",
    "ai",
    "are",
    "că",
    "cum",
    "ce",
    "când",
    "unde",
    "why",
    "how",
    "what",
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
  ];

  // Identificarea cuvintelor cheie
  const words = cleanMessage
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.includes(word));

  // Detectarea unor pattern-uri comune
  if (cleanMessage.includes("ajut") || cleanMessage.includes("help")) {
    return "Cerere de ajutor";
  }
  if (cleanMessage.includes("învăț") || cleanMessage.includes("studiu")) {
    return "Întrebări despre studiu";
  }
  if (cleanMessage.includes("mănânc") || cleanMessage.includes("mâncare")) {
    return "Întrebări despre hrană";
  }
  if (cleanMessage.includes("dorm") || cleanMessage.includes("somn")) {
    return "Probleme cu somnul";
  }
  if (cleanMessage.includes("lucr") || cleanMessage.includes("job")) {
    return "Întrebări despre muncă";
  }
  if (cleanMessage.includes("trist") || cleanMessage.includes("deprim")) {
    return "Suport emoțional";
  }
  if (cleanMessage.includes("stres") || cleanMessage.includes("anxios")) {
    return "Gestionarea stresului";
  }

  // Fallback: primele 3-4 cuvinte relevante
  const keyWords = words.slice(0, 3);
  if (keyWords.length > 0) {
    return keyWords
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // Ultimate fallback
  return "Conversație nouă";
};

export default {
  MOOD_OPTIONS,
  QUICK_RESPONSES,
  CONVERSATION_STARTERS,
  EMOJI_REACTIONS,
  saveMoodEntry,
  getMoodHistory,
  getPersonalizedQuickResponses,
  getTimeBasedGreeting,
  getContextualSuggestions,
  generatePersonalizedInsights,
  generateConversationTitle,
};
