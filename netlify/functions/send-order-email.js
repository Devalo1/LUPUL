/**
 * Funcție Netlify pentru trimiterea emailurilor de confirmare comandă
 * Folosește Nodemailer pentru SMTP real
 */

import nodemailer from "nodemailer";

export const handler = async (event, context) => {
  // 🔍 DEBUG LOG - Pentru identificarea apelurilor multiple
  const requestId = Date.now() + "-" + Math.random().toString(36).substr(2, 9);
  console.log(`🚀 SEND-ORDER-EMAIL CALLED - Request ID: ${requestId}`);
  console.log(`📋 Method: ${event.httpMethod}, Headers:`, event.headers);

  // Handle CORS preflight request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  // Verificăm metoda HTTP
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      console.error("Eroare parsare JSON:", parseError);
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Invalid JSON in request body" }),
      };
    }

    const { orderData, orderNumber, totalAmount } = requestBody;

    // Validăm datele primite
    console.log(
      "🔍 DEBUGGING: requestBody complet:",
      JSON.stringify(requestBody, null, 2)
    );
    console.log("🔍 DEBUGGING: orderData type:", typeof orderData);
    console.log("🔍 DEBUGGING: orderData value:", orderData);
    console.log("🔍 DEBUGGING: orderNumber type:", typeof orderNumber);
    console.log("🔍 DEBUGGING: orderNumber value:", orderNumber);

    if (!orderData || !orderNumber) {
      console.error("Date comandă lipsă:", {
        orderData: !!orderData,
        orderNumber: !!orderNumber,
        orderDataType: typeof orderData,
        orderNumberType: typeof orderNumber,
      });
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Date comandă lipsă" }),
      };
    }

    // Verificăm dacă este o notificare de backup (date lipsă)
    const isBackupNotification = orderData.isBackupNotification || false;

    if (isBackupNotification) {
      console.log(
        "⚠️ EMAIL DE BACKUP: Date comandă incomplete - trimit doar către admin"
      );
    }

    console.log("📦 Procesez comandă:", {
      orderNumber,
      customerEmail: orderData.email,
      totalAmount,
      itemsCount: orderData.items?.length || 0,
      isBackupNotification,
    });

    // Verificăm dacă suntem în modul dezvoltare/test
    const isDevelopment = process.env.NODE_ENV === "development";

    // Configurația SMTP pentru emailuri reale
    const smtpUser = process.env.SMTP_USER || "lupulsicorbul@gmail.com";
    const smtpPass = process.env.SMTP_PASS; // Folosim variabila de mediu

    console.log("📧 FORȚEZ TRIMITEREA REALĂ DE EMAILURI!");
    console.log("📋 SMTP Config:", {
      user: smtpUser,
      passConfigured: !!smtpPass,
      orderNumber: orderNumber,
      customerEmail: orderData.email,
    });

    // Verifică dacă avem parola SMTP
    if (!smtpPass) {
      console.error("❌ SMTP_PASS nu este configurat!");
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: false,
          error: "SMTP configuration missing - emails cannot be sent",
          message: "Set SMTP_PASS in Netlify environment variables",
        }),
      };
    }

    // Configurare transport SMTP (folosește variabile de mediu)
    let transporter;

    try {
      transporter = nodemailer.createTransport({
        service: "gmail", // sau alt service SMTP
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      // Test conexiunea SMTP înainte de a trimite
      await transporter.verify();
      console.log("✅ SMTP conexiune validă - vom trimite emailuri reale!");
      console.log("📧 Email client va fi trimis la:", orderData.email);
      console.log("📧 Email admin va fi trimis la: lupulsicorbul@gmail.com");
    } catch (smtpError) {
      console.warn("❌ SMTP conexiune eșuată:", smtpError.message);

      // Fallback la modul dezvoltare dacă SMTP nu funcționează
      console.log("🔧 FALLBACK: Simulăm trimiterea emailurilor");
      console.log("📧 Email client simulat pentru:", orderData.email);
      console.log("📧 Email admin simulat pentru: lupulsicorbul@gmail.com");
      console.log("📋 Detalii comandă:", {
        orderNumber,
        totalAmount: totalAmount + " RON",
        client: `${orderData.firstName || orderData.name} ${orderData.lastName || ""}`,
        phone: orderData.phone,
        address: `${orderData.address}, ${orderData.city}, ${orderData.county}`,
      });

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
        body: JSON.stringify({
          success: true,
          message: "Emailuri simulate cu succes (SMTP indisponibil)",
          development: true,
          customerEmail: orderData.email,
          adminEmail: "lupulsicorbul@gmail.com",
          orderNumber: orderNumber,
        }),
      };
    }

    // Email pentru client
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmare comandă ${orderNumber}</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🐺 Lupul și Corbul 🐦‍⬛</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Mulțumim pentru comandă!</h2>
          <p>Bună ${orderData.firstName || orderData.name} ${orderData.lastName || ""},</p>
          <p>Comanda ta a fost înregistrată cu succes.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Detalii comandă:</h3>
            <p><strong>Numărul comenzii:</strong> ${orderNumber}</p>
            <p><strong>Total:</strong> ${totalAmount} RON</p>
            <p><strong>Data:</strong> ${new Date().toLocaleDateString("ro-RO")}</p>
          </div>

          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Produse comandate:</h3>
            ${
              orderData.items && orderData.items.length > 0
                ? orderData.items
                    .map(
                      (item) => `
              <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <p><strong>${item.name || "Produs"}</strong></p>
                <p>Preț: ${(parseFloat(item.price) || 0).toFixed(2)} RON</p>
                <p>Cantitate: ${item.quantity || 1}</p>
                <p>Subtotal: ${((parseFloat(item.price) || 0) * (item.quantity || 1)).toFixed(2)} RON</p>
              </div>
            `
                    )
                    .join("")
                : "<p>Nu au fost găsite produse</p>"
            }
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Date livrare:</h3>
            <p>${orderData.firstName || orderData.name} ${orderData.lastName || ""}</p>
            <p>${orderData.address}</p>
            <p>${orderData.city}, ${orderData.county}</p>
            <p>Cod poștal: ${orderData.postalCode}</p>
            <p>Telefon: ${orderData.phone}</p>
          </div>
          
          <p style="margin-top: 30px;">Vei fi contactat în curând pentru confirmarea comenzii.</p>
          <p>Mulțumim că ai ales <strong>Lupul și Corbul</strong>!</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            Pentru întrebări: lupulsicorbul@gmail.com<br>
            © 2025 Lupul și Corbul - Toate drepturile rezervate
          </p>
        </div>
      </body>
      </html>
    `;

    // Email pentru admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${isBackupNotification ? "⚠️ ATENȚIE: Comandă cu date lipsă" : `Comandă nouă: ${orderNumber}`}</title>
      </head>
      <body style="font-family: Arial, sans-serif;">
        <h2>${isBackupNotification ? "⚠️ ATENȚIE: Comandă cu date incomplete!" : "🛒 Comandă nouă primită!"}</h2>
        
        ${
          isBackupNotification
            ? `
        <div style="background: #fee2e2; border: 2px solid #dc2626; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #dc2626; margin-top: 0;">🚨 PROBLEMĂ DETECTATĂ:</h3>
          <p><strong>Comanda a fost procesată prin NETOPIA, dar datele s-au pierdut din localStorage!</strong></p>
          <p>S-a încercat să se trimită email către client, dar nu s-a găsit adresa de email.</p>
          <p><strong>ACȚIUNI NECESARE:</strong></p>
          <ul>
            <li>Verifică manual în dashboard-ul NETOPIA pentru detaliile complete ale comenzii</li>
            <li>Contactează clientul prin alte mijloace dacă îl identifici</li>
            <li>Investighează de ce s-au pierdut datele din localStorage</li>
          </ul>
        </div>
        `
            : ""
        }
        
        <p><strong>Numărul comenzii:</strong> ${orderNumber}</p>
        <p><strong>Total:</strong> ${totalAmount} RON</p>
        <p><strong>Data:</strong> ${new Date().toLocaleString("ro-RO")}</p>
        
        <h3>Produse comandate:</h3>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          ${
            orderData.items && orderData.items.length > 0
              ? orderData.items
                  .map(
                    (item) => `
            <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
              <p><strong>${item.name || "Produs"}</strong></p>
              <p>Preț unitar: ${(parseFloat(item.price) || 0).toFixed(2)} RON</p>
              <p>Cantitate: ${item.quantity || 1}</p>
              <p><strong>Subtotal: ${((parseFloat(item.price) || 0) * (item.quantity || 1)).toFixed(2)} RON</strong></p>
              ${item.description ? `<p><em>${item.description}</em></p>` : ""}
            </div>
          `
                  )
                  .join("")
              : `<p>${isBackupNotification ? "⚠️ Date produse pierdute - verifică în NETOPIA" : "Nu au fost găsite produse"}</p>`
          }
        </div>
        
        <h3>Date client:</h3>
        <p><strong>Nume:</strong> ${orderData.firstName || orderData.name} ${orderData.lastName || ""}</p>
        <p><strong>Email:</strong> ${isBackupNotification ? "❌ EMAIL LIPSĂ - PROBLEMĂ!" : orderData.email}</p>
        <p><strong>Telefon:</strong> ${orderData.phone}</p>
        
        <h3>Adresa de livrare:</h3>
        <p>${orderData.address}<br>
        ${orderData.city}, ${orderData.county}<br>
        ${orderData.postalCode ? `Cod poștal: ${orderData.postalCode}` : ""}</p>
        
        ${
          isBackupNotification
            ? `
        <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #f59e0b; margin-top: 0;">🔧 DEBUGGING INFO:</h3>
          <p>Această comandă a fost procesată prin mecanismul de backup.</p>
          <p>Pentru detalii complete, verifică:</p>
          <ul>
            <li>NETOPIA dashboard pentru statusul și detaliile plății</li>
            <li>Logs-urile aplicației pentru cauza pierderii datelor</li>
            <li>sessionStorage browser pentru eventuale date backup</li>
          </ul>
        </div>
        `
            : `<p>Contactează clientul pentru confirmarea comenzii.</p>`
        }
      </body>
      </html>
    `;

    // Trimite email către client
    const customerEmail = {
      from: smtpUser,
      to: orderData.email,
      subject: `Confirmare comandă ${orderNumber} - Lupul și Corbul`,
      html: customerEmailHtml,
    };

    // Trimite email către admin
    const adminEmail = {
      from: smtpUser,
      to: "lupulsicorbul@gmail.com",
      subject: `Comandă nouă: ${orderNumber}`,
      html: adminEmailHtml,
    };

    // Execută trimiterea emailurilor
    console.log(
      `📧 [${requestId}] Trimit emailurile pentru comanda: ${orderNumber}`
    );
    console.log(`🎯 [${requestId}] Backup mode: ${isBackupNotification}`);

    if (isBackupNotification) {
      // Pentru notificările de backup, trimite doar către admin
      console.log("📧 BACKUP MODE: Trimit doar email către admin");
      const adminResult = await transporter.sendMail(adminEmail);
      console.log("✅ Email admin (backup) trimis:", adminResult.messageId);

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
        body: JSON.stringify({
          success: true,
          message:
            "Email de backup trimis către admin (date comandă incomplete)",
          adminEmailId: adminResult.messageId,
          orderNumber: orderNumber,
          backupMode: true,
        }),
      };
    } else {
      // Trimitere normală către client și admin
      console.log(
        `📧 [${requestId}] Trimit emailuri NORMALE către client ȘI admin`
      );
      const [customerResult, adminResult] = await Promise.all([
        transporter.sendMail(customerEmail),
        transporter.sendMail(adminEmail),
      ]);

      console.log("✅ Email client trimis:", customerResult.messageId);
      console.log("✅ Email admin trimis:", adminResult.messageId);

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
        body: JSON.stringify({
          success: true,
          message: "Emailuri trimise cu succes",
          customerEmailId: customerResult.messageId,
          adminEmailId: adminResult.messageId,
          orderNumber: orderNumber,
        }),
      };
    }
  } catch (error) {
    console.error("❌ Eroare trimitere email:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: JSON.stringify({
        success: false,
        error: "Eroare la trimiterea emailului",
        details: error.message,
      }),
    };
  }
};
