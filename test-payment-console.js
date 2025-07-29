// Test simple pentru verificarea fluxului de plată NETOPIA
// Rulează în consola browser-ului pe http://localhost:8888

console.log("🧪 Test NETOPIA Payment Flow");

// Simulează o comandă de test
const testOrder = {
  orderNumber: `LC-${Date.now()}`,
  customerName: "Test User",
  customerEmail: "test@lupulsicorbul.com",
  customerAddress: "Strada Test 123",
  customerCity: "București",
  customerCounty: "Bucuresti",
  customerPhone: "0723456789",
  totalAmount: 99.99,
  items: [{ name: "Produs Test", price: 99.99, quantity: 1 }],
};

// Salvează în localStorage
localStorage.setItem("pendingOrder", JSON.stringify(testOrder));
console.log("✅ Comandă de test salvată:", testOrder.orderNumber);

// Simulează redirectul NETOPIA
const returnUrl = `/.netlify/functions/netopia-return?orderId=${testOrder.orderNumber}&status=success`;
console.log("🔄 URL pentru testare:", window.location.origin + returnUrl);

// Instrucțiuni pentru testare
console.log(`
📋 Pentru a testa fluxul complet:
1. Deschide link-ul de mai sus într-un tab nou
2. Verifică că ești redirecționat către /order-confirmation
3. Verifică că localStorage pendingOrder este șters
4. Verifică că lastCompletedOrder este setat

URL pentru test: ${window.location.origin}${returnUrl}
`);

// Funcție pentru verificarea stării
window.checkPaymentStatus = function () {
  const pending = localStorage.getItem("pendingOrder");
  const completed = localStorage.getItem("lastCompletedOrder");

  console.log("📊 Status plată:");
  console.log("Pending:", pending ? JSON.parse(pending).orderNumber : "None");
  console.log(
    "Completed:",
    completed ? JSON.parse(completed).orderNumber : "None"
  );

  return { pending: !!pending, completed: !!completed };
};

console.log("💡 Rulează checkPaymentStatus() pentru a verifica starea");
