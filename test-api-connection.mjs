import { getTherapyResponse } from "./src/services/openaiService.js";

async function testAPIConnection() {
  try {
    console.log("Testing OpenAI API connection...");

    const testMessages = [
      {
        role: "system",
        content: "You are a helpful therapy assistant. Please respond briefly.",
      },
      {
        role: "user",
        content: "Hello, can you help me with anxiety?",
      },
    ];

    const response = await getTherapyResponse(testMessages);
    console.log("SUCCESS! AI Response:", response);
  } catch (error) {
    console.error("ERROR testing API:", error.message);
  }
}

testAPIConnection();
