/**
 * Test MobilPay API v1 Implementation
 * Testează endpoint-urile corecte conform documentației MobilPay
 */

// Credențiale NETOPIA LIVE
const SIGNATURE = "2ZOW-PJ5X-HYYC-IENE-APZO";

// Endpoint-uri corecte MobilPay
const ENDPOINTS = {
  sandbox: "https://sandboxsecure.mobilpay.ro/api/v1/card/init",
  production: "https://secure.mobilpay.ro/api/v1/card/init",
};

/**
 * Creează payload conform MobilPay API v1
 */
function createMobilPayPayload() {
  return {
    order: {
      orderId: `TEST-${Date.now()}`,
      amount: 10.5,
      currency: "RON",
      description: "Test payment MobilPay API v1",
    },
    customer: {
      email: "test@lupulsicorbul.com",
      firstName: "Ion",
      lastName: "Popescu",
      phone: "+40712345678",
    },
    invoice: {
      billingAddress: {
        country: "RO",
        city: "Bucuresti",
        address: "Strada Exemplu 1",
        postalCode: "123456",
        state: "Bucuresti",
      },
    },
    returnUrl: "https://lupulsicorbul.com/.netlify/functions/netopia-return",
    confirmUrl: "https://lupulsicorbul.com/.netlify/functions/netopia-notify",
    signature: SIGNATURE,
  };
}

/**
 * Testează un endpoint MobilPay
 */
async function testMobilPayEndpoint(endpointName, url) {
  console.log(`\n🧪 Testing ${endpointName.toUpperCase()} MobilPay endpoint:`);
  console.log(`📡 URL: ${url}`);

  const payload = createMobilPayPayload();
  console.log(`📋 Order ID: ${payload.order.orderId}`);
  console.log(`💰 Amount: ${payload.order.amount} ${payload.order.currency}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log(`📊 HTTP Status: ${response.status} ${response.statusText}`);

    // Afișează headers importanți
    const contentType = response.headers.get("content-type");
    console.log(`📄 Content-Type: ${contentType}`);

    if (response.ok) {
      if (contentType && contentType.includes("application/json")) {
        // Răspuns JSON
        const data = await response.json();
        console.log("✅ JSON Response received:");
        console.log({
          paymentId: data.paymentId,
          paymentURL: data.paymentURL,
          status: data.status,
          action: data.action,
          hasData: Object.keys(data).length > 0,
        });
        return { success: true, type: "json", data };
      } else {
        // Răspuns HTML/text
        const text = await response.text();
        console.log(`✅ HTML/Text Response received (${text.length} chars)`);

        // Verifică dacă e HTML valid
        if (text.includes("<html") || text.includes("<!DOCTYPE")) {
          console.log("📄 Valid HTML form detected");
          // Extrage URL-ul de action dacă există
          const actionMatch = text.match(/action=["']([^"']+)["']/);
          if (actionMatch) {
            console.log(`🎯 Form Action URL: ${actionMatch[1]}`);
          }
        }

        return {
          success: true,
          type: "html",
          text: text.substring(0, 500) + "...",
        };
      }
    } else {
      // Eroare HTTP
      const errorText = await response.text();
      console.error(`❌ Error Response: ${errorText.substring(0, 200)}...`);
      return {
        success: false,
        status: response.status,
        error: errorText.substring(0, 200),
      };
    }
  } catch (error) {
    console.error(`❌ Network Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Rulează toate testele
 */
async function runAllTests() {
  console.log("🚀 MobilPay API v1 Testing Suite");
  console.log("=".repeat(50));
  console.log(`🔑 Using signature: ${SIGNATURE.substring(0, 10)}...`);

  const results = {};

  // Test sandbox
  results.sandbox = await testMobilPayEndpoint("sandbox", ENDPOINTS.sandbox);

  // Pauză între teste
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test production
  results.production = await testMobilPayEndpoint(
    "production",
    ENDPOINTS.production
  );

  // Sumar final
  console.log("\n" + "=".repeat(50));
  console.log("📋 REZULTATE FINALE:");
  console.log("=".repeat(50));

  Object.entries(results).forEach(([env, result]) => {
    const status = result.success ? "✅ SUCCESS" : "❌ FAILED";
    const details = result.success
      ? `Type: ${result.type}`
      : `Error: ${result.error || result.status}`;

    console.log(`${env.toUpperCase()}: ${status} - ${details}`);
  });

  // Recomandări
  console.log("\n🎯 RECOMANDĂRI:");
  if (results.production.success) {
    console.log("✅ Production endpoint funcționează - folosește-l!");
  } else if (results.sandbox.success) {
    console.log(
      "⚠️  Doar sandbox funcționează - verifică credențialele production"
    );
  } else {
    console.log(
      "❌ Ambele endpoint-uri eșuează - verifică payload-ul și credențialele"
    );
  }

  return results;
}

// Rulează testele
runAllTests().catch(console.error);
