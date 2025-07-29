// Quick test pentru debugging email payload
async function testEmailPayload() {
  const testOrderData = {
    orderNumber: "LC-TEST-123",
    customerName: "Dani_popa21 Lupul",
    customerEmail: "dani_popa21@yahoo.ro",
    customerPhone: "0775346243",
    customerAddress: "9 MAI BLOC 2 A",
    customerCity: "PETROSANI",
    customerCounty: "HUNEDOARA",
    totalAmount: 35,
    items: [
      {
        id: "dulceata-afine",
        name: "🫐 Dulceață de afine",
        price: 35,
        quantity: 1,
        image: "/images/dulceata-afine.jpg",
      },
    ],
    paymentMethod: "card",
    paymentStatus: "pending",
    date: new Date().toISOString(),
  };

  console.log("Original orderData:", testOrderData);

  // Test 1: Payload actual (incorect)
  const currentPayload = {
    orderData: {
      email: testOrderData.customerEmail,
      customerName: testOrderData.customerName,
      firstName: testOrderData.customerName?.split(" ")[0] || "Client",
      lastName: testOrderData.customerName?.split(" ").slice(1).join(" ") || "",
      phone: testOrderData.customerPhone,
      address: testOrderData.customerAddress,
      city: testOrderData.customerCity,
      county: testOrderData.customerCounty,
      totalAmount: testOrderData.totalAmount,
      items: testOrderData.items || [],
      paymentMethod: "Card bancar (NETOPIA Payments)",
      date: testOrderData.date,
    },
    orderNumber: testOrderData.orderNumber,
    totalAmount: testOrderData.totalAmount,
  };

  console.log(
    "Current payload (cu fix-ul):",
    JSON.stringify(currentPayload, null, 2)
  );

  // Test API call
  try {
    const response = await fetch("/.netlify/functions/send-order-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(currentPayload),
    });

    const result = await response.text();
    console.log("Response status:", response.status);
    console.log("Response body:", result);

    if (response.ok) {
      console.log("✅ SUCCESS! Email trimis cu succes!");
    } else {
      console.log("❌ FAILED! Status:", response.status);
    }
  } catch (error) {
    console.error("❌ Eroare API:", error);
  }
}

// Run test
testEmailPayload();
