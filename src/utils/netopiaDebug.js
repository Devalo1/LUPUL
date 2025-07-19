// Debug test pentru Netopia în browser console
// Shim process.env for browser environment
if (typeof process === "undefined") {
  window.process = { env: import.meta.env };
}
console.log("🔍 Netopia Environment Debug");
console.log("============================");

console.log("Frontend Environment Variables:");
console.log(
  "- VITE_PAYMENT_LIVE_KEY:",
  import.meta.env.VITE_PAYMENT_LIVE_KEY ? "SET" : "NOT SET"
);
console.log(
  "- VITE_NETOPIA_PUBLIC_KEY:",
  import.meta.env.VITE_NETOPIA_PUBLIC_KEY ? "SET" : "NOT SET"
);

console.log("\nBrowser Environment:");
console.log("- Hostname:", window.location.hostname);
console.log("- Is Production:", window.location.hostname !== "localhost");

// Test configurație
import("../services/netopiaPayments").then(({ netopiaService }) => {
  console.log("\nNetopia Service Configuration:");
  console.log("Service config:", netopiaService);
});

console.log("\n💡 Open DevTools Network tab and test payment to see requests");
