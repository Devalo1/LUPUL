/**
 * Script pentru simularea completă a fluxului real de plată cu cardul
 * Include toate etapele: PaymentPage → NETOPIA → OrderConfirmation
 */

// 1. Simulez datele salvate de PaymentPage înainte de redirecționarea către NETOPIA
const paymentPageData = {
  orderId: "LC-1753821925911",
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

console.log("💳 STEP 1: PaymentPage salvează datele în localStorage");
console.log("Salvez în localStorage['currentOrder']:", paymentPageData);

// 2. Simulez revenirea de la NETOPIA cu parametrii în URL
const netopiReturnUrl =
  "http://localhost:8888/order-confirmation?orderId=LC-1753821925911&status=success";
console.log("\n🔙 STEP 2: NETOPIA redirecționează către:", netopiReturnUrl);

// 3. Simulez ce face OrderConfirmation când se încarcă
console.log("\n📄 STEP 3: OrderConfirmation component se încarcă");

// Simulez extragerea parametrilor din URL (ca în OrderConfirmation)
const urlParams = new URLSearchParams(
  "?orderId=LC-1753821925911&status=success"
);
const orderId = urlParams.get("orderId");
const status = urlParams.get("status");

console.log("   URL orderId:", orderId);
console.log("   URL status:", status);

// Simulez verificarea în localStorage (ca în OrderConfirmation)
const currentOrderStr = JSON.stringify(paymentPageData);
console.log("   Găsesc în localStorage['currentOrder']:", currentOrderStr);

try {
  const currentOrder = JSON.parse(currentOrderStr);
  console.log("   Parsed currentOrder.orderId:", currentOrder.orderId);
  console.log("   Match cu URL orderId:", currentOrder.orderId === orderId);

  if (currentOrder.orderId === orderId) {
    // Adaptez datele ca în OrderConfirmation.tsx
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

    console.log("\n✅ STEP 4: Date adaptate pentru email");
    console.log("   orderData.customerEmail:", orderData.customerEmail);
    console.log("   orderData.customerName:", orderData.customerName);

    // Creez payload-ul EXACT ca în OrderConfirmation.tsx
    const emailPayload = {
      orderData: {
        email: orderData.customerEmail, // ⭐ CHEIA PROBLEMEI!
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

    console.log("\n📧 STEP 5: Payload pentru send-order-email");
    console.log(
      "   emailPayload.orderData.email:",
      emailPayload.orderData.email
    );
    console.log("   emailPayload.orderNumber:", emailPayload.orderNumber);

    if (!emailPayload.orderData.email) {
      console.log("\n❌ PROBLEMĂ GĂSITĂ: orderData.email este undefined!");
      console.log(
        "   Cauza: orderData.customerEmail este:",
        orderData.customerEmail
      );
      console.log(
        "   Cauza root: currentOrder.customerInfo?.email este:",
        currentOrder.customerInfo?.email
      );
    } else {
      console.log("\n✅ Email corect în payload, continuăm cu trimiterea...");

      // Test real către send-order-email
      const emailEndpoint =
        "http://localhost:8888/.netlify/functions/send-order-email";

      fetch(emailEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("\n🎯 STEP 6: Rezultat final");
          if (data.success) {
            console.log("   ✅ Email trimis cu succes!");
            console.log("   📧 Customer email ID:", data.customerEmailId);
            console.log("   📧 Admin email ID:", data.adminEmailId);
          } else {
            console.log("   ❌ Eroare:", data.error);
          }
        })
        .catch((error) => {
          console.log("\n   💥 Eroare fetch:", error.message);
        });
    }
  }
} catch (error) {
  console.log("❌ Eroare parsing:", error.message);
}

console.log("\n" + "=".repeat(60));
console.log("🔚 Simulare completă finalizată");

// Sugestii de debugging
console.log("\n💡 DEBUGGING TIPS:");
console.log("1. Verifică că PaymentPage salvează corect customerInfo.email");
console.log("2. Verifică că OrderConfirmation citește corect din localStorage");
console.log("3. Verifică că adaptarea datelor păstrează emailul");
console.log(
  "4. Verifică că payload-ul trimis către send-order-email conține email-ul"
);
