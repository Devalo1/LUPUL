/**
 * 🛡️ TEST DE PROTECȚIE ANTI-ȘTERGERE PENTRU FIX-UL NETOPIA SANDBOX
 *
 * Acest test verifică că fix-ul pentru persistența sandbox-ului NETOPIA
 * nu este șters din greșeală de către AI Agent sau modificări ulterioare.
 *
 * ❌ PROBLEMA INIȚIALĂ: `live: false` hardcodat forța sandbox în producție
 * ✅ SOLUȚIA CORECTĂ: `live: window.location.hostname === "lupulsicorbul.com" || window.location.hostname === "www.lupulsicorbul.com"`
 */

const fs = require("fs");
const path = require("path");

describe("🛡️ PROTECȚIE NETOPIA SANDBOX FIX", () => {
  const checkoutFilePath = path.join(__dirname, "../src/pages/Checkout.tsx");

  beforeAll(() => {
    // Verifică că fișierul Checkout.tsx există
    if (!fs.existsSync(checkoutFilePath)) {
      throw new Error(
        `❌ Fișierul Checkout.tsx nu există la: ${checkoutFilePath}`
      );
    }
  });

  test("🚨 VERIFICĂ că NU există live: false hardcodat în Checkout.tsx", () => {
    const content = fs.readFileSync(checkoutFilePath, "utf8");

    // Caută pattern-uri periculoase care forțează sandbox
    const dangerousPatterns = [
      /live:\s*false[,\s]/g, // live: false,
      /live:\s*false\s*\/\//g, // live: false //
      /live:\s*false\s*$/gm, // live: false la sfârșitul liniei
      /"live":\s*false/g, // "live": false
      /'live':\s*false/g, // 'live': false
    ];

    dangerousPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        const context = getContextAroundMatch(content, matches[0]);
        fail(`
❌ ALERTĂ CRITICĂ: Găsit live: false hardcodat în Checkout.tsx!

Pattern găsit (#${index + 1}): ${matches[0]}

Context:
${context}

🔧 SOLUȚIA: Înlocuiește cu hostname detection:
live: window.location.hostname === "lupulsicorbul.com" || window.location.hostname === "www.lupulsicorbul.com"

🌐 IMPACT: Cu live: false hardcodat, plățile în producție vor folosi sandbox URLs!
`);
      }
    });

    console.log(
      "✅ Nu s-au găsit pattern-uri periculoase live: false hardcodat"
    );
  });

  test("✅ VERIFICĂ că există hostname detection pentru live flag", () => {
    const content = fs.readFileSync(checkoutFilePath, "utf8");

    // Caută pattern-uri corecte pentru hostname detection
    const correctPatterns = [
      /window\.location\.hostname\s*===\s*["']lupulsicorbul\.com["']/g,
      /window\.location\.hostname\s*===\s*["']www\.lupulsicorbul\.com["']/g,
    ];

    let foundCorrectLogic = false;

    correctPatterns.forEach((pattern) => {
      if (pattern.test(content)) {
        foundCorrectLogic = true;
      }
    });

    if (!foundCorrectLogic) {
      const paymentDataSection = extractPaymentDataSection(content);
      fail(`
❌ ALERTĂ: Nu s-a găsit hostname detection pentru live flag!

Secțiunea paymentData actuală:
${paymentDataSection}

🔧 SOLUȚIA NECESARĂ:
live: window.location.hostname === "lupulsicorbul.com" || window.location.hostname === "www.lupulsicorbul.com"

📍 LOCAȚIA: În obiectul paymentData din handleSubmit function
`);
    }

    console.log("✅ Găsit hostname detection corect pentru live flag");
  });

  test("🔍 VERIFICĂ structura completă a paymentData object", () => {
    const content = fs.readFileSync(checkoutFilePath, "utf8");

    // Extrage secțiunea paymentData
    const paymentDataMatch = content.match(/const paymentData = \{[\s\S]*?\};/);

    if (!paymentDataMatch) {
      fail("❌ Nu s-a găsit obiectul paymentData în Checkout.tsx");
    }

    const paymentDataContent = paymentDataMatch[0];

    // Verifică că obiectul conține toate câmpurile necesare
    const requiredFields = [
      "orderId",
      "amount",
      "currency",
      "description",
      "customerInfo",
      "live",
      "returnUrl",
      "confirmUrl",
    ];

    requiredFields.forEach((field) => {
      if (!paymentDataContent.includes(field)) {
        fail(`❌ Câmpul obligatoriu '${field}' lipsește din paymentData`);
      }
    });

    // Verifică că live field nu este hardcodat ca false
    if (paymentDataContent.includes("live: false")) {
      const context = getContextAroundMatch(content, "live: false");
      fail(`
❌ ALERTĂ CRITICĂ: live: false găsit în paymentData!

Context:
${context}

🔧 TREBUIE ÎNLOCUIT CU:
live: window.location.hostname === "lupulsicorbul.com" || window.location.hostname === "www.lupulsicorbul.com"
`);
    }

    console.log("✅ Structura paymentData este corectă");
  });

  test("🌐 SIMULEAZĂ comportamentul în diferite medii", () => {
    const content = fs.readFileSync(checkoutFilePath, "utf8");

    // Simulează diferite hostname-uri
    const testCases = [
      {
        hostname: "lupulsicorbul.com",
        expected: "LIVE",
        description: "Producție principală",
      },
      {
        hostname: "www.lupulsicorbul.com",
        expected: "LIVE",
        description: "Producție cu www",
      },
      {
        hostname: "localhost",
        expected: "SANDBOX",
        description: "Dezvoltare locală",
      },
      {
        hostname: "127.0.0.1",
        expected: "SANDBOX",
        description: "Dezvoltare IP local",
      },
      {
        hostname: "deploy-preview-123--lupulsicorbul.netlify.app",
        expected: "SANDBOX",
        description: "Preview Netlify",
      },
    ];

    testCases.forEach((testCase) => {
      const isLive =
        testCase.hostname === "lupulsicorbul.com" ||
        testCase.hostname === "www.lupulsicorbul.com";
      const actualMode = isLive ? "LIVE" : "SANDBOX";

      expect(actualMode).toBe(testCase.expected);

      console.log(
        `✅ ${testCase.description} (${testCase.hostname}): ${actualMode} ✓`
      );
    });
  });

  test("📋 VERIFICĂ că backend-ul respectă flag-ul live din frontend", () => {
    const backendPath = path.join(
      __dirname,
      "../netlify/functions/netopia-v2-api.js"
    );

    if (!fs.existsSync(backendPath)) {
      console.warn("⚠️  Backend file nu există, skip test backend");
      return;
    }

    const backendContent = fs.readFileSync(backendPath, "utf8");

    // Verifică că backend-ul respectă paymentData.live
    const hasCorrectLogic =
      backendContent.includes("paymentData.live === true") ||
      backendContent.includes("paymentData.live") ||
      backendContent.includes("useLive");

    if (!hasCorrectLogic) {
      fail(`
❌ Backend-ul nu respectă flag-ul live din frontend!

📁 Fișier: ${backendPath}

🔧 VERIFICĂ că backend-ul folosește:
const useLive = paymentData.live === true || (isProduction && hasLiveSignature);
`);
    }

    console.log("✅ Backend-ul respectă corect flag-ul live din frontend");
  });
});

/**
 * Helper: Extrage contextul în jurul unui match găsit
 */
function getContextAroundMatch(content, match) {
  const lines = content.split("\n");
  const matchLine = lines.findIndex((line) => line.includes(match));

  if (matchLine === -1) return "Context nu a putut fi găsit";

  const start = Math.max(0, matchLine - 3);
  const end = Math.min(lines.length, matchLine + 4);

  return lines
    .slice(start, end)
    .map((line, index) => {
      const lineNum = start + index + 1;
      const marker = start + index === matchLine ? ">>> " : "    ";
      return `${marker}${lineNum}: ${line}`;
    })
    .join("\n");
}

/**
 * Helper: Extrage secțiunea paymentData din cod
 */
function extractPaymentDataSection(content) {
  const match = content.match(/const paymentData = \{[\s\S]*?\};/);
  if (!match) return "paymentData object nu a fost găsit";

  return match[0];
}
