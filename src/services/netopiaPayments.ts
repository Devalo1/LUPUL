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
  public getNetlifyEndpoint(functionName: string): string {
    if (this.isProduction()) {
      // Use relative path in production - absolute URLs cause routing issues
      return `/.netlify/functions/${functionName}`;
    }
    // In development, use Vite proxy path
    return `/api/${functionName}`;
  }
  private isProduction(): boolean {
    const hostname = window.location.hostname;
    return (
      hostname === "lupulsicorbul.com" ||
      (hostname !== "localhost" &&
        !hostname.includes("netlify") &&
        !hostname.includes("preview"))
    );
  }

  /**
   * Verifică dacă avem credențiale NETOPIA Live configurate
   * @returns true dacă sunt configurate credențialele live
   */
  private hasLiveCredentials(): boolean {
    // În producție, considerăm că avem credențiale live dacă variabilele sunt setate
    const liveKey = import.meta.env.VITE_PAYMENT_LIVE_KEY;
    const liveSignature = import.meta.env.VITE_NETOPIA_SIGNATURE_LIVE;

    return !!(
      liveKey &&
      liveSignature &&
      liveKey !== "SANDBOX_SIGNATURE_PLACEHOLDER" &&
      liveSignature !== "SANDBOX_SIGNATURE_PLACEHOLDER" &&
      this.isProduction()
    );
  }

  /**
   * Determină automat dacă să folosim modul live
   * @returns true pentru live mode, false pentru sandbox
   */
  private shouldUseLiveMode(): boolean {
    // FORȚĂM SANDBOX MODE pentru testing și dezvoltare
    // Pentru plăți reale în producție, această logică va fi modificată
    
    // Verifică dacă este un test explicit (orderId conține "TEST-")
    const isTestOrder = window.location.search.includes("test=1") || 
                       localStorage.getItem("netopia_force_sandbox") === "true";
    
    if (isTestOrder) {
      console.log("🧪 Forcing SANDBOX mode for testing");
      return false;
    }
    
    // În producție, întotdeauna folosim live mode dacă avem credențialele
    if (this.isProduction()) {
      return this.hasLiveCredentials();
    }
    // În development, folosim sandbox
    return false;
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
      const useLiveMode = this.shouldUseLiveMode();
      console.log("Initiating payment with data:", {
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        live: useLiveMode,
        hasLiveCredentials: this.hasLiveCredentials(),
        isProduction: this.isProduction(),
        signature: this.config.posSignature?.substring(0, 10) + "...",
      });

      const requestPayload = {
        ...paymentData,
        posSignature: this.config.posSignature,
        live: useLiveMode,
      };

      const requestBody = JSON.stringify(requestPayload);

      console.log("🚀 Sending to Netopia backend:", {
        payloadKeys: Object.keys(requestPayload),
        bodyLength: requestBody.length,
        bodyPreview: requestBody.substring(0, 100),
        posSignature: this.config.posSignature?.substring(0, 10) + "...",
        live: useLiveMode,
      });

      // Use dynamic endpoint via getNetlifyEndpoint
      const netopiaUrl = this.getNetlifyEndpoint("netopia-initiate-fixed");

      console.log("🌐 Netopia endpoint:", netopiaUrl);
      console.log("🔍 DEBUG: Using netopia-initiate-FIXED endpoint");

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

      // Enhanced logging for debugging
      console.log("🔍 NETOPIA Response Debug:", {
        status: response.status,
        contentType: contentType,
        bodyLength: bodyText.length,
        bodyStart: bodyText.substring(0, 200),
        containsHtml: bodyText.includes("<html"),
        containsDoctype: bodyText.includes("<!doctype html>"),
        containsForm: bodyText.includes("<form"),
        containsSvg: bodyText.includes("card.svg"),
      });

      // If HTML form returned (3DS), return raw HTML
      // Handle both sandbox and live 3DS HTML forms
      if (
        contentType.includes("text/html") ||
        bodyText.includes("<html") ||
        bodyText.includes("<!doctype html>") ||
        bodyText.includes("<form")
      ) {
        console.log("🎯 Detected HTML response, returning as 3DS form");
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
      // Calculate if we have real live credentials
      const liveSignature =
        import.meta.env.VITE_NETOPIA_SIGNATURE_LIVE ||
        import.meta.env.VITE_PAYMENT_LIVE_KEY;
      const hasRealLiveCredentials =
        Boolean(liveSignature) && this.isProduction();

      // Use correct endpoint based on environment and include live parameter
      const isLive = this.isProduction() && hasRealLiveCredentials;
      const statusUrl = this.isProduction()
        ? `/.netlify/functions/netopia-status?orderId=${orderId}&live=${isLive}` // Production
        : `/api/netopia-status?orderId=${orderId}&live=${isLive}`; // Development

      console.log("Checking payment status:", { orderId, isLive, statusUrl });

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
  // Citim semnături Netopia din variabilele corespunzătoare
  const liveSignature =
    import.meta.env.VITE_NETOPIA_SIGNATURE_LIVE ||
    import.meta.env.VITE_PAYMENT_LIVE_KEY;
  const sandboxSignature =
    import.meta.env.VITE_NETOPIA_SIGNATURE_SANDBOX ||
    import.meta.env.VITE_PAYMENT_SANDBOX_KEY ||
    "SANDBOX_SIGNATURE_PLACEHOLDER";

  // Verificăm dacă avem credențiale live configurate
  const hasRealLiveCredentials = Boolean(liveSignature) && isProduction;

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
    liveSignatureValue: liveSignature?.substring(0, 10) + "...",
    sandboxSignatureValue: sandboxSignature?.substring(0, 10) + "...",
    hasRealLiveCredentials,
    environment: import.meta.env.MODE,
    finalSignature:
      (useLive
        ? liveSignature!
        : useSandbox
          ? sandboxSignature!
          : "2ZOW-PJ5X-HYYC-IENE-APZO"
      )?.substring(0, 10) + "...",
  });

  return {
    posSignature: useLive
      ? liveSignature!
      : useSandbox
        ? sandboxSignature!
        : "2ZOW-PJ5X-HYYC-IENE-APZO", // Fallback garantat funcțional
    baseUrl: useLive
      ? "https://secure.netopia-payments.com"
      : "https://secure.sandbox.netopia-payments.com",
    live: Boolean(useLive),
    publicKey:
      import.meta.env.VITE_NETOPIA_PUBLIC_KEY ||
      import.meta.env.VITE_PAYMENT_PUBLIC_KEY,
  };
};

