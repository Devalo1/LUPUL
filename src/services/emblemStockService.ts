import { db } from "../firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

export type EmblemType =
  | "lupul_intelepta"
  | "corbul_mistic"
  | "gardianul_wellness"
  | "cautatorul_lumina";

export interface EmblemStock {
  lupul_intelepta: number;
  corbul_mistic: number;
  gardianul_wellness: number;
  cautatorul_lumina: number;
  lastUpdated: Date;
  updatedBy: string;
}

export class EmblemStockService {
  private static readonly COLLECTION = "emblem_stocks";
  private static readonly DOCUMENT_ID = "current_stock";

  static async getStock(): Promise<EmblemStock> {
    try {
      const docRef = doc(db, this.COLLECTION, this.DOCUMENT_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          lupul_intelepta: data.lupul_intelepta || 0,
          corbul_mistic: data.corbul_mistic || 0,
          gardianul_wellness: data.gardianul_wellness || 0,
          cautatorul_lumina: data.cautatorul_lumina || 0,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
          updatedBy: data.updatedBy || "unknown",
        };
      } else {
        // Initialize with default stock
        const defaultStock: EmblemStock = {
          lupul_intelepta: 100,
          corbul_mistic: 100,
          gardianul_wellness: 100,
          cautatorul_lumina: 100,
          lastUpdated: new Date(),
          updatedBy: "system",
        };

        await this.updateStock(defaultStock, "system");
        return defaultStock;
      }
    } catch (error) {
      console.error("Error getting emblem stock:", error);
      throw new Error("Failed to get emblem stock");
    }
  }

  static async updateStock(
    stock: Partial<EmblemStock>,
    adminId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, this.DOCUMENT_ID);

      const updateData = {
        ...stock,
        lastUpdated: new Date(),
        updatedBy: adminId,
      };

      await setDoc(docRef, updateData, { merge: true });

      // Log stock change for audit
      await this.logStockChange(stock, adminId);
    } catch (error) {
      console.error("Error updating emblem stock:", error);
      throw new Error("Failed to update emblem stock");
    }
  }

  static async updateSingleEmblemStock(
    emblemType: EmblemType,
    newStock: number,
    adminId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, this.DOCUMENT_ID);

      await updateDoc(docRef, {
        [emblemType]: Math.max(0, newStock), // Ensure non-negative
        lastUpdated: new Date(),
        updatedBy: adminId,
      });

      // Log single emblem stock change
      await this.logStockChange(
        { [emblemType]: newStock } as Partial<EmblemStock>,
        adminId
      );
    } catch (error) {
      console.error(`Error updating ${emblemType} stock:`, error);
      throw new Error(`Failed to update ${emblemType} stock`);
    }
  }

  static async decrementStock(
    emblemType: EmblemType,
    amount: number = 1
  ): Promise<boolean> {
    try {
      const currentStock = await this.getStock();
      const currentAmount = currentStock[emblemType];

      if (currentAmount < amount) {
        return false; // Not enough stock
      }

      await this.updateSingleEmblemStock(
        emblemType,
        currentAmount - amount,
        "marketplace_sale"
      );

      return true;
    } catch (error) {
      console.error(`Error decrementing ${emblemType} stock:`, error);
      return false;
    }
  }

  static async resetAllStock(adminId: string): Promise<void> {
    try {
      const resetStock: EmblemStock = {
        lupul_intelepta: 100,
        corbul_mistic: 100,
        gardianul_wellness: 100,
        cautatorul_lumina: 100,
        lastUpdated: new Date(),
        updatedBy: adminId,
      };

      await this.updateStock(resetStock, adminId);
    } catch (error) {
      console.error("Error resetting stock:", error);
      throw new Error("Failed to reset stock");
    }
  }

  private static async logStockChange(
    changes: Partial<EmblemStock>,
    adminId: string
  ): Promise<void> {
    try {
      const logRef = doc(db, "emblem_stock_logs", `${Date.now()}_${adminId}`);

      await setDoc(logRef, {
        changes,
        adminId,
        timestamp: new Date(),
        action: "stock_update",
      });
    } catch (error) {
      console.error("Error logging stock change:", error);
      // Don't throw error for logging failures
    }
  }

  static async getStockHistory(_limit: number = 50): Promise<any[]> {
    try {
      // For now, return empty array - can implement full history later
      return [];
    } catch (error) {
      console.error("Error getting stock history:", error);
      return [];
    }
  }

  static async getStockAlerts(): Promise<
    { type: EmblemType; stock: number; threshold: number }[]
  > {
    try {
      const currentStock = await this.getStock();
      const threshold = 10; // Alert when stock is below 10

      const alerts: { type: EmblemType; stock: number; threshold: number }[] =
        [];

      Object.entries(currentStock).forEach(([type, stock]) => {
        if (
          typeof stock === "number" &&
          stock < threshold &&
          type !== "lastUpdated" &&
          type !== "updatedBy"
        ) {
          alerts.push({
            type: type as EmblemType,
            stock,
            threshold,
          });
        }
      });

      return alerts;
    } catch (error) {
      console.error("Error getting stock alerts:", error);
      return [];
    }
  }
}
