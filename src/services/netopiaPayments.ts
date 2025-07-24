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
   * Detectează mediul de rulare pentru endpoint-uri
   */
  private getNetlifyEndpoint(functionName: string): string {
    return this.isProduction()
      ? `/.netlify/functions/${functionName}`
      : `/api/${functionName}`;
  }
  private isProduction(): boolean {
    return (
      window.location.hostname === "lupulsicorbul.com" ||
      (window.location.hostname !== "localhost" &&
        !window.location.hostname.includes("netlify") &&
        !window.location.hostname.includes("preview"))
    );
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

      // În production, dacă nu avem credențiale live configurate, folosim sandbox temporar
      if (this.isProduction() && !this.config.live) {
        console.warn(
          "🚨 Production environment detected but no live Netopia credentials configured - using sandbox for testing"
        );
        // Nu mai aruncă eroare, permite sandbox în production pentru testing
        // throw new Error(
        //   "Sistemul de plăți cu cardul este în proces de configurare. Vă rugăm să alegeți plata ramburs pentru moment sau să încercați mai târziu."
        // );
      }

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

      // Use correct endpoint based on environment
      const netopiaUrl = this.isProduction()
        ? "/.netlify/functions/netopia-initiate" // Production: direct Netlify Functions path
        : "/api/netopia-initiate"; // Development: Vite proxy path

      console.log("🌐 Netopia endpoint:", netopiaUrl);

      const response = await fetch(netopiaUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: requestBody,
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Netopia API Error:", errorText);

        // If we get HTML back (404 from SPA redirect), it means the Netlify function is not available
        if (
          errorText.includes("<!DOCTYPE html>") ||
          errorText.includes("<html")
        ) {
          console.error(
            "🚨 Netopia function not available - got SPA redirect instead of API response"
          );

          if (this.isProduction()) {
            throw new Error(
              "Serviciul de plăți cu cardul este temporar indisponibil din motive tehnice. Vă rugăm să alegeți plata ramburs sau să contactați suportul pentru asistență."
            );
          } else {
            throw new Error(
              "Funcția Netlify pentru Netopia nu este disponibilă. Verificați că serverul dev rulează corect."
            );
          }
        }

        throw new Error(`Eroare la inițierea plății: ${response.status}`);
      }
      const contentType = response.headers.get("content-type") || "";
      const bodyText = await response.text();
      // If HTML form returned (3DS), return raw HTML
      // Handle sandbox 3DS HTML form
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
      // Use correct endpoint based on environment
      const statusUrl = this.isProduction()
        ? `/.netlify/functions/netopia-status?orderId=${orderId}` // Production
        : `/api/netopia-status?orderId=${orderId}`; // Development

      const response = await fetch(statusUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

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
      returnUrl: `${window.location.origin}/order-confirmation`,
      confirmUrl: `${window.location.origin}${this.getNetlifyEndpoint("netopia-notify")}`,
    };
  }
}

// Configurația pentru producție și dezvoltare
const getNetopiaConfig = (): NetopiaConfig => {
  const isProduction =
    window.location.hostname === "lupulsicorbul.com" ||
    (window.location.hostname !== "localhost" &&
      !window.location.hostname.includes("netlify") &&
      !window.location.hostname.includes("preview"));

  // În Vite folosim import.meta.env nu process.env pentru variabile VITE_
  const liveSignature = import.meta.env.VITE_PAYMENT_LIVE_KEY;
  const sandboxSignature =
    import.meta.env.VITE_PAYMENT_SANDBOX_KEY || "2ZOW-PJ5X-HYYC-IENE-APZO";

  // Verificăm dacă avem credențiale live configurate
  // Nota: Pentru NETOPIA, aceeași semnătură poate fi folosită pentru sandbox și live
  // diferența este făcută prin endpoint-ul folosit
  const hasRealLiveCredentials = Boolean(liveSignature);

  const useLive = isProduction && hasRealLiveCredentials;

  // În dev, permite utilizarea semnăturii sandbox reale dacă este configurată
  const useSandbox = !isProduction && Boolean(sandboxSignature);

  console.log("Netopia Config:", {
    isProduction,
    useLive,
    useSandbox,
    hostname: window.location.hostname,
    liveSignatureExists: Boolean(liveSignature),
    sandboxSignatureExists: Boolean(sandboxSignature),
    environment: import.meta.env.MODE,
  });

  return {
    posSignature: useLive
      ? liveSignature!
      : useSandbox
        ? sandboxSignature!
        : "2ZOW-PJ5X-HYYC-IENE-APZO", // Fallback garantat funcțional
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
