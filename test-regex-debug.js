// Test pentru debugging regex-uri
console.log("🔍 TEST REGEX DEBUGGING");
console.log("======================");

// Testez regex-urile manual
const testMessages = [
  "Bună! Sunt Bogdan, am 33 de ani.",
  "Salut! Mă numesc Cristina și am 26 de ani.",
  "Bună ziua! Sunt Dan, am 45 de ani.",
  "Bună! Sunt Florin, am 31 de ani.",
  "Bună! Sunt Horia, am 41 de ani.",
  "Sunt inginer și îmi place să fac drumeții.",
  "Sunt psiholog și îmi place să citesc și să meditez.",
  "Sunt bucătar și îmi place să joc fotbal.",
  "Sunt arhitect și îmi place să ascult muzică.",
];

console.log("📝 Testez regex-urile pentru extragerea numelor:");
console.log("================================================");

const namePatterns = [
  /m[ăa] numesc ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a]+)/,
  /numele meu (?:este|e) ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a]+)/,
  /sunt ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a]+),?\s+am \d+/,
  /(?:bun[ăa]|salut)!?\s+sunt ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a]+),?\s+am/,
];

for (const msg of testMessages) {
  console.log(`\n💬 Testing: "${msg}"`);
  const lowerMsg = msg.toLowerCase();

  for (let i = 0; i < namePatterns.length; i++) {
    const match = lowerMsg.match(namePatterns[i]);
    if (match && match[1]) {
      console.log(`   ✅ Pattern ${i + 1} matched: "${match[1]}"`);
    }
  }
}

console.log("\n" + "=".repeat(50));
console.log("📝 Testez regex-urile pentru extragerea profesiilor:");
console.log("====================================================");

const jobPatterns = [
  /lucrez ca ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a\s]+)/,
  /sunt ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a\s]+) de meserie/,
  /profesiunea mea (?:este|e) ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a\s]+)/,
  /sunt ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a\s]+) [șs]i [îi]mi place/,
  /meseria mea (?:este|e) ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a\s]+)/,
  /sunt studen[tț][ăa] la ([a-zA-Z\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a\s]+)/,
];

for (const msg of testMessages) {
  console.log(`\n💬 Testing: "${msg}"`);
  const lowerMsg = msg.toLowerCase();

  for (let i = 0; i < jobPatterns.length; i++) {
    const match = lowerMsg.match(jobPatterns[i]);
    if (match && match[1]) {
      console.log(`   ✅ Pattern ${i + 1} matched: "${match[1]}"`);
    }
  }
}
