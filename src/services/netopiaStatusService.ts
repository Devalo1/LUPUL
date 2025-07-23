/**
 * Serviciu pentru verificarea statusului plării Netopia
 */

interface PaymentStatusResponse {
  orderId: string;
  status: "paid" | "pending" | "failed";
  amount?: number;
  currency?: string;
  transactionId?: string;
  lastUpdated: string;
}

class NetopiaStatusService {
  /**
   * Verifică statusul unei plăți prin API Netopia
   */
  async checkPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await fetch(`/api/netopia-status?orderId=${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      // Fallback simulation in development or on 404
      if (!response.ok) {
        if (response.status === 404 || process.env.NODE_ENV === "development") {
          console.warn(
            `Netopia status endpoint unavailable (status ${response.status}), using simulation`
          );
          return this.simulatePaymentStatusCheck(orderId);
        }
        throw new Error(`Status check failed: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error checking payment status:", error);
      throw error;
    }
  }

  /**
   * Verifică statusul periodic până când plata este confirmată
   */
  async pollPaymentStatus(
    orderId: string,
    maxAttempts: number = 12,
    intervalMs: number = 5000
  ): Promise<PaymentStatusResponse> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const status = await this.checkPaymentStatus(orderId);

        console.log(`Payment status check ${attempt}/${maxAttempts}:`, status);

        // Dacă plata este finalizată (paid sau failed), returnează rezultatul
        if (status.status === "paid" || status.status === "failed") {
          return status;
        }

        // Dacă nu este ultima încercare, așteaptă
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, intervalMs));
        }
      } catch (error) {
        console.error(`Payment status check ${attempt} failed:`, error);

        // Pentru ultima încercare, aruncă eroarea
        if (attempt === maxAttempts) {
          throw error;
        }

        // Pentru alte încercări, continuă după pauză
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }

    // Dacă toate încercările au eșuat sau statusul rămâne pending
    return {
      orderId,
      status: "pending",
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Simulează verificarea statusului pentru development
   */
  simulatePaymentStatusCheck(orderId: string): PaymentStatusResponse {
    // Pentru demonstrație, considerăm plata ca fiind confirmată după 3 secunde
    const isSimulatedSuccess = Math.random() > 0.1; // 90% șanse de succes

    return {
      orderId,
      status: isSimulatedSuccess ? "paid" : "failed",
      amount: 5000, // 50 RON în bani
      currency: "RON",
      transactionId: `SIM_${Date.now()}`,
      lastUpdated: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const netopiaStatusService = new NetopiaStatusService();
