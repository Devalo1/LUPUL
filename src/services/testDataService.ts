import { firestore } from "../firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { Emblem } from "../types/emblem";

export const testDataService = {
  createTestEmblem: async (userId: string, type: string = "lupul_înțelept") => {
    const emblemId = `dev_emblem_${userId}_${Date.now()}`;
    const emblem: Emblem = {
      id: emblemId,
      userId,
      type,
      mintDate: Timestamp.now(),
      level: "bronze",
      engagement: Math.floor(Math.random() * 1000),
      benefits: ["Test benefit"],
      metadata: {
        uniqueTraits: ["Test Trait 1", "Test Trait 2"],
        image: "/images/emblem-placeholder.png",
        description: `${type} de test (dev)`,
        rarity: Math.random() > 0.5 ? "rare" : "common",
        attributes: {
          strength: 50 + Math.floor(Math.random() * 50),
          wisdom: 50 + Math.floor(Math.random() * 50),
          mysticism: 50 + Math.floor(Math.random() * 50),
          wellness: 50 + Math.floor(Math.random() * 50)
        },
      },
      isTransferable: true,
      purchasePrice: 100 + Math.floor(Math.random() * 900),
    };

    await setDoc(doc(firestore, "emblems", emblemId), emblem);

    // Create transaction
    const txId = `dev_tx_${Date.now()}`;
    await setDoc(doc(firestore, "emblemTransactions", txId), {
      id: txId,
      emblemId,
      buyerId: userId,
      sellerId: "dev_seller",
      type: "purchase",
      price: emblem.purchasePrice,
      timestamp: Timestamp.now(),
    });

    // Also create a marketplace listing if requested
    if (Math.random() > 0.5) {
      const listingId = `dev_listing_${Date.now()}`;
      await setDoc(doc(firestore, "marketplaceListings", listingId), {
        id: listingId,
        emblemId: emblemId,
        sellerId: "dev_seller",
        price: emblem.purchasePrice * (1 + Math.random()),
        listedDate: Timestamp.now(),
        isActive: true,
        emblem: emblem,
      });
    }

    return emblem;
  },

  createMultipleTestEmblems: async (userId: string, count: number = 3) => {
    const types = ["lupul_înțelept", "corbul_mistic", "gardianul_wellness", "cautatorul_lumina"];
    const emblems = [];
    
    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      const emblem = await testDataService.createTestEmblem(userId, type);
      emblems.push(emblem);
    }

    return emblems;
  }
};

export default testDataService;