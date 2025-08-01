/**
 * Test pentru endpoint-ul LIVE NETOPIA
 */

async function testLiveEndpoint() {
  console.log("🔍 Testing LIVE NETOPIA endpoint...\n");

  const liveEndpoint = "https://secure.netopia-payments.com/payment/card/start";
  const liveApiKey =
    "VfjsAdVjct7hQkMXRHKlimzmGGUHztw1e-C1PmvUoBlxkHs05BeWPpx0SXgV";

  console.log("Testing LIVE endpoint:");
  console.log("Endpoint:", liveEndpoint);
  console.log("API Key:", liveApiKey.substring(0, 10) + "...");

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
      data: {
        emblemType: "test-emblem",
        userId: "test-user",
      },
    },
    order: {
      orderID: `LIVE-TEST-${Date.now()}`,
      amount: 49.99,
      currency: "RON",
      details: "Test emblem purchase",
      data: {
        emblemType: "test-emblem",
        userId: "test-user",
      },
      posSignature: "2ZOW-PJ5X-HYYC-IENE-APZO", // LIVE signature
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
          name: "Test Emblem Live",
          code: `LIVE-TEST-${Date.now()}`,
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
    const response = await fetch(liveEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: liveApiKey,
        "User-Agent": "LupulSiCorbul-Live-Test/1.0",
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`\nResponse Status: ${response.status} ${response.statusText}`);

    const responseText = await response.text();

    if (response.ok) {
      try {
        const responseData = JSON.parse(responseText);
        console.log(
          "✅ LIVE SUCCESS! Response:",
          JSON.stringify(responseData, null, 2)
        );
      } catch (e) {
        console.log(
          "✅ LIVE SUCCESS but non-JSON response:",
          responseText.substring(0, 200)
        );
      }
    } else {
      console.log("❌ LIVE ERROR Response:", responseText.substring(0, 500));

      // Verifică dacă e HTML (404 page)
      if (responseText.includes("<html")) {
        console.log("🚨 Received HTML page - LIVE endpoint might be wrong!");
      } else {
        try {
          const errorData = JSON.parse(responseText);
          console.log("📋 Error details:", errorData);
        } catch (e) {
          console.log("Could not parse error as JSON");
        }
      }
    }
  } catch (error) {
    console.error("❌ LIVE Request failed:", error.message);
  }
}

testLiveEndpoint().catch(console.error);
