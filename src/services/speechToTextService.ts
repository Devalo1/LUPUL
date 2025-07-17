/**
 * Mock Speech-to-Text Service
 * În producție, aceasta ar fi înlocuită cu un serviciu real ca Google Speech-to-Text, Azure Speech Services, etc.
 */

export interface SpeechToTextResult {
  text: string;
  confidence: number;
  language?: string;
}

export class MockSpeechToTextService {
  private static mockResponses = [
    "Salut, cum ești astăzi?",
    "Ce timp frumos este afară!",
    "Poți să mă ajuți cu o problemă?",
    "Mulțumesc pentru ajutor!",
    "Cum pot să îmbunătățesc acest cod?",
    "Explică-mi te rog conceptul acesta.",
    "Ce recomanzi pentru această situație?",
    "Sunt foarte mulțumit de progres.",
    "Vrei să discutăm despre asta mai târziu?",
    "Perfect, înțeleg acum!",
  ];

  static async transcribeAudio(_audioBlob: Blob): Promise<SpeechToTextResult> {
    // Simulăm o întârziere realistă pentru procesarea audio
    await new Promise((resolve) =>
      setTimeout(resolve, 1500 + Math.random() * 1000)
    );

    // Simulăm o rată de succes de 95%
    if (Math.random() < 0.05) {
      throw new Error(
        "Nu s-a putut procesa înregistrarea audio. Te rog încearcă din nou."
      );
    }

    // Returnăm un răspuns aleator din lista predefinită
    const randomIndex = Math.floor(Math.random() * this.mockResponses.length);
    const mockText = this.mockResponses[randomIndex];

    // Simulăm o încredere variabilă
    const confidence = 0.85 + Math.random() * 0.14; // între 85% și 99%

    return {
      text: mockText,
      confidence: Math.round(confidence * 100) / 100,
      language: "ro-RO",
    };
  }

  static async isSupported(): Promise<boolean> {
    // Verificăm dacă browserul suportă Web Audio API
    return (
      typeof window !== "undefined" &&
      typeof window.MediaRecorder !== "undefined" &&
      typeof navigator.mediaDevices !== "undefined" &&
      typeof navigator.mediaDevices.getUserMedia !== "undefined"
    );
  }

  static getErrorMessage(error: any): string {
    if (error?.message) {
      return error.message;
    }

    return "A apărut o eroare la procesarea vocii. Te rog încearcă din nou.";
  }
}

/**
 * Serviciu real Speech-to-Text care ar putea fi implementat în viitor
 * Exemplu pentru integrarea cu servicii externe
 */
export class RealSpeechToTextService {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl: string = "") {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  async transcribeAudio(audioBlob: Blob): Promise<SpeechToTextResult> {
    // Implementarea reală ar trimite audio-ul la un serviciu extern
    // Exemplu pentru Google Speech-to-Text API, Azure Speech Services, etc.

    const formData = new FormData();
    formData.append("audio", audioBlob);
    formData.append("language", "ro-RO");

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        text: result.transcript || "",
        confidence: result.confidence || 0,
        language: result.language || "ro-RO",
      };
    } catch (error) {
      console.error("Speech-to-Text API Error:", error);
      throw new Error("Nu s-a putut procesa înregistrarea vocală.");
    }
  }
}
