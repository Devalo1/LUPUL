// Service for generating conversation titles and managing conversation metadata
import { getTherapyResponse } from "./openaiService";

export interface ConversationSummary {
  id: string;
  title: string;
  therapyType: "psihica" | "fizica" | "general";
  lastMessage: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export const conversationTitleService = {
  // Generate a conversation title based on the first few messages
  async generateConversationTitle(
    messages: Array<{ role: string; content: string }>,
    therapyType: "psihica" | "fizica" | "general"
  ): Promise<string> {
    try {
      // Take only the first few user messages for title generation
      const userMessages = messages
        .filter((msg) => msg.role === "user")
        .slice(0, 2)
        .map((msg) => msg.content)
        .join(" ");

      if (!userMessages.trim()) {
        return this.getDefaultTitle(therapyType);
      }

      // Create a specialized prompt for title generation
      const titlePrompt = [
        {
          role: "system",
          content: `Ești un asistent care generează titluri scurte pentru conversații de terapie. 
          Generează un titlu în EXACT 2 CUVINTE care să rezume subiectul principal al conversației.
          Titlul trebuie să fie în română și să capture esența problemei sau subiectului discutat.
          
          Exemple de titluri bune:
          - "Anxietate socială"
          - "Probleme somn" 
          - "Stres muncă"
          - "Relații interpersonale"
          - "Exerciții fizice"
          - "Durere spate"
          
          Răspunde DOAR cu cele 2 cuvinte, fără alte explicații.`,
        },
        {
          role: "user",
          content: `Conversație de terapie ${therapyType}: "${userMessages}"`,
        },
      ];

      const titleResponse = await getTherapyResponse(titlePrompt, "general");

      // Clean and validate the response
      const cleanTitle = this.cleanTitle(titleResponse);

      // Fallback to default if title is invalid
      if (!this.isValidTitle(cleanTitle)) {
        return this.getDefaultTitle(therapyType);
      }

      return cleanTitle;
    } catch (error) {
      console.error("Error generating conversation title:", error);
      return this.getDefaultTitle(therapyType);
    }
  },

  // Clean the AI-generated title
  cleanTitle(title: string): string {
    // Remove quotes, punctuation, and extra whitespace
    let cleaned = title
      .replace(/["""'']/g, "")
      .replace(/[.!?,:;]/g, "")
      .trim();

    // Split into words and take only first 2
    const words = cleaned.split(/\s+/).filter((word) => word.length > 0);

    if (words.length >= 2) {
      return words.slice(0, 2).join(" ");
    } else if (words.length === 1) {
      return words[0] + " general";
    }

    return cleaned;
  },

  // Validate if the title is appropriate
  isValidTitle(title: string): boolean {
    if (!title || title.length < 3 || title.length > 50) {
      return false;
    }

    const words = title.split(/\s+/);
    if (words.length !== 2) {
      return false;
    }

    // Check if both words are reasonable length
    return words.every((word) => word.length >= 2 && word.length <= 20);
  },

  // Get default title based on therapy type
  getDefaultTitle(therapyType: "psihica" | "fizica" | "general"): string {
    const defaults = {
      psihica: "Terapie psihică",
      fizica: "Terapie fizică",
      general: "Conversație generală",
    };

    return defaults[therapyType] || "Conversație nouă";
  },

  // Generate title from conversation content
  generateTitleFromContent(
    content: string,
    therapyType: "psihica" | "fizica" | "general"
  ): string {
    if (!content || content.length < 10) {
      return this.getDefaultTitle(therapyType);
    }

    // Extract key words related to therapy topics
    const keywords = this.extractKeywords(content, therapyType);

    if (keywords.length >= 2) {
      return keywords.slice(0, 2).join(" ");
    }

    return this.getDefaultTitle(therapyType);
  },

  // Extract relevant keywords from conversation content
  extractKeywords(
    content: string,
    therapyType: "psihica" | "fizica" | "general"
  ): string[] {
    const topicMaps = {
      psihica: [
        "anxietate",
        "depresie",
        "stres",
        "emoții",
        "teamă",
        "panică",
        "relații",
        "familie",
        "muncă",
        "somn",
        "concentrare",
        "memorie",
        "traumă",
        "durere",
        "suferință",
        "tristețe",
        "fericire",
        "bucurie",
        "căsătorie",
        "divorț",
        "copii",
        "părinți",
        "prieteni",
        "iubire",
        "furie",
        "mânie",
        "jenat",
        "rușine",
        "vină",
        "regret",
        "speranță",
      ],
      fizica: [
        "exerciții",
        "antrenament",
        "alergare",
        "yoga",
        "stretching",
        "forță",
        "durere",
        "spate",
        "genunchi",
        "umăr",
        "gât",
        "mâini",
        "picioare",
        "respirație",
        "relaxare",
        "tensiune",
        "mușchi",
        "articulații",
        "echilibru",
        "coordonare",
        "flexibilitate",
        "rezistență",
        "cardio",
        "recuperare",
        "odihnă",
        "somn",
        "nutriție",
        "hidratare",
        "energie",
      ],
      general: [
        "problemă",
        "ajutor",
        "sfat",
        "întrebare",
        "răspuns",
        "explicație",
        "informație",
        "detalii",
        "clarificare",
        "înțelegere",
        "learning",
        "dezvoltare",
        "creștere",
        "progres",
        "îmbunătățire",
        "schimbare",
      ],
    };

    const relevantWords = topicMaps[therapyType] || topicMaps.general;
    const lowerContent = content.toLowerCase();

    const foundKeywords = relevantWords.filter((word) =>
      lowerContent.includes(word)
    );

    return foundKeywords.length > 0
      ? foundKeywords
      : ["conversație", "generală"];
  },
};
