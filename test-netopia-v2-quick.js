/**
 * Test rapid pentru a vedea dacă netopia-v2-api funcționează
 */

console.log("🧪 Test rapid NETOPIA v2 API...");

const BASE_URL = "http://localhost:8888";

async function testNetopiaV2() {
  try {
    const payload = {
      orderId: `TEST-${Date.now()}`,
      amount: "25.00", // RON
      description: "Test plată regular",
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

    console.log("📤 Testez netopia-v2-api...");
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

    console.log("📡 Status răspuns:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Eroare:", errorText);
      return false;
    }

    const result = await response.json();
    console.log("✅ Succes:", {
      success: result.success,
      orderId: result.orderId,
      ntpID: result.ntpID,
      paymentUrl: result.paymentUrl ? "✅ URL generat" : "❌ Lipsă URL",
    });

    return true;
  } catch (error) {
    console.error("🚨 Eroare:", error.message);
    return false;
  }
}

testNetopiaV2().then((success) => {
  console.log("\n📊 Rezultat:", success ? "✅ FUNCȚIONEAZĂ" : "❌ EROARE");
});
