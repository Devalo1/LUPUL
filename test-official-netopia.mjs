#!/usr/bin/env node

/**
 * Test pentru implementarea oficială NETOPIA conform documentației
 */

import { handler } from './netlify/functions/netopia-initiate-official.mjs';

const testPayment = {
  orderId: "OFFICIAL_TEST_" + Date.now(),
  amount: 1.00, // Suma mică pentru test
  currency: "RON",
  description: "Test oficial conform documentației",
  customerInfo: {
    email: "lupulsicorbul@gmail.com",
    phone: "+40775346243",
    firstName: "Dumitru",
    lastName: "Popa",
    city: "Bucuresti",
    county: "Bucuresti",
    postalCode: "123456",
    address: "Adresa test"
  },
  environment: "sandbox", // Forțează sandbox pentru test
  forceSandbox: true
};

const testEvent = {
  httpMethod: "POST",
  body: JSON.stringify(testPayment),
  headers: {},
  isBase64Encoded: false
};

console.log('🧪 Testing NETOPIA OFFICIAL implementation...');
console.log('📋 Test payload:', testPayment);
console.log('🎯 Target: https://secure.sandbox.netopia-payments.com/payment/card/start');
console.log('🔐 Authorization: 2ZOW-PJ5X-HYYC-IENE-APZO');
console.log('');

try {
  const result = await handler(testEvent, {});
  
  console.log('✅ Function result:', {
    statusCode: result.statusCode,
    bodyLength: result.body?.length || 0,
    contentType: result.headers?.['Content-Type']
  });
  
  if (result.statusCode === 200) {
    console.log('🎉 SUCCESS - Official API works!');
    
    if (result.headers?.['Content-Type'] === 'text/html') {
      console.log('📄 HTML response received (3DS form or payment page)');
      if (result.body.includes('3D Secure')) {
        console.log('🔒 3D Secure authentication form detected');
      }
    } else {
      try {
        const jsonResult = JSON.parse(result.body);
        console.log('📡 JSON response:', {
          success: jsonResult.success,
          hasPaymentUrl: !!jsonResult.paymentUrl,
          status: jsonResult.status
        });
      } catch (e) {
        console.log('📡 Raw response:', result.body?.substring(0, 100));
      }
    }
  } else {
    console.log('❌ Error response:', result.body);
  }
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  
  // Dacă sandbox-ul nu funcționează, încearcă production cu fallback
  console.log('\n🔄 Trying production with fallback...');
  
  const productionPayment = { ...testPayment, forceSandbox: false };
  const productionEvent = {
    ...testEvent,
    body: JSON.stringify(productionPayment)
  };
  
  try {
    const prodResult = await handler(productionEvent, {});
    console.log('📊 Production result:', {
      statusCode: prodResult.statusCode,
      success: prodResult.statusCode === 200
    });
  } catch (prodError) {
    console.error('❌ Production also failed:', prodError.message);
  }
}
