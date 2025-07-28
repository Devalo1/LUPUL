/**
 * Funcție Netlify pentru procesarea confirmărilor de plată MARKETPLACE
 * Această funcție procesează revânzările (Client → Client) cu royalty automat
 */

import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";

// Inițializează Firebase Admin (doar dacă nu e deja inițializat)
let app;
try {
  app = initializeApp();
} catch (error) {
  // App deja inițializată
}

const db = getFirestore();

// Configurare royalty și fees
const PLATFORM_FEE = 0.05; // 5% platform fee
const CREATOR_ROYALTY = 0.1; // 10% royalty creator
const CREATOR_ADDRESS = "creator_lupulsicorbul";

/**
 * Procesează vânzarea marketplace cu distribuția automată a banilor
 */
async function processMarketplaceSale(orderData, paymentStatus) {
  try {
    console.log("🏪 Starting marketplace sale processing:", {
      orderId: orderData.orderId,
      listingId: orderData.listingId,
      seller: orderData.sellerId,
      buyer: orderData.buyerId,
      amount: orderData.amount,
      paymentStatus: paymentStatus,
    });

    if (paymentStatus !== "confirmed" && paymentStatus !== "paid") {
      throw new Error(`Payment not confirmed. Status: ${paymentStatus}`);
    }

    // Parse orderData din orderId
    const orderIdParts = orderData.orderId.split("_");
    if (orderIdParts.length < 4 || orderIdParts[0] !== "marketplace") {
      throw new Error("Invalid marketplace order ID format");
    }

    const listingId = orderIdParts[1];
    const buyerId = orderIdParts[2];

    // Obține listing-ul din Firestore
    const listingRef = db.collection("marketplaceListings").doc(listingId);
    const listingDoc = await listingRef.get();

    if (!listingDoc.exists) {
      throw new Error("Listing not found in database");
    }

    const listing = listingDoc.data();

    if (!listing.isActive) {
      throw new Error("Listing is no longer active");
    }

    // Calculează distribuția banilor
    const salePrice = listing.price;
    const platformFee = salePrice * PLATFORM_FEE; // 5% pentru platformă
    const royaltyFee = salePrice * CREATOR_ROYALTY; // 10% pentru creator (TU!)
    const sellerProfit = salePrice - platformFee - royaltyFee; // 85% pentru vânzător

    console.log("💰 Money distribution:", {
      salePrice: salePrice,
      platformFee: platformFee,
      royaltyFee: royaltyFee,
      sellerProfit: sellerProfit,
      sellerReceives: `${((sellerProfit / salePrice) * 100).toFixed(1)}%`,
      creatorReceives: `${((royaltyFee / salePrice) * 100).toFixed(1)}%`,
      platformReceives: `${((platformFee / salePrice) * 100).toFixed(1)}%`,
    });

    // Inițiază batch transaction pentru consistență
    const batch = db.batch();

    // 1. Transferă emblema către noul proprietar
    const emblemRef = db.collection("emblems").doc(listing.emblemId);
    batch.update(emblemRef, {
      userId: buyerId, // Noul proprietar
      previousOwners: FieldValue.increment(1),
      lastSalePrice: salePrice,
      lastSaleDate: Timestamp.now(),
      isListed: false,
      listingPrice: null,
      marketplaceSales: FieldValue.increment(1),
    });

    // 2. Dezactivează listing-ul
    batch.update(listingRef, {
      isActive: false,
      soldDate: Timestamp.now(),
      buyerId: buyerId,
      finalSalePrice: salePrice,
      paymentStatus: "completed",
    });

    // 3. Înregistrează tranzacția marketplace
    const transactionId = `sale_${listing.emblemId}_${Date.now()}`;
    const transactionRef = db.collection("marketplaceSales").doc(transactionId);
    batch.set(transactionRef, {
      id: transactionId,
      emblemId: listing.emblemId,
      sellerId: listing.sellerId,
      buyerId: buyerId,
      salePrice: salePrice,
      platformFee: platformFee,
      royaltyFee: royaltyFee,
      sellerProfit: sellerProfit,
      timestamp: Timestamp.now(),
      paymentId: orderData.orderId,
      paymentMethod: "netopia_marketplace",
      type: "marketplace_sale",
    });

    // 4. Actualizează earnings pentru creator (TU!)
    const creatorEarningsRef = db
      .collection("royaltyEarnings")
      .doc(CREATOR_ADDRESS);
    batch.set(
      creatorEarningsRef,
      {
        totalEarned: FieldValue.increment(royaltyFee),
        lastEarning: royaltyFee,
        lastEarningDate: Timestamp.now(),
        totalSales: FieldValue.increment(1),
        lastSaleDetails: {
          emblemType: listing.emblem?.type || "unknown",
          salePrice: salePrice,
          royaltyAmount: royaltyFee,
          timestamp: Timestamp.now(),
        },
      },
      { merge: true }
    );

    // 5. Actualizează platform earnings
    const platformEarningsRef = db.collection("platformEarnings").doc("total");
    batch.set(
      platformEarningsRef,
      {
        totalEarned: FieldValue.increment(platformFee),
        lastEarning: platformFee,
        lastEarningDate: Timestamp.now(),
        marketplaceSales: FieldValue.increment(1),
      },
      { merge: true }
    );

    // 6. Actualizează seller earnings
    const sellerEarningsRef = db
      .collection("sellerEarnings")
      .doc(listing.sellerId);
    batch.set(
      sellerEarningsRef,
      {
        totalEarned: FieldValue.increment(sellerProfit),
        lastEarning: sellerProfit,
        lastEarningDate: Timestamp.now(),
        totalSales: FieldValue.increment(1),
        lastSaleDetails: {
          emblemId: listing.emblemId,
          salePrice: salePrice,
          profit: sellerProfit,
          timestamp: Timestamp.now(),
        },
      },
      { merge: true }
    );

    // 7. Actualizează statusul new owner
    const newOwnerStatusRef = db.collection("userEmblemStatus").doc(buyerId);
    batch.set(newOwnerStatusRef, {
      hasEmblem: true,
      emblemId: listing.emblemId,
      emblemType: listing.emblem?.type || "unknown",
      purchaseDate: Timestamp.now(),
      purchasePrice: salePrice,
      acquisitionMethod: "marketplace_purchase",
      originalPrice: listing.emblem?.purchasePrice || 0,
    });

    // 8. Actualizează statusul old owner
    const oldOwnerStatusRef = db
      .collection("userEmblemStatus")
      .doc(listing.sellerId);
    batch.update(oldOwnerStatusRef, {
      hasEmblem: false,
      emblemId: null,
      soldDate: Timestamp.now(),
      salePrice: salePrice,
      profit: sellerProfit,
      lastSaleMethod: "marketplace_sale",
    });

    // Execută toate modificările
    await batch.commit();

    console.log("✅ Marketplace sale completed successfully:", {
      transactionId: transactionId,
      emblemId: listing.emblemId,
      seller: listing.sellerId,
      buyer: buyerId,
      salePrice: salePrice,
      creatorRoyalty: royaltyFee, // Banii tăi!
      platformFee: platformFee,
      sellerProfit: sellerProfit,
    });

    return {
      success: true,
      transactionId: transactionId,
      saleDetails: {
        emblemId: listing.emblemId,
        salePrice: salePrice,
        creatorRoyalty: royaltyFee,
        platformFee: platformFee,
        sellerProfit: sellerProfit,
      },
    };
  } catch (error) {
    console.error("❌ Error processing marketplace sale:", error);
    throw error;
  }
}

