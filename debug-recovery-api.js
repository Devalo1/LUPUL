const testRecoveryAPI = async () => {
  console.log("🔄 Testing Recovery API direct...");

  // Test cu orderId existent
  const testOrderId = "LC-1753821925911"; // OrderId-ul din cererea originală

  try {
    console.log(`📞 Calling recovery API for orderId: ${testOrderId}`);

    const response = await fetch(
      `http://localhost:8888/.netlify/functions/get-order-details?orderId=${testOrderId}`
    );
    console.log("📡 Response status:", response.status);
    console.log(
      "📡 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Recovery API Response:", result);

      if (result.success && result.orderData) {
        console.log("🎯 SUCCES! Date recuperate:");
        console.log("📋 OrderID:", result.orderData.orderNumber);
        console.log("📧 Email:", result.orderData.customerEmail);
        console.log("💰 Sumă:", result.orderData.totalAmount);
        console.log("📱 Telefon:", result.orderData.customerPhone);

        // Test trimitere email cu datele recuperate
        console.log("\n📧 Testing email sending cu datele recuperate...");
        const emailResponse = await fetch(
          "http://localhost:8888/.netlify/functions/send-order-email",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderData: {
                email: result.orderData.customerEmail,
                customerName: result.orderData.customerName,
                firstName:
                  result.orderData.customerName?.split(" ")[0] || "Client",
                lastName:
                  result.orderData.customerName
                    ?.split(" ")
                    .slice(1)
                    .join(" ") || "",
                phone: result.orderData.customerPhone,
                address: result.orderData.customerAddress,
                city: result.orderData.customerCity,
                county: result.orderData.customerCounty,
                totalAmount: result.orderData.totalAmount,
                items: result.orderData.items || [],
                paymentMethod: "Card bancar (NETOPIA Payments) - Recovery Test",
                date: result.orderData.date,
                isBackupNotification: false,
              },
              orderNumber: result.orderData.orderNumber,
              totalAmount: result.orderData.totalAmount,
            }),
          }
        );

        const emailResult = await emailResponse.json();
        console.log("📧 Email sending result:", emailResult);

        if (emailResult.success) {
          console.log("🎉 PERFECT! Recovery + Email = SUCCESS!");
        } else {
          console.log("❌ Email failed:", emailResult.error);
        }
      } else {
        console.log("⚠️ Recovery API returned success=false:", result);
      }
    } else {
      console.error("❌ Recovery API failed with status:", response.status);
      const errorText = await response.text();
      console.error("❌ Error response:", errorText);
    }
  } catch (error) {
    console.error("❌ Recovery API test failed:", error);
  }
};

// Test cu diferite scenarii
const testMultipleScenarios = async () => {
  console.log("\n🧪 Testing multiple recovery scenarios...");

  const testCases = [
    "LC-1753821925911", // OrderId original
    "LC-" + Date.now(), // OrderId nou generat
    "INVALID-ID", // ID invalid
    "", // ID gol
    null, // ID null
  ];

  for (const testId of testCases) {
    console.log(`\n📋 Testing with orderId: ${testId}`);

    try {
      const url = testId
        ? `http://localhost:8888/.netlify/functions/get-order-details?orderId=${testId}`
        : `http://localhost:8888/.netlify/functions/get-order-details`;

      const response = await fetch(url);
      const result = await response.json();

      console.log(`  Status: ${response.status}`);
      console.log(`  Result:`, result);
    } catch (error) {
      console.log(`  Error:`, error.message);
    }
  }
};

// Rulează testele
console.log("🚀 Starting Recovery API Tests...");
testRecoveryAPI()
  .then(() => {
    console.log("\n" + "=".repeat(50));
    return testMultipleScenarios();
  })
  .then(() => {
    console.log("\n✅ All tests completed!");
  });
