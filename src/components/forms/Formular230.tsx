import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import jsPDF from "jspdf";

interface FormData {
  nume: string;
  prenume: string;
  cnp: string;
  adresa: string;
  judet: string;
  oras: string;
  codPostal: string;
  telefon: string;
  email: string;
  venitAnual: string;
  impozitCalculat: string;
  procentRedirecționat: string;
  sumaRedirecționată: string;
}

const Formular230: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    nume: "",
    prenume: "",
    cnp: "",
    adresa: "",
    judet: "",
    oras: "",
    codPostal: "",
    telefon: "",
    email: "",
    venitAnual: "",
    impozitCalculat: "",
    procentRedirecționat: "3.5",
    sumaRedirecționată: "",
  });
  const [saving, setSaving] = useState(false);

  // Încarcă datele salvate ale utilizatorului
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, "formular230", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFormData(docSnap.data() as FormData);
        } else {
          // Încarcă date de bază din profilul utilizatorului
          setFormData((prev) => ({
            ...prev,
            email: user.email || "",
            nume: user.displayName?.split(" ")[1] || "",
            prenume: user.displayName?.split(" ")[0] || "",
          }));
        }
      } catch (error) {
        console.error("Eroare la încărcarea datelor:", error);
      }
    };

    loadUserData();
  }, [user]);

  // Calculează suma redirecționată automat
  useEffect(() => {
    if (formData.impozitCalculat && formData.procentRedirecționat) {
      const impozit = parseFloat(formData.impozitCalculat);
      const procent = parseFloat(formData.procentRedirecționat);
      const suma = (impozit * procent) / 100;
      setFormData((prev) => ({
        ...prev,
        sumaRedirecționată: suma.toFixed(2),
      }));
    }
  }, [formData.impozitCalculat, formData.procentRedirecționat]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveFormData = async () => {
    if (!user) {
      toast.error("Trebuie să fii autentificat pentru a salva datele");
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, "formular230", user.uid);
      await setDoc(docRef, formData);
      toast.success("Datele au fost salvate cu succes!");
    } catch (error) {
      console.error("Eroare la salvarea datelor:", error);
      toast.error("Eroare la salvarea datelor");
    } finally {
      setSaving(false);
    }
  };

  const generatePDF = () => {
    const pdf = new jsPDF();

    // Setează font-ul
    pdf.setFont("helvetica");

    // Header
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("FORMULAR 230", 105, 20, { align: "center" });
    pdf.text("Cerere de redirecționare a unei cote de până la 3,5%", 105, 30, {
      align: "center",
    });
    pdf.text("din impozitul pe venit către entități nonprofit", 105, 40, {
      align: "center",
    });

    // Informații despre ONG
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("CĂTRE:", 20, 60);
    pdf.setFont("helvetica", "normal");
    pdf.text('Asociația "Făuritorii de Destin"', 20, 70);
    pdf.text("Cod Fiscal: RO12345678", 20, 80);
    pdf.text("Cont IBAN: RO98BTRL12345678901234567", 20, 90);

    // Datele contribuabilului
    pdf.setFont("helvetica", "bold");
    pdf.text("DATELE CONTRIBUABILULUI:", 20, 110);
    pdf.setFont("helvetica", "normal");

    let yPos = 125;
    const lineHeight = 10;

    pdf.text(`Nume: ${formData.nume}`, 20, yPos);
    yPos += lineHeight;
    pdf.text(`Prenume: ${formData.prenume}`, 20, yPos);
    yPos += lineHeight;
    pdf.text(`CNP: ${formData.cnp}`, 20, yPos);
    yPos += lineHeight;
    pdf.text(`Adresa: ${formData.adresa}`, 20, yPos);
    yPos += lineHeight;
    pdf.text(`Orașul: ${formData.oras}, Județul: ${formData.judet}`, 20, yPos);
    yPos += lineHeight;
    pdf.text(`Cod poștal: ${formData.codPostal}`, 20, yPos);
    yPos += lineHeight;
    pdf.text(`Telefon: ${formData.telefon}`, 20, yPos);
    yPos += lineHeight;
    pdf.text(`Email: ${formData.email}`, 20, yPos);

    // Informații financiare
    yPos += 20;
    pdf.setFont("helvetica", "bold");
    pdf.text("INFORMAȚII FINANCIARE:", 20, yPos);
    pdf.setFont("helvetica", "normal");
    yPos += 15;

    pdf.text(`Venitul anual brut: ${formData.venitAnual} RON`, 20, yPos);
    yPos += lineHeight;
    pdf.text(`Impozitul calculat: ${formData.impozitCalculat} RON`, 20, yPos);
    yPos += lineHeight;
    pdf.text(
      `Procent redirecționat: ${formData.procentRedirecționat}%`,
      20,
      yPos
    );
    yPos += lineHeight;
    pdf.text(
      `Suma redirecționată: ${formData.sumaRedirecționată} RON`,
      20,
      yPos
    );

    // Declarație
    yPos += 20;
    pdf.setFont("helvetica", "bold");
    pdf.text("DECLARAȚIE:", 20, yPos);
    pdf.setFont("helvetica", "normal");
    yPos += 15;

    const declaratieText = [
      "Prin prezenta, solicit redirecționarea unei cote de până la 3,5% din impozitul",
      'pe venitul datorat către Asociația "Făuritorii de Destin", în conformitate',
      "cu prevederile Legii nr. 571/2003 privind Codul fiscal.",
    ];

    declaratieText.forEach((line) => {
      pdf.text(line, 20, yPos);
      yPos += lineHeight;
    });

    // Semnătura și data
    yPos += 20;
    pdf.text("Data: _______________", 20, yPos);
    pdf.text("Semnătura: _______________", 120, yPos);

    // Salvează PDF-ul
    const fileName = `Formular_230_${formData.nume}_${formData.prenume}.pdf`;
    pdf.save(fileName);

    toast.success("PDF-ul a fost generat cu succes!");
  };

  const validateForm = () => {
    const requiredFields = [
      "nume",
      "prenume",
      "cnp",
      "adresa",
      "judet",
      "oras",
      "email",
    ];
    for (const field of requiredFields) {
      if (!formData[field as keyof FormData]) {
        toast.error(`Câmpul ${field} este obligatoriu`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      generatePDF();
    }
  };
  if (!user) {
    return (
      <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Autentificare necesară
          </h3>
          <p className="text-blue-700 mb-4">
            Pentru a accesa formularul 230, trebuie să te autentifici mai întâi.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Autentificare
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">
        Formular 230 - Redirecționare 3.5%
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datele personale */}{" "}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Nume *
            </label>
            <input
              type="text"
              name="nume"
              value={formData.nume}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Prenume *
            </label>
            <input
              type="text"
              name="prenume"
              value={formData.prenume}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">
            CNP *
          </label>
          <input
            type="text"
            name="cnp"
            value={formData.cnp}
            onChange={handleInputChange}
            maxLength={13}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {/* Adresa */}
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Adresa *
          </label>
          <input
            type="text"
            name="adresa"
            value={formData.adresa}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Județul *
            </label>
            <input
              type="text"
              name="judet"
              value={formData.judet}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Orașul *
            </label>
            <input
              type="text"
              name="oras"
              value={formData.oras}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Cod poștal
            </label>
            <input
              type="text"
              name="codPostal"
              value={formData.codPostal}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {/* Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              name="telefon"
              value={formData.telefon}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        {/* Informații financiare */}{" "}
        <div className="border-t border-blue-300 pt-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">
            Informații financiare
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Venitul anual brut (RON)
              </label>
              <input
                type="number"
                name="venitAnual"
                value={formData.venitAnual}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Impozitul calculat (RON)
              </label>
              <input
                type="number"
                name="impozitCalculat"
                value={formData.impozitCalculat}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Procent redirecționat (%)
              </label>
              <select
                name="procentRedirecționat"
                value={formData.procentRedirecționat}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2">2%</option>
                <option value="3.5">3.5%</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Suma redirecționată (RON)
              </label>
              <input
                type="text"
                name="sumaRedirecționată"
                value={formData.sumaRedirecționată}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-100 text-blue-900"
              />
            </div>
          </div>
        </div>
        {/* Butoane */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="button"
            onClick={saveFormData}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Se salvează..." : "Salvează datele"}
          </button>

          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generează și descarcă PDF
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">
          Informații importante:
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Formularul 230 trebuie depus până la 25 mai</li>
          <li>• Poți redirecționa până la 3.5% din impozitul pe venit</li>
          <li>
            • Datele tale sunt salvate în siguranță și pot fi editate oricând
          </li>
          <li>• PDF-ul generat poate fi printat și depus la ANAF</li>
        </ul>
      </div>
    </div>
  );
};

export default Formular230;
