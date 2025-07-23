import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { FaStar, FaRegStar, FaCoffee, FaCookieBite } from "react-icons/fa";
import { Product } from "../types";
import { Menu } from "../components/common";
import { fetchMenuItems, MenuProduct, MenuData } from "../services/menuService";
import { useAuth } from "../hooks/useAuth";
import { ADMIN_EMAILS } from "../firebase";
import { useCategories } from "../hooks/useCategories";

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryParam || "toate"
  );
  const [activeTab, setActiveTab] = useState<"store" | "menu">("store");

  const { addItem } = useCart();
  const { user } = useAuth();

  // Folosim contextul categoriilor în loc să le încărcăm separat
  const { categories } = useCategories();
  // Eliminăm categoriile duplicate bazate pe slug/id
  const uniqueCategories = useMemo(() => {
    const seen = new Set<string>();
    return categories.filter((category) => {
      const key = category.slug || category.id;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [categories]);

  // Verifică dacă utilizatorul curent este administrator
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  // Ref pentru a preveni execuția multiplă din cauza React.StrictMode
  const hasDataBeenLoaded = useRef(false);

  // Type guard function to check for store product properties
  const isStoreProduct = (
    product: Product | MenuProduct
  ): product is Product => {
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
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, Math.min(10, value)), // Limităm între 1 și 10
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
      quantity: quantity,
    });

    // Afișăm notificarea
    setNotification({
      visible: true,
      message: `${quantity} x ${isStoreProduct(product) ? product.name : product.nume} adăugat în coș!`,
      type: "success",
      productId: productId,
    });

    // Ascundem notificarea după 3 secunde
    setTimeout(() => {
      setNotification((prev) => ({
        ...prev,
        visible: false,
      }));
    }, 3000);

    // Resetăm cantitatea la 1 după adăugare
    setQuantities((prev) => ({
      ...prev,
      [productId]: 1,
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
    // Prevenim execuția multiplă din cauza React.StrictMode
    if (hasDataBeenLoaded.current) return;
    hasDataBeenLoaded.current = true;

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
          const fetchedProducts = productSnapshot.docs.map((doc) => {
            const data = doc.data();
            const product = {
              id: doc.id,
              name: data.name || "Produs fără nume",
              description: data.description || "Fără descriere",
              price: data.price || 0,
              image: data.image || "/images/AdobeStock_370191089.jpeg",
              inStock: data.inStock !== undefined ? data.inStock : true,
              stock: data.stock || 0,
              category: data.category || "necategorizat",
              ratings: data.ratings || {
                average: 0,
                count: 0,
                userRatings: [],
              },
            } as Product;

            return product;
          });

          console.log(
            `S-au încărcat ${fetchedProducts.length} produse din Firestore`
          );
          setProducts(fetchedProducts);
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
        setError(
          "A apărut o eroare la încărcarea datelor. Vă rugăm să încercați din nou."
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCategoryName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      traditionale: "Produse Tradiționale",
      suplimente: "Suplimente Nutritive",
      carti: "Cărți și Resurse",
      toate: "Toate Categoriile",
      gogosi: "Gogoși",
      cafea: "Cafea",
      clatite: "Clătite",
      shake: "Shake-uri",
      oferte: "Oferte Speciale",
      // Mapare pentru compatibilitate cu valorile din admin panel
      dulceata: "traditionale",
      dulceață: "traditionale",
      miere: "traditionale",
      "produse traditionale": "traditionale",
      "suplimente nutritive": "suplimente",
      "carti si resurse": "carti",
      "cărți și resurse": "carti",
    };

    return (
      categoryMap[category.toLowerCase()] ||
      category.charAt(0).toUpperCase() + category.slice(1)
    );
  };

  // Funcție pentru a normaliza categoriile pentru comparare
  const normalizeCategoryForComparison = (
    category: string | undefined
  ): string | null => {
    if (!category) return null;

    const normalizedCategory = category.toLowerCase().trim();

    // Mapare pentru transformarea categoriilor în slug-uri standardizate
    const categoryMapping: { [key: string]: string } = {
      dulceata: "traditionale",
      dulceață: "traditionale",
      miere: "traditionale",
      "produse traditionale": "traditionale",
      "produse tradiționale": "traditionale",
      "suplimente nutritive": "suplimente",
      "carti si resurse": "carti",
      "cărți și resurse": "carti",
      "carți și resurse": "carti",
    };

    return categoryMapping[normalizedCategory] || normalizedCategory;
  };

  // Definirea produselor filtrate după definirea funcției de normalizare
  const filteredProducts =
    selectedCategory === "toate"
      ? products
      : products.filter((product) => {
          // Verificăm dacă categoria produsului se potrivește cu categoria selectată
          if (typeof product.category === "string") {
            // Categoria ca string simplu - folosim normalizarea
            const normalizedProductCategory = normalizeCategoryForComparison(
              product.category
            );
            return (
              normalizedProductCategory === selectedCategory ||
              product.category === selectedCategory ||
              product.category.toLowerCase() === selectedCategory.toLowerCase()
            );
          } else if (product.category && typeof product.category === "object") {
            // Categoria ca obiect cu proprietatea id sau slug
            const categoryObj = product.category as any;
            return (
              categoryObj.id === selectedCategory ||
              categoryObj.slug === selectedCategory ||
              categoryObj.name?.toLowerCase() === selectedCategory.toLowerCase()
            );
          }
          // Dacă produsul nu are categorie setată, nu îl includem în nicio categorie specifică
          return false;
        });

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
  const menuCategories = menuData
    ? Object.keys(menuData).map((key) => ({
        id: key,
        name: menuData[key].nume,
        slug: key,
      }))
    : [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-800 sm:text-4xl">
            Magazinul Nostru
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Descoperă produsele noastre autentice, create cu pasiune și respect
            pentru tradiție.
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
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar îmbunătățit cu categorii */}
            <div className="w-full lg:w-1/4">
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border border-blue-100 overflow-hidden">
                {/* Header categorii */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                      Categorii Produse
                    </h2>
                    {/* Link către admin pentru categorii - doar pentru administratori */}
                    {isAdmin && (
                      <Link
                        to="/admin/categories"
                        className="text-blue-200 hover:text-white transition-colors p-1 rounded"
                        title="Gestionează categoriile în panoul admin"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </Link>
                    )}
                  </div>
                  {/* Breadcrumb simplu */}
                  <div className="mt-2 text-sm text-blue-200">
                    <span>Navigare rapidă prin produse</span>
                  </div>
                </div>

                {/* Lista categoriilor */}
                <div className="p-4">
                  <div className="space-y-1">
                    {/* Categoria "Toate" */}
                    <button
                      onClick={() => setSelectedCategory("toate")}
                      className={`group relative w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center ${
                        selectedCategory === "toate"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-[1.02]"
                          : "bg-white hover:bg-blue-50 text-gray-800 hover:shadow-md hover:transform hover:scale-[1.01] border border-gray-200"
                      }`}
                    >
                      <div className="flex items-center w-full">
                        <div
                          className={`mr-3 p-2 rounded-full transition-colors ${
                            selectedCategory === "toate"
                              ? "bg-white/20"
                              : "bg-blue-100 group-hover:bg-blue-200 shadow-sm"
                          }`}
                        >
                          <svg
                            className={`w-4 h-4 ${
                              selectedCategory === "toate"
                                ? "text-white"
                                : "text-blue-600"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div
                            className={`font-medium ${selectedCategory === "toate" ? "text-white" : "text-gray-900"}`}
                          >
                            Toate Categoriile
                          </div>
                          <div
                            className={`text-xs ${
                              selectedCategory === "toate"
                                ? "text-blue-100"
                                : "text-gray-600"
                            }`}
                          >
                            {products.length} produse disponibile
                          </div>
                        </div>
                        {selectedCategory === "toate" && (
                          <div className="ml-2">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Categoriile din baza de date (unice) */}
                    {uniqueCategories.map((category, index) => {
                      const isSelected =
                        selectedCategory === (category.slug || category.id);
                      const productCount = products.filter((product) => {
                        if (typeof product.category === "string") {
                          const normalizedProductCategory =
                            normalizeCategoryForComparison(product.category);
                          return (
                            normalizedProductCategory ===
                              (category.slug || category.id) ||
                            product.category === (category.slug || category.id)
                          );
                        } else if (
                          product.category &&
                          typeof product.category === "object"
                        ) {
                          const categoryObj = product.category as any;
                          return (
                            categoryObj.id === (category.slug || category.id) ||
                            categoryObj.slug === (category.slug || category.id)
                          );
                        }
                        return false;
                      }).length;

                      // Iconuri pentru categorii
                      const getCategoryIcon = (categorySlug: string) => {
                        switch (categorySlug) {
                          case "traditionale":
                            return "🍯";
                          case "suplimente":
                            return "💊";
                          case "carti":
                            return "📚";
                          case "plante-medicinale":
                            return "🌿";
                          case "ceaiuri":
                            return "🍵";
                          case "diverse":
                            return "🎁";
                          default:
                            return "📦";
                        }
                      };

                      return (
                        <button
                          key={category.id || category.slug}
                          onClick={() =>
                            setSelectedCategory(category.slug || category.id)
                          }
                          className={`group relative w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center category-button-${index} ${
                            isSelected
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-[1.02]"
                              : "bg-white hover:bg-blue-50 text-gray-800 hover:shadow-md hover:transform hover:scale-[1.01] border border-gray-200"
                          }`}
                        >
                          <div className="flex items-center w-full">
                            <div
                              className={`mr-3 p-2 rounded-full transition-colors text-lg ${
                                isSelected
                                  ? "bg-white/20"
                                  : "bg-blue-100 group-hover:bg-blue-200 shadow-sm"
                              }`}
                            >
                              {getCategoryIcon(category.slug || category.id)}
                            </div>
                            <div className="flex-1">
                              <div
                                className={`font-medium ${isSelected ? "text-white" : "text-gray-900"}`}
                              >
                                {category.name}
                              </div>
                              <div
                                className={`text-xs ${
                                  isSelected ? "text-blue-100" : "text-gray-600"
                                }`}
                              >
                                {productCount}{" "}
                                {productCount === 1 ? "produs" : "produse"}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="ml-2">
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer cu link către admin - doar pentru administratori */}
                  {isAdmin && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <Link
                        to="/admin/add-product"
                        className="flex items-center justify-center w-full px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Adaugă produs nou
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Zona principală cu produse îmbunătățită */}
            <div className="w-full lg:w-3/4">
              {loading ? (
                <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-lg">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 font-medium">
                    Se încarcă produsele...
                  </p>
                </div>
              ) : error ? (
                <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-6 h-6 mr-3 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <strong className="font-bold">
                        Eroare la încărcare!{" "}
                      </strong>
                      <span className="block sm:inline">{error}</span>
                    </div>
                  </div>
                  <button
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
                    onClick={() => window.location.reload()}
                  >
                    🔄 Reîncarcă pagina
                  </button>
                </div>
              ) : (
                <>
                  {/* Header îmbunătățit pentru categoria selectată */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl shadow-lg mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-3xl font-bold mb-2">
                          {formatCategoryName(selectedCategory)}
                        </h2>
                        <div className="flex items-center text-blue-100">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                          </svg>
                          <span>
                            {filteredProducts.length}{" "}
                            {filteredProducts.length === 1
                              ? "produs disponibil"
                              : "produse disponibile"}
                          </span>
                        </div>
                      </div>

                      {/* Breadcrumb îmbunătățit */}
                      <div className="mt-4 md:mt-0">
                        <nav className="flex items-center space-x-2 text-sm">
                          <Link
                            to="/"
                            className="text-blue-200 hover:text-white transition-colors"
                          >
                            Acasă
                          </Link>
                          <svg
                            className="w-4 h-4 text-blue-300"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <Link
                            to="/magazin"
                            className="text-blue-200 hover:text-white transition-colors"
                          >
                            Magazin
                          </Link>
                          <svg
                            className="w-4 h-4 text-blue-300"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-white font-medium">
                            {formatCategoryName(selectedCategory)}
                          </span>
                        </nav>
                      </div>
                    </div>
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-12 rounded-xl shadow-lg text-center">
                      <div className="max-w-md mx-auto">
                        <div className="bg-gray-200 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                          <svg
                            className="w-12 h-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8v2a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1h10a1 1 0 011 1z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-700 mb-3">
                          Nu sunt produse disponibile
                        </h3>
                        <p className="text-gray-500 mb-6">
                          În această categorie nu avem încă produse. Reveniți
                          curând pentru noutăți!
                        </p>
                        <div className="space-y-3">
                          <button
                            onClick={() => setSelectedCategory("toate")}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                          >
                            📦 Explorează toate produsele
                          </button>
                          {isAdmin && (
                            <Link
                              to="/admin/add-product"
                              className="block w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                            >
                              ➕ Adaugă primul produs
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-100 hover:transform hover:scale-[1.02]"
                        >
                          <div className="h-56 overflow-hidden relative bg-gradient-to-br from-gray-100 to-gray-200">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/images/AdobeStock_370191089.jpeg";
                              }}
                            />
                            {/* Badge pentru stoc */}
                            <div className="absolute top-3 left-3">
                              {product.inStock ? (
                                <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                                  ✓ În stoc
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                                  ✗ Epuizat
                                </span>
                              )}
                            </div>

                            {/* Overlay cu butoane */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
                              <div className="p-4 w-full">
                                <Link
                                  to={`/product/${product.id}`}
                                  className="block w-full text-center px-4 py-3 bg-white/95 backdrop-blur-sm text-gray-900 rounded-lg hover:bg-white transition-all font-medium shadow-lg"
                                >
                                  👁️ Vezi detalii
                                </Link>
                              </div>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="flex flex-col h-full">
                              {/* Titlu produs */}
                              <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 flex-grow">
                                {product.name}
                              </h3>

                              {/* Rating și reviews */}
                              {product.ratings && (
                                <div className="flex items-center mb-3">
                                  <div className="flex text-yellow-400 mr-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <span key={star} className="text-lg">
                                        {star <=
                                        Math.floor(
                                          product.ratings?.average || 0
                                        ) ? (
                                          <FaStar className="w-4 h-4" />
                                        ) : (
                                          <FaRegStar className="w-4 h-4" />
                                        )}
                                      </span>
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500 font-medium">
                                    ({product.ratings.count}{" "}
                                    {product.ratings.count === 1
                                      ? "review"
                                      : "reviews"}
                                    )
                                  </span>
                                </div>
                              )}

                              {/* Descrierea produsului */}
                              <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                                {product.description}
                              </p>

                              {/* Preț și acțiuni */}
                              <div className="border-t pt-4 mt-auto">
                                <div className="flex justify-between items-center mb-4">
                                  <div className="text-2xl font-bold text-blue-600 flex items-center">
                                    <span>{product.price}</span>
                                    <span className="text-lg text-gray-500 ml-1">
                                      Lei
                                    </span>
                                  </div>
                                  <div className="text-right text-sm text-gray-500">
                                    Stoc: {product.stock || "N/A"}
                                  </div>
                                </div>

                                {product.inStock ? (
                                  <div className="space-y-3">
                                    {/* Selector cantitate */}
                                    <div className="flex items-center justify-center space-x-3">
                                      <label
                                        htmlFor={`quantity-${product.id}`}
                                        className="text-sm font-medium text-gray-700"
                                      >
                                        Cantitate:
                                      </label>
                                      <input
                                        id={`quantity-${product.id}`}
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={quantities[product.id] || 1}
                                        onChange={(e) =>
                                          updateQuantity(
                                            product.id,
                                            parseInt(e.target.value)
                                          )
                                        }
                                        className="w-16 text-center border border-gray-300 rounded-md py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        title="Selectează cantitatea dorită"
                                      />
                                    </div>

                                    {/* Buton adaugă în coș */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToCart(product);
                                      }}
                                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                                    >
                                      🛒 Adaugă în coș
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-center">
                                    <span className="inline-block w-full px-4 py-3 bg-gray-100 text-gray-600 rounded-lg font-medium">
                                      ❌ Stoc epuizat
                                    </span>
                                  </div>
                                )}
                              </div>
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
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Categorii Meniu
                </h2>
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
                  <span className="block sm:inline">
                    Nu s-a putut încărca meniul. Vă rugăm să încercați din nou.
                  </span>
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
                        {selectedCategory === "toate"
                          ? "Toate Produsele Rulotă"
                          : menuData[selectedCategory]?.nume || "Produse"}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {selectedCategory === "toate"
                          ? `${menuProducts.length} ${menuProducts.length === 1 ? "produs" : "produse"}`
                          : `${menuData[selectedCategory]?.produse.length || 0} ${menuData[selectedCategory]?.produse.length === 1 ? "produs" : "produse"}`}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-yellow-600">
                        Program Rulotă: 10:00 - 18:00
                      </span>
                    </div>
                  </div>

                  {/* Extra Info pentru categoria selectată */}
                  {selectedCategory !== "toate" &&
                    menuData[selectedCategory]?.extraInfo && (
                      <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                        <h3 className="font-medium text-yellow-800 mb-2">
                          Informații suplimentare:
                        </h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {menuData[selectedCategory].extraInfo?.map(
                            (info, index) => (
                              <li key={index} className="text-gray-700">
                                {info}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {selectedCategory === "toate" ? (
                    // Afișăm produsele din toate categoriile
                    <div className="space-y-8">
                      {Object.entries(menuData).map(
                        ([categoryKey, category]) => (
                          <div key={categoryKey}>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                              {categoryKey === "gogosi" && (
                                <FaCookieBite className="mr-2 text-yellow-600" />
                              )}
                              {categoryKey === "cafea" && (
                                <FaCoffee className="mr-2 text-yellow-600" />
                              )}
                              {category.nume}
                            </h3>

                            {category.extraInfo && (
                              <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                <ul className="list-disc pl-5 space-y-1">
                                  {category.extraInfo.map((info, index) => (
                                    <li
                                      key={index}
                                      className="text-gray-700 text-sm"
                                    >
                                      {info}
                                    </li>
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
                                        e.currentTarget.src = getFallbackImage(
                                          product.category
                                        );
                                      }}
                                    />
                                  </div>
                                  <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                      {product.nume}
                                    </h3>
                                    <p className="text-gray-600 text-sm my-2">
                                      {product.descriere}
                                    </p>
                                    <div className="flex justify-between items-center mt-3">
                                      <span className="text-lg font-bold text-yellow-600">
                                        {product.pret} Lei
                                      </span>

                                      {product.inStock ? (
                                        <div className="flex items-center space-x-2">
                                          <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={quantities[product.id] || 1}
                                            onChange={(e) =>
                                              updateQuantity(
                                                product.id,
                                                parseInt(e.target.value)
                                              )
                                            }
                                            className="w-12 text-center border rounded"
                                            aria-label="Cantitate produs"
                                            title="Selectează cantitatea"
                                          />
                                          <button
                                            onClick={() =>
                                              handleAddToCart(product)
                                            }
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
                        )
                      )}
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
                                e.currentTarget.src = getFallbackImage(
                                  product.category
                                );
                              }}
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {product.nume}
                            </h3>
                            <p className="text-gray-600 text-sm my-2">
                              {product.descriere}
                            </p>
                            <div className="flex justify-between items-center mt-4">
                              <span className="text-lg font-bold text-yellow-600">
                                {product.pret} Lei
                              </span>

                              {product.inStock ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={quantities[product.id] || 1}
                                    onChange={(e) =>
                                      updateQuantity(
                                        product.id,
                                        parseInt(e.target.value)
                                      )
                                    }
                                    className="w-12 text-center border rounded"
                                    aria-label="Cantitate produs"
                                    title="Selectează cantitatea"
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
        <div
          className={`fixed bottom-4 right-4 p-4 rounded shadow-lg ${notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default Shop;
