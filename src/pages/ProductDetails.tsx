import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'; // Update import path to the correct location
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext'; // Update import path to the correct location
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext'; // Import hook-ul cart
import { FaStar, FaRegStar, FaCheck } from 'react-icons/fa';

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
      rating: number;
      date: string;
      comment?: string;
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
  const [relatedProducts] = useState<RelatedProduct[]>([]); // Removed unused setter
  const [addedToCart, setAddedToCart] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentUser } = useAuth();
  const { addItem } = useCart(); // Obținem funcția addItem din context
  const navigate = useNavigate();
  const [userHasOrdered, setUserHasOrdered] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('ID-ul produsului lipsește.');
        navigate('/products');
        return;
      }

      try {
        setLoading(true);
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
          setError('Produsul nu a fost găsit.');
        }
      } catch (err) {
        console.error('Eroare la încărcarea produsului:', err);
        setError('A apărut o eroare la încărcarea produsului.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  useEffect(() => {
    const checkUserOrders = async () => {
      if (!id || !currentUser) return;

      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('userId', '==', currentUser.uid),
          where('itemIds', 'array-contains', id)
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
        audioRef.current.play().catch(e => {
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
        quantity: quantity
      });
      
      // Alert cu produsul adăugat
      alert(`${quantity} x ${product.name} a fost adăugat în coș!`);
      
      // Reset quantity
      setQuantity(1);
    }
  };

  const formatCurrency = (price: number) => {
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
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error || 'Produsul nu există.'}</div>
          <button onClick={() => navigate('/products')} className="px-4 py-2 bg-blue-600 text-white rounded">
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
        <Link to="/products" className="text-blue-600 hover:underline flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
                src={product.image || '/images/AdobeStock_370191089.jpeg'}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  console.error("Eroare la încărcarea imaginii:", product.image);
                  const fallbackImage = product.id.includes('miere') ? 
                    '/images/AdobeStock_367103665.jpeg' : 
                    '/images/AdobeStock_370191089.jpeg';
                  e.currentTarget.src = fallbackImage;
                }}
              />
            </div>
          </div>
          
          {/* Product information */}
          <div className="md:w-1/2 p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-handwriting">{product.name}</h1>
            
            {/* Price section */}
            <div className="text-2xl font-bold text-blue-600 mb-4">
              {formatCurrency(product.price)}
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">
                {/* Updated placeholder text for product description */}
                {product.description || "Momentan nu există o descriere disponibilă pentru acest produs."}
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
              ${addedToCart ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} 
              transition-all transform ${addedToCart ? 'scale-105' : ''}`}
            >
              {addedToCart ? 'Adăugat în coș!' : 'Adaugă în coș'}
            </button>
          </div>
        </div>
        
        {/* Ingredients, Story, and Details sections */}
        <div className="p-8 border-t border-gray-200">
          {/* Ingredients */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Ingrediente</h2>
              <ul className="list-disc pl-5 space-y-1">
                {product.ingredients.map((ingredient, index) => (
                  <li key={index} className="text-gray-700">{ingredient}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* The Story */}
          {product.story && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Povestea din spatele produsului</h2>
              <div className="bg-amber-50 p-6 rounded-lg border-l-4 border-amber-200">
                <p className="text-gray-700 italic">{product.story}</p>
              </div>
            </div>
          )}
          
          {/* Additional Details */}
          {product.details && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Detalii produs</h2>
              <div className="bg-gray-50 p-6 rounded-lg whitespace-pre-line">
                <p className="text-gray-700">{product.details}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Reviews section - enhanced */}
        <div className="p-8 border-t border-gray-200">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Recenzii clienți</h2>
          
          {product?.ratings?.count && product.ratings.count > 0 ? (
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <div className="mr-2 bg-blue-50 px-3 py-2 rounded-md">
                  <span className="text-2xl font-bold text-blue-600">{product.ratings.average.toFixed(1)}</span>
                  <span className="text-blue-600">/5</span>
                </div>
                <div>
                  <div className="flex text-yellow-400 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>
                        {star <= Math.round(product.ratings?.average || 0) ? <FaStar /> : <FaRegStar />}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    {product.ratings?.count || 0} {(product.ratings?.count || 0) === 1 ? 'recenzie' : 'recenzii'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 mb-6">Acest produs nu are încă recenzii.</p>
          )}
          
          {product?.ratings?.userRatings && product.ratings.userRatings.length > 0 && (
            <div className="space-y-6">
              {product.ratings.userRatings.map((review, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                          <FaStar />
                        </span>
                      ))}
                    </div>
                    <span className="ml-2 text-gray-600 text-sm">
                      {new Date(review.date).toLocaleDateString('ro-RO')}
                    </span>
                    <span className="verified-purchase ml-auto">
                      <FaCheck /> Achiziție verificată
                    </span>
                  </div>
                  {review.comment && <p className="text-gray-700">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
          
          {currentUser ? (
            userHasOrdered ? (
              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Ai cumpărat acest produs</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Poți evalua acest produs în pagina <a href="/dashboard" className="text-blue-600 hover:underline">comenzilor tale</a>.
                </p>
              </div>
            ) : (
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">
                  Doar clienții care au cumpărat acest produs pot lăsa o recenzie.
                </p>
              </div>
            )
          ) : (
            <p className="mt-6 text-gray-500">
              <Link to="/login" className="text-blue-600 hover:underline">Conectează-te</Link> pentru a putea adăuga o recenzie după ce achiziționezi produsul.
            </p>
          )}
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center">S-ar putea să-ți placă și</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden transform transition hover:scale-105">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={product.image || 
                        (product.id.includes('miere') ? '/images/AdobeStock_367103665.jpeg' : '/images/AdobeStock_370191089.jpeg')}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const fallbackImage = product.id.includes('miere') ? 
                          '/images/AdobeStock_367103665.jpeg' : 
                          '/images/AdobeStock_370191089.jpeg';
                        e.currentTarget.src = fallbackImage;
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800">{product.name}</h3>
                    <p className="text-blue-600 font-bold mt-2">{formatCurrency(product.price)}</p>
                    <button className="mt-3 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      Vezi detalii
                    </button>
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
