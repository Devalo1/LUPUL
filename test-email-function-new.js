/**
 * Test script pentru funcția de trimitere email - versiune nouă
 */

const fetch = require("node-fetch");

async function testEmailFunction() {
  console.log("🧪 Testez funcția de trimitere email...");

  const testData = {
    orderData: {
      email: "test@lupulsicorbul.com",
      name: "Ion Popescu",
      firstName: "Ion",
      lastName: "Popescu",
      phone: "0712345678",
      address: "Str. Test 123",
      city: "București",
      county: "București",
      postalCode: "010000",
      items: [
        {
          id: "1",
          name: "Miere de salcâm 500g",
          price: 25.5,
          quantity: 2,
        },
        {
          id: "2",
          name: "Afine deshidratate 200g",
          price: 18.0,
          quantity: 1,
        },
      ],
    },
    orderNumber: `TEST-${Date.now()}`,
    totalAmount: 69.0,
  };

  try {
    // Test local development
    const localUrl =
      "http://localhost:8888/.netlify/functions/send-order-email";

    console.log("📡 Trimit cerere test la:", localUrl);
    console.log("📦 Date test:", JSON.stringify(testData, null, 2));

    const response = await fetch(localUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    console.log("📊 Status răspuns:", response.status);
    console.log(
      "📋 Headers răspuns:",
      Object.fromEntries(response.headers.entries())
    );

    const responseText = await response.text();
    console.log("📄 Răspuns text:", responseText);

    let result;
    try {
      result = JSON.parse(responseText);
      console.log("✅ Răspuns JSON parsuat:", result);
    } catch (parseError) {
      console.error("❌ Eroare parsare JSON:", parseError);
      result = { error: "Răspuns invalid", raw: responseText };
    }

    if (result.success) {
      console.log("🎉 TEST REUȘIT!");
      console.log("📧 Email client:", result.customerEmail);
      console.log("📧 Email admin:", result.adminEmail);
      if (result.development) {
        console.log("🔧 Mod dezvoltare - emailurile au fost simulate");
      } else {
        console.log("📨 Emailuri trimise real - ID-uri:", {
          customer: result.customerEmailId,
          admin: result.adminEmailId,
        });
      }
    } else {
      console.log("❌ TEST EȘUAT!");
      console.log("Eroare:", result.error);
      console.log("Detalii:", result.details);
    }
  } catch (error) {
    console.error("❌ Eroare în test:", error);
  }
}

// Rulează testul
testEmailFunction();
