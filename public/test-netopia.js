// Manual test pentru Netopia function
fetch("/.netlify/functions/netopia-initiate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    orderId: "TEST-" + Date.now(),
    amount: 500,
    currency: "RON",
    description: "Test payment",
    customerInfo: {
      firstName: "Test",
      lastName: "User",
      email: "test@test.com",
      phone: "0712345678",
      address: "Test Address",
      city: "București",
      county: "București",
      postalCode: "010000",
    },
    posSignature: "2ZOW-PJ5X-HYYC-IENE-APZO",
    live: false,
  }),
})
  .then((response) => {
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers));
    return response.json();
  })
  .then((data) => {
    console.log("Response data:", data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });

console.log("🚀 Testing Netopia function manually...");
