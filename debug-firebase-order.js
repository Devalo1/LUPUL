import admin from "firebase-admin";

// Inițializez Firebase Admin SDK - verifică dacă există deja o aplicație
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  });
} else {
  admin.app(); // folosește aplicația existentă
}

const db = admin.firestore();

async function debugOrderData(orderId) {
  try {
    console.log(`🔍 Căutare date pentru orderId: ${orderId}`);

    // Încerc să găsesc comanda în Firebase
    const orderRef = db.collection("orders").doc(orderId);
    const doc = await orderRef.get();

    if (doc.exists) {
      console.log(`✅ Comandă găsită în Firebase:`);
      console.log(JSON.stringify(doc.data(), null, 2));
    } else {
      console.log(`❌ Comanda ${orderId} NU există în Firebase`);
    }

    // Încerc să caut în colecția orders după numărul comenzii
    const ordersCollection = db.collection("orders");
    const query = await ordersCollection
      .where("orderNumber", "==", orderId)
      .get();

    if (!query.empty) {
      console.log(`✅ Comandă găsită prin orderNumber:`);
      query.forEach((doc) => {
        console.log(`Doc ID: ${doc.id}`);
        console.log(JSON.stringify(doc.data(), null, 2));
      });
    } else {
      console.log(`❌ Nicio comandă găsită cu orderNumber: ${orderId}`);
    }
  } catch (error) {
    console.error("❌ Eroare la căutarea comenzii:", error);
  }
}

// Testez cu comanda problematică
debugOrderData("LC-1753831472978");
