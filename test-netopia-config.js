import { netopiaConfigTest } from "../src/utils/netopiaConfigTest";

/**
 * Script rapid pentru testarea configurației NETOPIA
 * Rulează: node test-netopia-config.js
 */

console.log("🚀 Starting NETOPIA Configuration Test...\n");

// Import și rulare test
import("../src/utils/netopiaConfigTest.ts")
  .then(() => {
    console.log("\n📊 Test Results:");
    console.log(JSON.stringify(netopiaConfigTest, null, 2));

    if (netopiaConfigTest.fallbackToSandbox) {
      console.log("\n🚨 ACTION REQUIRED:");
      console.log(
        "Set up live credentials in Netlify to enable production payments!"
      );
    }
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
  });
