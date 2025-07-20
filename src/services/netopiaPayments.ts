/**
 * Serviciu NETOPIA Payments - Integrator de soluții de plată
 *
 * Conform contractului NETOPIA FINANCIAL SERVICES S.A. semnat de HIFITBOX S.R.L.
 * Toate tranzacțiile sunt procesate prin platforma securizată NETOPIA Payments
 * cu certificare PCI DSS și protecție bancară completă.
 *
 * CUI Merchant: RO41039008
 * Contract NETOPIA: În conformitate cu prevederile contractuale
 *
 * @author HIFITBOX SRL
 * @license Proprietar - Conform contract NETOPIA
 */

/**
 * Interfață pentru datele de plată NETOPIA
 * Conform cerințelor contractuale pentru procesarea plăților la distanță
 */
interface NetopiaPaymentData {
  orderId: string;
  amount: number; // Suma în bani (RON * 100)
  currency: string; // RON conform contractului
  description: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    county: string;
    postalCode: string;
  };
  language?: string; // ro pentru platformă românească
  returnUrl?: string; // URL pentru redirecționare după plată
  confirmUrl?: string; // URL pentru notificări IPN
}

/**
 * Configurația pentru conexiunea NETOPIA
 * Integrarea tehnică conform standardelor NETOPIA
 */
interface NetopiaConfig {
  posSignature: string;
  baseUrl: string;
  live: boolean;
  publicKey?: string;
}

/**
 * Clasa NetopiaPayments - Integrator oficial NETOPIA
 *
 * Implementează serviciile conform contractului:
 * - Servicii de consultanță și asistență tehnică
 * - Servicii de încasare și administrare plăți
 * - Servicii de decontare conform instrucțiunilor
 * - Servicii antifraudă și monitorizare
 *
 * NETOPIA acționează ca integrator tehnic și agent încasator
 * în numele HIFITBOX S.R.L. (PARTENER)
 */
class NetopiaPayments {
  private config: NetopiaConfig;

  constructor(config: NetopiaConfig) {
    this.config = config;
  }

  /**
   * Inițiază o plată prin platforma NETOPIA Payments
   *
   * Procesul respectă standardele PCI DSS și implementează:
   * - Verificări antifraudă conform contractului
   * - Autorizare bancară 3D Secure
   * - Monitorizare tranzacții în timp real
   *
   * @param paymentData Datele de plată validate
   * @returns URL pentru redirecționarea securizată la NETOPIA
   * @throws Error În cazul eșecului inițializării
   */
  async initiatePayment(paymentData: NetopiaPaymentData): Promise<string> {
    try {
      console.log("Initiating payment with data:", {
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        live: this.config.live,
        signature: this.config.posSignature?.substring(0, 10) + "...",
      });

      const requestPayload = {
        ...paymentData,
        posSignature: this.config.posSignature,
        live: this.config.live,
      };

      const requestBody = JSON.stringify(requestPayload);

      console.log("🚀 Sending to Netopia backend:", {
        payloadKeys: Object.keys(requestPayload),
        bodyLength: requestBody.length,
        bodyPreview: requestBody.substring(0, 100),
        posSignature: this.config.posSignature?.substring(0, 10) + "...",
        live: this.config.live,
      });

      // Use Netlify Dev functions path; no hardcoded port needed in browser
      // Always use relative path to Netlify function
      const netopiaUrl = "/.netlify/functions/netopia-initiate";
      const response = await fetch(netopiaUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: requestBody,
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Netopia API Error:", errorText);
        throw new Error(`Eroare la inițierea plății: ${response.status}`);
      }
      const contentType = response.headers.get("content-type") || "";
      const bodyText = await response.text();
      // If HTML form returned (3DS), return raw HTML
      if (contentType.includes("text/html") || bodyText.includes("<html")) {
        return bodyText;
      }
      // Otherwise parse JSON for paymentUrl
      let data;
      try {
        data = JSON.parse(bodyText);
      } catch (e) {
        console.error("Unexpected Netopia response:", bodyText);
        throw new Error("Răspuns necunoscut de la Netopia");
      }
      if (!data.paymentUrl) {
        console.error("No payment URL received:", data);
        throw new Error("Nu s-a primit URL-ul de plată de la Netopia");
      }
      console.log(
        "Payment initiated successfully, redirecting to:",
        data.paymentUrl
      );
      return data.paymentUrl;
    } catch (error) {
      console.error("Eroare NETOPIA:", error);

      // Mesaj mai specific pentru utilizator
      const errorMessage =
        error instanceof Error ? error.message : "Eroare necunoscută";

      if (errorMessage.includes("NETOPIA live configuration not found")) {
        throw new Error(
          "Serviciul de plăți temporar indisponibil. Vă rugăm să alegeți plata ramburs."
        );
      }

      throw new Error(
        "Nu am putut inițializa plata cu cardul. Vă rugăm să încercați din nou sau să alegeți plata ramburs."
      );
    }
  }

