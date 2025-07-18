/**
 * Funcție Netlify pentru trimiterea emailurilor de confirmare comandă
 * Folosește Nodemailer pentru SMTP real
 */

const nodemailer = require("nodemailer");

exports.handler = async (event, context) => {
  // Verificăm metoda HTTP
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { orderData, orderNumber, totalAmount } = JSON.parse(event.body);

    // Validăm datele primite
    if (!orderData || !orderNumber) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Date comandă lipsă" }),
      };
    }

    // Verificăm dacă suntem în modul dezvoltare/test
    const isDevelopment =
      !process.env.SMTP_PASS ||
      process.env.SMTP_PASS === "test-development-mode";

    if (isDevelopment) {
      // În modul dezvoltare, simulăm trimiterea emailurilor
      console.log("🔧 MOD DEZVOLTARE: Simulăm trimiterea emailurilor");
      console.log("📧 Email client simulat pentru:", orderData.email);
      console.log("📧 Email admin simulat pentru: lupulsicorbul@gmail.com");
      console.log("📋 Detalii comandă:", {
        orderNumber,
        totalAmount: (totalAmount / 100).toFixed(2) + " RON",
        client: `${orderData.firstName} ${orderData.lastName}`,
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
          message: "Emailuri simulate cu succes (modul dezvoltare)",
          development: true,
          customerEmail: orderData.email,
          adminEmail: "lupulsicorbul@gmail.com",
        }),
      };
    }

    // Configurare transport SMTP (folosește variabile de mediu)
    const transporter = nodemailer.createTransport({
      service: "gmail", // sau alt service SMTP
      auth: {
        user: process.env.SMTP_USER, // lupulsicorbul@gmail.com
        pass: process.env.SMTP_PASS, // parola de aplicație Gmail
      },
    });

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
          <p>Bună ${orderData.firstName} ${orderData.lastName},</p>
          <p>Comanda ta a fost înregistrată cu succes.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Detalii comandă:</h3>
            <p><strong>Numărul comenzii:</strong> ${orderNumber}</p>
            <p><strong>Total:</strong> ${(totalAmount / 100).toFixed(2)} RON</p>
            <p><strong>Data:</strong> ${new Date().toLocaleDateString("ro-RO")}</p>
          </div>

          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Produse comandate:</h3>
            ${
              orderData.items
                ? orderData.items
                    .map(
                      (item) => `
              <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <p><strong>${item.name || "Produs"}</strong></p>
                <p>Preț: ${item.price ? (item.price / 100).toFixed(2) : "N/A"} RON</p>
                <p>Cantitate: ${item.quantity || 1}</p>
                <p>Subtotal: ${item.price && item.quantity ? ((item.price * item.quantity) / 100).toFixed(2) : "N/A"} RON</p>
              </div>
            `
                    )
                    .join("")
                : "<p>Nu au fost găsite produse</p>"
            }
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Date livrare:</h3>
            <p>${orderData.firstName} ${orderData.lastName}</p>
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
        <p><strong>Total:</strong> ${(totalAmount / 100).toFixed(2)} RON</p>
        <p><strong>Data:</strong> ${new Date().toLocaleString("ro-RO")}</p>
        
        <h3>Produse comandate:</h3>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          ${
            orderData.items
              ? orderData.items
                  .map(
                    (item) => `
            <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
              <p><strong>${item.name || "Produs"}</strong></p>
              <p>Preț unitar: ${item.price ? (item.price / 100).toFixed(2) : "N/A"} RON</p>
              <p>Cantitate: ${item.quantity || 1}</p>
              <p><strong>Subtotal: ${item.price && item.quantity ? ((item.price * item.quantity) / 100).toFixed(2) : "N/A"} RON</strong></p>
            </div>
          `
                  )
                  .join("")
              : "<p>Nu au fost găsite produse</p>"
          }
        </div>
        
        <h3>Date client:</h3>
        <p><strong>Nume:</strong> ${orderData.firstName} ${orderData.lastName}</p>
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
      from: process.env.SMTP_USER,
      to: orderData.email,
      subject: `Confirmare comandă ${orderNumber} - Lupul și Corbul`,
      html: customerEmailHtml,
    };

    // Trimite email către admin
    const adminEmail = {
      from: process.env.SMTP_USER,
      to: "lupulsicorbul@gmail.com",
      subject: `Comandă nouă: ${orderNumber}`,
      html: adminEmailHtml,
    };

    // Execută trimiterea emailurilor
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
      }),
    };
  } catch (error) {
    console.error("❌ Eroare trimitere email:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        success: false,
        error: "Eroare la trimiterea emailului",
        details: error.message,
      }),
    };
  }
};
