/**
 * Serviciu pentru monitorizarea încasărilor Netopia
 * Gestionează settlement-urile și transferurile bancare
 */

interface SettlementData {
  settlementId: string;
  date: string;
  totalAmount: number;
  netAmount: number; // După deducerea comisioanelor
  commission: number;
  transactionCount: number;
  status: "pending" | "processed" | "transferred" | "failed";
  bankTransferDate?: string;
  iban: string;
}

interface TransactionSettlement {
  transactionId: string;
  orderId: string;
  amount: number;
  commission: number;
  netAmount: number;
  settlementDate: string;
  customerName: string;
  customerEmail: string;
}

export class NetopiaSettlementService {
  private static readonly SETTLEMENT_ENDPOINT =
    "/.netlify/functions/netopia-settlement";
  private static readonly MIN_SETTLEMENT_AMOUNT = 100; // RON - conform configurației

  /**
   * Obține settlement-urile din perioada specificată
   */
  static async getSettlements(
    startDate: string,
    endDate: string
  ): Promise<SettlementData[]> {
    try {
      const response = await fetch(`${this.SETTLEMENT_ENDPOINT}/list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startDate, endDate }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.settlements || [];
    } catch (error) {
      console.error("❌ Eroare la obținerea settlement-urilor:", error);
      throw error;
    }
  }

  /**
   * Obține detaliile unui settlement specific
   */
  static async getSettlementDetails(
    settlementId: string
  ): Promise<TransactionSettlement[]> {
    try {
      const response = await fetch(`${this.SETTLEMENT_ENDPOINT}/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settlementId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      console.error("❌ Eroare la obținerea detaliilor settlement:", error);
      throw error;
    }
  }

  /**
   * Calculează câte bani vei primi efectiv
   */
  static calculateNetAmount(grossAmount: number): {
    grossAmount: number;
    commission: number;
    netAmount: number;
    commissionPercentage: number;
  } {
    // Comision Netopia: 2.9% + 1 RON taxa fixă
    const commissionPercentage = 2.9;
    const fixedFee = 1.0;

    const commissionAmount = (grossAmount * commissionPercentage) / 100;
    const totalCommission = commissionAmount + fixedFee;
    const netAmount = grossAmount - totalCommission;

    return {
      grossAmount,
      commission: totalCommission,
      netAmount: Math.max(0, netAmount),
      commissionPercentage: (totalCommission / grossAmount) * 100,
    };
  }

  /**
   * Verifică dacă suma atinge pragul minim pentru settlement
   */
  static canBeSettled(amount: number): boolean {
    const netCalculation = this.calculateNetAmount(amount);
    return netCalculation.netAmount >= this.MIN_SETTLEMENT_AMOUNT;
  }

  /**
   * Obține estimarea pentru următorul settlement
   */
  static async getNextSettlementEstimate(): Promise<{
    estimatedAmount: number;
    estimatedCommission: number;
    estimatedNetAmount: number;
    pendingTransactions: number;
    estimatedDate: string;
  }> {
    try {
      const response = await fetch(`${this.SETTLEMENT_ENDPOINT}/estimate`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Calculează data estimată (T+3 zile lucrătoare)
      const estimatedDate = this.calculateSettlementDate();

      return {
        ...data,
        estimatedDate,
      };
    } catch (error) {
      console.error("❌ Eroare la obținerea estimării settlement:", error);
      throw error;
    }
  }

  /**
   * Calculează data estimată pentru settlement (T+3 zile lucrătoare)
   */
  private static calculateSettlementDate(): string {
    const today = new Date();
    let businessDays = 0;
    const settlementDate = new Date(today);

    while (businessDays < 3) {
      settlementDate.setDate(settlementDate.getDate() + 1);

      // Exclude sâmbătele (6) și duminicile (0)
      if (settlementDate.getDay() !== 0 && settlementDate.getDay() !== 6) {
        businessDays++;
      }
    }

    return settlementDate.toISOString().split("T")[0];
  }

  /**
   * Formateaza suma în RON
   */
  static formatAmount(amount: number): string {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
    }).format(amount);
  }

  /**
   * Generează raport de settlement pentru o perioadă
   */
  static async generateSettlementReport(
    startDate: string,
    endDate: string
  ): Promise<{
    totalGrossAmount: number;
    totalCommissions: number;
    totalNetAmount: number;
    totalTransactions: number;
    settlements: SettlementData[];
    averageCommissionRate: number;
  }> {
    const settlements = await this.getSettlements(startDate, endDate);

    const totals = settlements.reduce(
      (acc, settlement) => ({
        totalGrossAmount: acc.totalGrossAmount + settlement.totalAmount,
        totalCommissions: acc.totalCommissions + settlement.commission,
        totalNetAmount: acc.totalNetAmount + settlement.netAmount,
        totalTransactions: acc.totalTransactions + settlement.transactionCount,
      }),
      {
        totalGrossAmount: 0,
        totalCommissions: 0,
        totalNetAmount: 0,
        totalTransactions: 0,
      }
    );

    const averageCommissionRate =
      totals.totalGrossAmount > 0
        ? (totals.totalCommissions / totals.totalGrossAmount) * 100
        : 0;

    return {
      ...totals,
      settlements,
      averageCommissionRate,
    };
  }
}

export default NetopiaSettlementService;
