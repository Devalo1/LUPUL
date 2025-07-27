// AI API Utils - Simplified and reliable approach
// Prioritizes local functions over Netlify functions for better reliability

import { AssistantProfile } from "../models/AssistantProfile";
import { getTherapyResponse } from "../services/openaiService";

// Main function that routes to AI with proper fallback
// Enhanced helper functions for intelligent response generation (commented out to avoid lint warnings)
/*
const analyzeMessageType = (message: string): string => {
  // 🏥 Sănătate și medicină
  if (
    message.includes("durere") ||
    message.includes("medicament") ||
    message.includes("simptom") ||
    message.includes("doctori") ||
    message.includes("sănătate") ||
    message.includes("sanatate") ||
    message.includes("remediu") ||
    message.includes("tratament") ||
    message.includes("alergii") ||
    message.includes("temperatura") ||
    message.includes("răceală") ||
    message.includes("raceala") ||
    message.includes("gripa") ||
    message.includes("vitamina") ||
    message.includes("nutriție") ||
    message.includes("nutritie") ||
    message.includes("dietă") ||
    message.includes("dieta")
  ) {
    return "HEALTH";
  }

  // 💪 Motivație și dezvoltare personală
  if (
    message.includes("motivație") ||
    message.includes("motivatie") ||
    message.includes("inspirație") ||
    message.includes("inspiratie") ||
    message.includes("obiective") ||
    message.includes("țeluri") ||
    message.includes("teluri") ||
    message.includes("energia") ||
    message.includes("productivitate") ||
    message.includes("concentrare") ||
    message.includes("disciplină") ||
    message.includes("disciplina") ||
    message.includes("habite") ||
    message.includes("rutină") ||
    message.includes("rutina") ||
    message.includes("dezvoltare personală") ||
    message.includes("self-improvement") ||
    message.includes("mood") ||
    message.includes("vibe") ||
    message.includes("ziua de azi") ||
    message.includes("începutul zilei")
  ) {
    return "MOTIVATION";
  }

  // 💼 Business și carieră
  if (
    message.includes("business") ||
    message.includes("afaceri") ||
    message.includes("carieră") ||
    message.includes("cariera") ||
    message.includes("job") ||
    message.includes("lucru") ||
    message.includes("muncă") ||
    message.includes("munca") ||
    message.includes("venit") ||
    message.includes("bani") ||
    message.includes("investiții") ||
    message.includes("investitii") ||
    message.includes("marketing") ||
    message.includes("vanzari") ||
    message.includes("client") ||
    message.includes("management") ||
    message.includes("lider") ||
    message.includes("echipă") ||
    message.includes("echipa") ||
    message.includes("proiect") ||
    message.includes("deadline") ||
    message.includes("planificare") ||
    message.includes("strategie")
  ) {
    return "BUSINESS";
  }

  // 🎨 Creativitate și artă
  if (
    message.includes("creativ") ||
    message.includes("inspirație artistică") ||
    message.includes("design") ||
    message.includes("artă") ||
    message.includes("arta") ||
    message.includes("desenat") ||
    message.includes("pictat") ||
    message.includes("muzică") ||
    message.includes("muzica") ||
    message.includes("poezie") ||
    message.includes("scriitor") ||
    message.includes("povestire") ||
    message.includes("idei creative") ||
    message.includes("brainstorming") ||
    message.includes("inovație") ||
    message.includes("inovatie")
  ) {
    return "CREATIVE";
  }

  // 💻 Suport tehnic
  if (
    message.includes("cod") ||
    message.includes("programare") ||
    message.includes("software") ||
    message.includes("aplicație") ||
    message.includes("aplicatie") ||
    message.includes("bug") ||
    message.includes("eroare") ||
    message.includes("debug") ||
    message.includes("tehnologie") ||
    message.includes("calculator") ||
    message.includes("laptop") ||
    message.includes("telefon") ||
    message.includes("internet") ||
    message.includes("wifi") ||
    message.includes("configurare") ||
    message.includes("instalare") ||
    message.includes("update") ||
    message.includes("actualizare") ||
    message.includes("github") ||
    message.includes("javascript") ||
    message.includes("typescript") ||
    message.includes("react") ||
    message.includes("css") ||
    message.includes("html")
  ) {
    return "TECHNICAL";
  }

  return "GENERAL";
};
*/

