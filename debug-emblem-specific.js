/**
 * Test specific pentru debugging diferite tipuri de embleme
 * Pentru a înțelege de ce "corbul mistic" funcționează dar altele nu
 */

const EMBLEM_TYPES = [
  "corbul-mistic",
  "lupul-cosmic",
  "vulturul-de-foc",
  "ursul-lunar",
  "tigrul-de-cristal",
];

async function testEmblemTypes() {
  console.log("🔮 Testing different emblem types...\n");

  for (const emblemType of EMBLEM_TYPES) {
    console.log(`\n🧪 Testing: ${emblemType}`);

    const testPayload = {
      orderId: `TEST-${emblemType}-${Date.now()}`,
      amount: "49.99",
      emblemType: emblemType,
      userId: "test-user-123",
      customerInfo: {
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        phone: "+40712345678",
        city: "Bucharest",
        county: "Bucharest",
        postalCode: "010101",
        address: "Test Address 123",
      },
      description: `Emblem ${emblemType}`,
      // Test și cu live=true explicit
      live: true,
    };

    try {
      const response = await fetch(
        "https://lupulsicorbul.com/.netlify/functions/netopia-initiate-emblem",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testPayload),
        }
      );

      console.log(`Status: ${response.status} ${response.statusText}`);

      const responseText = await response.text();

      try {
        const responseData = JSON.parse(responseText);
        console.log(`✅ JSON Response:`, {
          success: responseData.success,
          paymentUrl: responseData.paymentUrl ? "Present" : "Missing",
          message: responseData.message,
          environment: responseData.debug?.environment,
          useLive: responseData.debug?.useLive,
        });
      } catch (e) {
        console.log(`❌ Non-JSON Response:`, responseText.substring(0, 200));
      }
    } catch (error) {
      console.error(`❌ Request failed:`, error.message);
    }

    console.log("---");
  }
}

// Rulează testul
testEmblemTypes().catch(console.error);
