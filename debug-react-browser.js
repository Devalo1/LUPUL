// Test pentru verificarea React warnings în browser
// Adaugă acest script în console browser pentru debugging

(function testReactDevelopmentMode() {
  console.log("🧪 React Development Mode Debugging");
  console.log("====================================");

  // Verifică variabilele de medciu
  console.log("Environment Check:");
  console.log(
    "- process.env.NODE_ENV:",
    typeof process !== "undefined" ? process.env?.NODE_ENV : "undefined"
  );
  console.log(
    "- window.process.env.NODE_ENV:",
    window.process?.env?.NODE_ENV || "undefined"
  );
  console.log(
    "- __DEV__:",
    typeof __DEV__ !== "undefined" ? __DEV__ : "undefined"
  );
  console.log("- window.__DEV__:", window.__DEV__ || "undefined");

  // Verifică React
  if (typeof React !== "undefined") {
    console.log("\nReact Check:");
    console.log("- React version:", React.version);
    console.log(
      "- React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentBatchConfig:",
      React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
        ?.ReactCurrentBatchConfig
    );
  } else {
    console.log("\nReact not found in global scope");
  }

  // Verifică pentru hook.js erori
  console.log("\nLooking for React production warnings...");

  // Interceptează console.error pentru a detecta React warnings
  const originalError = console.error;
  let reactWarningDetected = false;

  console.error = function (...args) {
    const message = args.join(" ");
    if (
      message.includes("React is running in production mode") ||
      message.includes("dead code elimination has not been applied")
    ) {
      reactWarningDetected = true;
      console.log("❌ React production warning detected:", message);
    }
    originalError.apply(console, args);
  };

  // Restore după 5 secunde
  setTimeout(() => {
    console.error = originalError;
    if (!reactWarningDetected) {
      console.log(
        "✅ No React production warnings detected in the last 5 seconds"
      );
    } else {
      console.log(
        "❌ React production warnings were detected - configuration needs adjustment"
      );
    }
    console.log("🏁 React debugging test complete");
  }, 5000);

  console.log("⏱️  Monitoring for React warnings for 5 seconds...");
})();
