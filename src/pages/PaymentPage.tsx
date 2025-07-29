import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { netopiaService } from "../services/netopiaPayments";

interface PaymentFormData {
  amount: string;
  description: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  county: string;
  postalCode: string;
}

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: "50.00",
    description: "Emblemă Digitală Lupul și Corbul",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    county: "",
    postalCode: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validare formular
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.phone
      ) {
        alert("Vă rugăm să completați toate câmpurile obligatorii.");
        return;
      }

      // Creează datele de plată pentru NETOPIA
      const paymentData = netopiaService.createPaymentData(
        formData,
        parseFloat(formData.amount),
        formData.description
      );

      // Validare date plată
      if (!netopiaService.validatePaymentData(paymentData)) {
        alert(
          "Datele introduse nu sunt valide. Vă rugăm să verificați și să încercați din nou."
        );
        return;
      }

      // Inițializează plata reală prin NETOPIA (inclusiv în dezvoltare pentru 3DS)
      const paymentUrl = await netopiaService.initiatePayment(paymentData);

      // Salvează detaliile comenzii în localStorage pentru confirmarea ulterioară
      localStorage.setItem(
        "currentOrder",
        JSON.stringify({
          orderId: paymentData.orderId,
          amount: formData.amount,
          description: formData.description,
          customerInfo: paymentData.customerInfo,
        })
      );

      // 🔧 BACKUP MECHANISM - Salvează și în sessionStorage pentru siguranță
      sessionStorage.setItem(
        "currentOrderBackup",
        JSON.stringify({
          orderId: paymentData.orderId,
          amount: formData.amount,
          description: formData.description,
          customerInfo: paymentData.customerInfo,
          timestamp: new Date().toISOString(),
          source: "PaymentPage",
        })
      );

      // 🆕 RECOVERY MECHANISM - Salvează în cookie pentru recovery ulterior
      const recoveryData = {
        orderId: paymentData.orderId,
        email: paymentData.customerInfo.email,
        customerName:
          paymentData.customerInfo.firstName +
          " " +
          paymentData.customerInfo.lastName,
        phone: paymentData.customerInfo.phone,
        address: paymentData.customerInfo.address,
        city: paymentData.customerInfo.city,
        county: paymentData.customerInfo.county,
        amount: formData.amount,
        timestamp: new Date().toISOString(),
      };

      // Salvează în cookie cu expirare de 24h
      const cookieValue = btoa(JSON.stringify(recoveryData)); // Encodare base64
      document.cookie = `orderRecovery_${paymentData.orderId}=${cookieValue}; max-age=86400; path=/; SameSite=Lax`;

      console.log(
        "💾 Date comandă salvate în localStorage, sessionStorage și cookie:",
        paymentData.orderId
      );

      // Dacă răspunsul este un HTML (3DS form), afișează direct conținutul
      if (paymentUrl.trim().startsWith("<")) {
        document.open();
        document.write(paymentUrl);
        document.close();
      } else {
        // În caz contrar, redirecționează către URL-ul primit
        window.location.href = paymentUrl;
      }
    } catch (error) {
      console.error("Eroare procesare plată:", error);
      alert(
        "A apărut o eroare la procesarea plății. Vă rugăm să încercați din nou."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const romanianCounties = [
    "Alba",
    "Arad",
    "Argeș",
    "Bacău",
    "Bihor",
    "Bistrița-Năsăud",
    "Botoșani",
    "Brăila",
    "Brașov",
    "București",
    "Buzău",
    "Călărași",
    "Caraș-Severin",
    "Cluj",
    "Constanța",
    "Covasna",
    "Dâmbovița",
    "Dolj",
    "Galați",
    "Giurgiu",
    "Gorj",
    "Harghita",
    "Hunedoara",
    "Ialomița",
    "Iași",
    "Ilfov",
    "Maramureș",
    "Mehedinți",
    "Mureș",
    "Neamț",
    "Olt",
    "Prahova",
    "Sălaj",
    "Satu Mare",
    "Sibiu",
    "Suceava",
    "Teleorman",
    "Timiș",
    "Tulcea",
    "Vâlcea",
    "Vaslui",
    "Vrancea",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header cu logo NETOPIA */}
        <div className="text-center mb-8 relative z-20">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="flex-shrink-0 bg-white rounded-xl p-3 shadow-lg border-2 border-blue-200 relative z-30">
              <img
                src="/images/NP.svg"
                alt="NETOPIA Payments"
                className="h-12 w-auto max-w-[120px] md:h-14 md:max-w-[140px] lg:h-16 lg:max-w-[160px] xl:h-20 xl:max-w-[180px] object-contain filter drop-shadow-sm"
              />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-blue-900 drop-shadow-lg leading-tight">
              Plată Securizată NETOPIA
            </h1>
          </div>
          <p className="text-blue-800 max-w-2xl mx-auto text-base md:text-lg font-medium bg-white/80 rounded-lg p-4 shadow-sm">
            Procesez plata prin sistemul securizat NETOPIA Payments. Toate
            tranzacțiile sunt protejate prin certificare SSL și standards PCI
            DSS.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Informații de securitate */}
          <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
            <h2 className="text-3xl font-bold text-white text-center mb-6 drop-shadow-lg">
              🔒 Plată Securizată
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
              <div className="text-center bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl mb-3">🛡️</div>
                <div className="font-bold text-lg">Certificare SSL</div>
                <div className="text-blue-100">256-bit encryption</div>
              </div>
              <div className="text-center bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl mb-3">🏦</div>
                <div className="font-bold text-lg">Licența BNR</div>
                <div className="text-blue-100">Nr. PSD 17/2020</div>
              </div>
              <div className="text-center bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl mb-3">💳</div>
                <div className="font-bold text-lg">PCI DSS</div>
                <div className="text-blue-100">Standard internațional</div>
              </div>
            </div>
          </div>

          {/* Formularul de plată */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Detalii comandă */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
                <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
                  📋 Detalii Comandă
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="amount"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Sumă de plată (RON) *
                    </label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="1"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Descriere produs *
                    </label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Date personale */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border border-green-200">
                <h3 className="text-2xl font-bold text-green-900 mb-6 flex items-center">
                  👤 Date Personale
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Prenume *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Nume *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="0700123456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Adresa de facturare */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border border-purple-200">
                <h3 className="text-2xl font-bold text-purple-900 mb-6 flex items-center">
                  🏠 Adresa de Facturare
                </h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Adresa completă *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      placeholder="Strada, numărul, bloc, apartament"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Oraș *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="county"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Județ *
                      </label>
                      <select
                        id="county"
                        name="county"
                        value={formData.county}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Selectează județul</option>
                        {romanianCounties.map((county) => (
                          <option key={county} value={county}>
                            {county}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="postalCode"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Cod poștal *
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        required
                        placeholder="123456"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Metode de plată acceptate */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-6 border border-yellow-200">
                <h3 className="text-2xl font-bold text-orange-900 mb-6 flex items-center">
                  💳 Metode de Plată Acceptate
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl mb-2">💳</div>
                    <div className="text-sm font-medium">Visa</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl mb-2">💳</div>
                    <div className="text-sm font-medium">Mastercard</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl mb-2">🏦</div>
                    <div className="text-sm font-medium">Transfer bancar</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl mb-2">📱</div>
                    <div className="text-sm font-medium">Apple Pay</div>
                  </div>
                </div>
              </div>

              {/* Acceptare termeni */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    Sunt de acord cu{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/terms-and-conditions")}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Termenii și Condițiile
                    </button>
                    ,{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/privacy-policy")}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Politica de Confidențialitate
                    </button>{" "}
                    și{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/gdpr-policy")}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Politica GDPR
                    </button>
                    . Înțeleg că datele mele vor fi procesate în conformitate cu
                    legislația în vigoare.
                  </label>
                </div>
              </div>

              {/* Butoane de acțiune */}
              <div className="flex flex-col md:flex-row gap-4 pt-8">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 px-8 py-4 border-2 border-gray-400 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-500 transition-all font-semibold text-lg"
                >
                  ← Înapoi
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-xl hover:shadow-2xl"
                  } text-white`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Procesare plată...
                    </span>
                  ) : (
                    "🔒 PLĂTEȘTE SECURIZAT CU NETOPIA 🔒"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer cu informații legale */}
          <div className="px-8 py-6 bg-gray-50 border-t">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <button
                  type="button"
                  onClick={() => navigate("/anpc-consumer-info")}
                  className="hover:text-blue-600 underline"
                >
                  Info ANPC
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/cancellation-policy")}
                  className="hover:text-blue-600 underline"
                >
                  Drept de Renunțare
                </button>
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 underline"
                >
                  Platforma ODR
                </a>
              </div>
              <p className="text-xs text-gray-500">
                Plăți procesate de NETOPIA Payments • Licența BNR nr. PSD
                17/2020
                <br />
                HIFITBOX SRL • CUI: RO41039008 • Nr. Înreg: J17/926/2019
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
