/**
 * Script pentru testarea directă a problemei cu emailul de confirmare
 * Se concentrează pe debugging-ul comunicării dintre OrderConfirmation și send-order-email
 */

console.log(
  "🔧 DEBUGGING: Problema cu emailul de confirmare după plata cu cardul"
);
console.log("=" + "=".repeat(60));

// Simulează exact payload-ul real care ajunge la send-order-email
const realPayload = {
  orderData: {
    email: "test.client@example.com", // EMAIL EXPLICIT
    customerName: "Test Client Real",
    firstName: "Test",
    lastName: "Client",
    phone: "0700123456",
    address: "Strada Test 123",
    city: "București",
    county: "București",
    totalAmount: "50.00",
    items: [],
    paymentMethod: "Card bancar (NETOPIA Payments)",
    date: new Date().toISOString(),
  },
  orderNumber: "LC-1753821925911",
  totalAmount: "50.00",
};

console.log("📧 PAYLOAD REAL pentru send-order-email:");
console.log(JSON.stringify(realPayload, null, 2));

// Test REAL către funcția send-order-email
console.log("\n🚀 TESTARE REALĂ: Trimitere către send-order-email");

const emailEndpoint =
  "http://localhost:8888/.netlify/functions/send-order-email";
console.log("📧 Email endpoint:", emailEndpoint);

// Test cu fetch real
fetch(emailEndpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(realPayload),
})
  .then((response) => {
    console.log("📬 Response status:", response.status);
    console.log("📬 Response ok:", response.ok);
    return response.json();
  })
  .then((data) => {
    console.log("\n✅ RĂSPUNS de la send-order-email:");
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log("\n🎉 SUCCESS: Email trimis cu succes!");
      if (data.simulated) {
        console.log("⚠️  ATENȚIE: Emailul a fost SIMULAT (nu trimis real)");
        console.log("💡 Pentru emailuri reale: vezi SMTP_PASS în .env");
      } else {
        console.log("📧 Email REAL trimis către:", realPayload.orderData.email);
        console.log("📧 Customer Email ID:", data.customerEmailId);
        console.log("📧 Admin Email ID:", data.adminEmailId);
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
  });

console.log("\n" + "=".repeat(60));
console.log("🏁 Test simplu finalizat");

// Demonstrează diferența dintre payload-uri
console.log("\n🔍 COMPARAȚIE PAYLOAD-URI:");
console.log("✅ CORECT (cu email explicit):");
console.log(`   orderData.email: "${realPayload.orderData.email}"`);

console.log("\n❌ POSIBILĂ PROBLEMĂ (fără email în orderData):");
const problematicPayload = {
  orderData: {
    // LIPSĂ: email: "...",
    customerName: "Test Client",
    firstName: "Test",
    lastName: "Client",
    // ... alte câmpuri
  },
  orderNumber: "LC-1753821925911",
  totalAmount: "50.00",
};
console.log(
  `   orderData.email: "${problematicPayload.orderData.email}" (undefined!)`
);

console.log("\n💡 SOLUȚIA: Verifică că OrderConfirmation.tsx setează corect:");
console.log(`   orderData.email: orderData.customerEmail`);
console.log(`   în payload-ul trimis către send-order-email`);

console.log("\n" + "=".repeat(60));
