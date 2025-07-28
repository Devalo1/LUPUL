// Procesare callback Netopia pentru NFT Embleme
import admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccountKey = {
    type: "service_account",
    project_id: process.env.VITE_FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
    databaseURL: `https://${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
}

export const handler = async (event, context) => {
  console.log("💎 Processing Netopia Emblem NFT Callback");

  try {
    // Parse callback data from Netopia
    const callbackData = JSON.parse(event.body || "{}");
    console.log("📦 Callback data:", callbackData);

    const { orderId, status, amount, signature } = callbackData;

    // Validate payment status
    if (status !== "confirmed" && status !== "paid") {
      console.log(`⚠️ Payment not confirmed: ${status}`);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Payment not confirmed yet" }),
      };
    }

    // Extract emblem info from orderId
    const orderParts = orderId.split("_");
    if (orderParts.length < 4 || orderParts[0] !== "emblem") {
      throw new Error("Invalid emblem order ID format");
    }

    const emblemType = orderParts[1];
    const userId = orderParts[2];
    const timestamp = orderParts[3];

    console.log(`🔮 Minting emblem: ${emblemType} for user: ${userId}`);

    // Generate unique emblem metadata
    const emblemMetadata = generateEmblemMetadata(emblemType, userId);

    // Create emblem document
    const emblemId = `emblem_${userId}_${timestamp}`;
    const emblem = {
      id: emblemId,
      userId: userId,
      type: emblemType,
      mintDate: admin.firestore.Timestamp.now(),
      level: "bronze",
      engagement: 0,
      benefits: getEmblemBenefits(emblemType),
      metadata: emblemMetadata,
      isTransferable: false,
      purchasePrice: amount / 100, // Convert back from bani to RON
      currentValue: amount / 100,
      paymentId: orderId,
      paymentStatus: "completed",
      nftType: "digital", // Can be upgraded to 'blockchain' later
      blockchain: null,
      tokenId: null,
    };

    const db = admin.firestore();
    const batch = db.batch();

    // Save emblem
    const emblemRef = db.collection("emblems").doc(emblemId);
    batch.set(emblemRef, emblem);

    // Update user status
    const userStatusRef = db.collection("userEmblemStatus").doc(userId);
    batch.set(userStatusRef, {
      hasEmblem: true,
      emblemId: emblemId,
      emblemType: emblemType,
      purchaseDate: admin.firestore.Timestamp.now(),
      totalEngagement: 0,
      eventsAttended: 0,
      communityRank: 0,
      nftValue: amount / 100,
    });

    // Update collection stock
    const collectionRef = db.collection("emblemCollections").doc(emblemType);
    batch.update(collectionRef, {
      available: admin.firestore.FieldValue.increment(-1),
      sold: admin.firestore.FieldValue.increment(1),
      lastSale: admin.firestore.Timestamp.now(),
      totalRevenue: admin.firestore.FieldValue.increment(amount / 100),
    });

    // Record transaction
    const transactionRef = db.collection("emblemTransactions").doc(orderId);
    batch.set(transactionRef, {
      emblemId: emblemId,
      userId: userId,
      emblemType: emblemType,
      amount: amount / 100,
      currency: "RON",
      paymentMethod: "netopia_card",
      status: "completed",
      timestamp: admin.firestore.Timestamp.now(),
      orderId: orderId,
      type: "mint",
    });

    await batch.commit();

    console.log(
      `✅ Emblem ${emblemType} successfully minted for user ${userId}`
    );

    // Send success email (optional)
    try {
      await sendEmblemMintedEmail(userId, emblem);
    } catch (emailError) {
      console.log("📧 Email sending failed:", emailError.message);
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: true,
        message: "Emblem NFT minted successfully",
        emblemId: emblemId,
        emblemType: emblemType,
      }),
    };
  } catch (error) {
    console.error("❌ Emblem minting error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "Failed to mint emblem NFT",
        details: error.message,
      }),
    };
  }
};

// Helper functions
function generateEmblemMetadata(emblemType, userId) {
  const userSeed = parseInt(userId.slice(-8), 16); // Use last 8 chars as seed
  const timeSeed = Date.now();
  const combinedSeed = userSeed + timeSeed;

  // Generate rarity (70% common, 20% rare, 8% epic, 2% legendary)
  const rarityRoll = combinedSeed % 100;
  let rarity;
  if (rarityRoll >= 98) rarity = "legendary";
  else if (rarityRoll >= 90) rarity = "epic";
  else if (rarityRoll >= 70) rarity = "rare";
  else rarity = "common";

  // Generate attributes (50-100 range)
  const attributes = {
    strength: 50 + (combinedSeed % 51),
    wisdom: 50 + ((combinedSeed >> 8) % 51),
    mysticism: 50 + ((combinedSeed >> 16) % 51),
    wellness: 50 + ((combinedSeed >> 24) % 51),
  };

  return {
    uniqueTraits: generateTraits(emblemType, rarity),
    image: `/emblems/${emblemType}.svg`,
    description: getEmblemDescription(emblemType),
    rarity: rarity,
    attributes: attributes,
    mintedAt: new Date().toISOString(),
    generation: 1,
  };
}

function generateTraits(emblemType, rarity) {
  const baseTraits = {
    lupul_intelepta: ["Wisdom", "Leadership", "Spiritual Guide"],
    corbul_mistic: ["Mystery", "Knowledge", "Mysticism"],
    gardianul_wellness: ["Healing", "Balance", "Protection"],
    cautatorul_lumina: ["Discovery", "Hope", "Beginning"],
  };

  const rarityTraits = {
    common: ["Determined"],
    rare: ["Determined", "Focused"],
    epic: ["Determined", "Focused", "Powerful"],
    legendary: ["Determined", "Focused", "Powerful", "Divine"],
  };

  return [...(baseTraits[emblemType] || []), ...rarityTraits[rarity]];
}

function getEmblemDescription(emblemType) {
  const descriptions = {
    lupul_intelepta:
      "Simbolul înțelepciunii și ghidării spirituale în comunitatea Lupul și Corbul",
    corbul_mistic:
      "Păzitorul secretelor și al cunoașterii ascunse din lumea digitală",
    gardianul_wellness:
      "Protectorul echilibrului mental și fizic al membrilor comunității",
    cautatorul_lumina:
      "Începutul călătoriei către autodescoprire și dezvoltare personală",
  };

  return (
    descriptions[emblemType] ||
    "Emblemă NFT unică din ecosistemul Lupul și Corbul"
  );
}

function getEmblemBenefits(emblemType) {
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

  return benefits[emblemType] || ["Beneficii exclusive de membru"];
}

async function sendEmblemMintedEmail(userId, emblem) {
  // Implementation for sending confirmation email
  // This would integrate with your email service
  console.log(`📧 Should send emblem minted email for ${userId}`);
}