  /**
   * Verifică statusul unei plăți
   * @param orderId ID-ul comenzii
   * @returns Statusul plății
   */
  async checkPaymentStatus(orderId: string): Promise<any> {
    try {
      const response = await fetch(
        `/.netlify/functions/netopia-status?orderId=${orderId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Eroare la verificarea statusului");
      }

      return await response.json();
    } catch (error) {
      console.error("Eroare verificare status NETOPIA:", error);
      throw new Error("Nu am putut verifica statusul plății.");
    }
  }

  /**
   * Generează un ID unic pentru comandă
   * @returns ID unic
   */
  generateOrderId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5);
    return `LP${timestamp.slice(-6)}${random.toUpperCase()}`;
  }

  /**
   * Validează datele de plată
   * @param paymentData Datele de plată
   * @returns true dacă datele sunt valide
   */
  validatePaymentData(paymentData: NetopiaPaymentData): boolean {
    const required = [
      "orderId",
      "amount",
      "currency",
      "description",
      "customerInfo.firstName",
      "customerInfo.lastName",
      "customerInfo.email",
      "customerInfo.phone",
    ];

    for (const field of required) {
      const keys = field.split(".");
      let value = paymentData as any;

      for (const key of keys) {
        value = value?.[key];
      }

      if (!value || (typeof value === "string" && value.trim() === "")) {
        console.error(`Câmpul obligatoriu lipsește: ${field}`);
        return false;
      }
    }

    // Validări specifice
    if (paymentData.amount <= 0) {
      console.error("Suma trebuie să fie mai mare decât 0");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(paymentData.customerInfo.email)) {
      console.error("Email invalid");
      return false;
    }

    return true;
  }

  /**
   * Formatează suma pentru NETOPIA (în bani)
   * @param amount Suma în RON
   * @returns Suma în bani
   */
  formatAmount(amount: number): number {
    return Math.round(amount * 100); // NETOPIA primește suma în bani
  }

  /**
   * Creează obiectul de plată pentru NETOPIA
   * @param formData Datele din formular
   * @param amount Suma de plată
   * @param description Descrierea produsului
   * @returns Obiectul de plată formatat
   */
  createPaymentData(
    formData: any,
    amount: number,
    description: string
  ): NetopiaPaymentData {
    return {
      orderId: this.generateOrderId(),
      amount: this.formatAmount(amount),
      currency: "RON",
      description: description,
      customerInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        county: formData.county,
        postalCode: formData.postalCode,
      },
      language: "ro",
      // Netlify Functions endpoints for payment notifications and redirects
      confirmUrl: `${window.location.origin}/.netlify/functions/netopia-notify`,
      returnUrl: `${window.location.origin}/.netlify/functions/netopia-return`,
    };
  }
}

// Configurația pentru producție și dezvoltare
const getNetopiaConfig = (): NetopiaConfig => {
  const isProduction = window.location.hostname !== "localhost";

  // În Vite folosim import.meta.env nu process.env pentru variabile VITE_
  const liveSignature = import.meta.env.VITE_NETOPIA_LIVE_SIGNATURE;
  const hasLiveCredentials = Boolean(liveSignature);

  // Folosește LIVE doar dacă avem credentialele și suntem în producție
  const useLive = isProduction && hasLiveCredentials;

  console.log("Netopia Config:", {
    isProduction,
    hasLiveCredentials,
    useLive,
    hostname: window.location.hostname,
    liveSignatureExists: Boolean(liveSignature),
    environment: import.meta.env.MODE,
  });

  return {
    posSignature: useLive ? liveSignature! : "NETOPIA_SANDBOX_TEST_SIGNATURE", // Sandbox signature
    baseUrl: useLive
      ? "https://secure.netopia-payments.com"
      : "https://secure-sandbox.netopia-payments.com",
    live: Boolean(useLive),
    publicKey: import.meta.env.VITE_NETOPIA_PUBLIC_KEY,
  };
};

// Instanța singleton pentru serviciul NETOPIA
export const netopiaService = new NetopiaPayments(getNetopiaConfig());

// Export pentru tipuri
export type { NetopiaPaymentData, NetopiaConfig };
export default NetopiaPayments;
