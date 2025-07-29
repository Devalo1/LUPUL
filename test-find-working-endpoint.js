/**
 * Test direct cu exact același payload care a funcționat în testul tău
 * Pentru a găsi endpoint-ul corect
 */

import fetch from "node-fetch";

// Exact payload-ul care a funcționat pentru tine
const workingPayload = {
  config: {
    emailTemplate: "",
    emailSubject: "",
    notifyUrl: "https://www.my.domain/my_notify_url",
    redirectUrl: "https://www.my.domain/my_redirect_url",
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
    posSignature: "2ZOW-PJ5X-HYYC-IENE-APZO",
    dateTime: "2023-03-19T10:48:17+02:00",
    description: "Some order description",
    orderID: "TEST_DIRECT_" + Date.now(),
    amount: 1,
    currency: "RON",
    billing: {
      email: "user@example.com",
      phone: "+407xxxxxxxx",
      firstName: "First",
      lastName: "Last",
      city: "City",
      country: 642,
      countryName: "Country",
      state: "State",
      postalCode: "Zip",
      details: "",
    },
    shipping: {
      email: "user@example.com",
      phone: "+407xxxxxxxx",
      firstName: "First",
      lastName: "Last",
      city: "City",
      country: 642,
      state: "State",
      postalCode: "Zip",
      details: "",
    },
    products: [
      {
        name: "name",
        code: "SKU",
        category: "category",
        price: 1,
        vat: 19,
      },
    ],
    installments: {
      selected: 0,
      available: [0],
    },
    data: {
      property1: "string",
      property2: "string",
    },
  },
};

// Posibile endpoint-uri pentru a testa
const ENDPOINTS_TO_TEST = [
  "https://secure-sandbox.netopia-payments.com/api/v2/pay/card",
  "https://secure-sandbox.netopia-payments.com/payment/card",
  "https://secure-sandbox.netopia-payments.com/payment/card/start",
  "https://secure-sandbox.netopia-payments.com/api/payment/card",
  "https://secure-sandbox.netopia-payments.com/v2/payment/card",
  "https://secure-sandbox.netopia-payments.com/api/v2/payment/card/start",
];

const API_KEY = "z-2vhwpEKiI7WSe1OjU9BR-vaMgoEVEDDbaToPXkVmXKDojL3afQ4uxItEw=";

async function testEndpoint(endpoint) {
  console.log(`\n🧪 Testing: ${endpoint}`);
  console.log("─".repeat(80));

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${API_KEY}`,
        "User-Agent": "LupulSiCorbul-Test/1.0",
      },
      body: JSON.stringify(workingPayload),
    });

    console.log(`📡 Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Content-Type: ${response.headers.get("content-type")}`);

    const contentType = response.headers.get("content-type") || "";

    if (response.ok) {
      if (contentType.includes("application/json")) {
        const result = await response.json();
        console.log("✅ SUCCESS - JSON Response:");
        console.log(JSON.stringify(result, null, 2));

        // Check if it matches your successful response format
        if (result.payment?.paymentURL && result.error?.code === "101") {
          console.log(
            "🎉 PERFECT MATCH! This endpoint works exactly like your test!"
          );
          console.log("💳 Payment URL:", result.payment.paymentURL);
          console.log("🔢 NETOPIA ID:", result.payment.ntpID);
          return { success: true, endpoint, result };
        }
      } else {
        const text = await response.text();
        console.log("📄 SUCCESS - Non-JSON Response:");
        console.log(text.substring(0, 200) + "...");
      }
    } else {
      const errorText = await response.text();
      console.log("❌ FAILED:");
      console.log(errorText.substring(0, 300));
    }

    return { success: false, endpoint };
  } catch (error) {
    console.log(`❌ NETWORK ERROR: ${error.message}`);
    return { success: false, endpoint, error: error.message };
  }
}

async function findWorkingEndpoint() {
  console.log("🎯 FINDING THE CORRECT NETOPIA v2.x ENDPOINT");
  console.log("=".repeat(80));
  console.log(`🔑 API Key: ${API_KEY.substring(0, 15)}...`);
  console.log(`📦 Order ID: ${workingPayload.order.orderID}`);
  console.log("");

  let workingEndpoint = null;

  for (const endpoint of ENDPOINTS_TO_TEST) {
    const result = await testEndpoint(endpoint);

    if (result.success) {
      workingEndpoint = result;
      break; // Found the working one!
    }

    // Wait a bit between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n" + "=".repeat(80));

  if (workingEndpoint) {
    console.log("🎉 FOUND WORKING ENDPOINT!");
    console.log(`✅ Endpoint: ${workingEndpoint.endpoint}`);
    console.log("This endpoint should be used in the implementation.");
  } else {
    console.log("❌ No working endpoint found.");
    console.log(
      "The API might require different authentication or parameters."
    );
  }
}

findWorkingEndpoint();
