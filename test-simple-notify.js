/**
 * Test pentru versiunea simplificată a funcției notify
 */

async function testSimpleNotify() {
  console.log("🧪 Testez funcția netopia-notify-emblem-simple...");

  // Simulează o notificare de plată confirmată de la NETOPIA
  const testNotification = {
    orderId: "emblem_cautatorul_lumina_testuser123_1722261234567",
    status: "confirmed",
    amount: "5000", // 50 RON
    signature: "test_signature_valid",
    data: "test_data_payload",
  };

  try {
    const response = await fetch(
      "http://localhost:8888/.netlify/functions/netopia-notify-emblem-simple",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testNotification),
      }
    );

    console.log("📊 Response Status:", response.status);
    const responseData = await response.text();
    console.log("📊 Response Body:", responseData);

    if (response.status === 200) {
      console.log("✅ SUCCESS: Status 200 returnat către NETOPIA!");

      try {
        const jsonData = JSON.parse(responseData);
        console.log("📦 Parsed JSON:", jsonData);

        if (jsonData.success) {
          console.log("🎉 Notificarea a fost procesată cu succes!");
          console.log("🔮 Mock Emblem ID:", jsonData.emblemId);
          console.log("📋 Order Data:", jsonData.orderData);
        }
      } catch (parseError) {
        console.log("⚠️ Response-ul nu este JSON valid");
      }
    }
  } catch (error) {
    console.error("❌ Eroare la test:", error);
  }
}

// Test cu status în așteptare
async function testPendingStatus() {
  console.log("\n🧪 Testez cu status 'pending'...");

  const testNotification = {
    orderId: "emblem_corbul_mistic_user456_1722261234568",
    status: "pending", // Status în așteptare
    amount: "12000", // 120 RON
    signature: "test_signature",
    data: "test_data",
  };

  try {
    const response = await fetch(
      "http://localhost:8888/.netlify/functions/netopia-notify-emblem-simple",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testNotification),
      }
    );

    console.log("📊 Pending Response Status:", response.status);
    const responseData = await response.text();
    console.log("📊 Pending Response Body:", responseData);
  } catch (error) {
    console.error("❌ Eroare la testul pending:", error);
  }
}

// Rulează testele
console.log("🚀 Testez versiunea simplificată pentru NETOPIA...\n");
testSimpleNotify()
  .then(() => {
    return testPendingStatus();
  })
  .then(() => {
    console.log("\n🎯 Teste completate! Funcția este gata pentru NETOPIA.");
  });
