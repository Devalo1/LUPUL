/**
 * Debug script to test Netopia payment initiation and identify blank page issue
 */

import https from 'https';

// Test payload similar to what would come from checkout
const testPayment = {
  orderId: 'DEBUG_' + Date.now(),
  amount: 100,
  currency: 'RON',
  description: 'Debug test payment - blank page issue',
  customerInfo: {
    firstName: 'Test',
    lastName: 'Customer',
    email: 'test@lupulsicorbul.com',
    phone: '0700000000',
    address: 'Test Address',
    city: 'Bucuresti',
    county: 'Bucuresti',
    postalCode: '010000'
  },
  posSignature: '2ZOW-PJ5X-HYYC-IENE-APZO',
  live: true
};

console.log('🔍 DEBUG: Testing Netopia payment initiation');
console.log('📋 Payload:', testPayment);

// Test the netopia-initiate function
const postData = JSON.stringify(testPayment);

const options = {
  hostname: 'lupulsicorbul.com',
  path: '/.netlify/functions/netopia-initiate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'Debug-Script/1.0'
  }
};

console.log('🚀 Making request to:', `https://${options.hostname}${options.path}`);

const req = https.request(options, (res) => {
  console.log('📡 Response Status:', res.statusCode);
  console.log('📋 Response Headers:', res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Response Length:', data.length);
    console.log('📄 Response Preview (first 500 chars):', data.substring(0, 500));
    
    // Check for common patterns
    if (data.length === 0) {
      console.log('❌ ISSUE FOUND: Empty response (this could cause about:blank)');
    } else if (data.includes('about:blank')) {
      console.log('❌ ISSUE FOUND: Response contains about:blank');
    } else if (data.includes('<html')) {
      console.log('✅ HTML response detected');
      
      // Check if it's a proper payment form
      if (data.includes('<form') && data.includes('netopia')) {
        console.log('✅ Payment form detected in response');
      } else if (data.includes('card.svg')) {
        console.log('⚠️  SVG redirect detected (this might cause blank page)');
      } else {
        console.log('⚠️  HTML response but no clear payment form');
      }
    } else {
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ JSON response:', jsonData);
        
        if (jsonData.paymentUrl) {
          console.log('💳 Payment URL:', jsonData.paymentUrl);
          
          if (jsonData.paymentUrl === 'about:blank' || jsonData.paymentUrl.includes('about:blank')) {
            console.log('❌ ISSUE FOUND: paymentUrl is about:blank');
          }
        }
      } catch (e) {
        console.log('❌ Response is neither HTML nor valid JSON');
        console.log('Raw response:', data);
      }
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.write(postData);
req.end();
