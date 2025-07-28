#!/usr/bin/env node

/**
 * 🔧 NETOPIA Sandbox Authentication Format Test
 * Testez diferite formate de autentificare pentru sandbox
 */

import crypto from 'crypto';

console.log('🔧 NETOPIA Sandbox Authentication Test');
console.log('===================================================');

const CREDENTIALS = {
  posSignature: '2ZOW-PJ5X-HYYC-IENE-APZO',
  privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQDgvgno9K9M465g14CoKE0aIvKbSqwE3EvKm6NIcVO0ZQ7za08v
Xbe508JPioYoTRM2WN7CQTQQgupiRKtyPykE3lxpCMmLqLzpcsq0wm3o9tvCnB8W
zbA2lpDre+EDcylPVyulZhrWn1Vf9sbJcFZREwMgYWewVVLwkTen92Qm5wIDAQAB
AoGAS1/xOuw1jvgdl+UvBTbfBRELhQG6R7cKxF0GmllH1Yy/QuyOljg8UlqvJLY0
4HdZJjUQIN51c8Q0j9iwF5UPUC3MgR0eQ70iislu6LGPnTnIJgbCs4QSWY/fjo08
DgTh3uDUO4bIsIFKvGbVwd86kjTARldnQ4RonKwYkv1xDIECQQDtZg9onk7gcE31
Z2QAEaUfloffY7vst4u+QUm6vZoQ+Eu4ohX3qciwN1daP5qd290OAEngOa8dtzDK
/+tgbsU3AkEA8lobdWiVZkB+1q1Rl6LEOHuxXMyQ42s1L1L1Owc8Ftw6JGT8FewZ
4lCD3U56MJSebCCqKCG32GGkO47R50aD0QJAIlnRQvcdPLajYS4btzLWbNKwSG+7
Ao6whtAVphLHV0tGUaoKebK0mmL3ndR0QAFPZDZAelR+dVNLmSQc3/BHUwJAOw1r
vWsTZEv43BR1Wi6GA4FYUVVjRJbd6b8cFBsKMEPPQwj8R9c042ldCDLUITxFcfFv
pMG6i1YXb4+4Y9NR0QJBANt0qlS2GsS9S79eWhPkAnw5qxDcOEQeekk5z5jil7yw
7J0yOEdf46C89U56v2zORfS5Due8YEYgSMRxXdY0/As=
-----END RSA PRIVATE KEY-----`
};

const testPayload = {
  "config": {
    "notifyUrl": "https://lupulsicorbul.com/.netlify/functions/netopia-notify",
    "redirectUrl": "https://lupulsicorbul.com/.netlify/functions/netopia-return",
    "language": "ro"
  },
  "payment": {
    "options": { "installments": 0, "bonus": 0 },
    "instrument": { "type": "card", "account": "", "expMonth": "", "expYear": "", "secretCode": "", "token": "" }
  },
  "order": {
    "posSignature": CREDENTIALS.posSignature,
    "dateTime": new Date().toISOString(),
    "description": "Test cu diferite auth formats",
    "orderID": "LUPUL" + Date.now(),
    "amount": 25.00,
    "currency": "RON",
    "billing": {
      "email": "lupulsicorbul@gmail.com",
      "phone": "+40775346243",
      "firstName": "Dumitru",
      "lastName": "Popa",
      "city": "Bucuresti",
      "country": 642,
      "countryName": "Romania",
      "state": "Bucuresti",
      "postalCode": "123456",
      "details": "Adresa client"
    },
    "shipping": { 
      "email": "lupulsicorbul@gmail.com",
      "phone": "+40775346243",
      "firstName": "Dumitru",
      "lastName": "Popa",
      "city": "Bucuresti",
      "country": 642,
      "countryName": "Romania",
      "state": "Bucuresti",
      "postalCode": "123456",
      "details": "Adresa client"
    },
    "products": [{
      "name": "Test Produs",
      "code": "PROD001", 
      "category": "digital",
      "price": 25.00,
      "vat": 19
    }],
    "installments": { "selected": 0, "available": [0] }
  }
};

// Test 1: Fără Authorization header (signature în payload)
async function testWithoutAuthHeader() {
  console.log('🧪 Test 1: Fără Authorization header (signature în payload)');
  
  try {
    const response = await fetch('https://secure.sandbox.netopia-payments.com/payment/card/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response: ${text.substring(0, 100)}`);
    
    if (response.status === 200) {
      console.log('✅ SUCCESS! Funcționează fără Authorization header!');
      return true;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  return false;
}

// Test 2: Cu Bearer token
async function testWithBearerToken() {
  console.log('\n🧪 Test 2: Cu Bearer token');
  
  try {
    const response = await fetch('https://secure.sandbox.netopia-payments.com/payment/card/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${CREDENTIALS.posSignature}`
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response: ${text.substring(0, 100)}`);
    
    if (response.status === 200) {
      console.log('✅ SUCCESS! Funcționează cu Bearer token!');
      return true;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  return false;
}

// Test 3: API v2 standard endpoint pentru sandbox
async function testSandboxStandardAPI() {
  console.log('\n🧪 Test 3: Sandbox cu API standard (v2)');
  
  try {
    const response = await fetch('https://secure.sandbox.netopia-payments.com/payment/card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response: ${text.substring(0, 100)}`);
    
    if (response.status === 200) {
      console.log('✅ SUCCESS! Sandbox funcționează cu API standard!');
      return true;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  return false;
}

// Rulează toate testele
const results = {
  withoutAuth: await testWithoutAuthHeader(),
  withBearer: await testWithBearerToken(),
  standardAPI: await testSandboxStandardAPI()
};

console.log('\n===================================================');
console.log('📊 REZULTATE FINALE:');
console.log(`🔓 Fără Auth Header: ${results.withoutAuth ? '✅ SUCCESS' : '❌ FAILED'}`);
console.log(`🔐 Cu Bearer Token: ${results.withBearer ? '✅ SUCCESS' : '❌ FAILED'}`);
console.log(`📡 API Standard: ${results.standardAPI ? '✅ SUCCESS' : '❌ FAILED'}`);

if (results.withoutAuth) {
  console.log('\n🎉 RECOMANDARE: Folosește endpoint-ul /start FĂRĂ Authorization header!');
} else if (results.standardAPI) {
  console.log('\n🎉 RECOMANDARE: Folosește endpoint-ul standard /card pentru sandbox!');
} else {
  console.log('\n🤔 Toate testele au eșuat - poate e nevoie de configurație specifică pentru sandbox');
}

console.log('===================================================');
