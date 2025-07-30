/**
 * Test pentru funcția netopia-notify-emblem cu fix-urile pentru status 200
 */

async function testNotifyEmblem() {
  console.log("🧪 Testez funcția netopia-notify-emblem cu fix-urile...");

  // Simulează o notificare de plată confirmată de la NETOPIA
  const testNotification = {
    orderId: "emblem_cautatorul_lumina_testuser123_1722261234567",
    status: "confirmed", // sau "paid"
    amount: "5000", // 50 RON în bani (50 * 100)
    signature: "test_signature_valid",
    data: "test_data_payload",
  };

  try {
    const response = await fetch(
      "http://localhost:8888/.netlify/functions/netopia-notify-emblem",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testNotification),
      }
    );

    console.log("📊 Response Status:", response.status);
    console.log(
      "📊 Response Headers:",
      Object.fromEntries(response.headers.entries())
    );

    const responseData = await response.text();
    console.log("📊 Response Body:", responseData);

    // Verifică că returnează status 200 (fix-ul principal)
    if (response.status === 200) {
      console.log("✅ SUCCESS: Funcția returnează status 200 pentru NETOPIA!");
    } else {
      console.log("❌ FAIL: Status-ul nu este 200:", response.status);
    }

    // Încearcă să parseze JSON
    try {
      const jsonData = JSON.parse(responseData);
      console.log("📦 Parsed JSON:", jsonData);

      if (jsonData.success) {
        console.log("🎉 Emblema a fost mintată cu succes!");
        console.log("🔮 Emblem ID:", jsonData.emblemId);
      } else {
        console.log(
          "❌ Eroare la mintarea emblemei:",
          jsonData.error || jsonData.message
        );
      }
    } catch (parseError) {
      console.log("⚠️ Response-ul nu este JSON valid");
    }
  } catch (error) {
    console.error("❌ Eroare la testarea funcției:", error);
  }
}

// Test suplimentar pentru metodă incorectă (GET în loc de POST)
async function testWrongMethod() {
  console.log("\n🧪 Testez cu metodă incorectă (GET)...");

  try {
    const response = await fetch(
      "http://localhost:8888/.netlify/functions/netopia-notify-emblem",
      {
        method: "GET",
      }
    );

    console.log("📊 GET Response Status:", response.status);
    const responseData = await response.text();
    console.log("📊 GET Response Body:", responseData);

    if (response.status === 200) {
      console.log("✅ SUCCESS: GET也返回了status 200 (fix-ul funcționează)!");
    }
  } catch (error) {
    console.error("❌ Eroare la testul GET:", error);
  }
}

// Rulează testele
console.log("🚀 Pornesc testele pentru funcția notify cu fix-urile...\n");
testNotifyEmblem()
  .then(() => {
    return testWrongMethod();
  })
  .then(() => {
    console.log("\n🎯 Teste completate!");
  });
