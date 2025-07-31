/**
 * Test pentru a verifica dacă problema e cu authorization header pentru LIVE
 */

async function testLiveApiAuth() {
  console.log("🔍 Testing LIVE API with different auth methods...\n");
  
  const liveEndpoint = "https://secure.netopia-payments.com/api/payment/card/start";
  const liveApiKey = "VfjsAdVjct7hQkMXRHKlimzmGGUHztw1e-C1PmvUoBlxkHs05BeWPpx0SXgV";
  
  // Test 1: Authorization cu Bearer prefix
  console.log("🧪 Test 1: Bearer authorization");
  try {
    const response1 = await fetch(liveEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${liveApiKey}`,
        "User-Agent": "LupulSiCorbul-Auth-Test/1.0",
      },
      body: JSON.stringify({}),
    });
    console.log(`Bearer: ${response1.status} ${response1.statusText}`);
  } catch (error) {
    console.log(`Bearer error: ${error.message}`);
  }

  // Test 2: Authorization fără prefix (cum avem acum)
  console.log("\n🧪 Test 2: Direct authorization");
  try {
    const response2 = await fetch(liveEndpoint, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: liveApiKey,
        "User-Agent": "LupulSiCorbul-Auth-Test/1.0",
      },
      body: JSON.stringify({}),
    });
    console.log(`Direct: ${response2.status} ${response2.statusText}`);
  } catch (error) {
    console.log(`Direct error: ${error.message}`);
  }

  // Test 3: API-Key header în loc de Authorization
  console.log("\n🧪 Test 3: API-Key header");
  try {
    const response3 = await fetch(liveEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "API-Key": liveApiKey,
        "User-Agent": "LupulSiCorbul-Auth-Test/1.0",
      },
      body: JSON.stringify({}),
    });
    console.log(`API-Key: ${response3.status} ${response3.statusText}`);
  } catch (error) {
    console.log(`API-Key error: ${error.message}`);
  }

  // Test 4: X-API-Key header
  console.log("\n🧪 Test 4: X-API-Key header");
  try {
    const response4 = await fetch(liveEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-Key": liveApiKey,
        "User-Agent": "LupulSiCorbul-Auth-Test/1.0",
      },
      body: JSON.stringify({}),
    });
    console.log(`X-API-Key: ${response4.status} ${response4.statusText}`);
  } catch (error) {
    console.log(`X-API-Key error: ${error.message}`);
  }
}

testLiveApiAuth().catch(console.error);
