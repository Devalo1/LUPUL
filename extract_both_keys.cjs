const crypto = require("crypto");
const fs = require("fs");

console.log("🔍 Extragere chei publice din cheile private Netopia\n");

// Cheia privată RSA pentru LIVE
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

// Cheia privată pentru SANDBOX
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

// Certificatul (identic pentru ambele medii)
const certificate = `-----BEGIN CERTIFICATE-----
MIIC3zCCAkigAwIBAgIBATANBgkqhkiG9w0BAQsFADCBiDELMAkGA1UEBhMCUk8x
EjAQBgNVBAgTCUJ1Y2hhcmVzdDESMBAGA1UEBxMJQnVjaGFyZXN0MRAwDgYDVQQK
EwdORVRPUElBMSEwHwYDVQQLExhORVRPUElBIERldmVsb3BtZW50IHRlYW0xHDAa
BgNVBAMTE25ldG9waWEtcGF5bWVudHMucm8wHhcNMjUwNzEzMTI0ODM0WhcNMzUw
NzExMTI0ODM0WjCBiDELMAkGA1UEBhMCUk8xEjAQBgNVBAgTCUJ1Y2hhcmVzdDES
MBAGA1UEBxMJQnVjaGFyZXN0MRAwDgYDVQQKEwdORVRPUElBMSEwHwYDVQQLExhO
RVRPUElBIERldmVsb3BtZW50IHRlYW0xHDAaBgNVBAMTE25ldG9waWEtcGF5bWVu
dHMucm8wgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBALwh0/NhEpZFuKvghZ9N
75CXba05MWNCh422kcfFKbqP5YViCUBg3Mc5ZYd1e0Xi9Ui1QI2Z/jvvchrDZGQw
jarApr3S9bowHEkZH81ZolOoPHBZbYpA28BIyHYRcaTXjLtiBGvjpwuzljmXeBoV
LinIaE0IUpMen9MLWG2fGMddAgMBAAGjVzBVMA4GA1UdDwEB/wQEAwIFoDATBgNV
HSUEDDAKBggrBgEFBQcDATAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQ9yXCh
MGxzUzQflmkXT1oyIBoetTANBgkqhkiG9w0BAQsFAAOBgQAMnh95YlI+y3XcxrpG
gNWC9AwVBt61MTid213yuXDGxkouizSGFr1MjP1tk/YkcWdNka9QB3AtCr4bMers
/2f322soXcrhAOhj5JPVQkF6rlhJxg2JBO+8M5sOJTaxq5YvFHl/o2GGg0UuxWb5
RbUx6W/CU+uFDgDY8CdZ3hZ7kg==
-----END CERTIFICATE-----`;

try {
  console.log("🔴 LIVE - Extragere cheia publică din cheia privată RSA:");
  console.log("=".repeat(65));

  // Pentru cheia privată RSA (LIVE)
  const liveKeyObj = crypto.createPrivateKey(livePrivateKey);
  const livePublicKeyObj = crypto.createPublicKey(liveKeyObj);
  const livePublicKey = livePublicKeyObj.export({
    format: "pem",
    type: "spki",
  });

  console.log(livePublicKey);
  fs.writeFileSync("netopia_live_public_key.pem", livePublicKey);
  console.log("💾 Salvată în: netopia_live_public_key.pem\n");

  console.log("🟡 SANDBOX - Extragere cheia publică din cheia privată:");
  console.log("=".repeat(65));

  // Pentru cheia privată PKCS#8 (SANDBOX)
  const sandboxKeyObj = crypto.createPrivateKey(sandboxPrivateKey);
  const sandboxPublicKeyObj = crypto.createPublicKey(sandboxKeyObj);
  const sandboxPublicKey = sandboxPublicKeyObj.export({
    format: "pem",
    type: "spki",
  });

  console.log(sandboxPublicKey);
  fs.writeFileSync("netopia_sandbox_public_key.pem", sandboxPublicKey);
  console.log("💾 Salvată în: netopia_sandbox_public_key.pem\n");

  console.log("🏛️ CERTIFICATE - Extragere cheia publică din certificat:");
  console.log("=".repeat(65));

  // Din certificat
  const cert = new crypto.X509Certificate(certificate);
  const certPublicKey = cert.publicKey.export({
    format: "pem",
    type: "spki",
  });

  console.log(certPublicKey);
  fs.writeFileSync("netopia_cert_public_key.pem", certPublicKey);
  console.log("💾 Salvată în: netopia_cert_public_key.pem\n");

  console.log("🔍 COMPARAȚIE CHEI:");
  console.log("=".repeat(50));
  console.log(
    "Live public key === Sandbox public key:",
    livePublicKey.trim() === sandboxPublicKey.trim()
  );
  console.log(
    "Live public key === Certificate public key:",
    livePublicKey.trim() === certPublicKey.trim()
  );
  console.log(
    "Sandbox public key === Certificate public key:",
    sandboxPublicKey.trim() === certPublicKey.trim()
  );

  console.log("\n🎯 CONCLUZIE:");
  if (livePublicKey.trim() === sandboxPublicKey.trim()) {
    console.log("⚠️  Toate cheile publice sunt IDENTICE!");
    console.log(
      "   Netopia folosește același certificat pentru toate mediile."
    );
    console.log("   Singura diferență este semnătura (signature) din POS.");
  } else {
    console.log("✅ Cheile publice sunt diferite pentru live și sandbox.");
  }

  console.log("\n📋 PENTRU CONFIGURARE:");
  console.log("- LIVE signature: 2ZOW-PJ5X-HYYC-IENE-APZO");
  console.log("- SANDBOX signature: (alta din dashboard Netopia)");
  console.log(
    "- Public key (universal):",
    certPublicKey.substring(27, 50) + "..."
  );
} catch (error) {
  console.error("❌ Eroare:", error.message);
}
