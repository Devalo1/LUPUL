#!/usr/bin/env node

/**
 * 🚀 NETOPIA Live Payment Test
 * Testez cu credențialele reale primite de la NETOPIA
 */

import fs from "fs";

console.log("🚀 NETOPIA Live Payment Test Started");
console.log("===================================================");

// Credențialele reale primite de la NETOPIA
const NETOPIA_CREDENTIALS = {
  posSignature: "2ZOW-PJ5X-HYYC-IENE-APZO",
  privateKey: `-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----`,
};

// Test payload cu credențialele reale
const testPayload = {
  config: {
    notifyUrl: "https://lupulsicorbul.com/.netlify/functions/netopia-notify",
    redirectUrl: "https://lupulsicorbul.com/.netlify/functions/netopia-return",
    language: "ro",
  },
  payment: {
    options: { installments: 0, bonus: 0 },
    instrument: {
      type: "card",
      account: "",
      expMonth: "",
      expYear: "",
      secretCode: "",
      token: "",
    },
  },
  order: {
    posSignature: NETOPIA_CREDENTIALS.posSignature,
    dateTime: new Date().toISOString(),
    description: "Test plată HIFITBOX cu credențiale LIVE",
    orderID: "LUPUL" + Date.now(),
    amount: 25.0,
    currency: "RON",
    billing: {
      email: "lupulsicorbul@gmail.com",
      phone: "+40775346243",
      firstName: "Dumitru",
      lastName: "Popa",
      city: "Bucuresti",
      country: 642,
      countryName: "Romania",
      state: "Bucuresti",
      postalCode: "123456",
      details: "Adresa client",
    },
    shipping: {
      email: "lupulsicorbul@gmail.com",
      phone: "+40775346243",
      firstName: "Dumitru",
      lastName: "Popa",
      city: "Bucuresti",
      country: 642,
      countryName: "Romania",
      state: "Bucuresti",
      postalCode: "123456",
      details: "Adresa client",
    },
    products: [
      {
        name: "Test Produs HIFITBOX",
        code: "PROD001",
        category: "digital",
        price: 25.0,
        vat: 19,
      },
    ],
    installments: { selected: 0, available: [0] },
  },
};

// Test SANDBOX cu credențiale reale
async function testSandboxWithCredentials() {
  console.log("🧪 Testing SANDBOX with LIVE credentials");
  console.log(`🔑 POS Signature: ${NETOPIA_CREDENTIALS.posSignature}`);

  const endpoint =
    "https://secure.sandbox.netopia-payments.com/payment/card/start";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${NETOPIA_CREDENTIALS.posSignature}`,
      },
      body: JSON.stringify(testPayload),
    });

    console.log("🔍 Response Status:", response.status);
    console.log(
      "🔍 Response Headers:",
      Object.fromEntries(response.headers.entries())
    );

    const responseText = await response.text();
    console.log("📄 Response Body:", responseText.substring(0, 500));

    if (response.status === 200) {
      console.log("✅ SUCCESS! NETOPIA sandbox acceptă credențialele!");

      try {
        const jsonResponse = JSON.parse(responseText);
        console.log("🎉 JSON Response:", {
          status: jsonResponse.payment?.status,
          ntpID: jsonResponse.payment?.ntpID,
          paymentURL: jsonResponse.payment?.paymentURL,
          hasCustomerAction: !!jsonResponse.customerAction,
        });
      } catch (e) {
        console.log("📄 Non-JSON response (maybe HTML redirect)");
      }
    } else if (response.status === 401) {
      console.log("🔐 Still 401 - may need different authentication format");
    } else {
      console.log(`❌ Status ${response.status} - may need API adjustment`);
    }
  } catch (error) {
    console.error("❌ Request failed:", error.message);
  }
}

// Test PRODUCTION cu credențiale reale
async function testProductionWithCredentials() {
  console.log("\n🌐 Testing PRODUCTION with LIVE credentials");

  const endpoint = "https://secure.netopia-payments.com/payment/card";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(testPayload),
    });

    console.log("🔍 Response Status:", response.status);

    const responseText = await response.text();
    console.log("📄 Response Body:", responseText.substring(0, 200));

    if (response.status === 200) {
      console.log("✅ SUCCESS! NETOPIA production acceptă credențialele!");
    } else {
      console.log(`❌ Status ${response.status} - checking response`);
    }
  } catch (error) {
    console.error("❌ Request failed:", error.message);
  }
}

// Rulează testele
console.log("📋 Test Payload:");
console.log(JSON.stringify(testPayload, null, 2));
console.log("===================================================");

await testSandboxWithCredentials();
await testProductionWithCredentials();

console.log("===================================================");
console.log("🏁 Testing Complete!");
