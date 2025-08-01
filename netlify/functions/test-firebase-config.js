/**
 * Test Firebase Configuration
 */

export const handler = async (event, context) => {
  console.log('🔥 Testing Firebase configuration...');

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    console.log('🔧 Environment Variables Check:');
    console.log('VITE_FIREBASE_PROJECT_ID:', process.env.VITE_FIREBASE_PROJECT_ID);
    console.log('VITE_FIREBASE_AUTH_DOMAIN:', process.env.VITE_FIREBASE_AUTH_DOMAIN);
    console.log('VITE_FIREBASE_API_KEY:', process.env.VITE_FIREBASE_API_KEY ? 'SET' : 'NOT SET');

    const firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
      measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
    };

    console.log('🔥 Firebase Config to be used:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      storageBucket: firebaseConfig.storageBucket,
      hasApiKey: !!firebaseConfig.apiKey,
      hasAppId: !!firebaseConfig.appId
    });

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ 
        success: true,
        firebaseConfig: {
          projectId: firebaseConfig.projectId,
          authDomain: firebaseConfig.authDomain,
          storageBucket: firebaseConfig.storageBucket,
          hasApiKey: !!firebaseConfig.apiKey,
          hasAppId: !!firebaseConfig.appId
        },
        message: "Firebase config loaded successfully"
      }),
    };

  } catch (error) {
    console.error('🚨 Firebase config test error:', error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Firebase config test failed", details: error.message }),
    };
  }
};
