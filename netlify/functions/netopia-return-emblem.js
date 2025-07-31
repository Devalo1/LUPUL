/**
 * Funcție Netlify pentru procesarea return-ului de la NETOPIA pentru embleme NFT
 * Această funcție este apelată când utilizatorul se întoarce de la plată
 */

export const handler = async (event, context) => {
  console.log("🔮 NETOPIA EMBLEM RETURN - Request received:", {
    method: event.httpMethod,
    headers: event.headers,
    queryParams: event.queryStringParameters,
    body: event.body,
    timestamp: new Date().toISOString(),
  });

  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Content-Type": "text/html; charset=utf-8",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  try {
    // Parse return data from NETOPIA
    let returnData = {};

    // NETOPIA poate trimite date prin POST body sau query parameters
    if (event.body) {
      try {
        returnData = JSON.parse(event.body);
      } catch (e) {
        // Poate fi form-encoded
        const formData = new URLSearchParams(event.body);
        returnData = Object.fromEntries(formData);
      }
    }

    // Merge cu query parameters
    if (event.queryStringParameters) {
      returnData = {
        ...returnData,
        ...event.queryStringParameters,
      };
    }

    console.log("🔮 EMBLEM RETURN - Parsed return data:", {
      ntpID: returnData.ntpID,
      orderID: returnData.orderID,
      amount: returnData.amount,
      status: returnData.status,
      errorCode: returnData.errorCode,
      errorMessage: returnData.errorMessage,
      allData: returnData,
    });

    const { ntpID, orderID, amount, status, errorCode, errorMessage } =
      returnData;

    // Determină rezultatul plății
    let paymentResult = {
      success: false,
      status: status || "unknown",
      message: "Plata nu a putut fi procesată",
      emblemStatus: "failed",
    };

    switch (status) {
      case "confirmed":
      case "paid":
        paymentResult = {
          success: true,
          status: "confirmed",
          message:
            "🎉 Plata a fost confirmată! Emblema ta NFT a fost activată.",
          emblemStatus: "active",
        };
        break;

      case "pending":
        paymentResult = {
          success: false,
          status: "pending",
          message:
            "⏳ Plata este în proces de confirmare. Vei fi notificat când emblema va fi activată.",
          emblemStatus: "pending",
        };
        break;

      case "canceled":
        paymentResult = {
          success: false,
          status: "canceled",
          message: "❌ Plata a fost anulată. Poți încerca din nou oricând.",
          emblemStatus: "cancelled",
        };
        break;

      case "expired":
        paymentResult = {
          success: false,
          status: "expired",
          message:
            "⏰ Sesiunea de plată a expirat. Te rugăm să încerci din nou.",
          emblemStatus: "expired",
        };
        break;

      default:
        if (errorCode || errorMessage) {
          paymentResult = {
            success: false,
            status: "error",
            message: `❌ A apărut o eroare: ${errorMessage || `Cod eroare: ${errorCode}`}`,
            emblemStatus: "failed",
          };
        }
    }

    // Log pentru debugging
    console.log("🔮 EMBLEM RETURN RESULT:", {
      orderID,
      ntpID,
      status,
      paymentResult,
      timestamp: new Date().toISOString(),
    });

    // Determină URL-ul de redirect înapoi la aplicație
    const baseUrl = process.env.URL || "https://lupulsicorbul.com";
    const redirectUrl = `${baseUrl}?emblem_order=${orderID}&status=${paymentResult.status}&ntpid=${ntpID}`;

    // Returnează pagină HTML cu redirect automat și informații despre emblema
    const htmlResponse = `
      <!DOCTYPE html>
      <html lang="ro">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rezultat Cumpărare Emblemă NFT</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 600px;
            margin: 40px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
          .logo {
            font-size: 48px;
            margin-bottom: 20px;
          }
          .title {
            color: #333;
            margin-bottom: 20px;
            font-size: 28px;
            font-weight: 600;
          }
          .message {
            font-size: 18px;
            line-height: 1.6;
            margin-bottom: 30px;
            color: #666;
          }
          .success { color: #22c55e; }
          .pending { color: #f59e0b; }
          .error { color: #ef4444; }
          .details {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
            font-size: 14px;
            color: #64748b;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 10px;
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
          }
          .countdown {
            font-size: 14px;
            color: #64748b;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🔮</div>
          <h1 class="title">Emblemă NFT - Lupul și Corbul</h1>
          
          <div class="message ${paymentResult.success ? "success" : paymentResult.status === "pending" ? "pending" : "error"}">
            ${paymentResult.message}
          </div>

          ${
            orderID
              ? `
          <div class="details">
            <strong>Detalii cumpărare:</strong><br>
            Comandă: ${orderID}<br>
            ${ntpID ? `ID Plată: ${ntpID}<br>` : ""}
            ${amount ? `Sumă: ${amount} RON<br>` : ""}
            Status: ${paymentResult.emblemStatus}<br>
            Data: ${new Date().toLocaleString("ro-RO")}
          </div>
          `
              : ""
          }

          ${
            paymentResult.success
              ? `
          <div style="background: #dcfce7; color: #16a34a; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>🎉 Felicitări!</strong><br>
            Emblema ta NFT a fost activată în contul tău. 
            Poți accesa acum beneficiile exclusive ale comunității Lupul și Corbul.
          </div>
          `
              : ""
          }

          <a href="${redirectUrl}" class="button">
            Înapoi la Lupul și Corbul
          </a>

          <div class="countdown" id="countdown">
            Vei fi redirecționat automat în <span id="timer">10</span> secunde...
          </div>
        </div>

        <script>
          // Auto-redirect după 10 secunde
          let seconds = 10;
          const timer = document.getElementById('timer');
          const countdown = setInterval(() => {
            seconds--;
            timer.textContent = seconds;
            if (seconds <= 0) {
              clearInterval(countdown);
              window.location.href = '${redirectUrl}';
            }
          }, 1000);

          // Permite redirect manual imediat
          document.addEventListener('click', () => {
            clearInterval(countdown);
            window.location.href = '${redirectUrl}';
          });
        </script>
      </body>
      </html>
    `;

    return {
      statusCode: 200,
      headers,
      body: htmlResponse,
    };
  } catch (error) {
    console.error("🚨 EMBLEM RETURN ERROR:", error);

    // Fallback la homepage în caz de eroare
    const baseUrl = process.env.URL || "https://lupulsicorbul.com";

    return {
      statusCode: 302,
      headers: {
        ...headers,
        Location: `${baseUrl}?error=emblem_return_failed`,
      },
    };
  }
};
