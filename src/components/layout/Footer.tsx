import React, { useState } from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleNewsletterSubmit = async () => {
    if (!email) {
      setMessage("Te rugăm să introduci o adresă de email validă.");
      return;
    }

    try {
      await fetch("https://formsubmit.co/ajax/lupulsicorbul@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      setMessage("Te-ai abonat cu succes la newsletter!");
      setEmail("");
    } catch (error) {
      setMessage("A apărut o eroare. Te rugăm să încerci din nou.");
    }
  };

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1 footer-brand-section">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-3">
                Lupul și Corbul
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed footer-brand-description">
                Descoperă valorile autentice românești prin produsele și
                evenimentele noastre care îmbină tradiția cu inovația modernă.
                Fiecare aspect al platformei noastre este construit pe aceste
                principii esențiale care ne ghidează în misiunea de a crea o
                lume mai conectată și echilibrată.
              </p>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4">
              <a
                href="https://m.facebook.com/61563399020209/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-700 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-300"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@lupulsicorbul.d.p?_t=ZN-8vPR7xLoxpm&_r=1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-700 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors duration-300"
                aria-label="TikTok"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-slate-700 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 rounded-full flex items-center justify-center transition-all duration-300"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-navigation-section">
            <h4 className="text-lg font-semibold text-white mb-4">Navigare</h4>
            <ul className="space-y-2 footer-navigation-links">
              <li>
                <Link
                  to="/"
                  className="text-slate-300 hover:text-white transition-colors duration-300"
                >
                  Acasă
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="text-slate-300 hover:text-white transition-colors duration-300"
                >
                  Magazin
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="text-slate-300 hover:text-white transition-colors duration-300"
                >
                  Evenimente
                </Link>
              </li>
              <li>
                <Link
                  to="/emblems/mint"
                  className="text-slate-300 hover:text-white transition-colors duration-300"
                >
                  Embleme
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-slate-300 hover:text-white transition-colors duration-300"
                >
                  Despre noi
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-slate-300 hover:text-white transition-colors duration-300"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="footer-legal-section">
            <h4 className="text-lg font-semibold text-white mb-4">
              Informații Legale
            </h4>
            <ul className="space-y-2 footer-legal-links">
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-slate-300 hover:text-white transition-colors duration-300 flex items-center"
                >
                  {/* Privacy Policy icon */}
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Politica de Confidențialitate
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-and-conditions"
                  className="text-slate-300 hover:text-white transition-colors duration-300 flex items-center"
                >
                  {/* Terms & Conditions icon */}
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 2H5a2 2 0 00-2 2v16a2 2 0 002 2h14a2 2 0 002-2V7l-6-5z" />
                    <path d="M9 2v6h6" />
                  </svg>
                  Termeni și Condiții
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping-policy"
                  className="text-slate-300 hover:text-white transition-colors duration-300 flex items-center"
                >
                  {/* Shipping Policy icon */}
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 13h4l3-3h7l3 3h4" />
                    <circle cx="7" cy="18" r="2" />
                    <circle cx="17" cy="18" r="2" />
                    <path d="M3 13v-2a2 2 0 012-2h3v4" />
                  </svg>
                  Politica de Livrare
                </Link>
              </li>
              <li>
                <Link
                  to="/cancellation-policy"
                  className="text-slate-300 hover:text-white transition-colors duration-300 flex items-center"
                >
                  {/* Cancellation Policy icon */}
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M15 9l-6 6M9 9l6 6" />
                  </svg>
                  Politica de Anulare
                </Link>
              </li>
              <li>
                <Link
                  to="/gdpr-policy"
                  className="text-slate-300 hover:text-white transition-colors duration-300 flex items-center"
                >
                  {/* GDPR Policy icon */}
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2l8 4v6c0 5-3.5 9.7-8 11-4.5-1.3-8-6-8-11V6l8-4z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  Politica GDPR
                </Link>
              </li>
              <li>
                <Link
                  to="/anpc-consumer-info"
                  className="text-slate-300 hover:text-white transition-colors duration-300 flex items-center font-medium"
                >
                  {/* ANPC icon */}
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                    <path
                      d="M10 15l-3-3 1.41-1.41L10 12.17l5.59-5.59L17 8l-7 7z"
                      fill="white"
                    />
                  </svg>
                  Info ANPC
                </Link>
              </li>
            </ul>
          </div>

          {/* Informații Suplimentare de Conformitate */}
          <div className="footer-compliance-section">
            <h4 className="text-lg font-semibold text-white mb-4">
              Conformitate & Siguranță
            </h4>
            <ul className="space-y-2 footer-compliance-links">
              <li>
                <Link
                  to="/cookie-policy"
                  className="text-slate-300 hover:text-white transition-colors duration-300"
                >
                  🍪 Politica Cookies
                </Link>
              </li>
              <li>
                <Link
                  to="/data-protection"
                  className="text-slate-300 hover:text-white transition-colors duration-300"
                >
                  🔒 Protecția Datelor
                </Link>
              </li>
              <li>
                <a
                  href="https://www.netopia-payments.com/security/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors duration-300"
                >
                  💳 Securitate Plăți NETOPIA
                </a>
              </li>
              <li>
                <Link
                  to="/payment-security"
                  className="text-slate-300 hover:text-white transition-colors duration-300"
                >
                  🔒 Informații Plăți și Securitate
                </Link>
              </li>
              <li>
                <Link
                  to="/accessibility"
                  className="text-slate-300 hover:text-white transition-colors duration-300"
                >
                  ♿ Accesibilitate
                </Link>
              </li>
              <li>
                <a
                  href="https://www.infocons.ro/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors duration-300"
                >
                  📞 InfoCons
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="newsletter-section bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Newsletter
            </h4>
            <p className="text-slate-200 text-sm mb-4 font-medium">
              Abonează-te pentru cele mai noi actualizări și oferte exclusive.
            </p>
            <div className="space-y-3">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Adresa ta de email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input flex-1 px-4 py-3 bg-white border-2 border-slate-300 rounded-l-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                />
                <button
                  onClick={handleNewsletterSubmit}
                  className="newsletter-button px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-r-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 shadow-lg hover:shadow-xl"
                >
                  Abonează-te
                </button>
              </div>
              {message && (
                <div
                  className={`newsletter-message text-sm font-medium px-3 py-2 rounded-md ${
                    message.includes("succes")
                      ? "success text-green-900 bg-green-100 border border-green-300"
                      : "error text-red-900 bg-red-100 border border-red-300"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Trust Badges */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
            <div className="flex flex-col items-center">
              <a
                href="https://anpc.ro/ce-este-sal/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-12 bg-white rounded-lg flex items-center justify-center mb-2 hover:bg-gray-100 transition-colors duration-300 group p-1"
                title="ANPC - Autoritatea Națională pentru Protecția Consumatorilor"
              >
                <img
                  src="/images/anpc-logo.png"
                  alt="ANPC - Autoritatea Națională pentru Protecția Consumatorilor"
                  className="w-full h-full object-contain"
                />
              </a>
              <span className="text-xs text-slate-400 text-center">ANPC</span>
            </div>

            <div className="flex flex-col items-center">
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-12 bg-white rounded-lg flex items-center justify-center mb-2 hover:bg-gray-100 transition-colors duration-300 group p-1"
                title="Platforma europeană ODR pentru soluționarea online a litigiilor"
              >
                <img
                  src="/images/sol-logo.png"
                  alt="SOL ODR - Soluționarea Online a Litigiilor"
                  className="w-full h-full object-contain"
                />
              </a>
              <span className="text-xs text-slate-400 text-center">
                SOL ODR
              </span>
            </div>

            <div className="flex flex-col items-center">
              <a
                href="https://www.infocons.ro/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-2 hover:bg-slate-700 transition-colors duration-300 group"
                title="InfoCons - Asociația pentru Protecția Consumatorilor"
              >
                {/* InfoCons Logo */}
                <div className="text-center">
                  <svg
                    className="w-8 h-8 text-orange-400 group-hover:text-orange-300 transition-colors duration-300"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
              </a>
              <span className="text-xs text-slate-400 text-center">
                InfoCons
              </span>
            </div>

            <div className="flex flex-col items-center">
              <a
                href="https://netopia-payments.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-12 bg-white rounded-lg flex items-center justify-center mb-2 hover:bg-gray-100 transition-colors duration-300 group p-1"
                title="NETOPIA Payments - Plăți securizate prin platformă licențiată"
              >
                {/* NETOPIA Logo oficial conform contractului */}
                <div className="w-12 h-8 group-hover:scale-105 transition-transform duration-300">
                  <img
                    src="/images/netopia-official-logo.svg"
                    alt="NETOPIA"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/NP.svg";
                    }}
                  />
                </div>
              </a>
              <span className="text-xs text-slate-400 text-center font-medium">
                NETOPIA
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-2 group">
                {/* Plăți Icon elegant cu mai multe metode */}
                <div className="grid grid-cols-2 gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-sm group-hover:bg-blue-300 transition-colors duration-300"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-sm group-hover:bg-green-300 transition-colors duration-300"></div>
                  <div className="w-2 h-2 bg-red-400 rounded-sm group-hover:bg-red-300 transition-colors duration-300"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-sm group-hover:bg-yellow-300 transition-colors duration-300"></div>
                </div>
              </div>
              <span className="text-xs text-slate-400 text-center">
                Plăți Securizate
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-2 group">
                <svg
                  className="w-6 h-6 text-green-400 group-hover:text-green-300 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <span className="text-xs text-slate-400 text-center">
                SSL Securizat
              </span>
            </div>
          </div>

          {/* Company Info & Copyright - Conform cu legea românească */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-800">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-slate-400">
                <span className="font-medium text-white">HIFITBOX SRL</span> |
                CUI: RO41039008 | J17/926/2019
              </p>
              <p className="text-sm text-slate-400 mt-1">
                📍 Petroșani, Strada 9 Mai, Bloc 2A
              </p>
              <p className="text-sm text-slate-400 mt-1">
                📧 lupulsicorbul@gmail.com | 📞 0734 931 703
              </p>
              <p className="text-xs text-slate-500 mt-2">
                <a
                  href="/anpc-consumer-info"
                  className="text-green-400 hover:text-green-300 transition-colors duration-300"
                >
                  📋 ANPC - Informații pentru consumatori
                </a>
                {" | "}
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
                >
                  🇪🇺 Platforma SOL ODR
                </a>
              </p>
            </div>

            <div className="text-center md:text-right">
              <p className="text-sm text-slate-400">
                &copy; {currentYear} Lupul și Corbul - HIFITBOX SRL. Toate
                drepturile rezervate.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Dezvoltat cu ❤️ pentru comunitatea românească
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Plăți procesate prin{" "}
                <a
                  href="https://netopia-payments.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-300 font-medium"
                >
                  NETOPIA Payments
                </a>{" "}
                - Platformă licențiată și securizată
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
