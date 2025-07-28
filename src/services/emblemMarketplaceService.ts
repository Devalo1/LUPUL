// Emblem Marketplace Service - Pentru revânzări cu royalty system
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  writeBatch,
  Timestamp,
  increment,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { Emblem } from "../types/emblem";

interface MarketplaceListing {
  id: string;
  emblemId: string;
  sellerId: string;
  price: number;
  listedDate: Timestamp;
  isActive: boolean;
  emblem: Emblem;
}

interface SaleTransaction {
  id: string;
  emblemId: string;
  sellerId: string;
  buyerId: string;
  salePrice: number;
  platformFee: number;
  royaltyFee: number;
  sellerProfit: number;
  timestamp: Timestamp;
}

class EmblemMarketplaceService {
  private readonly PLATFORM_FEE = 0.05; // 5% platform fee
  private readonly ROYALTY_FEE = 0.1; // 10% royalty la creator (TU!)
  private readonly CREATOR_ADDRESS = "creator_lupulsicorbul"; // Adresa ta pentru royalties

  /**
   * Listează o emblemă pentru vânzare
   */
  async listEmblemForSale(
    emblemId: string,
    sellerId: string,
    price: number
  ): Promise<string> {
    try {
      // Verifică că utilizatorul deține emblema
      const emblem = await this.getEmblemById(emblemId);
      if (!emblem || emblem.userId !== sellerId) {
        throw new Error("Nu deții această emblemă");
      }

      if (!emblem.isTransferable) {
        throw new Error("Această emblemă nu poate fi transferată încă");
      }

      const listingId = `listing_${emblemId}_${Date.now()}`;
      const listing: MarketplaceListing = {
        id: listingId,
        emblemId: emblemId,
        sellerId: sellerId,
        price: price,
        listedDate: Timestamp.now(),
        isActive: true,
        emblem: emblem,
      };

      // Salvează listing
      await setDoc(doc(firestore, "marketplaceListings", listingId), listing);

      // Marchează emblema ca fiind la vânzare
      await updateDoc(doc(firestore, "emblems", emblemId), {
        isListed: true,
        listingPrice: price,
        listedDate: Timestamp.now(),
      });

      console.log(
        `Emblemă listată pentru vânzare: ${emblemId} la ${price} RON`
      );
      return listingId;
    } catch (error) {
      console.error("Eroare la listarea emblemei:", error);
      throw error;
    }
  }

  /**
   * Cumpără o emblemă de pe marketplace
   */
  async purchaseEmblemFromMarketplace(
    listingId: string,
    buyerId: string
  ): Promise<SaleTransaction> {
    try {
      const batch = writeBatch(firestore);

      // Obține listing-ul
      const listingDoc = await getDoc(
        doc(firestore, "marketplaceListings", listingId)
      );
      if (!listingDoc.exists()) {
        throw new Error("Listing-ul nu există");
      }

      const listing = listingDoc.data() as MarketplaceListing;
      if (!listing.isActive) {
        throw new Error("Acest listing nu mai este activ");
      }

      // Calculează distribuția banilor
      const salePrice = listing.price;
      const platformFee = salePrice * this.PLATFORM_FEE; // 5% pentru platformă
      const royaltyFee = salePrice * this.ROYALTY_FEE; // 10% pentru creator (TU!)
      const sellerProfit = salePrice - platformFee - royaltyFee; // 85% pentru vânzător

      // Creează tranzacția
      const transactionId = `sale_${listing.emblemId}_${Date.now()}`;
      const transaction: SaleTransaction = {
        id: transactionId,
        emblemId: listing.emblemId,
        sellerId: listing.sellerId,
        buyerId: buyerId,
        salePrice: salePrice,
        platformFee: platformFee,
        royaltyFee: royaltyFee,
        sellerProfit: sellerProfit,
        timestamp: Timestamp.now(),
      };

      // 1. Transferă emblema
      const emblemRef = doc(firestore, "emblems", listing.emblemId);
      batch.update(emblemRef, {
        userId: buyerId, // Noul proprietar
        previousOwners: increment(1),
        lastSalePrice: salePrice,
        lastSaleDate: Timestamp.now(),
        isListed: false,
        listingPrice: null,
      });

      // 2. Înregistrează tranzacția
      const transactionRef = doc(firestore, "marketplaceSales", transactionId);
      batch.set(transactionRef, transaction);

      // 3. Dezactivează listing-ul
      const listingRef = doc(firestore, "marketplaceListings", listingId);
      batch.update(listingRef, {
        isActive: false,
        soldDate: Timestamp.now(),
        buyerId: buyerId,
      });

      // 4. Actualizează soldurile (pentru accounting)
      // Royalty pentru creator (TU!)
      const creatorRoyaltyRef = doc(
        firestore,
        "royaltyEarnings",
        this.CREATOR_ADDRESS
      );
      batch.set(
        creatorRoyaltyRef,
        {
          totalEarned: increment(royaltyFee),
          lastEarning: royaltyFee,
          lastEarningDate: Timestamp.now(),
          totalSales: increment(1),
        },
        { merge: true }
      );

      // Platform fee
      const platformEarningsRef = doc(firestore, "platformEarnings", "total");
      batch.set(
        platformEarningsRef,
        {
          totalEarned: increment(platformFee),
          lastEarning: platformFee,
          lastEarningDate: Timestamp.now(),
        },
        { merge: true }
      );

      // Profit pentru vânzător
      const sellerEarningsRef = doc(
        firestore,
        "sellerEarnings",
        listing.sellerId
      );
      batch.set(
        sellerEarningsRef,
        {
          totalEarned: increment(sellerProfit),
          lastEarning: sellerProfit,
          lastEarningDate: Timestamp.now(),
          totalSales: increment(1),
        },
        { merge: true }
      );

      // 5. Actualizează statusul utilizatorilor
      const newOwnerStatusRef = doc(firestore, "userEmblemStatus", buyerId);
      batch.set(newOwnerStatusRef, {
        hasEmblem: true,
        emblemId: listing.emblemId,
        emblemType: listing.emblem.type,
        purchaseDate: Timestamp.now(),
        purchasePrice: salePrice,
      });

      const oldOwnerStatusRef = doc(
        firestore,
        "userEmblemStatus",
        listing.sellerId
      );
      batch.update(oldOwnerStatusRef, {
        hasEmblem: false,
        emblemId: null,
        soldDate: Timestamp.now(),
        salePrice: salePrice,
      });

      await batch.commit();

      console.log(`🎉 Emblemă vândută cu succes!`, {
        emblemId: listing.emblemId,
        seller: listing.sellerId,
        buyer: buyerId,
        salePrice: salePrice,
        yourRoyalty: royaltyFee, // Banii tăi!
      });

      return transaction;
    } catch (error) {
      console.error("Eroare la cumpărarea emblemei:", error);
      throw error;
    }
  }

