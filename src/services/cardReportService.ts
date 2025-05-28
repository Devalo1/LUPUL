import {
  Timestamp,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "../firebase";

export interface CardReport {
  id?: string;
  date: Date;
  totalCard: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class CardReportService {
  static async createCardReport(
    reportData: Omit<CardReport, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const docRef = await addDoc(collection(firestore, "cardReports"), {
      ...reportData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  }

  static async getCardReports(
    startDate?: Date,
    endDate?: Date
  ): Promise<CardReport[]> {
    let q = query(
      collection(firestore, "cardReports"),
      orderBy("date", "desc")
    );
    if (startDate && endDate) {
      q = query(
        collection(firestore, "cardReports"),
        where("date", ">=", Timestamp.fromDate(startDate)),
        where("date", "<=", Timestamp.fromDate(endDate)),
        orderBy("date", "desc")
      );
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as CardReport[];
  }

  static async updateCardReport(
    id: string,
    data: Partial<CardReport>
  ): Promise<void> {
    await updateDoc(doc(firestore, "cardReports", id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  }

  static async deleteCardReport(id: string): Promise<void> {
    await deleteDoc(doc(firestore, "cardReports", id));
  }
}
