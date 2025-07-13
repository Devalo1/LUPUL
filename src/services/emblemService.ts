// Emblem Service - Business Logic pentru sistemul de embleme
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  orderBy,
  increment,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { firestore } from "../firebase";
import {
  Emblem,
  EmblemMetadata,
  UserEmblemStatus,
  EMBLEM_COLLECTIONS,
  ENGAGEMENT_ACTIONS,
  EVOLUTION_LEVELS,
} from "../types/emblem";

class EmblemService {
  // Generează metadate unice pentru emblemă
  private generateEmblemMetadata(
    emblemType: string,
    userId: string
  ): EmblemMetadata {
    const collection = EMBLEM_COLLECTIONS[emblemType];
    const userHash = this.hashUserId(userId);

    const rarityRand = Math.random();
    let rarity: "common" | "rare" | "epic" | "legendary";

    if (rarityRand > 0.95) rarity = "legendary";
    else if (rarityRand > 0.85) rarity = "epic";
    else if (rarityRand > 0.65) rarity = "rare";
    else rarity = "common";

    const baseAttributes = {
      strength: 50 + (userHash % 30),
      wisdom: 50 + ((userHash * 2) % 30),
      mysticism: 50 + ((userHash * 3) % 30),
      wellness: 50 + ((userHash * 4) % 30),
    };

    // Bonus-uri pentru raritate
    const rarityBonus = {
      common: 0,
      rare: 10,
      epic: 25,
      legendary: 50,
    };

    const bonus = rarityBonus[rarity];
    Object.keys(baseAttributes).forEach((key) => {
      baseAttributes[key as keyof typeof baseAttributes] += bonus;
    });

    const uniqueTraits = this.generateUniqueTraits(
      emblemType,
      rarity,
      userHash
    );

    return {
      uniqueTraits,
      image: `${collection.image}?v=${userHash}`,
      description: `${collection.description} - Ediție unică pentru proprietar`,
      rarity,
      attributes: baseAttributes,
    };
  }

  // Generează trăsături unice
  private generateUniqueTraits(
    emblemType: string,
    rarity: string,
    userHash: number
  ): string[] {
    const traitPools = {
      lupul_intelepta: [
        "Ochii Înțelepți",
        "Blana Argintie",
        "Coama Majestică",
        "Privirea Pătrunde",
        "Sufletul Vechi",
        "Ghidarea Divină",
        "Protecția Ancestrală",
      ],
      corbul_mistic: [
        "Penele Mistice",
        "Ochiul Profetic",
        "Ciocul Filosofic",
        "Zborul Silent",
        "Cunoașterea Ascunsă",
        "Înțelepciunea Străveche",
        "Ghidarea Spirituală",
      ],
      gardianul_wellness: [
        "Aura Calmă",
        "Energia Vindecătoare",
        "Echilibrul Perfect",
        "Seninătatea Interioară",
        "Forța Vitală",
        "Armonia Naturală",
        "Protecția Emoțională",
      ],
      cautatorul_lumina: [
        "Speranța Vie",
        "Luminozitatea Interioară",
        "Călătoria Începe",
        "Curiositatea Pură",
        "Potențialul Ascuns",
        "Drumul Deschis",
        "Prima Scânteie",
      ],
    };

    const pool = traitPools[emblemType as keyof typeof traitPools] || [];
    const numTraits =
      rarity === "legendary"
        ? 4
        : rarity === "epic"
          ? 3
          : rarity === "rare"
            ? 2
            : 1;

    const selectedTraits: string[] = [];
    for (let i = 0; i < numTraits; i++) {
      const traitIndex = (userHash + i * 7) % pool.length;
      if (!selectedTraits.includes(pool[traitIndex])) {
        selectedTraits.push(pool[traitIndex]);
      }
    }

    return selectedTraits;
  }

