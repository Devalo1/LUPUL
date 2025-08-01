/**
 * 🔧 FUNCȚIE DE DIAGNOSTIC NETLIFY
 * 
 * Funcție simplă pentru a testa că serverul Netlify Functions funcționează
 */

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('🔧 DIAGNOSTIC - Function called successfully');
    console.log('Method:', event.httpMethod);
    console.log('Headers:', event.headers);
    console.log('Query:', event.queryStringParameters);

    const diagnosticInfo = {
      success: true,
      message: 'Netlify Functions funcționează corect!',
      timestamp: new Date().toISOString(),
      method: event.httpMethod,
      userAgent: event.headers['user-agent'],
      origin: event.headers.origin,
      host: event.headers.host,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        hasNetopiaLiveSignature: !!process.env.NETOPIA_LIVE_SIGNATURE,
        hasNetopiaLiveApiKey: !!process.env.NETOPIA_LIVE_API_KEY,
        netlifyContext: context.clientContext,
        functionName: context.functionName,
        functionVersion: context.functionVersion
      }
    };

    console.log('✅ DIAGNOSTIC SUCCESS:', diagnosticInfo);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(diagnosticInfo, null, 2)
    };

  } catch (error) {
    console.error('❌ DIAGNOSTIC ERROR:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Diagnostic failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
