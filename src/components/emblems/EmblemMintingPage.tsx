import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { emblemService } from "../../services/emblemService";
import { EMBLEM_COLLECTIONS } from "../../types/emblem";
import {
  FaShoppingCart,
  FaCrown,
  FaGem,
  FaMagic,
  FaHeart,
} from "react-icons/fa";
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
  const [selectedEmblem, setSelectedEmblem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userHasEmblem, setUserHasEmblem] = useState(false);
  const [availableStocks, setAvailableStocks] = useState<
    Record<string, number>
  >({});

  const emblemIcons = {
    lupul_intelepta: <FaCrown className="emblem-icon crown" />,
    corbul_mistic: <FaMagic className="emblem-icon magic" />,
    gardianul_wellness: <FaHeart className="emblem-icon heart" />,
    cautatorul_lumina: <FaGem className="emblem-icon gem" />,
  };

  const collections: EmblemCollection[] = Object.entries(EMBLEM_COLLECTIONS)
    .map(([key, collection]) => ({
      key,
      ...collection,
      icon: emblemIcons[key as keyof typeof emblemIcons],
    }))
    .sort((a, b) => b.tier - a.tier); // Sort by tier descending

  useEffect(() => {
    if (user) {
      checkUserEmblem();
      loadAvailableStocks();
    }
  }, [user]);

  const checkUserEmblem = async () => {
    if (!user) return;

    try {
      const userEmblem = await emblemService.getUserEmblem(user.uid);
      setUserHasEmblem(!!userEmblem);
    } catch (error) {
      console.error("Error checking user emblem:", error);
    }
  };

  const loadAvailableStocks = async () => {
    const stocks: Record<string, number> = {};

    for (const key of Object.keys(EMBLEM_COLLECTIONS)) {
      try {
        const available = await emblemService.getAvailableCount(key);
        stocks[key] = available;
      } catch (error) {
        console.error(`Error loading stock for ${key}:`, error);
        stocks[key] = 0;
      }
    }

    setAvailableStocks(stocks);
  };

  const handlePurchase = async (emblemType: string) => {
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

    setIsLoading(true);
    setSelectedEmblem(emblemType);

    try {
      // Simulare plată - în producție aici ar fi integrarea cu Stripe
      const paymentId = `payment_${Date.now()}`;

      await emblemService.mintEmblem(user.uid, emblemType, paymentId);

      alert(
        `Felicitări! Ai dobândit emblema "${EMBLEM_COLLECTIONS[emblemType].name}"!`
      );

      // Refresh status
      await checkUserEmblem();
      await loadAvailableStocks();
    } catch (error: unknown) {
      console.error("Error purchasing emblem:", error);
      alert(
        `Eroare la cumpărarea emblemei: ${error instanceof Error ? error.message : "Eroare necunoscută"}`
      );
    } finally {
      setIsLoading(false);
      setSelectedEmblem(null);
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
            className={`emblem-card tier-${collection.tier} ${selectedEmblem === collection.key ? "purchasing" : ""}`}
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
              className="purchase-button"
              onClick={() => handlePurchase(collection.key)}
              disabled={
                isLoading || (availableStocks[collection.key] || 0) === 0
              }
            >
              {isLoading && selectedEmblem === collection.key ? (
                <span>Se procesează...</span>
              ) : (availableStocks[collection.key] || 0) === 0 ? (
                <span>Epuizat</span>
              ) : (
                <>
                  <FaShoppingCart /> Achiziționează
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="emblem-info">
        <h3>🎯 De ce embleme NFT-like?</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>🔒 Exclusivitate</h4>
            <p>
              Stoc limitat - doar câțiva privilegiați vor deține fiecare tip de
              emblemă
            </p>
          </div>
          <div className="info-item">
            <h4>🚀 Creștere în Valoare</h4>
            <p>
              Pe măsură ce comunitatea crește, emblema ta devine mai valoroasă
            </p>
          </div>
          <div className="info-item">
            <h4>🎪 Evenimente Private</h4>
            <p>Acces la eventos exclusive doar pentru deținătorii de embleme</p>
          </div>
          <div className="info-item">
            <h4>🤖 AI Personalizat</h4>
            <p>Experiență AI îmbunătățită cu funcții premium</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmblemMintingPage;
