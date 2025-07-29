/**
 * Direct test al NETOPIA v2.x API folosind exact payload-ul din documentație
 * Testează direct cu sandbox credentials
 */

import fetch from "node-fetch";

// Exact payload-ul din exemplul tău
const exactPayload = {
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

console.log("🎯 Testing DIRECT NETOPIA v2.x API Call");
console.log("=====================================");

async function testDirectNetopiaV2() {
  try {
    console.log("📋 Using exact payload from documentation");

    // Test direct la sandbox NETOPIA - Updated URL from working example
    const sandboxUrl = "https://secure-sandbox.netopia-payments.com/ui/card";
    const apiKey =
      "z-2vhwpEKiI7WSe1OjU9BR-vaMgoEVEDDbaToPXkVmXKDojL3afQ4uxItEw=";

    console.log("🌍 Target URL:", sandboxUrl);
    console.log("🔑 API Key:", apiKey.substring(0, 10) + "...");

    const response = await fetch(sandboxUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": "LupulSiCorbul-Test/1.0",
      },
      body: JSON.stringify(exactPayload),
    });

    console.log("\n📡 Response status:", response.status);
    console.log("📡 Response headers:", Object.fromEntries(response.headers));

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const result = await response.json();
      console.log("\n✅ JSON Response from NETOPIA:");
      console.log(JSON.stringify(result, null, 2));

      // Analizează răspunsul
      if (result.payment) {
        console.log("\n🎉 SUCCESS! NETOPIA v2.x response received");
        console.log("💳 Payment URL:", result.payment.paymentURL);
        console.log("🔢 NETOPIA ID:", result.payment.ntpID);
        console.log("🎯 Status:", result.payment.status);
        console.log(
          "💰 Amount:",
          result.payment.amount,
          result.payment.currency
        );
        console.log("📅 Operation Date:", result.payment.operationDate);

        if (result.error) {
          console.log("ℹ️ Error Code:", result.error.code);
          console.log("ℹ️ Error Message:", result.error.message);

          if (result.error.code === "101") {
            console.log(
              "✅ Code 101 = 'Redirect user to payment page' - Normal!"
            );
          }
        }
      } else {
        console.error("\n❌ Invalid response format - no payment object");
      }
    } else {
      const text = await response.text();
      console.log("\n📄 Non-JSON response:");
      console.log(text.substring(0, 500) + (text.length > 500 ? "..." : ""));
    }
  } catch (error) {
    console.error("\n🚨 Direct test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

console.log("🚀 Starting direct NETOPIA v2.x test...\n");
testDirectNetopiaV2();
