/**
 * Test pentru a vedea exact ce eroare 400 primim
 */

async function checkError400() {
  console.log("🔍 Investigating 400 error...\n");

  const testPayload = {
    orderId: `ERROR-DEBUG-${Date.now()}`,
    amount: "49.99",
    emblemType: "corbul-mistic",
    userId: "error-debug-user",
    customerInfo: {
      email: "error@example.com",
      firstName: "Error",
      lastName: "Debug",
      phone: "+40712345678",
      city: "Bucharest",
      county: "Bucharest",
      postalCode: "010101",
      address: "Error Debug Address 123",
    },
    description: "Error Debug Test Emblem",
  };

  try {
    const response = await fetch(
      "https://lupulsicorbul.com/.netlify/functions/netopia-initiate-emblem",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPayload),
      }
    );

    console.log(`Status: ${response.status} ${response.statusText}`);

    // Citesc răspunsul ca text mai întâi
    const responseText = await response.text();
    console.log("Raw response:", responseText);

    // Încerc să parsez ca JSON
    try {
      const responseData = JSON.parse(responseText);
      console.log("Parsed response:", JSON.stringify(responseData, null, 2));
    } catch (parseError) {
      console.log("Could not parse as JSON:", parseError.message);
    }
  } catch (error) {
    console.error("❌ Request failed:", error.message);
  }
}

checkError400().catch(console.error);
