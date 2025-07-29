/**
 * Script de debug pentru testarea trimiterii emailului după plata cu cardul
 * Simulează fluxul complet: plată cu cardul → localStorage → OrderConfirmation → email
 */

console.log("🔍 DEBUGGING: Testare email după plata cu cardul");
console.log("=" + "=".repeat(60));

// Simulează datele salvate în localStorage de PaymentPage după plata cu cardul
const testCurrentOrder = {
  orderId: "LC-1753821925911", // Order ID-ul din URL-ul tău
  amount: "50.00",
  description: "Emblemă Digitală Lupul și Corbul",
  customerInfo: {
    firstName: "Test",
    lastName: "Client",
    email: "test@example.com",
    phone: "0700123456",
    address: "Strada Test 123",
    city: "București",
    county: "București",
    postalCode: "123456",
  },
};

console.log("📦 1. SIMULARE: Salvare în localStorage (PaymentPage)");
console.log("   Cheia: currentOrder");
console.log("   Valoarea:", JSON.stringify(testCurrentOrder, null, 2));

// Simulează ce face OrderConfirmation când citește din localStorage
console.log("\n🔍 2. SIMULARE: Citire din localStorage (OrderConfirmation)");

const currentOrderStr = JSON.stringify(testCurrentOrder);
console.log("   Reading currentOrder:", currentOrderStr);

// Simulează logica din OrderConfirmation.tsx
const orderId = "LC-1753821925911"; // Din URL
const currentOrder = JSON.parse(currentOrderStr);

console.log(
  "   Comparing orderId:",
  currentOrder.orderId,
  "vs orderId:",
  orderId
);
console.log("   Matches:", currentOrder.orderId === orderId);

if (currentOrder.orderId === orderId) {
  // Adaptarea datelor pentru structura așteptată de send-order-email
  const orderData = {
    orderNumber: currentOrder.orderId,
    customerEmail: currentOrder.customerInfo?.email,
    customerName:
      currentOrder.customerInfo?.firstName +
      " " +
      currentOrder.customerInfo?.lastName,
    customerPhone: currentOrder.customerInfo?.phone,
    customerAddress: currentOrder.customerInfo?.address,
    customerCity: currentOrder.customerInfo?.city,
    customerCounty: currentOrder.customerInfo?.county,
    totalAmount: currentOrder.amount,
    items: [],
    paymentMethod: "card",
    date: new Date().toISOString(),
  };

  console.log("\n✅ 3. ADAPTAT: Date pentru send-order-email");
  console.log("   orderData:", JSON.stringify(orderData, null, 2));

  // Simulează payload-ul trimis către send-order-email
  const emailPayload = {
    orderData: {
      email: orderData.customerEmail,
      customerName: orderData.customerName,
      firstName:
        orderData.customerName?.split(" ")[0] ||
        orderData.firstName ||
        "Client",
      lastName:
        orderData.customerName?.split(" ").slice(1).join(" ") ||
        orderData.lastName ||
        "",
      phone: orderData.customerPhone,
      address: orderData.customerAddress,
      city: orderData.customerCity,
      county: orderData.customerCounty,
      totalAmount: orderData.totalAmount,
      items: orderData.items || [],
      paymentMethod: "Card bancar (NETOPIA Payments)",
      date: orderData.date,
    },
    orderNumber: orderData.orderNumber,
    totalAmount: orderData.totalAmount,
  };

  console.log("\n📧 4. PAYLOAD pentru send-order-email:");
  console.log(JSON.stringify(emailPayload, null, 2));

  // Test REAL către funcția send-order-email
  console.log("\n🚀 5. TESTARE REALĂ: Trimitere către send-order-email");

  // Detectare origine pentru Netlify Functions
  const origin = "http://localhost:8888"; // Pentru dezvoltare locală
  const emailEndpoint = `${origin}/.netlify/functions/send-order-email`;

  console.log("📧 Email endpoint:", emailEndpoint);

  // Efectuează cererea reală
  fetch(emailEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailPayload),
  })
    .then((response) => {
      console.log("📬 Response status:", response.status);
      console.log("📬 Response ok:", response.ok);
      return response.json();
    })
    .then((data) => {
      console.log("\n✅ 6. RĂSPUNS de la send-order-email:");
      console.log(JSON.stringify(data, null, 2));

      if (data.success) {
        console.log("\n🎉 SUCCESS: Email trimis cu succes!");
        if (data.simulated) {
          console.log("⚠️  ATENȚIE: Emailul a fost SIMULAT (nu trimis real)");
          console.log("💡 Pentru emailuri reale: vezi SMTP_PASS în .env");
        } else {
          console.log("📧 Email REAL trimis către:", data.customerEmail);
        }
      } else {
        console.log("\n❌ ERROR: Nu s-a putut trimite emailul");
        console.log("Eroare:", data.error);
        console.log("Detalii:", data.details);
      }
    })
    .catch((error) => {
      console.error("\n💥 EROARE FETCH:", error);
      console.log("🔧 Verifică dacă funcția send-order-email rulează local");
      console.log("🔧 Rulează: netlify dev");
    });
} else {
  console.log("\n❌ Order ID nu se potrivește - nu se va trimite emailul");
}

console.log("\n" + "=".repeat(60));
console.log("🏁 Test finalizat");
