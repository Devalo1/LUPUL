/**
 * Funcție Netlify pentru trimiterea emailurilor de confirmare comenzi
 * Versiune optimizată pentru dezvoltare
 */

import nodemailer from "nodemailer";

export const handler = async (event, context) => {
  // Handle CORS preflight
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
    const { orderData, orderNumber, totalAmount } = JSON.parse(event.body);

    // Validăm datele primite
    if (!orderData || !orderNumber) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Date comandă lipsă" }),
      };
    }

    // Pentru dezvoltare, simulăm mereu trimiterea emailurilor
    console.log("🔧 MOD DEZVOLTARE: Simulăm trimiterea emailurilor");
    console.log("📧 Email client simulat pentru:", orderData.email);
    console.log("📧 Email admin simulat pentru: lupulsicorbul@gmail.com");
    console.log("📋 Detalii comandă:", {
      orderNumber,
      totalAmount: totalAmount + " (raw value)",
      client:
        `${orderData.firstName || orderData.name} ${orderData.lastName || ""}`.trim(),
      phone: orderData.phone,
      address: `${orderData.address}, ${orderData.city}, ${orderData.county}`,
      items: orderData.items?.length || 0,
    });

    // Email content simulation
    const customerEmailContent = `
=================================================================
📧 SIMULARE EMAIL COMANDĂ CLIENT - MOD DEZVOLTARE
=================================================================
Către: ${orderData.email}
Subiect: Confirmare comandă #${orderNumber}

Dragă ${orderData.firstName || orderData.name},

Îți mulțumim pentru comanda ta! Detaliile comenzii sunt următoarele:

PRODUSE COMANDATE:
${orderData.items?.map((item) => `- ${item.name} x ${item.quantity} = ${((item.price * item.quantity) / 100).toFixed(2)} RON`).join("\n") || "- Nu au fost găsite produse"}

Total: ${(totalAmount / 100).toFixed(2)} RON

Adresa de livrare: ${orderData.address}
Telefon: ${orderData.phone}

Te vom contacta în curând cu detalii despre livrare.

Cu stimă,
Echipa Lupul și Corbul
=================================================================
    `;

    const adminEmailContent = `
=================================================================
📧 SIMULARE EMAIL COMANDĂ ADMIN - MOD DEZVOLTARE
=================================================================
Către: lupulsicorbul@gmail.com
Subiect: Comandă nouă primită: ${orderNumber}

O nouă comandă a fost plasată pe site-ul dumneavoastră!

Detalii comandă:
- Număr comandă: ${orderNumber}
- Nume: ${orderData.firstName || orderData.name} ${orderData.lastName || ""}
- Adresă: ${orderData.address}, ${orderData.city}
- Telefon: ${orderData.phone}
- Total: ${(totalAmount / 100).toFixed(2)} RON

Produse:
${orderData.items?.map((item) => `- ${item.name} (${item.quantity}x) = ${((item.price * item.quantity) / 100).toFixed(2)} RON`).join("\n") || "- Nu au fost găsite produse"}

Accesați panoul de administrare pentru a procesa această comandă.

Sistem automatizat Lupul și Corbul
=================================================================
    `;

    console.log(customerEmailContent);
    console.log("\n");
    console.log(adminEmailContent);

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
        orderNumber: orderNumber,
        emailSent: true,
        emailDetails: {
          toCustomer: orderData.email,
          toAdmin: "lupulsicorbul@gmail.com",
          subject: `Confirmare comandă ${orderNumber}`,
          content: "Email simulat în consola serverului",
        },
      }),
    };
  } catch (error) {
    console.error("❌ Eroare procesare comandă:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        success: false,
        error: "Eroare la procesarea comenzii",
        details: error.message,
      }),
    };
  }
};
