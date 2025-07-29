/**
 * Funcție Netlify pentru trimiterea emailurilor de confirmare comandă
 * Folosește Nodemailer pentru SMTP real
 */

import nodemailer from "nodemailer";

export const handler = async (event, context) => {
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
    if (!orderData || !orderNumber) {
      console.error("Date comandă lipsă:", {
        orderData: !!orderData,
        orderNumber: !!orderNumber,
      });
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Date comandă lipsă" }),
      };
    }

    console.log("📦 Procesez comandă:", {
      orderNumber,
      customerEmail: orderData.email,
      totalAmount,
      itemsCount: orderData.items?.length || 0,
    });

    // Verificăm dacă suntem în modul dezvoltare/test
    const isDevelopment = process.env.NODE_ENV === "development";

    // Fallback la credențiale cunoscute pentru producție
    const smtpUser = process.env.SMTP_USER || "lupulsicorbul@gmail.com";
    const smtpPass = process.env.SMTP_PASS || "lraf ziyj xyii ssas"; // Aceeași parolă ca în netopia-notify.js

    // Pentru dezvoltare, permitem și testarea emailurilor reale
    // Dacă SMTP_PASS este "test-development-mode", simulăm
    // Dacă SMTP_PASS este o parolă reală, trimitem emailuri reale
    // FOLOSIM PAROLA REALĂ PENTRU TRIMITERE
    const shouldSimulate = false; // Forțăm trimiterea reală
    // const shouldSimulate =
    //   !smtpPass ||
    //   smtpPass === "test-development-mode" ||
    //   smtpPass === "your-gmail-app-password" ||
    //   smtpPass === "your-gmail-app-password-here";

    if (shouldSimulate) {
      // În modul dezvoltare, simulăm trimiterea emailurilor
      console.log("🔧 MOD SIMULARE: Simulăm trimiterea emailurilor");
      console.log("💡 Pentru emailuri reale în dezvoltare:");
      console.log("   1. Configurează o parolă Gmail de aplicație");
      console.log("   2. Actualizează SMTP_PASS în fișierul .env");
      console.log("   3. Vezi GMAIL_SETUP_GUIDE.md pentru detalii");
      console.log("📧 Email client simulat pentru:", orderData.email);
      console.log("📧 Email admin simulat pentru: lupulsicorbul@gmail.com");
      console.log("📋 Detalii comandă:", {
        orderNumber,
        totalAmount: totalAmount + " bani (raw)",
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
          message:
            "Emailuri simulate în dezvoltare - vezi GMAIL_SETUP_GUIDE.md pentru emailuri reale",
          development: true,
          simulated: true,
          customerEmail: orderData.email,
          adminEmail: "lupulsicorbul@gmail.com",
          orderNumber: orderNumber,
          setupGuide:
            "Pentru emailuri reale, configurează SMTP_PASS în .env cu parola ta Gmail de aplicație",
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
                <p>Preț: ${(item.price || 0).toFixed(2)} RON</p>
                <p>Cantitate: ${item.quantity || 1}</p>
                <p>Subtotal: ${((item.price || 0) * (item.quantity || 1)).toFixed(2)} RON</p>
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
        <title>Comandă nouă: ${orderNumber}</title>
      </head>
      <body style="font-family: Arial, sans-serif;">
        <h2>🛒 Comandă nouă primită!</h2>
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
              <p>Preț unitar: ${(item.price || 0).toFixed(2)} RON</p>
              <p>Cantitate: ${item.quantity || 1}</p>
              <p><strong>Subtotal: ${((item.price || 0) * (item.quantity || 1)).toFixed(2)} RON</strong></p>
            </div>
          `
                  )
                  .join("")
              : "<p>Nu au fost găsite produse</p>"
          }
        </div>
        
        <h3>Date client:</h3>
        <p><strong>Nume:</strong> ${orderData.firstName || orderData.name} ${orderData.lastName || ""}</p>
        <p><strong>Email:</strong> ${orderData.email}</p>
        <p><strong>Telefon:</strong> ${orderData.phone}</p>
        
        <h3>Adresa de livrare:</h3>
        <p>${orderData.address}<br>
        ${orderData.city}, ${orderData.county}<br>
        Cod poștal: ${orderData.postalCode}</p>
        
        <p>Contactează clientul pentru confirmarea comenzii.</p>
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
    console.log("📧 Trimit emailurile...");
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
