/**
 * Test pentru diferite endpoint-uri LIVE NETOPIA
 */

const liveApiKey = "VfjsAdVjct7hQkMXRHKlimzmGGUHztw1e-C1PmvUoBlxkHs05BeWPpx0SXgV";

const ENDPOINTS_TO_TEST = [
  "https://secure.netopia-payments.com/payment/card/start",
  "https://live.netopia-payments.com/payment/card/start", 
  "https://secure.netopia-payments.com/payment/start",
  "https://live.netopia-payments.com/payment/start",
  "https://api.netopia-payments.com/payment/card/start",
  "https://payments.netopia.ro/payment/card/start",
  "https://secure.netopia-payments.com/api/payment/card/start"
];

async function testLiveEndpoints() {
  console.log("🔍 Testing different LIVE endpoints...\n");
  
  // Payload minimal pentru test
  const testPayload = {
    config: {
      emailTemplate: "",
      emailSubject: "",
      notifyUrl: "https://lupulsicorbul.com/.netlify/functions/netopia-notify-emblem",
      redirectUrl: "https://lupulsicorbul.com/.netlify/functions/netopia-return-emblem",
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
      orderID: `ENDPOINT-TEST-${Date.now()}`,
      amount: 49.99,
      currency: "RON",
      details: "Test endpoint",
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
          name: "Test Endpoint",
          code: `ENDPOINT-TEST-${Date.now()}`,
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

  for (const endpoint of ENDPOINTS_TO_TEST) {
    console.log(`\n🧪 Testing: ${endpoint}`);
    
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: liveApiKey,
          "User-Agent": "LupulSiCorbul-Endpoint-Test/1.0",
        },
        body: JSON.stringify(testPayload),
      });

      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.status === 404) {
        console.log("❌ 404 - Endpoint doesn't exist");
      } else if (response.status === 400) {
        console.log("✅ 400 - Endpoint exists but validation error (normal)");
      } else if (response.status === 401) {
        console.log("🔑 401 - Endpoint exists but auth error");
      } else {
        const responseText = await response.text();
        if (responseText.includes('<html')) {
          console.log("❌ HTML response - wrong endpoint");
        } else {
          console.log("✅ Valid endpoint response:", responseText.substring(0, 100));
        }
      }

    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

testLiveEndpoints().catch(console.error);
