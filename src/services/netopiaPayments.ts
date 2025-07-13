import crypto from "crypto";

// Configurare Netopia
export const NETOPIA_CONFIG = {
  // Chei și certificat Netopia
  PRIVATE_KEY: `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQDgvgno9K9M465g14CoKE0aIvKbSqwE3EvKm6NIcVO0ZQ7za08v
Xbe508JPioYoTRM2WN7CQTQQgupiRKtyPykE3lxpCMmLqLzpcsq0wm3o9tvCnB8W
zbA2lpDre+EDcylPVyulZhrWn1Vf9sbJcFZREwMgYWewVVLwkTen92Qm5wIDAQAB
AoGAS1/xOuw1jvgdl+UvBTbfBRELhQG6R7cKxF0GmllH1Yy/QuyOljg8UlqvJLY0
4HdZJjUQIN51c8Q0j9iwF5UPUC3MgR0eQ70iislu6LGPnTnIJgbCs4QSWY/fjo08
DgTh3uDUO4bIsIFKvGbVwd86kjTARldnQ4RonKwYkv1xDIECQQDtZg9onk7gcE31
Z2QAEaUfloffY7vst4u+QUm6vZoQ+Eu4ohX3qciwN1daP5qd290OAEngOa8dtzDK
/+tgbsU3AkEA8lobdWiVZkB+1q1Rl6LEOHuxXMyQ42s1L1L1Owc8Ftw6JGT8FewZ
4lCD3U56MJSebCCqKCG32GGkO47R50aD0QJAIlnRQvcdPLajYS4btzLWbNKwSG+7
Ao6whtAVphLHV0tGUaoKebK0mmL3ndR0QAFPZDZAelR+dVNLmSQc3/BHUwJAOw1r
vWsTZEv43BR1Wi6GA4FYUVVjRJbd6b8cFBsKMEPPQwj8R9c042ldCDLUITxFcfFv
pMG6i1YXb4+4Y9NR0QJBANt0qlS2GsS9S79eWhPkAnw5qxDcOEQeekk5z5jil7yw
7J0yOEdf46C89U56v2zORfS5Due8YEYgSMRxXdY0/As=
-----END RSA PRIVATE KEY-----`,

  CERTIFICATE: `-----BEGIN CERTIFICATE-----
MIIC3zCCAkigAwIBAgIBATANBgkqhkiG9w0BAQsFADCBiDELMAkGA1UEBhMCUk8x
EjAQBgNVBAgTCUJ1Y2hhcmVzdDESMBAGA1UEBxMJQnVjaGFyZXN0MRAwDgYDVQQK
EwdORVRPUElBMSEwHwYDVQQLExhORVRPUElBIERldmVsb3BtZW50IHRlYW0xHDAa
BgNVBAMTE25ldG9waWEtcGF5bWVudHMucm8wHhcNMjUwNzEzMTI0ODM0WhcNMzUw
NzExMTI0ODM0WjCBiDELMAkGA1UEBhMCUk8xEjAQBgNVBAgTCUJ1Y2hhcmVzdDES
MBAGA1UEBxMJQnVjaGFyZXN0MRAwDgYDVQQKEwdORVRPUElBMSEwHwYDVQQLExhO
RVRPUElBIERldmVsb3BtZW50IHRlYW0xHDAaBgNVBAMTE25ldG9waWEtcGF5bWVu
dHMucm8wgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBALwh0/NhEpZFuKvghZ9N
75CXba05MWNCh422kcfFKbqP5YViCUBg3Mc5ZYd1e0Xi9Ui1QI2Z/jvvchrDZGQw
jarApr3S9bowHEkZH81ZolOoPHBZbYpA28BIyHYRcaTXjLtiBGvjpwuzljmXeBoV
LinIaE0IUpMen9MLWG2fGMddAgMBAAGjVzBVMA4GA1UdDwEB/wQEAwIFoDATBgNV
HSUEDDAKBggrBgEFBQcDATAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQ9yXCh
MGxzUzQflmkXT1oyIBoetTANBgkqhkiG9w0BAQsFAAOBgQAMnh95YlI+y3XcxrpG
gNWC9AwVBt61MTid213yuXDGxkouizSGFr1MjP1tk/YkcWdNka9QB3AtCr4bMers
/2f322soXcrhAOhj5JPVQkF6rlhJxg2JBO+8M5sOJTaxq5YvFHl/o2GGg0UuxWb5
RbUx6W/CU+uFDgDY8CdZ3hZ7kg==
-----END CERTIFICATE-----`,

  SIGNATURE: "2ZOW-PJ5X-HYYC-IENE-APZO",

  // URL-uri Netopia
  SANDBOX_URL: "https://sandboxsecure.mobilpay.ro",
  LIVE_URL: "https://secure.mobilpay.ro",

  // Configurări pentru environment
  IS_SANDBOX: process.env.NODE_ENV !== "production",

  // Endpoint-uri
  PAYMENT_URL: "/pay",
  NOTIFY_URL: "/.netlify/functions/netopia-notify",
  RETURN_URL: "/.netlify/functions/netopia-return",
  CONFIRM_URL: "/.netlify/functions/netopia-return",
};

