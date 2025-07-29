/**
 * Serviciul pentru gestionarea comenzilor în Firebase
 * Salvează comenzile în colecția "orders" și le asociază cu utilizatorii
 */

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../firebase";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerCounty: string;
  customerPostalCode: string;
  totalAmount: number;
  subtotal: number;
  shippingCost: number;
  items: OrderItem[];
  paymentMethod: "card" | "cash";
  paymentStatus: "pending" | "paid" | "failed" | "cancelled";
  orderDate: string;
  userId?: string; // ID-ul utilizatorului logat (dacă există)
}

export interface SavedOrder extends OrderData {
  id?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status:
    | "new"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  adminNotes?: string;
}

/**
 * Salvează o comandă în Firebase Firestore
 */
export const saveOrderToFirebase = async (
  orderData: OrderData,
  userId?: string
): Promise<string> => {
  try {
    console.log("💾 Salvez comanda în Firebase:", orderData.orderNumber);

    const orderToSave: Omit<SavedOrder, "id"> = {
      ...orderData,
      userId: userId || undefined,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      status: "new", // Statusul inițial
    };

    // Salvează în colecția principală de comenzi
    const ordersRef = collection(firestore, "orders");
    const docRef = await addDoc(ordersRef, orderToSave);

    console.log("✅ Comandă salvată cu ID:", docRef.id);

    // Dacă avem un utilizator logat, salvează și în istoricul personal
    if (userId) {
      await saveOrderToUserHistory(orderData, userId, docRef.id);
    }

    return docRef.id;
  } catch (error) {
    console.error("❌ Eroare la salvarea comenzii în Firebase:", error);
    throw new Error(
      `Nu am putut salva comanda: ${error instanceof Error ? error.message : "Eroare necunoscută"}`
    );
  }
};

/**
 * Salvează comanda în istoricul personal al utilizatorului
 */
const saveOrderToUserHistory = async (
  orderData: OrderData,
  userId: string,
  orderId: string
): Promise<void> => {
  try {
    const userOrderRef = doc(firestore, "users", userId, "orders", orderId);
    await setDoc(userOrderRef, {
      ...orderData,
      orderId: orderId,
      createdAt: serverTimestamp(),
    });

    console.log("✅ Comandă salvată în istoricul utilizatorului:", userId);
  } catch (error) {
    console.error("❌ Eroare la salvarea în istoricul utilizatorului:", error);
    // Nu aruncăm eroare - istoricul personal nu trebuie să blocheze procesul
  }
};

/**
 * Obține comenzile unui utilizator
 */
export const getUserOrders = async (userId: string): Promise<SavedOrder[]> => {
  try {
    const userOrdersRef = collection(firestore, "users", userId, "orders");
    const q = query(userOrdersRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const orders: SavedOrder[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      } as SavedOrder);
    });

    return orders;
  } catch (error) {
    console.error("❌ Eroare la obținerea comenzilor utilizatorului:", error);
    return [];
  }
};

/**
 * Obține toate comenzile pentru panoul de admin
 */
export const getAllOrders = async (): Promise<SavedOrder[]> => {
  try {
    const ordersRef = collection(firestore, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const orders: SavedOrder[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      } as SavedOrder);
    });

    return orders;
  } catch (error) {
    console.error("❌ Eroare la obținerea tuturor comenzilor:", error);
    return [];
  }
};

/**
 * Obține comenzile după status pentru admin
 */
export const getOrdersByStatus = async (
  status: string
): Promise<SavedOrder[]> => {
  try {
    const ordersRef = collection(firestore, "orders");
    const q = query(
      ordersRef,
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    const orders: SavedOrder[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      } as SavedOrder);
    });

    return orders;
  } catch (error) {
    console.error(
      `❌ Eroare la obținerea comenzilor cu status ${status}:`,
      error
    );
    return [];
  }
};

/**
 * Actualizează statusul unei comenzi
 */
export const updateOrderStatus = async (
  orderId: string,
  status: string,
  adminNotes?: string
): Promise<void> => {
  try {
    const orderRef = doc(firestore, "orders", orderId);
    await setDoc(
      orderRef,
      {
        status,
        adminNotes: adminNotes || "",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    console.log(`✅ Status comandă ${orderId} actualizat la: ${status}`);
  } catch (error) {
    console.error("❌ Eroare la actualizarea statusului comenzii:", error);
    throw error;
  }
};

/**
 * Caută comenzi după numărul comenzii
 */
export const findOrderByNumber = async (
  orderNumber: string
): Promise<SavedOrder | null> => {
  try {
    const ordersRef = collection(firestore, "orders");
    const q = query(ordersRef, where("orderNumber", "==", orderNumber));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as SavedOrder;
  } catch (error) {
    console.error("❌ Eroare la căutarea comenzii:", error);
    return null;
  }
};

export default {
  saveOrderToFirebase,
  getUserOrders,
  getAllOrders,
  getOrdersByStatus,
  updateOrderStatus,
  findOrderByNumber,
};
