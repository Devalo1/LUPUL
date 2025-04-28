import { db } from "../firebase";
import { runTransaction, collection, doc, Timestamp } from "firebase/firestore";

export interface ProductionOrder {
  productId: string;
  quantity: number;
  scheduledDate: Date;
  createdBy: string;
}

export class ProductionService {
  /**
   * Creează o comandă de producție și actualizează stocul în aceeași tranzacție
   */
  async createProductionOrder(order: ProductionOrder): Promise<string> {
    const ordersCol = collection(db, "productionOrders");
    const inventoryRef = doc(db, "inventory", order.productId);

    return runTransaction(db, async tx => {
      console.log("Start transaction pentru", order.productId);
      const invSnap = await tx.get(inventoryRef);
      if (!invSnap.exists()) {
        console.error("Produs inexistent:", order.productId);
        throw new Error("Produs inexistent în stoc");
      }

      const currentStock = invSnap.data().stock as number;
      if (order.quantity > currentStock) {
        console.error("Stoc insuficient:", currentStock, "<", order.quantity);
        throw new Error("Stoc insuficient pentru producție");
      }

      tx.update(inventoryRef, {
        stock: currentStock - order.quantity,
        updatedAt: Timestamp.now()
      });

      const newOrderRef = doc(ordersCol);
      tx.set(newOrderRef, {
        productId: order.productId,
        quantity: order.quantity,
        scheduledDate: Timestamp.fromDate(order.scheduledDate),
        createdBy: order.createdBy,
        createdAt: Timestamp.now(),
        status: "scheduled"
      });

      console.log("Transaction committed, orderId=", newOrderRef.id);
      return newOrderRef.id;
    });
  }
}