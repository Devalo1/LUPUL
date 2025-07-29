// Test pentru verificarea configurației React development mode
console.log("🔧 Testing React Development Mode Configuration");
console.log("==============================================");

// Verifică variabilele de mediu
console.log("Environment Variables:");
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log(
  "- __DEV__:",
  typeof __DEV__ !== "undefined" ? __DEV__ : "undefined"
);
console.log(
  "- process.env.REACT_APP_NODE_ENV:",
  process.env.REACT_APP_NODE_ENV
);

// În browser, verifică window globals
if (typeof window !== "undefined") {
  console.log("\nBrowser Globals:");
  console.log("- window.process.env.NODE_ENV:", window.process?.env?.NODE_ENV);
  console.log("- window.__DEV__:", window.__DEV__);
}

// Test React detection
try {
  const React = require("react");
  console.log("\nReact Configuration:");
  console.log("- React version:", React.version);
  console.log(
    "- React development mode active:",
    process.env.NODE_ENV === "development"
  );
} catch (e) {
  console.log(
    "\nReact not available in Node.js context (normal for config test)"
  );
}

console.log("\n✅ Configuration Test Complete");
console.log('Expected: All environment variables should show "development"');
console.log(
  "Expected: React should detect development mode and not show production warnings"
);