/**
 * Handler principal pentru notificările marketplace Netopia
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
    console.log("🏪 MARKETPLACE PAYMENT NOTIFICATION received:", {
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
      const params = new URLSearchParams(event.body);
      notificationData = {
        orderId: params.get("orderId"),
        status: params.get("status"),
        amount: params.get("amount"),
        signature: params.get("signature"),
        data: params.get("data"),
      };
    } else {
      notificationData = JSON.parse(event.body);
    }

    console.log("🏪 Parsed marketplace notification:", {
      orderId: notificationData.orderId,
      status: notificationData.status,
      amount: notificationData.amount,
    });

    // Validează că este o tranzacție marketplace
    if (
      !notificationData.orderId ||
      !notificationData.orderId.startsWith("marketplace_")
    ) {
      throw new Error("Not a marketplace transaction");
    }

    // Extrage datele comenzii
    const orderData = {
      orderId: notificationData.orderId,
      amount: notificationData.amount,
      status: notificationData.status,
    };

    // Procesează vânzarea marketplace după confirmarea plății
    if (
      notificationData.status === "confirmed" ||
      notificationData.status === "paid"
    ) {
      const saleResult = await processMarketplaceSale(
        orderData,
        notificationData.status
      );

      console.log("🎉 Marketplace sale processed successfully:", {
        transactionId: saleResult.transactionId,
        orderId: orderData.orderId,
        creatorEarned: saleResult.saleDetails.creatorRoyalty,
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: "Marketplace sale processed successfully",
          transactionId: saleResult.transactionId,
          creatorRoyalty: saleResult.saleDetails.creatorRoyalty,
        }),
      };
    } else {
      console.log("⏳ Marketplace payment not yet confirmed:", {
        orderId: orderData.orderId,
        status: notificationData.status,
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: "Marketplace payment status recorded",
          status: notificationData.status,
        }),
      };
    }
  } catch (error) {
    console.error(
      "🚨 Error processing marketplace payment notification:",
      error
    );

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to process marketplace payment notification",
        message: error.message,
      }),
    };
  }
};
