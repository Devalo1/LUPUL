export const handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  // Pentru debugging și testare, permitem și GET requests
  if (event.httpMethod === "GET") {
    const testResponse = `
    <!DOCTYPE html>
    <html lang="ro">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Netopia Notify Endpoint</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 8px; max-width: 600px; }
            .status { padding: 15px; border-radius: 5px; margin: 20px 0; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
            .info { background: #cce7ff; border: 1px solid #99d6ff; color: #004085; }
            pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔔 Netopia Notify Endpoint</h1>
            
            <div class="status success">
                ✅ Endpoint-ul funcționează corect!
            </div>
            
            <div class="status info">
                <strong>ℹ️ Informații:</strong><br>
                • Acest endpoint este destinat pentru notificările IPN de la Netopia<br>
                • Netopia va trimite POST requests aici când statusul plății se schimbă<br>
                • Pentru testare, puteți folosi această pagină
            </div>
            
            <h3>Detalii Request:</h3>
            <pre>${JSON.stringify(
              {
                method: event.httpMethod,
                path: event.path,
                timestamp: new Date().toISOString(),
                params: event.queryStringParameters,
                headers: {
                  "user-agent": event.headers["user-agent"],
                  "content-type": event.headers["content-type"],
                },
              },
              null,
              2
            )}</pre>
            
            <h3>Test POST Request:</h3>
            <p>Pentru a testa funcționalitatea, trimiteți un POST request cu:</p>
            <pre>{
  "env_key": "test_env_key",
  "data": "test_encrypted_data"
}</pre>
            
            <div style="margin-top: 30px;">
                <a href="${process.env.URL || "http://localhost:8888"}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    🏠 Înapoi la aplicație
                </a>
            </div>
        </div>
    </body>
    </html>
    `;

    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Content-Type": "text/html; charset=utf-8",
      },
      body: testResponse,
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Metodă nepermisă",
        message: `Acest endpoint acceptă doar POST requests. Primit: ${event.httpMethod}`,
        allowedMethods: ["POST"],
      }),
    };
  }

  try {
    console.log("Notificare Netopia - Detalii request:", {
      method: event.httpMethod,
      headers: event.headers,
      body: event.body?.substring(0, 200) + "...",
      contentType: event.headers["content-type"],
      timestamp: new Date().toISOString(),
    });

    // Datele primite de la Netopia
    let env_key, data, envKey, dataValue;

    // Încearcă să parseze ca JSON
    try {
      const jsonData = event.body ? JSON.parse(event.body) : {};
      env_key = jsonData.env_key;
      data = jsonData.data;
    } catch (jsonError) {
      // Dacă nu e JSON, încearcă ca form-data
      try {
        const formData = new URLSearchParams(event.body);
        envKey = formData.get("env_key");
        dataValue = formData.get("data");
        env_key = envKey;
        data = dataValue;
      } catch (formError) {
        console.log("Nu s-a putut parsa nici ca JSON, nici ca form-data");
      }
    }

    if (!env_key || !data) {
      console.log("Date lipsă:", { env_key: !!env_key, data: !!data });
      return {
        statusCode: 400,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "Date lipsă pentru notificare",
          received: {
            env_key: !!env_key,
            data: !!data,
            body_preview: event.body?.substring(0, 100),
          },
        }),
      };
    }

    console.log("Notificare Netopia primită:", {
      env_key: env_key?.substring(0, 50) + "...",
      data: data?.substring(0, 100) + "...",
      timestamp: new Date().toISOString(),
    });

    // Aici poți procesa notificarea
    // De exemplu, să actualizezi statusul comenzii în baza de date

    // Pentru demo, simulăm procesarea
    const processedData = {
      orderId: "ORDER-123",
      status: "confirmed",
      amount: 100,
      currency: "RON",
      processedAt: new Date().toISOString(),
    };

    // Răspuns către Netopia (confirmare primire notificare)
    const response = `<?xml version="1.0" encoding="utf-8"?>
<crc>confirmed</crc>`;

    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Content-Type": "application/xml",
      },
      body: response,
    };
  } catch (error) {
    console.error("Eroare la procesarea notificării Netopia:", error);

    // Răspuns de eroare către Netopia
    const errorResponse = `<?xml version="1.0" encoding="utf-8"?>
<crc>error</crc>`;

    return {
      statusCode: 500,
      headers: {
        ...headers,
        "Content-Type": "application/xml",
      },
      body: errorResponse,
    };
  }
};