// Tipuri pentru plăți
export interface NetopiaPaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  details: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  billingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    county: string;
    zipCode: string;
    country: string;
  };
}

export interface NetopiaPaymentResponse {
  success: boolean;
  orderId: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  message?: string;
  redirectUrl?: string;
  error?: string;
  formData?: {
    env_key: string;
    data: string;
  };
}

// Serviciu principal pentru plăți Netopia
export class NetopiaPaymentService {
  private privateKey: string;
  private certificate: string;
  private signature: string;
  private baseUrl: string;

  constructor() {
    this.privateKey = NETOPIA_CONFIG.PRIVATE_KEY;
    this.certificate = NETOPIA_CONFIG.CERTIFICATE;
    this.signature = NETOPIA_CONFIG.SIGNATURE;
    this.baseUrl = NETOPIA_CONFIG.IS_SANDBOX
      ? NETOPIA_CONFIG.SANDBOX_URL
      : NETOPIA_CONFIG.LIVE_URL;
  }

  // Generare cerere de plată
  async createPaymentRequest(
    paymentData: NetopiaPaymentRequest
  ): Promise<NetopiaPaymentResponse> {
    try {
      // Validare date
      if (
        !paymentData.orderId ||
        !paymentData.amount ||
        !paymentData.customerEmail
      ) {
        throw new Error(
          "Date obligatorii lipsesc: orderId, amount, customerEmail"
        );
      }

      // Creare XML pentru Netopia
      const xmlData = this.createPaymentXML(paymentData);

      // Criptare XML
      const encryptedData = this.encryptData(xmlData);

      // URL pentru redirecționare către Netopia
      const redirectUrl = `${this.baseUrl}${NETOPIA_CONFIG.PAYMENT_URL}`;

      // Salvăm datele criptate pentru a fi folosite în formular
      const paymentFormData = {
        env_key: encryptedData,
        data: this.createEnvelopeXML(paymentData.orderId),
      };

      return {
        success: true,
        orderId: paymentData.orderId,
        redirectUrl: redirectUrl,
        message: "Cerere de plată creată cu succes",
        formData: paymentFormData,
      };
    } catch (error) {
      console.error("Eroare la crearea cererii de plată:", error);
      return {
        success: false,
        orderId: paymentData.orderId,
        error: error instanceof Error ? error.message : "Eroare necunoscută",
      };
    }
  }

  // Creare XML pentru plată
  private createPaymentXML(paymentData: NetopiaPaymentRequest): string {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<order type="card" id="${paymentData.orderId}" timestamp="${Math.floor(Date.now() / 1000)}">
  <signature>${this.signature}</signature>
  <invoice currency="${paymentData.currency}" amount="${paymentData.amount}">
    <details>${paymentData.details}</details>
  </invoice>
  <params>
    <param name="env_key" value="" />
    <param name="data" value="" />
  </params>
  <url>
    <return>${this.getBaseUrl()}${NETOPIA_CONFIG.RETURN_URL}</return>
    <notify>${this.getBaseUrl()}${NETOPIA_CONFIG.NOTIFY_URL}</notify>
    <confirm>${this.getBaseUrl()}${NETOPIA_CONFIG.CONFIRM_URL}</confirm>
  </url>
  <billing>
    <first_name>${paymentData.billingAddress?.firstName || ""}</first_name>
    <last_name>${paymentData.billingAddress?.lastName || ""}</last_name>
    <email>${paymentData.customerEmail}</email>
    <phone>${paymentData.customerPhone || ""}</phone>
    <address>${paymentData.billingAddress?.address || ""}</address>
    <city>${paymentData.billingAddress?.city || ""}</city>
    <county>${paymentData.billingAddress?.county || ""}</county>
    <zip_code>${paymentData.billingAddress?.zipCode || ""}</zip_code>
    <country>${paymentData.billingAddress?.country || "RO"}</country>
  </billing>
</order>`;

    return xml;
  }

  // Creare envelope XML
  private createEnvelopeXML(orderId: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<envelope id="${orderId}" timestamp="${Math.floor(Date.now() / 1000)}">
  <signature>${this.signature}</signature>
</envelope>`;
  }

