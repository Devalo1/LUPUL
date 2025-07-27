const crypto = require("crypto");
const fs = require("fs");

// Cheia privată pentru sandbox (diferită de live)
const sandboxPrivateKey = `-----BEGIN PRIVATE KEY-----
MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAPWF5TRG+VH3kcWa
cheCdCB/EwUZYFELepVGldTsDIt/w7h9Bi/55+Eq0HjBp9zqMrz90jZh67akEQKb
x1ilA87XkrBKXTvGzyszglz6UbfLhuLg1UfmjJst9cOtwPOAdL30wNewKHv2uJio
wqqolt+OImKm0MO0/+MM/z8n4szPAgMBAAECgYEA8JL6O3cv5TkIBO+Iy7BvyUe6
g0ySK9drjclUFwYUZLwUMzmOToQ4yVECZNCcgsKYZMbwq4jXRmcMo9mwQxOt3Zvc
ukwcwbnhDbUY2pgEr+SMasYzEErg+pJLhLkWCs8tJL+YppV30+i9JT9LelekBwY3
bQmWdbaLv56P+5w7QIECQQD7SmicemdHGwmhEz13nbOynmP0h5nXY3yFYYkKmUSn
R6VpunCD9G3thIBJfFVyg4EDHqOQIMekypTcd8XRAmHJAkEA+h/Q4Hia8EXJA6hf
ATkaasI6R79ZriOUpa82wo7W2jqSGQ1UtujY3n7TuNuE0GjISgYwbhcowabJKEVJ
5gvF1wJAVjYM9cI4tHheMVi8edEs2Vbly/rJmM+U5N21emFi4FEAOumvuFWfcSFI
Me3qEsNy+3MDgmr8k1i9AXZF85LxoQJBALRifaFlWVgu++lHZDzdkc+sg5t6xJJx
1qIm2rc1jH2WAAdRNeczxjOwA8Etj3s+FjRMgmDjEuGWBzyju8fMdcECQQCj/DtM
+b7wtPqMtet6cbf8Mc45vJnvmIpviG/BMYi8dlQFty1gzw/dyn4CLNM47umAVxTR
9JSX2ToP3Qt102qK
-----END PRIVATE KEY-----`;

// Cheia privată pentru live (RSA format)
const livePrivateKey = `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQDgvgno9K9M465g14CoKE0aIvKbSqwE3EvKm6NIcVO0ZQ7za08v
Xbe508JPioYoTRM2WN7CQTQQgupiRKtyPykE3lxpCMmLqLzpcsq0wm3o9tvCnB8W
zbA2lpDre+EDcylPVyulZhrWn1Vf9sbJcFZREwMgYWewVVLwkTen92Qm5wIDAQAB
AoGAS1/xOuw1jvgdl+UvBTbfBRELhQG6R7cKxF0GmllH1Yy/QuyOljg8UlqvJLY0
4HdZJjUQIN51c8Q0j9iwF5UPUC3MgR0eQ70iislu6LGPnTnIJgbCs4QSWY/fjo08
DgTh3uDUO4bIsIFKvGbVwd86kjTARldnQ4RonKwYkv1xDIECQQDtZg9onk7gcE31
Z2QAEaUfloffY7vst4u+QUm6vZoQ+Eu4ohX3qciwN1daP5qd290OAEngOa8dtzDK
/+tgbsU3AkEA8lobdWiVZkB+1q1Rl6LEOHuxXMyQ42s1L1L1Owc8Ftw6JGT8FewZ
4lCD3U56MJSebCCqKCG32GGkO47R50aD0QJAIlnRQvcdPLajYS4btzLWbNKwSG+7
Ao6whtAVphLHV0tGUaoKebK0mmL3ndR0QAFPZDZAelR+dVNLmSQc3/BHUwJAOw1r
vWsTZEv43BR1Wi6GA4FYUVVjRJbd6b8cFBsKMEPPQwj8R9c042ldCDLUITxFcfFv
pMG6i1YXb4+4Y9NR0QJBANt0qlS2GsS9S79eWhPkAnw5qxDcOEQeekk5z5jil7yw
7J0yOEdf46C89U56v2zORfS5Due8YEYgSMRxXdY0/As=
-----END RSA PRIVATE KEY-----`;

console.log(
  "🔍 Extragere chei publice din cheile private pentru SANDBOX și LIVE\n"
);

try {
  // Extrage cheia publică din cheia privată de sandbox
  console.log("📋 Procesez cheia privată SANDBOX...");
  const sandboxKeyObject = crypto.createPrivateKey(sandboxPrivateKey);
  const sandboxPublicKey = sandboxKeyObject.export({
    type: "spki",
    format: "pem",
  });

  console.log("✅ Cheia publică SANDBOX extrasă cu succes:");
  console.log("=".repeat(60));
  console.log(sandboxPublicKey);
  console.log("=".repeat(60));

  // Extrage cheia publică din cheia privată de live
  console.log("\n📋 Procesez cheia privată LIVE...");
  const liveKeyObject = crypto.createPrivateKey(livePrivateKey);
  const livePublicKey = liveKeyObject.export({
    type: "spki",
    format: "pem",
  });

  console.log("✅ Cheia publică LIVE extrasă cu succes:");
  console.log("=".repeat(60));
  console.log(livePublicKey);
  console.log("=".repeat(60));

  // Salvează cheile în fișiere
  fs.writeFileSync("netopia_sandbox_public_key.pem", sandboxPublicKey);
  fs.writeFileSync("netopia_live_public_key.pem", livePublicKey);
  console.log(
    "💾 Salvate în: netopia_sandbox_public_key.pem și netopia_live_public_key.pem"
  );

  // Verifică dacă cheile sunt diferite
  console.log("\n🔍 Comparație chei:");
  console.log(
    "Sandbox key equals Live key:",
    sandboxPublicKey.trim() === livePublicKey.trim()
  );

  if (sandboxPublicKey.trim() === livePublicKey.trim()) {
    console.log("⚠️  ATENȚIE: Cheile publice sunt IDENTICE!");
    console.log(
      "   Aceasta înseamnă că Netopia folosește aceleași certificate pentru ambele medii."
    );
  } else {
    console.log(
      "✅ Cheile publice sunt diferite (corect pentru medii separate)"
    );
    console.log("\n📊 Pentru .env.local:");
    console.log("VITE_NETOPIA_PUBLIC_KEY_LIVE=");
    console.log(livePublicKey);
    console.log("VITE_NETOPIA_PUBLIC_KEY_SANDBOX=");
    console.log(sandboxPublicKey);
  }
} catch (error) {
  console.error("❌ Eroare la extragerea cheilor publice:", error.message);
}
