import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/HomePage.css";
import { useNavigation } from "../hooks/useNavigation";

// Import icons
import { FaLeaf, FaHandHoldingHeart, FaBalanceScale, FaShieldAlt, FaAward, FaUsers } from "react-icons/fa";

const HomePage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { toggleSideNav } = useNavigation(); // Folosim hook-ul useNavigation pentru a controla meniul lateral

  // Handling scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLoginClick = () => {
    // Salvăm intenția de redirecționare către dashboard după login
    sessionStorage.setItem("afterLoginRedirect", "/dashboard");
    navigate("/login");
  };

  const handleRegisterClick = () => {
    // Salvăm intenția de redirecționare către dashboard după înregistrare
    sessionStorage.setItem("afterLoginRedirect", "/dashboard");
    navigate("/register");
  };

  const handleProductsClick = () => {
    navigate("/products");
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  const testimonials = [
    {
      name: "Maria Popescu",
      text: "Produsele lor m-au ajutat să regăsesc echilibrul interior de care aveam atât de multă nevoie.",
      role: "Client"
    },
    {
      name: "Alexandru Ionescu",
      text: "Am descoperit în acest brand nu doar produse, ci o întreagă filozofie care rezonează cu valorile mele.",
      role: "Client fidel"
    },
    {
      name: "Elena Dumitrescu",
      text: "Calitatea și atenția la detalii m-au convins. Recomand cu încredere!",
      role: "Ambasador brand"
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section with Parallax Effect */}
      <div className={`hero-section ${scrolled ? "scrolled" : ""}`}>
        <div className="background-parallax"></div>
        <div className="overlay-gradient"></div>

        <motion.div 
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="brand-logo">
            <img src="/images/LC.png" alt="Lupul și Corbul Logo" className="logo-image" />
          </div>
          
          <motion.h1 
            className="brand-title"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            Lupul și Corbul
          </motion.h1>
          
          <motion.h2 
            className="brand-tagline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Empatie · Conexiune · Echilibru
          </motion.h2>
          
          <motion.div 
            className="trust-badges"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="badge"><FaShieldAlt /> Calitate garantată</div>
            <div className="badge"><FaAward /> Brand 100% românesc</div>
            <div className="badge"><FaUsers /> Peste 1,000 clienți mulțumiți</div>
          </motion.div>
          
          <motion.div 
            className="action-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="auth-buttons">
              <button 
                onClick={handleLoginClick} 
                className="btn-primary pulsate"
              >
                Contul meu
              </button>
              <button 
                onClick={handleRegisterClick} 
                className="btn-secondary glow"
              >
                Creează cont
              </button>
            </div>
            
            <div className="nav-buttons">
              <button 
                onClick={() => {
                  console.log("Buton \"Descoperă serviciile noastre\" apăsat");
                  toggleSideNav();
                }} 
                className="btn-discover"
              >
                Descoperă serviciile noastre
              </button>
              <button onClick={handleProductsClick} className="btn-products">
                Explorează produsele
              </button>
            </div>
          </motion.div>
          
          {/* Romanian Brand Banner with improved styling */}
          <motion.div 
            className="romanian-brand-banner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <span className="blue-text">UN </span>
            <span className="yellow-text">BRAND ROMÂNESC </span>
            <span className="red-text">PENTRU TOȚI OAMENII</span>
            <span className="eu-symbol">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/1024px-Flag_of_Europe.svg.png" 
                alt="European Union Flag" 
                style={{ 
                  width: "60px", 
                  height: "auto", 
                  marginLeft: "15px",
                  verticalAlign: "middle",
                  display: "inline-block",
                  borderRadius: "4px",
                  opacity: 0.85,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)"
                }} 
              />
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Value Proposition Section */}
      <section className="values-section">
        <h2 className="section-title">De ce să ne alegi</h2>
        
        <div className="values-grid">
          <motion.div 
            className="value-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="icon-container">
              <FaLeaf />
            </div>
            <h3>Produse naturale</h3>
            <p>Folosim doar ingrediente naturale și sustenabile în toate produsele noastre.</p>
          </motion.div>
          
          <motion.div 
            className="value-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="icon-container">
              <FaHandHoldingHeart />
            </div>
            <h3>Grijă autentică</h3>
            <p>Fiecare produs este creat cu atenție și responsabilitate față de tine și natură.</p>
          </motion.div>
          
          <motion.div 
            className="value-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="icon-container">
              <FaBalanceScale />
            </div>
            <h3>Echilibru și armonie</h3>
            <p>Susținem o filozofie bazată pe echilibrul dintre corp, minte și spiritul naturii.</p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2 className="section-title">Ce spun clienții noștri</h2>
        
        <div className="testimonials-container">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              className="testimonial-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="quote-mark">"</div>
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-author">
                <strong>{testimonial.name}</strong>
                <span>{testimonial.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Începe călătoria ta către echilibru</h2>
          <p>Alătură-te comunității noastre și descoperă produse care îți transformă viața.</p>
          <button onClick={handleRegisterClick} className="cta-button">
            Creează cont acum
          </button>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="homepage-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <h3>Lupul și Corbul</h3>
            <p>Empatie · Conexiune · Echilibru</p>
          </div>
          
          <div className="footer-links">
            <a href="/about">Despre noi</a>
            <a href="/products">Produse</a>
            <a href="/contact">Contact</a>
            <a href="/terms">Termeni și condiții</a>
          </div>
          
          <div className="footer-social">
            <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>Lupul și Corbul © {new Date().getFullYear()}. Toate drepturile rezervate.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
