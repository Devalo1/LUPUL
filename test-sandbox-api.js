/**
 * Test pentru sandbox cu endpoint-ul nou
 */

async function testSandboxNewEndpoint() {
  console.log("🔍 Testing SANDBOX with new /api/ endpoint...\n");

  const sandboxEndpoint =
    "https://secure.sandbox.netopia-payments.com/api/payment/card/start";
  const sandboxApiKey =
    "z-2vhwpEKiI7WSe1OjU9BR-vaMgoEVEDDbaToPXkVmXKDojL3afQ4uxItEw=";

  console.log("Testing SANDBOX /api/ endpoint:");
  console.log("Endpoint:", sandboxEndpoint);
  console.log("API Key:", sandboxApiKey.substring(0, 10) + "...");

  // Payload minimal pentru test
  const testPayload = {
    config: {
      emailTemplate: "",
      emailSubject: "",
      notifyUrl:
        "https://lupulsicorbul.com/.netlify/functions/netopia-notify-emblem",
      redirectUrl:
        "https://lupulsicorbul.com/.netlify/functions/netopia-return-emblem",
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
    },
    order: {
      orderID: `SANDBOX-API-TEST-${Date.now()}`,
      amount: 49.99,
      currency: "RON",
      details: "Test sandbox API emblem",
      posSignature: "2ZOW-PJ5X-HYYC-IENE-APZO",
      billing: {
        email: "test@example.com",
        phone: "+40712345678",
        firstName: "Test",
        lastName: "User",
        city: "Bucharest",
        country: 642,
        state: "Bucharest",
        postalCode: "010101",
        details: "Test Address",
      },
      shipping: {
        email: "test@example.com",
        phone: "+40712345678",
        firstName: "Test",
        lastName: "User",
        city: "Bucharest",
        country: 642,
        state: "Bucharest",
        postalCode: "010101",
        details: "Test Address",
      },
      products: [
        {
          name: "Test Sandbox API Emblem",
          code: `SANDBOX-API-TEST-${Date.now()}`,
          category: "category",
          price: 49.99,
          vat: 19,
        },
      ],
      installments: {
        selected: 0,
        available: [0],
      },
    },
  };

  try {
    const response = await fetch(sandboxEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: sandboxApiKey,
        "User-Agent": "LupulSiCorbul-API-Test/1.0",
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`\nResponse Status: ${response.status} ${response.statusText}`);

    const responseText = await response.text();

    if (response.ok) {
      try {
        const responseData = JSON.parse(responseText);
        console.log("✅ SUCCESS with /api/ endpoint!");
        console.log("Response:", JSON.stringify(responseData, null, 2));
      } catch (e) {
        console.log(
          "✅ SUCCESS but non-JSON response:",
          responseText.substring(0, 200)
        );
      }
    } else {
      console.log("❌ ERROR Response:", responseText.substring(0, 500));
    }
  } catch (error) {
    console.error("❌ Request failed:", error.message);
  }
}

testSandboxNewEndpoint().catch(console.error);