  // Hash simplu pentru userId
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  // Mintează o emblemă nouă
  async mintEmblem(
    userId: string,
    emblemType: string,
    paymentId: string
  ): Promise<Emblem> {
    try {
      // Verifică dacă utilizatorul are deja o emblemă
      const existingEmblem = await this.getUserEmblem(userId);
      if (existingEmblem) {
        throw new Error("Utilizatorul are deja o emblemă");
      }

      // Verifică disponibilitatea
      const collection = EMBLEM_COLLECTIONS[emblemType];
      if (!collection) {
        throw new Error("Tipul de emblemă nu există");
      }

      // Verifică stocul
      const availableCount = await this.getAvailableCount(emblemType);
      if (availableCount <= 0) {
        throw new Error("Emblema nu mai este disponibilă");
      }

      const emblemId = `emblem_${userId}_${Date.now()}`;
      const metadata = this.generateEmblemMetadata(emblemType, userId);

      const emblem: Emblem = {
        id: emblemId,
        userId,
        type: emblemType as any,
        mintDate: Timestamp.now(),
        level: "bronze",
        engagement: 0,
        benefits: collection.benefits,
        metadata,
        isTransferable: false, // Poate fi activat mai târziu
        purchasePrice: collection.price,
      };

      // Batch write pentru consistență
      const batch = writeBatch(firestore);

      // Salvează emblema
      const emblemRef = doc(firestore, "emblems", emblemId);
      batch.set(emblemRef, emblem);

      // Actualizează stocul
      const collectionRef = doc(firestore, "emblemCollections", emblemType);
      batch.update(collectionRef, {
        available: increment(-1),
        lastSale: Timestamp.now(),
      });

      // Actualizează statusul utilizatorului
      const userStatusRef = doc(firestore, "userEmblemStatus", userId);
      batch.set(userStatusRef, {
        hasEmblem: true,
        emblemId: emblemId,
        emblemType: emblemType,
        purchaseDate: Timestamp.now(),
        totalEngagement: 0,
        eventsAttended: 0,
        communityRank: 0,
      });

      // Înregistrează tranzacția
      const transactionRef = doc(
        firestore,
        "emblemTransactions",
        `transaction_${Date.now()}`
      );
      batch.set(transactionRef, {
        emblemId,
        userId,
        emblemType,
        price: collection.price,
        paymentId,
        timestamp: Timestamp.now(),
        type: "purchase",
      });

      await batch.commit();

      console.log(`Emblemă ${emblemType} mintată cu succes pentru ${userId}`);
      return emblem;
    } catch (error) {
      console.error("Eroare la mintarea emblemei:", error);
      throw error;
    }
  }

  // Obține emblema unui utilizator
  async getUserEmblem(userId: string): Promise<Emblem | null> {
    try {
      const emblemQuery = query(
        collection(firestore, "emblems"),
        where("userId", "==", userId)
      );

      const snapshot = await getDocs(emblemQuery);

      if (snapshot.empty) {
        return null;
      }

      return snapshot.docs[0].data() as Emblem;
    } catch (error) {
      console.error("Eroare la obținerea emblemei:", error);
      return null;
    }
  }

  // Obține statusul complet al emblemei utilizatorului
  async getUserEmblemStatus(userId: string): Promise<UserEmblemStatus> {
    try {
      const emblem = await this.getUserEmblem(userId);

      if (!emblem) {
        return {
          hasEmblem: false,
          totalEngagement: 0,
          eventsAttended: 0,
          communityRank: 0,
        };
      }

      // Calculează rank-ul în comunitate (simplificat)
      const allEmblemsQuery = query(
        collection(firestore, "emblems"),
        orderBy("engagement", "desc")
      );

      const snapshot = await getDocs(allEmblemsQuery);
      const allEmblems = snapshot.docs.map((doc) => doc.data());
      const userRank = allEmblems.findIndex((e) => e.userId === userId) + 1;

      // Verifică dacă poate evolua
      const currentLevel = emblem.level;
      const nextLevel = this.getNextEvolutionLevel(currentLevel);
      const canEvolveTo =
        nextLevel &&
        emblem.engagement >=
          EVOLUTION_LEVELS[nextLevel as keyof typeof EVOLUTION_LEVELS]
            .engagement
          ? nextLevel
          : undefined;

      return {
        hasEmblem: true,
        emblem,
        totalEngagement: emblem.engagement,
        eventsAttended: await this.getUserEventAttendance(userId),
        communityRank: userRank,
        canEvolveTo,
      };
    } catch (error) {
      console.error("Eroare la obținerea statusului emblemei:", error);
      return {
        hasEmblem: false,
        totalEngagement: 0,
        eventsAttended: 0,
        communityRank: 0,
      };
    }
  }

  // Verifică dacă utilizatorul poate participa la un eveniment
  async canUserAttendEvent(
    userId: string,
    requiredTier: number
  ): Promise<boolean> {
    try {
      const emblem = await this.getUserEmblem(userId);
      if (!emblem) return false;

      const collection = EMBLEM_COLLECTIONS[emblem.type];
      return collection.tier >= requiredTier;
    } catch (error) {
      console.error("Eroare la verificarea accesului la eveniment:", error);
      return false;
    }
  }

