// Test rapid pentru funcția Netopia
const testNetopiaPayment = async () => {
  console.log("🧪 Testing Netopia payment initiation...");

  const testPaymentData = {
    orderId: "TEST-" + Date.now(),
    amount: 500, // 5 RON în bani
    currency: "RON",
    description: "Test plată",
    customerInfo: {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      phone: "0712345678",
      address: "Test Address 123",
      city: "București",
      county: "București",
      postalCode: "010000",
    },
    live: window.location.hostname === "lupulsicorbul.com" || window.location.hostname === "www.lupulsicorbul.com", // Detectează automat mediul
  };

  try {
    const response = await fetch(
      "http://localhost:8888/.netlify/functions/netopia-initiate-fixed",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPaymentData),
      }
    );

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers));

    const result = await response.json();
    console.log("Response body:", result);

    if (result.success) {
      console.log("✅ Payment initiation successful!");
      console.log("Payment URL:", result.paymentUrl);
    } else {
      console.log("❌ Payment initiation failed:", result);
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Rulează testul când pagina se încarcă
if (typeof window !== "undefined") {
  window.testNetopiaPayment = testNetopiaPayment;
  console.log("💡 Run 'testNetopiaPayment()' in console to test payment");
}

export { testNetopiaPayment };
