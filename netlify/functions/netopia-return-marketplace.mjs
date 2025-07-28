/**
 * Funcție Netlify pentru return-ul utilizatorilor după plata marketplace
 * Gestionează redirecturile după cumpărările de pe marketplace (Client → Client)
 */

export const handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "text/html; charset=utf-8",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  try {
    console.log("🏪 MARKETPLACE RETURN accessed:", {
      method: event.httpMethod,
      queryParams: event.queryStringParameters,
      headers: event.headers,
    });

    // Extrage parametrii de return
    const params = event.queryStringParameters || {};
    const orderId = params.orderId || params.order_id || "unknown";
    const status = params.status || params.payment_status || "unknown";

    // Determină statusul plății
    let paymentStatus = "processing";
    let statusMessage = "Plata se procesează...";
    let statusIcon = "⏳";
    let redirectUrl = "/marketplace";

    if (status === "confirmed" || status === "paid" || status === "success") {
      paymentStatus = "success";
      statusMessage =
        "Plata a fost confirmată! Emblema a fost transferată în contul tău.";
      statusIcon = "🎉";
      redirectUrl = "/dashboard"; // Redirect la dashboard să vadă noua emblemă
    } else if (
      status === "cancelled" ||
      status === "failed" ||
      status === "error"
    ) {
      paymentStatus = "failed";
      statusMessage =
        "Plata a fost anulată sau a eșuat. Emblema rămâne disponibilă pe marketplace.";
      statusIcon = "❌";
      redirectUrl = "/marketplace";
    }

    // Verifică dacă este tranzacție marketplace
    const isMarketplace = orderId.startsWith("marketplace_");

    if (!isMarketplace) {
      console.log(
        "⚠️ Non-marketplace transaction redirected to marketplace return"
      );
    }

    console.log("🏪 Marketplace payment return:", {
      orderId: orderId,
      status: status,
      paymentStatus: paymentStatus,
      isMarketplace: isMarketplace,
    });

    // Generează pagina de return cu design frumos
    const returnPage = `
      <!DOCTYPE html>
      <html lang="ro">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rezultat Cumpărare Marketplace - Lupul și Corbul</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            padding: 20px;
          }

          .return-container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 3rem;
            text-align: center;
            max-width: 500px;
            width: 100%;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          }

          .status-icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
            animation: bounce 2s infinite;
          }

          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }

          h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
            color: ${paymentStatus === "success" ? "#2ecc71" : paymentStatus === "failed" ? "#e74c3c" : "#f39c12"};
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          }

          .status-message {
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 2rem;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .order-details {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .order-details h3 {
            margin-bottom: 1rem;
            color: #3498db;
            font-size: 1.2rem;
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            padding: 0.3rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .detail-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 1.1rem;
          }

          .countdown {
            font-size: 1rem;
            margin-bottom: 1.5rem;
            padding: 0.8rem;
            background: rgba(52, 152, 219, 0.2);
            border-radius: 8px;
            border: 1px solid rgba(52, 152, 219, 0.3);
          }

          .countdown-number {
            font-weight: bold;
            font-size: 1.2rem;
            color: #3498db;
          }

          .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-top: 2rem;
          }

          .btn {
            padding: 1rem 2rem;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
          }

          .btn-primary {
            background: linear-gradient(45deg, #3498db, #2980b9);
            color: white;
            box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
          }

          .btn-secondary {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
          }

          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
          }

          .marketplace-info {
            margin-top: 2rem;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            font-size: 0.9rem;
            opacity: 0.9;
          }

          @media (max-width: 600px) {
            .return-container {
              padding: 2rem 1.5rem;
              margin: 1rem;
            }

            .status-icon {
              font-size: 3rem;
            }

            h1 {
              font-size: 1.5rem;
            }

            .action-buttons {
              flex-direction: column;
            }
          }

          .loading-bar {
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 1rem;
          }

          .loading-progress {
            height: 100%;
            background: linear-gradient(90deg, #3498db, #2ecc71);
            border-radius: 2px;
            animation: loadingProgress 5s linear;
          }

          @keyframes loadingProgress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="return-container">
          <div class="status-icon">${statusIcon}</div>
          
          <h1>
            ${
              paymentStatus === "success"
                ? "🏪 Cumpărare Reușită!"
                : paymentStatus === "failed"
                  ? "❌ Cumpărare Eșuată"
                  : "⏳ Se procesează..."
            }
          </h1>

          <div class="status-message">
            ${statusMessage}
          </div>

          <div class="order-details">
            <h3>📋 Detalii Comandă</h3>
            <div class="detail-row">
              <span>Tip tranzacție:</span>
              <span>🏪 Marketplace</span>
            </div>
            <div class="detail-row">
              <span>ID Comandă:</span>
              <span>${orderId}</span>
            </div>
            <div class="detail-row">
              <span>Status:</span>
              <span>${status}</span>
            </div>
            <div class="detail-row">
              <span>Data:</span>
              <span>${new Date().toLocaleString("ro-RO")}</span>
            </div>
          </div>

          ${
            paymentStatus === "success"
              ? `
            <div class="marketplace-info" style="background: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.3);">
              <h4 style="margin-bottom: 0.5rem; color: #2ecc71;">🎉 Felicitări!</h4>
              <p>Emblema a fost transferată automat în contul tău. Vânzătorul a primit 85% din preț, iar 15% merge către royalty și platformă.</p>
            </div>
          `
              : paymentStatus === "failed"
                ? `
            <div class="marketplace-info" style="background: rgba(231, 76, 60, 0.2); border: 1px solid rgba(231, 76, 60, 0.3);">
              <h4 style="margin-bottom: 0.5rem; color: #e74c3c;">💳 Plata nu a fost finalizată</h4>
              <p>Emblema rămâne disponibilă pe marketplace. Poți încerca din nou oricând.</p>
            </div>
          `
                : `
            <div class="loading-bar">
              <div class="loading-progress"></div>
            </div>
            <div class="marketplace-info">
              <p>Se verifică statusul plății și se procesează transferul emblemei...</p>
            </div>
          `
          }

          <div class="countdown">
            <div>Redirecționare automată în <span class="countdown-number" id="countdown">5</span> secunde...</div>
          </div>

          <div class="action-buttons">
            <a href="${redirectUrl}" class="btn btn-primary">
              ${
                paymentStatus === "success"
                  ? "📊 Vezi Emblema în Dashboard"
                  : paymentStatus === "failed"
                    ? "🏪 Înapoi la Marketplace"
                    : "🏠 Înapoi la Platformă"
              }
            </a>
            <a href="/marketplace" class="btn btn-secondary">
              🏪 Explorează Marketplace-ul
            </a>
          </div>
        </div>

        <script>
          // Countdown și redirect automat
          let countdown = 5;
          const countdownElement = document.getElementById('countdown');
          
          const countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
              clearInterval(countdownInterval);
              window.location.href = '${redirectUrl}';
            }
          }, 1000);

          // Cleanup pending marketplace purchase din localStorage
          try {
            const pendingPurchase = localStorage.getItem('pendingMarketplacePurchase');
            if (pendingPurchase) {
              const purchaseData = JSON.parse(pendingPurchase);
              if (purchaseData.orderId === '${orderId}') {
                localStorage.removeItem('pendingMarketplacePurchase');
                console.log('🧹 Cleaned up pending marketplace purchase data');
              }
            }
          } catch (error) {
            console.log('Error cleaning up marketplace purchase data:', error);
          }

          // Log pentru debugging
          console.log('🏪 Marketplace return page loaded:', {
            orderId: '${orderId}',
            status: '${status}',
            paymentStatus: '${paymentStatus}',
            redirectUrl: '${redirectUrl}'
          });
        </script>
      </body>
      </html>
    `;

    return {
      statusCode: 200,
      headers,
      body: returnPage,
    };
  } catch (error) {
    console.error("🚨 Error in marketplace return handler:", error);

    // Return simplă în caz de eroare
    return {
      statusCode: 200,
      headers,
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Eroare - Lupul și Corbul</title>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 2rem;">
          <h1>⚠️ A apărut o eroare</h1>
          <p>Nu am putut procesa rezultatul plății. Te rugăm să verifici contul tău sau să contactezi suportul.</p>
          <a href="/marketplace" style="display: inline-block; margin-top: 1rem; padding: 0.8rem 1.5rem; background: #3498db; color: white; text-decoration: none; border-radius: 5px;">
            🏪 Înapoi la Marketplace
          </a>
        </body>
        </html>
      `,
    };
  }
};
