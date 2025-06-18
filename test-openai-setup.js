// Test script to verify OpenAI API setup
// Run this after you've added your real API key to .env

const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testOpenAIConnection() {
  console.log('🔍 Testing OpenAI API setup...\n');
  
  // Read environment file
  const envPath = path.join(__dirname, '.env');
  
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    let apiKey = '';
    
    for (const line of lines) {
      if (line.startsWith('VITE_OPENAI_API_KEY=') && !line.includes('#')) {
        apiKey = line.split('=')[1].trim();
        break;
      }
    }
    
    console.log(`📝 API Key found: ${apiKey ? 'YES' : 'NO'}`);
    console.log(`📝 API Key starts correctly: ${apiKey?.startsWith('sk-') ? 'YES' : 'NO'}`);
    console.log(`📝 API Key length: ${apiKey?.length || 0} characters\n`);
    
    if (!apiKey || apiKey === 'your-openai-api-key-here') {
      console.log('❌ PROBLEMA: Cheia API nu este configurată!');
      console.log('📚 Pași pentru rezolvare:');
      console.log('   1. Mergi la https://platform.openai.com/api-keys');
      console.log('   2. Creează o cheie nouă (începe cu sk-)');
      console.log('   3. Înlocuiește "your-openai-api-key-here" în fișierul .env');
      console.log('   4. Rulează din nou acest test\n');
      return;
    }
    
    if (!apiKey.startsWith('sk-')) {
      console.log('❌ PROBLEMA: Cheia API nu pare validă (ar trebui să înceapă cu "sk-")');
      return;
    }
    
    // Test API connection
    console.log('🌐 Testing API connection...');
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful therapy assistant. Respond briefly.'
          },
          {
            role: 'user',
            content: 'Hello, this is a test message.'
          }
        ],
        max_tokens: 50,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ SUCCESS! OpenAI API is working correctly!');
    console.log(`📤 Test response: "${response.data.choices[0].message.content.trim()}"`);
    console.log('\n🎉 Your therapy AI is ready to use!');
    console.log('🔗 Open: http://localhost:3000/terapie/psihica');
    
  } catch (error) {
    console.log('❌ ERROR testing OpenAI API:');
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.error?.message || 'Unknown error'}`);
      
      if (error.response.status === 401) {
        console.log('\n💡 Looks like an authentication error. Please check:');
        console.log('   - Is your API key correct?');
        console.log('   - Do you have credits in your OpenAI account?');
      }
      
      if (error.response.status === 429) {
        console.log('\n💡 Rate limit exceeded. Please wait a moment and try again.');
      }
      
    } else {
      console.log(`   ${error.message}`);
    }
    
    console.log('\n📚 Need help? Check: https://platform.openai.com/docs');
  }
}

testOpenAIConnection();
