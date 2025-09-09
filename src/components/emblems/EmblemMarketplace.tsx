import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { emblemMarketplaceService } from "../../services/emblemMarketplaceService";
import { emblemService } from "../../services/emblemService";
import { testDataService } from "../../services/testDataService";
import { Emblem } from "../../types/emblem";
import { isDev } from "../../utils/env";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import {
  FaShoppingCart,
  FaCrown,
  FaGem,
  FaMagic,
  FaHeart,
  FaFire,
  FaTag,
  FaUser,
  FaTimes,
  FaLock,
  FaSpinner,
} from "react-icons/fa";
import "./EmblemMarketplace.css";

interface MarketplaceListing {
  id: string;
  emblemId: string;
  sellerId: string;
  price: number;
  listedDate: Date | { toDate: () => Date };
  isActive: boolean;
  emblem?: Emblem | null; // made optional to handle malformed/partial listings
}

const EmblemMarketplace: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [myEmblem, setMyEmblem] = useState<Emblem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMyEmblem, setShowMyEmblem] = useState(false);
  const [listingPrice, setListingPrice] = useState<string>("");
  const [isListing, setIsListing] = useState(false);
  const [seedingTestData, setSeedingTestData] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const emblemIcons = {
    lupul_intelept: <FaCrown className="emblem-icon crown" />,
    corbul_mistic: <FaMagic className="emblem-icon magic" />,
    gardianul_wellness: <FaHeart className="emblem-icon heart" />,
    cautatorul_lumina: <FaGem className="emblem-icon gem" />,
  };

  useEffect(() => {
    loadMarketplaceData();
  }, [user]);

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

    setSelectedListing(listing);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedListing || !user) return;

    setPurchaseLoading(true);
    try {
      const orderId = `marketplace_${selectedListing.id}_${user.uid}_${Date.now()}`;

      const paymentData = {
        orderId: orderId,
        amount: selectedListing.price * 100,
        currency: "RON",
        description: `Cumpărare emblemă marketplace: ${selectedListing.emblem?.metadata?.description || selectedListing.emblem?.type}`,
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
        listingId: selectedListing.id,
        emblemId: selectedListing.emblemId,
        sellerId: selectedListing.sellerId,
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
        localStorage.setItem(
          "pendingMarketplacePurchase",
          JSON.stringify({
            orderId,
            listingId: selectedListing.id,
            emblemId: selectedListing.emblemId,
            buyerId: user.uid,
            timestamp: Date.now(),
          })
        );

        // Open payment in the same window with a more elegant transition
        const container = document.createElement("div");
        container.style.position = "fixed";
        container.style.top = "0";
        container.style.left = "0";
        container.style.width = "100%";
        container.style.height = "100%";
        container.style.background = "rgba(0,0,0,0.75)";
        container.style.zIndex = "9999";
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.justifyContent = "center";

        const frame = document.createElement("iframe");
        frame.style.width = "90%";
        frame.style.maxWidth = "600px";
        frame.style.height = "80vh";
        frame.style.border = "none";
        frame.style.borderRadius = "12px";
        frame.style.boxShadow = "0 4px 32px rgba(0,0,0,0.2)";
        frame.srcdoc = result.paymentUrl;

        container.appendChild(frame);
        document.body.appendChild(container);

        // Clean up the container when payment is complete/cancelled
        const cleanup = (e: MessageEvent) => {
          if (e.data === "payment_complete" || e.data === "payment_cancelled") {
            document.body.removeChild(container);
            window.removeEventListener("message", cleanup);
            setSelectedListing(null);
            setPurchaseLoading(false);
            loadMarketplaceData();
          }
        };

        window.addEventListener("message", cleanup);
      } else {
        throw new Error("Nu s-a putut obține formularul de plată");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Eroare necunoscută";
      alert(`Eroare la cumpărare: ${errorMessage}`);
      setPurchaseLoading(false);
      setSelectedListing(null);
    }
  };

  const seedTestListings = async () => {
    if (!isDev || !user || seedingTestData) return;

    try {
      setSeedingTestData(true);
      await testDataService.createMultipleTestEmblems(user.uid, 4);
      await loadMarketplaceData();
      alert("Am creat 4 embleme de test pentru development!");
    } catch (e) {
      console.error("Eroare la crearea datelor de test:", e);
      alert("Nu am putut crea listing-uri de test: " + (e as Error).message);
    } finally {
      setSeedingTestData(false);
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
        {isDev && (
          <button
            onClick={seedTestListings}
            disabled={seedingTestData}
            className="px-3 py-2 bg-yellow-500 text-white rounded mt-4"
          >
            {seedingTestData ? "Se creează..." : "Creează listing-uri de test (dev)"}
          </button>
        )}
      </div>

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
          <span className="listings-count">{listings.filter(l => l.emblem).length} embleme</span>
        </div>

        {listings.filter(l => l.emblem).length === 0 ? (
          <div className="no-listings">
            <h3>📭 Nicio emblemă disponibilă momentan</h3>
            <p>Fii primul care listează o emblemă pe marketplace!</p>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.filter(l => l.emblem).map((listing) => {
              const emblem = listing.emblem as Emblem; // safe cast: we've filtered undefined
              const emblemType = emblem?.type || "lupul_intelept";
              const icon = emblemIcons[emblemType as keyof typeof emblemIcons] || (
                <FaTag className="emblem-icon default" />
              );

              return (
                <div key={listing.id} className="marketplace-card">
                  <div className="card-header">
                    <div className="emblem-icon-container">
                      {icon}
                    </div>
                    <div className="listing-time">
                      <FaTag /> {getTimeSinceList(listing.listedDate)}
                    </div>
                  </div>

                  <div className="emblem-info">
                    <h3>
                      {(emblem?.type || "unknown")
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </h3>

                    <div className="emblem-stats">
                      <div className="stat">
                        <span className="stat-label">Raritate:</span>
                        <span
                          className={`stat-value rarity ${emblem?.metadata?.rarity || "common"}`}>
                          <FaGem /> {emblem?.metadata?.rarity || "common"}
                        </span>
                      </div>

                      <div className="stat">
                        <span className="stat-label">Level:</span>
                        <span className="stat-value">{emblem?.level ?? "-"}</span>
                      </div>

                      <div className="stat">
                        <span className="stat-label">Engagement:</span>
                        <span className="stat-value">{emblem?.engagement ?? 0} pts</span>
                      </div>
                    </div>

                    {emblem?.metadata?.uniqueTraits && (
                      <div className="unique-traits">
                        <span className="traits-label">Trăsături unice:</span>
                        <div className="traits-list">
                          {emblem.metadata.uniqueTraits
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
                      Original: {formatPrice(emblem?.purchasePrice ?? 0)}
                    </div>
                    <div className="current-price">
                      {formatPrice(listing.price)}
                    </div>
                    {listing.price > (emblem?.purchasePrice ?? 0) && (
                      <div className="price-increase">
                        <FaFire /> +
                        {Math.round(
                          ((listing.price - (emblem?.purchasePrice ?? 0)) /
                            (emblem?.purchasePrice ?? 1)) *
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
              );
            })}
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
              onClick={() => !purchaseLoading && setSelectedListing(null)}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FaShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Confirmă achiziția emblemei
                    </h3>
                    <div className="mt-4">
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-3 mb-3">
                          {emblemIcons[selectedListing.emblem?.type as keyof typeof emblemIcons]}
                          <div>
                            <div className="font-semibold">
                              {(selectedListing.emblem?.type || "unknown")
                                .replace("_", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </div>
                            <div className="text-sm text-gray-500">
                              {selectedListing.emblem?.metadata?.rarity || "common"}
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          {formatPrice(selectedListing.price)}
                        </div>
                        <p className="text-sm text-gray-600">
                          Vei fi redirecționat către pagina securizată de plată Netopia
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleConfirmPurchase}
                  disabled={purchaseLoading}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${
                    purchaseLoading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {purchaseLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Se procesează...
                    </>
                  ) : (
                    <>
                      <FaLock className="mr-2" />
                      Confirmă și plătește
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => !purchaseLoading && setSelectedListing(null)}
                  disabled={purchaseLoading}
                >
                  Anulează
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
