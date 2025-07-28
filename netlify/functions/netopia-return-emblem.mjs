/**
 * Funcție Netlify pentru gestionarea returnului utilizatorului după plata EMBLEMELOR
 * Această funcție redirectează utilizatorul înapoi cu statusul plății
 */

export const handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "text/html",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  try {
    // Parsează parametrii din query string sau form data
    let orderId, status, amount;

    if (event.httpMethod === "GET") {
      const params = event.queryStringParameters || {};
      orderId = params.orderId;
      status = params.status;
      amount = params.amount;
    } else if (event.httpMethod === "POST") {
      const formData = new URLSearchParams(event.body || "");
      orderId = formData.get("orderId");
      status = formData.get("status");
      amount = formData.get("amount");
    }

    console.log("🔮 EMBLEM PAYMENT RETURN:", {
      method: event.httpMethod,
      orderId: orderId,
      status: status,
      amount: amount,
      queryParams: event.queryStringParameters,
      origin: event.headers.origin || event.headers.host,
    });

    // Determină base URL pentru redirect
    const baseUrl =
      process.env.URL ||
      (event.headers.origin && event.headers.origin.includes("localhost")
        ? event.headers.origin
        : "https://lupulsicorbul.com");

    // Extrage informațiile despre emblemă din orderId
    let emblemType = "unknown";
    if (orderId && orderId.includes("_")) {
      const parts = orderId.split("_");
      if (parts.length >= 2) {
        emblemType = parts[1];
      }
    }

    // Determină statusul pentru afișare
    let displayStatus = "pending";
    let statusMessage = "Plata este în procesare...";
    let statusIcon = "⏳";

    if (status === "confirmed" || status === "paid" || status === "success") {
      displayStatus = "success";
      statusMessage =
        "Plata a fost procesată cu succes! Emblema ta a fost activată.";
      statusIcon = "🎉";
    } else if (
      status === "failed" ||
      status === "error" ||
      status === "cancelled"
    ) {
      displayStatus = "failed";
      statusMessage =
        "Plata nu a putut fi procesată. Te rugăm să încerci din nou.";
      statusIcon = "❌";
    }

    // Crează pagina HTML de return cu design consistent
    const returnHtml = `<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>🔮 Rezultat Plată Emblemă - Lupul și Corbul</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .container {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      max-width: 600px;
      width: 100%;
      border: 2px solid rgba(255, 215, 0, 0.3);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    
    .status-icon {
      font-size: 4rem;
      margin-bottom: 20px;
      display: block;
    }
    
    .success .status-icon { color: #2ecc71; }
    .failed .status-icon { color: #e74c3c; }
    .pending .status-icon { color: #f39c12; }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 20px;
      background: linear-gradient(45deg, #ffd700, #ffa500);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .status-message {
      font-size: 1.2rem;
      margin-bottom: 30px;
      line-height: 1.6;
      opacity: 0.9;
    }
    
    .order-details {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 15px;
      padding: 20px;
      margin-bottom: 30px;
      text-align: left;
    }
    
    .order-details h3 {
      color: #ffd700;
      margin-bottom: 15px;
      text-align: center;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .detail-row:last-child {
      border-bottom: none;
    }
    
    .detail-label {
      font-weight: 600;
      opacity: 0.8;
    }
    
    .detail-value {
      font-weight: bold;
      color: #ffd700;
    }
    
    .action-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 12px 24px;
      border-radius: 25px;
      border: none;
      font-weight: bold;
      text-decoration: none;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    
    .btn-primary {
      background: linear-gradient(45deg, #ffd700, #ffa500);
      color: #333;
    }
    
    .btn-primary:hover {
      background: linear-gradient(45deg, #ffa500, #ff8c00);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(255, 165, 0, 0.4);
    }
    
    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }
    
    .countdown {
      font-size: 0.9rem;
      opacity: 0.7;
      margin-top: 20px;
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 30px 20px;
        margin: 10px;
      }
      
      h1 {
        font-size: 2rem;
      }
      
      .action-buttons {
        flex-direction: column;
      }
      
      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  </style>
</head>
<body>
  <div class="container ${displayStatus}">
    <span class="status-icon">${statusIcon}</span>
    
    <h1>🔮 Rezultat Plată</h1>
    
    <div class="status-message">
      ${statusMessage}
    </div>
    
    <div class="order-details">
      <h3>Detalii Comandă</h3>
      <div class="detail-row">
        <span class="detail-label">ID Comandă:</span>
        <span class="detail-value">${orderId || "N/A"}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Emblemă:</span>
        <span class="detail-value">${getEmblemDisplayName(emblemType)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Sumă:</span>
        <span class="detail-value">${amount ? (parseInt(amount) / 100).toFixed(2) + " RON" : "N/A"}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span class="detail-value">${getStatusDisplayName(status)}</span>
      </div>
    </div>
    
    <div class="action-buttons">
      ${
        displayStatus === "success"
          ? `
        <a href="${baseUrl}/emblems/dashboard" class="btn btn-primary">
          🏆 Vezi Emblema Mea
        </a>
      `
          : ""
      }
      
      ${
        displayStatus === "failed"
          ? `
        <a href="${baseUrl}/emblems/mint" class="btn btn-primary">
          🔄 Încearcă Din Nou
        </a>
      `
          : ""
      }
      
      <a href="${baseUrl}" class="btn btn-secondary">
        🏠 Înapoi la Platformă
      </a>
    </div>
    
    <div class="countdown">
      ${displayStatus === "success" ? 'Vei fi redirectat automat în <span id="countdown">10</span> secunde...' : ""}
    </div>
  </div>

  <script>
    console.log('🔮 Emblem Payment Return Page Loaded:', {
      orderId: '${orderId}',
      status: '${status}',
      displayStatus: '${displayStatus}',
      emblemType: '${emblemType}',
      amount: '${amount}'
    });
    
    // Redirect automat pentru plăți reușite
    ${
      displayStatus === "success"
        ? `
      let countdownTime = 10;
      const countdownElement = document.getElementById('countdown');
      
      const countdownTimer = setInterval(() => {
        countdownTime--;
        if (countdownElement) {
          countdownElement.textContent = countdownTime;
        }
        
        if (countdownTime <= 0) {
          clearInterval(countdownTimer);
          window.location.href = '${baseUrl}/emblems/dashboard';
        }
      }, 1000);
      
      // Oprește countdown-ul dacă utilizatorul interacționează cu pagina
      document.addEventListener('click', () => {
        clearInterval(countdownTimer);
        if (countdownElement) {
          countdownElement.parentElement.style.display = 'none';
        }
      });
    `
        : ""
    }
    
    // Salvează rezultatul în localStorage pentru debugging
    localStorage.setItem('lastEmblemPaymentResult', JSON.stringify({
      orderId: '${orderId}',
      status: '${status}',
      displayStatus: '${displayStatus}',
      timestamp: Date.now()
    }));
  </script>
</body>
</html>`;

    return {
      statusCode: 200,
      headers,
      body: returnHtml,
    };
  } catch (error) {
    console.error("🚨 Error in emblem payment return:", error);

    // Pagină de eroare simplă
    const errorHtml = `<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <title>Eroare - Lupul și Corbul</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; 
      text-align: center; 
      padding: 50px; 
    }
    .error-container {
      background: rgba(255,255,255,0.1);
      padding: 40px;
      border-radius: 20px;
      max-width: 500px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <h1>❌ Eroare</h1>
    <p>A apărut o eroare la procesarea rezultatului plății.</p>
    <p>Te rugăm să contactezi suportul.</p>
    <a href="${process.env.URL || "https://lupulsicorbul.com"}" 
       style="color: #ffd700; text-decoration: none; font-weight: bold;">
      🏠 Înapoi la Platformă
    </a>
  </div>
</body>
</html>`;

    return {
      statusCode: 500,
      headers,
      body: errorHtml,
    };
  }
};

// Funcții helper pentru afișare
function getEmblemDisplayName(emblemType) {
  const names = {
    lupul_intelepta: "Lupul Înțelept",
    corbul_mistic: "Corbul Mistic",
    gardianul_wellness: "Gardianul Wellness",
    cautatorul_lumina: "Căutătorul de Lumină",
  };
  return names[emblemType] || "Emblemă Necunoscută";
}

function getStatusDisplayName(status) {
  const statuses = {
    confirmed: "Confirmată",
    paid: "Plătită",
    success: "Succes",
    pending: "În procesare",
    failed: "Eșuată",
    error: "Eroare",
    cancelled: "Anulată",
  };
  return statuses[status] || "Necunoscut";
}
