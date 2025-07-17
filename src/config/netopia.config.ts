/**
 * Configurația NETOPIA Payments pentru HIFITBOX SRL
 *
 * Conform contractului semnat cu NETOPIA FINANCIAL SERVICES S.A.
 * CUI Merchant: RO41039008
 * J17/926/2019
 *
 * Acest fișier conține configurările necesare pentru integrarea
 * cu platforma NETOPIA Payments conform cerințelor contractuale.
 *
 * IMPORTANT: Toate datele sensibile sunt gestionate prin variabile de mediu
 * pentru a respecta standardele de securitate PCI DSS.
 */

export const NETOPIA_CONFIG = {
  // Informații merchant conform contractului
  MERCHANT_INFO: {
    companyName: "HIFITBOX SRL",
    cui: "RO41039008",
    registrationNumber: "J17/926/2019",
    address: "Str. 24 Ianuarie 1859 51 camera 3",
    contactEmail: "lupulsicorbul@gmail.com",
    contractSigned: true,
    contractDate: "2024", // Anul semnării contractului
  },

  // Configurații tehnice
  TECHNICAL_CONFIG: {
    // URLs pentru diferite medii
    SANDBOX_URL: "https://secure-sandbox.netopia-payments.com",
    PRODUCTION_URL: "https://secure.netopia-payments.com",

    // Configurări de securitate
    SECURITY: {
      PCI_DSS_COMPLIANT: true,
      SSL_REQUIRED: true,
      THREE_D_SECURE: true,
      ANTI_FRAUD_MONITORING: true,
    },

    // Metode de plată acceptate conform contractului
    ACCEPTED_PAYMENT_METHODS: [
      "VISA",
      "MASTERCARD",
      "MAESTRO",
      "VISA_ELECTRON",
      "PAYPAL",
    ],

    // Valute acceptate
    SUPPORTED_CURRENCIES: ["RON", "EUR", "USD"],
    DEFAULT_CURRENCY: "RON",

    // Limba implicită
    DEFAULT_LANGUAGE: "ro",

    // Configurări pentru notificări IPN
    IPN_CONFIG: {
      TIMEOUT: 30000, // 30 secunde
      RETRY_ATTEMPTS: 3,
      VERIFY_SSL: true,
    },
  },

  // Cerințe contractuale pentru afișare
  DISPLAY_REQUIREMENTS: {
    SHOW_NETOPIA_LOGO: true, // Obligatoriu conform art. 4.3.6
    SHOW_PAYMENT_METHODS: true,
    SHOW_SECURITY_BADGES: true,
    SHOW_COMPANY_INFO: true,

    // Texte obligatorii conform contractului
    REQUIRED_TEXTS: {
      SECURITY_NOTICE:
        "Toate tranzacțiile sunt procesate prin sistemul securizat NETOPIA Payments, cu certificare PCI DSS și protecție bancară completă.",
      PROCESSING_INFO:
        "Plăți procesate prin NETOPIA Payments - Platformă licențiată și securizată",
      MERCHANT_VERIFICATION:
        "Sistemul nostru de plăți este complet operațional și verificat conform standardelor NETOPIA.",
    },
  },

  // Conformitate și standarde
  COMPLIANCE: {
    PCI_DSS_LEVEL: "Level 1", // Cel mai înalt nivel de securitate
    GDPR_COMPLIANT: true,
    SOX_COMPLIANT: true,
    ISO_27001: true,

    // Verificări obligatorii
    MANDATORY_CHECKS: {
      CUSTOMER_VERIFICATION: true,
      ANTI_MONEY_LAUNDERING: true, // Conform art. 4.1.1
      FRAUD_PREVENTION: true,
      TRANSACTION_MONITORING: true,
    },
  },

  // Praguri și limite conform contractului
  TRANSACTION_LIMITS: {
    MIN_AMOUNT: 1, // 1 RON minimum
    MAX_AMOUNT: 50000, // 50,000 RON maximum pentru o tranzacție
    DAILY_LIMIT: 100000, // 100,000 RON pe zi

    // Praguri pentru reconciliere
    SETTLEMENT_THRESHOLD: 100, // Conform art. 5.3 din anexa 1
    SETTLEMENT_PERIOD_DAYS: 3, // Conform art. 5.2 din anexa 1
  },

  // Configurări pentru raportare
  REPORTING: {
    GENERATE_TRANSACTION_REPORTS: true,
    MONTHLY_RECONCILIATION: true,
    CHARGEBACK_MONITORING: true,
    REFUND_TRACKING: true,

    // Rata maximă de chargebacks permisă
    MAX_CHARGEBACK_RATE: 0.05, // 5% conform art. 3.3.8
    MAX_REFUND_RATE: 0.05, // 5% conform art. 3.2.6
  },

  // URLs pentru dezvoltare și producție
  getApiUrl: (isProduction: boolean = false): string => {
    return isProduction
      ? NETOPIA_CONFIG.TECHNICAL_CONFIG.PRODUCTION_URL
      : NETOPIA_CONFIG.TECHNICAL_CONFIG.SANDBOX_URL;
  },

  // Verifică dacă merchant-ul este conform cu cerințele
  isCompliant: (): boolean => {
    return (
      NETOPIA_CONFIG.MERCHANT_INFO.contractSigned &&
      NETOPIA_CONFIG.COMPLIANCE.PCI_DSS_LEVEL === "Level 1" &&
      NETOPIA_CONFIG.COMPLIANCE.GDPR_COMPLIANT
    );
  },

  // Generează configurația pentru SDK
  generateSDKConfig: (isProduction: boolean = false) => {
    return {
      baseUrl: NETOPIA_CONFIG.getApiUrl(isProduction),
      merchantInfo: NETOPIA_CONFIG.MERCHANT_INFO,
      security: NETOPIA_CONFIG.TECHNICAL_CONFIG.SECURITY,
      currency: NETOPIA_CONFIG.TECHNICAL_CONFIG.DEFAULT_CURRENCY,
      language: NETOPIA_CONFIG.TECHNICAL_CONFIG.DEFAULT_LANGUAGE,
      compliant: NETOPIA_CONFIG.isCompliant(),
    };
  },
};

// Exportă constante pentru utilizare în aplicație
export const MERCHANT_CUI = NETOPIA_CONFIG.MERCHANT_INFO.cui;
export const COMPANY_NAME = NETOPIA_CONFIG.MERCHANT_INFO.companyName;
export const REQUIRED_SECURITY_TEXT =
  NETOPIA_CONFIG.DISPLAY_REQUIREMENTS.REQUIRED_TEXTS.SECURITY_NOTICE;
export const PROCESSING_INFO_TEXT =
  NETOPIA_CONFIG.DISPLAY_REQUIREMENTS.REQUIRED_TEXTS.PROCESSING_INFO;

export default NETOPIA_CONFIG;
