import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { FaStar, FaRegStar } from "react-icons/fa";
import ProductReviews from "../components/ProductReviews";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  inStock: boolean;
  details?: string;
  story?: string;
  ingredients?: string[];
  weight?: string;
  ratings?: {
    average: number;
    count: number;
    userRatings: {
      userId: string;
      userName?: string;
      rating: number;
      date: string;
      comment?: string;
      verified?: boolean;
    }[];
  };
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentUser } = useAuth(); // Ensure currentUser is defined in AuthContextType
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [userHasOrdered, setUserHasOrdered] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("ID-ul produsului lipsește.");
        navigate("/products");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Încercăm să obținem produsul direct după ID-ul său din URL
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = docSnap.data();

          // Asigurăm-ne că avem un obiect ratings pentru a evita erorile
          if (!productData.ratings) {
            productData.ratings = {
              average: 0,
              count: 0,
              userRatings: [],
            };
          }

          setProduct({ id: docSnap.id, ...productData } as Product);
          setLoading(false);

          // Încărcăm produse similare din aceeași categorie
          fetchRelatedProducts(productData.category);
          return;
        }

        // Dacă nu găsim produsul direct după ID, căutăm după alte criterii
        const productsRef = collection(db, "products");
        const allProductsQuery = query(productsRef);
        const allProducts = await getDocs(allProductsQuery);

        if (allProducts.empty) {
          setError("Nu există produse în baza de date.");
          setLoading(false);
          return;
        }

        // Normalizăm ID-ul pentru comparare
        const normalizedId = id.replace(/-/g, " ").toLowerCase();

        // Căutare mai flexibilă, care să găsească produsul indiferent de forma URL-ului
        const matchingProduct = allProducts.docs.find((doc) => {
          const data = doc.data();
          const name = (data.name || "").toLowerCase();
          const slug = (data.slug || "").toLowerCase();

          return (
            doc.id.toLowerCase() === id.toLowerCase() ||
            slug === id.toLowerCase() ||
            name.includes(normalizedId) ||
            normalizedId.includes(name)
          );
        });

        if (matchingProduct) {
          const productData = matchingProduct.data();

          // Asigurăm-ne că avem un obiect ratings pentru a evita erorile
          if (!productData.ratings) {
            productData.ratings = {
              average: 0,
              count: 0,
              userRatings: [],
            };
          }

          setProduct({ id: matchingProduct.id, ...productData } as Product);

          // Încărcăm produse similare din aceeași categorie
          fetchRelatedProducts(productData.category);
        } else {
          setError("Produsul nu a fost găsit în baza de date.");
        }
      } catch (err) {
        console.error("Eroare la încărcarea produsului:", err);
        setError(
          "A apărut o eroare la încărcarea produsului. Vă rugăm să încercați din nou."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // Funcție pentru a încărca produse similare
  const fetchRelatedProducts = async (category: string) => {
    if (!category) return;

    try {
      const productsRef = collection(db, "products");
      const relatedQuery = query(
        productsRef,
        where("category", "==", category),
        where("id", "!=", id)
      );

      const relatedSnapshot = await getDocs(relatedQuery);

      if (!relatedSnapshot.empty) {
        const relatedData = relatedSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            name: doc.data().name,
            price: doc.data().price,
            image: doc.data().image,
          }))
          .slice(0, 3); // Limităm la 3 produse similare

        setRelatedProducts(relatedData);
      }
    } catch (error) {
      console.error("Eroare la încărcarea produselor similare:", error);
    }
  };

  useEffect(() => {
    const checkUserOrders = async () => {
      if (!id || !currentUser) return;

      try {
        const ordersRef = collection(db, "orders");
        const q = query(
          ordersRef,
          where("userId", "==", currentUser.uid),
          where("itemIds", "array-contains", id)
        );

        const querySnapshot = await getDocs(q);
        setUserHasOrdered(!querySnapshot.empty);
      } catch (err) {
        console.error("Error checking user orders:", err);
      }
    };

    checkUserOrders();
  }, [id, currentUser]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      // Play sound
      if (audioRef.current) {
        audioRef.current.play().catch((e) => {
          console.log("Audio playback was prevented: ", e);
        });
      }

      // Animation effect
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 1500);

      // Adăugăm produsul în coș folosind contextul CartContext
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
      });

      // Alert cu produsul adăugat
      alert(`${quantity} x ${product.name} a fost adăugat în coș!`);

      // Reset quantity
      setQuantity(1);
    }
  };

  const formatCurrency = (price: number | undefined) => {
    if (price === undefined) return "";
    return `${price.toFixed(2)} lei`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă produsul...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error || "Produsul nu există."}
          </div>
          <button
            onClick={() => navigate("/magazin")}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Înapoi la produse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 bg-stone-50">
      {/* Audio element for cart sound */}
      <audio ref={audioRef} src="/sounds/cart-ping.mp3" />

      {/* Back navigation */}
      <div className="mb-8">
        <Link
          to="/magazin"
          className="text-blue-600 hover:underline flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Înapoi la produse
        </Link>
      </div>

      {/* Product details */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Product image */}
          <div className="md:w-1/2">
            <div className="h-96 overflow-hidden">
              <img
                src={product.image || "/images/AdobeStock_370191089.jpeg"}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  console.error(
                    "Eroare la încărcarea imaginii:",
                    product.image
                  );
                  const fallbackImage = product.id.includes("miere")
                    ? "/images/AdobeStock_367103665.jpeg"
                    : "/images/AdobeStock_370191089.jpeg";
                  e.currentTarget.src = fallbackImage;
                }}
              />
            </div>
          </div>

          {/* Product information */}
          <div className="md:w-1/2 p-8 product-text-container">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-handwriting product-name">
              {product.name}
            </h1>

            {/* Rating display - Always visible */}
            <div className="mb-4 flex items-center">
              <div className="flex product-rating-stars">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index} className="product-rating-star">
                    {index < Math.round(product.ratings?.average || 0) ? (
                      <FaStar className="product-rating-star-filled" />
                    ) : (
                      <FaRegStar className="product-rating-star-empty" />
                    )}
                  </span>
                ))}
              </div>
              <span className="ml-2 text-gray-600 text-sm">
                {product.ratings?.count
                  ? `(${product.ratings.average.toFixed(1)}) ${product.ratings.count} ${product.ratings.count === 1 ? "recenzie" : "recenzii"}`
                  : "Fără recenzii încă"}
              </span>
            </div>

            {/* Price section */}
            <div className="mb-4">
              <span className="product-price text-2xl">
                {formatCurrency(product.price)}
              </span>
            </div>

            {/* Description */}
            <div className="mb-6 product-description">
              <p className="leading-relaxed">
                {product.description ||
                  "Momentan nu există o descriere disponibilă pentru acest produs."}
              </p>
            </div>

            {/* Weight */}
            {product.weight && (
              <div className="mb-4">
                <span className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                  {product.weight}
                </span>
              </div>
            )}

            {/* In Stock Status */}
            <div className="mb-6">
              {product.inStock ? (
                <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm">
                  În stoc
                </span>
              ) : (
                <span className="text-red-600 bg-red-100 px-3 py-1 rounded-full text-sm">
                  Stoc epuizat
                </span>
              )}
            </div>

            {/* Quantity Input */}
            {product.inStock && (
              <div className="flex items-center mb-6">
                <label htmlFor="quantity" className="mr-3 text-gray-700">
                  Cantitate:
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-16 border border-gray-300 bg-white rounded px-3 py-2 text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`w-full py-3 px-4 rounded-lg text-white font-bold 
              ${addedToCart ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"} 
              transition-all transform ${addedToCart ? "scale-105" : ""}`}
            >
              {addedToCart ? "Adăugat în coș!" : "Adaugă în coș"}
            </button>
          </div>
        </div>

        {/* Ingredients, Story, and Details sections */}
        <div className="p-8 border-t border-gray-200">
          {/* Ingredients */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="mb-8">
              <h2 className="section-heading text-xl font-bold">Ingrediente</h2>
              <ul className="list-disc pl-5 space-y-1 product-description">
                {product.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>
          )}

          {/* The Story */}
          {product.story && (
            <div className="mb-8">
              <h2 className="section-heading text-xl font-bold">
                Povestea din spatele produsului
              </h2>
              <div className="bg-amber-50 p-6 rounded-lg border-l-4 border-amber-200 product-description">
                <p className="italic">{product.story}</p>
              </div>
            </div>
          )}

          {/* Additional Details */}
          {product.details && (
            <div className="mb-8">
              <h2 className="section-heading text-xl font-bold">
                Detalii produs
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg whitespace-pre-line product-description">
                <p>{product.details}</p>
              </div>
            </div>
          )}
        </div>

        {/* Reviews section - using ProductReviews component */}
        <div className="p-8 border-t border-gray-200">
          <ProductReviews
            product={product}
            currentUser={
              currentUser
                ? {
                    uid: currentUser.uid,
                    email: currentUser.email || "",
                    displayName: currentUser.displayName || null,
                    photoURL: currentUser.photoURL || null,
                    isAdmin: false,
                  }
                : null
            }
            userHasOrdered={userHasOrdered}
          />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center">
              S-ar putea să-ți placă și
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden transform transition hover:scale-105"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={
                        product.image ||
                        (product.id.includes("miere")
                          ? "/images/AdobeStock_367103665.jpeg"
                          : "/images/AdobeStock_370191089.jpeg")
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const fallbackImage = product.id.includes("miere")
                          ? "/images/AdobeStock_367103665.jpeg"
                          : "/images/AdobeStock_370191089.jpeg";
                        e.currentTarget.src = fallbackImage;
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800">{product.name}</h3>
                    <p className="text-blue-600 font-bold mt-2">
                      {formatCurrency(product.price)}
                    </p>
                    <Link
                      to={`/product/${product.id}`}
                      className="block mt-3 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
                    >
                      Vezi detalii
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
