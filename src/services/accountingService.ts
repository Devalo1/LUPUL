import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { firestore, storage } from "../firebase";
import {
  ZReport,
  Settlement,
  Invoice,
  Stock,
  StockMovement,
  CashRegister,
  AccountingSettings,
  DocumentAttachment,
} from "../types/accounting";
import logger from "../utils/logger";

const accountingLogger = logger.createLogger("AccountingService");

export class AccountingService {
  // Z Reports
  static async createZReport(
    reportData: Omit<ZReport, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(firestore, "zReports"), {
        ...reportData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      accountingLogger.info(`Z Report created with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      accountingLogger.error("Error creating Z Report:", error);
      throw error;
    }
  }

  static async getZReports(
    startDate?: Date,
    endDate?: Date
  ): Promise<ZReport[]> {
    try {
      let q = query(collection(firestore, "zReports"), orderBy("date", "desc"));

      if (startDate && endDate) {
        q = query(
          collection(firestore, "zReports"),
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
      })) as ZReport[];
    } catch (error) {
      accountingLogger.error("Error fetching Z Reports:", error);
      throw error;
    }
  }

  static async updateZReport(
    id: string,
    data: Partial<ZReport>
  ): Promise<void> {
    try {
      await updateDoc(doc(firestore, "zReports", id), {
        ...data,
        updatedAt: Timestamp.now(),
      });
      accountingLogger.info(`Z Report updated: ${id}`);
    } catch (error) {
      accountingLogger.error("Error updating Z Report:", error);
      throw error;
    }
  }

  static async deleteZReport(id: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, "zReports", id));
      accountingLogger.info(`Z Report deleted: ${id}`);
    } catch (error) {
      accountingLogger.error("Error deleting Z Report:", error);
      throw error;
    }
  }

  // Settlements
  static async createSettlement(
    settlementData: Omit<Settlement, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(firestore, "settlements"), {
        ...settlementData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      accountingLogger.info(`Settlement created with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      accountingLogger.error("Error creating settlement:", error);
      throw error;
    }
  }

  static async getSettlements(
    startDate?: Date,
    endDate?: Date
  ): Promise<Settlement[]> {
    try {
      let q = query(
        collection(firestore, "settlements"),
        orderBy("date", "desc")
      );

      if (startDate && endDate) {
        q = query(
          collection(firestore, "settlements"),
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
      })) as Settlement[];
    } catch (error) {
      accountingLogger.error("Error fetching settlements:", error);
      throw error;
    }
  }

  static async updateSettlement(
    id: string,
    data: Partial<Settlement>
  ): Promise<void> {
    try {
      await updateDoc(doc(firestore, "settlements", id), {
        ...data,
        updatedAt: Timestamp.now(),
      });
      accountingLogger.info(`Settlement updated: ${id}`);
    } catch (error) {
      accountingLogger.error("Error updating settlement:", error);
      throw error;
    }
  }

