/**
 * Test LOCAL pentru a verifica dacă sandbox-ul NETOPIA funcționează direct
 */

import fetch from "node-fetch";

console.log("🧪 Test LOCAL SANDBOX NETOPIA");
console.log("=".repeat(50));

// Exact aceleași configurări ca în funcțiile care funcționează local
const SANDBOX_CONFIG = {
  baseUrl: "https://secure.sandbox.netopia-payments.com",
  endpoint: "https://secure.sandbox.netopia-payments.com/payment/card/start",
  signature: "2ZOW-PJ5X-HYYC-IENE-APZO",
  apiKey: "z-2vhwpEKiI7WSe1OjU9BR-vaMgoEVEDDbaToPXkVmXKDojL3afQ4uxItEw=",
};

const payload = {
  config: {
    emailTemplate: "",
    emailSubject: "",
    notifyUrl: "https://lupulsicorbul.com/.netlify/functions/netopia-notify",
    redirectUrl: "https://lupulsicorbul.com/.netlify/functions/netopia-return",
    language: "ro",
  },
  payment: {
    options: {
      installments: 0,
      bonus: 0,
    },
    instrument: {
      type: "card",
    },
    data: {
      property1: "string",
      property2: "string",
    },
  },
  order: {
    ntpID: "",
    posSignature: SANDBOX_CONFIG.signature,
    dateTime: new Date().toISOString().replace("Z", "+02:00"),
    description: "Test plată direct către NETOPIA",
    orderID: `DIRECT-TEST-${Date.now()}`,
    amount: 25.0,
    currency: "RON",
    billing: {
      email: "test@lupulsicorbul.com",
      phone: "+407xxxxxxxx",
      firstName: "Test",
      lastName: "Direct",
      city: "București",
      country: 642,
      countryName: "Romania",
      state: "București",
      postalCode: "010001",
      details: "Test direct",
    },
    shipping: {
      email: "test@lupulsicorbul.com",
      phone: "+407xxxxxxxx",
      firstName: "Test",
      lastName: "Direct",
      city: "București",
      country: 642,
      state: "București",
      postalCode: "010001",
      details: "Test direct",
    },
    products: [
      {
        name: "Test plată directă",
        code: "TEST-DIRECT",
        category: "test",
        price: 25.0,
        vat: 19,
      },
    ],
    installments: {
      selected: 0,
      available: [0],
    },
    data: {
      property1: "test",
      property2: "direct",
    },
  },
};

async function testDirectNetopia() {
  try {
    console.log("📤 Trimit request DIRECT către NETOPIA sandbox...");
    console.log("🔗 Endpoint:", SANDBOX_CONFIG.endpoint);
    console.log("🔑 API Key:", SANDBOX_CONFIG.apiKey.substring(0, 10) + "...");

    const response = await fetch(SANDBOX_CONFIG.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: SANDBOX_CONFIG.apiKey,
        "User-Agent": "LupulSiCorbul-DirectTest/1.0",
      },
      body: JSON.stringify(payload),
    });

    console.log("📡 Status răspuns NETOPIA:", response.status);
    console.log("📄 Content-Type:", response.headers.get("content-type"));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Eroare NETOPIA:", {
        status: response.status,
        body: errorText.substring(0, 200) + "...",
      });
      return;
    }

    const result = await response.json();
    console.log("✅ Succes NETOPIA:", {
      hasPayment: !!result.payment,
      paymentUrl: result.payment?.paymentURL,
      ntpID: result.payment?.ntpID,
      status: result.payment?.status,
      hasError: !!result.error,
      errorCode: result.error?.code,
    });

    if (result.payment?.paymentURL) {
      console.log("🔗 URL generat:", result.payment.paymentURL);
      console.log("🎉 NETOPIA SANDBOX FUNCȚIONEAZĂ!");
    } else {
      console.log("❌ Nu s-a generat URL de plată");
    }
  } catch (error) {
    console.error("🚨 Eroare în test:", error.message);
  }
}

testDirectNetopia();
