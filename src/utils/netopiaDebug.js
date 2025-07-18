// Debug test pentru Netopia în browser console
console.log("🔍 Netopia Environment Debug");
console.log("============================");

console.log("Frontend Environment Variables:");
console.log(
  "- REACT_APP_NETOPIA_SIGNATURE_LIVE:",
  process.env.REACT_APP_NETOPIA_SIGNATURE_LIVE ? "SET" : "NOT SET"
);
console.log(
  "- REACT_APP_NETOPIA_PUBLIC_KEY:",
  process.env.REACT_APP_NETOPIA_PUBLIC_KEY ? "SET" : "NOT SET"
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
