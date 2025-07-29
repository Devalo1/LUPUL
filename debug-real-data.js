// 🔧 Debug Real User Data Recovery
console.log("🔧 DEBUGGING: Real User Data Recovery");
console.log("====================================");

// Verifică datele din sessionStorage
const sessionBackup = sessionStorage.getItem("currentOrderBackup");
console.log("📋 SessionStorage currentOrderBackup:", sessionBackup);

if (sessionBackup) {
  const data = JSON.parse(sessionBackup);
  console.log("✅ Date REALE din sessionStorage găsite:");
  console.log(
    "👤 Nume:",
    data.customerInfo.firstName,
    data.customerInfo.lastName
  );
  console.log("📧 Email REAL:", data.customerInfo.email);
  console.log("🆔 OrderID:", data.orderId);
  console.log("💰 Sumă:", data.amount);

  // Verifică dacă emailul este REAL (nu simulate)
  const isRealEmail =
    !data.customerInfo.email.includes("example.com") &&
    !data.customerInfo.email.includes("@test.com") &&
    data.customerInfo.email !== "client.recuperat@example.com";

  console.log("📧 Este email REAL?", isRealEmail);

  if (isRealEmail) {
    console.log("🎉 SUCCESS: Aceste sunt datele REALE ale clientului!");
    console.log("✅ OrderConfirmation TREBUIE să folosească aceste date!");
  } else {
    console.log("⚠️ WARNING: Emailul pare să fie de test/simulat");
  }
} else {
  console.log("❌ Nu există date în sessionStorage backup");
}

// Verifică localStorage pentru comparație
console.log("\n📋 LocalStorage check:");
console.log("currentOrder:", localStorage.getItem("currentOrder"));
console.log("pendingOrder:", localStorage.getItem("pendingOrder"));
console.log("pendingOrders:", localStorage.getItem("pendingOrders"));

// Verifică URL pentru orderID
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get("orderId");
console.log("\n🔗 URL OrderID:", orderId);

console.log(
  "\n🎯 CONCLUZIE: OrderConfirmation ar trebui să recupereze datele REALE din sessionStorage!"
);
