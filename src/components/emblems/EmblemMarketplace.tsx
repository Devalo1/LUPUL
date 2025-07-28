import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { emblemMarketplaceService } from "../../services/emblemMarketplaceService";
import { emblemService } from "../../services/emblemService";
import { EmblemStockService } from "../../services/emblemStockService";
import { Emblem } from "../../types/emblem";
import {
  FaShoppingCart,
  FaCrown,
  FaGem,
  FaMagic,
  FaHeart,
  FaFire,
  FaTag,
  FaUser,
  FaWarehouse,
} from "react-icons/fa";
import "./EmblemMarketplace.css";

interface MarketplaceListing {
  id: string;
  emblemId: string;
  sellerId: string;
  price: number;
  listedDate: Date | { toDate: () => Date };
  isActive: boolean;
  emblem: Emblem;
}

const EmblemMarketplace: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [myEmblem, setMyEmblem] = useState<Emblem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMyEmblem, setShowMyEmblem] = useState(false);
  const [listingPrice, setListingPrice] = useState<string>("");
  const [isListing, setIsListing] = useState(false);
  const [adminStocks, setAdminStocks] = useState<{ lupul_intelepta: number; corbul_mistic: number; gardianul_wellness: number; cautatorul_lumina: number; lastUpdated: Date; updatedBy: string } | null>(null);
  const [showAdminInfo, setShowAdminInfo] = useState(false);

  const emblemIcons = {
    lupul_intelepta: <FaCrown className="emblem-icon crown" />,
    corbul_mistic: <FaMagic className="emblem-icon magic" />,
    gardianul_wellness: <FaHeart className="emblem-icon heart" />,
    cautatorul_lumina: <FaGem className="emblem-icon gem" />,
  };

  useEffect(() => {
    loadMarketplaceData();
    loadAdminInfo();
  }, [user]);

  const loadAdminInfo = async () => {
    try {
      const stocks = await EmblemStockService.getStock();
      setAdminStocks(stocks);
    } catch (error) {
      console.error("Error loading admin stocks:", error);
    }
  };

  const loadMarketplaceData = async () => {
    setIsLoading(true);
    try {
      // Încarcă toate listing-urile active
      const marketplaceListings =
        await emblemMarketplaceService.getMarketplaceListings();
      setListings(marketplaceListings);

      // Încarcă emblema utilizatorului (dacă are)
      if (user) {
        const userEmblem = await emblemService.getUserEmblem(user.uid);
        setMyEmblem(userEmblem);
      }
    } catch (error) {
      console.error("Error loading marketplace data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleListMyEmblem = async () => {
    if (!user || !myEmblem || !listingPrice) return;

    const price = parseFloat(listingPrice);
    if (isNaN(price) || price <= 0) {
      alert("Te rog introdu un preț valid");
      return;
    }

    setIsListing(true);
    try {
      await emblemMarketplaceService.listEmblemForSale(
        myEmblem.id,
        user.uid,
        price
      );

      alert(`🎉 Emblema ta a fost listată cu succes la ${price} RON!`);
      setShowMyEmblem(false);
      setListingPrice("");

      // Reîncarcă datele
      await loadMarketplaceData();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Eroare necunoscută";
      alert(`Eroare la listare: ${errorMessage}`);
    } finally {
      setIsListing(false);
    }
  };

  const handlePurchaseFromMarketplace = async (listing: MarketplaceListing) => {
    if (!user) {
      alert("Trebuie să fii autentificat pentru a cumpăra");
      return;
    }

    if (myEmblem) {
      alert("Deja deții o emblemă! Nu poți avea mai mult de una.");
      return;
    }

    if (listing.sellerId === user.uid) {
      alert("Nu îți poți cumpăra propria emblemă!");
      return;
    }

    try {
      // Inițiază plată prin Netopia pentru marketplace
      const orderId = `marketplace_${listing.id}_${user.uid}_${Date.now()}`;

      const paymentData = {
        orderId: orderId,
        amount: listing.price * 100, // RON -> bani
        currency: "RON",
        description: `Cumpărare emblemă marketplace: ${listing.emblem.metadata?.description || listing.emblem.type}`,
        customerInfo: {
          firstName: user.displayName?.split(" ")[0] || "Client",
          lastName: user.displayName?.split(" ")[1] || "Marketplace",
          email: user.email || "",
          phone: "0700000000",
          address: "Adresa client",
          city: "Bucuresti",
          county: "Bucuresti",
          postalCode: "010000",
        },
        listingId: listing.id,
        emblemId: listing.emblemId,
        sellerId: listing.sellerId,
        buyerId: user.uid,
        isMarketplacePurchase: true,
      };

      const response = await fetch(
        "/.netlify/functions/netopia-initiate-marketplace",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        }
      );

      if (!response.ok) {
        throw new Error("Eroare la inițierea plății marketplace");
      }

      const result = await response.json();

      if (result.paymentUrl) {
        // Salvează detalii pentru confirmare
        localStorage.setItem(
          "pendingMarketplacePurchase",
          JSON.stringify({
            orderId,
            listingId: listing.id,
            emblemId: listing.emblemId,
            buyerId: user.uid,
            timestamp: Date.now(),
          })
        );

        // Deschide pop-up pentru plata Netopia
        const paymentWindow = window.open(
          "",
          "netopia-payment",
          "width=800,height=600,scrollbars=yes"
        );
        if (paymentWindow) {
          paymentWindow.document.write(result.paymentUrl);
          paymentWindow.document.close();
        } else {
          // Fallback - redirect în aceeași fereastră
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = result.paymentUrl;
          document.body.appendChild(tempDiv);
        }
      } else {
        throw new Error("Nu s-a putut obține formularul de plată");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Eroare necunoscută";
      alert(`Eroare la cumpărare: ${errorMessage}`);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
    }).format(price);
  };

  const getTimeSinceList = (listedDate: Date | { toDate: () => Date }) => {
    const now = new Date();
    const listed =
      "toDate" in listedDate ? listedDate.toDate() : new Date(listedDate);
    const diffHours = Math.floor(
      (now.getTime() - listed.getTime()) / (1000 * 60 * 60)
    );

    if (diffHours < 1) return "Acum";
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  if (isLoading) {
    return (
      <div className="marketplace-loading">
        <div className="loading-spinner">🔮</div>
        <p>Se încarcă marketplace-ul...</p>
      </div>
    );
  }

  return (
    <div className="emblem-marketplace">
      <div className="marketplace-header">
        <h1>🏪 Marketplace Embleme NFT</h1>
        <p className="marketplace-subtitle">
          Cumpără și vinde embleme rare cu membri ai comunității Lupul și Corbul
        </p>
      </div>

      {/* Admin Information Panel */}
      {adminStocks && (
        <div className="admin-info-panel">
          <div className="admin-info-header">
            <h3 className="admin-info-title">
              <FaWarehouse style={{ marginRight: "8px" }} />
              Stocuri Admin - Actualizat din Panel
            </h3>
            <button 
              onClick={() => setShowAdminInfo(!showAdminInfo)}
              className="admin-toggle-btn"
            >
              {showAdminInfo ? "Ascunde" : "Afișează"}
            </button>
          </div>
          
          {showAdminInfo && (
            <div className="admin-stocks-grid">
              <div className="admin-stock-item">
                <div className="admin-stock-icon">🐺</div>
                <div className="admin-stock-count lupul">{adminStocks.lupul_intelepta}</div>
                <div className="admin-stock-label">Lupul Înțeleapta</div>
              </div>
              <div className="admin-stock-item">
                <div className="admin-stock-icon">🐦</div>
                <div className="admin-stock-count corbul">{adminStocks.corbul_mistic}</div>
                <div className="admin-stock-label">Corbul Mistic</div>
              </div>
              <div className="admin-stock-item">
                <div className="admin-stock-icon">💚</div>
                <div className="admin-stock-count gardian">{adminStocks.gardianul_wellness}</div>
                <div className="admin-stock-label">Gardianul Wellness</div>
              </div>
              <div className="admin-stock-item">
                <div className="admin-stock-icon">✨</div>
                <div className="admin-stock-count cautator">{adminStocks.cautatorul_lumina}</div>
                <div className="admin-stock-label">Căutătorul Lumina</div>
              </div>
            </div>
          )}
          
          <div className="admin-info-footer">
            Ultima actualizare: {adminStocks.lastUpdated.toLocaleString("ro-RO")} • 
            Actualizat de: {adminStocks.updatedBy}
          </div>
        </div>
      )}

      {/* My Emblem Section */}
      {user && myEmblem && (
        <div className="my-emblem-section">
          <div className="section-header">
            <h2>🎯 Emblema Ta</h2>
            <button
              className="toggle-my-emblem"
              onClick={() => setShowMyEmblem(!showMyEmblem)}
            >
              {showMyEmblem ? "Ascunde" : "Gestionează"}
            </button>
          </div>

          {showMyEmblem && (
            <div className="my-emblem-card">
              <div className="emblem-preview">
                {emblemIcons[myEmblem.type as keyof typeof emblemIcons]}
                <div className="emblem-details">
                  <h3>
                    {myEmblem.type
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </h3>
                  <div
                    className={`emblem-rarity ${myEmblem.metadata?.rarity || "common"}`}
                  >
                    <FaGem /> {myEmblem.metadata?.rarity || "common"}
                  </div>
                  <p>Cumpărată la: {formatPrice(myEmblem.purchasePrice)}</p>
                </div>
              </div>

              {myEmblem.isTransferable ? (
                <div className="listing-controls">
                  <div className="price-input">
                    <label>Preț de vânzare (RON):</label>
                    <input
                      type="number"
                      value={listingPrice}
                      onChange={(e) => setListingPrice(e.target.value)}
                      placeholder="ex: 200"
                      min="1"
                    />
                  </div>
                  <button
                    className="list-button"
                    onClick={handleListMyEmblem}
                    disabled={isListing || !listingPrice}
                  >
                    {isListing
                      ? "Se listează..."
                      : "📝 Listează pentru vânzare"}
                  </button>
                </div>
              ) : (
                <div className="transfer-disabled">
                  <p>
                    ⏳ Transferurile nu sunt încă activate pentru această
                    emblemă
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Marketplace Listings */}
      <div className="marketplace-listings">
        <div className="section-header">
          <h2>🔥 Embleme Disponibile</h2>
          <span className="listings-count">{listings.length} embleme</span>
        </div>

        {listings.length === 0 ? (
          <div className="no-listings">
            <h3>📭 Nicio emblemă disponibilă momentan</h3>
            <p>Fii primul care listează o emblemă pe marketplace!</p>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map((listing) => (
              <div key={listing.id} className="marketplace-card">
                <div className="card-header">
                  <div className="emblem-icon-container">
                    {
                      emblemIcons[
                        listing.emblem.type as keyof typeof emblemIcons
                      ]
                    }
                  </div>
                  <div className="listing-time">
                    <FaTag /> {getTimeSinceList(listing.listedDate)}
                  </div>
                </div>

                <div className="emblem-info">
                  <h3>
                    {listing.emblem.type
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </h3>

                  <div className="emblem-stats">
                    <div className="stat">
                      <span className="stat-label">Raritate:</span>
                      <span
                        className={`stat-value rarity ${listing.emblem.metadata?.rarity || "common"}`}
                      >
                        <FaGem /> {listing.emblem.metadata?.rarity || "common"}
                      </span>
                    </div>

                    <div className="stat">
                      <span className="stat-label">Level:</span>
                      <span className="stat-value">{listing.emblem.level}</span>
                    </div>

                    <div className="stat">
                      <span className="stat-label">Engagement:</span>
                      <span className="stat-value">
                        {listing.emblem.engagement} pts
                      </span>
                    </div>
                  </div>

                  {listing.emblem.metadata?.uniqueTraits && (
                    <div className="unique-traits">
                      <span className="traits-label">Trăsături unice:</span>
                      <div className="traits-list">
                        {listing.emblem.metadata.uniqueTraits
                          .slice(0, 2)
                          .map((trait, idx) => (
                            <span key={idx} className="trait-tag">
                              {trait}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="price-section">
                  <div className="original-price">
                    Original: {formatPrice(listing.emblem.purchasePrice)}
                  </div>
                  <div className="current-price">
                    {formatPrice(listing.price)}
                  </div>
                  {listing.price > listing.emblem.purchasePrice && (
                    <div className="price-increase">
                      <FaFire /> +
                      {Math.round(
                        ((listing.price - listing.emblem.purchasePrice) /
                          listing.emblem.purchasePrice) *
                          100
                      )}
                      %
                    </div>
                  )}
                </div>

                <div className="seller-info">
                  <FaUser /> Vândător: {listing.sellerId.substring(0, 8)}...
                </div>

                <button
                  className="buy-button"
                  onClick={() => handlePurchaseFromMarketplace(listing)}
                  disabled={
                    !user || myEmblem !== null || listing.sellerId === user?.uid
                  }
                >
                  {!user ? (
                    "🔐 Autentifică-te"
                  ) : myEmblem ? (
                    "❌ Ai deja o emblemă"
                  ) : listing.sellerId === user?.uid ? (
                    "🚫 Emblema ta"
                  ) : (
                    <>
                      <FaShoppingCart /> 💳 Cumpără acum
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="marketplace-info">
        <h3>💰 Cum funcționează Marketplace-ul?</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>🏪 Pentru Cumpărători</h4>
            <p>
              Cumperi embleme rare de la alți membri. Plăți securizate prin
              Netopia cu cardul bancar.
            </p>
          </div>
          <div className="info-item">
            <h4>💸 Pentru Vânzători</h4>
            <p>
              Listezi emblema ta și primești 85% din preț. Restul merge către
              royalty (10%) și platformă (5%).
            </p>
          </div>
          <div className="info-item">
            <h4>🔄 Transfer Ownership</h4>
            <p>
              Emblema se transferă automat în Firebase după plata confirmată.
              Beneficiile merg la noul proprietar.
            </p>
          </div>
          <div className="info-item">
            <h4>📈 Investiție Inteligentă</h4>
            <p>
              Emblemele rare pot crește în valoare pe măsură ce comunitatea se
              dezvoltă.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmblemMarketplace;
