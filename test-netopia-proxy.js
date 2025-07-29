// Test NETOPIA function through Vite proxy
const testPayload = {
  orderId: "TEST-PROXY-123",
  amount: 15.5,
  currency: "RON",
  description: "Test payment via proxy",
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

fetch("http://localhost:5173/api/netopia-v2-api", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(testPayload),
})
  .then((response) => response.text())
  .then((data) => {
    console.log("Success via proxy:", data);
  })
  .catch((error) => {
    console.error("Error via proxy:", error);
  });
