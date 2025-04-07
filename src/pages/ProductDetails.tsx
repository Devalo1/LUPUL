import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore'; // Update import path to the correct location
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext'; // Update import path to the correct location
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext'; // Import hook-ul cart

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

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
  const [reviews] = useState<Review[]>([]); // Removed unused setter
  const [relatedProducts] = useState<RelatedProduct[]>([]); // Removed unused setter
  const [addedToCart, setAddedToCart] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentUser } = useAuth();
  const { addItem } = useCart(); // Obținem funcția addItem din context
  const navigate = useNavigate();

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
        
        {/* Reviews section */}
        <div className="p-8 border-t border-gray-200">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Recenzii clienți</h2>
          
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-gray-600 text-sm">de {review.userName}</span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Acest produs nu are încă recenzii.</p>
          )}
          
          {currentUser ? (
            <div className="mt-6">
              <button className="text-blue-600 hover:underline">
                Adaugă o recenzie
              </button>
            </div>
          ) : (
            <p className="mt-6 text-gray-500">
              <Link to="/login" className="text-blue-600 hover:underline">Conectează-te</Link> pentru a putea adăuga o recenzie.
            </p>
          )}
        </div>
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
  );
};

export default ProductDetails;