  // Criptare date cu cheia publică
  private encryptData(data: string): string {
    try {
      // Extragere cheie publică din certificat
      const publicKey = this.extractPublicKeyFromCertificate();

      // Criptare cu RSA
      const encrypted = crypto.publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        Buffer.from(data, "utf8")
      );

      return encrypted.toString("base64");
    } catch (error) {
      console.error("Eroare la criptarea datelor:", error);
      throw new Error("Nu s-au putut cripta datele pentru plată");
    }
  }

  // Extragere cheie publică din certificat
  private extractPublicKeyFromCertificate(): string {
    try {
      // Pentru simplificare, returnăm certificatul
      // În producție, ar trebui să extragi cheia publică efectivă
      return this.certificate;
    } catch (error) {
      console.error("Eroare la extragerea cheii publice:", error);
      throw new Error("Nu s-a putut extrage cheia publică din certificat");
    }
  }

  // Procesare răspuns de la Netopia
  async processPaymentResponse(
    encryptedData: string
  ): Promise<NetopiaPaymentResponse> {
    try {
      // Decriptare date
      const decryptedXML = this.decryptData(encryptedData);

      // Parsare XML răspuns
      const paymentResult = this.parsePaymentResponseXML(decryptedXML);

      return paymentResult;
    } catch (error) {
      console.error("Eroare la procesarea răspunsului:", error);
      return {
        success: false,
        orderId: "",
        error: "Nu s-a putut procesa răspunsul de plată",
      };
    }
  }

  // Decriptare date cu cheia privată
  private decryptData(encryptedData: string): string {
    try {
      const decrypted = crypto.privateDecrypt(
        {
          key: this.privateKey,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        Buffer.from(encryptedData, "base64")
      );

      return decrypted.toString("utf8");
    } catch (error) {
      console.error("Eroare la decriptarea datelor:", error);
      throw new Error("Nu s-au putut decripta datele de răspuns");
    }
  }

  // Parsare XML răspuns
  private parsePaymentResponseXML(xmlData: string): NetopiaPaymentResponse {
    // Implementare simplificată - în producție folosește un parser XML real
    try {
      // Extragere date de bază din XML
      const orderIdMatch = xmlData.match(/id="([^"]+)"/);
      const amountMatch = xmlData.match(/amount="([^"]+)"/);
      const statusMatch = xmlData.match(/<action>([^<]+)<\/action>/);

      const orderId = orderIdMatch ? orderIdMatch[1] : "";
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
      const status = statusMatch ? statusMatch[1] : "";

      return {
        success: status === "confirmed",
        orderId: orderId,
        amount: amount,
        status: status,
        message: status === "confirmed" ? "Plată confirmată" : "Plată eșuată",
      };
    } catch (error) {
      throw new Error("Nu s-a putut parsa răspunsul XML");
    }
  }

  // Verificare semnătură
  verifySignature(data: string, signature: string): boolean {
    try {
      const verify = crypto.createVerify("SHA1");
      verify.update(data);
      return verify.verify(this.certificate, signature, "base64");
    } catch (error) {
      console.error("Eroare la verificarea semnăturii:", error);
      return false;
    }
  }

  // Generare URL de plată complet
  generatePaymentUrl(paymentData: NetopiaPaymentRequest): string {
    const params = new URLSearchParams({
      orderId: paymentData.orderId,
      amount: paymentData.amount.toString(),
      currency: paymentData.currency,
      details: paymentData.details,
      email: paymentData.customerEmail,
    });

    return `${window.location.origin}/payment?${params.toString()}`;
  }

  // Creare formular HTML pentru plată
  createPaymentForm(paymentData: NetopiaPaymentRequest): string {
    const xmlData = this.createPaymentXML(paymentData);
    const encryptedData = Buffer.from(xmlData).toString("base64");
    const envelopeData = this.createEnvelopeXML(paymentData.orderId);

    return `
      <form id="netopiaPaymentForm" method="POST" action="${this.baseUrl}${NETOPIA_CONFIG.PAYMENT_URL}">
        <input type="hidden" name="env_key" value="${encryptedData}" />
        <input type="hidden" name="data" value="${envelopeData}" />
        <button type="submit" class="btn btn-primary">
          Plătește ${paymentData.amount} ${paymentData.currency}
        </button>
      </form>
    `;
  }

  // Obținere URL de bază pentru webhook-uri
  private getBaseUrl(): string {
    // În browser, folosim window.location
    if (typeof window !== "undefined") {
      return window.location.origin;
    }

    // Pentru server-side sau funcții Netlify
    return (
      process.env.URL ||
      process.env.DEPLOY_URL ||
      "https://lupul-si-corbul.netlify.app"
    );
  }
}

// Export instanță singleton
export const netopiaPaymentService = new NetopiaPaymentService();
