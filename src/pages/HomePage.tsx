import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaUsers,
  FaBalanceScale,
  FaShoppingCart,
  FaCalendarAlt,
  FaHandsHelping,
  FaStar,
  FaShieldAlt,
  FaRocket,
  FaLeaf,
} from "react-icons/fa";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  const handleExploreServices = () => {
    navigate("/services");
  };

  const handleShop = () => {
    navigate("/magazin");
  };

  const handleEvents = () => {
    navigate("/events");
  };

  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <section className="hero-section">
        {/* Background decorative elements */}
        <div className="background-decoration">
          <div className="decoration-blob decoration-blob-1"></div>
          <div className="decoration-blob decoration-blob-2"></div>
          <div className="decoration-blob decoration-blob-3"></div>
        </div>

        <div className="hero-content">
          {/* Logo/Brand */}
          <div className="brand-section">
            <div className="brand-logo">
              <img
                src="/images/LC.png"
                alt="Lupul și Corbul Logo"
                className="brand-logo-image"
              />
            </div>
            <h1 className="brand-title">Lupul și Corbul</h1>
          </div>

          {/* Main tagline with icons */}
          <div className="tagline-section">
            <div className="tagline-item">
              <FaHeart className="tagline-icon-red" />
              <span>Empatie</span>
            </div>
            <div className="tagline-item delay-1">
              <FaUsers className="tagline-icon-blue" />
              <span>Conexiune</span>
            </div>
            <div className="tagline-item delay-2">
              <FaBalanceScale className="tagline-icon-green" />
              <span>Echilibru</span>
            </div>
          </div>

          <p className="hero-description">
            O platformă holistică care îmbină terapia, comerțul etic,
            evenimentele comunitare și tehnologia modernă pentru a crea
            conexiuni autentice și echilibru în viața ta.
          </p>

          {/* CTA Buttons */}
          <div className="cta-buttons">
            <button onClick={handleGetStarted} className="cta-button-primary">
              <FaRocket />
              Începe Călătoria Ta
            </button>
            <button
              onClick={handleExploreServices}
              className="cta-button-secondary"
            >
              Explorează Serviciile
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-20">
        <div className="section-content max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-title-dark text-4xl md:text-5xl font-bold mb-6">
              Ce Oferim Pentru Tine
            </h2>
            <p className="section-description-dark text-xl max-w-3xl mx-auto">
              Descoperă o gamă completă de servicii și produse concepute pentru
              a-ți îmbunătăți calitatea vieții și a te conecta cu o comunitate
              care înțelege nevoile tale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Terapie și Wellness */}
            <div
              onClick={() => navigate("/services")}
              className="bg-gradient-to-br from-pink-50 to-red-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
            >
              <div className="text-pink-600 text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaHeart />
              </div>
              <h3 className="dark-text text-xl font-bold mb-3">
                Terapie & Wellness
              </h3>
              <p className="medium-text leading-relaxed">
                Servicii terapeutice personalizate pentru sănătatea mentală și
                emoțională, cu specialiști dedicați dezvoltării tale personale.
              </p>
            </div>

            {/* Magazin */}
            <div
              onClick={handleShop}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
            >
              <div className="text-blue-600 text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaShoppingCart />
              </div>
              <h3 className="dark-text text-xl font-bold mb-3">Magazin Etic</h3>
              <p className="medium-text leading-relaxed">
                Produse artizanale și naturale, create cu grijă pentru mediu și
                comunitate. Fiecare achiziție susține economia locală.
              </p>
            </div>

            {/* Evenimente */}
            <div
              onClick={handleEvents}
              className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
            >
              <div className="text-green-600 text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaCalendarAlt />
              </div>
              <h3 className="dark-text text-xl font-bold mb-3">
                Evenimente Comunitare
              </h3>
              <p className="medium-text leading-relaxed">
                Ateliere, întâlniri și activități care aduc oamenii împreună
                pentru a crea legături autentice și memorii de durată.
              </p>
            </div>

            {/* Suport Comunitar */}
            <div
              onClick={() => navigate("/ong")}
              className="bg-gradient-to-br from-yellow-50 to-amber-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
            >
              <div className="text-yellow-600 text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaHandsHelping />
              </div>
              <h3 className="dark-text text-xl font-bold mb-3">
                Suport Comunitar
              </h3>
              <p className="medium-text leading-relaxed">
                Proiecte sociale și initiative comunitare care fac diferența în
                viețile oamenilor și în societate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section-bg py-20">
        <div className="section-content max-w-6xl mx-auto px-4 text-center">
          <h2 className="section-title-dark text-4xl md:text-5xl font-bold mb-6">
            Valorile Noastre Fundamentale
          </h2>
          <p className="section-description-dark text-xl mb-12 max-w-3xl mx-auto">
            Fiecare aspect al platformei noastre este construit pe aceste
            principii esențiale care ne ghidează în misiunea de a crea o lume
            mai conectată și echilibrată.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-amber-600 text-5xl mb-4">
                <FaStar />
              </div>
              <h3 className="dark-text text-2xl font-bold mb-4">
                Autenticitate
              </h3>
              <p className="medium-text leading-relaxed">
                Promovăm relații genuine și experiențe autentice, fără artificii
                sau falsitate. Credem în puterea adevărului și a transparenței.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-green-600 text-5xl mb-4">
                <FaLeaf />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Sustenabilitate
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Respectul pentru natură și generațiile viitoare ghidează toate
                deciziile noastre. Creăm soluții care protejează mediul.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-blue-600 text-5xl mb-4">
                <FaShieldAlt />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Încredere
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Construim relații bazate pe respect mutual și încredere.
                Securitatea și confidențialitatea tale sunt prioritatea noastră
                absolută.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Security Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <div className="flex items-center justify-center mb-6">
              <img
                src="/images/NP.svg"
                alt="NETOPIA Logo"
                className="h-12 mr-4"
              />
              <h3 className="text-2xl font-bold text-gray-800">
                Plăți Securizate NETOPIA
              </h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Toate tranzacțiile sunt procesate prin sistemul securizat NETOPIA
              Payments, cu certificare PCI DSS și protecție bancară completă.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate("/payment")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                Testează Plățile
              </button>
              <button
                onClick={() => navigate("/netopia-verification")}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                Verificare Merchant
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="footer-content">
          <div className="footer-logo-section">
            <div className="footer-logo">
              <img src="/images/LC.png" alt="Lupul și Corbul Logo" />
            </div>
            <h4 className="footer-title">Lupul și Corbul</h4>
            <p className="footer-description">
              O comunitate dedicată creșterii personale, conexiunilor autentice
              și echilibrului în viață.
            </p>
          </div>

          <div className="footer-divider">
            <p className="footer-copyright">
              © 2024 Lupul și Corbul. Toate drepturile rezervate. | Powered by
              NETOPIA Payments
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
