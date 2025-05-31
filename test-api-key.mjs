// Test script to verify OpenAI API key and connection
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the .env.local file
const envPath = join(__dirname, ".env.local");
try {
  const envContent = readFileSync(envPath, "utf8");
  console.log("Environment file content:");
  console.log(envContent);

  const lines = envContent.split("\n");
  const envVars = {};

  lines.forEach((line) => {
    if (line.trim() && !line.startsWith("#")) {
      const [key, value] = line.split("=");
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    }
  });

  console.log("\nParsed environment variables:");
  console.log(envVars);

  const apiKey = envVars.VITE_OPENAI_API_KEY;
  console.log(`\nAPI Key present: ${apiKey ? "YES" : "NO"}`);
  console.log(`API Key length: ${apiKey ? apiKey.length : 0}`);
  console.log(
    `API Key starts with sk-: ${apiKey ? apiKey.startsWith("sk-") : "NO"}`
  );
} catch (error) {
  console.error("Error reading .env.local file:", error);
}
