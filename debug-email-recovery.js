// 🔧 Debug Email Recovery - Test trimitere email prin recovery system
const fetch = require("node-fetch");

const TEST_ORDER_DATA = {
  orderId: "LC-DEBUG-" + Date.now(),
  amount: "99.99",
  description: "Debug Email Recovery Test",
  customerInfo: {
    firstName: "Debug",
    lastName: "EmailTest",
    email: "debug.email@test.com",
    phone: "0712345678",
    address: "Strada Debug 1",
    city: "București",
    county: "București",
  },
  timestamp: new Date().toISOString(),
  source: "PaymentPage",
};

async function testEmailRecovery() {
  console.log("🔧 Starting Email Recovery Debug Test...");
  console.log("📋 Test Order Data:", JSON.stringify(TEST_ORDER_DATA, null, 2));

  try {
    // Simulează datele care ar fi în sessionStorage
    const orderDataForEmail = {
      orderNumber: TEST_ORDER_DATA.orderId,
      customerName: `${TEST_ORDER_DATA.customerInfo.firstName} ${TEST_ORDER_DATA.customerInfo.lastName}`,
      customerEmail: TEST_ORDER_DATA.customerInfo.email,
      customerPhone: TEST_ORDER_DATA.customerInfo.phone,
      customerAddress: TEST_ORDER_DATA.customerInfo.address,
      customerCity: TEST_ORDER_DATA.customerInfo.city,
      customerCounty: TEST_ORDER_DATA.customerInfo.county,
      totalAmount: TEST_ORDER_DATA.amount,
      paymentMethod: "Card bancar (NETOPIA Payments) - RECOVERY DEBUG",
      date: TEST_ORDER_DATA.timestamp,
      items: [
        {
          name: TEST_ORDER_DATA.description,
          price: TEST_ORDER_DATA.amount,
          quantity: 1,
        },
      ],
    };

    console.log(
      "📧 Prepared Email Data:",
      JSON.stringify(orderDataForEmail, null, 2)
    );

    // Testează trimiterea emailului
    const emailPayload = {
      orderData: {
        email: orderDataForEmail.customerEmail,
        customerName: orderDataForEmail.customerName,
        firstName: orderDataForEmail.customerName.split(" ")[0],
        lastName: orderDataForEmail.customerName.split(" ").slice(1).join(" "),
        phone: orderDataForEmail.customerPhone,
        address: orderDataForEmail.customerAddress,
        city: orderDataForEmail.customerCity,
        county: orderDataForEmail.customerCounty,
        totalAmount: orderDataForEmail.totalAmount,
        items: orderDataForEmail.items,
        paymentMethod: orderDataForEmail.paymentMethod,
        date: orderDataForEmail.date,
        isBackupNotification: false,
      },
      orderNumber: orderDataForEmail.orderNumber,
      totalAmount: orderDataForEmail.totalAmount,
    };

    console.log(
      "📤 Email Payload to send:",
      JSON.stringify(emailPayload, null, 2)
    );

    // Trimite request către funcția de email
    const response = await fetch(
      "http://localhost:8888/.netlify/functions/send-order-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      }
    );

    console.log("📡 Response Status:", response.status);
    console.log("📡 Response OK:", response.ok);

    const result = await response.json();
    console.log("📧 Email Result:", JSON.stringify(result, null, 2));

    if (result.success) {
      console.log("🎉 SUCCESS: Email trimis cu succes prin recovery system!");
      console.log("✅ Recovery system funcționează complet!");
    } else {
      console.log("❌ FAILED: Email nu a fost trimis");
      console.log("❌ Error:", result.error);
      console.log("🔍 Details:", result);
    }
  } catch (error) {
    console.error("❌ DEBUG ERROR:", error.message);
    console.error("❌ Stack:", error.stack);
  }
}

// Rulează testul
testEmailRecovery()
  .then(() => {
    console.log("🔧 Debug Email Recovery Test completed!");
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
  });
