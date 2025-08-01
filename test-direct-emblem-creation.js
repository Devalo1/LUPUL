/**
 * Test direct pentru crearea emblemelor in Firebase
 * Bypass pentru testare rapidă
 */

console.log('🔮 Testing direct emblem creation...');

const testPayload = {
  userId: 'test-user-123',
  emblems: [
    {
      type: 'protection',
      name: 'Emblemă de Protecție Test'
    },
    {
      type: 'power', 
      name: 'Emblemă de Putere Test'
    },
    {
      type: 'wisdom',
      name: 'Emblemă de Înțelepciune Test'
    }
  ]
};

async function testDirectEmblemCreation() {
  try {
    console.log('📤 Sending test payload to create-emblems-direct...');
    console.log('📦 Payload:', JSON.stringify(testPayload, null, 2));

    const response = await fetch('http://localhost:8888/.netlify/functions/create-emblems-direct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DirectEmblemTest/1.0',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📥 Response body:', responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ Test completed successfully!');
      console.log(`🔮 Created ${data.emblems.length} emblems for user ${data.userId}`);
      console.log('🔮 Emblem details:', data.emblems);
      console.log('');
      console.log('🌐 Now check:');
      console.log('📖 My Orders: http://localhost:8888/my-orders');
      console.log('🏪 Marketplace: http://localhost:8888/emblems/marketplace');
    } else {
      console.log('❌ Test failed with status:', response.status);
    }

  } catch (error) {
    console.error('🚨 Test error:', error);
  }
}

testDirectEmblemCreation();
