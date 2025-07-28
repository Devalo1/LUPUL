/**
 * Test NETOPIA API conform documentației oficiale
 * https://secure.sandbox.netopia-payments.com/payment/card/start
 */

const NETOPIA_CONFIG = {
  sandbox: {
    signature: "2ZOW-PJ5X-HYYC-IENE-APZO",
    endpoint: "https://secure.sandbox.netopia-payments.com/payment/card/start",
  },
  production: {
    signature: "2ZOW-PJ5X-HYYC-IENE-APZO", 
    endpoint: "https://secure.netopia-payments.com/payment/card", // Endpoint care funcționează
  },
};

// Payload conform documentației NETOPIA
const testPayload = {
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
      account: "",
      expMonth: "",
      expYear: "",
      secretCode: "",
      token: "",
    },
    data: {},
  },
  order: {
    ntpID: "",
    posSignature: NETOPIA_CONFIG.sandbox.signature,
    dateTime: new Date().toISOString(),
    description: "Test payment lupulsicorbul.com",
    orderID: "TEST_" + Date.now(),
    amount: 10.00,
    currency: "RON",
    billing: {
      email: "test@lupulsicorbul.com",
      phone: "+40712345678",
      firstName: "Test",
      lastName: "User", 
      city: "Bucuresti",
      country: 642,
      countryName: "Romania",
      state: "Bucuresti",
      postalCode: "123456",
      details: "Test address",
    },
    shipping: {
      email: "test@lupulsicorbul.com",
      phone: "+40712345678",
      firstName: "Test",
      lastName: "User",
      city: "Bucuresti", 
      country: 642,
      state: "Bucuresti",
      postalCode: "123456",
      details: "Test address",
    },
    products: [
      {
        name: "Produs test",
        code: "TEST_" + Date.now(),
        category: "digital",
        price: 10.00,
        vat: 19,
      },
    ],
    installments: {
      selected: 0,
      available: [0],
    },
    data: {},
  },
};

async function testNetopiaEndpoint(endpoint, signature, name) {
  console.log(`\n🚀 Testing ${name}:`);
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   Signature: ${signature.substring(0, 10)}...`);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json", 
        Authorization: signature, // Conform documentației NETOPIA
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const contentType = response.headers.get("content-type");
      console.log(`   Content-Type: ${contentType}`);
      
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log(`   ✅ SUCCESS - JSON Response:`, {
          hasPayment: !!data.payment,
          status: data.payment?.status,
          hasPaymentURL: !!data.payment?.paymentURL,
          hasCustomerAction: !!data.customerAction,
        });
      } else {
        const text = await response.text();
        console.log(`   ✅ SUCCESS - HTML/SVG Response (${text.length} bytes)`);
        console.log(`   Preview: ${text.substring(0, 100)}...`);
      }
    } else {
      const errorText = await response.text();
      console.log(`   ❌ FAILED - Error: ${errorText.substring(0, 150)}...`);
    }
  } catch (error) {
    console.log(`   ❌ FAILED - Network Error: ${error.message}`);
  }
}

async function runTests() {
  console.log("🧪 NETOPIA API ENDPOINT TESTING");
  console.log("Testing endpoints conform documentației oficiale");
  console.log("=".repeat(60));

  // Test sandbox endpoint
  await testNetopiaEndpoint(
    NETOPIA_CONFIG.sandbox.endpoint,
    NETOPIA_CONFIG.sandbox.signature,
    "SANDBOX (/payment/card/start)"
  );

  // Test production endpoint (cel care funcționează)
  await testNetopiaEndpoint(
    NETOPIA_CONFIG.production.endpoint,
    NETOPIA_CONFIG.production.signature,
    "PRODUCTION (/payment/card)"
  );

  console.log("\n" + "=".repeat(60));
  console.log("🏁 Testing completed!");
}

// Rulează testele
runTests();
