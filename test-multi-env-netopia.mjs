#!/usr/bin/env node

/**
 * Test pentru production și sandbox cu diferite configurații
 */

import { handler } from './netlify/functions/netopia-initiate-official.mjs';

const basePayment = {
  orderId: "MULTI_TEST_" + Date.now(),
  amount: 1.00,
  currency: "RON", 
  description: "Test multi-environment",
  customerInfo: {
    email: "lupulsicorbul@gmail.com",
    phone: "+40775346243",
    firstName: "Dumitru",
    lastName: "Popa",
    city: "Bucuresti",
    county: "Bucuresti",
    postalCode: "123456",
    address: "Test address"
  }
};

async function testEnvironment(name, paymentData) {
  console.log(`\n🧪 Testing ${name}...`);
  
  const testEvent = {
    httpMethod: "POST",
    body: JSON.stringify(paymentData),
    headers: {},
    isBase64Encoded: false
  };

  try {
    const result = await handler(testEvent, {});
    
    console.log(`✅ ${name} result:`, {
      statusCode: result.statusCode,
      success: result.statusCode === 200,
      bodyLength: result.body?.length || 0,
      contentType: result.headers?.['Content-Type']
    });
    
    if (result.statusCode === 200) {
      console.log(`🎉 ${name} SUCCESS!`);
      if (result.headers?.['Content-Type'] === 'text/html') {
        console.log('📄 HTML response (likely payment form)');
      } else {
        console.log('📡 JSON response preview:', result.body?.substring(0, 100));
      }
    } else {
      console.log(`❌ ${name} failed:`, result.body?.substring(0, 100));
    }
    
    return result.statusCode === 200;
    
  } catch (error) {
    console.error(`❌ ${name} error:`, error.message);
    return false;
  }
}

// Test scenarios
const scenarios = [
  {
    name: "SANDBOX FORCED",
    data: { ...basePayment, forceSandbox: true }
  },
  {
    name: "PRODUCTION AUTO",
    data: { ...basePayment, forceSandbox: false }
  },
  {
    name: "PRODUCTION EXPLICIT",
    data: { ...basePayment, environment: "production" }
  }
];

console.log('🚀 NETOPIA Multi-Environment Test');
console.log('================================');

let successCount = 0;

for (const scenario of scenarios) {
  const success = await testEnvironment(scenario.name, scenario.data);
  if (success) successCount++;
}

console.log('\n📊 FINAL RESULTS:');
console.log(`✅ Successful tests: ${successCount}/${scenarios.length}`);

if (successCount > 0) {
  console.log('🎉 At least one configuration works - ready for deployment!');
} else {
  console.log('❌ All tests failed - need to investigate API access');
}
