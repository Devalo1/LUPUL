import React, { useState, useEffect } from "react";
import { Save, RotateCcw } from "lucide-react";
import { emblemMarketplaceService } from "../../services/emblemMarketplaceService";
import {
  EmblemStockService,
  EmblemStock,
  EmblemType,
} from "../../services/emblemStockService";
import { useAuth } from "../../hooks/useAuth";
import { Emblem } from "../../types/emblem";

interface EmblemWithUser extends Emblem {
  userEmail?: string;
  userName?: string;
}

const AdminEmblems: React.FC = () => {
  const { user } = useAuth();
  const [_emblems, setEmblems] = useState<EmblemWithUser[]>([]);
  const [marketplaceListings, setMarketplaceListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(false);
  const [emblemStocks, setEmblemStocks] = useState<EmblemStock>({
    lupul_intelepta: 0,
    corbul_mistic: 0,
    gardianul_wellness: 0,
    cautatorul_lumina: 0,
    lastUpdated: new Date(),
    updatedBy: "system",
  });
  const [stats, setStats] = useState({
    totalEmblems: 0,
    activeListings: 0,
    totalSales: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadEmblemData();
    loadEmblemStocks();
  }, []);

  const loadEmblemStocks = async () => {
    try {
      setStockLoading(true);
      const stocks = await EmblemStockService.getStock();
      setEmblemStocks(stocks);
    } catch (error) {
      console.error("Error loading emblem stocks:", error);
    } finally {
      setStockLoading(false);
    }
  };

  const loadEmblemData = async () => {
    try {
      setLoading(true);

      // Load all emblems (you'll need to implement this in emblemService)
      // For now, we'll use a placeholder
      const allEmblems: EmblemWithUser[] = [];

      // Load marketplace listings
      const listings = await emblemMarketplaceService.getMarketplaceListings();

      setEmblems(allEmblems);
      setMarketplaceListings(listings);

      // Calculate stats
      setStats({
        totalEmblems: allEmblems.length,
        activeListings: listings.length,
        totalSales: 0, // You'll need to implement this
        totalRevenue: 0, // You'll need to implement this
      });
    } catch (error) {
      console.error("Error loading emblem data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEmblemTypeDisplay = (type: string) => {
    const types: { [key: string]: string } = {
      lupul_intelepta: "🐺 Lupul Înțeleapta",
      corbul_mistic: "🐦 Corbul Mistic",
      gardianul_wellness: "💚 Gardianul Wellness",
      cautatorul_lumina: "✨ Căutătorul Lumina",
    };
    return types[type] || type;
  };

  const getRarityColor = (rarity: string) => {
    const colors: { [key: string]: string } = {
      common: "text-gray-600 bg-gray-100",
      rare: "text-blue-600 bg-blue-100",
      epic: "text-purple-600 bg-purple-100",
      legendary: "text-yellow-600 bg-yellow-100",
    };
    return colors[rarity] || "text-gray-600 bg-gray-100";
  };

  const updateStock = (type: EmblemType, newStock: number) => {
    if (newStock < 0) return;
    setEmblemStocks((prev) => ({
      ...prev,
      [type]: newStock,
      lastUpdated: new Date(),
      updatedBy: user?.uid || "unknown",
    }));
  };

  const saveStockChanges = async () => {
    if (!user) return;

    try {
      setStockLoading(true);
      await EmblemStockService.updateStock(emblemStocks, user.uid);
      alert("Stocurile au fost salvate cu succes!");
    } catch (error) {
      console.error("Error saving stocks:", error);
      alert("Eroare la salvarea stocurilor!");
    } finally {
      setStockLoading(false);
    }
  };

  const resetAllStocks = async () => {
    if (!user) return;

    if (confirm("Ești sigur că vrei să resetezi toate stocurile la 100?")) {
      try {
        setStockLoading(true);
        await EmblemStockService.resetAllStock(user.uid);
        await loadEmblemStocks(); // Reload from server
        alert("Toate stocurile au fost resetate!");
      } catch (error) {
        console.error("Error resetting stocks:", error);
        alert("Eroare la resetarea stocurilor!");
      } finally {
        setStockLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă datele emblemelor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🏆 Gestionare Embleme NFT
        </h1>
        <p className="text-gray-600">
          Administrează sistemul de embleme și monitorizează activitatea
          utilizatorilor
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-blue-600 text-2xl mr-3">🎯</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Embleme</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalEmblems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-green-600 text-2xl mr-3">🏪</div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active pe Marketplace
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeListings}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-purple-600 text-2xl mr-3">💰</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vânzări</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalSales}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-yellow-600 text-2xl mr-3">📈</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Venit Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalRevenue} RON
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emblem Stock Management */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            📦 Gestionare Stocuri Embleme
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(emblemStocks)
              .filter(([key]) => key !== "lastUpdated" && key !== "updatedBy")
              .map(([type, stock]) => (
                <div key={type} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <img
                        src={`/images/emblems/${type}.svg`}
                        alt={getEmblemTypeDisplay(type as EmblemType)}
                        className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-gray-300"
                        onError={(e) => {
                          e.currentTarget.src = "/images/emblems/default.svg";
                        }}
                      />
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {getEmblemTypeDisplay(type as EmblemType)}
                      </h3>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {stock as number}
                    </span>
                    <p className="text-xs text-gray-500">bucăți disponibile</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        updateStock(type as EmblemType, (stock as number) - 1)
                      }
                      className="flex-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                      disabled={(stock as number) <= 0}
                    >
                      -1
                    </button>
                    <button
                      onClick={() =>
                        updateStock(type as EmblemType, (stock as number) + 1)
                      }
                      className="flex-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                    >
                      +1
                    </button>
                  </div>

                  <div className="mt-2">
                    <input
                      type="number"
                      value={stock as number}
                      onChange={(e) =>
                        updateStock(
                          type as EmblemType,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
                      min="0"
                      placeholder="Stoc"
                      title={`Stoc pentru ${getEmblemTypeDisplay(type as EmblemType)}`}
                    />
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={saveStockChanges}
              disabled={stockLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              {stockLoading ? "Se salvează..." : "Salvează Modificările"}
            </button>
            <button
              onClick={resetAllStocks}
              disabled={stockLoading}
              className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RotateCcw size={16} />
              Resetează Stocurile
            </button>
          </div>
        </div>
      </div>

      {/* Active Marketplace Listings */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            🏪 Listări Active pe Marketplace
          </h2>
        </div>
        <div className="p-6">
          {marketplaceListings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nu există listări active pe marketplace.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Emblemă
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vânzător
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preț
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Raritate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Listării
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {marketplaceListings.map((listing) => (
                    <tr key={listing.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getEmblemTypeDisplay(listing.emblem.type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {listing.sellerId.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {listing.price} RON
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRarityColor(listing.emblem.metadata?.rarity || "common")}`}
                        >
                          {listing.emblem.metadata?.rarity || "common"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {listing.listedDate?.toDate?.()
                          ? new Date(
                              listing.listedDate.toDate()
                            ).toLocaleDateString("ro-RO")
                          : "Data necunoscută"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Emblem Management Actions */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            ⚙️ Acțiuni Administrative
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <span className="mr-2">📊</span>
              Vedere Detaliată Statistici
            </button>

            <button className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <span className="mr-2">🎁</span>
              Acordă Emblemă Gratuită
            </button>

            <button className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <span className="mr-2">🔧</span>
              Configurări Sistem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmblems;
