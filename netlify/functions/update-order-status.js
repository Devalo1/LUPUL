/**
 * Funcție Netlify pentru actualizarea statusului comenzilor în Firebase
 * Se apelează când o plată NETOPIA este confirmată pentru a actualiza statusul în baza de date
 */

const admin = require("firebase-admin");

// Inițializează Firebase Admin SDK (dacă nu e deja inițializat)
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : null;

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`,
    });
    console.log("✅ Firebase Admin SDK initialized");
  } else {
    console.log(
      "⚠️ Firebase Admin SDK not initialized - no service account key"
    );
  }
}

/**
 * Actualizează statusul unei comenzi în Firebase
 */
async function updateOrderInFirebase(orderNumber, status, notes = "") {
  try {
    if (!admin.apps.length) {
      throw new Error("Firebase Admin SDK not initialized");
    }

    const db = admin.firestore();

    // Caută comanda după orderNumber
    const ordersRef = db.collection("orders");
    const query = ordersRef.where("orderNumber", "==", orderNumber);
    const snapshot = await query.get();

    if (snapshot.empty) {
      console.log(`⚠️ Nu s-a găsit comanda cu numărul: ${orderNumber}`);
      return { success: false, message: "Comanda nu a fost găsită" };
    }

    // Actualizează toate documentele găsite (ar trebui să fie unul singur)
    const updatePromises = [];
    snapshot.forEach((doc) => {
      const updateData = {
        status: status,
        paymentStatus: status === "paid" ? "paid" : "pending",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (notes) {
        updateData.adminNotes = notes;
      }

      updatePromises.push(doc.ref.update(updateData));
      console.log(
        `✅ Actualizez comanda ${orderNumber} cu statusul: ${status}`
      );
    });

    await Promise.all(updatePromises);

    return {
      success: true,
      message: `Status actualizat pentru comanda ${orderNumber}`,
      updatedDocuments: snapshot.size,
    };
  } catch (error) {
    console.error("❌ Eroare la actualizarea comenzii în Firebase:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Handler principal
 */
export const handler = async (event, context) => {
  // Headers CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Răspunde la preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Acceptă doar POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { orderNumber, status, notes } = JSON.parse(event.body || "{}");

    if (!orderNumber || !status) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Order number and status are required",
        }),
      };
    }

    console.log(
      `📋 Actualizez statusul pentru comanda: ${orderNumber} → ${status}`
    );

    const result = await updateOrderInFirebase(orderNumber, status, notes);

    if (result.success) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: result.message,
          orderNumber: orderNumber,
          newStatus: status,
          updatedDocuments: result.updatedDocuments,
        }),
      };
    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          message: result.message,
          orderNumber: orderNumber,
        }),
      };
    }
  } catch (error) {
    console.error("Error updating order status:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
    };
  }
};
