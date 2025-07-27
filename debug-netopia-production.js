// Test script pentru a verifica ce se întâmplă cu configurația Netopia în producție
// Adaugă acest script în browser console pentru debug

(async () => {
  console.log("🔧 Testing Netopia production configuration...");
  
  try {
    // Test debug endpoint
    const debugResponse = await fetch('/.netlify/functions/netopia-debug');
    const debugData = await debugResponse.json();
    
    console.log("🔍 Debug endpoint response:", debugData);
    
    // Test payment initiation
    const testPayload = {
      orderId: 'DEBUG_TEST_' + Date.now(),
      amount: 1,
      currency: 'RON',
      description: 'Debug test payment',
      customerInfo: {
        firstName: 'Debug',
        lastName: 'Test',
        email: 'debug@lupulsicorbul.com',
        phone: '0700000000',
        address: 'Test Address',
        city: 'Bucuresti',
        county: 'Bucuresti',
        postalCode: '010000'
      },
      live: true
    };
    
    console.log("🚀 Testing payment initiation...");
    
    const paymentResponse = await fetch('/.netlify/functions/netopia-initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    
    if (paymentResponse.ok) {
      const paymentData = await paymentResponse.text();
      console.log("✅ Payment response received:", paymentData.substring(0, 200) + "...");
      
      // Check if it's HTML (3DS form) or JSON
      if (paymentData.includes('<html') || paymentData.includes('<!doctype')) {
        console.log("📋 Response is HTML form (3DS)");
        
        // Extract endpoint from form action
        const actionMatch = paymentData.match(/action="([^"]+)"/);
        if (actionMatch) {
          console.log("🎯 Form action endpoint:", actionMatch[1]);
          
          if (actionMatch[1].includes('secure.netopia-payments.com')) {
            console.log("✅ Using LIVE Netopia endpoint");
          } else if (actionMatch[1].includes('secure-sandbox.netopia-payments.com')) {
            console.log("⚠️ Using SANDBOX Netopia endpoint");
          } else {
            console.log("❌ Unknown endpoint:", actionMatch[1]);
          }
        }
      } else {
        try {
          const jsonData = JSON.parse(paymentData);
          console.log("📋 Response is JSON:", jsonData);
        } catch (e) {
          console.log("❌ Unknown response format");
        }
      }
    } else {
      const errorText = await paymentResponse.text();
      console.error("❌ Payment initiation failed:", errorText);
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
})();
