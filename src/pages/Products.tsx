import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { FaStar, FaLeaf, FaAward, FaShoppingCart, FaRegStar } from 'react-icons/fa';
import '../styles/ProductsPage.css';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  inStock: boolean;
  ratings?: {
    count: number;
    average: number;
  };
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOfferPopup, setShowOfferPopup] = useState(true);
  const [animatedItemId, setAnimatedItemId] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('Se încearcă conectarea la Firestore pentru colecția products...');
        
        const productsCollection = collection(db, 'products');
        const snapshot = await getDocs(productsCollection);
        
        if (snapshot.empty) {
          console.warn('Nu există produse în colecția "products".');
          const hardcodedProducts = [
            {
              id: 'dulceata-afine',
              name: 'Dulceață de Afine',
              description: 'Dulceața noastră de afine, preparată după o rețetă tradițională, este rezultatul muncii pasionate: afine culese manual din pădurile românești.',
              price: 20,
              image: '/images/AdobeStock_370191089.jpeg',
              inStock: true,
            },
            {
              id: 'miere-munte',
              name: 'Miere de Munte',
              description: 'Miere pură de munte, culeasă din flora zonelor montane protejate, păstrează toate proprietățile naturale benefice pentru sănătate.',
              price: 30,
              image: '/images/AdobeStock_367103665.jpeg',
              inStock: true,
            }
          ];
          setProducts(hardcodedProducts);
          console.log('Am adăugat produse hardcodate temporar:', hardcodedProducts);
        } else {
          const productsList: Product[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            if (doc.id === 'dulceata-afine') {
              data.image = '/images/AdobeStock_370191089.jpeg';
            } else if (doc.id.includes('miere')) {
              data.image = '/images/AdobeStock_367103665.jpeg';
            }
            return {
              id: doc.id,
              ...data,
            } as Product;
          });
          console.log('Produse încărcate cu succes:', productsList);
          setProducts(productsList);
        }
      } catch (err) {
        console.error('Eroare la conectarea la Firestore:', err);
        setError('A apărut o eroare la încărcarea produselor. Verifică consola pentru detalii.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    setAnimatedItemId(product.id);
    setTimeout(() => setAnimatedItemId(null), 700);
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    
    const toast = document.getElementById('cart-toast');
    if (toast) {
      toast.textContent = `${product.name} a fost adăugat în coș`;
      toast.classList.add('show-toast');
      setTimeout(() => toast.classList.remove('show-toast'), 3000);
    }
  };

  const formatCurrency = (price: number) => {
    return `${price.toFixed(2)} RON`;
  };

  const handleClosePopup = () => {
    setShowOfferPopup(false);
    localStorage.setItem('offerPopupClosed', 'true');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă produsele...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
        <div className="text-center">
          <Link 
            to="/add-product" 
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Adaugă Produs Nou
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 products-container">
      <div id="cart-toast" className="cart-toast">
        Produs adăugat în coș
      </div>
      
      {showOfferPopup && (
        <div className="offer-popup">
          <div className="offer-content">
            <span className="offer-close" onClick={handleClosePopup}>&times;</span>
            <h3 className="offer-title">Ofertă Specială!</h3>
            <p className="offer-message">2+1 GRATUIT la toate produsele!</p>
            <div className="offer-badge">Limitat</div>
          </div>
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 product-title">Produse Tradiționale</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Descoperă selecția noastră de produse autentice, create cu ingrediente naturale și după rețete tradiționale transmise din generație în generație.</p>
        
        <div className="trust-badges">
          <div className="trust-badge">
            <FaLeaf />
            <span>100% Natural</span>
          </div>
          <div className="trust-badge">
            <FaAward />
            <span>Calitate Premium</span>
          </div>
          <div className="trust-badge">
            <FaStar />
            <span>Produse Autentice</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div 
            key={product.id} 
            className={`product-card ${animatedItemId === product.id ? 'card-added-animation' : ''}`}
          >
            <Link to={`/product/${product.id}`} className="product-image-container">
              <div className="product-image-wrapper">
                <img
                  src={product.image || '/images/AdobeStock_370191089.jpeg'}
                  alt={product.name}
                  className="product-image"
                  onError={(e) => {
                    console.error("Eroare la încărcarea imaginii:", product.image);
                    e.currentTarget.src = '/images/AdobeStock_370191089.jpeg';
                  }}
                />
              </div>
              {product.inStock && (
                <div className="in-stock-badge">
                  În Stoc
                </div>
              )}
            </Link>
            <div className="p-6">
              <Link to={`/product/${product.id}`}>
                <h2 className="product-title">{product.name}</h2>
              </Link>
              
              <div className="product-rating">
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>
                      {star <= (product.ratings?.average || 0) ? (
                        <FaStar />
                      ) : (
                        <FaRegStar />
                      )}
                    </span>
                  ))}
                </div>
                <span className="rating-count">
                  {product.ratings?.count ? 
                    `(${product.ratings.average.toFixed(1)}) ${product.ratings.count} recenzii` : 
                    'Fără recenzii'}
                </span>
              </div>
              
              <div className="mb-4 h-16 overflow-hidden">
                <p className="product-description">{product.description || "Descrierea produsului nu este disponibilă."}</p>
              </div>
              
              <div className="mb-4">
                <span className="product-price">
                  {formatCurrency(product.price)}
                </span>
              </div>
              {product.inStock ? (
                <button
                  onClick={() => handleAddToCart(product)}
                  className="add-to-cart-button"
                >
                  <FaShoppingCart className="mr-2" /> Adaugă în coș
                </button>
              ) : (
                <span className="out-of-stock-label">
                  Stoc epuizat
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