// Commented out unused functions to avoid lint warnings
/*
const generateSmartHealthResponse = (message: string): string => {
  const healthResponses = [
    `🏥 Pentru problemele de sănătate, îți recomand să consulți întotdeauna un medic. Totuși, iată câteva sfaturi generale care pot ajuta:

💧 Hidratare - Bea suficientă apă (2-3 litri/zi)
🥗 Nutriție echilibrată - Include fructe și legume
😴 Somn de calitate - 7-9 ore pe noapte
🚶‍♂️ Mișcare regulată - Măcar 30 min/zi
🧘‍♀️ Management stres - Meditație, respirații profunde

⚠️ Pentru simptome persistente sau grave, contactează urgent un medic!`,

    `🌟 Corpul nostru are nevoie de îngrijire constantă. Iată un plan de sănătate holistic:

🍎 NUTRIȚIE: Evită zahărul rafinat, include proteine și fibre
💤 SOMN: Creează o rutină de seară relaxantă
🏃‍♀️ EXERCIȚIU: Alternează cardio cu exerciții de forță
🧠 MENTAL: Practici gratitudine și mindfulness
💊 PREVENȚIE: Controale medicale regulate

Îmi amintesc discuțiile noastre - ce aspect te preocupă cel mai mult?`,

    `⚕️ Sănătatea e cea mai de preț comoara! Te pot ajuta cu sfaturi generale, dar pentru probleme specifice consultă medicul.

🔬 ȘTIAI CĂ:
- Sistemul imunitar se întărește prin somn de calitate
- Stresul cronic poate provoca inflamații
- Exercițiul regulat îmbunătățește dispoziția
- Hidratarea afectează energia și concentrarea

Care e zona care te îngrijorează? Să discutăm!`,
  ];

  return healthResponses[Math.floor(Math.random() * healthResponses.length)];
};

const generateSmartMotivationResponse = (message: string): string => {
  const currentHour = new Date().getHours();
  let timeMessage = "";

  if (currentHour < 12) {
    timeMessage = "Bună dimineața";
  } else if (currentHour < 17) {
    timeMessage = "Bună ziua";
  } else {
    timeMessage = "Bună seara";
  }

  const motivationResponses = [
    `${timeMessage}! 💪 Astăzi e ziua ta să strălucești!

🎯 PLANUL DE SUCCES pentru azi:
1. Stabilește 3 priorități clare
2. Începe cu cea mai dificilă sarcină
3. Fă pauze de 15 min la fiecare oră
4. Celebrează micile victorii
5. Reflectează seara la progres

🔥 MANTRA zilei: "Sunt capabil să depășesc orice provocare!"

Tu crezi că poți? Pentru că eu sunt convins că DA! 🚀`,

    `⭐ ${timeMessage}! Fiecare zi e o nouă șansă de a fi versiunea ta cea mai bună!

💡 GÂNDURI PUTERNICE:
• Eșecul e doar feedback, nu finalitate
• Progresul constant învinge perfecțiunea
• Fiecare pas mic contează
• Tu ești mai puternic decât crezi
• Astăzi poți începe orice schimbare

🌟 Ce vrei să accomplishezi azi? Să facem un plan concret!`,

    `🔥 ${timeMessage}! Energia ta de astăzi poate schimba totul!

⚡ BOOSTER DE ENERGIE:
- Respiră adânc 5 ori
- Vizualizează succesul 
- Mișcă-te 10 minute
- Ascultă muzică motivațională
- Gândește-te la de ce merită să lupți

💎 Amintește-ți: Diamantele se formează sub presiune. Tu ești mai rezistent decât știi!

Cu ce provocare începem? 🎯`,
  ];

  return motivationResponses[
    Math.floor(Math.random() * motivationResponses.length)
  ];
};

const generateSmartBusinessResponse = (message: string): string => {
  const businessResponses = [
    `💼 Excelent! Business-ul e pasiunea mea! Iată strategii practice:

📊 FUNDAȚIA BUSINESS-ULUI:
• Validează ideea cu clienți reali
• Calculează costurile și profitul
• Creează un MVP (produs minim viabil)
• Testează piața înainte de investiție mare
• Construiește o echipă complementară

🎯 URMĂTORUL PAS: Care e visul tău de business? Să-l transformăm în plan concret!`,

    `🚀 Antreprenoriatul cere curaj și strategie! Te ajut cu:

💡 GENERARE IDEI: Problemele oamenilor = oportunități
📈 MARKETING: Storytelling autentic câștigă
💰 FINANȚE: Cash flow e mai important decât profitul pe hârtie
🤝 NETWORKING: Relațiile deschid mai multe uși decât CV-ul
⏰ TIME MANAGEMENT: Focus pe 20% care aduc 80% rezultate

Care e provocarea ta principală acum?`,

    `💎 Business-ul de succes = Valoare reală + Execuție constantă!

🎪 STRATEGII CÂȘTIGĂTOARE:
1. Ascultă nevoile clienților (nu presupunerile tale)
2. Livrează mai mult decât promiți
3. Automatizează procesele repetitive
4. Investește în dezvoltarea echipei
5. Măsoară tot ce contează

🔍 Ce aspect te interesează cel mai mult? Să intrăm în detalii!`,
  ];

  return businessResponses[
    Math.floor(Math.random() * businessResponses.length)
  ];
};

const generateSmartCreativeResponse = (message: string): string => {
  const creativeResponses = [
    `🎨 Creativitatea e superpunterea ta! Să o dezlănțuim:

✨ TEHNICI DE INSPIRAȚIE:
• Morning pages - scrie 3 pagini în fiecare dimineață
• Plimbări fără telefon - lasă mintea să rătăcească
• Schimbă mediul - lucrează din locuri noi
• Combinații neașteptate - unește concepte diferite
• Restrânge limitele - creativitatea înflorește în constrângeri

🌟 Care e proiectul tău creativ actual?`,

    `🚀 Ideile geniale vin la cine le provoacă! Iată cum:

🧠 BRAINSTORMING INTELIGENT:
1. Nu judeca ideile prima oră
2. Construiește pe ideile altora
3. Întreabă "Dacă...?" și "De ce nu...?"
4. Inversează problemele
5. Caută inspirație în alte domenii

🎭 Exercițiu rapid: Descrie-mi o problemă și îți ofer 5 soluții creative!`,

    `🌈 Creativitatea = Curaj + Persistență + Joacă!

💫 DEBLOCATORI CREATIVE:
• Schimbă perspectiva (vezi din alt unghi)
• Folosește tehnica "6 pălării gânditoare"
• Creează constrângeri artificiale
• Colaborează cu oameni diferiți
• Acceptă "eșecurile" frumoase

🎪 La ce lucrezi creativ? Să găsim împreună breakthrough-ul!`,
  ];

  return creativeResponses[
    Math.floor(Math.random() * creativeResponses.length)
  ];
};

const generateSmartTechnicalResponse = (message: string): string => {
  const techResponses = [
    `💻 Tehnologia e unealta, tu ești artistul! Să rezolvăm:

🔧 DEBUGGING INTELIGENT:
• Reproduci eroarea pas cu pas
• Verifici logs și console errors
• Izolezi componenta problematică
• Testezi pe environment clean
• Căști ajutor din comunitate

🚀 BEST PRACTICES:
- Clean code e mai important decât clever code
- Testele automate salvează timp
- Documentația e pentru viitorul tău eu
- Git commits descriptive

Ce problemă tehnică ai?`,

    `⚡ Tech troubleshooting ca un pro!

🎯 METODOLOGIA MESTERULUI:
1. Definește exact problema
2. Reproducere consistentă
3. Căutare în documentație oficială
4. Check Stack Overflow & GitHub issues
5. Testare incrementală
6. Backup înainte de schimbări mari

🛠️ TOOLS ESENȚIALE:
- DevTools pentru debugging frontend
- Postman pentru API testing
- Git pentru version control
- IDE-ul configurat optimal

Spune-mi exact ce nu funcționează!`,

    `🔬 Programarea e știință + artă! Te ajut cu:

💡 PROBLEM SOLVING:
• Împarte problema în bucăți mici
• Scrie pseudocode înainte de implementare
• Testează fiecare funcție separat
• Refactorizează cu încredere
• Optimizează doar după ce funcționează

📚 ÎNVĂȚARE CONTINUĂ:
- Citește cod de la alții
- Contribuie la open source
- Fă side-projects
- Urmărește tech leaders

Care e provocarea ta tehnică?`,
  ];

  return techResponses[Math.floor(Math.random() * techResponses.length)];
};
*/

// Main fetchAIResponseSafe function
const fetchAIResponseSafe = async (
  userMessage: string,
  userId?: string,
  assistantProfile?: AssistantProfile,
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
export { fetchAIResponseSafe };