  /**
   * Obține toate emblemele disponibile pe marketplace
   */
  async getMarketplaceListings(): Promise<MarketplaceListing[]> {
    try {
      const listingsQuery = query(
        collection(firestore, "marketplaceListings"),
        where("isActive", "==", true),
        orderBy("listedDate", "desc")
      );

      const snapshot = await getDocs(listingsQuery);
      return snapshot.docs.map((doc) => doc.data() as MarketplaceListing);
    } catch (error) {
      console.error("Eroare la obținerea listărilor:", error);
      return [];
    }
  }

  /**
   * Obține câștigurile tale din royalty-uri
   */
  async getCreatorRoyaltyEarnings(): Promise<{
    totalEarned: number;
    totalSales: number;
    averageRoyalty: number;
  }> {
    try {
      const royaltyDoc = await getDoc(
        doc(firestore, "royaltyEarnings", this.CREATOR_ADDRESS)
      );

      if (royaltyDoc.exists()) {
        const data = royaltyDoc.data();
        return {
          totalEarned: data.totalEarned || 0,
          totalSales: data.totalSales || 0,
          averageRoyalty:
            data.totalSales > 0 ? data.totalEarned / data.totalSales : 0,
        };
      }

      return { totalEarned: 0, totalSales: 0, averageRoyalty: 0 };
    } catch (error) {
      console.error("Eroare la obținerea royalty-urilor:", error);
      return { totalEarned: 0, totalSales: 0, averageRoyalty: 0 };
    }
  }

  /**
   * Activează transferul pentru toate emblemele (admin function)
   */
  async enableTransferForAllEmblems(): Promise<void> {
    try {
      const emblemQuery = query(collection(firestore, "emblems"));
      const snapshot = await getDocs(emblemQuery);

      const batch = writeBatch(firestore);

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          isTransferable: true,
          transferEnabledDate: Timestamp.now(),
        });
      });

      await batch.commit();
      console.log(`✅ Transfer activat pentru ${snapshot.size} embleme`);
    } catch (error) {
      console.error("Eroare la activarea transferului:", error);
      throw error;
    }
  }

  /**
   * Statistici marketplace pentru dashboard admin
   */
  async getMarketplaceStats() {
    try {
      const [salesSnapshot, listingsSnapshot, royaltyEarnings] =
        await Promise.all([
          getDocs(collection(firestore, "marketplaceSales")),
          getDocs(
            query(
              collection(firestore, "marketplaceListings"),
              where("isActive", "==", true)
            )
          ),
          this.getCreatorRoyaltyEarnings(),
        ]);

      const allSales = salesSnapshot.docs.map(
        (doc) => doc.data() as SaleTransaction
      );

      return {
        totalSales: allSales.length,
        totalVolume: allSales.reduce((sum, sale) => sum + sale.salePrice, 0),
        activeListings: listingsSnapshot.size,
        averageSalePrice:
          allSales.length > 0
            ? allSales.reduce((sum, sale) => sum + sale.salePrice, 0) /
              allSales.length
            : 0,
        yourRoyaltyEarnings: royaltyEarnings,
        platformEarnings: allSales.reduce(
          (sum, sale) => sum + sale.platformFee,
          0
        ),
      };
    } catch (error) {
      console.error("Eroare la calcularea statisticilor:", error);
      return null;
    }
  }

  private async getEmblemById(emblemId: string): Promise<Emblem | null> {
    try {
      const emblemDoc = await getDoc(doc(firestore, "emblems", emblemId));
      return emblemDoc.exists() ? (emblemDoc.data() as Emblem) : null;
    } catch (error) {
      console.error("Eroare la obținerea emblemei:", error);
      return null;
    }
  }
}

export const emblemMarketplaceService = new EmblemMarketplaceService();
export default emblemMarketplaceService;
