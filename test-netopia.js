// Test NETOPIA function quickly
const testPayload = {
  orderId: "TEST-123",
  amount: 15.5,
  currency: "RON",
  description: "Test payment",
  customerInfo: {
    firstName: "Test",
    lastName: "User",
    email: "test@test.com",
    phone: "+40712345678",
    address: "Test Address",
    city: "Bucuresti",
    county: "Bucuresti",
    postalCode: "010000",
  },
  live: false,
};

fetch("http://localhost:8888/.netlify/functions/netopia-v2-api", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(testPayload),
})
  .then((response) => response.text())
  .then((data) => {
    console.log("Success:", data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