  // Adaugă puncte de engagement
  async addEngagement(
    userId: string,
    action: keyof typeof ENGAGEMENT_ACTIONS,
    details?: any
  ): Promise<boolean> {
    try {
      const emblem = await this.getUserEmblem(userId);
      if (!emblem) return false;

      const points = ENGAGEMENT_ACTIONS[action] || 0;
      const newEngagement = emblem.engagement + points;

      // Verifică dacă poate evolua
      const currentLevel = emblem.level;
      const newLevel = this.calculateLevel(newEngagement);

      const batch = writeBatch(firestore);

      // Actualizează emblema
      const emblemRef = doc(firestore, "emblems", emblem.id);
      const updateData: any = {
        engagement: newEngagement,
        lastActivity: Timestamp.now(),
      };

      if (newLevel !== currentLevel) {
        updateData.level = newLevel;
        updateData.benefits = [
          ...emblem.benefits,
          ...EVOLUTION_LEVELS[newLevel].benefits,
        ];

        // Log evoluția
        console.log(
          `Emblemă evoluată: ${userId} de la ${currentLevel} la ${newLevel}`
        );
      }

      batch.update(emblemRef, updateData);

      // Înregistrează activitatea
      const activityRef = doc(
        firestore,
        "emblemActivities",
        `activity_${Date.now()}`
      );
      batch.set(activityRef, {
        userId,
        emblemId: emblem.id,
        action,
        points,
        details: details || {},
        timestamp: Timestamp.now(),
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error("Eroare la adăugarea engagement:", error);
      return false;
    }
  }

  // Calculează nivelul pe baza engagement-ului
  private calculateLevel(
    engagement: number
  ): "bronze" | "silver" | "gold" | "platinum" | "diamond" {
    if (engagement >= 2500) return "diamond";
    if (engagement >= 1000) return "platinum";
    if (engagement >= 500) return "gold";
    if (engagement >= 100) return "silver";
    return "bronze";
  }

  // Obține următorul nivel de evoluție
  private getNextEvolutionLevel(currentLevel: string): string | null {
    const levels = ["bronze", "silver", "gold", "platinum", "diamond"];
    const currentIndex = levels.indexOf(currentLevel);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  }

  // Obține numărul de embleme disponibile
  async getAvailableCount(emblemType: string): Promise<number> {
    try {
      const collectionDoc = await getDoc(
        doc(firestore, "emblemCollections", emblemType)
      );
      if (collectionDoc.exists()) {
        return collectionDoc.data().available || 0;
      }
      return EMBLEM_COLLECTIONS[emblemType]?.available || 0;
    } catch (error) {
      console.error("Eroare la verificarea stocului:", error);
      return 0;
    }
  }

  // Inițializează colecțiile în Firestore
  async initializeCollections(): Promise<void> {
    try {
      const batch = writeBatch(firestore);

      Object.entries(EMBLEM_COLLECTIONS).forEach(([key, collection]) => {
        const collectionRef = doc(firestore, "emblemCollections", key);
        batch.set(collectionRef, {
          ...collection,
          createdAt: Timestamp.now(),
          sold: 0,
        });
      });

      await batch.commit();
      console.log("Colecțiile de embleme au fost inițializate");
    } catch (error) {
      console.error("Eroare la inițializarea colecțiilor:", error);
    }
  }

  // Helper: obține numărul de evenimente la care a participat utilizatorul
  private async getUserEventAttendance(userId: string): Promise<number> {
    try {
      const attendanceQuery = query(
        collection(firestore, "eventRegistrations"),
        where("userId", "==", userId),
        where("attended", "==", true)
      );

      const snapshot = await getDocs(attendanceQuery);
      return snapshot.size;
    } catch (error) {
      console.error("Eroare la obținerea prezenței la evenimente:", error);
      return 0;
    }
  }

  // Obține toate emblemele (pentru admin)
  async getAllEmblems(): Promise<Emblem[]> {
    try {
      const snapshot = await getDocs(collection(firestore, "emblems"));
      return snapshot.docs.map((doc) => doc.data() as Emblem);
    } catch (error) {
      console.error("Eroare la obținerea tuturor emblemelor:", error);
      return [];
    }
  }

  // Statistici pentru dashboard admin
  async getEmblemStats() {
    try {
      const emblems = await this.getAllEmblems();

      const stats = {
        totalSold: emblems.length,
        totalRevenue: emblems.reduce(
          (sum, emblem) => sum + emblem.purchasePrice,
          0
        ),
        byType: {} as Record<string, number>,
        byLevel: {} as Record<string, number>,
        averageEngagement:
          emblems.reduce((sum, emblem) => sum + emblem.engagement, 0) /
            emblems.length || 0,
      };

      emblems.forEach((emblem) => {
        stats.byType[emblem.type] = (stats.byType[emblem.type] || 0) + 1;
        stats.byLevel[emblem.level] = (stats.byLevel[emblem.level] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error("Eroare la calcularea statisticilor:", error);
      return null;
    }
  }
}

export const emblemService = new EmblemService();
export default emblemService;
