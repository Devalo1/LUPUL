// Script pentru a verifica salvarea datelor în PaymentPage
// Să debuggez de ce PaymentPage nu salvează datele în sessionStorage

console.log("🔍 PaymentPage Data Saving Debug");

// Simulează ce se întâmplă în PaymentPage
const mockFormData = {
  firstName: "Dani_popa21",
  lastName: "Lupul",
  email: "dani_popa21@yahoo.ro",
  phone: "0775346243",
  address: "9 MAI BLOC 2 A",
  city: "PETROSANI",
  county: "HUNEDOARA",
  postalCode: "800258",
  amount: "35.00",
  description: "Comandă Lupul și Corbul - 1 produse (35.00 RON)",
};

const orderId = "LC-1753825745688";

console.log("📦 Date care ar trebui salvate în sessionStorage:");

// Formatul care se salvează în PaymentPage
const sessionStorageFormat = {
  orderId: orderId,
  amount: mockFormData.amount,
  description: mockFormData.description,
  customerInfo: {
    firstName: mockFormData.firstName,
    lastName: mockFormData.lastName,
    email: mockFormData.email,
    phone: mockFormData.phone,
    address: mockFormData.address,
    city: mockFormData.city,
    county: mockFormData.county,
    postalCode: mockFormData.postalCode,
  },
  timestamp: new Date().toISOString(),
  source: "PaymentPage",
};

console.log(
  "💾 SessionStorage format (PaymentPage):",
  JSON.stringify(sessionStorageFormat, null, 2)
);

// Formatul pe care îl caută OrderConfirmation
const orderConfirmationExpected = {
  orderId: orderId,
  customerInfo: {
    firstName: mockFormData.firstName,
    lastName: mockFormData.lastName,
    email: mockFormData.email,
    phone: mockFormData.phone,
    address: mockFormData.address,
    city: mockFormData.city,
    county: mockFormData.county,
  },
  amount: parseFloat(mockFormData.amount),
  description: mockFormData.description,
  timestamp: new Date().toISOString(),
};

console.log(
  "🔍 OrderConfirmation expected format:",
  JSON.stringify(orderConfirmationExpected, null, 2)
);

console.log("\n🚨 PROBLEME POTENȚIALE:");
console.log("1. PaymentPage salvează datele ÎNAINTE de redirect către NETOPIA");
console.log("2. Browser-ul poate șterge sessionStorage la redirect extern");
console.log("3. NETOPIA redirect înapoi poate pierde context");

console.log("\n✅ SOLUȚII:");
console.log("1. Salvare date în localStorage ÎN PLUS față de sessionStorage");
console.log("2. Salvare date în funcția NETOPIA return handler");
console.log("3. Persistență mai robustă prin cookie sau server");

console.log("\n🔧 DEBUGGING TIPS:");
console.log("1. Verifică browser Console în PaymentPage înainte de redirect");
console.log(
  "2. Verifică ce există în sessionStorage după return de la NETOPIA"
);
console.log("3. Urmărește dacă redirect-ul extern șterge sessionStorage");
