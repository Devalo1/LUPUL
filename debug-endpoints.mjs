// Debug test pentru v1.x
const testData = {
  orderId: `TEST-DEBUG-${Date.now()}`,
  amount: 12.5,
  currency: "RON",
  description: "Debug test v1.x",
  customerInfo: {
    firstName: "Ion",
    lastName: "Popescu",
    email: "test@lupulsicorbul.com",
    phone: "+40712345678",
  },
};

console.log("🔍 Testing both endpoints for comparison...");

// Test netopia-initiate (should return HTML)
console.log("\n1️⃣ Testing netopia-initiate (original):");
try {
  const response1 = await fetch(
    "http://localhost:8888/.netlify/functions/netopia-initiate",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testData),
    }
  );

  const text1 = await response1.text();
  console.log("Status:", response1.status);
  console.log("Content-Type:", response1.headers.get("content-type"));
  console.log("Response type:", text1.includes("<!DOCTYPE") ? "HTML" : "JSON");
  console.log("Response start:", text1.substring(0, 100));
} catch (e) {
  console.log("Error:", e.message);
}

// Test netopia-initiate-fixed (should return JSON)
console.log("\n2️⃣ Testing netopia-initiate-fixed:");
try {
  const response2 = await fetch(
    "http://localhost:8888/.netlify/functions/netopia-initiate-fixed",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testData),
    }
  );

  const text2 = await response2.text();
  console.log("Status:", response2.status);
  console.log("Content-Type:", response2.headers.get("content-type"));
  console.log("Response type:", text2.includes("<!DOCTYPE") ? "HTML" : "JSON");
  console.log("Response start:", text2.substring(0, 100));

  // Try to parse JSON
  try {
    const json = JSON.parse(text2);
    console.log("✅ JSON parsed successfully:", json);
  } catch (parseError) {
    console.log("❌ JSON parse failed:", parseError.message);
  }
} catch (e) {
  console.log("Error:", e.message);
}
