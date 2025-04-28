import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { FaStar, FaRegStar, FaCoffee, FaCookieBite } from "react-icons/fa";
import { Product, Category } from "../types";
import { Menu } from "../components/common";
import { fetchMenuItems, MenuProduct, MenuData } from "../services/menuService";

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || "toate");
  const [activeTab, setActiveTab] = useState<"store" | "menu">("store");
  
  const { addItem } = useCart();

  // Type guard function to check for store product properties
  const isStoreProduct = (product: Product | MenuProduct): product is Product => {
    return "name" in product && "price" in product;
  };

  // Stare pentru gestionarea cantităților per produs
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  // Stare pentru notificarea de confirmare adăugare în coș
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
    productId: string;
  }>({ visible: false, message: "", type: "success", productId: "" });

  // Funcție pentru a actualiza cantitatea unui produs
  const updateQuantity = (productId: string, value: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, Math.min(10, value)) // Limităm între 1 și 10
    }));
  };

  // Gestionarea adăugării în coș cu cantități și notificări
  const handleAddToCart = (product: Product | MenuProduct) => {
    const productId = product.id;
    const quantity = quantities[productId] || 1;
    
    addItem({
      id: productId,
      name: isStoreProduct(product) ? product.name : product.nume,
      price: isStoreProduct(product) ? product.price : product.pret,
      image: product.image,
      quantity: quantity
    });

    // Afișăm notificarea
    setNotification({
      visible: true,
      message: `${quantity} x ${isStoreProduct(product) ? product.name : product.nume} adăugat în coș!`,
      type: "success",
      productId: productId
    });

    // Ascundem notificarea după 3 secunde
    setTimeout(() => {
      setNotification(prev => ({
        ...prev,
        visible: false
      }));
    }, 3000);

    // Resetăm cantitatea la 1 după adăugare
    setQuantities(prev => ({
      ...prev,
      [productId]: 1
    }));
  };

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory("toate");
    }
  }, [categoryParam]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Încărcăm produsele direct din Firestore
        const productsCollection = collection(db, "products");
        const productSnapshot = await getDocs(productsCollection);
        
        if (productSnapshot.empty) {
          console.log("Nu s-au găsit produse în baza de date Firestore");
          setProducts([]);
        } else {
          const fetchedProducts = productSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || "Produs fără nume",
              description: data.description || "Fără descriere",
              price: data.price || 0,
              image: data.image || "/images/AdobeStock_370191089.jpeg",
              inStock: data.inStock !== undefined ? data.inStock : true,
              stock: data.stock || 0,
              category: data.category || "necategorizat",
              ratings: data.ratings || { average: 0, count: 0, userRatings: [] }
            } as Product;
          });
          
          console.log(`S-au încărcat ${fetchedProducts.length} produse din Firestore`);
          setProducts(fetchedProducts);
        }

        // Încărcăm și categoriile
        const categoriesCollection = collection(db, "categories");
        const categorySnapshot = await getDocs(categoriesCollection);
        
        if (!categorySnapshot.empty) {
          const fetchedCategories = categorySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Category));
          setCategories(fetchedCategories);
        } else {
          // Categorii implicite dacă nu avem în baza de date
          setCategories([
            { id: "traditionale", name: "Produse tradiționale", slug: "traditionale" },
            { id: "suplimente", name: "Suplimente nutritive", slug: "suplimente" },
            { id: "carti", name: "Cărți și resurse", slug: "carti" }
          ]);
        }
        
        // Încărcăm și datele din meniul LUPUL SĂTUL
        try {
          const menuItems = await fetchMenuItems();
          setMenuData(menuItems);
          console.log("Meniul a fost încărcat cu succes:", menuItems);
        } catch (menuError) {
          console.error("Eroare la încărcarea meniului:", menuError);
          // Nu blocăm funcționalitatea paginii dacă meniul nu se încarcă
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("A apărut o eroare la încărcarea datelor. Vă rugăm să încercați din nou.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = selectedCategory === "toate"
    ? products
    : products.filter(product => 
        typeof product.category === "string" 
          ? product.category === selectedCategory 
          : product.category && typeof product.category === "object" && "id" in product.category
            ? product.category.id === selectedCategory
            : false
      );

  const formatCategoryName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      "traditionale": "Produse Tradiționale",
      "suplimente": "Suplimente Nutritive",
      "carti": "Cărți și Resurse",
      "toate": "Toate Categoriile",
      "gogosi": "Gogoși",
      "cafea": "Cafea",
      "clatite": "Clătite",
      "shake": "Shake-uri",
      "oferte": "Oferte Speciale"
    };
    
    return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Convertim produsele din meniu în formatul nostru pentru afișare
  const getMenuProducts = () => {
    if (!menuData) return [];
    
    const allMenuProducts: MenuProduct[] = [];
    
    Object.values(menuData).forEach((category) => {
      category.produse.forEach((product) => {
        allMenuProducts.push(product);
      });
    });
    
    return allMenuProducts;
  };

  // Modificăm fallback-ul pentru imaginile din meniu
  const getFallbackImage = (category: string) => {
    switch (category) {
      case "gogosi":
        return "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=500&auto=format&fit=crop";
      case "cafea":
        return "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=500&auto=format&fit=crop";
      case "clatite":
        return "https://images.unsplash.com/photo-1565299543923-37dd37887442?q=80&w=500&auto=format&fit=crop";
      case "shake":
        return "https://images.unsplash.com/photo-1541658016709-82535e94bc69?q=80&w=500&auto=format&fit=crop";
      case "oferte":
      case "topping":
      default:
        return "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?q=80&w=500&auto=format&fit=crop";
    }
  };

  const menuProducts = getMenuProducts();
  const menuCategories = menuData ? Object.keys(menuData).map(key => ({
    id: key,
    name: menuData[key].nume,
    slug: key
  })) : [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-800 sm:text-4xl">
            Magazinul Nostru
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Descoperă produsele noastre autentice, create cu pasiune și respect pentru tradiție.
          </p>
          
          {/* Tabs pentru a comuta între magazin și meniu */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => setActiveTab("store")}
              className={`px-6 py-2 rounded-full flex items-center ${
                activeTab === "store" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              <span className="mr-2">Magazin Online</span>
            </button>
            
            <button
              onClick={() => setActiveTab("menu")}
              className={`px-6 py-2 rounded-full flex items-center ${
                activeTab === "menu" 
                  ? "bg-yellow-600 text-white" 
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              <FaCoffee className="mr-2" />
              <span>Produse Rulotă</span>
            </button>
          </div>
          
          {activeTab === "menu" && (
            <div className="mt-4">
              <Menu />
            </div>
          )}
        </div>

        {activeTab === "store" ? (
          <div className="flex flex-col md:flex-row">
            {/* Sidebar cu filtre de categorii */}
            <div className="w-full md:w-1/4 mb-8 md:mb-0 md:pr-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Categorii</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory("toate")}
                    className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedCategory === "toate"
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    Toate Categoriile
                  </button>

                  {categories.map((category) => (
                    <button
                      key={category.id || category.slug}
                      onClick={() => setSelectedCategory(category.slug || category.id)}
                      className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedCategory === (category.slug || category.id)
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grilă de produse */}
            <div className="w-full md:w-3/4">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  <strong className="font-bold">Eroare! </strong>
                  <span className="block sm:inline">{error}</span>
                  <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => window.location.reload()}
                  >
                    Reîncarcă pagina
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {formatCategoryName(selectedCategory)}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {filteredProducts.length} {filteredProducts.length === 1 ? "produs" : "produse"}
                    </p>
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4M6 18L18 18M6 6L18 6"
                        />
                      </svg>
                      <h3 className="mt-2 text-lg font-medium text-gray-900">Nu am găsit produse în această categorie</h3>
                      <p className="mt-1 text-gray-500">Vă rugăm să încercați o altă categorie.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredProducts.map((product) => (
                        <div 
                          key={product.id} 
                          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
                        >
                          <div className="h-48 overflow-hidden relative">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.src = "/images/AdobeStock_370191089.jpeg";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center">
                              <Link 
                                to={`/product/${product.id}`}
                                className="mb-4 px-4 py-2 bg-white/90 text-gray-900 rounded hover:bg-white transition"
                              >
                                Vezi detalii
                              </Link>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                            
                            {/* Rating stars */}
                            {product.ratings && (
                              <div className="flex items-center mb-2">
                                <div className="flex text-yellow-400">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star}>
                                      {star <= Math.floor(product.ratings?.average || 0) ? (
                                        <FaStar className="w-4 h-4" />
                                      ) : (
                                        <FaRegStar className="w-4 h-4" />
                                      )}
                                    </span>
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500 ml-1">
                                  ({product.ratings.count})
                                </span>
                              </div>
                            )}
                            
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-blue-600">{product.price} Lei</span>
                              
                              {product.inStock ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={quantities[product.id] || 1}
                                    onChange={(e) => updateQuantity(product.id, parseInt(e.target.value))}
                                    className="w-12 text-center border rounded"
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToCart(product);
                                    }}
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                                  >
                                    Adaugă în coș
                                  </button>
                                </div>
                              ) : (
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                                  Stoc epuizat
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row">
            {/* Sidebar cu categorii de meniu */}
            <div className="w-full md:w-1/4 mb-8 md:mb-0 md:pr-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Categorii Meniu</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory("toate")}
                    className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedCategory === "toate"
                        ? "bg-yellow-50 text-yellow-700"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    Toate Produsele
                  </button>

                  {menuCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedCategory === category.slug
                          ? "bg-yellow-50 text-yellow-700"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grilă de produse pentru meniu */}
            <div className="w-full md:w-3/4">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
                </div>
              ) : !menuData ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  <strong className="font-bold">Eroare! </strong>
                  <span className="block sm:inline">Nu s-a putut încărca meniul. Vă rugăm să încercați din nou.</span>
                  <button
                    className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    onClick={() => window.location.reload()}
                  >
                    Reîncarcă pagina
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {selectedCategory === "toate" ? "Toate Produsele Rulotă" : menuData[selectedCategory]?.nume || "Produse"}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {selectedCategory === "toate" 
                          ? `${menuProducts.length} ${menuProducts.length === 1 ? "produs" : "produse"}`
                          : `${menuData[selectedCategory]?.produse.length || 0} ${menuData[selectedCategory]?.produse.length === 1 ? "produs" : "produse"}`
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-yellow-600">Program Rulotă: 10:00 - 18:00</span>
                    </div>
                  </div>

                  {/* Extra Info pentru categoria selectată */}
                  {selectedCategory !== "toate" && menuData[selectedCategory]?.extraInfo && (
                    <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                      <h3 className="font-medium text-yellow-800 mb-2">Informații suplimentare:</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {menuData[selectedCategory].extraInfo?.map((info, index) => (
                          <li key={index} className="text-gray-700">{info}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedCategory === "toate" ? (
                    // Afișăm produsele din toate categoriile
                    <div className="space-y-8">
                      {Object.entries(menuData).map(([categoryKey, category]) => (
                        <div key={categoryKey}>
                          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            {categoryKey === "gogosi" && <FaCookieBite className="mr-2 text-yellow-600" />}
                            {categoryKey === "cafea" && <FaCoffee className="mr-2 text-yellow-600" />}
                            {category.nume}
                          </h3>
                          
                          {category.extraInfo && (
                            <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                              <ul className="list-disc pl-5 space-y-1">
                                {category.extraInfo.map((info, index) => (
                                  <li key={index} className="text-gray-700 text-sm">{info}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {category.produse.map((product) => (
                              <div 
                                key={product.id} 
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                              >
                                <div className="h-48 overflow-hidden relative">
                                  <img 
                                    src={product.image} 
                                    alt={product.nume}
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    onError={(e) => {
                                      e.currentTarget.src = getFallbackImage(product.category);
                                    }}
                                  />
                                </div>
                                <div className="p-4">
                                  <h3 className="text-lg font-semibold text-gray-800">{product.nume}</h3>
                                  <p className="text-gray-600 text-sm my-2">{product.descriere}</p>
                                  <div className="flex justify-between items-center mt-3">
                                    <span className="text-lg font-bold text-yellow-600">{product.pret} Lei</span>
                                    
                                    {product.inStock ? (
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="number"
                                          min="1"
                                          max="10"
                                          value={quantities[product.id] || 1}
                                          onChange={(e) => updateQuantity(product.id, parseInt(e.target.value))}
                                          className="w-12 text-center border rounded"
                                        />
                                        <button
                                          onClick={() => handleAddToCart(product)}
                                          className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition"
                                        >
                                          Adaugă în coș
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                                        Stoc epuizat
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Afișăm produsele din categoria selectată
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {menuData[selectedCategory]?.produse.map((product) => (
                        <div 
                          key={product.id} 
                          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          <div className="h-48 overflow-hidden relative">
                            <img 
                              src={product.image} 
                              alt={product.nume}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.src = getFallbackImage(product.category);
                              }}
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-800">{product.nume}</h3>
                            <p className="text-gray-600 text-sm my-2">{product.descriere}</p>
                            <div className="flex justify-between items-center mt-4">
                              <span className="text-lg font-bold text-yellow-600">{product.pret} Lei</span>
                              
                              {product.inStock ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={quantities[product.id] || 1}
                                    onChange={(e) => updateQuantity(product.id, parseInt(e.target.value))}
                                    className="w-12 text-center border rounded"
                                  />
                                  <button
                                    onClick={() => handleAddToCart(product)}
                                    className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition"
                                  >
                                    Adaugă în coș
                                  </button>
                                </div>
                              ) : (
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                                  Stoc epuizat
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
      {notification.visible && (
        <div className={`fixed bottom-4 right-4 p-4 rounded shadow-lg ${notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default Shop;
