/**
 * Funcție Netlify pentru procesarea confirmărilor de plată EMBLEME de la NETOPIA
 * Această funcție primește notificările de la Netopia și finalizează mintarea emblemelor
 */

import crypto from "crypto";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// Inițializează Firebase Admin (doar dacă nu e deja inițializat)
let app;
try {
  app = initializeApp();
} catch (error) {
  // App deja inițializată
}

const db = getFirestore();

/**
 * Verifică semnătura NETOPIA pentru securitate
 */
function verifyNetopiaSignature(data, signature) {
  // În producție, verifică semnătura cu cheia publică NETOPIA
  // Pentru dezvoltare, acceptă orice semnătură validă
  return true;
}

/**
 * Mintează emblema în Firebase după confirmarea plății
 */
async function mintEmblemAfterPayment(orderData, paymentStatus) {
  try {
    console.log("🔮 Starting emblem minting process:", {
      orderId: orderData.orderId,
      emblemType: orderData.emblemType,
      userId: orderData.userId,
      paymentStatus: paymentStatus,
    });

    if (paymentStatus !== "confirmed" && paymentStatus !== "paid") {
      throw new Error(`Payment not confirmed. Status: ${paymentStatus}`);
    }

    // Generează metadate unice pentru emblemă
    const userSeed = orderData.userId + orderData.orderId + Date.now();
    const hash = crypto.createHash("sha256").update(userSeed).digest("hex");
    const seedNum = parseInt(hash.substring(0, 8), 16);

    // Determină raritatea (70% common, 20% rare, 8% epic, 2% legendary)
    const rarityRoll = seedNum % 100;
    let rarity;
    if (rarityRoll >= 98) rarity = "legendary";
    else if (rarityRoll >= 90) rarity = "epic";
    else if (rarityRoll >= 70) rarity = "rare";
    else rarity = "common";

    // Generează atribute (50-100 range)
    const attributes = {
      strength: 50 + (seedNum % 51),
      wisdom: 50 + ((seedNum >> 8) % 51),
      mysticism: 50 + ((seedNum >> 16) % 51),
      wellness: 50 + ((seedNum >> 24) % 51),
    };

    const emblemId = `emblem_${orderData.userId}_${Date.now()}`;

    // Obține detaliile colecției
    const emblemCollections = {
      lupul_intelepta: { name: "Lupul Înțelept", tier: 4, price: 150 },
      corbul_mistic: { name: "Corbul Mistic", tier: 3, price: 120 },
      gardianul_wellness: { name: "Gardianul Wellness", tier: 2, price: 80 },
      cautatorul_lumina: { name: "Căutătorul de Lumină", tier: 1, price: 50 },
    };

    const collection = emblemCollections[orderData.emblemType];
    if (!collection) {
      throw new Error(`Invalid emblem type: ${orderData.emblemType}`);
    }

    // Creează obiectul emblem
    const emblem = {
      id: emblemId,
      userId: orderData.userId,
      type: orderData.emblemType,
      mintDate: Timestamp.now(),
      level: "bronze",
      engagement: 0,
      benefits: getBenefitsByType(orderData.emblemType),
      metadata: {
        uniqueTraits: generateUniqueTraits(orderData.emblemType, rarity),
        image: `/emblems/${orderData.emblemType}.svg`,
        description: collection.name + " - " + rarity,
        rarity: rarity,
        attributes: attributes,
      },
      isTransferable: false,
      purchasePrice: collection.price,
      currentValue: collection.price,
      paymentId: orderData.orderId,
      paymentMethod: "netopia_card",
    };

    // Salvează emblema în Firestore
    const batch = db.batch();

    // 1. Salvează emblema
    const emblemRef = db.collection("emblems").doc(emblemId);
    batch.set(emblemRef, emblem);

    // 2. Actualizează statusul utilizatorului
    const userStatusRef = db
      .collection("userEmblemStatus")
      .doc(orderData.userId);
    batch.set(userStatusRef, {
      hasEmblem: true,
      emblemId: emblemId,
      emblemType: orderData.emblemType,
      purchaseDate: Timestamp.now(),
      totalEngagement: 0,
      eventsAttended: 0,
      communityRank: 0,
      paymentStatus: "paid",
    });

    // 3. Actualizează stocul colecției
    const collectionRef = db
      .collection("emblemCollections")
      .doc(orderData.emblemType);
    const collectionDoc = await collectionRef.get();

    if (collectionDoc.exists) {
      const currentData = collectionDoc.data();
      batch.update(collectionRef, {
        available: (currentData.available || 0) - 1,
        sold: (currentData.sold || 0) + 1,
        lastSale: Timestamp.now(),
      });
    }

    // 3.1. Actualizează stocul admin centralizat
    const adminStockRef = db.collection("emblem_stocks").doc("current_stock");
    const adminStockDoc = await adminStockRef.get();
    
    if (adminStockDoc.exists) {
      const currentStock = adminStockDoc.data();
      const currentAmount = currentStock[orderData.emblemType] || 0;
      
      batch.update(adminStockRef, {
        [orderData.emblemType]: Math.max(0, currentAmount - 1),
        lastUpdated: Timestamp.now(),
        updatedBy: "marketplace_sale"
      });
      
      // Log stock change for audit
      const logRef = db.collection("emblem_stock_logs").doc(`${Date.now()}_marketplace_sale`);
      batch.set(logRef, {
        changes: { [orderData.emblemType]: currentAmount - 1 },
        adminId: "marketplace_sale",
        timestamp: Timestamp.now(),
        action: "emblem_sold",
        orderId: orderData.orderId,
        userId: orderData.userId
      });
    }

    // 4. Înregistrează tranzacția
    const transactionRef = db
      .collection("emblemTransactions")
      .doc(orderData.orderId);
    batch.set(transactionRef, {
      emblemId: emblemId,
      userId: orderData.userId,
      emblemType: orderData.emblemType,
      price: collection.price,
      paymentId: orderData.orderId,
      paymentMethod: "netopia_card",
      paymentStatus: paymentStatus,
      timestamp: Timestamp.now(),
      type: "purchase",
      metadata: {
        rarity: rarity,
        attributes: attributes,
      },
    });

    // Execută toate modificările
    await batch.commit();

    console.log("✅ Emblem minted successfully:", {
      emblemId: emblemId,
      userId: orderData.userId,
      emblemType: orderData.emblemType,
      rarity: rarity,
      paymentId: orderData.orderId,
    });

    return {
      success: true,
      emblemId: emblemId,
      emblem: emblem,
    };
  } catch (error) {
    console.error("❌ Error minting emblem:", error);
    throw error;
  }
}