  static async deleteSettlement(id: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, "settlements", id));
      accountingLogger.info(`Settlement deleted: ${id}`);
    } catch (error) {
      accountingLogger.error("Error deleting settlement:", error);
      throw error;
    }
  }

  // Invoices
  static async createInvoice(
    invoiceData: Omit<Invoice, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(firestore, "invoices"), {
        ...invoiceData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      accountingLogger.info(`Invoice created with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      accountingLogger.error("Error creating invoice:", error);
      throw error;
    }
  }

  static async getInvoices(
    startDate?: Date,
    endDate?: Date
  ): Promise<Invoice[]> {
    try {
      let q = query(collection(firestore, "invoices"), orderBy("date", "desc"));

      if (startDate && endDate) {
        q = query(
          collection(firestore, "invoices"),
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
        dueDate: doc.data().dueDate.toDate(),
        paymentDate: doc.data().paymentDate?.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Invoice[];
    } catch (error) {
      accountingLogger.error("Error fetching invoices:", error);
      throw error;
    }
  }

  static async updateInvoice(
    id: string,
    data: Partial<Invoice>
  ): Promise<void> {
    try {
      await updateDoc(doc(firestore, "invoices", id), {
        ...data,
        updatedAt: Timestamp.now(),
      });
      accountingLogger.info(`Invoice updated: ${id}`);
    } catch (error) {
      accountingLogger.error("Error updating invoice:", error);
      throw error;
    }
  }

  static async deleteInvoice(id: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, "invoices", id));
      accountingLogger.info(`Invoice deleted: ${id}`);
    } catch (error) {
      accountingLogger.error("Error deleting invoice:", error);
      throw error;
    }
  }

  // Stock Management
  static async createStock(
    stockData: Omit<Stock, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(firestore, "stocks"), {
        ...stockData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      accountingLogger.info(`Stock created with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      accountingLogger.error("Error creating stock:", error);
      throw error;
    }
  }

  static async getStocks(): Promise<Stock[]> {
    try {
      const snapshot = await getDocs(collection(firestore, "stocks"));
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        lastRestockDate: doc.data().lastRestockDate?.toDate(),
        lastSaleDate: doc.data().lastSaleDate?.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Stock[];
    } catch (error) {
      accountingLogger.error("Error fetching stocks:", error);
      throw error;
    }
  }

  static async updateStock(id: string, data: Partial<Stock>): Promise<void> {
    try {
      await updateDoc(doc(firestore, "stocks", id), {
        ...data,
        updatedAt: Timestamp.now(),
      });
      accountingLogger.info(`Stock updated: ${id}`);
    } catch (error) {
      accountingLogger.error("Error updating stock:", error);
      throw error;
    }
  }
  static async deleteStock(id: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, "stocks", id));
      accountingLogger.info(`Stock deleted: ${id}`);
    } catch (error) {
      accountingLogger.error("Error deleting stock:", error);
      throw error;
    }
  }

  static async createStockMovement(
    movementData: Omit<StockMovement, "id" | "createdAt">
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(firestore, "stockMovements"), {
        ...movementData,
        createdAt: Timestamp.now(),
      });
      accountingLogger.info(`Stock movement created with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      accountingLogger.error("Error creating stock movement:", error);
      throw error;
    }
  }

  static async getStockMovements(): Promise<StockMovement[]> {
    try {
      const snapshot = await getDocs(
        query(
          collection(firestore, "stockMovements"),
          orderBy("createdAt", "desc")
        )
      );
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as StockMovement[];
    } catch (error) {
      accountingLogger.error("Error fetching stock movements:", error);
      throw error;
    }
  }

  // Date range queries for calendar
  static async getZReportsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<ZReport[]> {
    try {
      const q = query(
        collection(firestore, "zReports"),
        where("date", ">=", Timestamp.fromDate(startDate)),
        where("date", "<=", Timestamp.fromDate(endDate)),
        orderBy("date", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as ZReport[];
    } catch (error) {
      accountingLogger.error("Error fetching Z Reports by date range:", error);
      throw error;
    }
  }

  static async getSettlementsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Settlement[]> {
    try {
      const q = query(
        collection(firestore, "settlements"),
        where("date", ">=", Timestamp.fromDate(startDate)),
        where("date", "<=", Timestamp.fromDate(endDate)),
        orderBy("date", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Settlement[];
    } catch (error) {
      accountingLogger.error(
        "Error fetching settlements by date range:",
        error
      );
      throw error;
    }
  }

  static async getInvoicesByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Invoice[]> {
    try {
      const q = query(
        collection(firestore, "invoices"),
        where("date", ">=", Timestamp.fromDate(startDate)),
        where("date", "<=", Timestamp.fromDate(endDate)),
        orderBy("date", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        dueDate: doc.data().dueDate.toDate(),
        paymentDate: doc.data().paymentDate?.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Invoice[];
    } catch (error) {
      accountingLogger.error("Error fetching invoices by date range:", error);
      throw error;
    }
  }

  // Alias methods for convenience
  static async getStock(): Promise<Stock[]> {
    return this.getStocks();
  }

  static async addStockItem(
    stockData: Omit<Stock, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    return this.createStock(stockData);
  }

  static async updateStockItem(
    id: string,
    data: Partial<Stock>
  ): Promise<void> {
    return this.updateStock(id, data);
  }

  static async deleteStockItem(id: string): Promise<void> {
    return this.deleteStock(id);
  }

  static async addStockMovement(
    movementData: Omit<StockMovement, "id" | "createdAt">
  ): Promise<string> {
    return this.createStockMovement(movementData);
  }

  // Cash Registers
  static async createCashRegister(
    registerData: Omit<CashRegister, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(firestore, "cashRegisters"), {
        ...registerData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      accountingLogger.info(`Cash register created with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      accountingLogger.error("Error creating cash register:", error);
      throw error;
    }
  }

  static async getCashRegisters(): Promise<CashRegister[]> {
    try {
      const snapshot = await getDocs(collection(firestore, "cashRegisters"));
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        lastZReportDate: doc.data().lastZReportDate?.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as CashRegister[];
    } catch (error) {
      accountingLogger.error("Error fetching cash registers:", error);
      throw error;
    }
  }

  // Settings
  static async getAccountingSettings(): Promise<AccountingSettings | null> {
    try {
      const docRef = doc(firestore, "settings", "accounting");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as AccountingSettings;
      }
      return null;
    } catch (error) {
      accountingLogger.error("Error fetching accounting settings:", error);
      throw error;
    }
  }

  static async updateAccountingSettings(
    settings: AccountingSettings
  ): Promise<void> {
    try {
      // Ensure only plain object is sent to Firestore (no methods, only data)
      const plainSettings = JSON.parse(JSON.stringify(settings));
      await updateDoc(doc(firestore, "settings", "accounting"), plainSettings);
      accountingLogger.info("Accounting settings updated");
    } catch (error) {
      accountingLogger.error("Error updating accounting settings:", error);
      throw error;
    }
  }

  // Attachments for settlements
  static async uploadSettlementAttachments(
    settlementId: string,
    files: File[]
  ): Promise<void> {
    // TODO: implement actual upload to Firebase Storage/API
    console.log("uploadSettlementAttachments stub", settlementId, files);
    // Fetch existing attachments
    const docRef = doc(firestore, "settlements", settlementId);
    const docSnap = await getDoc(docRef);
    const existing =
      (docSnap.exists() &&
        (docSnap.data().attachments as DocumentAttachment[])) ||
      [];
    // Here you'd upload files and generate DocumentAttachment objects
    // This is a stub: just re-save existing
    await updateDoc(docRef, { attachments: existing });
  }

  static async deleteSettlementAttachment(
    settlementId: string,
    attachmentId: string
  ): Promise<void> {
    // TODO: implement actual deletion from Storage/API
    console.log("deleteSettlementAttachment stub", settlementId, attachmentId);
    const docRef = doc(firestore, "settlements", settlementId);
    const docSnap = await getDoc(docRef);
    const existing =
      (docSnap.exists() &&
        (docSnap.data().attachments as DocumentAttachment[])) ||
      [];
    const updated = existing.filter((att) => att.id !== attachmentId);
    await updateDoc(docRef, { attachments: updated });
  }

  // Calendar attachments
  static async getCalendarAttachments(
    dateId: string
  ): Promise<DocumentAttachment[]> {
    try {
      const docRef = doc(firestore, "calendarAttachments", dateId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return (docSnap.data().attachments as DocumentAttachment[]) || [];
      }
      return [];
    } catch (error) {
      accountingLogger.error("Error fetching calendar attachments:", error);
      throw error;
    }
  }
  static async uploadCalendarAttachments(
    dateId: string,
    files: File[]
  ): Promise<void> {
    try {
      accountingLogger.info("Uploading calendar attachments", {
        dateId,
        fileCount: files.length,
      });

      const docRef = doc(firestore, "calendarAttachments", dateId);
      const docSnap = await getDoc(docRef);
      const existing =
        (docSnap.exists() &&
          (docSnap.data().attachments as DocumentAttachment[])) ||
        [];

      const newAttachments: DocumentAttachment[] = [];

      // Upload each file to Firebase Storage
      for (const file of files) {
        try {
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substr(2, 9);
          const fileName = `calendar/${dateId}/${timestamp}_${randomId}_${file.name}`;

          // Create storage reference
          const storageRef = ref(storage, fileName);

          // Upload file
          await uploadBytes(storageRef, file);

          // Get download URL
          const downloadURL = await getDownloadURL(storageRef);

          const attachment: DocumentAttachment = {
            id: `${timestamp}_${randomId}`,
            fileName: file.name,
            originalName: file.name,
            fileType: file.type,
            fileSize: file.size,
            url: downloadURL,
            description: "",
            uploadedBy: "system",
            uploadedAt: new Date(), // Use Date instead of Timestamp
            storagePath: fileName, // Add storagePath for easier deletion
          } as any; // 'as any' in case DocumentAttachment doesn't have storagePath yet

          newAttachments.push(attachment);
        } catch (uploadError) {
          accountingLogger.error("Error uploading file", {
            fileName: file.name,
            error: uploadError,
          });
          throw uploadError;
        }
      }

      const all = [...existing, ...newAttachments];

      // Use setDoc with merge to create or update document
      await setDoc(docRef, { attachments: all }, { merge: true });

      accountingLogger.info("Calendar attachments uploaded successfully", {
        dateId,
        uploadedCount: newAttachments.length,
      });
    } catch (error) {
      accountingLogger.error("Error uploading calendar attachments:", error);
      throw error;
    }
  }

  static async deleteCalendarAttachment(
    dateId: string,
    attachmentId: string
  ): Promise<void> {
    try {
      const docRef = doc(firestore, "calendarAttachments", dateId);
      const docSnap = await getDoc(docRef);
      const existing =
        (docSnap.exists() &&
          (docSnap.data().attachments as DocumentAttachment[])) ||
        [];
      const attachmentToDelete = existing.find(
        (att) => att.id === attachmentId
      );
      const updated = existing.filter((att) => att.id !== attachmentId);
      // Remove from Firestore
      await setDoc(docRef, { attachments: updated }, { merge: true });
      // Remove from Firebase Storage if storagePath exists
      if (attachmentToDelete && attachmentToDelete.storagePath) {
        try {
          const storageRef = ref(storage, attachmentToDelete.storagePath);
          await deleteObject(storageRef);
          accountingLogger.info("Deleted file from Firebase Storage", {
            storagePath: attachmentToDelete.storagePath,
          });
        } catch (storageError) {
          accountingLogger.error("Error deleting file from Firebase Storage", {
            storagePath: attachmentToDelete.storagePath,
            error: storageError,
          });
        }
      }
    } catch (error) {
      accountingLogger.error("Error deleting calendar attachment:", error);
      throw error;
    }
  }
}

export default AccountingService;
