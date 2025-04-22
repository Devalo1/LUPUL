import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCategories } from "../hooks/useCategories"; // Correct import
import { Product } from "../types";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { FaStar, FaRegStar } from "react-icons/fa";

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setError] = useState<string | null>(null);
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const navigate = useNavigate();
  const { formatCategoryName } = useCategories(); // Correct usage of the hook

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log("Se încarcă produsele din Firestore...");
        
        const productsRef = collection(db, "products");
        let productsQuery;
        
        // Dacă avem o categorie specifică, filtrăm după ea
        if (categorySlug && categorySlug !== "toate") {
          productsQuery = query(productsRef, where("category", "==", categorySlug));
        } else {
          productsQuery = query(productsRef);
        }
        
        const querySnapshot = await getDocs(productsQuery);
        
        if (querySnapshot.empty) {
          console.log(`Nu s-au găsit produse${categorySlug ? ` în categoria ${categorySlug}` : ""}`);
          setProducts([]);
        } else {
          const fetchedProducts = querySnapshot.docs.map(doc => {
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
      } catch (err) {
        console.error("Eroare la încărcarea produselor din Firestore:", err);
        setError("A apărut o eroare la încărcarea produselor. Vă rugăm să încercați din nou.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug]);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">
          {categorySlug 
            ? `Produse din categoria ${formatCategoryName(categorySlug)}` 
            : "Toate produsele noastre"}
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : errorMsg ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Eroare! </strong>
            <span className="block sm:inline">{errorMsg}</span>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Reîncarcă pagina
            </button>
          </div>
        ) : (
          <>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 inline-block p-6 rounded-full mb-4">
                  <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
                  </svg>
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Nu am găsit produse în această categorie</h3>
                <p className="mt-1 text-gray-800">Încercați o altă categorie sau reveniți mai târziu.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="h-64 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = "/images/AdobeStock_370191089.jpeg";
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl font-semibold mb-2 text-gray-800">{product.name}</h2>
                      <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-green-700">{product.price} Lei</span>
                        {product.inStock ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">În stoc</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">Stoc epuizat</span>
                        )}
                      </div>
                      {product.ratings && (
                        <div className="mt-2 flex items-center">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className="text-yellow-400">
                                {i < Math.round(product.ratings?.average || 0) ? <FaStar /> : <FaRegStar />}
                              </span>
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            ({product.ratings.count} {product.ratings.count === 1 ? "recenzie" : "recenzii"})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="bg-white py-12 mt-8">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-center mb-8">De ce să cumperi de la noi</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="rounded-full bg-blue-100 p-4 mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Calitate autentică</h3>
              <p className="text-gray-600">Produsele noastre sunt selectate cu grijă și provin de la producători și apicultori locali.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="rounded-full bg-green-100 p-4 mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Produse 100% naturale</h3>
              <p className="text-gray-600">Nu utilizăm conservanți artificiali sau aditivi în produsele noastre.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="rounded-full bg-yellow-100 p-4 mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Livrare rapidă</h3>
              <p className="text-gray-600">Comandă azi și primește produsele în maximum 3 zile lucrătoare.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
