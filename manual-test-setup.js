console.log("🧪 Manual Test pentru localStorage Fix");

// Creez date de test exact cum le salvează Checkout.tsx
const testOrderId = "LC-1753818800000";
const testData = {
  orderNumber: testOrderId,
  customerName: "Dani Test Manual",
  customerEmail: "dani_popa21@yahoo.ro",
  customerPhone: "0775346243",
  customerAddress: "9 MAI BLOC 2 A",
  customerCity: "PETROSANI",
  customerCounty: "HUNEDOARA",
  customerPostalCode: "800258",
  totalAmount: 35.0,
  subtotal: 25.0,
  shippingCost: 10.0,
  items: [
    {
      id: "test-product-1",
      name: "Produs Test NETOPIA Manual",
      price: 25.0,
      quantity: 1,
      image: "/test-image.jpg",
    },
  ],
  paymentMethod: "card",
  paymentStatus: "pending",
  date: new Date().toISOString(),
};

// Salvez în localStorage
localStorage.setItem("pendingOrder", JSON.stringify(testData));

console.log("✅ Test data salvată în localStorage");
console.log("📋 Order ID:", testOrderId);
console.log("👤 Customer:", testData.customerName, testData.customerEmail);
console.log("💰 Total:", testData.totalAmount, "RON");

console.log("");
console.log("🔗 Link pentru test:");
console.log(
  `http://localhost:8888/order-confirmation?orderId=${testOrderId}&status=success`
);

console.log("");
console.log("📝 Instrucțiuni:");
console.log("1. Copiază și rulează acest script în consola browser-ului");
console.log("2. Deschide link-ul de mai sus într-un tab nou");
console.log("3. Verifică că pagina se încarcă corect");
console.log("4. Verifică în consola paginii pentru log-urile de debug");
console.log(
  "5. Verifică că localStorage['pendingOrder'] este șters după procesare"
);

// Funcție pentru verificare rapidă
window.checkTestResult = function () {
  const pending = localStorage.getItem("pendingOrder");
  const orderData = pending ? JSON.parse(pending) : null;

  console.log("📊 Status check:");
  console.log("Pending order:", orderData ? orderData.orderNumber : "None");
  console.log("Customer email:", orderData ? orderData.customerEmail : "N/A");
  console.log("Total amount:", orderData ? orderData.totalAmount : "N/A");

  return {
    hasPendingOrder: !!pending,
    orderData: orderData,
  };
};

console.log("");
console.log("💡 Rulează checkTestResult() pentru a verifica starea");
