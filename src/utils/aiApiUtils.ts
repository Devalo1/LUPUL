// AI API Utils - Determină dacă să folosească direct OpenAI sau Netlify Functions
import { getTherapyResponse } from "../services/openaiService";

// Verifică dacă suntem în producție (deployment)
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

// URL-ul pentru Netlify Functions (se adaptează automat la domeniul actual)
const getNetlifyFunctionUrl = () => {
  if (isDevelopment) {
    return "http://localhost:8888/.netlify/functions";
  }
  return "/.netlify/functions";
};

// Funcție pentru AI Chat - folosește Netlify Functions în producție, direct OpenAI în dezvoltare
export async function fetchAIResponseSafe(
  prompt: string,
  assistantProfile: { name: string; addressMode: string }
): Promise<string> {
  if (isDevelopment) {
    // În dezvoltare folosește direct serviciul OpenAI
    try {
      const systemPrompt = `${assistantProfile.name} este un asistent AI personal amabil și profesionist care vorbește română perfect. Oferă sprijin general pentru viața de zi cu zi, organizare, productivitate, dezvoltare personală și rezolvarea problemelor cotidiene.

IMPORTANTE DESPRE GRAMATICA ROMÂNĂ:
- Folosește DOAR gramatica română standard, corectă și impecabilă
- Respectă toate regulile de ortografie și punctuație
- Acordul în gen și număr să fie perfect
- Folosește diacriticele obligatoriu (ă, â, î, ș, ț)
- Verifică de două ori fiecare propoziție înainte de a răspunde
- Folosește forme de plural corecte și conjugări verbale precise
- Evită barbarismele și anglicismele inutile

Folosește modul de adresare: ${assistantProfile.addressMode}. Fii empatic, constructiv și orientat pe soluții practice, dar mai presus de toate, să vorbești româna perfect.`;

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ];
      const response = await getTherapyResponse(messages, "general");
      return response || "(Fără răspuns AI)";
    } catch (err) {
      console.error("Eroare la apelul direct OpenAI:", err);
      return "(Eroare la răspunsul AI. Încearcă din nou mai târziu.)";
    }
  } else {
    // În producție folosește Netlify Functions
    try {
      const functionUrl = `${getNetlifyFunctionUrl()}/ai-chat`;

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          assistantName: assistantProfile.name,
          addressMode: assistantProfile.addressMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.reply || "(Fără răspuns AI)";
    } catch (err) {
      console.error("Eroare la apelul Netlify Function:", err);
      return "(Eroare la răspunsul AI. Verifică conexiunea și încearcă din nou.)";
    }
  }
}

// Pentru debugging - afișează informațiile despre mediu
export const getEnvironmentInfo = () => {
  return {
    isDevelopment,
    isProduction,
    apiUrl: getNetlifyFunctionUrl(),
    env: import.meta.env.MODE,
  };
};
