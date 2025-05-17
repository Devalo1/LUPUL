import React, { useState, useEffect } from "react";
import { AccountingService } from "../../services/accounting/accountingService";
import { AccountingSettings } from "../../types/accounting";
import { toast } from "react-toastify";
import { FaSave, FaUndo } from "react-icons/fa";

// Extended interface that includes the properties used in this component
interface ExtendedAccountingSettings extends AccountingSettings {
  vatRate?: number; // Legacy field replaced by taxRate
  companyDetails?: {
    name: string;
    taxId: string;
    registrationNumber: string;
    address: string;
    bankAccount: string;
    bankName: string;
    email: string;
    phone: string;
    logo: string;
  };
  invoiceSettings?: {
    prefix: string;
    startNumber: number;
    dueDays: number;
    notes: string;
    termsAndConditions: string;
  };
}

// Default values for settings to prevent undefined errors
const defaultSettings: ExtendedAccountingSettings = {
  currency: "RON",
  taxRate: 19,
  vatRate: 19, // Legacy field, will be removed
  fiscalYear: {
    startMonth: 1, // January
    startDay: 1
  },
  invoicePrefix: "INV",
  invoiceNumbering: {
    currentNumber: 1,
    resetYearly: false
  },
  // Extended fields not in the original type
  companyDetails: {
    name: "",
    taxId: "",
    registrationNumber: "",
    address: "",
    bankAccount: "",
    bankName: "",
    email: "",
    phone: "",
    logo: ""
  },
  invoiceSettings: {
    prefix: "INV",
    startNumber: 1,
    dueDays: 30,
    notes: "",
    termsAndConditions: ""
  }
};

const Settings = () => {
  const [settings, setSettings] = useState<ExtendedAccountingSettings>({ ...defaultSettings });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [originalSettings, setOriginalSettings] = useState<ExtendedAccountingSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      const settingsData = await AccountingService.getAccountingSettings();
      if (settingsData) {
        // Ensure all required objects exist by merging with defaults
        const mergedSettings = {
          ...defaultSettings,
          ...settingsData,
          companyDetails: {
            ...defaultSettings.companyDetails,
            ...settingsData.companyDetails
          },
          invoiceSettings: {
            ...defaultSettings.invoiceSettings,
            ...settingsData.invoiceSettings
          },
          fiscalYear: {
            ...defaultSettings.fiscalYear,
            ...settingsData.fiscalYear
          },
          invoiceNumbering: {
            ...defaultSettings.invoiceNumbering,
            ...settingsData.invoiceNumbering
          }
        };
        setSettings(mergedSettings);
        setOriginalSettings(mergedSettings);
      }
    } catch (err) {
      setError("Eroare la încărcarea setărilor.");
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof ExtendedAccountingSettings] as Record<string, any> || {}),
          [field]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);

    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof ExtendedAccountingSettings] as Record<string, any> || {}),
          [field]: numValue
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setError(null);

    try {
      await AccountingService.saveAccountingSettings(settings);
      setOriginalSettings(settings);
      toast.success("Setările au fost salvate cu succes!");
    } catch (err) {
      setError("Eroare la salvarea setărilor.");
      toast.error("Eroare la salvarea setărilor.");
      console.error("Error saving settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    if (originalSettings) {
      setSettings(originalSettings);
    }
  };

  const hasChanges = (): boolean => {
    return originalSettings !== null && JSON.stringify(settings) !== JSON.stringify(originalSettings);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Safely access properties with fallbacks to prevent null/undefined errors
  const invoiceSettings = settings.invoiceSettings || defaultSettings.invoiceSettings;
  const companyDetails = settings.companyDetails || defaultSettings.companyDetails;
  const fiscalYear = settings.fiscalYear || defaultSettings.fiscalYear;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Setări Contabilitate</h2>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Setări Generale</h3>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Monedă Implicită</label>
            <select
              name="currency"
              value={settings.currency || "RON"}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="RON">Lei (RON)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="USD">Dolar (USD)</option>
              <option value="GBP">Liră sterlină (GBP)</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Cota TVA (%)</label>
            <input
              type="number"
              name="vatRate"
              value={settings.vatRate || 19}
              onChange={handleNumberChange}
              min="0"
              max="100"
              step="1"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <h3 className="text-lg font-semibold mb-4 mt-8 border-b pb-2">An Fiscal</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Luna Început</label>
              <select
                name="fiscalYear.startMonth"
                value={fiscalYear.startMonth || 1}
                onChange={handleNumberChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Ianuarie</option>
                <option value={2}>Februarie</option>
                <option value={3}>Martie</option>
                <option value={4}>Aprilie</option>
                <option value={5}>Mai</option>
                <option value={6}>Iunie</option>
                <option value={7}>Iulie</option>
                <option value={8}>August</option>
                <option value={9}>Septembrie</option>
                <option value={10}>Octombrie</option>
                <option value={11}>Noiembrie</option>
                <option value={12}>Decembrie</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Zi Început</label>
              <input
                type="number"
                name="fiscalYear.startDay"
                value={fiscalYear.startDay || 1}
                onChange={handleNumberChange}
                min="1"
                max="31"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-4 mt-8 border-b pb-2">Setări Facturare</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Prefix Factură</label>
              <input
                type="text"
                name="invoiceSettings.prefix"
                value={invoiceSettings.prefix || "INV"}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Număr Start</label>
              <input
                type="number"
                name="invoiceSettings.startNumber"
                value={invoiceSettings.startNumber || 1}
                onChange={handleNumberChange}
                min="1"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Zile Scadență</label>
            <input
              type="number"
              name="invoiceSettings.dueDays"
              value={invoiceSettings.dueDays || 30}
              onChange={handleNumberChange}
              min="0"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Informații Companie</h3>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Nume Companie</label>
            <input
              type="text"
              name="companyDetails.name"
              value={companyDetails.name || ""}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">CUI / CIF</label>
            <input
              type="text"
              name="companyDetails.taxId"
              value={companyDetails.taxId || ""}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Număr Registrul Comerțului</label>
            <input
              type="text"
              name="companyDetails.registrationNumber"
              value={companyDetails.registrationNumber || ""}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Adresă</label>
            <textarea
              name="companyDetails.address"
              value={companyDetails.address || ""}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Cont Bancar</label>
              <input
                type="text"
                name="companyDetails.bankAccount"
                value={companyDetails.bankAccount || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Nume Bancă</label>
              <input
                type="text"
                name="companyDetails.bankName"
                value={companyDetails.bankName || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="companyDetails.email"
                value={companyDetails.email || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Telefon</label>
              <input
                type="text"
                name="companyDetails.phone"
                value={companyDetails.phone || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t pt-4">
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={resetSettings}
            disabled={!hasChanges() || saving}
            className={`flex items-center px-4 py-2 rounded ${
              !hasChanges() || saving
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-yellow-500 text-white hover:bg-yellow-600"
            }`}
          >
            <FaUndo className="mr-1" /> Resetează
          </button>

          <button
            type="button"
            onClick={saveSettings}
            disabled={!hasChanges() || saving}
            className={`flex items-center px-4 py-2 rounded ${
              !hasChanges() || saving
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full" />
                Salvare...
              </>
            ) : (
              <>
                <FaSave className="mr-1" /> Salvează
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;