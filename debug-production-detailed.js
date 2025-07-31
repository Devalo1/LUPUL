/**
 * Test cu logging extins pentru a vedea exact ce se întâmplă în producție
 */

async function testWithDetailedLogging() {
  console.log("🔍 Testing with detailed production logging...\n");
  
  const testPayload = {
    orderId: `DEBUG-${Date.now()}`,
    amount: "49.99",
    emblemType: "corbul-mistic",
    userId: "debug-user",
    customerInfo: {
      email: "debug@example.com",
      firstName: "Debug",
      lastName: "User",
      phone: "+40712345678",
      city: "Bucharest",
      county: "Bucharest",
      postalCode: "010101",
      address: "Debug Address 123"
    },
    description: "Debug Test Emblem",
    // Nu setez live explicit să văd dacă auto-detectează
  };

  try {
    console.log('📤 Sending request with payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await fetch('https://lupulsicorbul.com/.netlify/functions/netopia-initiate-emblem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`📥 Response Status: ${response.status} ${response.statusText}`);
    
    const responseData = await response.json();
    
    // Analizez răspunsul
    console.log('\n📊 Response Analysis:');
    console.log('Environment in response:', responseData.environment);
    console.log('Payment URL:', responseData.paymentUrl);
    
    if (responseData.paymentUrl) {
      if (responseData.paymentUrl.includes('sandbox')) {
        console.log('🟡 Using SANDBOX environment');
      } else if (responseData.paymentUrl.includes('secure.netopia-payments.com')) {
        console.log('🟢 Using LIVE environment');
      }
    }
    
    // Încerc să extrag mai multe informații dacă sunt disponibile în debug
    if (responseData.debug) {
      console.log('\n🐛 Debug info from response:', responseData.debug);
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Test și cu live=true explicit
async function testWithExplicitLive() {
  console.log("\n🔍 Testing with explicit live=true...\n");
  
  const testPayload = {
    orderId: `LIVE-TEST-${Date.now()}`,
    amount: "49.99",
    emblemType: "corbul-mistic",
    userId: "live-test-user",
    customerInfo: {
      email: "live@example.com",
      firstName: "Live",
      lastName: "User",
      phone: "+40712345678",
      city: "Bucharest",
      county: "Bucharest",
      postalCode: "010101",
      address: "Live Test Address 123"
    },
    description: "Live Test Emblem",
    live: true // Explicit
  };

  try {
    const response = await fetch('https://lupulsicorbul.com/.netlify/functions/netopia-initiate-emblem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const responseData = await response.json();
    
    console.log('Environment with explicit live=true:', responseData.environment);
    console.log('Payment URL with explicit live=true:', responseData.paymentUrl);

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Rulează ambele teste
testWithDetailedLogging()
  .then(() => testWithExplicitLive())
  .catch(console.error);
