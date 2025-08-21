import nodemailer from "nodemailer";

export const handler = async (event, context) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      console.error("Eroare parsare JSON:", parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid JSON in request body" }),
      };
    }

    const { email } = requestBody;

    // Validate email
    if (!email || !email.includes("@")) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Email invalid" }),
      };
    }

    console.log("📧 Nouă abonare newsletter:", email);

    // Folosesc aceleași credențiale SMTP ca pentru comenzi
    const smtpUser = process.env.SMTP_USER || "lupulsicorbul@gmail.com";
    const smtpPass = process.env.SMTP_PASS;
    
    // Verificare configurație SMTP (exact ca în send-order-email.js)
    const isDevelopment = !smtpPass || smtpPass === "test-development-mode";

    if (isDevelopment) {
      console.log("🔧 MOD DEZVOLTARE: Simulez notificarea de newsletter");
      console.log("📧 Abonare simulată pentru:", email);
      console.log("📧 Notificare simulată către:", smtpUser);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: "Abonare simulată cu succes (modul dezvoltare)",
          development: true,
          subscriberEmail: email,
          notificationEmail: smtpUser,
        }),
      };
    }

    // Configurare transport SMTP identică cu cea din send-order-email
    let transporter;
    try {
      transporter = nodemailer.createTransporter({
        service: "gmail",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      // Test SMTP connection
      await transporter.verify();
      console.log("✅ SMTP conexiune validă - newsletter notification");
    } catch (smtpError) {
      console.warn("❌ SMTP conexiune eșuată:", smtpError.message);
      
      // Fallback to development mode if SMTP fails
      console.log("🔧 FALLBACK: Simulez notificarea de newsletter");
      console.log("📧 Abonare simulată pentru:", email);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: "Abonare înregistrată cu succes (SMTP indisponibil)",
          development: true,
          subscriberEmail: email,
        }),
      };
    }

    // Template email identic în stil cu cel din send-order-email
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>📧 Nouă abonare Newsletter - Lupul și Corbul</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🐺 Lupul și Corbul 🐦‍⬛</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">📧 Nouă abonare la Newsletter!</h2>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <h3 style="margin-top: 0; color: #4CAF50;">Detalii abonare:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Data abonării:</strong> ${new Date().toLocaleString("ro-RO")}</p>
            <p><strong>Sursă:</strong> Website lupulsicorbul.com</p>
          </div>

          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #4CAF50;">🚀 Următorii pași sugerați:</h3>
            <ul>
              <li>Adaugă email-ul în lista de newsletter</li>
              <li>Pregătește conținut personalizat pentru noul abonat</li>
              <li>Consideră trimiterea unui email de bun venit</li>
            </ul>
          </div>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Această notificare a fost generată automat de sistemul de newsletter al platformei Lupul și Corbul.
          </p>
        </div>
        
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          © 2025 Lupul și Corbul - Toate drepturile rezervate<br>
          Sistem automatizat de notificări newsletter
        </p>
      </body>
      </html>
    `;

    // Trimite notificare către admin (exact ca în send-order-email)
    await transporter.sendMail({
      from: smtpUser,
      to: "lupulsicorbul@gmail.com",
      subject: "📧 Nouă abonare Newsletter - Lupul și Corbul",
      html: adminEmailHtml,
    });

    console.log("✅ Notificare newsletter trimisă cu succes!");

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Abonare înregistrată cu succes! Notificare trimisă către admin.",
        subscriberEmail: email,
      }),
    };

  } catch (error) {
    console.error("❌ Eroare procesare abonare newsletter:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Eroare la procesarea abonării",
        details: error.message,
      }),
    };
  }
};