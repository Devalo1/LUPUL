import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { emblemService } from "../../services/emblemService";
import { EMBLEM_COLLECTIONS } from "../../types/emblem";
import { FaShoppingCart } from "react-icons/fa";
import "./EmblemMintingPage.css";

interface EmblemCollection {
  key: string;
  name: string;
  description: string;
  price: number;
  benefits: string[];
  image: string;
  available: number;
  tier: number;
  icon: React.ReactNode;
}

const EmblemMintingPage: React.FC = () => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [userHasEmblem, setUserHasEmblem] = useState(false);
  const [availableStocks, setAvailableStocks] = useState<
    Record<string, number>
  >({});

  const emblemIcons = {
    lupul_intelepta: (
      <div className="emblem-image-container">
        <img
          src="/images/emblems/lupul_intelepta.svg"
          alt="Lupul Înțeleapta"
          className="emblem-image"
        />
      </div>
    ),
    corbul_mistic: (
      <div className="emblem-image-container">
        <img
          src="/images/emblems/corbul_mistic.svg"
          alt="Corbul Mistic"
          className="emblem-image"
        />
      </div>
    ),
    gardianul_wellness: (
      <div className="emblem-image-container">
        <img
          src="/images/emblems/gardianul_wellness.svg"
          alt="Gardianul Wellness"
          className="emblem-image"
        />
      </div>
    ),
    cautatorul_lumina: (
      <div className="emblem-image-container">
        <img
          src="/images/emblems/cautatorul_lumina.svg"
          alt="Căutătorul Lumină"
          className="emblem-image"
        />
      </div>
    ),
  };

  const collections: EmblemCollection[] = Object.entries(EMBLEM_COLLECTIONS)
    .map(([key, collection]) => ({
      key,
      ...collection,
      icon: emblemIcons[key as keyof typeof emblemIcons],
    }))
    .sort((a, b) => b.tier - a.tier); // Sort by tier descending

  useEffect(() => {
    console.log(
      "🔍 EmblemMintingPage useEffect - user:",
      user ? "authenticated" : "not authenticated"
    );
    if (user) {
      checkUserEmblem();
      loadAvailableStocks();
    } else {
      // Dacă nu există user, setează stocurile default pentru testare
      const defaultStocks: Record<string, number> = {};
      Object.keys(EMBLEM_COLLECTIONS).forEach((key) => {
        defaultStocks[key] = EMBLEM_COLLECTIONS[key].available;
      });
      setAvailableStocks(defaultStocks);
      console.log("🏪 Stocuri default setate:", defaultStocks);
    }
  }, [user]);

  const checkUserEmblem = async () => {
    if (!user) return;

    try {
      const userEmblem = await emblemService.getUserEmblem(user.uid);
      setUserHasEmblem(!!userEmblem);
      console.log(
        "👤 Verificare emblemă utilizator:",
        userEmblem ? "are emblemă" : "nu are emblemă"
      );
    } catch (error) {
      console.error("❌ Eroare la verificarea emblemei utilizatorului:", error);
      // În caz de eroare, presupunem că nu are emblemă pentru a permite testarea
      setUserHasEmblem(false);
      console.log("🔧 Fallback: presupun că utilizatorul nu are emblemă");
    }
  };

  const loadAvailableStocks = async () => {
    console.log("📦 Încărcare stocuri...");
    const stocks: Record<string, number> = {};

    for (const key of Object.keys(EMBLEM_COLLECTIONS)) {
      try {
        const available = await emblemService.getAvailableCount(key);
        stocks[key] = available;
        console.log(`📊 ${key}: ${available} disponibile`);
      } catch (error) {
        console.error(`❌ Eroare la încărcarea stocului pentru ${key}:`, error);
        // Setează stocul default din configurație în caz de eroare
        stocks[key] = EMBLEM_COLLECTIONS[key].available;
        console.log(`🔧 Folosesc stocul default pentru ${key}: ${stocks[key]}`);
      }
    }

    setAvailableStocks(stocks);
    console.log("🏪 Toate stocurile actualizate:", stocks);
  };

  const handleAddToCart = async (emblemType: string) => {
    console.log("🛒 Adăugare emblemă în coș:", emblemType);

    if (!user) {
      alert("Trebuie să fii autentificat pentru a cumpăra o emblemă");
      return;
    }

    if (userHasEmblem) {
      alert(
        "Deja deții o emblemă! Fiecare utilizator poate avea doar o emblemă."
      );
      return;
    }

    const availableStock = availableStocks[emblemType] || 0;
    if (availableStock === 0) {
      alert("Ne pare rău, această emblemă nu mai este disponibilă!");
      return;
    }

    try {
      const collection = EMBLEM_COLLECTIONS[emblemType];

      // Creăm un produs special pentru emblemă cu livrare fizică
      const emblemProduct = {
        id: `emblem_${emblemType}`,
        name: `${collection.name} + Tricou Premium + QR Cod`,
        price: collection.price,
        image: `/images/emblems/${emblemType}.svg`,
        quantity: 1,
      };

      // Adăugăm în coș
      addItem(emblemProduct);

      alert(
        `✅ Emblema "${collection.name}" a fost adăugată în coș!\n\n� INCLUS:\n• Emblemă digitală exclusivă\n• Tricou premium personalizat\n• QR Cod cu datele emblemei\n• Livrare prin curier\n\nPoți finaliza comanda în coș cu plata cu cardul.`
      );

      // Redirect către coș pentru finalizare
      navigate("/cart");
    } catch (error: unknown) {
      console.error("❌ Eroare la adăugarea în coș:", error);
      alert(
        `Eroare la adăugarea în coș: ${error instanceof Error ? error.message : "Eroare necunoscută"}`
      );
    }
  };

  if (userHasEmblem) {
    return (
      <div className="emblem-minting-page">
        <div className="emblem-owned-message">
          <h2>🎉 Felicitări!</h2>
          <p>Deja deții o emblemă din comunitatea noastră exclusivă!</p>
          <p>
            Verifică profilul tău pentru a vedea emblema și beneficiile tale.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="emblem-minting-page">
      <div className="emblem-header">
        <h1>🔮 Alătură-te Comunității Exclusive</h1>
        <p className="emblem-subtitle">
          Dobândește o emblemă unică și accesează beneficii premium în
          ecosistemul Lupul și Corbul
        </p>
      </div>

      <div className="emblem-collections">
        {collections.map((collection) => (
          <div
            key={collection.key}
            className={`emblem-card tier-${collection.tier}`}
          >
            <div className="emblem-card-header">
              <div className="emblem-icon-container">{collection.icon}</div>
              <h3>{collection.name}</h3>
              <span className={`tier-badge tier-${collection.tier}`}>
                Tier {collection.tier}
              </span>
            </div>

            <p className="emblem-description">{collection.description}</p>

            <div className="emblem-benefits">
              <h4>Beneficii:</h4>
              <ul>
                {collection.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>

            <div className="emblem-availability">
              <span className="stock-info">
                Disponibile: {availableStocks[collection.key] || 0} /{" "}
                {EMBLEM_COLLECTIONS[collection.key].totalSupply}
              </span>

              {(availableStocks[collection.key] || 0) <= 3 && (
                <span className="low-stock">⚠️ Stoc redus!</span>
              )}
            </div>

            <div className="emblem-price">
              <span className="price">{collection.price} RON</span>
            </div>

            <button
              className={`purchase-button ${
                (availableStocks[collection.key] || 0) === 0
                  ? "purchase-button--disabled"
                  : ""
              }`}
              onClick={() => handleAddToCart(collection.key)}
              disabled={(availableStocks[collection.key] || 0) === 0}
            >
              {(availableStocks[collection.key] || 0) === 0 ? (
                <span>❌ Epuizat</span>
              ) : (
                <>
                  <FaShoppingCart /> � Adaugă în Coș (+ Tricou & QR)
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="emblem-info">
        <h3>💰 De ce să investești în Embleme NFT-like?</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>🔒 Exclusivitate Reală</h4>
            <p>
              Stoc limitat permanent - doar câțiva privilegiați vor deține
              fiecare tip de emblemă. Nu vor mai fi create altele!
            </p>
          </div>
          <div className="info-item">
            <h4>� Investiție Valoroasă</h4>
            <p>
              Pe măsură ce comunitatea crește, emblema ta devine mai valoroasă.
              Primii cumpărători beneficiază de avantajul pionierilor.
            </p>
          </div>
          <div className="info-item">
            <h4>🎪 Evenimente VIP</h4>
            <p>
              Acces permanent la evenimente exclusive, meetup-uri fizice și
              oportunități de networking cu alți deținători premium.
            </p>
          </div>
          <div className="info-item">
            <h4>🤖 AI Premium</h4>
            <p>
              Experiență AI îmbunătățită cu răspunsuri prioritare, funcții
              avansate și acces la feature-uri beta înainte de toți ceilalți.
            </p>
          </div>
          <div className="info-item">
            <h4>🏆 Status de Prestigiu</h4>
            <p>
              Badge-uri vizibile în comunitate, profiluri premium și
              recunoaștere specială ca membru fondator al comunității elite.
            </p>
          </div>
          <div className="info-item">
            <h4>💳 Plată Securizată</h4>
            <p>
              Plăți procesate prin Netopia Payments - cea mai sigură platformă
              de plăți din România. Suport pentru toate cardurile bancare.
            </p>
          </div>
        </div>

        <div className="limited-stock-warning">
          <h4>⚡ ATENȚIE: Stocuri Limitate!</h4>
          <p>
            Odată epuizate, aceste embleme NU vor mai fi disponibile niciodată.
            Investește acum în viitorul comunității Lupul și Corbul!
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmblemMintingPage;