// Instanța singleton pentru serviciul NETOPIA
export const netopiaService = new NetopiaPayments(getNetopiaConfig());

/**
 * Testează noua NETOPIA API v2.x cu API KEY
 */
export async function testNetopiaV2API(
  paymentData: NetopiaPaymentData
): Promise<string> {
  try {
    console.log("🌟 Testing NETOPIA API v2.x:", {
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      customerEmail: paymentData.customerInfo?.email,
    });

    // Determine base URL for the endpoint
    const baseUrl =
      window.location.hostname === "localhost" ? "http://localhost:8888" : "";

    const v2Endpoint = `${baseUrl}/.netlify/functions/netopia-v2-api`;

    const response = await fetch(v2Endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ NETOPIA API v2.x Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      // Încearcă să extragă mesajul de eroare din răspuns
      let errorMessage = `NETOPIA API v2.x Error: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // Dacă nu este JSON valid, folosește textul direct pentru erori scurte
        if (errorText.length < 200) {
          errorMessage = errorText;
        }
      }

      throw new Error(errorMessage);
    }

    const responseData = await response.json();

    console.log("✅ NETOPIA API v2.x Response:", {
      success: responseData.success,
      orderId: responseData.orderId,
      ntpID: responseData.ntpID,
      apiVersion: responseData.apiVersion,
      environment: responseData.environment,
    });

    if (!responseData.success) {
      throw new Error(responseData.message || "Payment initiation failed");
    }

    return responseData.paymentUrl;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("🚨 NETOPIA API v2.x Test failed:", errorMessage);
    throw error;
  }
}

// Export pentru tipuri
export type { NetopiaPaymentData, NetopiaConfig };
export default NetopiaPayments;