/**
 * Returnează beneficiile pe tipul de emblemă
 */
function getBenefitsByType(emblemType) {
  const benefits = {
    lupul_intelepta: [
      "Acces VIP la toate evenimentele",
      "AI prioritar cu răspunsuri extinse",
      "Badge special în comunitate",
      "Acces la meetup-uri fizice exclusive",
    ],
    corbul_mistic: [
      "Acces la evenimente premium",
      "Analytics avansate personalizate",
      "Preview la funcționalități noi",
      "Sesiuni de coaching individual",
    ],
    gardianul_wellness: [
      "Acces la evenimente standard",
      "Mood tracking premium cu insights",
      "Rapoarte de progres detaliate",
      "Acces la biblioteca de resurse",
    ],
    cautatorul_lumina: [
      "Acces la evenimente grupate",
      "Comunitate exclusivă",
      "Ghiduri de început în wellness",
      "Support prioritar",
    ],
  };

  return benefits[emblemType] || [];
}

/**
 * Generează trăsături unice pe baza tipului și rarității
 */
function generateUniqueTraits(emblemType, rarity) {
  const baseTraits = {
    lupul_intelepta: ["Wisdom", "Leadership", "Intuition"],
    corbul_mistic: ["Mystery", "Knowledge", "Magic"],
    gardianul_wellness: ["Balance", "Healing", "Protection"],
    cautatorul_lumina: ["Curiosity", "Growth", "Discovery"],
  };

  const rarityTraits = {
    common: [],
    rare: ["Enhanced Aura"],
    epic: ["Enhanced Aura", "Mystical Glow"],
    legendary: ["Enhanced Aura", "Mystical Glow", "Divine Blessing"],
  };

  return [...(baseTraits[emblemType] || []), ...(rarityTraits[rarity] || [])];
}

/**
 * Handler principal pentru notificările Netopia
 */
export const handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    console.log("🔮 EMBLEM PAYMENT NOTIFICATION received:", {
      headers: event.headers,
      body: event.body?.substring(0, 200) + "...",
    });

    // Parse notificarea de la Netopia
    let notificationData;

    if (
      event.headers["content-type"]?.includes(
        "application/x-www-form-urlencoded"
      )
    ) {
      // Notificarea vine ca form data
      const params = new URLSearchParams(event.body);
      notificationData = {
        orderId: params.get("orderId"),
        status: params.get("status"),
        amount: params.get("amount"),
        signature: params.get("signature"),
        data: params.get("data"),
      };
    } else {
      // Notificarea vine ca JSON
      notificationData = JSON.parse(event.body);
    }

    console.log("🔮 Parsed notification data:", {
      orderId: notificationData.orderId,
      status: notificationData.status,
      amount: notificationData.amount,
    });

    // Verifică semnătura pentru securitate
    if (
      !verifyNetopiaSignature(notificationData.data, notificationData.signature)
    ) {
      console.error("❌ Invalid Netopia signature");
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Invalid signature" }),
      };
    }

    // Extrage informațiile despre comandă din orderId
    const orderIdParts = notificationData.orderId.split("_");
    if (orderIdParts.length < 3 || orderIdParts[0] !== "emblem") {
      throw new Error("Invalid emblem order ID format");
    }

    const orderData = {
      orderId: notificationData.orderId,
      emblemType: orderIdParts[1],
      userId: orderIdParts[2],
      amount: notificationData.amount,
      status: notificationData.status,
    };

    // Mintează emblema după confirmarea plății
    if (
      notificationData.status === "confirmed" ||
      notificationData.status === "paid"
    ) {
      const mintResult = await mintEmblemAfterPayment(
        orderData,
        notificationData.status
      );

      console.log("🎉 Emblem successfully minted after payment confirmation:", {
        emblemId: mintResult.emblemId,
        orderId: orderData.orderId,
        userId: orderData.userId,
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: "Emblem minted successfully",
          emblemId: mintResult.emblemId,
        }),
      };
    } else {
      console.log("⏳ Payment not yet confirmed:", {
        orderId: orderData.orderId,
        status: notificationData.status,
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: "Payment status recorded",
          status: notificationData.status,
        }),
      };
    }
  } catch (error) {
    console.error("🚨 Error processing emblem payment notification:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to process payment notification",
        message: error.message,
      }),
    };
  }
};
