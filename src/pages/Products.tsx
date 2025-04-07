import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../firebase'; // Import directly from central firebase.ts

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  inStock: boolean;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOfferPopup, setShowOfferPopup] = useState(true); // State for the offer pop-up
  const { addItem } = useCart(); // Obținem funcția addItem din context

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('Se încearcă conectarea la Firestore pentru colecția products...');
        
        const productsCollection = collection(db, 'products');
        const snapshot = await getDocs(productsCollection);
        
        if (snapshot.empty) {
          console.warn('Nu există produse în colecția "products".');
          // Adăugăm produse hardcodate dacă nu există în baza de date
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
            // Actualizăm imaginea dacă există documente în baza de date
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
    // Adăugăm produsul în coș folosind contextul CartContext
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1 // Adăugăm o bucată implicit
    });
    
    // Afișăm un mesaj de confirmare
    alert(`Produsul "${product.name}" a fost adăugat în coș!`);
  };

  const formatCurrency = (price: number) => {
    return `${price.toFixed(2)} RON`;
  };

  const handleClosePopup = () => {
    setShowOfferPopup(false);
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
    <div className="container mx-auto px-4 py-16">
      {showOfferPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Ofertă Specială!</h2>
            <p className="text-gray-700 mb-6">
              La fiecare 2 borcane cumpărate, primești unul gratuit! Profită acum de această ofertă limitată!
            </p>
            <button
              onClick={handleClosePopup}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Închide
            </button>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-8 text-center">Produse Tradiționale</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <Link to={`/product/${product.id}`} className="block h-48 overflow-hidden">
              <img
                src={product.image || '/images/AdobeStock_370191089.jpeg'}
                alt={product.name}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                onError={(e) => {
                  console.error("Eroare la încărcarea imaginii:", product.image);
                  e.currentTarget.src = '/images/AdobeStock_370191089.jpeg';
                }}
              />
            </Link>
            <div className="p-6">
              <Link to={`/product/${product.id}`}>
                <h2 className="text-xl font-bold mb-2 hover:text-blue-600 transition-colors">{product.name}</h2>
              </Link>
              
              {/* Îmbunătățim afișarea descrierii produsului */}
              <div className="mb-4 h-16 overflow-hidden">
                <p className="text-gray-600 line-clamp-3">{product.description || "Descrierea produsului nu este disponibilă."}</p>
              </div>
              
              <div className="mb-4">
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(product.price)}
                </span>
              </div>
              {product.inStock ? (
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Adaugă în coș
                </button>
              ) : (
                <span className="text-red-600 bg-red-100 px-3 py-1 rounded-full text-sm">
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
