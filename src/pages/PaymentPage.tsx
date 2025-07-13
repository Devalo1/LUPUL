import React, { useState } from "react";
import {
  netopiaPaymentService,
  NetopiaPaymentRequest,
} from "../services/netopiaPayments";
import "../index.css";

interface PaymentPageProps {}

const PaymentPage: React.FC<PaymentPageProps> = () => {
  const [formData, setFormData] = useState({
    amount: 100,
    currency: "RON",
    details: "Plată servicii AI",
    customerEmail: "",
    customerName: "",
    customerPhone: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    county: "",
    zipCode: "",
    country: "RO",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
    setPaymentResult(null);

    try {
      const paymentRequest: NetopiaPaymentRequest = {
        orderId: `ORDER-${Date.now()}`,
        amount: formData.amount,
        currency: formData.currency,
        details: formData.details,
        customerEmail: formData.customerEmail,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        billingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          county: formData.county,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      };

      const response =
        await netopiaPaymentService.createPaymentRequest(paymentRequest);

      if (response.success) {
        const paymentForm =
          netopiaPaymentService.createPaymentForm(paymentRequest);

        setPaymentResult(`
          <div class="payment-success">
            <h3>Cerere de plată creată cu succes!</h3>
            <p>Order ID: ${response.orderId}</p>
            <p>Suma: ${formData.amount} ${formData.currency}</p>
            ${paymentForm}
          </div>
        `);
      } else {
        setPaymentResult(`
          <div class="payment-error">
            <h3>Eroare la procesarea plății</h3>
            <p>Error: ${response.error}</p>
          </div>
        `);
      }
    } catch (error) {
      setPaymentResult(`
        <div class="payment-error">
          <h3>Eroare la procesarea plății</h3>
          <p>Error: ${error instanceof Error ? error.message : "Eroare necunoscută"}</p>
        </div>
      `);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-emerald-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-green-800">
            Plată cu Netopia
          </h2>
          <p className="mt-2 text-sm text-green-600">
            Procesează plăți securizate prin Netopia Payments
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-green-800">
              Detalii plată
            </h3>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-green-800"
              >
                Suma
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                min="1"
                step="0.01"
                value={formData.amount}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="currency"
                className="block text-sm font-medium text-green-800"
              >
                Monedă
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="RON">RON</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="details"
                className="block text-sm font-medium text-green-800"
              >
                Detalii
              </label>
              <input
                type="text"
                id="details"
                name="details"
                value={formData.details}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-green-800">
              Detalii client
            </h3>

            <div>
              <label
                htmlFor="customerEmail"
                className="block text-sm font-medium text-green-800"
              >
                Email *
              </label>
              <input
                type="email"
                id="customerEmail"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-green-800"
                >
                  Prenume
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-green-800"
                >
                  Nume
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="customerPhone"
                className="block text-sm font-medium text-green-800"
              >
                Telefon
              </label>
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-green-800">
              Adresă facturare
            </h3>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-green-800"
              >
                Adresa
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-green-800"
                >
                  Oraș
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label
                  htmlFor="county"
                  className="block text-sm font-medium text-green-800"
                >
                  Județ
                </label>
                <input
                  type="text"
                  id="county"
                  name="county"
                  value={formData.county}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Se procesează..." : "Initializează plata"}
          </button>
        </form>

        {paymentResult && (
          <div className="mt-8">
            <div
              dangerouslySetInnerHTML={{ __html: paymentResult }}
              className="payment-result"
            />
          </div>
        )}
      </div>

      <div className="max-w-md mx-auto mt-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <svg
            className="h-5 w-5 text-green-500 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium text-green-800">
            Plăți securizate prin Netopia Payments
          </span>
        </div>
        <p className="text-xs text-green-600 mt-1">
          Toate tranzacțiile sunt criptate și procesate securizat
        </p>
      </div>
    </div>
  );
};

export default PaymentPage;
