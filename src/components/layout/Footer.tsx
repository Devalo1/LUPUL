import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleNewsletterSubmit = async () => {
    if (!email) {
      setMessage('Te rugăm să introduci o adresă de email validă.');
      return;
    }

    try {
      // Simulare trimitere email către lupulsicorbul@gmail.com
      await fetch('https://formsubmit.co/ajax/lupulsicorbul@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      setMessage('Te-ai abonat cu succes la newsletter!');
      setEmail('');
    } catch (error) {
      setMessage('A apărut o eroare. Te rugăm să încerci din nou.');
    }
  };

  return (
    <footer className="footer">
      {/* Decorative elements */}
      <div className="footer-gradient-overlay"></div>
      <div className="footer-decoration footer-decoration-1"></div>
      <div className="footer-decoration footer-decoration-2"></div>
      
      <div className="footer-container">
        <div className="footer-grid">
          {/* Column 1: About */}
          <div>
            <h3 className="footer-title">Lupul și Corbul</h3>
            <p className="mb-4">
              Descoperă valorile autentice românești prin produsele și
              evenimentele noastre care îmbină tradiția cu inovația.
            </p>
            
            <div className="footer-social">
              <a href="https://m.facebook.com/61563399020209/" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
                </svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="https://www.tiktok.com/@lupulsicorbul.d.p?_t=ZN-8vPR7xLoxpm&_r=1" aria-label="TikTok">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm3.93 12.36a4.15 4.15 0 01-2.93 1.14 4.22 4.22 0 01-1.5-.27v2.11a6.36 6.36 0 002.43-.48 6.18 6.18 0 002.43-1.5 6.36 6.36 0 001.5-2.43 6.18 6.18 0 00.48-2.43h-2.11a4.22 4.22 0 01-.27 1.5 4.15 4.15 0 01-1.14 2.93z"></path>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Column 2: Quick Links - only existing pages */}
          <div>
            <h3 className="footer-title">Linkuri Rapide</h3>
            <ul className="footer-links">
              <li><Link to="/">Acasă</Link></li>
              <li><Link to="/products">Produse</Link></li>
              <li><Link to="/events">Evenimente</Link></li>
              <li><Link to="/cart">Coș de cumpărături</Link></li>
            </ul>
          </div>
          
          {/* Column 3: Contact */}
          <div>
            <h3 className="footer-title">Contact</h3>
            <ul className="footer-links">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                lupulsicorbul@gmail.com
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                0734 931 703
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                0734 931 703
              </li>
            </ul>
          </div>
          
          {/* Column 4: Newsletter */}
          <div>
            <h3 className="footer-title">Newsletter</h3>
            <p className="mb-4">Abonează-te pentru a primi cele mai noi actualizări și oferte.</p>
            <div className="mt-4">
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Adresa ta de email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-700 text-white px-4 py-2 rounded-l-md w-full focus:outline-none focus:ring-1 focus:ring-white"
                />
                <button 
                  onClick={handleNewsletterSubmit}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-r-md transition-colors duration-300"
                >
                  Abonare
                </button>
              </div>
              {message && <p className="mt-2 text-sm text-white">{message}</p>}
            </div>
          </div>
        </div>
        
        {/* Logos section - keeping mandatory images */}
        <div className="footer-bottom">
          <div className="footer-logos">
            {/* ANPC Logo */}
            <div className="footer-logo-item">
              <a 
                href="https://anpc.ro/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-logo-container"
              >
                <img 
                  src="/images/anpc-logo.png" 
                  alt="ANPC - Autoritatea Națională pentru Protecția Consumatorilor" 
                  className="max-h-10 max-w-full object-contain"
                />
              </a>
              <p className="footer-logo-caption">Autoritatea Națională pentru Protecția Consumatorilor</p>
            </div>

            {/* SOL Platform Logo */}
            <div className="footer-logo-item">
              <a 
                href="https://ec.europa.eu/consumers/odr/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-logo-container"
              >
                <img 
                  src="/images/sol-logo.png" 
                  alt="SOL - Soluționarea Online a Litigiilor" 
                  className="max-h-10 max-w-full object-contain"
                />
              </a>
              <p className="footer-logo-caption">Soluționarea Online a Litigiilor</p>
            </div>

            {/* InfoCons Logo */}
            <div className="footer-logo-item">
              <a 
                href="https://www.infocons.ro/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-logo-container"
              >
                <img 
                  src="/images/info-cons.png" 
                  alt="InfoCons - Asociația pentru Protecția Consumatorilor" 
                  className="max-h-10 max-w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://www.infocons.ro/wp-content/themes/sydney-child/images/InfoCons-logo.png';
                  }}
                />
              </a>
              <p className="footer-logo-caption">Asociația pentru Protecția Consumatorilor</p>
            </div>

            {/* Metode de plată */}
            <div className="footer-logo-item">
              <div className="footer-logo-container">
                <img 
                  src="/images/payment-methods.png" 
                  alt="Metode de plată acceptate" 
                  className="max-h-10 max-w-full object-contain"
                />
              </div>
              <p className="footer-logo-caption">Metode de plată acceptate</p>
            </div>
          </div>

          {/* Company info */}
          <div className="footer-company-info">
            <p>Lupul și Corbul SRL | CUI: RO12345678 | Reg. Comerțului: J12/345/2023</p>
            <p>Adresa: Str. Exemplu nr. 123, București, România</p>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="footer-copyright">
          <p>&copy; {currentYear} Lupul și Corbul. Toate drepturile rezervate.</p>
        </div>
      </div>

      {/* Structured Data */}
      <script type="application/ld+json">
        {`
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Lupul și Corbul",
          "url": "https://example.com",
          "logo": "https://example.com/images/LC.png",
          "sameAs": [
            "https://www.facebook.com/lupulsicorbul",
            "https://www.instagram.com/lupulsicorbul"
          ]
        }
        `}
      </script>
      <script type="application/ld+json">
        {`
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "url": "https://example.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://example.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }
        `}
      </script>
    </footer>
  );
};

export default Footer;