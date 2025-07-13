export const handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    // Parametrii din URL sau body
    const params = event.queryStringParameters || {};
    const body = event.body
      ? typeof event.body === "string"
        ? event.body.startsWith("{")
          ? JSON.parse(event.body)
          : {}
        : event.body
      : {};

    console.log("Return de la Netopia:", {
      method: event.httpMethod,
      params,
      body,
      headers: event.headers,
      timestamp: new Date().toISOString(),
    });

    // Pentru debugging - să vedem exact ce primim
    const debugInfo = {
      allParams: params,
      allBodyData: body,
      method: event.httpMethod,
      url: event.path,
      rawBody: event.body,
    };

    // Netopia poate trimite parametrii în diverse formate
    // Verificăm toate variantele posibile
    let orderId =
      params.orderId ||
      params.order_id ||
      params.orderID ||
      body.orderId ||
      body.order_id ||
      body.orderID ||
      params.ntpID ||
      body.ntpID; // Netopia Transaction ID

    let status =
      params.status ||
      params.errorCode ||
      params.result ||
      body.status ||
      body.errorCode ||
      body.result;

    // Verificăm și alte parametri tipici de la Netopia
    const errorCode = params.errorCode || body.errorCode;
    const errorMessage = params.errorMessage || body.errorMessage;
    const amount = params.amount || body.amount;
    const currency = params.currency || body.currency;
    const ntpID = params.ntpID || body.ntpID;
    const signature = params.signature || body.signature;

    // Dacă nu avem order ID, folosim ntpID sau generăm unul temporar
    if (!orderId) {
      orderId = ntpID || `ORDER_${Date.now()}`;
    }

    // Determinăm statusul pe baza parametrilor
    if (!status) {
      if (errorCode === "00" || errorCode === 0) {
        status = "success";
      } else if (errorCode && errorCode !== "00") {
        status = "failed";
      } else {
        status = "pending";
      }
    }

    // Normalizăm statusul
    if (
      status === "00" ||
      status === 0 ||
      status === "success" ||
      status === "confirmed"
    ) {
      status = "success";
    } else if (
      status === "failed" ||
      status === "error" ||
      (errorCode && errorCode !== "00")
    ) {
      status = "failed";
    } else {
      status = "pending";
    }

    // Creăm o pagină HTML pentru afișarea rezultatului
    const resultPage = `
    <!DOCTYPE html>
    <html lang="ro">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rezultat Plată - Netopia</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 20px;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: white;
                border-radius: 16px;
                padding: 40px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                text-align: center;
                max-width: 500px;
                width: 100%;
            }
            .success-icon {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
                background: #10B981;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .error-icon {
                background: #EF4444;
            }
            .icon {
                width: 40px;
                height: 40px;
                fill: white;
            }
            h1 {
                color: #1F2937;
                margin-bottom: 10px;
                font-size: 28px;
            }
            p {
                color: #6B7280;
                margin-bottom: 20px;
                font-size: 16px;
            }
            .order-info {
                background: #F9FAFB;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding-bottom: 10px;
                border-bottom: 1px solid #E5E7EB;
            }
            .info-row:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            .label {
                font-weight: 600;
                color: #374151;
            }
            .value {
                color: #6B7280;
            }
            .btn {
                background: #3B82F6;
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                margin-top: 20px;
            }
            .btn:hover {
                background: #2563EB;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="${status === "success" || status === "confirmed" ? "success-icon" : "success-icon error-icon"}">
                ${
                  status === "success" || status === "confirmed"
                    ? '<svg class="icon" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
                    : '<svg class="icon" viewBox="0 0 24 24"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
                }
            </div>
            
            <h1>${status === "success" || status === "confirmed" ? "Plată Reușită!" : "Plată Eșuată"}</h1>
            <p>
                ${
                  status === "success" || status === "confirmed"
                    ? "Tranzacția dvs. a fost procesată cu succes."
                    : "Din păcate, plata nu a putut fi procesată."
                }
            </p>
            
            <div class="order-info">
                <div class="info-row">
                    <span class="label">Order ID:</span>
                    <span class="value">${orderId}</span>
                </div>
                <div class="info-row">
                    <span class="label">Status:</span>
                    <span class="value">${status}</span>
                </div>
                ${
                  ntpID
                    ? `
                <div class="info-row">
                    <span class="label">Transaction ID:</span>
                    <span class="value">${ntpID}</span>
                </div>
                `
                    : ""
                }
                ${
                  amount && currency
                    ? `
                <div class="info-row">
                    <span class="label">Sumă:</span>
                    <span class="value">${amount} ${currency}</span>
                </div>
                `
                    : ""
                }
                ${
                  errorCode && status === "failed"
                    ? `
                <div class="info-row">
                    <span class="label">Cod eroare:</span>
                    <span class="value">${errorCode}</span>
                </div>
                `
                    : ""
                }
                ${
                  errorMessage && status === "failed"
                    ? `
                <div class="info-row">
                    <span class="label">Mesaj eroare:</span>
                    <span class="value">${errorMessage}</span>
                </div>
                `
                    : ""
                }
                <div class="info-row">
                    <span class="label">Data:</span>
                    <span class="value">${new Date().toLocaleString("ro-RO")}</span>
                </div>
            </div>
            
            ${
              process.env.NODE_ENV === "development" || process.env.NETLIFY_DEV
                ? `
            <div class="order-info" style="background: #FEF3C7; border: 1px solid #F59E0B;">
                <h3 style="margin-top: 0; color: #92400E;">Debug Info (Development)</h3>
                <div class="info-row">
                    <span class="label">Toate parametrii URL:</span>
                    <span class="value" style="word-break: break-all;">${JSON.stringify(params)}</span>
                </div>
                <div class="info-row">
                    <span class="label">Date din body:</span>
                    <span class="value" style="word-break: break-all;">${JSON.stringify(body)}</span>
                </div>
                <div class="info-row">
                    <span class="label">Method:</span>
                    <span class="value">${event.httpMethod}</span>
                </div>
                <div class="info-row">
                    <span class="label">Raw Body:</span>
                    <span class="value" style="word-break: break-all;">${event.body || "N/A"}</span>
                </div>
            </div>
            `
                : ""
            }
            
            <a href="${process.env.URL || "http://localhost:8888"}" class="btn">
                Înapoi la aplicație
            </a>
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
      body: resultPage,
    };
  } catch (error) {
    console.error("Eroare la procesarea return-ului Netopia:", error);

    const errorPage = `
    <!DOCTYPE html>
    <html lang="ro">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Eroare Plată</title>
    </head>
    <body>
        <h1>Eroare la procesarea plății</h1>
        <p>A apărut o eroare la procesarea rezultatului plății.</p>
        <a href="${process.env.URL || "http://localhost:8888"}">Înapoi la aplicație</a>
    </body>
    </html>
    `;

    return {
      statusCode: 500,
      headers: {
        ...headers,
        "Content-Type": "text/html; charset=utf-8",
      },
      body: errorPage,
    };
  }
};
