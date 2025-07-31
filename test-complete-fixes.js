/**
 * Script pentru testarea completă a sistemului de embleme și email-uri
 * Testează ambele funcționalități reparate
 */

console.log("🧪 Testare completă: Embleme NFT + Email-uri ramburs");
console.log("=".repeat(60));

// Configurare
const BASE_URL = "http://localhost:8888"; // Pentru dezvoltare
// const BASE_URL = "https://lupulsicorbul.com"; // Pentru producție

async function testEmblemPayment() {
  console.log("\n🔮 TESTARE 1: Embleme NFT");
  console.log("-".repeat(40));

  try {
    const emblemPayload = {
      orderId: `EMBLEM-TEST-${Date.now()}`,
      amount: 50, // 50 RON
      emblemType: "Lupul Alpha",
      userId: "test-user-123",
      tier: 1,
      description: "Test emblemă NFT Lupul Alpha",
      customerInfo: {
        email: "test@lupulsicorbul.com",
        firstName: "Test",
        lastName: "User",
        phone: "+40700000000",
        city: "București",
        county: "București",
        address: "Strada Test 123",
        postalCode: "010001",
      },
    };

    console.log("📤 Trimit request pentru emblemă...");
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
      console.error("❌ Eroare emblemă:", errorText);
      return false;
    }

    const result = await response.json();
    console.log("✅ Succes emblemă:", {
      success: result.success,
      orderId: result.orderId,
      ntpID: result.ntpID,
      paymentUrl: result.paymentUrl ? "✅ URL generat" : "❌ Lipsă URL",
      environment: result.environment,
      apiVersion: result.apiVersion,
    });

    if (result.paymentUrl) {
      console.log("🔗 URL plată emblemă:", result.paymentUrl);
      return true;
    } else {
      console.error("❌ Nu s-a generat URL de plată pentru emblemă");
      return false;
    }
  } catch (error) {
    console.error("🚨 Eroare testare emblemă:", error.message);
    return false;
  }
}

async function testCashOrderEmail() {
  console.log("\n📧 TESTARE 2: Email-uri pentru ramburs");
  console.log("-".repeat(40));

  try {
    const orderPayload = {
      orderData: {
        name: "POPA DUMITRU",
        firstName: "POPA",
        lastName: "DUMITRU",
        email: "test@lupulsicorbul.com",
        phone: "0775346243",
        address: "Strada 9 Mai Bloc 2 A Ap. 34",
        city: "București",
        county: "București",
        postalCode: "010001",
        items: [
          {
            name: "🫐 Dulceață de afine",
            price: "20.00",
            quantity: 1,
            description: "Dulceață artizanală de afine din munții Carpați",
          },
        ],
      },
      orderNumber: `LC-TEST-${Date.now()}`,
      totalAmount: "35.00", // Include și transportul
    };

    console.log("📤 Trimit request pentru email ramburs...");
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
      console.error("❌ Eroare email:", errorText);
      return false;
    }

    const result = await response.json();
    console.log("✅ Succes email:", {
      success: result.success,
      customerEmailId: result.customerEmailId || "simulat",
      adminEmailId: result.adminEmailId || "simulat",
      orderNumber: result.orderNumber,
      simulated: result.simulated || result.development,
    });

    if (result.simulated || result.development) {
      console.log("⚠️ Email-urile au fost SIMULATE (nu trimise real)");
      console.log("💡 Pentru email-uri reale: verifică SMTP_PASS în .env");
    } else {
      console.log("✅ Email-urile au fost trimise REAL!");
    }

    return true;
  } catch (error) {
    console.error("🚨 Eroare testare email:", error.message);
    return false;
  }
}

async function runTests() {
  console.log("🚀 Începe testarea completă...\n");

  const results = {
    emblem: await testEmblemPayment(),
    email: await testCashOrderEmail(),
  };

  console.log("\n" + "=".repeat(60));
  console.log("📊 REZULTATE FINALE:");
  console.log(
    "🔮 Embleme NFT:",
    results.emblem ? "✅ FUNCȚIONEAZĂ" : "❌ EROARE"
  );
  console.log(
    "📧 Email ramburs:",
    results.email ? "✅ FUNCȚIONEAZĂ" : "❌ EROARE"
  );

  if (results.emblem && results.email) {
    console.log("\n🎉 TOATE TESTELE AU TRECUT!");
    console.log("✅ Sistemul de embleme funcționează");
    console.log("✅ Email-urile pentru ramburs funcționează");
  } else {
    console.log("\n⚠️ UNELE TESTE AU EȘUAT!");
    if (!results.emblem) {
      console.log("❌ Sistemul de embleme are probleme");
    }
    if (!results.email) {
      console.log("❌ Email-urile pentru ramburs au probleme");
    }
  }

  console.log("\n🔧 Pentru debugging suplimentar:");
  console.log("1. Verifică console-ul pentru detalii despre erori");
  console.log("2. Verifică fișierul .env pentru SMTP_PASS");
  console.log("3. Testează manual prin interfață");
}

// Rulează testele
runTests().catch(console.error);
