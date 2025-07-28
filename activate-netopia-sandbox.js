/**
 * Script pentru activarea și testarea mediului NETOPIA Sandbox
 * Conform indicațiilor oficiale: "Este necesar sa activati mediul de test"
 *
 * Pași pentru activare:
 * 1. Activați mediul de test în contul NETOPIA
 * 2. Obțineți credențialele sandbox (POS signature și public key)
 * 3. Configurați variabilele de mediu
 * 4. Testați implementarea cu acest script
 */

const SANDBOX_CONFIG = {
  endpoint: "https://secure.sandbox.netopia-payments.com/payment/card/start",
  // Aceste credențiale trebuie obținute din contul NETOPIA după activarea sandbox-ului
  signature:
    process.env.NETOPIA_SANDBOX_SIGNATURE || "YOUR_SANDBOX_SIGNATURE_HERE",
  publicKey:
    process.env.NETOPIA_SANDBOX_PUBLIC_KEY || "YOUR_SANDBOX_PUBLIC_KEY_HERE",
};

const TEST_PAYMENT_DATA = {
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
    posSignature: SANDBOX_CONFIG.signature,
    dateTime: new Date().toISOString(),
    description: "Test implementare NETOPIA v3 - lupulsicorbul.com",
    orderID: `SANDBOX_TEST_${Date.now()}`,
    amount: 10.0,
    currency: "RON",
    billing: {
      email: "test@lupulsicorbul.com",
      phone: "+40775346243",
      firstName: "Dumitru",
      lastName: "Popa",
      city: "Bucuresti",
      country: 642,
      countryName: "Romania",
      state: "Bucuresti",
      postalCode: "123456",
      details: "Adresa de test pentru implementare",
    },
    shipping: {
      email: "test@lupulsicorbul.com",
      phone: "+40775346243",
      firstName: "Dumitru",
      lastName: "Popa",
      city: "Bucuresti",
      country: 642,
      state: "Bucuresti",
      postalCode: "123456",
      details: "Adresa de test pentru implementare",
    },
    products: [
      {
        name: "Produs test pentru aprobare NETOPIA",
        code: "TEST_APPROVAL_001",
        category: "digital",
        price: 10.0,
        vat: 19,
      },
    ],
    installments: {
      selected: 0,
      available: [0],
    },
    data: {
      merchant: "HIFITBOX SRL",
      cui: "RO41039008",
      testMode: true,
    },
  },
};

async function testSandboxActivation() {
  console.log("🧪 NETOPIA Sandbox Activation Test");
  console.log("=" + "=".repeat(40));

  // Verifică configurația
  console.log("\n📋 Configuration Check:");
  console.log(`✅ Endpoint: ${SANDBOX_CONFIG.endpoint}`);
  console.log(
    `🔑 Signature: ${SANDBOX_CONFIG.signature ? `${SANDBOX_CONFIG.signature.substring(0, 10)}...` : "❌ NOT SET"}`
  );
  console.log(
    `🔐 Public Key: ${SANDBOX_CONFIG.publicKey ? "✅ SET" : "❌ NOT SET"}`
  );

  if (SANDBOX_CONFIG.signature === "YOUR_SANDBOX_SIGNATURE_HERE") {
    console.log("\n❌ EROARE: Trebuie să configurați credențialele sandbox!");
    console.log("📝 Pași pentru configurare:");
    console.log("1. Logați-vă în contul NETOPIA");
    console.log("2. Activați mediul de test conform instrucțiunilor");
    console.log("3. Obțineți POS signature și public key pentru sandbox");
    console.log("4. Configurați variabilele de mediu:");
    console.log("   - NETOPIA_SANDBOX_SIGNATURE=your_signature_here");
    console.log("   - NETOPIA_SANDBOX_PUBLIC_KEY=your_public_key_here");
    return;
  }

  console.log("\n🚀 Sending test request to NETOPIA Sandbox...");

  try {
    const response = await fetch(SANDBOX_CONFIG.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${SANDBOX_CONFIG.signature}`,
        "User-Agent": "LUPUL-SICORBUL-SANDBOX-TEST/1.0",
      },
      body: JSON.stringify(TEST_PAYMENT_DATA),
    });

    console.log(
      `📊 Response Status: ${response.status} ${response.statusText}`
    );

    const contentType = response.headers.get("content-type") || "";
    console.log(`📋 Content-Type: ${contentType}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error Response:`, errorText.substring(0, 500));

      if (response.status === 401) {
        console.log("\n🔒 Status 401 - Unauthorized");
        console.log("💡 Posibile cauze:");
        console.log("   - Signature-ul sandbox nu este corect");
        console.log("   - Mediul de test nu este activat");
        console.log("   - Credențialele nu sunt aprobate");
        console.log("\n📞 Contactați NETOPIA: implementare@netopia.ro");
      }

      return;
    }

    // Succes!
    const responseData = await response.json();
    console.log("\n✅ SUCCESS! Sandbox environment is active!");
    console.log("📄 Response data:", JSON.stringify(responseData, null, 2));

    if (responseData.payment?.status) {
      console.log(`\n💳 Payment Status: ${responseData.payment.status}`);

      if (responseData.payment.status === 15) {
        console.log("🔐 3D Secure Authentication required - Normal behavior");
      }

      if (responseData.payment.paymentURL) {
        console.log(`🌐 Payment URL: ${responseData.payment.paymentURL}`);
      }
    }

    console.log("\n🎉 Implementarea este gata pentru aprobare!");
    console.log("📧 Informați NETOPIA că testarea sandbox funcționează:");
    console.log("   - Email: implementare@netopia.ro");
    console.log("   - Subiect: Aprobare cont comerciant - API v3 ready");
    console.log(
      "   - Conținut: Testarea în sandbox a fost finalizată cu succes"
    );
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);

    if (error.code === "ENOTFOUND") {
      console.log("🌐 Network error - verificați conexiunea internet");
    } else if (error.code === "ETIMEDOUT") {
      console.log(
        "⏱️ Timeout - NETOPIA sandbox poate fi temporar indisponibil"
      );
    }
  }
}

async function checkProductionStatus() {
  console.log("\n🏭 Checking Production API Status...");

  try {
    // Test production endpoint fără credențiale (doar pentru a vedea dacă răspunde)
    const response = await fetch(
      "https://secure.netopia-payments.com/payment/card/start",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ test: true }),
      }
    );

    console.log(`📊 Production /start Status: ${response.status}`);

    if (response.status === 404) {
      console.log(
        "✅ Confirmed: API v3 /start not yet available in production"
      );
      console.log("⏳ Waiting for merchant account approval");
    } else if (response.status === 401) {
      console.log("🎉 API v3 is live! Merchant account may be approved");
      console.log("🔑 Configure production credentials and test");
    }
  } catch (error) {
    console.log(`❌ Production check failed: ${error.message}`);
  }
}

// Run tests
console.log("🚀 Starting NETOPIA Environment Tests");
console.log("Date: " + new Date().toISOString());
console.log("Contact: Dumitru Popa - 0775346243");

testSandboxActivation()
  .then(() => checkProductionStatus())
  .then(() => {
    console.log("\n" + "=".repeat(50));
    console.log("✅ Test completed!");
    console.log("📧 Next step: Contact NETOPIA for production approval");
  })
  .catch(console.error);
