/**
 * Funcție directă pentru crearea emblemelor în Firebase
 * Bypasses-ul pentru testare rapidă când process-payment-completion timeout-uiește
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const handler = async (event, context) => {
  console.log('🔮 Direct Emblem Creator - Starting...');

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const requestData = JSON.parse(event.body);
    console.log('🔮 Direct Emblem Creator - Request:', requestData);

    const { userId, emblems } = requestData;

    if (!userId || !emblems || !Array.isArray(emblems)) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "userId and emblems array are required" }),
      };
    }

    // Firebase configuration
    const firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
      measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
    };

    console.log('🔥 Firebase Config:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      hasApiKey: !!firebaseConfig.apiKey
    });

    // Initialize Firebase with unique app name
    const appName = `direct-emblem-creator-${Date.now()}`;
    const app = initializeApp(firebaseConfig, appName);
    const firestore = getFirestore(app);

    const createdEmblems = [];

    // Helper functions
    const getEmblemRarity = (type) => {
      const rarities = {
        'protection': 'common',
        'power': 'rare',
        'wisdom': 'legendary',
        'healing': 'uncommon',
        'courage': 'epic'
      };
      return rarities[type] || 'common';
    };

    const getEmblemAttributes = (type) => {
      const attributes = {
        'protection': { defense: 25, durability: 100 },
        'power': { attack: 30, energy: 80 },
        'wisdom': { intelligence: 40, mana: 120 },
        'healing': { recovery: 35, health: 90 },
        'courage': { morale: 45, spirit: 110 }
      };
      return attributes[type] || { power: 10 };
    };

    // Create each emblem
    for (const emblem of emblems) {
      const emblemData = {
        userId: userId,
        type: emblem.type,
        name: emblem.name || `Emblemă ${emblem.type}`,
        status: "active",
        createdAt: serverTimestamp(),
        orderId: `TEST-${Date.now()}`,
        mintedDate: serverTimestamp(),
        rarity: getEmblemRarity(emblem.type),
        attributes: getEmblemAttributes(emblem.type),
      };

      console.log('🔮 Creating emblem:', emblemData);

      const emblemRef = await addDoc(
        collection(firestore, "emblems"),
        emblemData
      );

      createdEmblems.push({
        id: emblemRef.id,
        type: emblem.type,
        name: emblemData.name,
        rarity: emblemData.rarity
      });

      console.log(`✅ Emblem created with ID: ${emblemRef.id}`);
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ 
        success: true,
        message: `${createdEmblems.length} emblems created successfully`,
        emblems: createdEmblems,
        userId: userId
      }),
    };

  } catch (error) {
    console.error('🚨 Direct Emblem Creator - Error:', error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Failed to create emblems", details: error.message }),
    };
  }
};
