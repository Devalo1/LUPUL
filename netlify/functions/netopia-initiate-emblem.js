// Inițiere plată Netopia pentru NFT Embleme
import crypto from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const handler = async (event, context) => {
  console.log("🔮 Netopia Emblem Payment Initiation");

  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const {
      orderId,
      amount,
      currency,
      description,
      customerInfo,
      emblemType,
      userId,
    } = JSON.parse(event.body);

    console.log(
      `💰 Processing emblem payment: ${emblemType} for ${amount} ${currency}`
    );

    // Determine environment
    const isProduction =
      process.env.NETOPIA_PRODUCTION_MODE === "true" ||
      process.env.NODE_ENV === "production";

    console.log(`🌍 Environment: ${isProduction ? "PRODUCTION" : "SANDBOX"}`);

    // Get credentials
    const posSignature = isProduction
      ? process.env.VITE_NETOPIA_SIGNATURE_LIVE ||
        process.env.NETOPIA_LIVE_SIGNATURE
      : process.env.VITE_PAYMENT_SANDBOX_KEY ||
        process.env.NETOPIA_SANDBOX_SIGNATURE ||
        "2ZOW-PJ5X-HYYC-IENE-APZO";

    const publicKey = isProduction
      ? process.env.NETOPIA_LIVE_PUBLIC_KEY
      : process.env.NETOPIA_LIVE_PUBLIC_KEY; // Use same for now

    const endpoint = isProduction
      ? "https://secure.netopia-payments.ro/payment/card"
      : "https://sandboxsecure.netopia-payments.ro/payment/card";

    if (!posSignature) {
      throw new Error("POS Signature not configured");
    }

    // Create payment data
    const paymentData = {
      order: {
        orderId: orderId,
        amount: amount,
        currency: currency,
        description: description,
        billing: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city,
          county: customerInfo.county,
          postalCode: customerInfo.postalCode,
          country: "RO",
        },
      },
      card: {
        acceptedCards: ["visa", "mastercard"],
      },
      customFields: {
        emblemType: emblemType,
        userId: userId,
        nftPurchase: "true",
      },
      confirmUrl: `${process.env.URL || "https://lupul-si-corbul.netlify.app"}/emblems/payment-success`,
      cancelUrl: `${process.env.URL || "https://lupul-si-corbul.netlify.app"}/emblems/mint?cancelled=true`,
    };

    console.log(
      "📦 Payment data prepared:",
      JSON.stringify(paymentData, null, 2)
    );

    // Create signature
    let signature;
    if (publicKey && isProduction) {
      // Use RSA encryption for production
      try {
        const publicKeyFormatted = publicKey.includes("-----BEGIN")
          ? publicKey
          : `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;

        const dataToEncrypt = JSON.stringify(paymentData);
        signature = crypto
          .publicEncrypt(
            {
              key: publicKeyFormatted,
              padding: crypto.constants.RSA_PKCS1_PADDING,
            },
            Buffer.from(dataToEncrypt)
          )
          .toString("base64");

        console.log("🔐 RSA signature created");
      } catch (rsaError) {
        console.log("⚠️ RSA failed, using base64 fallback:", rsaError.message);
        signature = Buffer.from(JSON.stringify(paymentData)).toString("base64");
      }
    } else {
      // Use base64 for sandbox
      signature = Buffer.from(JSON.stringify(paymentData)).toString("base64");
      console.log("📝 Base64 signature created");
    }

    // Prepare form data for redirect
    const formData = {
      signature: signature,
      data: JSON.stringify(paymentData),
    };

    // Return payment URL with form data
    const params = new URLSearchParams({
      posSignature: posSignature,
      signature: signature,
      data: JSON.stringify(paymentData),
    });

    const paymentUrl = `${endpoint}?${params.toString()}`;

    console.log("✅ Payment URL generated successfully");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: JSON.stringify({
        success: true,
        paymentUrl: paymentUrl,
        orderId: orderId,
        environment: isProduction ? "production" : "sandbox",
      }),
    };
  } catch (error) {
    console.error("❌ Netopia emblem payment error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        error: "Payment initiation failed",
        details: error.message,
      }),
    };
  }
};
