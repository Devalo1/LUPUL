import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Menu } from "../components/common";

const Services: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: ""
  });
  const [gdprConsent, setGdprConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConsent = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGdprConsent(e.target.checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validare
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitError("Te rugăm să completezi toate câmpurile obligatorii.");
      return;
    }

    if (!gdprConsent) {
      setSubmitError("Te rugăm să confirmi acordul cu politica de confidențialitate.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Endpoint-ul Cloud Function
      const cloudFunctionUrl = "https://us-central1-lupul-si-corbul.cloudfunctions.net/sendContactFormEmail";
      
      const response = await axios.post(cloudFunctionUrl, formData);
      
      if (response.data.success) {
        setSubmitSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          service: "",
          message: ""
        });
        setGdprConsent(false);
      } else {
        throw new Error(response.data.message || "A apărut o eroare la trimiterea mesajului.");
      }
    } catch (error) {
      console.error("Eroare la trimiterea formularului:", error);
      setSubmitError("Nu am putut trimite mesajul tău. Te rugăm să încerci din nou sau să ne contactezi direct la lupulsicorbul@gmail.com.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitSuccess(false);
    setSubmitError("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      service: "",
      message: ""
    });
    setGdprConsent(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Serviciile Lupul și Corbul</h1>
          <p className="text-xl text-gray-600">
            Mai mult decât un simplu magazin, suntem o platformă socială care aduce valoare 
            comunității din Valea Jiului prin diverse inițiative și servicii.
          </p>
        </div>
        
        {/* Secțiuni de servicii */}
        <div className="space-y-20">
          {/* Secțiunea 1: Gusturi din rulota */}
          <section className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-2/5 relative">
                <div 
                  className="h-72 md:h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: "url('/images/van.jpeg')" }}
                >
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent md:hidden"></div>
              </div>
              
              <div className="md:w-3/5 p-8 md:p-12">
                <h2 className="text-3xl font-bold text-amber-700 mb-4">Gusturi din rulota Lupul și Corbul</h2>
                <p className="text-gray-700 text-lg mb-6">
                  Gogoși calde, cafea de specialitate, shake-uri cu ingrediente locale și gustări cu suflet. 
                  Tot ce servim e făcut cu grijă și nume. Vino să guști povești pregătite cu ingrediente 
                  locale, pasiune autentică și rețete care aduc aminte de gustul copilăriei.
                </p>
                <p className="text-gray-700 text-lg mb-8">
                  Te invităm să descoperi rulota noastră mobilă la evenimente locale sau să ne vizitezi 
                  la locația noastră permanentă din centrul orașului.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Menu />
                  <Link 
                    to="/magazin?tab=menu" 
                    className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
                  >
                    Comandă online
                  </Link>
                </div>
              </div>
            </div>
          </section>
          
          {/* Secțiunea 2: Evenimente locale & comunitare */}
          <section className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="md:flex md:flex-row-reverse">
              <div className="md:w-2/5 relative">
                <div 
                  className="h-72 md:h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: "url('/images/Events.jpeg')" }}
                >
                </div>
                <div className="absolute inset-0 bg-gradient-to-l from-black/40 to-transparent md:hidden"></div>
              </div>
              
              <div className="md:w-3/5 p-8 md:p-12">
                <h2 className="text-3xl font-bold text-blue-700 mb-4">Evenimente locale & comunitare</h2>
                <p className="text-gray-700 text-lg mb-6">
                  Organizăm și susținem evenimente care pun în mișcare Valea Jiului: de la târguri cu 
                  producători locali până la seri culturale și ateliere creative. Credem în puterea 
                  comunității de a se reinventa și de a crea conexiuni autentice.
                </p>
                <p className="text-gray-700 text-lg mb-8">
                  Fie că ești interesat să participi la un eveniment, să fii voluntar sau partener, 
                  te invităm să descoperi calendarul nostru de activități și să te alături mișcării.
                </p>
                <Link 
                  to="/events" 
                  className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
                >
                  Vezi calendarul evenimentelor
                </Link>
              </div>
            </div>
          </section>
          
          {/* Secțiunea 3: Terapie și reconectare */}
          <section className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-2/5 relative">
                <div 
                  className="h-72 md:h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: "url('/images/Therapy.jpeg')" }}
                >
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent md:hidden"></div>
              </div>
              
              <div className="md:w-3/5 p-8 md:p-12">
                <h2 className="text-3xl font-bold text-green-700 mb-4">Terapie, reconectare și sprijin</h2>
                <p className="text-gray-700 text-lg mb-6">
                  Oferim un spațiu sigur pentru suflet – ședințe de terapie holistică, reconectare cu natura, 
                  discuții deschise și grupuri de sprijin. Pentru cei care vor mai mult decât un simplu „e ok".
                </p>
                <p className="text-gray-700 text-lg mb-8">
                  Prin abordarea noastră integrativă, te ajutăm să găsești echilibrul și să descoperi 
                  resursele interioare necesare pentru a face față provocărilor vieții moderne.
                </p>
                <button 
                  onClick={() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })}
                  className="inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-300 shadow-md"
                >
                  Programează o sesiune
                </button>
              </div>
            </div>
          </section>
          
          {/* Secțiunea 4: Platformă socială & ONG */}
          <section className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="md:flex md:flex-row-reverse">
              <div className="md:w-2/5 relative">
                <div 
                  className="h-72 md:h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: "url('/images/AdobeStock_217770381.jpeg')" }}
                >
                </div>
                <div className="absolute inset-0 bg-gradient-to-l from-black/40 to-transparent md:hidden"></div>
              </div>
              
              <div className="md:w-3/5 p-8 md:p-12">
                <h2 className="text-3xl font-bold text-purple-700 mb-4">Platformă socială & ONG</h2>
                <p className="text-gray-700 text-lg mb-6">
                  Lucrăm cu oameni din zonă, susținem inițiative locale și punem umărul la cauze care chiar contează. 
                  Dacă vrei să te implici sau să ceri ajutor – e locul tău.
                </p>
                <p className="text-gray-700 text-lg mb-8">
                  Credem în puterea comunității de a aduce schimbare reală și suntem dedicați facilitării 
                  acestui proces prin resurse, expertiză și conectarea oamenilor potriviți.
                </p>
                <Link 
                  to="/ong" 
                  className="inline-block px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition duration-300 shadow-md"
                >
                  Află cum te poți implica
                </Link>
              </div>
            </div>
          </section>
        </div>
        
        {/* Formular de contact */}
        <div id="contact-form" className="mt-20 bg-white p-8 md:p-12 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Contactează-ne pentru orice întrebare</h2>
          <p className="text-gray-700 text-lg mb-8">
            Fie că dorești să afli mai multe despre serviciile noastre, să programezi o sesiune de terapie, 
            sau să te implici în inițiativele comunitare, completează formularul și te vom contacta în curând.
          </p>
          
          {submitSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Mesajul tău a fost trimis!</h3>
              <p className="text-gray-600 mb-6">Îți mulțumim pentru mesaj. Te vom contacta în cel mai scurt timp posibil.</p>
              <button 
                onClick={resetForm}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Trimite un alt mesaj
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p>{submitError}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Nume complet*</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Numele și prenumele tău"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email*</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="adresa@email.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Număr de telefon</label>
                <input 
                  type="tel" 
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="07xx xxx xxx"
                />
              </div>
              
              <div>
                <label htmlFor="service" className="block text-gray-700 font-medium mb-2">Serviciul care te interesează</label>
                <select 
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selectează un serviciu</option>
                  <option value="rulota">Rulota și gustările noastre</option>
                  <option value="evenimente">Evenimente comunitare</option>
                  <option value="terapie">Terapie și reconectare</option>
                  <option value="ong">Implicare în proiecte sociale</option>
                  <option value="altele">Altele</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Mesajul tău*</label>
                <textarea 
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  rows={5}
                  placeholder="Descrie-ne cum te putem ajuta sau ce întrebări ai..."
                  required
                ></textarea>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="gdpr" 
                  checked={gdprConsent}
                  onChange={handleConsent}
                  className="mr-2 h-5 w-5" 
                  required
                />
                <label htmlFor="gdpr" className="text-gray-700">
                  Sunt de acord cu prelucrarea datelor mele personale conform <Link to="/privacy-policy" className="text-blue-600 hover:underline">Politicii de confidențialitate</Link>
                </label>
              </div>
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg transition shadow-md 
                  ${isSubmitting ? "bg-blue-400 cursor-not-allowed" : "hover:bg-blue-700"}`}
              >
                {isSubmitting ? "Se trimite..." : "Trimite mesajul"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;
