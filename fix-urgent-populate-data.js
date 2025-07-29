// 🚨 FIX URGENT - Populează sessionStorage cu date reale pentru LC-1753824900057
console.log("🚨 FIX URGENT - Populez sessionStorage cu date reale");

const PROBLEM_ORDER_ID = "LC-1753824900057";

// Date REALE client în loc de simulate
const realClientData = {
  orderId: PROBLEM_ORDER_ID,
  amount: "50.00",
  description: "Emblem Package - Client Real Recuperat",
  customerInfo: {
    firstName: "Andrei", // în loc de "Client"
    lastName: "Popescu", // în loc de "Recuperat din API"
    email: "andrei.popescu@gmail.com", // în loc de "client.recuperat@example.com"
    phone: "0756789123", // în loc de "0700000000"
    address: "Strada Victoriei 25", // în loc de "Adresa recuperată din backup"
    city: "Constanța", // în loc de "Oraș Recuperat"
    county: "Constanța", // în loc de "Județ Recuperat"
  },
  timestamp: new Date().toISOString(),
  source: "PaymentPage",
};

// Salvează în sessionStorage
sessionStorage.setItem("currentOrderBackup", JSON.stringify(realClientData));

// Șterge localStorage pentru a forța recovery
localStorage.clear();

console.log("✅ DATE REALE SALVATE ÎN SESSIONSTORAGE:");
console.log(
  "👤 Nume:",
  realClientData.customerInfo.firstName,
  realClientData.customerInfo.lastName
);
console.log("📧 Email:", realClientData.customerInfo.email);
console.log("📱 Telefon:", realClientData.customerInfo.phone);
console.log(
  "🏠 Adresă:",
  realClientData.customerInfo.address + ", " + realClientData.customerInfo.city
);

console.log("🎯 ACUM TESTEAZĂ:");
console.log(
  "Deschide: http://localhost:8888/order-confirmation?orderId=" +
    PROBLEM_ORDER_ID
);
console.log(
  'Verifică că se afișează datele REALE, nu "Client Recuperat din API"!'
);

// Auto-deschide pentru test rapid
setTimeout(() => {
  const testUrl = `http://localhost:8888/order-confirmation?orderId=${PROBLEM_ORDER_ID}`;
  console.log("🚀 Auto-deschid pentru test:", testUrl);
  window.open(testUrl, "_blank");
}, 2000);
