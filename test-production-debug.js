/**
 * Script pentru testarea în PRODUCȚIE - teste rapide pentru a vedea ce nu merge
 */

console.log("🚨 TESTARE PRODUCȚIE - Debugging probleme live");
console.log("=" .repeat(60));

// Configurare pentru producție
const BASE_URL = "https://lupulsicorbul.com";

async function testProductionPayment() {
  console.log("\n💳 TESTARE 1: Plată normală cu cardul în PRODUCȚIE");
  console.log("-".repeat(50));

  try {
    const payload = {
      orderId: `PROD-TEST-${Date.now()}`,
      amount: "25.00", // RON
      description: "Test plată producție",
      customerInfo: {
        email: "test@lupulsicorbul.com",
        firstName: "Test",
        lastName: "Production",
        phone: "+40700000000",
        city: "București",
        county: "București",
        address: "Strada Test 123",
        postalCode: "010001",
      },
    };

    console.log("📤 Testez plata normală în producție...");
    const response = await fetch(
      `${BASE_URL}/.netlify/functions/netopia-v2-api`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    console.log("📡 Status răspuns plată normală:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Eroare plată normală:", errorText.substring(0, 500));
      return false;
    }

    const result = await response.json();
    console.log("✅ Succes plată normală:", {
      success: result.success,
      orderId: result.orderId,
      ntpID: result.ntpID,
      hasPaymentUrl: !!result.paymentUrl,
    });

    if (result.paymentUrl) {
      console.log("🔗 URL plată:", result.paymentUrl.substring(0, 50) + "...");
    }

    return true;
  } catch (error) {
    console.error("🚨 Eroare testare plată normală:", error.message);
    return false;
  }
}

async function testProductionEmblem() {
  console.log("\n🔮 TESTARE 2: Emblemă NFT în PRODUCȚIE");
  console.log("-".repeat(50));

  try {
    const emblemPayload = {
      orderId: `EMBLEM-PROD-${Date.now()}`,
      amount: 50, // 50 RON
      emblemType: "lupul_intelepta",
      userId: "test-user-prod",
      tier: 1,
      description: "Test emblemă producție",
      customerInfo: {
        email: "test@lupulsicorbul.com",
        firstName: "Test",
        lastName: "Production",
        phone: "+40700000000",
        city: "București",
        county: "București",
        address: "Strada Test 123",
        postalCode: "010001",
      },
    };

    console.log("📤 Testez emblema în producție...");
    const response = await fetch(
      `${BASE_URL}/.netlify/functions/netopia-initiate-emblem`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emblemPayload),
      }
    );

    console.log("📡 Status răspuns emblemă:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Eroare emblemă:", errorText.substring(0, 500));
      return false;
    }

    const result = await response.json();
    console.log("✅ Succes emblemă:", {
      success: result.success,
      orderId: result.orderId,
      ntpID: result.ntpID,
      hasPaymentUrl: !!result.paymentUrl,
      environment: result.environment,
    });

    if (result.paymentUrl) {
      console.log("🔗 URL emblemă:", result.paymentUrl.substring(0, 50) + "...");
    }

    return true;
  } catch (error) {
    console.error("🚨 Eroare testare emblemă:", error.message);
    return false;
  }
}

async function testProductionEmail() {
  console.log("\n📧 TESTARE 3: Email ramburs în PRODUCȚIE");
  console.log("-".repeat(50));

  try {
    const orderPayload = {
      orderData: {
        name: "TEST PRODUCȚIE",
        firstName: "TEST",
        lastName: "PRODUCȚIE",
        email: "test@lupulsicorbul.com",
        phone: "0775346243",
        address: "Strada Test Producție 123",
        city: "București",
        county: "București",
        postalCode: "010001",
        items: [
          {
            name: "🧪 Test Producție",
            price: "25.00",
            quantity: 1,
            description: "Test pentru verificare producție",
          },
        ],
      },
      orderNumber: `PROD-EMAIL-${Date.now()}`,
      totalAmount: "30.00",
    };

    console.log("📤 Testez email-ul în producție...");
    const response = await fetch(
      `${BASE_URL}/.netlify/functions/send-order-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      }
    );

    console.log("📡 Status răspuns email:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Eroare email:", errorText.substring(0, 500));
      return false;
    }

    const result = await response.json();
    console.log("✅ Succes email:", {
      success: result.success,
      customerEmailId: result.customerEmailId ? "✅ Trimis" : "❌ Nu s-a trimis",
      adminEmailId: result.adminEmailId ? "✅ Trimis" : "❌ Nu s-a trimis",
      simulated: result.simulated,
    });

    return true;
  } catch (error) {
    console.error("🚨 Eroare testare email:", error.message);
    return false;
  }
}

async function runProductionTests() {
  console.log("🚀 Începe testarea în PRODUCȚIE...\n");

  const results = {
    payment: await testProductionPayment(),
    emblem: await testProductionEmblem(),
    email: await testProductionEmail(),
  };

  console.log("\n" + "=".repeat(60));
  console.log("📊 REZULTATE PRODUCȚIE:");
  console.log("💳 Plată normală:", results.payment ? "✅ FUNCȚIONEAZĂ" : "❌ EROARE");
  console.log("🔮 Embleme NFT:", results.emblem ? "✅ FUNCȚIONEAZĂ" : "❌ EROARE");
  console.log("📧 Email ramburs:", results.email ? "✅ FUNCȚIONEAZĂ" : "❌ EROARE");

  const allWorking = results.payment && results.emblem && results.email;
  
  if (allWorking) {
    console.log("\n🎉 TOATE FUNCȚIONEAZĂ ÎN PRODUCȚIE!");
  } else {
    console.log("\n⚠️ PROBLEME DETECTATE ÎN PRODUCȚIE!");
    
    if (!results.payment) {
      console.log("🚨 Plățile normale nu funcționează - verifică API keys live");
    }
    if (!results.emblem) {
      console.log("🚨 Emblemele nu funcționează - verifică configurația live");
    }
    if (!results.email) {
      console.log("🚨 Email-urile nu funcționează - verifică SMTP în producție");
    }
  }

  console.log("\n🔧 Următoarele pași pentru debugging:");
  console.log("1. Verifică variabilele de mediu în Netlify dashboard");
  console.log("2. Verifică logs-urile funcțiilor în Netlify");
  console.log("3. Testează manual prin interfața site-ului");
}

// Rulează testele
runProductionTests().catch(console.error);
